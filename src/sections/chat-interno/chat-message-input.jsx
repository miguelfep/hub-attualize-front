import { useRef, useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Menu from '@mui/material/Menu';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';

import { avatarUrl } from 'src/utils/avatar';

import { enviarGifChat, enviarAnexoChat, enviarMensagemChat } from 'src/actions/chat-interno';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { ChatGifPicker } from './chat-gif-picker';
import { ChatEmojiPicker } from './chat-emoji-picker';
import { ChatEnqueteDialog } from './chat-enquete-dialog';

// ----------------------------------------------------------------------
// Input do chat com autocomplete de menções: ao digitar "@..." aparece a lista
// de usuários internos; selecionar insere `@token` (nome-com-hifens, que o
// backend resolve). Enter envia; Shift+Enter quebra linha. Clipe anexa arquivo;
// microfone grava áudio (MediaRecorder); GIF abre o Giphy; enquete cria votação.
// ----------------------------------------------------------------------

const LIMITE_ANEXO = 15 * 1024 * 1024; // 15 MB

/** token de menção a partir do nome (minúsculo, sem acento, espaços→hífen). */
const tokenDoNome = (nome) =>
  String(nome || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');

export function ChatMessageInput({
  canalId,
  threadDe,
  usuarios = [],
  onEnviada,
  placeholder,
  compacto = false,
}) {
  const fileRef = useRef(null);
  const inputRef = useRef(null);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  // GIF / emoji / enquete / gravação de áudio
  const [gifEl, setGifEl] = useState(null);
  const [emojiEl, setEmojiEl] = useState(null);
  // Modo compacto (widget flutuante): áudio/enquete/anexo ficam num menu ⋮.
  const [maisEl, setMaisEl] = useState(null);
  const [enqueteOpen, setEnqueteOpen] = useState(false);
  const [gravando, setGravando] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Autocomplete de menção: detecta o "@palavra" sendo digitado no fim do texto.
  const mencaoAtiva = useMemo(() => {
    const m = texto.match(/@([\w.-]*)$/);
    return m ? m[1].toLowerCase() : null;
  }, [texto]);

  const sugestoes = useMemo(() => {
    if (mencaoAtiva === null) return [];
    return usuarios
      .filter((u) => {
        const alvo = `${u.name || ''} ${u.email || ''}`.toLowerCase();
        return !mencaoAtiva || alvo.includes(mencaoAtiva);
      })
      .slice(0, 6);
  }, [mencaoAtiva, usuarios]);

  const inserirMencao = useCallback(
    (usuario) => {
      setTexto((prev) => prev.replace(/@[\w.-]*$/, `@${tokenDoNome(usuario.name)} `));
      inputRef.current?.focus();
    },
    []
  );

  const handleEnviar = useCallback(async () => {
    const corpo = texto.trim();
    if (!corpo || !canalId) return;
    setEnviando(true);
    try {
      const msg = await enviarMensagemChat(canalId, corpo, threadDe);
      setTexto('');
      onEnviada?.(msg);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Falha ao enviar.');
    } finally {
      setEnviando(false);
    }
  }, [texto, canalId, threadDe, onEnviada]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (sugestoes.length && mencaoAtiva !== null) {
          inserirMencao(sugestoes[0]);
        } else {
          handleEnviar();
        }
      }
    },
    [handleEnviar, sugestoes, mencaoAtiva, inserirMencao]
  );

  const enviarArquivo = useCallback(
    async (file) => {
      if (!file || !canalId) return;
      if (file.size > LIMITE_ANEXO) {
        toast.error('Arquivo acima de 15 MB.');
        return;
      }
      setEnviando(true);
      try {
        const msg = await enviarAnexoChat(canalId, file, {
          caption: texto.trim() || undefined,
          threadDe,
        });
        setTexto('');
        onEnviada?.(msg);
      } catch (error) {
        toast.error(error?.response?.data?.message || error?.message || 'Falha ao anexar.');
      } finally {
        setEnviando(false);
      }
    },
    [canalId, texto, threadDe, onEnviada]
  );

  const handleFile = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      enviarArquivo(file);
    },
    [enviarArquivo]
  );

  // Ctrl+V com arquivo/imagem na área de transferência → envia como anexo.
  const handlePaste = useCallback(
    (e) => {
      const files = Array.from(e.clipboardData?.files || []);
      if (!files.length) return;
      e.preventDefault();
      const file = files[0];
      // Print/imagem colada vem como "image.png" — dá um nome único.
      const generico = !file.name || /^image\.\w+$/i.test(file.name);
      const nomeado = generico
        ? new File([file], `imagem-colada-${Date.now()}.${(file.type.split('/')[1] || 'png').replace('jpeg', 'jpg')}`, { type: file.type })
        : file;
      enviarArquivo(nomeado);
    },
    [enviarArquivo]
  );

  // ---------------- Áudio (MediaRecorder) ----------------
  const pararGravacao = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

  const iniciarGravacao = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Gravação de áudio não suportada neste navegador.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : undefined;
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data?.size) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setGravando(false);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (!blob.size || !canalId) return;
        const ext = (recorder.mimeType || '').includes('mp4') ? 'm4a' : 'webm';
        const file = new File([blob], `audio-${Date.now()}.${ext}`, { type: blob.type });
        setEnviando(true);
        try {
          const msg = await enviarAnexoChat(canalId, file, { threadDe });
          onEnviada?.(msg);
        } catch (error) {
          toast.error(error?.response?.data?.message || 'Falha ao enviar o áudio.');
        } finally {
          setEnviando(false);
        }
      };

      recorderRef.current = recorder;
      recorder.start();
      setGravando(true);
    } catch {
      toast.error('Permita o acesso ao microfone para gravar.');
    }
  }, [canalId, threadDe, onEnviada]);

  // Insere o emoji na posição do cursor (ou no fim) e devolve o foco ao input.
  const inserirEmoji = useCallback((emoji) => {
    const input = inputRef.current;
    const pos = input?.selectionStart ?? null;
    setTexto((prev) => {
      const i = pos === null ? prev.length : pos;
      return `${prev.slice(0, i)}${emoji}${prev.slice(i)}`;
    });
    requestAnimationFrame(() => {
      input?.focus();
      if (pos !== null) input?.setSelectionRange(pos + emoji.length, pos + emoji.length);
    });
  }, []);

  // ---------------- GIF / enquete ----------------
  const handleGif = useCallback(
    async (url) => {
      setGifEl(null);
      if (!url || !canalId) return;
      setEnviando(true);
      try {
        const msg = await enviarGifChat(canalId, url, threadDe);
        onEnviada?.(msg);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Falha ao enviar o GIF.');
      } finally {
        setEnviando(false);
      }
    },
    [canalId, threadDe, onEnviada]
  );

  return (
    <Box sx={{ position: 'relative', flexShrink: 0 }}>
      {/* Sugestões de menção */}
      {mencaoAtiva !== null && sugestoes.length > 0 && (
        <Paper
          elevation={8}
          sx={{ position: 'absolute', bottom: '100%', left: 8, right: 8, mb: 0.5, zIndex: 10 }}
        >
          <List dense disablePadding>
            {sugestoes.map((u) => (
              <ListItemButton key={u._id} onClick={() => inserirMencao(u)}>
                <ListItemAvatar sx={{ minWidth: 40 }}>
                  <Avatar src={avatarUrl(u) || undefined} sx={{ width: 28, height: 28, fontSize: 13 }}>
                    {(u.name || '?')[0].toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={u.name}
                  secondary={u.email}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}

      <InputBase
        inputRef={inputRef}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder || 'Escreva uma mensagem… use @ para mencionar'}
        disabled={enviando}
        multiline
        maxRows={5}
        endAdornment={
          <Stack direction="row" alignItems="center" sx={{ flexShrink: 0 }}>
            {(!compacto || gravando) && (
              <IconButton
                onClick={gravando ? pararGravacao : iniciarGravacao}
                disabled={enviando}
                title={gravando ? 'Parar e enviar áudio' : 'Gravar áudio'}
                sx={gravando ? { color: 'error.main', animation: 'pulse 1s infinite', '@keyframes pulse': { '50%': { opacity: 0.4 } } } : undefined}
              >
                <Iconify icon={gravando ? 'solar:stop-circle-bold' : 'solar:microphone-bold'} />
              </IconButton>
            )}
            <IconButton onClick={(e) => setEmojiEl(e.currentTarget)} disabled={enviando || gravando} title="Emoji">
              <Iconify icon="solar:smile-circle-bold" />
            </IconButton>
            {!compacto && (
              <>
                <IconButton onClick={(e) => setGifEl(e.currentTarget)} disabled={enviando || gravando} title="Enviar GIF">
                  <Iconify icon="mdi:file-gif-box" />
                </IconButton>
                <IconButton onClick={() => setEnqueteOpen(true)} disabled={enviando || gravando} title="Criar enquete">
                  <Iconify icon="solar:chart-square-bold" />
                </IconButton>
                <IconButton onClick={() => fileRef.current?.click()} disabled={enviando || gravando} title="Anexar">
                  <Iconify icon="eva:attach-2-fill" />
                </IconButton>
              </>
            )}
            {compacto && (
              <IconButton
                onClick={(e) => setMaisEl(e.currentTarget)}
                disabled={enviando || gravando}
                title="Mais opções"
              >
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
            )}
            <IconButton
              color="primary"
              onClick={handleEnviar}
              disabled={enviando || gravando || !texto.trim()}
              title="Enviar"
            >
              <Iconify icon="solar:plain-bold" />
            </IconButton>
          </Stack>
        }
        sx={{
          px: 2,
          py: 1,
          minHeight: 56,
          width: 1,
          borderTop: (t) => `solid 1px ${t.vars.palette.divider}`,
        }}
      />

      <Box component="input" type="file" ref={fileRef} onChange={handleFile} sx={{ display: 'none' }} />

      {compacto && (
        <Menu
          anchorEl={maisEl}
          open={!!maisEl}
          onClose={() => setMaisEl(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <MenuItem
            onClick={() => {
              setMaisEl(null);
              iniciarGravacao();
            }}
          >
            <ListItemIcon>
              <Iconify icon="solar:microphone-bold" />
            </ListItemIcon>
            Gravar áudio
          </MenuItem>
          <MenuItem
            onClick={() => {
              // Ancora o picker no botão ⋮ (o item do menu sai do DOM ao fechar).
              setGifEl(maisEl);
              setMaisEl(null);
            }}
          >
            <ListItemIcon>
              <Iconify icon="mdi:file-gif-box" />
            </ListItemIcon>
            Enviar GIF
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMaisEl(null);
              setEnqueteOpen(true);
            }}
          >
            <ListItemIcon>
              <Iconify icon="solar:chart-square-bold" />
            </ListItemIcon>
            Criar enquete
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMaisEl(null);
              fileRef.current?.click();
            }}
          >
            <ListItemIcon>
              <Iconify icon="eva:attach-2-fill" />
            </ListItemIcon>
            Anexar arquivo
          </MenuItem>
        </Menu>
      )}

      <ChatGifPicker anchorEl={gifEl} onClose={() => setGifEl(null)} onSelecionar={handleGif} />

      <ChatEmojiPicker
        anchorEl={emojiEl}
        onClose={() => setEmojiEl(null)}
        onSelecionar={(emoji) => inserirEmoji(emoji)}
      />

      <ChatEnqueteDialog
        open={enqueteOpen}
        canalId={canalId}
        onClose={() => setEnqueteOpen(false)}
        onCriada={(msg) => {
          setEnqueteOpen(false);
          onEnviada?.(msg);
        }}
      />
    </Box>
  );
}
