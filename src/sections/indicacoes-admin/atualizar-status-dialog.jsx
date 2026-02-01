'use client';

import { useState, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'contato_iniciado', label: 'Contato Iniciado' },
  { value: 'em_negociacao', label: 'Em Negociação' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'recusado', label: 'Recusado' },
];

export function AtualizarStatusDialog({ open, onClose, onConfirm, statusAtual }) {
  const [status, setStatus] = useState(statusAtual || 'pendente');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && statusAtual) {
      setStatus(statusAtual);
    }
  }, [open, statusAtual]);

  const handleConfirm = async () => {
    if (!status) {
      return;
    }

    setLoading(true);
    try {
      await onConfirm(status);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStatus(statusAtual || 'pendente');
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle>
        <Iconify icon="solar:pen-bold" width={24} sx={{ mr: 1, verticalAlign: 'middle' }} />
        Atualizar Status da Indicação
      </DialogTitle>

      <DialogContent dividers>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Novo Status</InputLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            label="Novo Status"
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" variant="outlined" onClick={handleClose}>
          Cancelar
        </Button>
        <LoadingButton
          variant="contained"
          loading={loading}
          disabled={!status || status === statusAtual}
          onClick={handleConfirm}
        >
          Atualizar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
