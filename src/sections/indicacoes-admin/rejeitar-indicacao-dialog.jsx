'use client';

import { useState } from 'react';

import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LoadingButton from '@mui/lab/LoadingButton';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function RejeitarIndicacaoDialog({ open, onClose, onConfirm }) {
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!motivo.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onConfirm(motivo);
      setMotivo('');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMotivo('');
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle>
        <Iconify icon="solar:close-circle-bold" width={24} sx={{ mr: 1, verticalAlign: 'middle' }} />
        Rejeitar Indicação
      </DialogTitle>

      <DialogContent dividers>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Motivo da Rejeição"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Informe o motivo da rejeição..."
          helperText="O motivo será registrado no sistema"
        />
      </DialogContent>

      <DialogActions>
        <Button color="inherit" variant="outlined" onClick={handleClose}>
          Cancelar
        </Button>
        <LoadingButton
          variant="contained"
          color="error"
          loading={loading}
          disabled={!motivo.trim()}
          onClick={handleConfirm}
        >
          Rejeitar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
