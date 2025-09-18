import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ContactDeleteModal({ 
  contact, 
  onClose, 
  onConfirm, 
  isLoading = false 
}) {
  const [confirmText, setConfirmText] = useState('');

  const handleConfirm = () => {
    if (confirmText === 'DELETAR') {
      onConfirm(contact._id);
    }
  };

  const isConfirmValid = confirmText === 'DELETAR';

  return (
    <Dialog 
      open 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            Deletar Contato
          </Typography>
          <IconButton onClick={onClose}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Alert severity="warning">
            Esta ação não pode ser desfeita. O contato será permanentemente removido.
          </Alert>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Contato a ser deletado:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Nome:</strong> {contact.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>WhatsApp:</strong> {contact.whatsappNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Instância:</strong> {contact.instanceType === 'operacional' ? 'Operacional' : 'Financeiro/Comercial'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Para confirmar, digite <strong>DELETAR</strong> no campo abaixo:
            </Typography>
            <TextField
              fullWidth
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Digite DELETAR para confirmar"
              error={confirmText && !isConfirmValid}
              helperText={confirmText && !isConfirmValid ? "Digite exatamente 'DELETAR'" : ""}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirm}
          disabled={isLoading || !isConfirmValid}
        >
          {isLoading ? 'Deletando...' : 'Deletar Contato'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```
