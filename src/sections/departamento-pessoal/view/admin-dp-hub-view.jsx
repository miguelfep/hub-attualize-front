'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

export function AdminDpHubView() {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
        Departamento Pessoal
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Aprove cadastros de funcionários, reprove com motivo e conduza o fluxo de demissão. O acesso à lista de
        colaboradores é feito por cliente.
      </Typography>

      <Card sx={{ p: 3, maxWidth: 560 }}>
        <Stack spacing={2}>
          <Typography variant="body1">
            Abra o cadastro do cliente e use o botão <strong>Funcionários (DP)</strong>, ou vá direto à lista de
            clientes e escolha a empresa.
          </Typography>
          <Button component={RouterLink} href={paths.dashboard.cliente.root} variant="contained" size="large">
            Ir para clientes
          </Button>
        </Stack>
      </Card>
    </Box>
  );
}
