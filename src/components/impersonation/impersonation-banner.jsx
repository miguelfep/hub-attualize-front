'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

import {
  isImpersonating,
  stopImpersonation,
  getImpersonationInfo,
} from 'src/auth/context/jwt/impersonation';

// ----------------------------------------------------------------------

/**
 * Faixa fixa no topo do portal quando o interno está "logado como cliente".
 * Mostra quem está sendo visualizado e o botão para voltar à sessão interna.
 */
export function ImpersonationBanner() {
  const [active, setActive] = useState(false);
  const [info, setInfo] = useState(null);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    setActive(isImpersonating());
    setInfo(getImpersonationInfo());
  }, []);

  const handleSair = useCallback(async () => {
    setSaindo(true);
    try {
      const restaurou = await stopImpersonation();
      // Navegação dura para o AuthProvider reler a sessão (interno ou login).
      window.location.href = restaurou ? paths.dashboard.cliente.root : paths.auth.jwt.signIn;
    } catch (error) {
      console.error('Erro ao sair da visualização:', error);
      setSaindo(false);
    }
  }, []);

  if (!active) return null;

  return (
    <Box
      sx={{
        bgcolor: 'warning.main',
        color: 'warning.contrastText',
        px: { xs: 2, sm: 3 },
        py: 1,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="solar:eye-bold-duotone" width={20} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Você está visualizando como cliente
            {info?.clienteLabel ? `: ${info.clienteLabel}` : ''}
            {info?.clienteEmail ? ` (${info.clienteEmail})` : ''}
          </Typography>
        </Stack>

        <Button
          size="small"
          variant="contained"
          color="inherit"
          disabled={saindo}
          startIcon={<Iconify icon="solar:logout-3-bold-duotone" />}
          onClick={handleSair}
          sx={{
            color: 'warning.darker',
            bgcolor: 'common.white',
            fontWeight: 700,
            '&:hover': { bgcolor: 'grey.100' },
          }}
        >
          {saindo ? 'Saindo...' : 'Sair da visualização'}
        </Button>
      </Stack>
    </Box>
  );
}
