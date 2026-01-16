'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import {
  Box,
  Card,
  Stack,
  Alert,
  Typography,
  LinearProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { uploadArquivoConciliacao } from 'src/actions/conciliacao';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function ConciliacaoUpload({ clienteId, onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setError(null);
      setUploading(true);
      setUploadProgress(0);

      try {
        const response = await uploadArquivoConciliacao(clienteId, file, (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        });

        // Sucesso
        if (onSuccess) {
          onSuccess(response.data);
        }
      } catch (err) {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          'Erro ao processar arquivo. Tente novamente.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [clienteId, onSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/pdf': ['.pdf'],
      'application/x-ofx': ['.ofx'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <Box>
      <Stack spacing={2}>
        <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Formatos aceitos
          </Typography>
          <Typography variant="body2">
            Faça upload de extratos bancários nos formatos <strong>.OFX</strong>,{' '}
            <strong>.PDF</strong> ou <strong>.XLSX</strong>. O sistema processará automaticamente
            e identificará as transações.
          </Typography>
        </Alert>

        <Card
          {...getRootProps()}
          sx={{
            p: 5,
            border: (theme) =>
              `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
            bgcolor: (theme) =>
              isDragActive ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
            cursor: uploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
            },
          }}
        >
          <input {...getInputProps()} />

          <Stack spacing={2} alignItems="center" justifyContent="center">
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify
                icon={uploading ? 'svg-spinners:ring-resize' : 'solar:cloud-upload-bold'}
                width={40}
                sx={{ color: 'primary.main' }}
              />
            </Box>

            {uploading ? (
              <>
                <Typography variant="h6">Processando arquivo...</Typography>
                <Box sx={{ width: '100%', maxWidth: 400 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                    {uploadProgress}%
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                <Typography variant="h6">
                  {isDragActive ? 'Solte o arquivo aqui' : 'Arraste e solte o arquivo aqui'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ou clique para selecionar
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: 'background.neutral',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    .OFX
                  </Box>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: 'background.neutral',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    .PDF
                  </Box>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: 'background.neutral',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    .XLSX
                  </Box>
                </Stack>
              </>
            )}
          </Stack>
        </Card>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!uploading && (
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              <Iconify icon="solar:info-circle-bold" width={18} sx={{ mr: 0.5, mb: -0.5 }} />
              Como funciona?
            </Typography>
            <Stack spacing={1} sx={{ pl: 3.5 }}>
              <Typography variant="body2" color="text.secondary">
                1. Faça upload do extrato bancário
              </Typography>
              <Typography variant="body2" color="text.secondary">
                2. Aguarde o processamento automático
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3. Revise as transações identificadas pela IA
              </Typography>
              <Typography variant="body2" color="text.secondary">
                4. Confirme ou ajuste as sugestões de conciliação
              </Typography>
              <Typography variant="body2" color="text.secondary">
                5. Finalize e exporte o relatório
              </Typography>
            </Stack>
          </Card>
        )}
      </Stack>
    </Box>
  );
}
