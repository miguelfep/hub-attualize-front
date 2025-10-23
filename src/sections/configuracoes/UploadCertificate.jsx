import { m } from 'framer-motion';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

export function UploadCertificate({ onFileSelect }) {
  const theme = useTheme();
  
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileSelect({ target: { files: acceptedFiles } });
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/x-pkcs12': ['.pfx', '.p12'] },
    multiple: false,
  });

  return (
    <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Paper
        {...getRootProps()}
        variant="outlined"
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          borderStyle: 'dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
          transition: theme.transitions.create(['border-color', 'background-color']),
        }}
      >
        <input {...getInputProps()} />
        <Stack spacing={2} alignItems="center">
          <Iconify icon="solar:upload-cloud-bold-duotone" width={64} sx={{ color: 'text.disabled' }} />
          <Typography variant="h6">
            {isDragActive ? 'Solte o arquivo aqui!' : 'Envie seu Certificado Digital'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Arraste e solte o arquivo .pfx ou .p12, ou
          </Typography>
          <Button variant="contained">Selecione o arquivo</Button>
        </Stack>
      </Paper>
    </m.div>
  );
}
