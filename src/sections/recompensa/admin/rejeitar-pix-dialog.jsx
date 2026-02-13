'use client';

import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export function RejeitarPixDialog({ open, onClose, pix, onConfirm, loading }) {
  const [motivo, setMotivo] = useState('');

  if (!pix) return null;

  const handleConfirm = () => {
    onConfirm(motivo);
    setMotivo('');
  };

  const handleClose = () => {
    setMotivo('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Rejeitar PIX</DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2">
            Confirma a rejeição desta solicitação de PIX?
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
              <Typography variant="h6" color="error.main">
                {fCurrency(pix.valor)}
              </Typography>
            </Stack>
          </Stack>

          <TextField
            label="Motivo da rejeição (opcional)"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            multiline
            rows={3}
            fullWidth
            placeholder="Informe o motivo da rejeição..."
          />

          <Typography variant="caption" color="text.secondary">
            💡 O saldo será devolvido ao disponível do cliente.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <LoadingButton
          variant="contained"
          color="error"
          onClick={handleConfirm}
          loading={loading}
        >
          Confirmar Rejeição
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
