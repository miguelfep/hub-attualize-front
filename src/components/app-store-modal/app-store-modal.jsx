'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useMobilePlatform } from 'src/hooks/use-mobile-platform';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const DISMISS_KEY = 'hub-app-promo-dismissed';

const STORE = {
  ios: { href: CONFIG.appLinks.ios, icon: 'mdi:apple', nome: 'App Store' },
  android: { href: CONFIG.appLinks.android, icon: 'mdi:google-play', nome: 'Google Play' },
};

/**
 * Modal que convida o usuário a baixar o app móvel "Hub Attualize".
 * Abre automaticamente em celulares/tablets (iOS ou Android) e pode ser fechado.
 * O fechamento é lembrado na sessão (sessionStorage) para não reabrir a cada visita.
 */
export function AppStoreModal() {
  const platform = useMobilePlatform();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (platform !== 'ios' && platform !== 'android') return;

    let dispensado = false;
    try {
      dispensado = sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      dispensado = false;
    }
    if (!dispensado) setOpen(true);
  }, [platform]);

  const handleClose = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* sessionStorage indisponível — apenas fecha */
    }
  };

  if (platform !== 'ios' && platform !== 'android') return null;

  const principal = STORE[platform];
  const outra = platform === 'ios' ? STORE.android : STORE.ios;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <Box sx={{ p: 3, pt: 4, textAlign: 'center', position: 'relative' }}>
        <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>

        <Box
          component="img"
          src={`${CONFIG.site.basePath}/logo/hub-tt.png`}
          alt="Hub Attualize"
          sx={{ width: 64, height: 64, borderRadius: 2, objectFit: 'contain', mx: 'auto', mb: 2 }}
        />

        <Typography variant="h6">Baixe o app Hub Attualize</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, mb: 3 }}>
          Acesse o portal direto do seu celular, com notificações em tempo real.
        </Typography>

        <Button
          fullWidth
          size="large"
          variant="contained"
          color="inherit"
          href={principal.href}
          target="_blank"
          rel="noopener"
          startIcon={<Iconify icon={principal.icon} />}
        >
          Baixar na {principal.nome}
        </Button>

        <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
          <Link
            href={outra.href}
            target="_blank"
            rel="noopener"
            variant="caption"
            color="text.secondary"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            <Iconify icon={outra.icon} width={14} />
            Também disponível na {outra.nome}
          </Link>
        </Stack>

        <Box sx={{ mt: 2 }}>
          <Link
            component="button"
            type="button"
            onClick={handleClose}
            variant="body2"
            color="text.secondary"
          >
            Agora não
          </Link>
        </Box>
      </Box>
    </Dialog>
  );
}
