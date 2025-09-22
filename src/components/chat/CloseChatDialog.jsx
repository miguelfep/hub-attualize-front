import React, { useState } from 'react';

import {
  Box,
  Stack,
  Dialog,
  Button,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

export function CloseChatDialog({ open, onClose, onCloseChat, chatId, clienteName }) {
  const [reason, setReason] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const handleCloseChat = async () => {
    try {
      setIsClosing(true);
      await onCloseChat(chatId, reason);
      handleClose();
    } catch (error) {
      console.error('Erro ao fechar chat:', error);
    } finally {
      setIsClosing(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setIsClosing(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="eva:close-fill" color="error.main" />
          <Typography variant="h6">Fechar Chat</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Chat ID: {chatId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cliente: {clienteName || 'Cliente'}
            </Typography>
          </Box>

          <TextField
            label="Motivo do fechamento (opcional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Descreva o motivo do fechamento do chat..."
            multiline
            rows={3}
            fullWidth
          />

          <Box sx={{ p: 2, bgcolor: 'error.lighter', borderRadius: 1 }}>
            <Typography variant="body2" color="error.darker">
              ⚠️ Esta ação fechará o chat permanentemente. 
              O cliente não poderá mais enviar mensagens neste chat.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isClosing}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleCloseChat}
          disabled={isClosing}
          startIcon={
            isClosing ? (
              <Iconify icon="eos-icons:loading" />
            ) : (
              <Iconify icon="eva:close-fill" />
            )
          }
        >
          {isClosing ? 'Fechando...' : 'Fechar Chat'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
