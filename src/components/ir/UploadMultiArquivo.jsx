import { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';

import { compressFile, formatFileSize } from 'src/utils/compress-file';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_SIZE_MB = 15;

const STATUS_LABELS = {
  pending: 'Na fila',
  compressing: 'Comprimindo…',
  uploading: 'Enviando…',
  done: 'Enviado',
  error: 'Erro',
};

const STATUS_COLORS = {
  pending: 'default',
  compressing: 'warning',
  uploading: 'info',
  done: 'success',
  error: 'error',
};

/**
 * Componente de upload múltiplo com compressão e barra de progresso.
 *
 * @param {object} props
 * @param {string} props.token - Token da coleta
 * @param {string} props.tipoDoc - Tipo do documento para a API
 * @param {Array} props.documentos - Lista de documentos já enviados
 * @param {function} props.onSuccess - Callback após upload bem-sucedido
 * @param {function} props.uploadFn - Função de upload (token, formData, opts?) => Promise
 */
export default function UploadMultiArquivo({ token, tipoDoc, documentos, onSuccess, uploadFn }) {
  const inputRef = useRef(null);
  const [queue, setQueue] = useState([]);
  const [processing, setProcessing] = useState(false);

  const existentes = (documentos || []).filter((d) => d.tipo_documento === tipoDoc);

  const handleSelectFiles = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (inputRef.current) inputRef.current.value = '';

    const novos = [];
    const erros = [];

    files.forEach((f) => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        erros.push(`${f.name}: tipo não aceito`);
        return;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        erros.push(`${f.name}: excede ${MAX_SIZE_MB}MB`);
        return;
      }
      novos.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file: f,
        status: 'pending',
        originalSize: f.size,
        finalSize: null,
        progress: 0,
        errorMsg: '',
      });
    });

    if (erros.length) toast.warning(erros.join('\n'));
    if (novos.length) setQueue((prev) => [...prev, ...novos]);
  }, []);

  const removeFromQueue = useCallback((id) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateItem = useCallback((id, patch) => {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const processQueue = useCallback(async () => {
    setProcessing(true);

    const pendentes = queue.filter((item) => item.status === 'pending');

    await pendentes.reduce(async (prev, item) => {
      await prev;
      try {
        updateItem(item.id, { status: 'compressing', progress: 5 });

        const result = await compressFile(item.file, {
          onStage: () => updateItem(item.id, { progress: 20 }),
        });

        updateItem(item.id, {
          status: 'uploading',
          progress: 40,
          finalSize: result.finalSize,
        });

        const fd = new FormData();
        fd.append('file', result.file);
        fd.append('tipo_documento', tipoDoc);

        await uploadFn(token, fd, {
          onProgress: (pct) => {
            updateItem(item.id, { progress: 40 + Math.round(pct * 0.6) });
          },
        });

        updateItem(item.id, { status: 'done', progress: 100 });
        onSuccess?.();
      } catch (err) {
        updateItem(item.id, {
          status: 'error',
          progress: 0,
          errorMsg: err?.message || 'Erro ao enviar',
        });
      }
    }, Promise.resolve());

    setProcessing(false);
  }, [queue, tipoDoc, token, uploadFn, onSuccess, updateItem]);

  const pendingCount = queue.filter((i) => i.status === 'pending').length;
  const hasItems = queue.length > 0;

  return (
    <Stack spacing={1.5}>
      {existentes.length > 0 && (
        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
          <Iconify icon="eva:checkmark-circle-2-fill" width={16} sx={{ color: 'success.main' }} />
          <Typography variant="caption" color="text.secondary">
            {existentes.length} arquivo(s) já enviado(s)
          </Typography>
        </Stack>
      )}

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Button
          component="label"
          variant="outlined"
          size="small"
          startIcon={<Iconify icon="eva:plus-outline" width={18} />}
          disabled={processing}
        >
          Selecionar arquivo(s)
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            hidden
            onChange={handleSelectFiles}
          />
        </Button>

        {pendingCount > 0 && (
          <Button
            variant="contained"
            size="small"
            onClick={processQueue}
            disabled={processing}
            startIcon={<Iconify icon="eva:cloud-upload-outline" width={18} />}
          >
            Enviar {pendingCount} arquivo(s)
          </Button>
        )}
      </Stack>

      {hasItems && (
        <Stack spacing={1}>
          {queue.map((item) => (
            <Box
              key={item.id}
              sx={{
                p: 1.5,
                borderRadius: 1,
                border: '1px solid',
                borderColor: item.status === 'error' ? 'error.main' : 'divider',
                bgcolor: item.status === 'done' ? 'success.lighter' : 'background.neutral',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={item.status !== 'done' && item.status !== 'pending' ? 0.5 : 0}>
                <Iconify
                  icon={item.status === 'done' ? 'eva:checkmark-circle-2-fill' : 'eva:file-outline'}
                  width={18}
                  sx={{ color: item.status === 'done' ? 'success.main' : 'text.secondary', flexShrink: 0 }}
                />
                <Typography variant="caption" noWrap sx={{ flex: 1, minWidth: 0 }}>
                  {item.file.name}
                </Typography>

                <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
                  {formatFileSize(item.originalSize)}
                  {item.finalSize && item.finalSize !== item.originalSize && (
                    <> → {formatFileSize(item.finalSize)}</>
                  )}
                </Typography>

                <Chip
                  label={STATUS_LABELS[item.status]}
                  color={STATUS_COLORS[item.status]}
                  size="small"
                  variant="soft"
                  sx={{ flexShrink: 0 }}
                />

                {(item.status === 'pending' || item.status === 'error') && (
                  <IconButton size="small" onClick={() => removeFromQueue(item.id)} sx={{ flexShrink: 0 }}>
                    <Iconify icon="eva:close-outline" width={16} />
                  </IconButton>
                )}
              </Stack>

              {(item.status === 'compressing' || item.status === 'uploading') && (
                <LinearProgress
                  variant="determinate"
                  value={item.progress}
                  sx={{ mt: 0.5, borderRadius: 1 }}
                />
              )}

              {item.status === 'error' && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {item.errorMsg}
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
