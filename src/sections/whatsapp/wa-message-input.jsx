import { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { enviarTexto, enviarMidia, enviarTemplate } from 'src/actions/whatsapp';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { WaTemplateDialog } from './wa-template-dialog';

// ----------------------------------------------------------------------
// Janela de 24h: fora dela só é possível enviar templates. Dentro, texto/mídia
// livres. O backend também valida (409 fora da janela) — a guarda aqui é UX.
// ----------------------------------------------------------------------

const LIMITE_MIDIA = 16 * 1024 * 1024; // 16 MB

function dentroDaJanela(conversa) {
  const exp = conversa?.janela24hExpiraEm;
  if (!exp) return false;
  return Date.now() < new Date(exp).getTime();
}

// ----------------------------------------------------------------------

export function WaMessageInput({ conversa, onEnviada }) {
  const fileRef = useRef(null);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);

  const conversaId = conversa?._id;
  const janelaAberta = dentroDaJanela(conversa);

  const handleEnviarTexto = useCallback(async () => {
    const corpo = texto.trim();
    if (!corpo || !conversaId) return;
    setEnviando(true);
    try {
      const msg = await enviarTexto(conversaId, corpo);
      setTexto('');
      onEnviada?.(msg);
    } catch (error) {
      if (error?.status === 409) {
        toast.error('Fora da janela de 24h — envie um template para reabrir.');
        setTemplateOpen(true);
      } else {
        toast.error(error?.message || 'Falha ao enviar a mensagem.');
      }
    } finally {
      setEnviando(false);
    }
  }, [texto, conversaId, onEnviada]);

  const handleKeyUp = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleEnviarTexto();
      }
    },
    [handleEnviarTexto]
  );

  const handleAttach = useCallback(() => fileRef.current?.click(), []);

  const handleFile = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || !conversaId) return;
      if (file.size > LIMITE_MIDIA) {
        toast.error('Arquivo acima de 16 MB.');
        return;
      }
      setEnviando(true);
      try {
        const msg = await enviarMidia(conversaId, file);
        onEnviada?.(msg);
      } catch (error) {
        if (error?.status === 409) {
          toast.error('Fora da janela de 24h — envie um template para reabrir.');
        } else {
          toast.error(error?.message || 'Falha ao enviar a mídia.');
        }
      } finally {
        setEnviando(false);
      }
    },
    [conversaId, onEnviada]
  );

  const handleEnviarTemplate = useCallback(
    async (dados) => {
      if (!conversaId) return;
      setEnviando(true);
      try {
        const msg = await enviarTemplate(conversaId, dados);
        setTemplateOpen(false);
        onEnviada?.(msg);
      } catch (error) {
        toast.error(error?.message || 'Falha ao enviar o template.');
      } finally {
        setEnviando(false);
      }
    },
    [conversaId, onEnviada]
  );

  // Fora da janela: bloqueia texto/mídia e oferece template.
  if (!janelaAberta) {
    return (
      <>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            px: 2,
            py: 1.5,
            flexShrink: 0,
            borderTop: (t) => `solid 1px ${t.vars.palette.divider}`,
            bgcolor: 'background.neutral',
          }}
        >
          <Iconify icon="solar:clock-circle-bold" sx={{ color: 'warning.main' }} />
          <Typography variant="body2" sx={{ color: 'text.secondary', flexGrow: 1 }}>
            Fora da janela de 24h — envie um template para reabrir a conversa.
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="solar:document-text-bold" />}
            onClick={() => setTemplateOpen(true)}
          >
            Template
          </Button>
        </Stack>

        <WaTemplateDialog
          open={templateOpen}
          onClose={() => setTemplateOpen(false)}
          onEnviar={handleEnviarTemplate}
          enviando={enviando}
        />
      </>
    );
  }

  return (
    <>
      <InputBase
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyUp={handleKeyUp}
        placeholder="Escreva uma mensagem…"
        disabled={enviando}
        multiline
        maxRows={4}
        endAdornment={
          <Stack direction="row" alignItems="center" sx={{ flexShrink: 0 }}>
            <IconButton onClick={() => setTemplateOpen(true)} title="Enviar template">
              <Iconify icon="solar:document-text-bold" />
            </IconButton>
            <IconButton onClick={handleAttach} disabled={enviando} title="Anexar arquivo">
              <Iconify icon="eva:attach-2-fill" />
            </IconButton>
            <IconButton
              color="primary"
              onClick={handleEnviarTexto}
              disabled={enviando || !texto.trim()}
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
          flexShrink: 0,
          borderTop: (t) => `solid 1px ${t.vars.palette.divider}`,
        }}
      />

      <Box component="input" type="file" ref={fileRef} onChange={handleFile} sx={{ display: 'none' }} />

      <WaTemplateDialog
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        onEnviar={handleEnviarTemplate}
        enviando={enviando}
      />
    </>
  );
}
