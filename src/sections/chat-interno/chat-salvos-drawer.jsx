import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { fToNow } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------
// Gaveta "Salvos": mensagens marcadas para depois, em cards. Clicar no card
// abre a conversa de origem; o ✓ marca como concluído (remove da lista).
// ----------------------------------------------------------------------

export function ChatSalvosDrawer({ open, salvos, onClose, onAbrir, onConcluir }) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: 1, sm: 560 } } }}
    >
      {/* Cabeçalho */}
      <Stack
        direction="row"
        alignItems="center"
        sx={{ py: 2, pl: 2.5, pr: 1.5, borderBottom: (t) => `solid 1px ${t.vars.palette.divider}` }}
      >
        <Iconify icon="solar:bookmark-bold" width={22} sx={{ mr: 1.5, color: 'warning.main' }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Salvos
        </Typography>
        {salvos.length > 0 && (
          <Chip size="small" label={`${salvos.length} item${salvos.length > 1 ? 's' : ''}`} sx={{ mr: 1 }} />
        )}
        <IconButton onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Stack>

      {salvos.length ? (
        <Scrollbar sx={{ flex: '1 1 auto' }}>
          <Stack spacing={1.5} sx={{ p: 2 }}>
            {salvos.map((item) => (
              <Stack
                key={item.mensagemId}
                spacing={0.75}
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  border: (t) => `solid 1px ${t.vars.palette.divider}`,
                  transition: (t) => t.transitions.create(['box-shadow', 'border-color']),
                  '&:hover': {
                    borderColor: 'transparent',
                    boxShadow: (t) => t.customShadows?.z8,
                  },
                }}
              >
                {/* Linha de cima: origem + concluir */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle2" noWrap sx={{ flexGrow: 1, minWidth: 0 }}>
                    {item.autorNome}
                    <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
                      {' '}
                      em {item.conversa}
                    </Typography>
                  </Typography>
                  <Tooltip title="Concluído — remover dos salvos">
                    <IconButton
                      size="small"
                      onClick={() => onConcluir?.(item.mensagemId)}
                      sx={{ color: 'success.main', flexShrink: 0 }}
                    >
                      <Iconify icon="solar:check-circle-bold" width={24} />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {/* Conteúdo da mensagem — clicável, abre a conversa */}
                <Box
                  onClick={() => onAbrir?.(item)}
                  sx={{ cursor: 'pointer', '&:hover': { opacity: 0.85 } }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {item.preview}
                  </Typography>
                </Box>

                {/* Rodapé */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', flexGrow: 1 }}>
                    salvo {fToNow(item.salvoEm)}
                  </Typography>
                  <Typography
                    variant="caption"
                    onClick={() => onAbrir?.(item)}
                    sx={{
                      color: 'info.main',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Abrir conversa →
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Scrollbar>
      ) : (
        <EmptyContent
          title="Nada salvo ainda"
          description="Passe o mouse numa mensagem e clique no marcador para guardá-la aqui."
          sx={{ py: 10 }}
        />
      )}
    </Drawer>
  );
}
