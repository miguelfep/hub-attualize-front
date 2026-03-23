import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import {
  Box,
  Stack,
  Button,
  Dialog,
  Avatar,
  Tooltip,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';

import { getFullAssetUrl } from 'src/utils/axios';

import { uploadArquivoCliente, removerArquivoCliente } from 'src/actions/clientes';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { CustomDivider } from '../divider/CustomDivider';
import { ConfirmDialog } from '../custom-dialog/confirm-dialog';

const fData = (size) => {
  if (!size) return '';
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return `${(size / (1024 ** i)).toFixed(2)} ${units[i]}`;
};

export default function FileUploadField({ name, label, clienteId, documentType, disabled }) {
  const { setValue, watch } = useFormContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [tempFile, setTempFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const urlField = name.replace('File', 'Url');
  const currentUrl = watch(urlField);
  const fullFileUrl = currentUrl ? getFullAssetUrl(currentUrl) : null;

  const onSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setTempFile(file);
      setModalOpen(true);
      e.target.value = null;
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setModalOpen(false);
      setTempFile(null);
    }
  };

  const handleUpload = async () => {
    if (!tempFile) return;
    setUploading(true);
    try {
      const res = await uploadArquivoCliente(clienteId, tempFile, documentType, setProgress);
      setValue(urlField, res.url, { shouldDirty: true });
      setValue(name, null);
      toast.success(`${label} atualizado com sucesso!`);
      setModalOpen(false);
    } catch (error) {
      toast.error(error.message || "Erro ao realizar upload");
    } finally {
      setUploading(false);
      setProgress(0);
      setTempFile(null);
    }
  };

  const handleDownload = async () => {
    if (!fullFileUrl || disabled || !clienteId) return;

    try {
      const response = await fetch(fullFileUrl);
      if (!response.ok) {
        throw new Error('Falha ao baixar arquivo');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const rawName = fullFileUrl.split('/').pop() || `${label}.bin`;
      const fileName = decodeURIComponent(rawName.split('?')[0]);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error(error);
      toast.error(`Não foi possível baixar ${label}`);
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        border: (theme) => `1px dashed ${theme.palette.divider}`,
        transition: 'all 0.3s',
        '&:hover': {
          bgcolor: 'action.hover',
          borderColor: 'primary.main',
          boxShadow: (theme) => theme.customShadows?.z4,
        },
      }}
    >
      <Stack spacing={1.5}>
        {/* Linha principal: ícone + título + status + botão principal */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              bgcolor: currentUrl ? 'primary.lighter' : 'grey.200',
              color: currentUrl ? 'primary.main' : 'grey.600',
              width: 40,
              height: 40,
            }}
          >
            <Iconify
              icon={currentUrl ? 'solar:document-check-bold' : 'solar:document-add-bold'}
              width={22}
            />
          </Avatar>

          <Stack spacing={0.25} sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>
              {label}
            </Typography>
            {currentUrl ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <Iconify
                  icon="solar:check-read-bold"
                  width={14}
                  sx={{ mr: 0.5, color: 'success.main' }}
                />
                Documento vinculado
              </Typography>
            ) : (
              <Typography variant="caption" color="text.disabled">
                Nenhum arquivo enviado
              </Typography>
            )}
          </Stack>

          <Button
            component="label"
            variant="contained"
            color={currentUrl ? 'inherit' : 'primary'}
            size="small"
            disabled={disabled || !clienteId}
            startIcon={<Iconify icon="solar:cloud-upload-bold" />}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {currentUrl ? 'Alterar arquivo' : 'Enviar arquivo'}
            <input type="file" hidden onChange={onSelectFile} accept=".pdf,image/*" />
          </Button>
        </Stack>

        {/* Linha de ações secundárias: ver / remover */}
        {currentUrl && (
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pl: 7 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              {fullFileUrl && (
                <Button
                  component="a"
                  href={fullFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  color="primary"
                  sx={{
                    textTransform: 'none',
                    px: 0,
                    fontSize: 12,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                  startIcon={
                    <Iconify icon="solar:eye-bold" width={16} sx={{ mr: 0.25 }} />
                  }
                >
                  Ver documento
                </Button>
              )}
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              {fullFileUrl && (
                <Tooltip title={`Baixar ${label}`}>
                  <span>
                    <IconButton
                      size="small"
                      color="primary"
                      disabled={disabled || !clienteId}
                      onClick={handleDownload}
                    >
                      <Iconify icon="solar:download-minimalistic-bold" width={18} />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              <Tooltip title={`Remover ${label}`}>
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    disabled={disabled || !clienteId}
                    onClick={() => {
                      if (!clienteId || !documentType) return;
                      setDeleteOpen(true);
                    }}
                  >
                    <Iconify icon="solar:trash-bin-minimalistic-bold" width={18} />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        )}
      </Stack>

      {/* Dialog de confirmação de remoção */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={`Remover ${label}`}
        content={
          <>
            Tem certeza que deseja remover o documento <strong>{label}</strong>?<br />
            Essa ação não pode ser desfeita.
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              try {
                await removerArquivoCliente(clienteId, documentType);
                setValue(urlField, '', { shouldDirty: true });
                toast.success(`${label} removido com sucesso!`);
                setDeleteOpen(false);
              } catch (error) {
                console.error(error);
                toast.error(error.message || 'Erro ao remover documento');
              }
            }}
          >
            Remover
          </Button>
        }
      />

      <Dialog
        open={modalOpen}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography>Confirmar Upload</Typography>
          <IconButton onClick={handleClose} disabled={uploading}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>

        <CustomDivider />

        <DialogContent sx={{ py: 4 }}>
          <Stack spacing={3} alignItems="center">
            {/* Preview visual do arquivo */}
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:file-text-bold-duotone" width={64} sx={{ color: 'primary.main', opacity: 0.2 }} />
              <Typography variant="h4" sx={{ position: 'absolute', color: 'primary.dark' }}>
                {tempFile?.name.split('.').pop()?.toUpperCase()}
              </Typography>
            </Box>

            <Stack spacing={0.5} alignItems="center">
              <Typography variant="subtitle1" noWrap sx={{ maxWidth: 280 }}>
                {tempFile?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tamanho: {fData(tempFile?.size)}
              </Typography>
            </Stack>

            {uploading && (
              <Box sx={{ width: '100%' }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Enviando...</Typography>
                  <Typography variant="body2" fontWeight="bold">{progress}%</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 8, borderRadius: 5 }}
                />
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: 'background.neutral' }}>
          <Button variant="outlined" color="inherit" onClick={handleClose} disabled={uploading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading}
            startIcon={uploading ? null : <Iconify icon="solar:upload-bold" />}
          >
            {uploading ? 'Processando...' : 'Iniciar Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}