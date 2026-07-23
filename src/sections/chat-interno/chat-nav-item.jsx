import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
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

export function ChatNavItem({ canal, meuId, selecionado, onSelecionar }) {
  const ehCanal = canal?.tipo === 'canal';
  const nome = nomeDaConversa(canal, meuId);
  const naoLidas = canal?.naoLidas || 0;

  return (
    <Box component="li" sx={{ display: 'flex' }}>
      <ListItemButton
        onClick={() => onSelecionar(canal._id)}
        sx={{ py: 1, px: 2.5, gap: 1.5, ...(selecionado && { bgcolor: 'action.selected' }) }}
      >
        {ehCanal ? (
          <Avatar variant="rounded" sx={{ width: 36, height: 36, bgcolor: 'background.neutral' }}>
            <Iconify
              icon={canal.privado ? 'solar:lock-keyhole-bold' : 'material-symbols:tag'}
              width={18}
              sx={{ color: 'text.secondary' }}
            />
          </Avatar>
        ) : (
          <Avatar src={fotoDaConversa(canal, meuId) || undefined} sx={{ width: 36, height: 36 }}>
            {iniciais(nome)}
          </Avatar>
        )}

        <ListItemText
          primary={nome}
          primaryTypographyProps={{ noWrap: true, variant: 'subtitle2' }}
          secondary={canal?.ultimaMensagemPreview || ''}
          secondaryTypographyProps={{
            noWrap: true,
            variant: naoLidas ? 'subtitle2' : 'body2',
            color: naoLidas ? 'text.primary' : 'text.secondary',
          }}
        />

        <Stack alignItems="flex-end" spacing={0.5}>
          <Typography noWrap variant="caption" sx={{ color: 'text.disabled', fontSize: 11 }}>
            {canal?.ultimaMensagemEm ? fToNow(canal.ultimaMensagemEm) : ''}
          </Typography>

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
