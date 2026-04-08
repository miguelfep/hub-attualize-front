'use client';

import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ListItem from '@mui/material/ListItem';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { endpoints } from 'src/utils/axios';

import {
  uploadParaPastaPortal,
  ensurePortalContabilCompetenciaFolderId,
} from 'src/actions/cliente-portal-guias-api';

import { Iconify } from 'src/components/iconify';

// Mesmo critério do painel admin de pastas (PDF + Excel)
const ACCEPT_TYPES =
  '.pdf,.xlsx,.xls,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel';

const MESES = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

function obterAnosCompetencia() {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth();
  const anos = new Set();
  for (let i = 0; i < 24; i += 1) {
    const data = new Date(anoAtual, mesAtual - i, 1);
    anos.add(data.getFullYear());
  }
  return Array.from(anos).sort((a, b) => b - a);
}

function arquivoPermitido(file) {
  const okMime =
    file.type === 'application/pdf' ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel';
  const lower = file.name.toLowerCase();
  const okExt = lower.endsWith('.pdf') || lower.endsWith('.xlsx') || lower.endsWith('.xls');
  return okMime || okExt;
}

// ----------------------------------------------------------------------

const TOAST_UPLOAD_ID = 'upload-documentos-contabeis';

export function UploadDocumentosContabeisDialog({ open, onClose }) {
  const { mutate } = useSWRConfig();
  const fileInputRef = useRef(null);
  const now = useMemo(() => new Date(), []);
  const anosOpcoes = useMemo(() => obterAnosCompetencia(), []);

  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setMes(now.getMonth() + 1);
      setAno(now.getFullYear());
      setFiles([]);
    }
  }, [open, now]);

  const competencia = `${String(mes).padStart(2, '0')}/${ano}`;

  const handlePickFiles = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFilesChange = useCallback((event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = '';
    const rejected = [];
    const accepted = [];
    picked.forEach((file) => {
      if (arquivoPermitido(file)) {
        accepted.push(file);
      } else {
        rejected.push(file.name);
      }
    });
    if (rejected.length) {
      toast.error(
        `Arquivo(s) não permitido(s): ${rejected.join(', ')}. Use PDF ou Excel (.xlsx, .xls).`
      );
    }
    if (accepted.length) {
      setFiles((prev) => [...prev, ...accepted]);
    }
  }, []);

  const handleRemoveFile = useCallback((index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = async () => {
    if (!files.length) {
      toast.error('Selecione pelo menos um arquivo.');
      return;
    }
    try {
      setUploading(true);
      toast.loading('A localizar ou criar pastas (contábil → ano → mês)…', { id: TOAST_UPLOAD_ID });

      const folderId = await ensurePortalContabilCompetenciaFolderId(mes, ano);

      toast.loading('A enviar ficheiros…', { id: TOAST_UPLOAD_ID });

      const res = await uploadParaPastaPortal(folderId, files, { competencia });
      if (res.success === false) {
        toast.error(res.message || 'Falha no envio.', { id: TOAST_UPLOAD_ID });
        return;
      }

      await mutate(endpoints.guiasFiscais.portal.pastas);

      toast.success(
        res.message ||
          `${res?.data?.total ?? files.length} arquivo(s) enviado(s) para ${competencia}. Consulte em Guias e documentos.`,
        { id: TOAST_UPLOAD_ID }
      );
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Erro ao enviar arquivos.';
      toast.error(msg, { id: TOAST_UPLOAD_ID });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={uploading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:document-text-bold" width={24} />
          <span>Enviar documentos contábeis</span>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
          Planilhas, PDFs e outros documentos do período (não são extratos bancários). Os ficheiros vão
          para <strong>contábil → ano → mês</strong>. Se ainda não existir a pasta do ano ou do mês,
          o sistema tenta criá-las automaticamente (subpastas no portal).
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Typography variant="caption" color="text.secondary" display="block">
            Mês e ano de competência. Slugs do mês seguem o servidor:{' '}
            <code>janeiro</code>, <code>fevereiro</code>, <code>marco</code>, etc.
          </Typography>
          <Stack direction="column" spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="upload-contabil-mes">Mês</InputLabel>
              <Select
                labelId="upload-contabil-mes"
                label="Mês"
                value={mes}
                onChange={(e) => setMes(e.target.value)}
              >
                {MESES.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="upload-contabil-ano">Ano</InputLabel>
              <Select
                labelId="upload-contabil-ano"
                label="Ano"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
              >
                {anosOpcoes.map((a) => (
                  <MenuItem key={a} value={a}>
                    {a}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Competência: <strong>{competencia}</strong>
          </Typography>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPT_TYPES}
            style={{ display: 'none' }}
            onChange={handleFilesChange}
          />

          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:upload-bold" />}
            onClick={handlePickFiles}
            disabled={uploading}
          >
            Selecionar arquivos
          </Button>

          {files.length > 0 && (
            <List dense disablePadding sx={{ maxHeight: 220, overflow: 'auto', bgcolor: 'background.neutral', borderRadius: 1 }}>
              {files.map((file, index) => (
                <ListItem
                  key={`${file.name}-${file.size}-${index}`}
                  secondaryAction={
                    <IconButton edge="end" size="small" onClick={() => handleRemoveFile(index)} disabled={uploading}>
                      <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024).toFixed(1)} KB`}
                    primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={uploading}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={uploading || !files.length}>
          {uploading ? 'Enviando…' : 'Enviar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
