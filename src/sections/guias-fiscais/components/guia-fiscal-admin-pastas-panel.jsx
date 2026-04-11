'use client';

import { useRef, useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { deletePastaGuiasAdmin, createSubpastaGuiasAdmin } from 'src/actions/guias-fiscais';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { ClienteDocumentoPastaTreeView } from './cliente-documento-pasta-tree-view';
import {
  SLUG_PASTA_REGEX,
  findPastaNodeById,
  suggestSlugFromNome,
  collectPastaTreeItemIds,
} from '../utils';

// ----------------------------------------------------------------------

function apiErrorMessage(err) {
  if (!err) return 'Erro inesperado';
  if (typeof err === 'string') return err;
  return err.message || err.error || 'Erro na operação';
}

const ACCEPT_TYPES =
  '.pdf,.xlsx,.xls,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel';

export function GuiaFiscalAdminPastasPanel({
  clienteId,
  folders,
  loadingFolders,
  selectedFolderId,
  onSelectFolder,
  onRefreshTree,
  onUploadedDocuments,
  onQueueFilesForUpload,
  uploading = false,
}) {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [novaSubpastaNome, setNovaSubpastaNome] = useState('');
  const [novaSubpastaSlug, setNovaSubpastaSlug] = useState('');
  const [creating, setCreating] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const expanded = useMemo(() => collectPastaTreeItemIds(folders || []), [folders]);

  const nodeSelecionado = useMemo(
    () => (selectedFolderId ? findPastaNodeById(folders || [], selectedFolderId) : null),
    [folders, selectedFolderId]
  );

  const podeExcluirPasta =
    nodeSelecionado && !nodeSelecionado.isPadrao && !(nodeSelecionado.children?.length > 0);

  const queueFilesForUpload = useCallback(
    (files) => {
      if (!files.length) return;
      if (!clienteId || !selectedFolderId) {
        if (!selectedFolderId) toast.error('Selecione uma pasta para enviar arquivos.');
        return;
      }
      onQueueFilesForUpload?.(files);
    },
    [clienteId, selectedFolderId, onQueueFilesForUpload]
  );

  const handlePickFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFilesChange = useCallback(
    (event) => {
      const files = Array.from(event.target.files || []);
      event.target.value = '';
      queueFilesForUpload(files);
    },
    [queueFilesForUpload]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (clienteId && selectedFolderId) setDragOver(true);
  }, [clienteId, selectedFolderId]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      if (!clienteId || !selectedFolderId) {
        toast.error('Selecione um cliente e uma pasta para soltar arquivos.');
        return;
      }
      const dropped = Array.from(e.dataTransfer?.files || []);
      queueFilesForUpload(dropped);
    },
    [clienteId, selectedFolderId, queueFilesForUpload]
  );

  const handleOpenCreate = () => {
    if (!selectedFolderId) {
      toast.error('Selecione a pasta pai.');
      return;
    }
    setNovaSubpastaNome('');
    setNovaSubpastaSlug('');
    setCreateOpen(true);
  };

  const handleNomeSubpastaChange = (value) => {
    setNovaSubpastaNome(value);
    setNovaSubpastaSlug(suggestSlugFromNome(value));
  };

  const handleConfirmCreate = async () => {
    const nome = novaSubpastaNome.trim();
    const slug = novaSubpastaSlug.trim().toLowerCase();
    if (!nome) {
      toast.error('Informe o nome da pasta.');
      return;
    }
    if (!SLUG_PASTA_REGEX.test(slug)) {
      toast.error('Slug inválido: use letras minúsculas, números e hífens.');
      return;
    }
    try {
      setCreating(true);
      const res = await createSubpastaGuiasAdmin(selectedFolderId, {
        clienteId,
        slug,
        nome,
      });
      if (res.success !== false) {
        toast.success('Subpasta criada.');
        setCreateOpen(false);
        onRefreshTree?.();
      } else {
        toast.error(res.message || 'Não foi possível criar a subpasta.');
      }
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedFolderId || !clienteId) return;
    try {
      setDeleting(true);
      const res = await deletePastaGuiasAdmin(selectedFolderId, clienteId);
      if (res.success !== false) {
        toast.success('Pasta removida.');
        setDeleteOpen(false);
        onSelectFolder(null);
        onRefreshTree?.();
        onUploadedDocuments?.();
      } else {
        toast.error(res.message || 'Não foi possível remover a pasta.');
      }
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <CardHeader
          title={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="solar:folder-bold-duotone" width={24} />
              <Typography variant="subtitle1">Pastas</Typography>
            </Stack>
          }
          subheader="Arraste PDF/Excel aqui ou use o botão. Depois informe vencimento e competência."
          sx={{ px: 2.25, pt: 2, pb: 0.5, '& .MuiCardHeader-subheader': { lineHeight: 1.45, mt: 0.25 } }}
        />
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.75, pt: 1.25, px: 2.25, pb: 2, minHeight: 0 }}>
          <Stack spacing={1}>
            <Button size="small" variant="outlined" fullWidth onClick={() => onSelectFolder(null)}>
              Todas as pastas
            </Button>
            <Button
              size="small"
              variant="outlined"
              fullWidth
              startIcon={
                uploading ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:upload-bold" />
              }
              onClick={handlePickFiles}
              disabled={uploading || !selectedFolderId}
            >
              Escolher arquivos
            </Button>
            <Button
              size="small"
              color="error"
              variant="outlined"
              fullWidth
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={() => setDeleteOpen(true)}
              disabled={!podeExcluirPasta}
            >
              Excluir pasta
            </Button>
            <Button
              size="small"
              variant="contained"
              fullWidth
              startIcon={<Iconify icon="solar:add-folder-bold" />}
              onClick={handleOpenCreate}
              disabled={!selectedFolderId}
            >
              Nova subpasta
            </Button>
          </Stack>

          {nodeSelecionado && (
            <Typography variant="caption" color="text.secondary" sx={{ px: 0.25 }}>
              Pasta: <strong>{nodeSelecionado.nome}</strong>
              {nodeSelecionado.slug ? ` (${nodeSelecionado.slug})` : ''}
            </Typography>
          )}

          <Box sx={{ flex: 1, minHeight: 220, maxHeight: { xs: 380, md: 'min(52vh, 520px)' }, overflow: 'auto' }}>
            {loadingFolders ? (
              <Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
                <CircularProgress size={32} />
              </Stack>
            ) : folders?.length ? (
              <ClienteDocumentoPastaTreeView
                folders={folders}
                selectedId={selectedFolderId}
                onSelect={onSelectFolder}
                defaultExpandedItems={expanded}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nenhuma pasta retornada. Recarregue ou verifique o cliente.
              </Typography>
            )}
          </Box>

          <Divider sx={{ borderStyle: 'dashed', mx: 0.25 }} />

          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            accept={ACCEPT_TYPES}
            onChange={handleFilesChange}
          />

          <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
              border: '2px dashed',
              borderColor: dragOver ? 'primary.main' : 'divider',
              borderRadius: 1.25,
              px: 1.5,
              py: 1.5,
              minHeight: 96,
              textAlign: 'center',
              bgcolor: dragOver ? alpha(theme.palette.primary.main, 0.08) : 'background.neutral',
              transition: theme.transitions.create(['border-color', 'background-color'], {
                duration: theme.transitions.duration.shorter,
              }),
              pointerEvents: selectedFolderId ? 'auto' : 'none',
              opacity: selectedFolderId ? 1 : 0.55,
            }}
          >
            <Iconify icon="solar:cloud-upload-bold-duotone" width={26} sx={{ color: 'text.secondary', mb: 0.25 }} />
            <Typography variant="caption" display="block" color="text.secondary">
              {selectedFolderId ? 'Solte os arquivos aqui' : 'Selecione uma pasta na árvore'}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="text"
            color="primary"
            sx={{ alignSelf: 'flex-start', mt: -0.5, ml: 0.25 }}
            onClick={handlePickFiles}
            disabled={uploading || !selectedFolderId}
          >
            Ou clique para escolher arquivos
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        maxWidth="sm"
        open={createOpen}
        onClose={() => !creating && setCreateOpen(false)}
        title="Nova subpasta"
        content={
          <Stack spacing={2} sx={{ mt: 1, width: '100%' }}>
            <TextField
              label="Nome exibido"
              value={novaSubpastaNome}
              onChange={(e) => handleNomeSubpastaChange(e.target.value)}
              fullWidth
            />
            <TextField
              label="Slug (identificador)"
              value={novaSubpastaSlug}
              onChange={(e) => setNovaSubpastaSlug(e.target.value.toLowerCase())}
              helperText="Ex.: relatorios-mensais, 2025"
              fullWidth
            />
          </Stack>
        }
        action={
          <Button variant="contained" onClick={handleConfirmCreate} disabled={creating}>
            {creating ? 'Salvando…' : 'Criar'}
          </Button>
        }
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => !deleting && setDeleteOpen(false)}
        title="Excluir pasta"
        content={
          <>
            Excluir a pasta <strong>{nodeSelecionado?.nome}</strong>? Só é permitido se estiver vazia
            (sem subpastas e sem documentos).
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? 'Excluindo…' : 'Excluir'}
          </Button>
        }
      />
    </>
  );
}
