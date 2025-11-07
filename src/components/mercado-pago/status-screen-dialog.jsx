'use client';

import { useCallback } from 'react';
import { StatusScreen } from '@mercadopago/sdk-react';

import { Box, Dialog, DialogTitle, DialogContent } from '@mui/material';

// ----------------------------------------------------------------------

export function MercadoPagoStatusDialog({ open, onClose, paymentId, externalReference }) {
  const onError = useCallback(async (error) => {
    console.error('Erro ao carregar Status Screen:', error);
  }, []);

  const onReady = useCallback(async () => {
    console.log('✅ Status Screen Brick carregado');
  }, []);

  const initialization = {
    paymentId, // ID do pagamento retornado pelo Mercado Pago
  };

  const customization = {
    visual: {
      hideStatusDetails: false,
      hideTransactionDate: false,
      style: {
        theme: 'default',
      },
    },
    backUrls: {
      error: '/abertura-cnpj-psicologo',
      return: '/abertura-cnpj-psicologo',
    },
  };

  if (!paymentId) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Status do Pagamento</DialogTitle>
      <DialogContent>
        <Box sx={{ minHeight: 300 }}>
          <StatusScreen
            initialization={initialization}
            customization={customization}
            onReady={onReady}
            onError={onError}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}

