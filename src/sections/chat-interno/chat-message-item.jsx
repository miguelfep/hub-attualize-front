import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { avatarUrl } from 'src/utils/avatar';
import { fTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

import { ChatAnexo } from './chat-anexo';

// ----------------------------------------------------------------------
// Mensagem do chat interno (layout estilo Slack: avatar + nome + hora, corpo,
// reações e rodapé de thread). Hover mostra as ações (reagir, thread, editar…).
// ----------------------------------------------------------------------

const EMOJIS = ['👍', '❤️', '😂', '🎉', '👀', '✅'];

const iniciais = (nome) =>
  (nome || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

/** Realça @menções no texto. */
function TextoComMencoes({ texto }) {
  const partes = String(texto || '').split(/(@[a-zA-Z0-9._-]+)/g);
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith('@') ? (
          <Box key={i} component="span" sx={{ color: 'info.main', fontWeight: 'fontWeightMedium' }}>
            {p}
          </Box>
        ) : (
          p
        )
      )}
    </>
  );
}

/** Enquete simples: clique vota (toggle/troca); barra de progresso + contagem. */
function Enquete({ mensagem, meuId, onVotar }) {
  const enquete = mensagem.enquete || {};
  const opcoes = enquete.opcoes || [];
  const total = opcoes.reduce((s, o) => s + (o.votos?.length || 0), 0);

  return (
    <Stack
      spacing={1}
      sx={{
        p: 1.5,
        borderRadius: 1,
        border: (t) => `solid 1px ${t.vars.palette.divider}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Iconify icon="solar:chart-square-bold" sx={{ color: 'info.main' }} width={18} />
        <Typography variant="subtitle2">{enquete.pergunta}</Typography>
      </Stack>

      {opcoes.map((opcao, idx) => {
        const votos = opcao.votos?.length || 0;
        const pct = total ? Math.round((votos / total) * 100) : 0;
        const votei = (opcao.votos || []).some((v) => String(v) === String(meuId));
        return (
          <Stack
            key={idx}
            onClick={() => onVotar?.(mensagem._id, idx)}
            sx={{
              px: 1.25,
              py: 0.75,
              borderRadius: 1,
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              border: (t) =>
                `solid 1px ${votei ? t.vars.palette.info.main : t.vars.palette.divider}`,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {/* Barra de progresso ao fundo */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                width: `${pct}%`,
                bgcolor: votei ? 'info.lighter' : 'background.neutral',
                transition: 'width .25s',
              }}
            />
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ position: 'relative' }}
            >
              <Stack direction="row" alignItems="center" spacing={0.75}>
                {votei && <Iconify icon="solar:check-circle-bold" width={16} sx={{ color: 'info.main' }} />}
                <Typography variant="body2">{opcao.texto}</Typography>
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {votos} · {pct}%
              </Typography>
            </Stack>
          </Stack>
        );
      })}

      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
        {total} voto{total === 1 ? '' : 's'} · clique para votar (de novo para desfazer)
      </Typography>
    </Stack>
  );
}

/** Card de atendimento WhatsApp compartilhado/iniciado. */
function WaCard({ mensagem }) {
  const router = useRouter();
  const ref = mensagem.waConversaRef;
  const resumo = ref?.resumo || {};
  return (
    <Stack
      spacing={0.5}
      onClick={() => router.push(paths.dashboard.whatsapp)}
      sx={{
        p: 1.5,
        borderRadius: 1,
        cursor: 'pointer',
        border: (t) => `solid 1px ${t.vars.palette.divider}`,
        borderLeft: (t) => `solid 3px ${t.vars.palette.success.main}`,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Iconify icon="ic:baseline-whatsapp" sx={{ color: 'success.main' }} />
        <Typography variant="subtitle2">Atendimento WhatsApp</Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {resumo.contatoNome || resumo.telefone || 'Conversa'}
        {resumo.setor ? ` · ${resumo.setor}` : ''}
      </Typography>
      {mensagem.texto && <Typography variant="body2">{mensagem.texto}</Typography>}
      <Typography variant="caption" sx={{ color: 'info.main' }}>
        Abrir no atendimento →
      </Typography>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function ChatMessageItem({
  mensagem,
  meuId,
  ehGestor,
  emThread = false,
  onReagir,
  onVotar,
  onAbrirThread,
  onEditar,
  onRemover,
  onOpenLightbox,
}) {
  const [hover, setHover] = useState(false);
  const [emojiEl, setEmojiEl] = useState(null);
  const [menuEl, setMenuEl] = useState(null);

  const autor = mensagem.autor || {};
  const minha = String(autor._id || autor) === String(meuId);
  const nome = autor.name || autor.email || 'Usuário';

  if (mensagem.removida) {
    return (
      <Stack direction="row" spacing={1.5} sx={{ mb: 1.5, px: 0.5, opacity: 0.55 }}>
        <Avatar src={avatarUrl(autor) || undefined} sx={{ width: 36, height: 36 }}>{iniciais(nome)}</Avatar>
        <Typography variant="body2" sx={{ fontStyle: 'italic', alignSelf: 'center' }}>
          Mensagem removida
        </Typography>
      </Stack>
    );
  }

  const reacoes = mensagem.reacoes || [];
  const podeEditar = minha && mensagem.tipo === 'texto';
  const podeRemover = minha || ehGestor;

  return (
    <Stack
      direction="row"
      spacing={1.5}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      sx={{
        mb: 0.5,
        px: 0.5,
        py: 0.75,
        borderRadius: 1,
        position: 'relative',
        ...(hover && { bgcolor: 'action.hover' }),
      }}
    >
      <Avatar src={avatarUrl(autor) || undefined} sx={{ width: 36, height: 36 }}>{iniciais(nome)}</Avatar>

      <Stack sx={{ minWidth: 0, flex: '1 1 auto' }}>
        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography variant="subtitle2" noWrap>
            {nome}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            {fTime(mensagem.createdAt)}
            {mensagem.editadaEm ? ' · editada' : ''}
          </Typography>
        </Stack>

        {/* Corpo */}
        {mensagem.tipo === 'wa_card' ? (
          <Box sx={{ mt: 0.5, maxWidth: 420 }}>
            <WaCard mensagem={mensagem} />
          </Box>
        ) : mensagem.tipo === 'enquete' ? (
          <Box sx={{ mt: 0.5, maxWidth: 420 }}>
            <Enquete mensagem={mensagem} meuId={meuId} onVotar={onVotar} />
          </Box>
        ) : (
          mensagem.texto && (
            <Typography
              variant="body2"
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              <TextoComMencoes texto={mensagem.texto} />
            </Typography>
          )
        )}

        {/* GIF (Giphy) */}
        {mensagem.gifUrl && (
          <Box
            component="img"
            src={mensagem.gifUrl}
            alt="GIF"
            onClick={() => onOpenLightbox?.(mensagem.gifUrl)}
            sx={{ mt: 0.75, maxWidth: 260, maxHeight: 220, borderRadius: 1, cursor: 'pointer' }}
          />
        )}

        {/* Anexos */}
        {(mensagem.anexos || []).map((anexo, idx) => (
          <Box key={idx} sx={{ mt: 0.75 }}>
            <ChatAnexo
              mensagemId={mensagem._id}
              anexo={anexo}
              indice={idx}
              onOpenLightbox={onOpenLightbox}
            />
          </Box>
        ))}

        {/* Reações */}
        {reacoes.length > 0 && (
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.75, flexWrap: 'wrap' }}>
            {reacoes.map((r) => {
              const reagiu = (r.usuarios || []).some((u) => String(u) === String(meuId));
              return (
                <Chip
                  key={r.emoji}
                  size="small"
                  label={`${r.emoji} ${r.usuarios?.length || 0}`}
                  onClick={() => onReagir?.(mensagem._id, r.emoji)}
                  variant={reagiu ? 'filled' : 'outlined'}
                  color={reagiu ? 'info' : 'default'}
                  sx={{ height: 24 }}
                />
              );
            })}
          </Stack>
        )}

        {/* Rodapé de thread */}
        {!emThread && (mensagem.threadContagem || 0) > 0 && (
          <Button
            size="small"
            onClick={() => onAbrirThread?.(mensagem)}
            startIcon={<Iconify icon="solar:chat-line-bold" width={14} />}
            sx={{ mt: 0.5, alignSelf: 'flex-start', typography: 'caption' }}
          >
            {mensagem.threadContagem} resposta{mensagem.threadContagem > 1 ? 's' : ''}
          </Button>
        )}
      </Stack>

      {/* Ações no hover */}
      {hover && (
        <Stack
          direction="row"
          sx={{
            position: 'absolute',
            top: -14,
            right: 8,
            borderRadius: 1,
            bgcolor: 'background.paper',
            boxShadow: (t) => t.customShadows?.z8,
          }}
        >
          <IconButton size="small" onClick={(e) => setEmojiEl(e.currentTarget)} title="Reagir">
            <Iconify icon="solar:smile-circle-outline" width={18} />
          </IconButton>
          {!emThread && (
            <IconButton size="small" onClick={() => onAbrirThread?.(mensagem)} title="Responder em thread">
              <Iconify icon="solar:chat-line-outline" width={18} />
            </IconButton>
          )}
          {(podeEditar || podeRemover) && (
            <IconButton size="small" onClick={(e) => setMenuEl(e.currentTarget)}>
              <Iconify icon="eva:more-vertical-fill" width={18} />
            </IconButton>
          )}
        </Stack>
      )}

      {/* Popover de emojis */}
      <Popover
        open={!!emojiEl}
        anchorEl={emojiEl}
        onClose={() => setEmojiEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Stack direction="row" sx={{ p: 0.5 }}>
          {EMOJIS.map((e) => (
            <IconButton
              key={e}
              size="small"
              onClick={() => {
                setEmojiEl(null);
                onReagir?.(mensagem._id, e);
              }}
            >
              <span style={{ fontSize: 18 }}>{e}</span>
            </IconButton>
          ))}
        </Stack>
      </Popover>

      {/* Menu editar/remover */}
      <Menu anchorEl={menuEl} open={!!menuEl} onClose={() => setMenuEl(null)}>
        {podeEditar && (
          <MenuItem
            onClick={() => {
              setMenuEl(null);
              onEditar?.(mensagem);
            }}
          >
            Editar
          </MenuItem>
        )}
        {podeRemover && (
          <MenuItem
            sx={{ color: 'error.main' }}
            onClick={() => {
              setMenuEl(null);
              onRemover?.(mensagem);
            }}
          >
            Remover
          </MenuItem>
        )}
      </Menu>
    </Stack>
  );
}
