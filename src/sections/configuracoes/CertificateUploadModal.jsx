import { FormProvider } from 'react-hook-form';

import {
  Stack,
  Dialog,
  Button,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { RHFTextField } from 'src/components/hook-form';

export function CertificateUploadModal({ open, onClose, onSubmit, methods, fileName, isUploading }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:password-bold-duotone" />
          Confirmar Senha do Certificado
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2">
              Você está enviando o arquivo <strong>{fileName}</strong>. Por favor, digite a senha (PIN) do seu certificado para prosseguir.
            </Typography>
            <RHFTextField name="password" label="Senha do Certificado" type="password" />
            <RHFTextField name="confirmPassword" label="Confirme a Senha" type="password" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit" variant="outlined">Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isUploading}>
            {isUploading ? 'Enviando...' : 'Enviar Certificado'}
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
