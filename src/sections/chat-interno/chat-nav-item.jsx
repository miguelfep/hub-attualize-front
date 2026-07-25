import { useState } from 'react';

import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import { avatarUrl } from 'src/utils/avatar';
import { fToNow } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const iniciais = (nome) =>
  (nome || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

// Emoji no início do nome do canal (ex.: "🚀 marketing") vira o "ícone" visual
// do canal — sem mudança de contrato no backend, o emoji viaja dentro do nome.
const RE_EMOJI_INICIAL =
  /^(\p{Extended_Pictographic}(?:[\u200D\uFE0F]\p{Extended_Pictographic}?|\uFE0F|\p{Emoji_Modifier})*)\s*/u;

/** Emoji "ícone" do canal (prefixo do nome), ou null. */
export function emojiDoCanal(nome) {
  const m = String(nome || '').match(RE_EMOJI_INICIAL);
  return m ? m[1] : null;
}

/** Nome do canal sem o emoji de prefixo (para exibir ao lado do "ícone"). */
export function nomeSemEmoji(nome) {
  return String(nome || '').replace(RE_EMOJI_INICIAL, '').trim() || String(nome || '');
}

/** Nome exibido: canal → #nome; DM → nome do OUTRO participante. */
export function nomeDaConversa(canal, meuId) {
  if (canal?.tipo === 'canal') return canal?.nome || canal?.slug || 'Canal';
  const membros = canal?.membros || [];
  const eu = String(meuId || '');
  // Preferência: o membro que NÃO sou eu. Sem meuId resolvido, cai para o que
  // não criou a DM (criadoPor) — melhor palpite do "outro lado".
  const outro =
    membros.find((m) => eu && String(m?.usuario?._id || m?.usuario) !== eu) ||
    membros.find((m) => String(m?.usuario?._id || m?.usuario) !== String(canal?.criadoPor)) ||
    membros[0];
  return outro?.usuario?.name || outro?.usuario?.email || 'Conversa';
}

/** Id do OUTRO participante de uma DM (null para canais). */
export function outroIdDaDm(canal, meuId) {
  if (canal?.tipo !== 'dm') return null;
  const eu = String(meuId || '');
  const outro =
    (canal?.membros || []).find((m) => eu && String(m?.usuario?._id || m?.usuario) !== eu) ||
    (canal?.membros || []).find(
      (m) => String(m?.usuario?._id || m?.usuario) !== String(canal?.criadoPor)
    );
  return outro ? String(outro.usuario?._id || outro.usuario) : null;
}

/** Status de presença de um usuário: 'online' | 'ausente' | null (offline). */
export function statusPresenca(userId, onlineIds, ausenteIds) {
  const id = String(userId || '');
  if (ausenteIds?.has?.(id)) return 'ausente';
  if (onlineIds?.has?.(id)) return 'online';
  return null;
}

/** Bolinha de presença (verde = online, amarela = ausente) sobre um avatar. */
export function PresencaBadge({ online, status, children }) {
  const efetivo = status ?? (online ? 'online' : null);
  return (
    <Badge
      variant="dot"
      overlap="circular"
      invisible={!efetivo}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        '& .MuiBadge-badge': {
          bgcolor: efetivo === 'ausente' ? 'warning.main' : 'success.main',
          boxShadow: (t) => `0 0 0 2px ${t.vars.palette.background.paper}`,
        },
      }}
    >
      {children}
    </Badge>
  );
}

/** Foto do OUTRO participante de uma DM (null para canais/sem foto → iniciais). */
export function fotoDaConversa(canal, meuId) {
  if (canal?.tipo !== 'dm') return null;
  const eu = String(meuId || '');
  const outro =
    (canal?.membros || []).find((m) => eu && String(m?.usuario?._id || m?.usuario) !== eu) ||
    (canal?.membros || []).find(
      (m) => String(m?.usuario?._id || m?.usuario) !== String(canal?.criadoPor)
    );
  return avatarUrl(outro?.usuario);
}

// ----------------------------------------------------------------------

export function ChatNavItem({
  canal,
  meuId,
  onlineIds,
  ausenteIds,
  selecionado,
  onSelecionar,
  fixado = false,
  onAlternarFixado,
}) {
  const [hover, setHover] = useState(false);
  const ehCanal = canal?.tipo === 'canal';
  const nome = nomeDaConversa(canal, meuId);
  const emoji = ehCanal ? emojiDoCanal(canal?.nome) : null;
  const naoLidas = canal?.naoLidas || 0;

  return (
    <Box
      component="li"
      sx={{ display: 'flex' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <ListItemButton
        onClick={() => onSelecionar(canal._id)}
        sx={{ py: 1, px: 2.5, gap: 1.5, ...(selecionado && { bgcolor: 'action.selected' }) }}
      >
        {ehCanal ? (
          <Avatar variant="rounded" sx={{ width: 36, height: 36, bgcolor: 'background.neutral' }}>
            {emoji ? (
              <Box component="span" sx={{ fontSize: 20, lineHeight: 1 }}>
                {emoji}
              </Box>
            ) : (
              <Iconify
                icon={canal.privado ? 'solar:lock-keyhole-bold' : 'material-symbols:tag'}
                width={18}
                sx={{ color: 'text.secondary' }}
              />
            )}
          </Avatar>
        ) : (
          <PresencaBadge status={statusPresenca(outroIdDaDm(canal, meuId), onlineIds, ausenteIds)}>
            <Avatar src={fotoDaConversa(canal, meuId) || undefined} sx={{ width: 36, height: 36 }}>
              {iniciais(nome)}
            </Avatar>
          </PresencaBadge>
        )}

        <ListItemText
          primary={emoji ? nomeSemEmoji(nome) : nome}
          primaryTypographyProps={{ noWrap: true, variant: 'subtitle2' }}
          secondary={canal?.ultimaMensagemPreview || ''}
          secondaryTypographyProps={{
            noWrap: true,
            variant: naoLidas ? 'subtitle2' : 'body2',
            color: naoLidas ? 'text.primary' : 'text.secondary',
          }}
        />

        <Stack alignItems="flex-end" spacing={0.5}>
          {hover && onAlternarFixado ? (
            <IconButton
              size="small"
              title={fixado ? 'Desafixar' : 'Fixar no topo'}
              onClick={(e) => {
                e.stopPropagation();
                onAlternarFixado(canal._id);
              }}
              sx={{ p: 0.25 }}
            >
              <Iconify icon={fixado ? 'mdi:pin-off' : 'mdi:pin'} width={16} />
            </IconButton>
          ) : (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              {fixado && <Iconify icon="mdi:pin" width={12} sx={{ color: 'text.disabled' }} />}
              <Typography noWrap variant="caption" sx={{ color: 'text.disabled', fontSize: 11 }}>
                {canal?.ultimaMensagemEm ? fToNow(canal.ultimaMensagemEm) : ''}
              </Typography>
            </Stack>
          )}

          {naoLidas > 0 && (
            <Box
              sx={{
                minWidth: 18,
                height: 18,
                px: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 9,
                bgcolor: 'error.main',
                color: 'common.white',
                typography: 'caption',
                fontWeight: 'fontWeightBold',
              }}
            >
              {naoLidas}
            </Box>
          )}
        </Stack>
      </ListItemButton>
    </Box>
  );
}
