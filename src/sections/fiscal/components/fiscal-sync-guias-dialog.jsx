'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { sincronizarGuiasFromLog, previewSincronizacaoGuias } from 'src/actions/serPro';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

function apiErrMsg(err) {
  if (!err) return 'Erro inesperado';
  if (typeof err === 'string') return err;
  return err.response?.data?.message || err.message || 'Erro na operação';
}

function formatSyncGuiasResumo(syncGuias) {
  if (!syncGuias) return '';
  const partes = [];
  if (syncGuias.criadas) partes.push(`${syncGuias.criadas} criada(s)`);
  if (syncGuias.atualizadas) partes.push(`${syncGuias.atualizadas} atualizada(s)`);
  if (syncGuias.ignoradas) partes.push(`${syncGuias.ignoradas} ignorada(s)`);
  return partes.join(', ');
}

// ----------------------------------------------------------------------

/**
 * Modal para selecionar competências mensais antes de sincronizar guias DAS
 * a partir do último log CONSDECLARACAO13 (sem nova chamada Serpro).
 */
export function FiscalSyncGuiasDialog({
  open,
  onClose,
  clienteId,
  filtroConsulta = {},
  onSuccess,
}) {
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [preview, setPreview] = useState(null);
  const [selected, setSelected] = useState(new Set());

  const periodosComDas = useMemo(
    () => (preview?.periodos || []).filter((p) => p.temDas),
    [preview]
  );

  const loadPreview = useCallback(async () => {
    if (!clienteId) return;
    setLoadingPreview(true);
    setPreviewError('');
    setPreview(null);
    try {
      const { data } = await previewSincronizacaoGuias(clienteId, filtroConsulta);
      setPreview(data);
      const defaults = new Set(
        (data.periodos || []).filter((p) => p.temDas).map((p) => p.periodoApuracao)
      );
      setSelected(defaults);
    } catch (err) {
      const message = apiErrMsg(err);
      setPreviewError(message);
    } finally {
      setLoadingPreview(false);
    }
  }, [clienteId, filtroConsulta]);

  useEffect(() => {
    if (open && clienteId) {
      loadPreview();
    }
    if (!open) {
      setPreview(null);
      setPreviewError('');
      setSelected(new Set());
    }
  }, [open, clienteId, loadPreview]);

  const togglePeriodo = (periodoApuracao) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(periodoApuracao)) next.delete(periodoApuracao);
      else next.add(periodoApuracao);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelected(new Set(periodosComDas.map((p) => p.periodoApuracao)));
  };

  const handleClearAll = () => {
    setSelected(new Set());
  };

  const handleConfirm = async () => {
    if (!clienteId || !selected.size) return;
    setSyncing(true);
    try {
      const res = await sincronizarGuiasFromLog(clienteId, {
        ...filtroConsulta,
        periodosApuracao: Array.from(selected),
      });
      const resumo = formatSyncGuiasResumo(res.data?.syncGuias);
      toast.success(resumo ? `Guias sincronizadas: ${resumo}` : 'Guias sincronizadas.');
      onSuccess?.(res.data);
      onClose();
    } catch (err) {
      toast.error(apiErrMsg(err));
    } finally {
      setSyncing(false);
    }
  };

  const consultadoEmLabel = preview?.consultadoEm
    ? new Date(preview.consultadoEm).toLocaleString('pt-BR')
    : null;

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Atualizar guias DAS"
      content={
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Selecione os meses para criar ou atualizar guias DAS nos Documentos e Guias,
            usando os da última consulta ao Serpro (PGDAS).
          </Typography>

          {loadingPreview ? (
            <Stack alignItems="center" py={4}>
              <CircularProgress size={32} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Carregando períodos do último log…
              </Typography>
            </Stack>
          ) : null}

          {previewError ? (
            <Alert severity="error" sx={{ borderRadius: 1.5 }}>
              {previewError}
            </Alert>
          ) : null}

          {preview && !loadingPreview ? (
            <>
              {consultadoEmLabel ? (
                <Alert severity="info" icon={<Iconify icon="solar:history-bold" width={20} />}>
                  Última consulta: {consultadoEmLabel}
                  {preview.competenciaConsulta ? ` · filtro ${preview.competenciaConsulta}` : ''}
                </Alert>
              ) : null}

              {!periodosComDas.length ? (
                <Alert severity="warning">
                  Nenhum período com DAS encontrado no último log. Consulte na Serpro primeiro.
                </Alert>
              ) : (
                <>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button size="small" variant="text" onClick={handleSelectAll}>
                      Selecionar todas
                    </Button>
                    <Button size="small" variant="text" onClick={handleClearAll}>
                      Limpar
                    </Button>
                    <Chip
                      size="small"
                      variant="soft"
                      label={`${selected.size} de ${periodosComDas.length} selecionada(s)`}
                    />
                  </Stack>

                  <Scrollbar sx={{ maxHeight: 320 }}>
                    <Stack spacing={0.5}>
                      {(preview.periodos || []).map((periodo) => {
                        const disabled = !periodo.temDas;
                        const checked = selected.has(periodo.periodoApuracao);
                        return (
                          <Box
                            key={periodo.periodoApuracao}
                            sx={{
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              opacity: disabled ? 0.55 : 1,
                              bgcolor: checked ? 'action.selected' : 'transparent',
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  size="small"
                                  checked={checked}
                                  disabled={disabled}
                                  onChange={() => togglePeriodo(periodo.periodoApuracao)}
                                />
                              }
                              label={
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {periodo.competenciaLabel}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    PA {periodo.periodoApuracao}
                                  </Typography>
                                  {periodo.temDas && periodo.dasPago === true ? (
                                    <Chip size="small" label="DAS pago" color="success" variant="soft" />
                                  ) : null}
                                  {periodo.temDas && periodo.dasPago === false ? (
                                    <Chip size="small" label="DAS em aberto" color="warning" variant="soft" />
                                  ) : null}
                                  {!periodo.temDas ? (
                                    <Chip size="small" label="Sem DAS" variant="outlined" />
                                  ) : null}
                                  {periodo.guiaExisteNoHub ? (
                                    <Chip
                                      size="small"
                                      label={periodo.semArquivo ? 'No Hub (sem PDF)' : 'No Hub'}
                                      color="info"
                                      variant="soft"
                                    />
                                  ) : periodo.temDas ? (
                                    <Chip size="small" label="Nova" color="primary" variant="soft" />
                                  ) : null}
                                </Stack>
                              }
                              sx={{ m: 0, width: '100%' }}
                            />
                          </Box>
                        );
                      })}
                    </Stack>
                  </Scrollbar>
                </>
              )}
            </>
          ) : null}
        </Stack>
      }
      action={
        <LoadingButton
          variant="contained"
          loading={syncing}
          disabled={loadingPreview || !!previewError || !selected.size}
          onClick={handleConfirm}
          startIcon={<Iconify icon="solar:refresh-bold" />}
        >
          Sincronizar selecionadas
        </LoadingButton>
      }
      maxWidth="sm"
    />
  );
}

export { formatSyncGuiasResumo };
