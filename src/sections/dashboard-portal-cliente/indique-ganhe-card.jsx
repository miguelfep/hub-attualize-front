'use client';

import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function IndiqueGanheCard() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Card
      sx={{
        p: 3,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.1)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        '&:hover': {
          boxShadow: theme.shadows[8],
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease',
        },
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
            }}
          >
            <Iconify icon="solar:gift-bold-duotone" width={32} />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Indique e Ganhe
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Indique pessoas e ganhe recompensas
            </Typography>
          </Box>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Compartilhe seu código de indicação e ganhe recompensas quando suas indicações se tornarem clientes.
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="solar:user-plus-bold" />}
            onClick={() => router.push(paths.cliente.indicacoes)}
            sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
          >
            Minhas Indicações
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="solar:wallet-money-bold" />}
            onClick={() => router.push(paths.cliente.recompensas)}
            sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
          >
            Ver Recompensas
          </Button>
        </Stack>
      </Stack>

      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 120,
          height: 120,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.success.main, 0.05),
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 100,
          height: 100,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          zIndex: 0,
        }}
      />
    </Card>
  );
}
