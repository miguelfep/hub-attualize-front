import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import { fToNow } from 'src/utils/format-time';

import { Label } from 'src/components/label';

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

// ----------------------------------------------------------------------

export function WaNavItem({ conversa, selecionada, onSelecionar }) {
  const nome = nomeContato(conversa);
  const setores = conversa?.setores || [];
  const naoLidas = conversa?.naoLidas || 0;

  return (
    <Box component="li" sx={{ display: 'flex' }}>
      <ListItemButton
        onClick={() => onSelecionar(conversa._id)}
        sx={{ py: 1.5, px: 2.5, gap: 2, ...(selecionada && { bgcolor: 'action.selected' }) }}
      >
        <Avatar sx={{ width: 48, height: 48 }}>{iniciais(nome)}</Avatar>

        <ListItemText
          primary={nome}
          primaryTypographyProps={{ noWrap: true, variant: 'subtitle2' }}
          secondary={conversa?.ultimaMensagemPreview || 'Sem mensagens'}
          secondaryTypographyProps={{
            noWrap: true,
            variant: naoLidas ? 'subtitle2' : 'body2',
            color: naoLidas ? 'text.primary' : 'text.secondary',
          }}
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
