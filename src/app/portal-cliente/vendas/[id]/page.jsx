'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { Card, Chip, Stack, Button, MenuItem, TextField, Typography, CardContent, Tooltip, Skeleton, Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';

import { useEmpresa } from 'src/hooks/use-empresa';
import { useSettings } from 'src/hooks/useSettings';

import { fCurrency } from 'src/utils/format-number';

import { portalGetOrcamento, portalUpdateOrcamento, portalDownloadOrcamentoPDF, portalUpdateOrcamentoStatus } from 'src/actions/portal';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { SimplePaper } from 'src/components/paper/SimplePaper';

import { useAuthContext } from 'src/auth/hooks';
import { OrcamentoPDF } from 'src/sections/orcamento/orcamento-pdf';
import { criarNFSeOrcamento, getNfsesByOrcamento, cancelarNFSeInvoice } from 'src/actions/notafiscal';

export default function OrcamentoDetalhesPage({ params }) {
  const { id } = params;
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;
  const { empresaAtiva, loadingEmpresas } = useEmpresa(userId);
  const clienteProprietarioId = empresaAtiva;
  const { podeCriarOrcamentos, podeEmitirNFSe, settings } = useSettings();
  const router = useRouter();
  const theme = useTheme();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [orcamento, setOrcamento] = React.useState(null);
  const [status, setStatus] = React.useState('');
  const [viewOpen, setViewOpen] = React.useState(false);
  const [generatingNf, setGeneratingNf] = React.useState(false);
  const [nfseList, setNfseList] = React.useState([]);
  const [itemEdit, setItemEdit] = React.useState({ quantidade: 1, valorUnitario: 0, valorUnitarioText: fCurrency(0), desconto: 0, descontoText: fCurrency(0), descricao: '' });
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState('');
  const [confirmCancel, setConfirmCancel] = React.useState(false);
  const [cancelLoading, setCancelLoading] = React.useState(false);
  const [nfseToCancel, setNfseToCancel] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;

    const loadWithRetry = async (attempt = 0) => {
      if (!clienteProprietarioId || cancelled) return;
      try {
        const data = await portalGetOrcamento(clienteProprietarioId, id);
        if (cancelled) return;
        setOrcamento(data);
        setStatus(data?.status || 'pendente');
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

    return () => { cancelled = true; };
  }, [clienteProprietarioId, id]);

  if (loadingEmpresas || !clienteProprietarioId || loading) return (
    <SimplePaper>
      <Skeleton variant="text" width={220} height={32} sx={{ mb: 2 }} />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid xs={6} sm={4} md={2}><Skeleton variant="rounded" height={80} /></Grid>
        <Grid xs={6} sm={4} md={2}><Skeleton variant="rounded" height={80} /></Grid>
        <Grid xs={6} sm={4} md={2}><Skeleton variant="rounded" height={80} /></Grid>
        <Grid xs={6} sm={4} md={3}><Skeleton variant="rounded" height={80} /></Grid>
        <Grid xs={6} sm={4} md={3}><Skeleton variant="rounded" height={80} /></Grid>
      </Grid>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid xs={12} sm={4}><Skeleton variant="rounded" height={40} /></Grid>
            <Grid xs={12} sm={4}><Skeleton variant="rounded" height={40} /></Grid>
            <Grid xs={12} sm={4}><Skeleton variant="rounded" height={40} /></Grid>
          </Grid>
        </CardContent>
      </Card>
      <Stack spacing={2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={76} />
        ))}
      </Stack>
    </SimplePaper>
  );
  if (!orcamento) return <Typography>Orçamento não encontrado</Typography>;
  if (!podeCriarOrcamentos) return <Typography>Funcionalidade não disponível</Typography>;

  const hasNFSeAutorizada = Array.isArray(nfseList) && nfseList.some((n) => n.status === 'emitida' || String(n.eNotasStatus).toLowerCase() === 'autorizada');
  const canEdit = ['pendente', 'expirado', 'recusado'].includes(orcamento.status) && !hasNFSeAutorizada;

  const subtotal = (orcamento.itens || []).reduce((acc, it) => acc + (Number(it.quantidade) * Number(it.valorUnitario) - Number(it.desconto || 0)), 0);
  const total = subtotal - Number(orcamento.descontoGeral || 0);

  const handleSalvar = async () => {
    try {
      setSaving(true);
      await portalUpdateOrcamento(id, {
        clienteProprietarioId,
        observacoes: orcamento.observacoes,
        condicoesPagamento: orcamento.condicoesPagamento,
      });
      toast.success('Orçamento atualizado');
    } catch (e) {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const onlyDigits = (v) => (String(v || '')).replace(/\D/g, '');
  const formatBRLInput = (v) => {
    const d = onlyDigits(v);
    const n = Number(d) / 100;
    return { text: fCurrency(n), value: n };
  };

  const handleSalvarItens = async () => {
    try {
      setSaving(true);
      const base = (Array.isArray(orcamento.itens) && orcamento.itens.length) ? orcamento.itens[0] : {};
      const novoItem = {
        ...base,
        servicoId: base.servicoId,
        descricao: itemEdit.descricao,
        quantidade: Number(itemEdit.quantidade || 1),
        valorUnitario: Number(itemEdit.valorUnitario || 0),
        desconto: Number(itemEdit.desconto || 0),
      };
      await portalUpdateOrcamento(id, { clienteProprietarioId, itens: [novoItem] });
      setOrcamento((o) => ({ ...o, itens: [novoItem] }));
      toast.success('Itens atualizados');
    } catch (e) {
      toast.error('Erro ao salvar itens');
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async () => {
    try {
      setSaving(true);
      await portalUpdateOrcamentoStatus(id, { status, clienteProprietarioId });
      setOrcamento((o) => ({ ...o, status }));
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
        const placeholder = { status: 'emitindo', numeroNota: 'Processando...', serie: 'Processando...', codigoVerificacao: 'Processando...', linkNota: 'Processando...' };
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

  console.log('orcamento', orcamento);

  const hasNotaAtiva = Array.isArray(nfseList) && nfseList.some((n) => n.status === 'emitida' || n.status === 'emitindo');

  return (
    <SimplePaper>
      <Card sx={{ borderRadius: 3, mb: 2 }}>
        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Venda {orcamento.numero}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={orcamento.status} size="small" />
              <Typography variant="body2" sx={{ opacity: 0.7 }}>Cliente: {orcamento?.clienteDoClienteId?.nome}</Typography>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button onClick={() => setViewOpen(true)} variant="outlined" startIcon={<Iconify icon="solar:eye-bold" />}>Ver</Button>
            <PDFDownloadLink
              document={<OrcamentoPDF orcamento={orcamento} settings={settings} />}
              fileName={`${orcamento.numero || 'orcamento'}.pdf`}
              style={{ textDecoration: 'none' }}
            >
              {({ loading: pdfLoading }) => (
                <Button variant="outlined" startIcon={<Iconify icon="solar:document-text-bold" />}>
                  {pdfLoading ? 'Gerando...' : 'Baixar'}
                </Button>
              )}
            </PDFDownloadLink>
            {podeEmitirNFSe && !hasNotaAtiva && (
              <Button onClick={handleEmitirNFSe} variant="contained" startIcon={<Iconify icon="solar:bill-check-bold" />} disabled={generatingNf}>
                {generatingNf ? 'Emitindo...' : 'Emitir NFSe'}
              </Button>
            )}
          </Stack>
        </Box>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <Typography variant="subtitle2">Cliente</Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2">{orcamento?.clienteDoClienteId?.nome}</Typography>
                {orcamento?.clienteDoClienteId?.cpfCnpj && (
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                    {orcamento?.clienteDoClienteId?.cpfCnpj}
                  </Typography>
                )}
                {orcamento?.clienteDoClienteId?.email && (
                  <Typography variant="caption" color="text.secondary">{orcamento?.clienteDoClienteId?.email}</Typography>
                )}
                {(orcamento?.clienteDoClienteId?.telefone || orcamento?.clienteDoClienteId?.whatsapp) && (
                  <Typography variant="caption" color="text.secondary">
                    {orcamento?.clienteDoClienteId?.telefone || orcamento?.clienteDoClienteId?.whatsapp}
                  </Typography>
                )}
              </Stack>
            </Grid>
            <Grid xs={12} sm={6}>
              <Typography variant="subtitle2">Status</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={orcamento.status} />
                <TextField size="small" select value={status} onChange={(e) => setStatus(e.target.value)} disabled={!canEdit}>
                  <MenuItem value="pendente">pendente</MenuItem>
                  <MenuItem value="aprovado">aprovado</MenuItem>
                  <MenuItem value="recusado">recusado</MenuItem>
                  <MenuItem value="expirado">expirado</MenuItem>
                  <MenuItem value="pago">pago</MenuItem>
                </TextField>
                <LoadingButton loading={saving} onClick={handleStatus} disabled={!canEdit} variant="contained">Atualizar</LoadingButton>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>


      {/* Diálogo de Cancelamento */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} maxWidth="sm" fullWidth>
        <DialogActions sx={{ px: 2, pt: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, pl: 1 }}>Cancelar NFSe</Typography>
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
                  const res = await cancelarNFSeInvoice({ nfseId: nfseToCancel?._id, motivo: cancelReason });
                  if (res?.status === 200) {
                    toast.success('NFSe cancelada');
                    setNfseList((list) => list.map((n) => (n._id === nfseToCancel?._id ? { ...n, status: 'cancelada' } : n)));
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

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Item do Serviço</Typography>
          {canEdit ? (
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <TextField fullWidth label="Descrição" value={itemEdit.descricao} onChange={(e) => setItemEdit((s) => ({ ...s, descricao: e.target.value }))} />
              </Grid>
              <Grid xs={6} sm={2}>
                <TextField fullWidth type="number" label="Qtd" value={itemEdit.quantidade} onChange={(e) => setItemEdit((s) => ({ ...s, quantidade: Number(e.target.value || 0) }))} />
              </Grid>
              <Grid xs={6} sm={2}>
                <TextField fullWidth label="Vlr Unit" value={itemEdit.valorUnitarioText} onChange={(e) => { const { value, text } = formatBRLInput(e.target.value); setItemEdit((s) => ({ ...s, valorUnitario: value, valorUnitarioText: text })); }} />
              </Grid>
              <Grid xs={12} sm={2}>
                <TextField fullWidth label="Desconto" value={itemEdit.descontoText} onChange={(e) => { const { value, text } = formatBRLInput(e.target.value); setItemEdit((s) => ({ ...s, desconto: value, descontoText: text })); }} />
              </Grid>
              <Grid xs={12}>
                <Stack direction="row" justifyContent="flex-end">
                  <LoadingButton loading={saving} onClick={handleSalvarItens} variant="contained">Salvar Itens</LoadingButton>
                </Stack>
              </Grid>
            </Grid>
          ) : (
            <Stack spacing={1}>
              {(orcamento.itens || []).slice(0,1).map((it, i) => (
                <Stack key={i} direction="row" justifyContent="space-between">
                  <Typography variant="body2">{it.descricao || it?.servicoId?.nome}</Typography>
                  <Typography variant="body2">{it.quantidade} x {fCurrency(it.valorUnitario)} {it.desconto ? `(desc ${fCurrency(it.desconto)})` : ''}</Typography>
                </Stack>
              ))}
              {(Array.isArray(orcamento.itens) && orcamento.itens.length > 1) && (
                <Typography variant="caption" color="text.secondary">Apenas 1 item é permitido. Os demais itens não serão considerados.</Typography>
              )}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <TextField fullWidth label="Observações" multiline minRows={3} value={orcamento.observacoes || ''} onChange={(e) => setOrcamento((o) => ({ ...o, observacoes: e.target.value }))} disabled={!canEdit} />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField fullWidth label="Condições de Pagamento" multiline minRows={3} value={orcamento.condicoesPagamento || ''} onChange={(e) => setOrcamento((o) => ({ ...o, condicoesPagamento: e.target.value }))} disabled={!canEdit} />
            </Grid>
            <Grid xs={12}>
              <Stack direction="row" justifyContent="flex-end" spacing={3}>
                <Typography>Subtotal: {fCurrency(subtotal)}</Typography>
                <Typography>Total: {fCurrency(total)}</Typography>
              </Stack>
            </Grid>
          </Grid>
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <LoadingButton loading={saving} onClick={handleSalvar} disabled={!canEdit} variant="contained">Salvar</LoadingButton>
          </Stack>
        </CardContent>
      </Card>

      {/* Lista de NFSe após observações */}
      {nfseList && nfseList.length > 0 && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="solar:bill-list-bold" width={22} />
                <Typography variant="subtitle1">Nota Fiscal de Serviço (NFSe)</Typography>
              </Stack>
              <Chip size="small" label={`${nfseList.length} ${nfseList.length === 1 ? 'nota' : 'notas'}`} />
            </Stack>
            <Stack spacing={2}>
              {nfseList.map((n, idx) => (
                <Card key={n._id || `nf-${idx}`} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={n.status}
                        color={n.status === 'emitida' ? 'success' : n.status === 'emitindo' ? 'warning' : (n.status === 'cancelada' || n.status === 'negada') ? 'error' : 'default'}
                        variant={n.status === 'emitindo' ? 'soft' : 'filled'}
                        icon={n.status === 'emitindo' ? <CircularProgress size={12} /> : undefined}
                      />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{n.createdAt || ''}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      {n.linkNota && n.linkNota !== 'Processando...' && (
                        <Tooltip title="Abrir NFSe">
                          <Button href={n.linkNota} target="_blank" rel="noopener noreferrer" variant="outlined" size="small" startIcon={<Iconify icon="solar:document-text-bold" />}>
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
                            onClick={() => { setNfseToCancel(n); setCancelOpen(true); }}
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
                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>Número</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{n.numeroNota || '-'}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ minWidth: 160 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>Série</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{n.serie || '-'}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ minWidth: 260 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>Código Verificação</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{n.codigoVerificacao || '-'}</Typography>
                      </Stack>
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Stack direction="row" spacing={1} sx={{ minWidth: 220 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>Valor Serviços</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{fCurrency(n.valorServicos || 0)}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ minWidth: 200 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>Valor ISS</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{fCurrency(n.valorIss || 0)}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ minWidth: 220 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>Valor Líquido</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{fCurrency(n.valorLiquido || 0)}</Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
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
    </SimplePaper>
  );
}



