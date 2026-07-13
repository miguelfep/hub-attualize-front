'use client';

import { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Chip,
  Stack,
  Dialog,
  Button,
  Divider,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { fDateTime } from 'src/utils/format-time';

import {
  updateMigracao,
  enviarLinkMigracao,
  getCorStatusMigracao,
  regenerarLinkMigracao,
  getLabelStatusMigracao,
  MIGRACAO_STATUS_OPTIONS,
  removerDocumentoMigracao,
  downloadDocumentoMigracao,
} from 'src/actions/migracao';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/** Dialog de detalhes: link de coleta, envio, documentos e histórico. */
export function MigracaoDetalhesDialog({ open, onClose, migracao, onChanged }) {
  const [processando, setProcessando] = useState('');

  if (!migracao) return null;

  const executar = async (chave, fn, mensagemSucesso) => {
    try {
      setProcessando(chave);
      const resultado = await fn();
      if (mensagemSucesso) toast.success(mensagemSucesso);
      onChanged?.(resultado?.migracao || resultado);
    } catch (error) {
      toast.error(error?.message || 'Não foi possível concluir a ação');
    } finally {
      setProcessando('');
    }
  };

  const handleCopiarLink = async () => {
    try {
      await navigator.clipboard.writeText(migracao.linkPublico);
      toast.success('Link copiado!');
    } catch {
      toast.error('Não foi possível copiar o link');
    }
  };

  const handleDownload = async (doc) => {
    try {
      await downloadDocumentoMigracao(migracao._id, doc._id, doc.nome);
    } catch (error) {
      toast.error(error?.message || 'Não foi possível baixar o documento');
    }
  };

  const linkEncerrado = ['concluida', 'cancelada'].includes(migracao.status);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
          <Box>
            {migracao.empresaNome}
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {migracao.cnpj || 'CNPJ não informado'} · Contador anterior:{' '}
              {migracao.contadorAnterior?.nome}
              {migracao.contadorAnterior?.escritorio
                ? ` (${migracao.contadorAnterior.escritorio})`
                : ''}
            </Typography>
          </Box>
          <Chip
            size="small"
            color={getCorStatusMigracao(migracao.status)}
            label={getLabelStatusMigracao(migracao.status)}
          />
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Link de coleta */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Link de coleta de documentos
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                fullWidth
                size="small"
                value={migracao.linkPublico || ''}
                InputProps={{ readOnly: true }}
                disabled={linkEncerrado || !migracao.linkAtivo}
              />
              <Button
                variant="outlined"
                onClick={handleCopiarLink}
                startIcon={<Iconify icon="solar:copy-bold" />}
                disabled={linkEncerrado || !migracao.linkAtivo}
                sx={{ flexShrink: 0 }}
              >
                Copiar
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
              <LoadingButton
                size="small"
                variant="contained"
                loading={processando === 'email'}
                disabled={linkEncerrado || !migracao.contadorAnterior?.email}
                onClick={() =>
                  executar(
                    'email',
                    () => enviarLinkMigracao(migracao._id, ['email']),
                    `Link enviado por e-mail para ${migracao.contadorAnterior?.email}`
                  )
                }
                startIcon={<Iconify icon="solar:letter-bold" />}
              >
                Enviar por e-mail
              </LoadingButton>
              <LoadingButton
                size="small"
                variant="contained"
                color="success"
                loading={processando === 'whatsapp'}
                disabled={linkEncerrado || !migracao.contadorAnterior?.telefone}
                onClick={() =>
                  executar(
                    'whatsapp',
                    () => enviarLinkMigracao(migracao._id, ['whatsapp']),
                    'Link enviado por WhatsApp'
                  )
                }
                startIcon={<Iconify icon="ic:baseline-whatsapp" />}
              >
                Enviar por WhatsApp
              </LoadingButton>
              <LoadingButton
                size="small"
                variant="outlined"
                color="warning"
                loading={processando === 'regenerar'}
                disabled={linkEncerrado}
                onClick={() =>
                  executar(
                    'regenerar',
                    () => regenerarLinkMigracao(migracao._id),
                    'Novo link gerado — o anterior foi invalidado'
                  )
                }
                startIcon={<Iconify icon="solar:restart-bold" />}
              >
                Regenerar link
              </LoadingButton>
              <LoadingButton
                size="small"
                variant="outlined"
                loading={processando === 'link-ativo'}
                disabled={linkEncerrado}
                onClick={() =>
                  executar(
                    'link-ativo',
                    () => updateMigracao(migracao._id, { linkAtivo: !migracao.linkAtivo }),
                    migracao.linkAtivo ? 'Link desativado' : 'Link reativado'
                  )
                }
                startIcon={
                  <Iconify
                    icon={migracao.linkAtivo ? 'solar:lock-keyhole-bold' : 'solar:lock-keyhole-unlocked-bold'}
                  />
                }
              >
                {migracao.linkAtivo ? 'Desativar link' : 'Reativar link'}
              </LoadingButton>
            </Stack>
          </Box>

          <Divider />

          {/* Status */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <TextField
              select
              size="small"
              label="Status da migração"
              value={migracao.status}
              onChange={(event) =>
                executar(
                  'status',
                  () => updateMigracao(migracao._id, { status: event.target.value }),
                  'Status atualizado'
                )
              }
              sx={{ minWidth: 220 }}
            >
              {MIGRACAO_STATUS_OPTIONS.map((opcao) => (
                <MenuItem key={opcao.value} value={opcao.value}>
                  {opcao.label}
                </MenuItem>
              ))}
            </TextField>
            {migracao.observacoes && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Obs.: {migracao.observacoes}
              </Typography>
            )}
          </Stack>

          <Divider />

          {/* Documentos recebidos */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Documentos recebidos ({migracao.documentos?.length || 0})
            </Typography>
            {!migracao.documentos?.length && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Nenhum documento recebido ainda. Assim que o contador anterior enviar pelos links,
                os arquivos aparecem aqui.
              </Typography>
            )}
            <Stack spacing={1}>
              {(migracao.documentos || []).map((doc) => (
                <Stack
                  key={doc._id}
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{
                    p: 1.25,
                    borderRadius: 1,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Iconify icon="solar:file-bold-duotone" width={22} sx={{ color: 'primary.main' }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      {doc.nome}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {fDateTime(doc.enviadoEm)} ·{' '}
                      {doc.enviadoPor === 'contador' ? 'contador anterior' : 'time interno'}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => handleDownload(doc)} aria-label="Baixar">
                    <Iconify icon="solar:download-bold" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    aria-label="Remover"
                    onClick={() =>
                      executar(
                        `remover-${doc._id}`,
                        () => removerDocumentoMigracao(migracao._id, doc._id),
                        'Documento removido'
                      )
                    }
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* Histórico */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Histórico
            </Typography>
            <Stack spacing={0.75}>
              {[...(migracao.historico || [])].reverse().map((evento, index) => (
                <Typography key={index} variant="caption" sx={{ color: 'text.secondary' }}>
                  {fDateTime(evento.data)} — <strong>{evento.evento}</strong>
                  {evento.detalhe ? ` · ${evento.detalhe}` : ''}
                  {evento.autor ? ` · por ${evento.autor}` : ''}
                </Typography>
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}
