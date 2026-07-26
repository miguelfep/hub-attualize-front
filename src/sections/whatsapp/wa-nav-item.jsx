import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import { fToNow } from 'src/utils/format-time';

import { Label } from 'src/components/label';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const nomeContato = (conversa) =>
  conversa?.contato?.profileName || conversa?.contato?.waId || 'Contato';

const iniciais = (nome) =>
  (nome || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

const primeiroNome = (nome) => (nome || '').trim().split(/\s+/)[0] || '';

// ----------------------------------------------------------------------

export function WaNavItem({ conversa, selecionada, onSelecionar }) {
  const { user } = useAuthContext();

  const nome = nomeContato(conversa);
  const setores = conversa?.setores || [];
  const naoLidas = conversa?.naoLidas || 0;

  const atendente = conversa?.atendente || null;
  const meuId = String(user?._id || user?.id || '');
  const souEu = atendente && String(atendente._id || atendente) === meuId;

  return (
    <Box component="li" sx={{ display: 'flex' }}>
      <ListItemButton
        onClick={() => onSelecionar(conversa._id)}
        sx={{ py: 1.5, px: 2.5, gap: 2, ...(selecionada && { bgcolor: 'action.selected' }) }}
      >
        <Avatar sx={{ width: 48, height: 48 }}>{iniciais(nome)}</Avatar>

        <ListItemText
          disableTypography
          primary={
            <Typography noWrap variant="subtitle2">
              {nome}
            </Typography>
          }
          secondary={
            <>
              <Typography
                noWrap
                variant={naoLidas ? 'subtitle2' : 'body2'}
                sx={{ color: naoLidas ? 'text.primary' : 'text.secondary' }}
              >
                {conversa?.ultimaMensagemPreview || 'Sem mensagens'}
              </Typography>

              {/* Com quem está o atendimento */}
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.5 }}>
                {atendente ? (
                  <>
                    <Avatar
                      src={atendente.imgprofile || undefined}
                      sx={{
                        width: 18,
                        height: 18,
                        fontSize: 10,
                        bgcolor: souEu ? 'success.main' : 'primary.main',
                      }}
                    >
                      {iniciais(atendente.name)}
                    </Avatar>
                    <Typography
                      noWrap
                      variant="caption"
                      sx={{
                        color: souEu ? 'success.main' : 'text.secondary',
                        fontWeight: souEu ? 'fontWeightSemiBold' : 'fontWeightRegular',
                      }}
                    >
                      {souEu ? 'Você' : primeiroNome(atendente.name)}
                    </Typography>
                  </>
                ) : (
                  <Label color="warning" variant="soft" sx={{ height: 18, fontSize: 11 }}>
                    Sem atendente
                  </Label>
                )}
              </Stack>
            </>
          }
        />

        <Stack alignItems="flex-end" spacing={0.75} sx={{ alignSelf: 'stretch' }}>
          <Typography
            noWrap
            variant="caption"
            sx={{ color: 'text.disabled', fontSize: 11 }}
          >
            {conversa?.ultimaMensagemEm ? fToNow(conversa.ultimaMensagemEm) : ''}
          </Typography>

          {naoLidas > 0 && (
            <Box
              sx={{
                minWidth: 20,
                height: 20,
                px: 0.75,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                bgcolor: 'info.main',
                color: 'common.white',
                typography: 'caption',
                fontWeight: 'fontWeightBold',
              }}
            >
              {naoLidas}
            </Box>
          )}

          {setores[0] && (
            <Label color="default" variant="soft" sx={{ height: 20, textTransform: 'lowercase' }}>
              {setores[0]}
            </Label>
          )}
        </Stack>
      </ListItemButton>
    </Box>
  );
}
