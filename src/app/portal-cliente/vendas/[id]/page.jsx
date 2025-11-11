'use client';

import React from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { LazyMotion, m as motion, domAnimation } from 'framer-motion';

import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import {
  Box,
  Card,
  Chip,
  Stack,
  Alert,
  Button,
  Tooltip,
  Divider,
  MenuItem,
  Checkbox,
  TextField,
  Typography,
  IconButton,
  CardContent,
  InputAdornment,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import { useEmpresa } from 'src/hooks/use-empresa';
import { useSettings } from 'src/hooks/useSettings';

import { fCurrency } from 'src/utils/format-number';

import {
  criarNFSeOrcamento,
  getNfsesByOrcamento,
  cancelarNFSeInvoice,
} from 'src/actions/notafiscal';
import {
  usePortalServicos,
  portalGetOrcamento,
  portalUpdateOrcamento,
  portalDownloadOrcamentoPDF,
  portalUpdateOrcamentoStatus,
} from 'src/actions/portal';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { OrcamentoEditPageSkeleton } from 'src/components/skeleton/VendaEditPageSkeleton';

import { OrcamentoPDF } from 'src/sections/orcamento/orcamento-pdf';

import { useAuthContext } from 'src/auth/hooks';

export default function OrcamentoDetalhesPage({ params }) {
  const { id } = params;
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;
  const { empresaAtiva, loadingEmpresas } = useEmpresa(userId);
  const clienteProprietarioId = empresaAtiva;
  const { podeCriarOrcamentos, podeEmitirNFSe, settings } = useSettings();
  const theme = useTheme();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [orcamento, setOrcamento] = React.useState(null);
  const [status, setStatus] = React.useState('');
  const [viewOpen, setViewOpen] = React.useState(false);
  const [generatingNf, setGeneratingNf] = React.useState(false);
  const [nfseList, setNfseList] = React.useState([]);
  const [itemEdit, setItemEdit] = React.useState({
    quantidade: 1,
    valorUnitario: 0,
    valorUnitarioText: fCurrency(0),
    desconto: 0,
    descontoText: fCurrency(0),
    descricao: '',
  });
  const [editingServico, setEditingServico] = React.useState(false);
  const [editingPedido, setEditingPedido] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState('');
  const [confirmCancel, setConfirmCancel] = React.useState(false);
  const [cancelLoading, setCancelLoading] = React.useState(false);
  const [nfseToCancel, setNfseToCancel] = React.useState(null);
  const [notaRetroativa, setNotaRetroativa] = React.useState(false);
  const { data: servicosList, isLoading: loadingServicos } =
    usePortalServicos(clienteProprietarioId);
  
  const emiteNotaRetroativa = settings?.eNotasConfig?.emiteNotaRetroativa === true;

  React.useEffect(() => {
    let cancelled = false;

    const loadWithRetry = async (attempt = 0) => {
      if (!clienteProprietarioId || cancelled) return;
      try {
        const data = await portalGetOrcamento(clienteProprietarioId, id);
        if (cancelled) return;
        setOrcamento(data);
        setStatus(data?.status || 'pendente');
        
        // Verificar se tem data de competência da nota (nota retroativa)
        if (data?.dataCompetenciaNota) {
          setNotaRetroativa(true);
        }
        
        // inicializa edição de item (apenas o primeiro)
        const first = Array.isArray(data?.itens) && data.itens.length ? data.itens[0] : null;
        if (first) {
          const toCurrencyText = (n) => fCurrency(Number(n || 0));
          setItemEdit({
            _id: first._id,
            servicoId: first.servicoId,
            descricao: first.descricao || first?.servicoId?.nome || '',
            quantidade: Number(first.quantidade || 1),
            valorUnitario: Number(first.valorUnitario || 0),
            valorUnitarioText: toCurrencyText(first.valorUnitario || 0),
            desconto: Number(first.desconto || 0),
            descontoText: toCurrencyText(first.desconto || 0),
          });
        }
        // Carregar NFSe existentes do orçamento assim que carregar os dados
        try {
          const res = await getNfsesByOrcamento(clienteProprietarioId, id);
          if (!cancelled) {
            const dataResp = res?.data ?? res;
            const list = Array.isArray(dataResp?.notaFiscals)
              ? dataResp.notaFiscals
              : Array.isArray(dataResp?.notas)
                ? dataResp.notas
                : Array.isArray(dataResp)
                  ? dataResp
                  : dataResp?.notaFiscal
                    ? [dataResp.notaFiscal]
                    : [];
            setNfseList(list);
          }
        } catch (e) {
          // silencioso
        }
        setLoading(false);
      } catch (e) {
        if (e?.response?.status === 404 && attempt < 2) {
          setTimeout(() => {
            if (!cancelled) loadWithRetry(attempt + 1);
          }, 600);
        } else if (!cancelled) {
          toast.error('Erro ao carregar orçamento');
          setLoading(false);
        }
      }
    };

    if (clienteProprietarioId) {
      setLoading(true);
      loadWithRetry();
    }

    return () => {
      cancelled = true;
    };
  }, [clienteProprietarioId, id]);

  if (loadingEmpresas || !clienteProprietarioId || loading) return <OrcamentoEditPageSkeleton />;

  if (!orcamento) return <Typography>Orçamento não encontrado</Typography>;
  if (!podeCriarOrcamentos) return <Typography>Funcionalidade não disponível</Typography>;

  const hasNFSeAutorizada =
    Array.isArray(nfseList) &&
    nfseList.some(
      (n) => n.status === 'emitida' || String(n.eNotasStatus).toLowerCase() === 'autorizada'
    );
  const isPaid = String(orcamento.status).toLowerCase() === 'pago';
  const canEditPedido = !hasNFSeAutorizada && !isPaid;
  // Status: Pode sempre editar; atualização imediata ao trocar o select
  const canEditStatusSelect = true;

  const subtotal = (orcamento.itens || []).reduce(
    (acc, it) =>
      acc + (Number(it.quantidade) * Number(it.valorUnitario) - Number(it.desconto || 0)),
    0
  );
  const total = subtotal - Number(orcamento.descontoGeral || 0);

  const handleSalvar = async () => {
    try {
      setSaving(true);
      await portalUpdateOrcamento(id, {
        clienteProprietarioId,
        observacoes: orcamento.observacoes,
        condicoesPagamento: orcamento.condicoesPagamento,
        dataCompetenciaNota: notaRetroativa ? orcamento.dataCompetenciaNota : null,
      });
      toast.success('Orçamento atualizado');
      setEditingPedido(false);
    } catch (e) {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const onlyDigits = (v) => String(v || '').replace(/\D/g, '');
  const formatBRLInput = (v) => {
    const d = onlyDigits(v);
    const n = Number(d) / 100;
    return { text: fCurrency(n), value: n };
  };

  const handleSalvarItens = async () => {
    try {
      setSaving(true);
      const base =
        Array.isArray(orcamento.itens) && orcamento.itens.length ? orcamento.itens[0] : {};
      const novoItem = {
        ...base,
        servicoId:
          (typeof itemEdit.servicoId === 'object' ? itemEdit.servicoId?._id : itemEdit.servicoId) ||
          base.servicoId,
        descricao: itemEdit.descricao,
        quantidade: Number(itemEdit.quantidade || 1),
        valorUnitario: Number(itemEdit.valorUnitario || 0),
        desconto: Number(itemEdit.desconto || 0),
      };
      await portalUpdateOrcamento(id, { clienteProprietarioId, itens: [novoItem] });
      setOrcamento((o) => ({ ...o, itens: [novoItem] }));
      toast.success('Itens atualizados');
      setEditingServico(false);
    } catch (e) {
      toast.error('Erro ao salvar itens');
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (newStatus) => {
    try {
      setSaving(true);
      await portalUpdateOrcamentoStatus(id, { status: newStatus, clienteProprietarioId });
      setStatus(newStatus);
      setOrcamento((o) => ({ ...o, status: newStatus }));
      toast.success('Status atualizado');
    } catch (e) {
      toast.error('Erro ao atualizar status');
    } finally {
      setSaving(false);
    }
  };

  const handleEmitirNFSe = async () => {
    if (!podeEmitirNFSe) return;
    if (!clienteProprietarioId || !id) return;
    try {
      setGeneratingNf(true);
      const res = await criarNFSeOrcamento({ clienteId: clienteProprietarioId, orcamentoId: id });
      if (res?.status === 200) {
        toast.success('Processando emissão da NFSe...');
        const placeholder = {
          status: 'emitindo',
          numeroNota: 'Processando...',
          serie: 'Processando...',
          codigoVerificacao: 'Processando...',
          linkNota: 'Processando...',
        };
        setNfseList((list) => [placeholder, ...list]);
      } else {
        toast.error('Falha ao iniciar emissão da NFSe');
      }
    } catch (e) {
      toast.error('Falha ao emitir NFSe');
    } finally {
      setGeneratingNf(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await portalDownloadOrcamentoPDF(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${orcamento.numero || 'orcamento'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast.error('Erro ao gerar PDF');
    }
  };

  const getStatusColor = (st) => {
    const s = String(st || '').toLowerCase();
    if (s === 'pago') return 'success';
    if (s === 'aprovado') return 'info';
    if (s === 'recusado') return 'error';
    if (s === 'pendente') return 'warning';
    return 'default';
  };

  const hasNotaAtiva =
    Array.isArray(nfseList) &&
    nfseList.some((n) => n.status === 'emitida' || n.status === 'emitindo');
  
  const hasNotaProcessando =
    Array.isArray(nfseList) &&
    nfseList.some((n) => 
      n.status === 'emitindo' || 
      n.linkNota === 'Processando...' ||
      String(n.numeroNota).toLowerCase() === 'processando...'
    );
  const selectedServicoId =
    typeof itemEdit.servicoId === 'object' ? itemEdit.servicoId?._id : itemEdit.servicoId;

  return (
    <LazyMotion features={domAnimation}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Card sx={{ borderRadius: 3 }}>
          <Box
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.1
              )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
            }}
          >
            <Stack spacing={1}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                Venda {orcamento.numero}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, pb: 0.5, fontWeight: orcamento?.clienteDoClienteId ? 600 : 400 }}>
                Cliente: {orcamento?.clienteDoClienteId?.nome || 'NÃO INFORMADO'}
              </Typography>
              <Chip
                label={String(orcamento.status || '').toUpperCase()}
                color={getStatusColor(orcamento.status)}
                size="small"
                variant="soft"
                sx={{ fontWeight: 700, alignSelf: 'flex-start' }}
              />
            </Stack>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              flexWrap="wrap"
              justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
              sx={{ mt: { xs: 2, md: 0 }, width: { xs: '100%', md: 'auto' } }}
            >
              <Button
                onClick={() => setViewOpen(true)}
                variant="outlined"
                startIcon={<Iconify icon="solar:eye-bold" />}
              >
                Ver
              </Button>
              <PDFDownloadLink
                document={<OrcamentoPDF orcamento={orcamento} settings={settings} />}
                fileName={`${orcamento.numero || 'orcamento'}.pdf`}
                style={{ textDecoration: 'none' }}
              >
                {({ loading: pdfLoading }) => (
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="solar:document-text-bold" />}
                  >
                    {pdfLoading ? 'Gerando...' : 'Baixar'}
                  </Button>
                )}
              </PDFDownloadLink>
              {podeEmitirNFSe && !hasNFSeAutorizada && (
                <>
                  {hasNotaProcessando ? (
                    <Button
                      variant="outlined"
                      color="warning"
                      disabled
                      startIcon={<Iconify icon="solar:clock-circle-bold" />}
                    >
                      Nota em Emissão...
                    </Button>
                  ) : (
                    <Button
                      onClick={handleEmitirNFSe}
                      variant="contained"
                      startIcon={<Iconify icon="solar:bill-check-bold" />}
                      disabled={generatingNf}
                    >
                      {generatingNf ? 'Emitindo...' : 'Emitir NFSe'}
                    </Button>
                  )}
                </>
              )}
            </Stack>
          </Box>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Detalhes da Venda
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="subtitle2">Cliente</Typography>
                    {!orcamento?.clienteDoClienteId && (
                      <Stack spacing={0.5} sx={{ mt: 1 }}>
                        <Typography variant="body2" fontWeight='bold'>Não Informado</Typography>
                      </Stack>
                    )}
                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                      <Typography variant="body2">{orcamento?.clienteDoClienteId?.nome}</Typography>
                      {orcamento?.clienteDoClienteId?.cpfCnpj && (
                        <Typography
                          variant="caption"
                          sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                        >
                          {orcamento?.clienteDoClienteId?.cpfCnpj}
                        </Typography>
                      )}
                      {orcamento?.clienteDoClienteId?.email && (
                        <Typography variant="caption" color="text.secondary">
                          {orcamento?.clienteDoClienteId?.email}
                        </Typography>
                      )}
                      {(orcamento?.clienteDoClienteId?.telefone ||
                        orcamento?.clienteDoClienteId?.whatsapp) && (
                        <Typography variant="caption" color="text.secondary">
                          {orcamento?.clienteDoClienteId?.telefone ||
                            orcamento?.clienteDoClienteId?.whatsapp}
                        </Typography>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Stack
                      spacing={1}
                      sx={{
                        width: { xs: '100%', sm: '220' },
                        ml: { sm: 'auto' },
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ alignSelf: { xs: 'flex-start', sm: 'flex-start' } }}
                      >
                        Status
                      </Typography>
                      <TextField
                        size="small"
                        select
                        value={status}
                        onChange={(e) => handleStatus(e.target.value)}
                        disabled={!canEditStatusSelect}
                        fullWidth
                      >
                        <MenuItem value="pendente">Pendente</MenuItem>
                        <MenuItem value="aprovado">Aprovado</MenuItem>
                        <MenuItem value="recusado">Recusado</MenuItem>
                        <MenuItem value="expirado">Expirado</MenuItem>
                        <MenuItem value="pago">Pago</MenuItem>
                      </TextField>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Item do Serviço
                </Typography>
                {canEditPedido ? (
                  <Box
                    sx={{
                      borderColor: 'divider',
                      borderRadius: 1.5,
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: 1 }}>
                          <TextField
                            fullWidth
                            select
                            label="Serviço"
                            value={selectedServicoId || ''}
                            onChange={(e) => {
                              const newId = e.target.value;
                              const chosen = Array.isArray(servicosList)
                                ? servicosList.find((s) => s?._id === newId)
                                : null;
                              setItemEdit((s) => {
                                const toCurrencyText = (n) => fCurrency(Number(n || 0));
                                const shouldFillDescricao =
                                  !s.descricao || s.descricao.trim() === '';
                                const shouldFillValor =
                                  !s.valorUnitario || Number(s.valorUnitario) === 0;
                                const novoValor = chosen?.valor
                                  ? Number(chosen.valor)
                                  : s.valorUnitario;
                                return {
                                  ...s,
                                  servicoId: newId,
                                  descricao: shouldFillDescricao
                                    ? chosen?.nome || s.descricao || ''
                                    : s.descricao,
                                  valorUnitario: shouldFillValor
                                    ? Number(novoValor || 0)
                                    : s.valorUnitario,
                                  valorUnitarioText: shouldFillValor
                                    ? toCurrencyText(novoValor || 0)
                                    : s.valorUnitarioText,
                                };
                              });
                            }}
                            SelectProps={{ displayEmpty: true }}
                            InputLabelProps={{ shrink: true }}
                            disabled={!editingServico || loadingServicos}
                            helperText={
                              !editingServico
                                ? 'Clique no lápis para habilitar a edição'
                                : loadingServicos
                                  ? 'Carregando serviços...'
                                  : ''
                            }
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Tooltip
                                    title={
                                      editingServico
                                        ? 'Bloquear edição do serviço'
                                        : 'Editar serviço'
                                    }
                                  >
                                    <IconButton
                                      edge="end"
                                      onClick={() => setEditingServico((v) => !v)}
                                    >
                                      <Iconify
                                        icon={
                                          editingServico
                                            ? 'solar:lock-keyhole-bold'
                                            : 'solar:pen-bold'
                                        }
                                      />
                                    </IconButton>
                                  </Tooltip>
                                </InputAdornment>
                              ),
                            }}
                          >
                            <MenuItem value="">Selecione</MenuItem>
                            {(servicosList || []).map((s) => (
                              <MenuItem key={s?._id} value={s?._id}>
                                {s?.nome}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Descrição"
                          value={itemEdit.descricao}
                          onChange={(e) =>
                            setItemEdit((s) => ({ ...s, descricao: e.target.value }))
                          }
                        />
                      </Grid>
                      <Grid item xs={6} sm={4} md={3}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Qtd"
                          value={itemEdit.quantidade}
                          onChange={(e) =>
                            setItemEdit((s) => ({ ...s, quantidade: Number(e.target.value || 0) }))
                          }
                        />
                      </Grid>
                      <Grid item xs={6} sm={4} md={3}>
                        <TextField
                          fullWidth
                          label="Vlr Unit"
                          value={itemEdit.valorUnitarioText}
                          onChange={(e) => {
                            const { value, text } = formatBRLInput(e.target.value);
                            setItemEdit((s) => ({
                              ...s,
                              valorUnitario: value,
                              valorUnitarioText: text,
                            }));
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4} md={3}>
                        <TextField
                          fullWidth
                          label="Desconto"
                          value={itemEdit.descontoText}
                          onChange={(e) => {
                            const { value, text } = formatBRLInput(e.target.value);
                            setItemEdit((s) => ({ ...s, desconto: value, descontoText: text }));
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Stack direction="row" justifyContent="flex-end">
                          <LoadingButton
                            loading={saving}
                            onClick={handleSalvarItens}
                            variant="contained"
                          >
                            Salvar Itens
                          </LoadingButton>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <Stack
                    spacing={1}
                    sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}
                  >
                    {(orcamento.itens || []).slice(0, 1).map((it, i) => (
                      <Stack key={i} direction="row" justifyContent="space-between">
                        <Typography variant="body2">
                          {it.descricao || it?.servicoId?.nome}
                        </Typography>
                        <Typography variant="body2">
                          {it.quantidade} x {fCurrency(it.valorUnitario)}{' '}
                          {it.desconto ? `(desc ${fCurrency(it.desconto)})` : ''}
                        </Typography>
                      </Stack>
                    ))}
                    {Array.isArray(orcamento.itens) && orcamento.itens.length > 1 && (
                      <Typography variant="caption" color="text.secondary">
                        Apenas 1 item é permitido.
                      </Typography>
                    )}
                  </Stack>
                )}
              </Box>

              <Divider />

              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 2 }}
                >
                  <Typography variant="h6">Observações e Totais</Typography>
                  <Tooltip
                    title={editingPedido ? 'Bloquear edição dos dados' : 'Editar dados do pedido'}
                  >
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => setEditingPedido((v) => !v)}
                        disabled={!canEditPedido}
                      >
                        <Iconify
                          icon={editingPedido ? 'solar:lock-keyhole-bold' : 'solar:pen-bold'}
                        />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Observações"
                      multiline
                      minRows={3}
                      value={orcamento.observacoes || ''}
                      onChange={(e) => setOrcamento((o) => ({ ...o, observacoes: e.target.value }))}
                      disabled={!editingPedido || !canEditPedido}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Condições de Pagamento"
                      multiline
                      minRows={3}
                      value={orcamento.condicoesPagamento || ''}
                      onChange={(e) =>
                        setOrcamento((o) => ({ ...o, condicoesPagamento: e.target.value }))
                      }
                      disabled={!editingPedido || !canEditPedido}
                    />
                  </Grid>
                  {emiteNotaRetroativa && (
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={notaRetroativa}
                            onChange={(e) => {
                              setNotaRetroativa(e.target.checked);
                              // Se desmarcar, remove a data
                              if (!e.target.checked) {
                                setOrcamento((o) => ({ ...o, dataCompetenciaNota: null }));
                              } else if (!orcamento.dataCompetenciaNota) {
                                // Se marcar e não tiver data, seta a atual
                                setOrcamento((o) => ({ 
                                  ...o, 
                                  dataCompetenciaNota: new Date().toISOString().split('T')[0] 
                                }));
                              }
                            }}
                            disabled={!editingPedido || !canEditPedido}
                          />
                        }
                        label="Nota Retroativa?"
                      />
                      {notaRetroativa && (
                        <TextField
                          fullWidth
                          type="date"
                          label="Data Competência da Nota"
                          value={
                            orcamento.dataCompetenciaNota 
                              ? new Date(orcamento.dataCompetenciaNota).toISOString().split('T')[0]
                              : new Date().toISOString().split('T')[0]
                          }
                          onChange={(e) =>
                            setOrcamento((o) => ({ ...o, dataCompetenciaNota: e.target.value }))
                          }
                          disabled={!editingPedido || !canEditPedido}
                          InputLabelProps={{ shrink: true }}
                          helperText="Data de competência para emissão da NFSe retroativa"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Stack
                      spacing={1}
                      alignItems={{ xs: 'stretch', sm: 'flex-end' }}
                      sx={{ mt: 2, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}
                    >
                      <Typography variant="body1">
                        Subtotal: <strong>{fCurrency(subtotal)}</strong>
                      </Typography>
                      <Typography variant="h6">
                        Total: <strong>{fCurrency(total)}</strong>
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" justifyContent="flex-end">
                      <LoadingButton
                        loading={saving}
                        onClick={handleSalvar}
                        disabled={!editingPedido || !canEditPedido}
                        variant="contained"
                      >
                        Salvar
                      </LoadingButton>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>

              {nfseList && nfseList.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <Typography variant="h6">Notas Fiscais (NFSe)</Typography>
                      <Chip
                        size="small"
                        label={`${nfseList.length} ${nfseList.length === 1 ? 'nota' : 'notas'}`}
                      />
                    </Stack>
                    <Stack spacing={2}>
                      {nfseList.map((n, idx) => (
                        <Card key={n._id || `nf-${idx}`} variant="outlined" sx={{ p: 2 }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mb: 1 }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                size="small"
                                label={n.status}
                                color={
                                  n.status === 'emitida'
                                    ? 'success'
                                    : n.status === 'emitindo'
                                      ? 'warning'
                                      : n.status === 'cancelada' || n.status === 'negada'
                                        ? 'error'
                                        : 'default'
                                }
                                variant={n.status === 'emitindo' ? 'soft' : 'filled'}
                                icon={
                                  n.status === 'emitindo' ? (
                                    <CircularProgress size={12} />
                                  ) : undefined
                                }
                              />
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {n.createdAt || ''}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1}>
                              {n.linkNota && n.linkNota !== 'Processando...' && (
                                <Tooltip title="Abrir NFSe">
                                  <Button
                                    href={n.linkNota}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="outlined"
                                    size="small"
                                    startIcon={<Iconify icon="solar:document-text-bold" />}
                                  >
                                    Ver Nota
                                  </Button>
                                </Tooltip>
                              )}
                              {n.status === 'emitida' && (
                                <Tooltip title="Cancelar NFSe">
                                  <Button
                                    color="error"
                                    variant="outlined"
                                    size="small"
                                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                                    onClick={() => {
                                      setNfseToCancel(n);
                                      setCancelOpen(true);
                                    }}
                                  >
                                    Cancelar
                                  </Button>
                                </Tooltip>
                              )}
                            </Stack>
                          </Stack>

                          <Stack spacing={1.5}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                              <Stack direction="row" spacing={1} sx={{ minWidth: 200 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'text.secondary', textTransform: 'uppercase' }}
                                >
                                  Número
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                  {n.numeroNota || '-'}
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={1} sx={{ minWidth: 160 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'text.secondary', textTransform: 'uppercase' }}
                                >
                                  Série
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                  {n.serie || '-'}
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={1} sx={{ minWidth: 260 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'text.secondary', textTransform: 'uppercase' }}
                                >
                                  Código Verificação
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                  {n.codigoVerificacao || '-'}
                                </Typography>
                              </Stack>
                            </Stack>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                              <Stack direction="row" spacing={1} sx={{ minWidth: 220 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'text.secondary', textTransform: 'uppercase' }}
                                >
                                  Valor Serviços
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                  {fCurrency(n.valorServicos || 0)}
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={1} sx={{ minWidth: 200 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'text.secondary', textTransform: 'uppercase' }}
                                >
                                  Valor ISS
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                  {fCurrency(n.valorIss || 0)}
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={1} sx={{ minWidth: 220 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'text.secondary', textTransform: 'uppercase' }}
                                >
                                  Valor Líquido
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                  {fCurrency(n.valorLiquido || 0)}
                                </Typography>
                              </Stack>
                            </Stack>

                            {(() => {
                              const errorMsg =
                                n.eNotasErro || n.enotasErro || n.erro || n.mensagemErro;
                              return errorMsg ? (
                                <Alert severity="error" sx={{ mt: 1 }}>
                                  {errorMsg}
                                </Alert>
                              ) : null;
                            })()}
                          </Stack>
                        </Card>
                      ))}
                    </Stack>{' '}
                  </Box>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Dialog fullScreen open={viewOpen} onClose={() => setViewOpen(false)}>
          <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
            <DialogActions sx={{ p: 1.5 }}>
              <Button color="inherit" variant="contained" onClick={() => setViewOpen(false)}>
                Fechar
              </Button>
            </DialogActions>
            <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
              <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                <OrcamentoPDF orcamento={orcamento} settings={settings} />
              </PDFViewer>
            </Box>
          </Box>
        </Dialog>
        <Dialog fullScreen open={viewOpen} onClose={() => setViewOpen(false)}>
          <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
            <DialogActions sx={{ p: 1.5 }}>
              <Button color="inherit" variant="contained" onClick={() => setViewOpen(false)}>
                Fechar
              </Button>
            </DialogActions>
            <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
              <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                <OrcamentoPDF orcamento={orcamento} settings={settings} />
              </PDFViewer>
            </Box>
          </Box>
        </Dialog>

        <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} maxWidth="sm" fullWidth>
          <DialogActions sx={{ px: 2, pt: 2 }}>
            <Typography variant="h6" sx={{ flexGrow: 1, pl: 1 }}>
              Cancelar NFSe
            </Typography>
            <Button onClick={() => setCancelOpen(false)}>Fechar</Button>
          </DialogActions>
          <CardContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  fullWidth
                  label="Motivo do cancelamento"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  helperText="Descreva brevemente o motivo"
                />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Confirmar cancelamento"
                  value={confirmCancel ? 'Sim' : 'Não'}
                  InputProps={{ readOnly: true }}
                />
                <Button variant="outlined" onClick={() => setConfirmCancel((v) => !v)}>
                  {confirmCancel ? 'Desmarcar' : 'Confirmar'}
                </Button>
              </Stack>
              <LoadingButton
                color="error"
                variant="contained"
                loading={cancelLoading}
                disabled={!confirmCancel || !cancelReason}
                onClick={async () => {
                  try {
                    setCancelLoading(true);
                    const res = await cancelarNFSeInvoice({
                      nfseId: nfseToCancel?._id,
                      motivo: cancelReason,
                    });
                    if (res?.status === 200) {
                      toast.success('NFSe cancelada');
                      setNfseList((list) =>
                        list.map((n) =>
                          n._id === nfseToCancel?._id ? { ...n, status: 'cancelada' } : n
                        )
                      );
                      setCancelOpen(false);
                      setCancelReason('');
                      setConfirmCancel(false);
                    } else {
                      toast.error('Falha ao cancelar NFSe');
                    }
                  } catch (e) {
                    toast.error('Falha ao cancelar NFSe');
                  } finally {
                    setCancelLoading(false);
                  }
                }}
              >
                Cancelar NFSe
              </LoadingButton>
            </Stack>
          </CardContent>
        </Dialog>
      </motion.div>
    </LazyMotion>
  );
}
