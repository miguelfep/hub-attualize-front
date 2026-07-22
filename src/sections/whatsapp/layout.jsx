import Stack from '@mui/material/Stack';

// ----------------------------------------------------------------------
// Layout de duas colunas do inbox: a esquerda a navegação (lista de conversas),
// a direita a "sala" (cabeçalho + mensagens + input).
// ----------------------------------------------------------------------

export function Layout({ slots, sx, ...other }) {
  return (
    <Stack direction="row" sx={sx} {...other}>
      {slots.nav}
      <Stack sx={{ flex: '1 1 auto', minWidth: 0 }}>{slots.main}</Stack>
    </Stack>
  );
}
