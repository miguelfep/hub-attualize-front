'use client';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

export function BankStatementUploader({ onUpload, uploading, feedback }) {
  const handleFileChange = useCallback(
    (event) => {
      const { files } = event.target;
      if (files?.length) {
        onUpload(files);
      }
      event.target.value = '';
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      const { files } = event.dataTransfer;
      if (files?.length) {
        onUpload(files);
      }
    },
    [onUpload]
  );

  const preventDefault = (event) => event.preventDefault();

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="h6">Importar extratos bancários</Typography>
          <Typography variant="body2" color="text.secondary">
            Aceitamos arquivos PDF, CSV e OFX (FOZ). Cada importação gera um lote com deduplicação automática de
            lançamentos.
          </Typography>
        </Stack>

        <Box
          onDrop={handleDrop}
          onDragOver={preventDefault}
          onDragEnter={preventDefault}
          sx={{
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            py: 5,
            textAlign: 'center',
            bgcolor: 'background.default',
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Arraste e solte os arquivos aqui
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            ou selecione pelo botão abaixo
          </Typography>

          <Button variant="contained" component="label" disabled={uploading}>
            Selecionar arquivos
            <input type="file" hidden multiple accept=".pdf,.csv,.ofx,.foz" onChange={handleFileChange} />
          </Button>
        </Box>

        {uploading && <LinearProgress />}

        {feedback?.message && <Alert severity={feedback.type}>{feedback.message}</Alert>}
      </Stack>
    </Card>
  );
}
