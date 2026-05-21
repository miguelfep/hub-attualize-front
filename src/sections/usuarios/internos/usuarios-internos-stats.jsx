import { Box, Card, Grid, Stack, Typography } from '@mui/material';

import { fNumber } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const ROLE_ICONS = {
  admin: 'solar:shield-user-bold',
  gerencial: 'solar:user-id-bold',
  financeiro: 'solar:wallet-money-bold',
  comercial: 'solar:cart-large-bold',
  operacional: 'solar:settings-bold',
  contabil_externo: 'solar:bank-bold',
  ir: 'solar:document-text-bold',
};

export function UsuariosInternosStats({ usuarios = [] }) {
  const total = usuarios.length;
  const ativos = usuarios.filter((u) => u.status === true).length;
  const inativos = usuarios.filter((u) => u.status === false).length;
  const admins = usuarios.filter((u) => Array.isArray(u.role) && u.role.includes('admin')).length;

  const statItems = [
    {
      title: 'Total de Usuários Internos',
      value: total,
      icon: 'solar:users-group-rounded-bold',
      color: 'primary',
    },
    {
      title: 'Administradores',
      value: admins,
      icon: ROLE_ICONS.admin,
      color: 'info',
    },
    {
      title: 'Ativos',
      value: ativos,
      icon: 'eva:checkmark-circle-2-fill',
      color: 'success',
    },
    {
      title: 'Inativos',
      value: inativos,
      icon: 'eva:close-circle-fill',
      color: 'error',
    },
  ];

  return (
    <Grid container spacing={3}>
      {statItems.map((item) => (
        <Grid key={item.title} xs={12} sm={6} md={3}>
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: `${item.color}.lighter`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon={item.icon} width={24} sx={{ color: `${item.color}.main` }} />
              </Box>

              <Stack spacing={0.5}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {fNumber(item.value)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.title}
                </Typography>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
