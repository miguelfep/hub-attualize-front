'use client';

import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';

import { useUploadExtrato } from 'src/app/portal-cliente/conciliacao-bancaria/hooks/use-upload-extrato';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * Dialog para o time interno enviar extratos (PDF/OFX) em nome do cliente,
 * reutilizando o mesmo fluxo de upload do portal.
 */
export function UploadExtratoDialog({
  open,
  onClose,
  clienteId,
  clienteNome,
  bancos = [],
  bancoIdInicial = '',
  mesAnoInicial = '',
  onSuccess,
}) {
  const [bancoId, setBancoId] = useState('');
  const [mesAno, setMesAno] = useState('');
  const [arquivo, setArquivo] = useState(null);

  const { upload, loading, uploadProgress, error, reset } = useUploadExtrato();

  useEffect(() => {
    if (open) {
      setBancoId(bancoIdInicial || '');
      setMesAno(mesAnoInicial || '');
      setArquivo(null);
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bancoIdInicial, mesAnoInicial]);

  const bancoSelecionado = useMemo(() => bancos.find((b) => b._id === bancoId), [bancos, bancoId]);

  const bancoPdfBloqueado =
    Boolean(bancoSelecionado) && bancoSelecionado?.instituicaoBancariaId?.aceitaPdf === false;

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setArquivo(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      ...(!bancoPdfBloqueado ? { 'application/pdf': ['.pdf'] } : {}),
      'application/x-ofx': ['.ofx'],
    },
    multiple: false,
    disabled: loading,
  });

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleEnviar = async () => {
    if (!bancoId) {
      toast.error('Selecione um banco');
      return;
    }
    if (!mesAno || !/^\d{4}-\d{2}$/.test(mesAno)) {
      toast.error('Selecione o período (mês/ano) do extrato');
      return;
    }
    if (!arquivo) {
      toast.error('Selecione um arquivo');
      return;
    }
    if (bancoPdfBloqueado && arquivo.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Este banco não suporta importação via PDF. Use um arquivo OFX.');
      return;
    }

    try {
      const result = await upload(clienteId, bancoId, mesAno, arquivo);

      if (result?.processamentoAssincrono) {
        toast.success(result.mensagem || 'Arquivo enviado! O processamento está em andamento.');
      } else {
        toast.success('Arquivo enviado e processado com sucesso!');
      }

      reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      // O erro já fica disponível em `error` para exibição no Alert abaixo
      console.error('Erro no upload de extrato:', err);
      toast.error(err?.message || 'Não foi possível enviar o arquivo');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Iconify icon="eva:cloud-upload-fill" width={28} />
          <Box>
            <Typography variant="h6">Enviar Extrato (PDF/OFX)</Typography>
            {clienteNome && (
              <Typography variant="caption" color="text.secondary">
                Cliente: {clienteNome}
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <FormControl fullWidth required size="small" disabled={loading}>
            <InputLabel id="upload-extrato-banco-label">Banco</InputLabel>
            <Select
              labelId="upload-extrato-banco-label"
              value={bancos.some((b) => b._id === bancoId) ? bancoId : ''}
              onChange={(e) => setBancoId(e.target.value)}
              label="Banco"
            >
              <MenuItem value="">
                <em>Selecione o banco</em>
              </MenuItem>
              {bancos.map((banco) => (
                <MenuItem key={banco._id} value={banco._id}>
                  {banco.instituicaoBancariaId?.nome || banco.nome || 'Banco'} (
                  {banco.instituicaoBancariaId?.codigo || banco.codigo || 'N/A'}) - Ag:{' '}
                  {banco.agencia || 'N/A'} Conta: {banco.conta}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            required
            size="small"
            type="month"
            label="Mês e Ano"
            value={mesAno}
            onChange={(e) => setMesAno(e.target.value)}
            disabled={loading}
            InputLabelProps={{ shrink: true }}
            helperText="Período das transações do arquivo"
          />

          {bancoPdfBloqueado && (
            <Alert severity="warning">
              Este banco não suporta importação via PDF. Utilize o formato <strong>OFX</strong>.
            </Alert>
          )}

          <Box
            {...getRootProps()}
            sx={{
              p: 3,
              textAlign: 'center',
              border: 2,
              borderStyle: 'dashed',
              borderRadius: 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              borderColor: isDragActive ? 'primary.main' : arquivo ? 'success.main' : 'grey.300',
              bgcolor: isDragActive
                ? 'primary.lighter'
                : arquivo
                  ? 'success.lighter'
                  : 'background.neutral',
              transition: 'all 0.2s',
              '&:hover': loading ? {} : { borderColor: 'primary.main' },
            }}
          >
            <input {...getInputProps()} />
            {arquivo ? (
              <Stack spacing={1} alignItems="center">
                <Iconify icon="eva:file-text-fill" width={36} color="success.main" />
                <Typography variant="subtitle2">{arquivo.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {(arquivo.size / 1024).toFixed(2)} KB
                </Typography>
                <Button
                  size="small"
                  color="error"
                  startIcon={<Iconify icon="eva:trash-2-outline" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setArquivo(null);
                  }}
                  disabled={loading}
                >
                  Remover
                </Button>
              </Stack>
            ) : (
              <Stack spacing={1} alignItems="center">
                <Iconify icon="eva:cloud-upload-fill" width={42} color="primary.main" />
                <Typography variant="subtitle2">
                  {isDragActive ? 'Solte o arquivo aqui' : 'Arraste o arquivo ou clique para selecionar'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Formatos aceitos:{' '}
                  <strong>{bancoPdfBloqueado ? 'OFX, XLSX, CSV' : 'OFX, PDF, XLSX, CSV'}</strong>
                </Typography>
              </Stack>
            )}
          </Box>

          {loading && (
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {uploadProgress > 0 && uploadProgress < 100
                  ? `Enviando arquivo... ${uploadProgress}%`
                  : 'Processando...'}
              </Typography>
              <LinearProgress
                variant={uploadProgress > 0 && uploadProgress < 100 ? 'determinate' : 'indeterminate'}
                value={uploadProgress}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>
          )}

          {error && !loading && (
            <Alert severity="error">
              <Typography variant="body2">{error}</Typography>
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button color="inherit" onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleEnviar}
          disabled={loading || !arquivo || !bancoId || !mesAno}
          startIcon={<Iconify icon="eva:upload-fill" />}
        >
          {loading ? 'Enviando...' : 'Enviar Extrato'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
