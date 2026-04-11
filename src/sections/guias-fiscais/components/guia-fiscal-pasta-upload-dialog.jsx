'use client';

import { useState, useEffect } from 'react';

import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function GuiaFiscalPastaUploadDialog({
  open,
  onClose,
  files = [],
  pastaNome,
  uploading,
  uploadProgress,
  onConfirm,
}) {
  const [dataVencimento, setDataVencimento] = useState(null);
  const [competencia, setCompetencia] = useState('');

  useEffect(() => {
    if (open) {
      setDataVencimento(null);
      setCompetencia('');
    }
  }, [open]);

  const handleSubmit = () => {
    onConfirm({
      dataVencimento: dataVencimento ? dataVencimento.format('YYYY-MM-DD') : undefined,
      competencia: competencia.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onClose={uploading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:upload-bold" width={24} />
          <span>Confirmar envio</span>
        </Stack>
        {pastaNome && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
            Pasta: <strong>{pastaNome}</strong>
          </Typography>
        )}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Typography variant="subtitle2" color="text.secondary">
            {files.length} arquivo(s) selecionado(s)
          </Typography>
          <List dense disablePadding sx={{ maxHeight: 200, overflow: 'auto', bgcolor: 'background.neutral', borderRadius: 1 }}>
            {files.map((file) => (
              <ListItem key={`${file.name}-${file.size}`}>
                <ListItemText
                  primary={file.name}
                  secondary={`${(file.size / 1024).toFixed(1)} KB`}
                  primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                />
              </ListItem>
            ))}
          </List>

          <DatePicker
            label="Data de vencimento (opcional)"
            value={dataVencimento}
            onChange={(v) => setDataVencimento(v)}
            slotProps={{
              textField: { fullWidth: true, size: 'small' },
            }}
          />

          <TextField
            label="Competência (opcional)"
            placeholder="Ex: 01/2025"
            value={competencia}
            onChange={(e) => setCompetencia(e.target.value)}
            fullWidth
            size="small"
            helperText="Referência do período do documento, se aplicável."
          />

          {uploading && uploadProgress?.total > 1 ? (
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary">
                Enviando arquivo {uploadProgress.current} de {uploadProgress.total}…
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.round((uploadProgress.current / uploadProgress.total) * 100)}
              />
            </Stack>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={uploading}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={uploading || !files.length}>
          {uploading
            ? uploadProgress?.total > 1
              ? `Enviando ${uploadProgress.current}/${uploadProgress.total}…`
              : 'Enviando…'
            : 'Enviar documentos'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
