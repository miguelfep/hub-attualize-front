'use client';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export function AprovarPixDialog({ open, onClose, pix, onConfirm, loading }) {
  if (!pix) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Aprovar PIX</DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2">
            Confirma a aprovação desta solicitação de PIX?
          </Typography>

          <Stack 
            spacing={1.5}
            sx={{ 
              p: 2, 
              borderRadius: 1, 
              bgcolor: 'background.neutral',
            }}
          >
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Cliente:
              </Typography>
              <Typography variant="subtitle2">
                {pix.cliente?.nome || pix.cliente?.razaoSocial || '-'}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Chave PIX:
              </Typography>
              <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                {pix.chavePix}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Valor:
              </Typography>
              <Typography variant="h6" color="success.main">
                {fCurrency(pix.valor)}
              </Typography>
            </Stack>
          </Stack>

          <Typography variant="caption" color="warning.main">
            ⚠️ Após a aprovação, o saldo será debitado da conta do cliente.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <LoadingButton
          variant="contained"
          color="success"
          onClick={onConfirm}
          loading={loading}
        >
          Confirmar Aprovação
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
