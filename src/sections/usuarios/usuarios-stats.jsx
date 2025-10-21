import { Box, Card, Grid, Stack, Typography } from '@mui/material';

import { fNumber } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function UsuariosStats({ usuarios = [] }) {
  const stats = {
    total: usuarios.length,
    ativos: usuarios.filter(u => u.status === true).length,
    inativos: usuarios.filter(u => u.status === false).length,
  };

  const statItems = [
    {
      title: 'Total de Usuários Clientes',
      value: stats.total,
      icon: 'solar:users-group-rounded-bold',
      color: 'primary',
    },
    {
      title: 'Usuários Ativos',
      value: stats.ativos,
      icon: 'eva:checkmark-circle-2-fill',
      color: 'success',
    },
    {
      title: 'Usuários Inativos',
      value: stats.inativos,
      icon: 'eva:close-circle-fill',
      color: 'error',
    }
  ];

  return (
    <Grid container spacing={3}>
      {statItems.map((item) => (
        <Grid item key={item.title} xs={12} sm={6} md={4}>
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
                <Iconify 
                  icon={item.icon} 
                  width={24} 
                  sx={{ color: `${item.color}.main` }} 
                />
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
