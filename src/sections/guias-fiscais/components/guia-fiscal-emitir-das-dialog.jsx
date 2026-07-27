'use client';

import dayjs from 'dayjs';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CircularProgress from '@mui/material/CircularProgress';

import {
  gerarDas,
  base64ToPdfFile,
  arquivarExtratoDas,
  extractDasPdfItems,
} from 'src/actions/serPro';
import {
  criarGuiaSerpro,
  uploadGuiasFiscais,
  getDasExistenteNoSlot,
  substituirArquivoGuia,
  useGetPastasGuiasAdmin,
} from 'src/actions/guias-fiscais';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { ClienteDocumentoPastaTreeView } from './cliente-documento-pasta-tree-view';
import {
  DRIVE_PREVIEW_BG,
  DRIVE_SHADOW_SOFT,
  DRIVE_BORDER_COLOR,
  DRIVE_SURFACE_RADIUS,
} from '../guia-drive-file-visual';
import {
  formatCompetencia,
  findExpectedDasFolder,
  collectPastaTreeItemIds,
  MESES_COMPETENCIA_OPTIONS,
  buildPeriodoApuracaoSerpro,
  mesAnoToCompetenciaDisplay,
  buildDataConsolidacaoSerpro,
  buildExpectedDasFolderLabels,
} from '../utils';

// ----------------------------------------------------------------------

const INVALID_FILENAME_RE = /[/\\?%*:|"<>]/g;

function sanitizeFilename(name) {
  const cleaned = String(name || '').replace(INVALID_FILENAME_RE, '').trim();
  return cleaned || 'DAS';
}

function proximoSufixoDisponivel(nomeBase, existentes = []) {
  const nomes = new Set(existentes.map((g) => g.nomeArquivo));
  if (!nomes.has(nomeBase)) return nomeBase;
  const semExt = nomeBase.replace(/\.pdf$/i, '');
  const ext = '.pdf';
  for (let i = 2; i < 100; i += 1) {
    const candidato = `${semExt} (${i})${ext}`;
    if (!nomes.has(candidato)) return candidato;
  }
  return `${semExt} (${Date.now()})${ext}`;
}

function getClienteLabel(cliente) {
  if (!cliente) return 'Cliente';
  const codigo = cliente.codigoCliente || cliente.codigo || cliente.code || cliente._id?.slice?.(-6) || '-';
  const razaoSocial = cliente.nomeRazaoSocial || cliente.razaoSocial || cliente.nome || 'Sem razão social';
  return `${codigo} - ${razaoSocial}`;
}

function apiErrMsg(err) {
  if (!err) return 'Erro inesperado';
  if (typeof err === 'string') return err;
  return err.response?.data?.message || err.message || 'Erro na operação';
}

function formatSerproDate(value) {
  if (!value) return null;
  const digits = String(value).replace(/\D/g, '');
  if (digits.length === 8) {
    const parsed = dayjs(digits, 'YYYYMMDD', true);
    return parsed.isValid() ? parsed.format('DD/MM/YYYY') : null;
  }
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD/MM/YYYY') : null;
}

function SectionLabel({ children }) {
  return (
    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
      {children}
    </Typography>
  );
}

function FormSection({ title, children, showDivider = false }) {
  return (
    <>
      {showDivider ? <Divider sx={{ borderColor: DRIVE_BORDER_COLOR }} /> : null}
      <Stack spacing={1.5}>
        {title ? <SectionLabel>{title}</SectionLabel> : null}
        {children}
      </Stack>
    </>
  );
}

function SummaryCard({ children }) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.75,
        borderRadius: DRIVE_SURFACE_RADIUS,
        border: `1px solid ${DRIVE_BORDER_COLOR}`,
        bgcolor: 'background.neutral',
      }}
    >
      {children}
    </Box>
  );
}

const disabledFieldSx = {
  '& .MuiInputBase-root.Mui-disabled': {
    bgcolor: 'action.hover',
  },
  '& .MuiInputBase-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
    borderColor: DRIVE_BORDER_COLOR,
  },
};

const previewFrameSx = {
  width: '100%',
  height: 'min(70vh, 720px)',
  border: `1px solid ${DRIVE_BORDER_COLOR}`,
  borderRadius: DRIVE_SURFACE_RADIUS,
  bgcolor: DRIVE_PREVIEW_BG,
  boxShadow: DRIVE_SHADOW_SOFT,
};

const treeContainerSx = {
  maxHeight: 220,
  overflow: 'auto',
  border: `1px solid ${DRIVE_BORDER_COLOR}`,
  borderRadius: DRIVE_SURFACE_RADIUS,
  bgcolor: 'background.paper',
  p: 1,
};

export function GuiaFiscalEmitirDasDialog({
  open,
  onClose,
  clientes = [],
  loadingClientes = false,
  initialClienteId = '',
  initialMes = '',
  initialAno = '',
  onUploadSuccess,
}) {
  const [step, setStep] = useState('form');
  const [cliente, setCliente] = useState(null);
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState(String(new Date().getFullYear()));
  const [dataVencimento, setDataVencimento] = useState(null);
  const [emitting, setEmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [emitError, setEmitError] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [dasDetalhe, setDasDetalhe] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [customName, setCustomName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [guiaExistente, setGuiaExistente] = useState(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [guiasNaPasta, setGuiasNaPasta] = useState([]);

  const clienteId = cliente?._id || '';
  const competencia = useMemo(() => mesAnoToCompetenciaDisplay(mes, ano), [mes, ano]);

  const periodoApuracaoPreview = useMemo(
    () => buildPeriodoApuracaoSerpro(mes, ano),
    [mes, ano]
  );

  const { folders, isLoading: loadingFolders } = useGetPastasGuiasAdmin(
    step === 'confirm' && clienteId ? clienteId : null
  );

  const expectedFolder = useMemo(
    () => findExpectedDasFolder(folders, competencia),
    [folders, competencia]
  );

  const expectedPathText = useMemo(() => {
    const meta = buildExpectedDasFolderLabels(competencia);
    return meta?.pathLabels?.join(' › ') || '-';
  }, [competencia]);

  const pastaExpanded = useMemo(() => collectPastaTreeItemIds(folders || []), [folders]);

  const selectedFolderNode = useMemo(() => {
    if (!selectedFolderId || !folders?.length) return null;
    let found = null;
    const walk = (nodes) => {
      nodes.forEach((n) => {
        if (n._id === selectedFolderId) { found = n; return; }
        if (n.children?.length) walk(n.children);
      });
    };
    walk(folders);
    return found;
  }, [selectedFolderId, folders]);

  const isDefaultFolder = !selectedFolderId || selectedFolderId === expectedFolder?.node?._id;

  const selectedPathText = useMemo(() => {
    if (isDefaultFolder) return expectedPathText;
    if (!selectedFolderNode) return '-';
    const allFolders = [];
    const collectAll = (nodes) => {
      nodes.forEach((n) => {
        allFolders.push(n);
        if (n.children?.length) collectAll(n.children);
      });
    };
    collectAll(folders || []);
    const path = [];
    const buildPath = (node) => {
      if (node.parentId) {
        const parent = allFolders.find((n) => n._id === node.parentId);
        if (parent) buildPath(parent);
      }
      path.push(node.nome || node.slug);
    };
    buildPath(selectedFolderNode);
    return path.join(' › ');
  }, [selectedFolderNode, isDefaultFolder, expectedPathText, folders]);

  const resetState = useCallback(() => {
    setStep('form');
    setCliente(null);
    setMes('');
    setAno(String(new Date().getFullYear()));
    setDataVencimento(null);
    setEmitting(false);
    setUploading(false);
    setEmitError('');
    setPdfFile(null);
    setDasDetalhe(null);
    setPreviewUrl(null);
    setCustomName('');
    setSelectedFolderId(null);
    setGuiaExistente(null);
    setCheckingDuplicate(false);
    setDuplicateDialogOpen(false);
    setGuiasNaPasta([]);
  }, []);

  useEffect(() => {
    if (!open) {
      resetState();
      return;
    }

    if (initialClienteId && clientes?.length) {
      const found = clientes.find((c) => c._id === initialClienteId);
      if (found) setCliente(found);
    }
    if (initialMes) setMes(initialMes);
    if (initialAno) setAno(initialAno);
  }, [open, initialClienteId, initialMes, initialAno, clientes, resetState]);

  useEffect(() => {
    if (!pdfFile) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(pdfFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pdfFile]);

  // Preenche customName e selectedFolderId ao entrar no step confirm
  useEffect(() => {
    if (step !== 'confirm') return;
    if (pdfFile && !customName) {
      setCustomName(pdfFile.name.replace(/\.pdf$/i, ''));
    }
    if (expectedFolder?.node?._id && !selectedFolderId) {
      setSelectedFolderId(expectedFolder.node._id);
    }
  }, [step, pdfFile, customName, expectedFolder, selectedFolderId]);

  // Detecta DAS existente no slot
  useEffect(() => {
    let cancelled = false;
    if (step === 'confirm' && selectedFolderId && competencia && clienteId) {
      setCheckingDuplicate(true);
      getDasExistenteNoSlot(clienteId, selectedFolderId, competencia)
        .then(({ existe, guia }) => {
          if (cancelled) return;
          setGuiaExistente(existe ? guia : null);
          if (existe) setDuplicateDialogOpen(true);
        })
        .catch(() => {
          if (!cancelled) setGuiaExistente(null);
        })
        .finally(() => {
          if (!cancelled) setCheckingDuplicate(false);
        });
    } else {
      setGuiaExistente(null);
      setGuiasNaPasta([]);
    }
    return () => { cancelled = true; };
  }, [step, selectedFolderId, competencia, clienteId]);

  const handleClose = () => {
    if (emitting || uploading) return;
    onClose();
  };

  const handleEmitir = async () => {
    setEmitError('');

    if (!clienteId) {
      setEmitError('Selecione o cliente.');
      return;
    }
    if (!mes || !ano) {
      setEmitError('Informe o mês e o ano da competência.');
      return;
    }

    const periodoApuracao = buildPeriodoApuracaoSerpro(mes, ano);
    if (!periodoApuracao) {
      setEmitError('Competência inválida. Use mês 01–12 e ano com 4 dígitos.');
      return;
    }

    const payload = { periodoApuracao };
    const dataConsolidacao = buildDataConsolidacaoSerpro(dataVencimento);
    if (dataConsolidacao) {
      payload.dataConsolidacao = dataConsolidacao;
    }

    setEmitting(true);
    try {
      const res = await gerarDas(clienteId, payload);
      const items = extractDasPdfItems(res.data?.dasGerada);

      if (!items.length) {
        throw new Error('A Serpro não retornou o PDF da DAS.');
      }

      const primeiro = items[0];
      const nomeArquivo = `DAS-${periodoApuracao}.pdf`;
      const file = base64ToPdfFile(primeiro.pdf, nomeArquivo);

      setPdfFile(file);
      setDasDetalhe(primeiro.detalhamento || null);
      setStep('confirm');
      toast.success('DAS gerada. Revise e arquive.');
    } catch (err) {
      const message = apiErrMsg(err);
      setEmitError(message);
      toast.error(message);
    } finally {
      setEmitting(false);
    }
  };

  const handleArquivar = async () => {
    if (!pdfFile) return;
    const finalName = sanitizeFilename(customName);
    const finalFile = new File([pdfFile], `${finalName}.pdf`, { type: 'application/pdf' });

    setUploading(true);
    try {
      const serproId = dasDetalhe?.idRecibo || dasDetalhe?.numeroDocumento || finalName;
      const dv = dataVencimento?.isValid?.() ? dataVencimento.toISOString() : undefined;

      if (guiaExistente) {
        await substituirArquivoGuia(guiaExistente._id, finalFile, {
          clienteId,
          serproId,
          dataVencimento: dv,
        });
        toast.success('DAS substituída com sucesso.');
      } else if (isDefaultFolder) {
        const result = await uploadGuiasFiscais([finalFile]);
        const payload = result?.data || result;
        const inner = payload?.data || payload;
        const ok = payload?.success !== false && (inner?.processadas ?? 0) > 0;
        if (!ok) {
          throw new Error(inner?.mensagem || payload?.message || 'Não foi possível arquivar a DAS.');
        }
        toast.success('DAS arquivada na pasta do cliente.');
      } else {
        await criarGuiaSerpro(finalFile, {
          clienteId,
          folderId: selectedFolderId,
          serproId,
          dataVencimento: dv,
          competencia,
        });
        toast.success('DAS arquivada com sucesso.');
      }

      // Best-effort: buscar e arquivar o extrato do DAS do mês junto da DAS.
      // Uma falha aqui NÃO deve impedir o arquivamento da DAS já concluído.
      const numeroDasExtrato = dasDetalhe?.numeroDas || dasDetalhe?.numeroDocumento;
      const periodoApuracao = buildPeriodoApuracaoSerpro(mes, ano);
      if (numeroDasExtrato && periodoApuracao) {
        try {
          await arquivarExtratoDas(clienteId, {
            numeroDas: String(numeroDasExtrato),
            periodoApuracao,
            folderId: selectedFolderId || expectedFolder?.node?._id || undefined,
          });
          toast.success('Extrato do DAS arquivado junto.');
        } catch (extErr) {
          toast.warning(`DAS arquivada, mas o extrato não pôde ser obtido: ${apiErrMsg(extErr)}`);
        }
      }

      onUploadSuccess?.({
        clienteId,
        competencia,
        folderId: selectedFolderId || expectedFolder?.node?._id || null,
      });
      onClose();
    } catch (err) {
      toast.error(apiErrMsg(err));
    } finally {
      setUploading(false);
    }
  };

  const handleSubstituirExistente = async () => {
    setDuplicateDialogOpen(false);
    setGuiasNaPasta([]);
    await handleArquivar();
  };

  const handleCriarNovo = async () => {
    setDuplicateDialogOpen(false);
    setGuiaExistente(null);
    const nomeBase = sanitizeFilename(customName);
    const nomeComSufixo = proximoSufixoDisponivel(`${nomeBase}.pdf`, guiasNaPasta);
    setCustomName(nomeComSufixo.replace(/\.pdf$/i, ''));
    await handleArquivar();
  };

  const vencimentoSerpro = formatSerproDate(dasDetalhe?.dataVencimento);
  const vencimentoForm = dataVencimento?.isValid?.() ? dataVencimento.format('DD/MM/YYYY') : null;

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ px: 3, pt: 2.5, pb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.lighter',
                color: 'primary.main',
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:document-add-bold-duotone" width={22} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" lineHeight={1.3}>
                {step === 'form' ? 'Emitir DAS' : 'Arquivar DAS'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {step === 'form'
                  ? 'Integra Contador · Simples Nacional'
                  : 'Confirme o PDF e salve na pasta fiscal do cliente'}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ px: 3, py: 2.75 }}>
          {step === 'form' ? (
            <Stack spacing={2.75}>
              <FormSection title="Tipo de guia">
                <TextField
                  select
                  label="Guia"
                  value="DAS"
                  fullWidth
                  disabled
                  sx={disabledFieldSx}
                >
                  <MenuItem value="DAS">DAS — Simples Nacional</MenuItem>
                </TextField>
              </FormSection>

              <FormSection title="Cliente" showDivider>
                <Autocomplete
                  options={clientes}
                  loading={loadingClientes}
                  value={cliente}
                  onChange={(_, value) => setCliente(value)}
                  getOptionLabel={(option) => getClienteLabel(option)}
                  renderOption={(props, option) => (
                    <li {...props} key={option?._id}>
                      {getClienteLabel(option)}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Selecionar cliente"
                      placeholder="Código ou razão social"
                    />
                  )}
                />
              </FormSection>

              <FormSection title="Competência e vencimento" showDivider>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                  <TextField
                    select
                    label="Mês"
                    value={mes}
                    onChange={(e) => setMes(e.target.value)}
                    sx={{ flex: 1, minWidth: 0 }}
                  >
                    <MenuItem value="">
                      <em>Selecione</em>
                    </MenuItem>
                    {MESES_COMPETENCIA_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Ano"
                    value={ano}
                    onChange={(e) => setAno(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    inputProps={{ inputMode: 'numeric', maxLength: 4 }}
                    sx={{ width: { xs: '100%', sm: 112 }, flexShrink: 0 }}
                  />

                  <DatePicker
                    label="Data Vencimento (Opcional)"
                    value={dataVencimento}
                    onChange={(value) => setDataVencimento(value)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: { flex: 1.2, minWidth: 0 },
                        helperText: 'Se não informada, a data de vencimento será o dia atual.',
                      },
                    }}
                  />
                </Stack>

                {periodoApuracaoPreview ? (
                  <Typography variant="body2" color="text.secondary">
                    {formatCompetencia(competencia)} · período Serpro{' '}
                    <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {periodoApuracaoPreview}
                    </Box>
                  </Typography>
                ) : null}
              </FormSection>

              {emitError ? <Alert severity="error">{emitError}</Alert> : null}
            </Stack>
          ) : (
            <Stack spacing={2.75}>
              <FormSection title="Resumo">
                <SummaryCard>
                  <Typography variant="subtitle2" noWrap>
                    {getClienteLabel(cliente)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    DAS · {formatCompetencia(competencia)}
                    {vencimentoSerpro || vencimentoForm
                      ? ` · venc. ${vencimentoSerpro || vencimentoForm}`
                      : ''}
                  </Typography>
                </SummaryCard>
              </FormSection>

              <FormSection title="Preview do PDF" showDivider>
                <Box component="iframe" title="Preview DAS" src={previewUrl || undefined} sx={previewFrameSx} />
                {pdfFile ? (
                  <TextField
                    label="Nome do arquivo"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mt: 1 }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', ml: 0.5 }}>
                            .pdf
                          </Typography>
                        ),
                      },
                      inputLabel: { shrink: true },
                    }}
                    helperText={`${(pdfFile.size / 1024).toFixed(1)} KB`}
                  />
                ) : null}
              </FormSection>

              <FormSection title="Pasta de destino" showDivider>
                {loadingFolders ? (
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 0.5 }}>
                    <CircularProgress size={18} />
                    <Typography variant="body2" color="text.secondary">
                      Carregando pastas…
                    </Typography>
                  </Stack>
                ) : (
                  <Stack spacing={1.5}>
                    {selectedFolderId && !isDefaultFolder ? (
                      <Alert
                        severity="info"
                        variant="outlined"
                        sx={{
                          borderRadius: DRIVE_SURFACE_RADIUS,
                          borderColor: DRIVE_BORDER_COLOR,
                          bgcolor: 'background.paper',
                        }}
                      >
                        <Typography variant="body2" fontWeight={600} gutterBottom>
                          Pasta selecionada: {selectedPathText}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Diferente do padrão ({expectedPathText}).
                        </Typography>
                      </Alert>
                    ) : (
                      <Alert
                        severity={expectedFolder?.exists ? 'success' : 'info'}
                        variant="outlined"
                        sx={{
                          borderRadius: DRIVE_SURFACE_RADIUS,
                          borderColor: DRIVE_BORDER_COLOR,
                          bgcolor: 'background.paper',
                        }}
                      >
                        <Typography variant="body2" fontWeight={600} gutterBottom>
                          {expectedPathText}
                        </Typography>
                        {!expectedFolder?.exists ? (
                          <Typography variant="caption" color="text.secondary">
                            A pasta será criada automaticamente ao arquivar.
                          </Typography>
                        ) : null}
                      </Alert>
                    )}

                    {folders?.length ? (
                      <Box sx={treeContainerSx}>
                        <ClienteDocumentoPastaTreeView
                          folders={folders}
                          selectedId={selectedFolderId}
                          onSelect={setSelectedFolderId}
                          defaultExpandedItems={pastaExpanded}
                        />
                      </Box>
                    ) : null}

                    {checkingDuplicate ? (
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.25 }}>
                        <CircularProgress size={14} />
                        <Typography variant="caption" color="text.secondary">
                          Verificando DAS existente…
                        </Typography>
                      </Stack>
                    ) : null}
                  </Stack>
                )}
              </FormSection>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={emitting || uploading} color="inherit">
            Cancelar
          </Button>

          {step === 'form' ? (
            <Button variant="contained" onClick={handleEmitir} disabled={emitting}>
              {emitting ? 'Emitindo…' : 'Emitir'}
            </Button>
          ) : (
            <>
              <Button onClick={() => setStep('form')} disabled={uploading} color="inherit">
                Voltar
              </Button>
              <Button variant="contained" onClick={handleArquivar} disabled={uploading || !pdfFile || checkingDuplicate}>
                {uploading ? 'Salvando…' : 'Arquivar'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={duplicateDialogOpen} onClose={() => setDuplicateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>DAS já existe nesta pasta</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Já existe uma DAS de <strong>{competencia}</strong> nesta pasta:
          </Typography>
          <SummaryCard>
            <Typography variant="subtitle2" noWrap>
              {guiaExistente?.nomeArquivo || 'DAS'}
            </Typography>
            {guiaExistente?.dataVencimento ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Vencimento: {formatSerproDate(guiaExistente.dataVencimento)}
              </Typography>
            ) : null}
            {guiaExistente?.statusPagamento ? (
              <Typography variant="caption" color="text.secondary">
                Status: {guiaExistente.statusPagamento}
              </Typography>
            ) : null}
          </SummaryCard>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            O que deseja fazer?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateDialogOpen(false)} disabled={uploading} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleCriarNovo} disabled={uploading}>
            Criar novo arquivo
          </Button>
          <Button variant="contained" onClick={handleSubstituirExistente} disabled={uploading}>
            {uploading ? 'Substituindo…' : 'Substituir existente'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
