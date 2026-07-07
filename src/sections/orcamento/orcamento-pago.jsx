import React from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function OrcamentoPago({ invoice, nfse }) {
  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 2, overflow: 'hidden', maxWidth: 560, mx: 'auto' }}
    >
      {/* Cabeçalho de sucesso */}
      <Box
        sx={(theme) => ({
          p: { xs: 3, sm: 4 },
          textAlign: 'center',
          bgcolor: alpha(theme.palette.success.main, 0.08),
        })}
      >
        <Iconify icon="solar:check-circle-bold-duotone" width={72} sx={{ color: 'success.main', mb: 1.5 }} />
        <Typography variant="h4" sx={{ mb: 0.5 }}>
          Pagamento confirmado!
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Bem-vindo(a) à Attualize. Ficamos muito felizes em ter você com a gente!
        </Typography>
      </Box>

      <Stack spacing={2} sx={{ p: { xs: 2.5, sm: 3 } }}>
        {invoice && (
          <>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Proposta
              </Typography>
              <Typography variant="subtitle2">{invoice.invoiceNumber}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Valor pago
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'success.main' }}>
                {fCurrency(invoice.total)}
              </Typography>
            </Stack>
            <Divider sx={{ borderStyle: 'dashed' }} />
          </>
        )}

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Próximos passos
          </Typography>
          <Stack spacing={1}>
            <NextStep
              icon="solar:document-add-bold-duotone"
              texto={
                nfse
                  ? 'Sua nota fiscal já foi emitida — veja o banner no topo da página.'
                  : 'A nota fiscal do serviço será emitida e enviada para o seu e-mail.'
              }
            />
            <NextStep
              icon="mdi:whatsapp"
              texto="Nosso time entrará em contato pelo WhatsApp para dar sequência ao onboarding."
            />
          </Stack>
        </Box>

        <Button
          variant="contained"
          color="success"
          size="large"
          startIcon={<Iconify width={20} icon="mdi:whatsapp" />}
          onClick={() => window.open('https://wa.me/5541996982267', '_blank')}
          sx={{ minHeight: 48 }}
        >
          Falar com nosso time
        </Button>
      </Stack>
    </Paper>
  );
}

function NextStep({ icon, texto }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Iconify icon={icon} width={20} sx={{ color: 'primary.main', mt: 0.25, flexShrink: 0 }} />
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {texto}
      </Typography>
    </Stack>
  );
}
