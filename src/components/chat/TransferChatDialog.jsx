import React, { useState } from 'react';

import {
  Box,
  Stack,
  Dialog,
  Button,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  DialogTitle,
  FormControl,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

const SECTORS = [
  { value: 'atendimento', label: 'Atendimento' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'societario', label: 'Societário' },
  { value: 'contabil', label: 'Contábil' },
];

export function TransferChatDialog({ open, onClose, onTransfer, chatId, currentSector }) {
  const [targetUserId, setTargetUserId] = useState('');
  const [targetSector, setTargetSector] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = async () => {
    if (!targetUserId.trim() || !targetSector) return;

    try {
      setIsTransferring(true);
      await onTransfer(chatId, targetUserId, targetSector);
      handleClose();
    } catch (error) {
      console.error('Erro ao transferir chat:', error);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleClose = () => {
    setTargetUserId('');
    setTargetSector('');
    setIsTransferring(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="eva:swap-fill" />
          <Typography variant="h6">Transferir Chat</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Chat ID: {chatId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Setor atual: {currentSector}
            </Typography>
          </Box>

          <TextField
            label="ID do Usuário Destino"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            placeholder="Digite o ID do usuário que receberá o chat"
            fullWidth
            required
          />

          <FormControl fullWidth required>
            <InputLabel>Setor Destino</InputLabel>
            <Select
              value={targetSector}
              onChange={(e) => setTargetSector(e.target.value)}
              label="Setor Destino"
            >
              {SECTORS.map((sector) => (
                <MenuItem key={sector.value} value={sector.value}>
                  {sector.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ p: 2, bgcolor: 'warning.lighter', borderRadius: 1 }}>
            <Typography variant="body2" color="warning.darker">
              ⚠️ Esta ação transferirá o chat para outro usuário/setor. 
              Você não terá mais acesso a este chat após a transferência.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isTransferring}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleTransfer}
          disabled={!targetUserId.trim() || !targetSector || isTransferring}
          startIcon={
            isTransferring ? (
              <Iconify icon="eos-icons:loading" />
            ) : (
              <Iconify icon="eva:swap-fill" />
            )
          }
        >
          {isTransferring ? 'Transferindo...' : 'Transferir Chat'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
