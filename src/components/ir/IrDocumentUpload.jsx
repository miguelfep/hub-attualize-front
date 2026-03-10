import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { uploadDocumentoIr } from 'src/actions/ir';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_SIZE_MB = 15;

// ----------------------------------------------------------------------

/**
 * Formulário de upload de documento para pedido IR (cliente autenticado)
 * @param {{ orderId: string, onSuccess?: (order) => void }} props
 */
export default function IrDocumentUpload({ orderId, onSuccess }) {
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileError('');
    setArquivo(null);

    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Formato inválido. Aceito: PDF, JPG, PNG.');
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`Arquivo muito grande. Máximo: ${MAX_SIZE_MB}MB.`);
      return;
    }

    setArquivo(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tipoDocumento.trim()) {
      toast.error('Informe o tipo do documento.');
      return;
    }
    if (!arquivo) {
      toast.error('Selecione um arquivo para enviar.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', arquivo);
      formData.append('tipo_documento', tipoDocumento.trim());

      const result = await uploadDocumentoIr(orderId, formData);
      toast.success('Documento enviado com sucesso!');
      setTipoDocumento('');
      setArquivo(null);
      onSuccess?.(result.order);
    } catch (err) {
      toast.error(err?.message || 'Erro ao enviar documento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Tipo do documento"
          placeholder='Ex: Holerite Janeiro 2025, Informe Banco X'
          value={tipoDocumento}
          onChange={(e) => setTipoDocumento(e.target.value)}
          fullWidth
          required
          size="small"
          disabled={loading}
        />

        <Box>
          <Button
            component="label"
            variant="outlined"
            startIcon={<Iconify icon="eva:attach-outline" />}
            disabled={loading}
            size="small"
            color={fileError ? 'error' : 'inherit'}
          >
            {arquivo ? arquivo.name : 'Selecionar arquivo'}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          {fileError && (
            <Typography variant="caption" color="error" display="block" mt={0.5}>
              {fileError}
            </Typography>
          )}
          {arquivo && !fileError && (
            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
              {(arquivo.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
          )}
        </Box>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={loading}
          startIcon={<Iconify icon="eva:cloud-upload-outline" />}
          disabled={!arquivo || !!fileError}
        >
          Enviar documento
        </LoadingButton>
      </Stack>
    </Box>
  );
}
