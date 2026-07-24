'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import AlertTitle from '@mui/material/AlertTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { aplicarConciliacao, conciliarPagamentos } from 'src/actions/pagamento-web';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

const SELO_CONFIG = {
  confere: {
    color: 'success',
    label: 'Confere',
    icon: 'solar:check-circle-bold-duotone',
  },
  atencao: {
    color: 'warning',
    label: 'Atenção',
    icon: 'solar:shield-warning-bold-duotone',
  },
};

function apiErrMsg(err) {
  if (!err) return 'Erro inesperado';
  if (typeof err === 'string') return err;
  return err.response?.data?.message || err.message || 'Erro na operação';
}

function formatValue(val) {
  if (val === undefined || val === null) return '—';
  return `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(val) {
  if (!val) return '—';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}

/** Resumo textual da baixa para o toast. */
function formatAplicacaoResumo(resultado) {
  if (!resultado) return '';
  const partes = [];
  if (resultado.aplicadas?.length) partes.push(`${resultado.aplicadas.length} baixada(s)`);
  if (resultado.ignoradas?.length) partes.push(`${resultado.ignoradas.length} ignorada(s)`);
  return partes.join(', ');
}

/** Agrupa os casamentos por competência para dar contexto de período à lista. */
function agruparPorCompetencia(matches) {
  const grupos = new Map();
  matches.forEach((match) => {
    const chave = match.competencia || 'Sem competência';
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave).push(match);
  });
  return Array.from(grupos.entries()).map(([competencia, itens]) => ({ competencia, itens }));
}

function SeloConciliacao({ classificacao }) {
  const cfg = SELO_CONFIG[classificacao] || SELO_CONFIG.atencao;
  return (
    <Chip
      size="small"
      variant="soft"
      color={cfg.color}
      label={cfg.label}
      icon={<Iconify icon={cfg.icon} width={14} />}
      sx={{ fontWeight: 600, fontSize: 12 }}
    />
  );
}

// ----------------------------------------------------------------------

/**
 * Conciliação PagtoWeb → guias: mostra o preview dos casamentos e só aplica a baixa
 * nas guias que o usuário confirmar. Nada muda no sistema sem o clique de confirmação.
 */
export function FiscalConciliacaoDialog({ open, onClose, clienteId, ano, mes, onSuccess }) {
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [aplicando, setAplicando] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [preview, setPreview] = useState(null);
  const [selected, setSelected] = useState(new Set());

  const matches = useMemo(() => preview?.matches || [], [preview]);
  const grupos = useMemo(() => agruparPorCompetencia(matches), [matches]);

  const loadPreview = useCallback(async () => {
    if (!clienteId) return;
    setLoadingPreview(true);
    setPreviewError('');
    setPreview(null);
    try {
      const data = await conciliarPagamentos({ clienteId, ano, mes });
      setPreview(data);
      // Só o que confere vem marcado: divergência exige clique deliberado.
      const defaults = new Set(
        (data.matches || [])
          .filter((match) => match.classificacao === 'confere')
          .map((match) => match.guiaId)
      );
      setSelected(defaults);
    } catch (err) {
      setPreviewError(apiErrMsg(err));
    } finally {
      setLoadingPreview(false);
    }
  }, [clienteId, ano, mes]);

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

  const toggleGuia = (guiaId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(guiaId)) next.delete(guiaId);
      else next.add(guiaId);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelected(new Set(matches.map((match) => match.guiaId)));
  };

  const handleClearAll = () => {
    setSelected(new Set());
  };

  const handleConfirm = async () => {
    if (!clienteId || !selected.size) return;
    setAplicando(true);
    try {
      const resultado = await aplicarConciliacao({
        clienteId,
        ano,
        mes,
        guiaIds: Array.from(selected),
      });
      const resumo = formatAplicacaoResumo(resultado);
      toast.success(resumo ? `Conciliação aplicada: ${resumo}` : 'Conciliação aplicada.');
      onSuccess?.(resultado);
      onClose();
    } catch (err) {
      toast.error(apiErrMsg(err));
    } finally {
      setAplicando(false);
    }
  };

  const semMatches = !!preview && !matches.length;

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Conciliar pagamentos"
      content={
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Confira os pagamentos encontrados no PagtoWeb e marque quais guias devem ser baixadas.
            Nada é alterado até você confirmar.
          </Typography>

          {loadingPreview ? (
            <Stack alignItems="center" py={4}>
              <CircularProgress size={32} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Buscando pagamentos e guias correspondentes…
              </Typography>
            </Stack>
          ) : null}

          {previewError ? (
            <Alert severity="error" sx={{ borderRadius: 1.5 }}>
              {previewError}
            </Alert>
          ) : null}

          {semMatches && !loadingPreview ? (
            <Alert severity="info" icon={<Iconify icon="solar:check-circle-bold" width={20} />}>
              <AlertTitle>Nada a conciliar</AlertTitle>
              Nenhum pagamento do período corresponde a uma guia em aberto. Guias já baixadas e
              pagamentos sem guia no sistema são ignorados.
            </Alert>
          ) : null}

          {matches.length && !loadingPreview ? (
            <>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                <Button size="small" variant="text" onClick={handleSelectAll}>
                  Selecionar todas
                </Button>
                <Button size="small" variant="text" onClick={handleClearAll}>
                  Limpar
                </Button>
                <Chip
                  size="small"
                  variant="soft"
                  label={`${selected.size} de ${matches.length} selecionada(s)`}
                />
                {preview?.resumo?.atencao ? (
                  <Chip
                    size="small"
                    variant="soft"
                    color="warning"
                    label={`${preview.resumo.atencao} com atenção`}
                  />
                ) : null}
              </Stack>

              <Scrollbar sx={{ maxHeight: 380 }}>
                <Stack spacing={1.5}>
                  {grupos.map((grupo) => (
                    <Stack key={grupo.competencia} spacing={0.5}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 700, textTransform: 'uppercase' }}
                      >
                        Competência {grupo.competencia}
                      </Typography>

                      {grupo.itens.map((match) => {
                        const checked = selected.has(match.guiaId);
                        return (
                          <Box
                            key={match.guiaId}
                            sx={{
                              px: 1,
                              py: 0.75,
                              borderRadius: 1,
                              bgcolor: checked ? 'action.selected' : 'transparent',
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  size="small"
                                  checked={checked}
                                  onChange={() => toggleGuia(match.guiaId)}
                                />
                              }
                              label={
                                <Stack spacing={0.25} sx={{ py: 0.25 }}>
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                    flexWrap="wrap"
                                    useFlexGap
                                  >
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {match.tipoGuia}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {formatValue(match.guiaValor)}
                                    </Typography>
                                    <SeloConciliacao classificacao={match.classificacao} />
                                  </Stack>

                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                    flexWrap="wrap"
                                    useFlexGap
                                  >
                                    <Typography variant="caption" color="text.secondary">
                                      Pago em {formatDate(match.pagamento?.dataArrecadacao)}
                                    </Typography>
                                    <Divider orientation="vertical" flexItem />
                                    <Typography variant="caption" color="text.secondary">
                                      {formatValue(match.pagamento?.valorPrincipal)} de principal
                                    </Typography>
                                    <Divider orientation="vertical" flexItem />
                                    <Typography variant="caption" color="text.secondary">
                                      Doc. {match.pagamento?.numeroDocumento || '—'}
                                    </Typography>
                                  </Stack>

                                  {match.motivo ? (
                                    <Typography variant="caption" color="warning.dark">
                                      {match.motivo}
                                    </Typography>
                                  ) : null}
                                </Stack>
                              }
                              sx={{ m: 0, width: '100%', alignItems: 'flex-start' }}
                            />
                          </Box>
                        );
                      })}
                    </Stack>
                  ))}
                </Stack>
              </Scrollbar>
            </>
          ) : null}
        </Stack>
      }
      action={
        // Some apenas quando não há o que conciliar; durante o carregamento ou após erro
        // o botão continua visível, porém desabilitado.
        semMatches ? null : (
          <LoadingButton
            variant="contained"
            loading={aplicando}
            disabled={loadingPreview || !!previewError || !selected.size}
            onClick={handleConfirm}
            startIcon={<Iconify icon="solar:check-circle-bold" />}
          >
            {`Confirmar ${selected.size} baixa(s)`}
          </LoadingButton>
        )
      }
      maxWidth="sm"
    />
  );
}

export { formatAplicacaoResumo };
