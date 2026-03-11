'use client';

import { useState } from 'react';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { paths } from 'src/routes/paths';

import { getFullAssetUrl } from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';

import {
  useGetPedidoIrAdmin,
  alterarStatusIrAdmin,
  gerarAnaliseIaIrAdmin,
  atribuirResponsavelIr,
  uploadDocumentoIrAdmin,
  downloadDocumentoAdmin,
  notificarClienteIrAdmin,
  useGetUsuariosInternosIr,
  registrarPagamentoManualIr,
} from 'src/actions/ir';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import PixCopiaCola from 'src/components/ir/PixCopiaCola';
import IrStatusBadge from 'src/components/ir/IrStatusBadge';
import IrDocumentList from 'src/components/ir/IrDocumentList';
import IrStatusStepper from 'src/components/ir/IrStatusStepper';
import BoletoLinhaDigitavel from 'src/components/ir/BoletoLinhaDigitavel';

// ----------------------------------------------------------------------

/** Normaliza o texto da análise IA (quebras antes de títulos e listas). */
function normalizarTextoAnaliseIa(texto) {
  if (!texto || typeof texto !== 'string') return texto;
  let t = texto.trim();
  t = t.replace(/\s+\*\*(\d+\.)/g, '\n\n**$1');
  t = t.replace(/\s+\*\s+\*\*/g, '\n\n* **');
  t = t.replace(/\s+\*\s+([A-ZÀ-Ú])/g, '\n\n* $1');
  t = t.replace(/\s+(\d{1,2})\.\s+([A-ZÀ-Ú])/g, '\n\n$1. $2');
  t = t.replace(/\n{3,}/g, '\n\n');
  return t.trim();
}

/** Converte o texto da análise IA (markdown-like) em HTML seguro para exibição. */
function analiseIaTextoToHtml(texto) {
  if (!texto || typeof texto !== 'string') return '';
  const t = normalizarTextoAnaliseIa(texto);
  const esc = t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  const bold = esc.replace(/\*\*([^*]*?)\*\*/g, '<strong>$1</strong>');
  const blocks = bold.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  const listLine = (l) => /^[*-]\s/.test(l) || /^\d{1,2}\.\s/.test(l);
  const stripBullet = (l) => l.replace(/^[*-]\s*/, '').replace(/^\d{1,2}\.\s*/, '');

  const parts = blocks.map((block) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return '';
    if (lines.length === 1) return `<p>${block.replace(/\n/g, '<br/>')}</p>`;

    const allList = lines.every(listLine);
    if (allList) {
      const ordered = /^\d{1,2}\.\s/.test(lines[0]);
      const tag = ordered ? 'ol' : 'ul';
      const items = lines.map((l) => `<li>${stripBullet(l)}</li>`).join('');
      return `<${tag}>${items}</${tag}>`;
    }

    const firstListIdx = lines.findIndex(listLine);
    if (firstListIdx <= 0) return `<p>${block.replace(/\n/g, '<br/>')}</p>`;
    const para = lines.slice(0, firstListIdx).join('<br/>');
    const listLines = lines.slice(firstListIdx);
    const ordered = /^\d{1,2}\.\s/.test(listLines[0]);
    const tag = ordered ? 'ol' : 'ul';
    const items = listLines.map((l) => `<li>${stripBullet(l)}</li>`).join('');
    return `<p>${para}</p><${tag}>${items}</${tag}>`;
  });
  return parts.join('');
}

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_SIZE_MB = 15;

// Status disponíveis por estado atual (transições manuais)
function getStatusDisponiveis(statusAtual) {
  if (statusAtual === 'em_validacao') {
    return [
      { value: 'coletando_documentos', label: 'Reprovar (voltar para Enviando Documentos)' },
      { value: 'em_processo', label: 'Aprovar (ir para Em Processo)' },
    ];
  }
  if (statusAtual === 'coletando_documentos') {
    return [
      { value: 'em_validacao', label: 'Em Validação' },
      { value: 'em_processo', label: 'Em Processo' },
    ];
  }
  if (statusAtual === 'em_processo') {
    return [{ value: 'finalizada', label: 'Finalizado' }];
  }
  return [];
}

// Pedidos elegíveis para pagamento manual (fora do sistema)
const STATUS_PERMITE_PAGAMENTO_MANUAL = ['iniciada', 'pendente_pagamento'];

const FORMAS_PAGAMENTO = [
  { value: 'dinheiro', label: 'Dinheiro (em espécie)', icon: 'eva:credit-card-outline' },
  { value: 'transferencia', label: 'Transferência bancária', icon: 'eva:swap-outline' },
  { value: 'pix_manual', label: 'PIX (avulso)', icon: 'eva:flash-outline' },
  { value: 'cartao', label: 'Cartão (maquininha)', icon: 'eva:credit-card-fill' },
  { value: 'credit_card', label: 'Cartão (online)', icon: 'eva:credit-card-fill' },
  { value: 'boleto', label: 'Boleto', icon: 'eva:file-text-outline' }, 
  { value: 'pix', label: 'PIX', icon: 'eva:flash-fill' },
];

function formatData(isoString) {
  try {
    return format(parseISO(isoString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return '-';
  }
}


// ----------------------------------------------------------------------

// ─── Sub-componente: Card de Responsável ──────────────────────────────────────

function ResponsavelCard({
  order, usuariosInternos, responsavelSelecionado,
  setResponsavelSelecionado, salvandoResponsavel, onAtribuir,
}) {
  const theme = useTheme();
  const responsavelAtual = order?.responsavelId;
  const avatarUrl = responsavelAtual?.imgprofile
    ? getFullAssetUrl(responsavelAtual.imgprofile)
    : null;

  return (
    <Card>
      <CardHeader
        title="Responsável pelo declaração"
        subheader="Usuário interno do escritório responsável por esta declaração"
        avatar={<Iconify icon="eva:person-outline" width={24} color="primary.main" />}
      />
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          {/* Responsável atual */}
          <Grid xs={12} sm={5}>
            {responsavelAtual ? (
              <Stack direction="row" spacing={1.5} alignItems="center"
                sx={{
                  p: 1.5, borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                  border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.2),
                }}
              >
                <Avatar
                  src={avatarUrl}
                  alt={responsavelAtual.name}
                  sx={{ width: 40, height: 40 }}
                >
                  {responsavelAtual.name?.[0]}
                </Avatar>
                <Box flex={1} minWidth={0}>
                  <Typography variant="body2" fontWeight={700} noWrap>{responsavelAtual.name}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>{responsavelAtual.email}</Typography>
                </Box>
                <Tooltip title="Remover responsável">
                  <LoadingButton
                    size="small"
                    color="error"
                    loading={salvandoResponsavel}
                    onClick={() => onAtribuir(null)}
                    sx={{ minWidth: 0, p: 0.5 }}
                  >
                    <Iconify icon="eva:close-fill" width={16} />
                  </LoadingButton>
                </Tooltip>
              </Stack>
            ) : (
              <Stack direction="row" spacing={1} alignItems="center"
                sx={{
                  p: 1.5, borderRadius: 1.5,
                  bgcolor: 'background.neutral',
                  border: '1px dashed', borderColor: 'divider',
                }}
              >
                <Iconify icon="eva:person-outline" width={20} color="text.disabled" />
                <Typography variant="body2" color="text.disabled">Sem responsável atribuído</Typography>
              </Stack>
            )}
          </Grid>

          {/* Seletor de novo responsável */}
          <Grid xs={12} sm={5}>
            <FormControl fullWidth size="small">
              <InputLabel>
                {responsavelAtual ? 'Alterar responsável' : 'Atribuir responsável'}
              </InputLabel>
              <Select
                value={responsavelSelecionado}
                label={responsavelAtual ? 'Alterar responsável' : 'Atribuir responsável'}
                onChange={(e) => setResponsavelSelecionado(e.target.value)}
                renderValue={(val) => {
                  const u = usuariosInternos.find((x) => x._id === val);
                  return u ? u.name : '';
                }}
              >
                {usuariosInternos.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        src={u.imgprofile ? getFullAssetUrl(u.imgprofile) : null}
                        alt={u.name}
                        sx={{ width: 28, height: 28, fontSize: 12 }}
                      >
                        {u.name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{u.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                      </Box>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={2}>
            <LoadingButton
              variant="contained"
              fullWidth
              loading={salvandoResponsavel}
              disabled={!responsavelSelecionado}
              onClick={() => onAtribuir(responsavelSelecionado)}
              startIcon={<Iconify icon="eva:checkmark-fill" />}
            >
              Salvar
            </LoadingButton>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

// ─── View principal ───────────────────────────────────────────────────────────

export default function IrAdminDetalheView({ id }) {
  const router = useRouter();
  const { data: order, isLoading, error, mutate } = useGetPedidoIrAdmin(id);

  const [statusSelecionado, setStatusSelecionado] = useState('');
  const [nota, setNota] = useState('');
  const [salvandoStatus, setSalvandoStatus] = useState(false);

  const [tipoDocAdmin, setTipoDocAdmin] = useState('');
  const [arquivoAdmin, setArquivoAdmin] = useState(null);
  const [fileErrorAdmin, setFileErrorAdmin] = useState('');
  const [uploadingAdmin, setUploadingAdmin] = useState(false);

  const [tipoDocDeclaracao] = useState('declaracao');
  const [arquivoDeclaracao, setArquivoDeclaracao] = useState(null);
  const [arquivoRecibo, setArquivoRecibo] = useState(null);
  const [fileErrorRecibo, setFileErrorRecibo] = useState('');
  const [fileErrorDeclaracao, setFileErrorDeclaracao] = useState('');
  const [uploadingDeclaracao, setUploadingDeclaracao] = useState(false);
  const [confirmDeclaracaoOpen, setConfirmDeclaracaoOpen] = useState(false);

  const [mensagemNotificacao, setMensagemNotificacao] = useState('');
  const [enviandoNotificacao, setEnviandoNotificacao] = useState(false);

  const [responsavelSelecionado, setResponsavelSelecionado] = useState('');
  const [salvandoResponsavel, setSalvandoResponsavel] = useState(false);

  const [gerandoAnaliseIa, setGerandoAnaliseIa] = useState(false);

  const [pagManualOpen, setPagManualOpen] = useState(false);
  const [pagManualForma, setPagManualForma] = useState('');
  const [pagManualValor, setPagManualValor] = useState('');
  const [pagManualNota, setPagManualNota] = useState('');
  const [salvandoPagManual, setSalvandoPagManual] = useState(false);

  const { data: usuariosInternos } = useGetUsuariosInternosIr();

  // ─── Alterar status ──────────────────────────────────────────────────────────

  const handleAlterarStatus = async () => {
    if (!statusSelecionado) return;
    setSalvandoStatus(true);
    try {
      const result = await alterarStatusIrAdmin(id, statusSelecionado, nota || undefined);
      toast.success(result?.message || 'Status atualizado com sucesso!');
      setNota('');
      setStatusSelecionado('');
      mutate();
    } catch (err) {
      toast.error(err?.message || 'Erro ao atualizar status.');
    } finally {
      setSalvandoStatus(false);
    }
  };

  // ─── Upload de documento (admin) ────────────────────────────────────────────

  const handleFileAdminChange = (e) => {
    const file = e.target.files?.[0];
    setFileErrorAdmin('');
    setArquivoAdmin(null);
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileErrorAdmin('Formato inválido. Aceito: PDF, JPG, PNG.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileErrorAdmin(`Arquivo muito grande. Máximo: ${MAX_SIZE_MB}MB.`);
      return;
    }
    setArquivoAdmin(file);
  };

  const handleUploadAdmin = async (e) => {
    e.preventDefault();
    if (!tipoDocAdmin.trim() || !arquivoAdmin) return;
    setUploadingAdmin(true);
    try {
      const formData = new FormData();
      formData.append('file', arquivoAdmin);
      formData.append('tipo_documento', tipoDocAdmin.trim());
      const result = await uploadDocumentoIrAdmin(id, formData);
      toast.success('Documento enviado!');
      setTipoDocAdmin('');
      setArquivoAdmin(null);
      mutate({ order: result.order }, false);
    } catch (err) {
      toast.error(err?.message || 'Erro ao enviar documento.');
    } finally {
      setUploadingAdmin(false);
    }
  };

  // ─── Upload de declaração (finaliza pedido) ──────────────────────────────────

  const handleFileDeclaracaoChange = (e) => {
    const file = e.target.files?.[0];
    setFileErrorDeclaracao('');
    setArquivoDeclaracao(null);
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileErrorDeclaracao('Formato inválido. Aceito: PDF, JPG, PNG.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileErrorDeclaracao(`Arquivo muito grande. Máximo: ${MAX_SIZE_MB}MB.`);
      return;
    }
    setArquivoDeclaracao(file);
  };

  const handleFileReciboChange = (e) => {
    const file = e.target.files?.[0];
    setFileErrorRecibo('');
    setArquivoRecibo(null);
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileErrorRecibo('Formato inválido. Aceito: PDF, JPG, PNG.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileErrorRecibo(`Arquivo muito grande. Máximo: ${MAX_SIZE_MB}MB.`);
      return;
    }
    setArquivoRecibo(file);
  };

  const handleEntregarDeclaracao = async () => {
    if (!arquivoDeclaracao) return;
    setConfirmDeclaracaoOpen(false);
    setUploadingDeclaracao(true);
    try {
      if (arquivoRecibo) {
        const formDataRecibo = new FormData();
        formDataRecibo.append('file', arquivoRecibo);
        formDataRecibo.append('tipo_documento', 'recibo');
        await uploadDocumentoIrAdmin(id, formDataRecibo);
      }
      const formData = new FormData();
      formData.append('file', arquivoDeclaracao);
      formData.append('tipo_documento', tipoDocDeclaracao);
      const result = await uploadDocumentoIrAdmin(id, formData);
      toast.success('Declaração entregue! O cliente foi notificado via WhatsApp.');
      setArquivoDeclaracao(null);
      setArquivoRecibo(null);
      setFileErrorRecibo('');
      mutate({ order: result.order }, false);
    } catch (err) {
      toast.error(err?.message || 'Erro ao entregar declaração.');
    } finally {
      setUploadingDeclaracao(false);
    }
  };

  // ─── Pagamento manual ──────────────────────────────────────────────────────────

  const handlePagamentoManual = async () => {
    if (!pagManualForma) {
      toast.error('Selecione a forma de pagamento.');
      return;
    }
    setSalvandoPagManual(true);
    try {
      const result = await registrarPagamentoManualIr(id, {
        formaPagamento: FORMAS_PAGAMENTO.find((f) => f.value === pagManualForma)?.value,
        ...(pagManualValor ? { valor: parseFloat(pagManualValor) } : {}),
        ...(pagManualNota ? { nota: pagManualNota } : {}),
      });
      toast.success(result?.message || 'Pagamento registrado! Cliente notificado via WhatsApp.');
      setPagManualOpen(false);
      setPagManualForma('');
      setPagManualValor('');
      setPagManualNota('');
      mutate();
    } catch (err) {
      toast.error(err?.message || 'Erro ao registrar pagamento.');
    } finally {
      setSalvandoPagManual(false);
    }
  };

  // ─── Responsável ──────────────────────────────────────────────────────────────

  const handleAtribuirResponsavel = async (novoId) => {
    setSalvandoResponsavel(true);
    try {
      const result = await atribuirResponsavelIr(id, novoId || null);
      toast.success(novoId ? 'Responsável atribuído!' : 'Responsável removido.');
      setResponsavelSelecionado('');
      mutate({ order: result.order }, false);
    } catch (err) {
      toast.error(err?.message || 'Erro ao atribuir responsável.');
    } finally {
      setSalvandoResponsavel(false);
    }
  };

  // ─── Notificação WhatsApp ────────────────────────────────────────────────────

  const handleNotificar = async () => {
    if (!mensagemNotificacao.trim()) {
      toast.error('Digite uma mensagem para enviar.');
      return;
    }
    setEnviandoNotificacao(true);
    try {
      await notificarClienteIrAdmin(id, mensagemNotificacao.trim());
      toast.success('Mensagem enviada via WhatsApp!');
      setMensagemNotificacao('');
    } catch (err) {
      toast.error(err?.message || 'Erro ao enviar mensagem.');
    } finally {
      setEnviandoNotificacao(false);
    }
  };

  // ─── Análise por IA ───────────────────────────────────────────────────────────

  const handleGerarAnaliseIa = async () => {
    setGerandoAnaliseIa(true);
    try {
      const result = await gerarAnaliseIaIrAdmin(id);
      toast.success(result?.message || 'Análise por IA gerada com sucesso.');
      mutate({ order: { ...order, analiseIa: result.analiseIa } }, false);
    } catch (err) {
      const msg = err?.response?.status === 503
        ? 'Serviço de IA indisponível. Contate o suporte ou tente mais tarde.'
        : (err?.message || 'Erro ao gerar análise por IA.');
      toast.error(msg);
    } finally {
      setGerandoAnaliseIa(false);
    }
  };

  // ─── Download de documento ───────────────────────────────────────────────────

  const handleDownloadDoc = async (doc) => {
    try {
      await downloadDocumentoAdmin(id, doc.tipo_documento, doc.fileName);
    } catch (err) {
      toast.error(err?.message || 'Erro ao baixar documento.');
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Alert severity="error">
          {error?.status === 404 ? 'Pedido não encontrado.' : 'Erro ao carregar pedido.'}
        </Alert>
      </Container>
    );
  }

  const cliente = order.dadosComprador;
  const nomeCliente = cliente?.nome || '-';
  const emailCliente = cliente?.email || '-';
  const cpf = cliente?.cpfCnpj || '-';
  const telefone = cliente?.telefone || '-';


  // O admin pode alterar status de qualquer estado (exceto finalizada)
  // Alterar status normal (só em_processo e finalizada via API /status)
  const canChangeStatus = ['coletando_documentos', 'em_validacao', 'em_processo'].includes(order.status);
  const statusDisponiveis = getStatusDisponiveis(order.status);

  // Pagamento manual disponível para pedidos ainda não pagos
  const canPagamentoManual = STATUS_PERMITE_PAGAMENTO_MANUAL.includes(order.status);

  const canDeliverDeclaracao = order.status === 'em_processo';

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Stack spacing={3}>
        {/* Cabeçalho */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
          <Box>
            <Typography variant="h5">
              Pedido IR — {order.ano}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              #{order.codigoSolicitacao || order._id}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <IrStatusBadge status={order.status} size="medium" />
            <Typography variant="subtitle1" fontWeight={700}>
              {fCurrency(order.valor)}
            </Typography>
          </Stack>
        </Stack>

        {/* Stepper */}
        <Card>
          <CardContent>
            <IrStatusStepper status={order.status} historicoStatus={order.historicoStatus || []} />
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Bloco 1 — Informações */}
          <Grid xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardHeader title="Informações do pedido" />
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1}>
                    <Typography variant="body2" color="text.secondary" minWidth={100}>Cliente:</Typography>
                    <Typography variant="body2" fontWeight={500}>{nomeCliente}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Typography variant="body2" color="text.secondary" minWidth={100}>E-mail:</Typography>
                    <Typography variant="body2">{emailCliente}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Typography variant="body2" color="text.secondary" minWidth={100}>Ano:</Typography>
                    <Typography variant="body2">{order.ano} ({order.year})</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Typography variant="body2" color="text.secondary" minWidth={100}>Pagamento:</Typography>
                    <Chip
                      label={FORMAS_PAGAMENTO.find((f) => f.value === order.paymentType)?.label}
                      size="small"
                      variant="outlined"
                    />
                    <Iconify icon={FORMAS_PAGAMENTO.find((f) => f.value === order.paymentType)?.icon} width={22} color="primary.main" />
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Typography variant="body2" color="text.secondary" minWidth={100}>Criado em:</Typography>
                    <Typography variant="body2">{formatData(order.createdAt)}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Typography variant="body2" color="text.secondary" minWidth={100}>Atualizado:</Typography>
                    <Typography variant="body2">{formatData(order.updatedAt)}</Typography>
                  </Stack>
                </Stack>

                {(order.linhaDigitavel || order.pixCopiaECola) && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    {order.paymentType === 'boleto' && order.linhaDigitavel && (
                      <BoletoLinhaDigitavel code={order.linhaDigitavel} />
                    )}
                    {order.paymentType === 'pix' && order.pixCopiaECola && (
                      <PixCopiaCola code={order.pixCopiaECola} />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Bloco 2 — Histórico de status */}
          <Grid xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardHeader title="Histórico de status" />
              <CardContent>
                {order.historicoStatus?.length ? (
                  <Stack spacing={1.5}>
                    {order.historicoStatus.map((log, idx) => (
                      <Stack key={idx} direction="row" spacing={1.5} alignItems="flex-start">
                        <Iconify icon="eva:arrow-forward-fill" width={16} sx={{ mt: 0.4, flexShrink: 0, color: 'text.secondary' }} />
                        <Box>
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            <IrStatusBadge status={log.de} size="small" />
                            <Iconify icon="eva:arrow-forward-fill" width={14} color="text.secondary" />
                            <IrStatusBadge status={log.para} size="small" />
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {formatData(log.em)}
                            {log.nota && ` — ${log.nota}`}
                          </Typography>
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma transição registrada.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Bloco 3a — Registrar pagamento manual */}
        {canPagamentoManual && (
          <Card sx={{ border: '2px solid', borderColor: 'warning.main' }}>
            <CardHeader
              title="Pagamento recebido fora do sistema?"
              subheader="Use quando o cliente pagou em dinheiro, transferência bancária, PIX avulso ou cartão na maquininha."
              avatar={<Iconify icon="eva:credit-card-outline" width={24} color="warning.main" />}
              action={
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
                  onClick={() => setPagManualOpen(true)}
                >
                  Registrar pagamento
                </Button>
              }
            />
          </Card>
        )}

        {/* Bloco 3b — Alterar status (fluxo normal: coletando → em_processo → finalizada). Oculto em em_processo para forçar uso do "Entregar declaração". */}
        {canChangeStatus && !canDeliverDeclaracao && (
          <Card>
            <CardHeader
              title="Avançar status do pedido"
              subheader="Mova o pedido para a próxima etapa do fluxo de trabalho"
            />
            <CardContent>
              <Grid container spacing={2} alignItems="flex-start">
                <Grid xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Novo status</InputLabel>
                    <Select
                      value={statusSelecionado}
                      label="Novo status"
                      onChange={(e) => setStatusSelecionado(e.target.value)}
                    >
                      {statusDisponiveis.map((s) => (
                        <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={6}>
                  <TextField
                    label="Nota (opcional)"
                    placeholder="Ex: Documentos conferidos, iniciando elaboração"
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid xs={12} sm={2}>
                  <LoadingButton
                    variant="contained"
                    fullWidth
                    loading={salvandoStatus}
                    disabled={!statusSelecionado}
                    onClick={handleAlterarStatus}
                  >
                    Salvar
                  </LoadingButton>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Bloco 3c — Dados do formulário (sempre visível) */}
        <Card>
          <CardHeader
            title="Dados do formulário"
            subheader={
              order.formulario && (order.formulario.nome != null || order.formulario.email != null || order.formulario.declarouIrUltimoAno != null || (order.formulario.despesas && order.formulario.despesas.length > 0))
                ? (order.formulario.atualizadoEm
                    ? `Última atualização em ${formatData(order.formulario.atualizadoEm)}`
                    : order.formulario.preenchidoEm
                    ? `Preenchido em ${formatData(order.formulario.preenchidoEm)}`
                    : 'Preenchido pelo cliente no link de coleta')
                : 'O cliente ainda não preencheu o questionário pelo link de coleta.'
            }
            avatar={<Iconify icon="eva:file-text-fill" width={24} color="info.main" />}
          />
          <CardContent>
            {order.formulario && (order.formulario.nome != null || order.formulario.email != null || order.formulario.declarouIrUltimoAno != null || (order.formulario.despesas && order.formulario.despesas.length > 0)) ? (
              <Grid container spacing={2}>
                {/* Dados pessoais */}
                {(order.formulario.nome || order.formulario.email || order.formulario.telefone || order.formulario.dataNascimento) && (
                  <Grid xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Dados pessoais
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={2}>
                      {order.formulario.nome && (
                        <Box>
                          <Typography variant="caption" color="text.disabled" display="block">Nome</Typography>
                          <Typography variant="body2">{order.formulario.nome}</Typography>
                        </Box>
                      )}
                      {order.formulario.email && (
                        <Box>
                          <Typography variant="caption" color="text.disabled" display="block">E-mail</Typography>
                          <Typography variant="body2">{order.formulario.email}</Typography>
                        </Box>
                      )}
                      {order.formulario.telefone && (
                        <Box>
                          <Typography variant="caption" color="text.disabled" display="block">Telefone</Typography>
                          <Typography variant="body2">{order.formulario.telefone}</Typography>
                        </Box>
                      )}
                      {order.formulario.dataNascimento && (
                        <Box>
                          <Typography variant="caption" color="text.disabled" display="block">Nascimento</Typography>
                          <Typography variant="body2">
                            {(() => {
                              try {
                                return format(parseISO(order.formulario.dataNascimento), 'dd/MM/yyyy', { locale: ptBR });
                              } catch { return order.formulario.dataNascimento; }
                            })()}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                    <Divider sx={{ mt: 2, mb: 1 }} />
                  </Grid>
                )}

                {/* Perguntas sim/não */}
                {[
                  { field: 'declarouIrUltimoAno', label: 'Declarou IR no último ano' },
                  { field: 'possuiDependentes', label: 'Possui dependentes (filhos, cônjuge dependente, etc.)' },
                  { field: 'trabalhouAutonomo', label: 'Trabalhou como autônomo' },
                  { field: 'compraVendaBem', label: 'Compra ou venda de bem' },
                  { field: 'possuiContaBancaria', label: 'Conta bancária / aplicações' },
                  { field: 'possuiEmpresaExterior', label: 'Empresa no exterior' },
                  { field: 'enviouRemessaExterior', label: 'Remessa para o exterior' },
                  { field: 'possuiContaBancariaExterior', label: 'Conta bancária no exterior' },
                ].map(({ field, label }) => {
                  const val = order.formulario[field];
                  if (val === null || val === undefined) return null;
                  return (
                    <Grid key={field} xs={12} sm={6} md={4}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify
                          icon={val ? 'eva:checkmark-circle-fill' : 'eva:close-circle-fill'}
                          width={18}
                          color={val ? 'success.main' : 'text.disabled'}
                        />
                        <Typography variant="body2" color={val ? 'text.primary' : 'text.secondary'}>
                          {label}
                        </Typography>
                      </Stack>
                    </Grid>
                  );
                })}

                {/* Sub-pergunta: Emitiu nota como autônomo */}
                {(order.formulario.trabalhouAutonomo === true && (order.formulario.emitirNotaAutonomo === true || order.formulario.emitirNotaAutonomo === false)) && (
                  <Grid xs={12} sm={6} md={4}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify
                        icon={order.formulario.emitirNotaAutonomo ? 'eva:checkmark-circle-fill' : 'eva:close-circle-fill'}
                        width={18}
                        color={order.formulario.emitirNotaAutonomo ? 'success.main' : 'text.disabled'}
                      />
                      <Typography variant="body2" color={order.formulario.emitirNotaAutonomo ? 'text.primary' : 'text.secondary'}>
                        Emitiu Nota Fiscal ou recibo como autônomo
                      </Typography>
                    </Stack>
                  </Grid>
                )}

                {/* Cônjuge declara junto (pedidos antigos que tinham essa pergunta) */}
                {(order.formulario.conjugeDeclaraJunto === true || order.formulario.conjugeDeclaraJunto === false) && (
                  <Grid xs={12} sm={6} md={4}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify
                        icon={order.formulario.conjugeDeclaraJunto ? 'eva:checkmark-circle-fill' : 'eva:close-circle-fill'}
                        width={18}
                        color={order.formulario.conjugeDeclaraJunto ? 'success.main' : 'text.disabled'}
                      />
                      <Typography variant="body2" color={order.formulario.conjugeDeclaraJunto ? 'text.primary' : 'text.secondary'}>
                        Cônjuge/companheiro(a) também precisa declarar IR
                      </Typography>
                    </Stack>
                  </Grid>
                )}

                {/* Tipo de bem (compra/venda) */}
                {order.formulario.compraVendaBem === true && order.formulario.compraVendaBemTipo?.trim() && (
                  <Grid xs={12}>
                    <Box>
                      <Typography variant="caption" color="text.disabled" display="block">Tipo de bem (compra/venda)</Typography>
                      <Typography variant="body2">{order.formulario.compraVendaBemTipo}</Typography>
                    </Box>
                  </Grid>
                )}

                {/* Tipos de dependentes e detalhes */}
                {order.formulario.possuiDependentes === true && (order.formulario.dependentesTipos?.length > 0 || order.formulario.dependentesDetalhes) && (
                  <Grid xs={12}>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Detalhes dos dependentes
                    </Typography>
                    <Stack spacing={1.5}>
                      {order.formulario.dependentesTipos?.length > 0 && (
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                          {order.formulario.dependentesTipos.map((t) => (
                            <Chip
                              key={t}
                              size="small"
                              label={{ conjuge: 'Cônjuge', filhos: 'Filhos', pais: 'Pais' }[t] ?? t}
                              color="default"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      )}
                      {order.formulario.dependentesDetalhes && (
                        <Stack spacing={1.5}>
                          {Object.entries(order.formulario.dependentesDetalhes).map(([tipo, det]) => {
                            const isFilhos = tipo === 'filhos';
                            const filhosList = isFilhos && Array.isArray(det?.filhos) ? det.filhos : [];
                            const temFilhos = isFilhos && filhosList.length > 0;
                            const temOutros = !isFilhos && det && (det.declarar != null || det.cpf || det.cpfs);
                            if (!det || (!temFilhos && !temOutros)) return null;
                            const labelTipo = { conjuge: 'Cônjuge', filhos: 'Filhos', pais: 'Pais' }[tipo] ?? tipo;
                            return (
                              <Box key={tipo}>
                                <Typography variant="caption" color="text.disabled" display="block">{labelTipo}</Typography>
                                {isFilhos ? (
                                  <Stack spacing={1} sx={{ mt: 0.5 }}>
                                    {det.declarar != null && (
                                      <Typography variant="body2">Também declara IR: {det.declarar ? 'Sim' : 'Não'}</Typography>
                                    )}
                                    {filhosList.map((f, idx) => (
                                      <Box key={idx} sx={{ pl: 1, borderLeft: '2px solid', borderColor: 'divider' }}>
                                        <Typography variant="body2">
                                          Filho {idx + 1}: CPF {f.cpf || '—'}
                                          {f.dataNascimento && (() => {
                                            try {
                                              return ` · Nascimento ${format(parseISO(f.dataNascimento), 'dd/MM/yyyy', { locale: ptBR })}`;
                                            } catch { return ''; }
                                          })()}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Stack>
                                ) : (
                                  <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mt: 0.5 }}>
                                    {det.declarar != null && (
                                      <Typography variant="body2">Também declara IR: {det.declarar ? 'Sim' : 'Não'}</Typography>
                                    )}
                                    {(det.cpf || det.cpfs) && (
                                      <Typography variant="body2">CPF(s): {det.cpf || det.cpfs}</Typography>
                                    )}
                                  </Stack>
                                )}
                              </Box>
                            );
                          })}
                        </Stack>
                      )}
                    </Stack>
                  </Grid>
                )}

                {/* Solicitação específica */}
                {order.formulario.solicitacaoEspecifica?.trim() && (
                  <Grid xs={12}>
                    <Divider sx={{ my: 1.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.disabled" display="block">Solicitação ou observação específica</Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{order.formulario.solicitacaoEspecifica}</Typography>
                    </Box>
                  </Grid>
                )}

                {/* Despesas */}
                {order.formulario.despesas?.length > 0 && (
                  <Grid xs={12}>
                    <Divider sx={{ mb: 1.5 }} />
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Despesas informadas
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {order.formulario.despesas.map((d) => {
                        const LABELS = {
                          escola: 'Escola',
                          universidade: 'Universidade',
                          pos_graduacao: 'Pós Graduação',
                          internacao_hospitalar: 'Internação Hospitalar',
                          consulta_medica: 'Consulta Médica',
                          consulta_odontologica: 'Consulta Odontológica',
                          plano_saude: 'Plano de Saúde',
                          plano_previdencia: 'Plano de Previdência',
                          empregada_domestica: 'Empregada Doméstica',
                          pensao_alimenticia: 'Pensão Alimentícia',
                        };
                        return (
                          <Chip
                            key={d}
                            label={LABELS[d] ?? d}
                            size="small"
                            color="info"
                            variant="soft"
                            icon={<Iconify icon="eva:checkmark-fill" width={14} />}
                          />
                        );
                      })}
                    </Stack>
                  </Grid>
                )}
              </Grid>
            ) : (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Iconify icon="eva:file-text-outline" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  O cliente ainda não preencheu o questionário pelo link de coleta.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Bloco 3d — Análise por IA (Gemini) */}
        <Card sx={{ border: '1px solid', borderColor: 'primary.lighter' }}>
          <CardHeader
            title="Análise por IA"
            subheader={
              order.analiseIa?.geradoEm
                ? `Gerada em ${formatData(order.analiseIa.geradoEm)}${order.analiseIa.modelo ? ` · ${order.analiseIa.modelo}` : ''}`
                : 'Gera um resumo e sugestões para elaboração da declaração com base no formulário e documentos.'
            }
            avatar={<Iconify icon="eva:bulb-outline" width={24} color="primary.main" />}
            action={
              !order.analiseIa ? (
                <LoadingButton
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon="eva:sparkles-outline" width={18} />}
                  loading={gerandoAnaliseIa}
                  disabled={gerandoAnaliseIa}
                  onClick={handleGerarAnaliseIa}
                >
                  Gerar análise por IA
                </LoadingButton>
              ) : (
                <LoadingButton
                  variant="soft"
                  size="small"
                  startIcon={<Iconify icon="eva:refresh-outline" width={18} />}
                  loading={gerandoAnaliseIa}
                  disabled={gerandoAnaliseIa}
                  onClick={handleGerarAnaliseIa}
                >
                  Regenerar
                </LoadingButton>
              )
            }
          />
          <CardContent>
            {order.analiseIa?.texto ? (
              <Box
                className="analise-ia-html"
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: 'background.neutral',
                  border: '1px solid',
                  borderColor: 'divider',
                  typography: 'body2',
                  '& p': { mb: 1.5, mt: 0, '&:first-of-type': { mt: 0 }, '& + p': { mt: 1 } },
                  '& ul, & ol': { pl: 2.5, mb: 1.5, mt: 0.5 },
                  '& li': { mb: 0.5 },
                  '& strong': { fontWeight: 700 },
                }}
                dangerouslySetInnerHTML={{ __html: analiseIaTextoToHtml(order.analiseIa.texto) }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Clique em &quot;Gerar análise por IA&quot; para obter um resumo do perfil do contribuinte, pontos de atenção e sugestões para a elaboração da declaração.
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Bloco 4 — Documentos de entrega (destaque quando finalizada) */}
        {order.status === 'finalizada' && (order.documents || []).some((d) => d.tipo_documento === 'declaracao' || d.tipo_documento === 'recibo') && (
          <Card sx={{ border: '2px solid', borderColor: 'success.main', bgcolor: (t) => alpha(t.palette.success.main, 0.04) }}>
            <CardHeader
              title="Documentos de entrega"
              subheader="Declaração e recibo entregues ao cliente — acesso rápido para download"
              avatar={<Iconify icon="eva:download-outline" width={28} sx={{ color: 'success.main' }} />}
            />
            <CardContent>
              <Stack direction="row" flexWrap="wrap" gap={2}>
                {(order.documents || [])
                  .filter((d) => d.tipo_documento === 'declaracao' || d.tipo_documento === 'recibo')
                  .map((doc) => (
                    <Button
                      key={doc._id}
                      variant="contained"
                      color="success"
                      startIcon={<Iconify icon="eva:file-text-outline" width={20} />}
                      onClick={() => handleDownloadDoc(doc)}
                      sx={{ textTransform: 'none' }}
                    >
                      {doc.tipo_documento === 'declaracao' ? 'Declaração' : 'Recibo'} — {doc.fileName}
                    </Button>
                  ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Bloco 5 — Documentos do pedido */}
        <Card>
          <CardHeader
            title="Documentos do pedido"
            subheader={`${order.documents?.length ?? 0} documento(s)`}
          />
          <CardContent>
            <Stack spacing={3}>
              <IrDocumentList
                documents={order.documents || []}
                showDownload
                onDownload={handleDownloadDoc}
              />

              <Divider />

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Enviar documento (admin)
                </Typography>
                <Box component="form" onSubmit={handleUploadAdmin}>
                  <Grid container spacing={2} alignItems="flex-start">
                    <Grid xs={12} sm={5}>
                      <TextField
                        label="Tipo do documento"
                        placeholder='Ex: recibo, rascunho_declaracao'
                        value={tipoDocAdmin}
                        onChange={(e) => setTipoDocAdmin(e.target.value)}
                        fullWidth
                        size="small"
                        required
                        disabled={uploadingAdmin}
                      />
                    </Grid>
                    <Grid xs={12} sm={4}>
                      <Button
                        component="label"
                        variant="outlined"
                        size="small"
                        disabled={uploadingAdmin}
                        color={fileErrorAdmin ? 'error' : 'inherit'}
                        fullWidth
                      >
                        {arquivoAdmin ? arquivoAdmin.name : 'Selecionar arquivo'}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          hidden
                          onChange={handleFileAdminChange}
                        />
                      </Button>
                      {fileErrorAdmin && (
                        <Typography variant="caption" color="error" display="block">
                          {fileErrorAdmin}
                        </Typography>
                      )}
                    </Grid>
                    <Grid xs={12} sm={3}>
                      <LoadingButton
                        type="submit"
                        variant="contained"
                        size="small"
                        fullWidth
                        loading={uploadingAdmin}
                        disabled={!arquivoAdmin || !!fileErrorAdmin || !tipoDocAdmin}
                      >
                        Enviar
                      </LoadingButton>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Bloco 6 — Entregar declaração (em_processo) */}
        {canDeliverDeclaracao && (
          <Card sx={{ border: '2px solid', borderColor: 'warning.main' }}>
            <CardHeader
              title="Entregar declaração ao cliente"
              subheader="Anexe a declaração e o recibo (opcional). Ao enviar a declaração, o pedido é finalizado e o cliente recebe notificação via WhatsApp."
              avatar={
                <Iconify icon="eva:award-fill" width={28} sx={{ color: 'warning.main' }} />
              }
            />
            <CardContent>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Declaração (obrigatório)
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<Iconify icon="eva:attach-outline" />}
                      color={fileErrorDeclaracao ? 'error' : 'inherit'}
                      disabled={uploadingDeclaracao}
                    >
                      {arquivoDeclaracao
                        ? arquivoDeclaracao.name
                        : 'Selecionar declaração (PDF)'}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        hidden
                        onChange={handleFileDeclaracaoChange}
                      />
                    </Button>
                    {fileErrorDeclaracao && (
                      <Typography variant="caption" color="error">
                        {fileErrorDeclaracao}
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Recibo (opcional)
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<Iconify icon="eva:attach-outline" />}
                      color={fileErrorRecibo ? 'error' : 'inherit'}
                      disabled={uploadingDeclaracao}
                    >
                      {arquivoRecibo ? arquivoRecibo.name : 'Selecionar recibo (PDF)'}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        hidden
                        onChange={handleFileReciboChange}
                      />
                    </Button>
                    {fileErrorRecibo && (
                      <Typography variant="caption" color="error">
                        {fileErrorRecibo}
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <LoadingButton
                  variant="contained"
                  color="warning"
                  startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
                  loading={uploadingDeclaracao}
                  disabled={!arquivoDeclaracao || !!fileErrorDeclaracao || !!fileErrorRecibo}
                  onClick={() => setConfirmDeclaracaoOpen(true)}
                >
                  Entregar declaração e finalizar pedido
                </LoadingButton>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Bloco 7 — Responsável */}
        <ResponsavelCard
          order={order}
          usuariosInternos={usuariosInternos}
          responsavelSelecionado={responsavelSelecionado}
          setResponsavelSelecionado={setResponsavelSelecionado}
          salvandoResponsavel={salvandoResponsavel}
          onAtribuir={handleAtribuirResponsavel}
        />

        {/* Bloco 8 — Notificação WhatsApp */}
        <Card>
          <CardHeader
            title="Enviar mensagem ao cliente"
            subheader="Notificação manual via WhatsApp"
            avatar={<Iconify icon="eva:message-circle-outline" width={24} color="success.main" />}
          />
          <CardContent>
            <Stack spacing={2}>
              <TextField
                label="Mensagem"
                placeholder="Olá! Seu IR está quase pronto, aguarde..."
                value={mensagemNotificacao}
                onChange={(e) => setMensagemNotificacao(e.target.value)}
                fullWidth
                multiline
                rows={3}
                disabled={enviandoNotificacao}
              />
              <LoadingButton
                variant="contained"
                color="success"
                startIcon={<Iconify icon="eva:message-circle-fill" />}
                loading={enviandoNotificacao}
                disabled={!mensagemNotificacao.trim()}
                onClick={handleNotificar}
              >
                Enviar WhatsApp
              </LoadingButton>
            </Stack>
          </CardContent>
        </Card>

        <Button
          variant="text"
          startIcon={<Iconify icon="eva:arrow-back-outline" />}
          onClick={() => router.push(paths.dashboard.impostoRenda.root)}
        >
          Voltar para lista de pedidos
        </Button>
      </Stack>

      {/* Dialog — Registrar pagamento manual */}
      <Dialog
        open={pagManualOpen}
        onClose={() => { if (!salvandoPagManual) setPagManualOpen(false); }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Registrar pagamento manual</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} pt={1}>
            <DialogContentText>
              Informe como o cliente pagou. O pedido avançará automaticamente para{' '}
              <strong>Enviando Documentos</strong> e o cliente será notificado via WhatsApp.
            </DialogContentText>

            <FormControl fullWidth size="small" required>
              <InputLabel>Forma de pagamento *</InputLabel>
              <Select
                value={pagManualForma}
                label="Forma de pagamento *"
                onChange={(e) => setPagManualForma(e.target.value)}
              >
                {FORMAS_PAGAMENTO.map((f) => (
                  <MenuItem key={f.value} value={f.value}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Iconify icon={f.icon} width={18} color="text.secondary" />
                      <span>{f.label}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Valor recebido (R$)"
              type="number"
              value={pagManualValor}
              onChange={(e) => setPagManualValor(e.target.value)}
              size="small"
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
              helperText="Opcional — apenas para registro interno"
              InputProps={{
                startAdornment: (
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>R$</Typography>
                ),
              }}
            />

            <TextField
              label="Nota interna (opcional)"
              value={pagManualNota}
              onChange={(e) => setPagManualNota(e.target.value)}
              size="small"
              fullWidth
              multiline
              rows={2}
              placeholder="Ex: Cliente pagou presencialmente em 10/03/2026"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPagManualOpen(false)} disabled={salvandoPagManual}>
            Cancelar
          </Button>
          <LoadingButton
            variant="contained"
            color="warning"
            loading={salvandoPagManual}
            disabled={!pagManualForma}
            onClick={handlePagamentoManual}
            startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
          >
            Confirmar pagamento
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmação de entrega */}
      <Dialog open={confirmDeclaracaoOpen} onClose={() => setConfirmDeclaracaoOpen(false)}>
        <DialogTitle>Confirmar entrega da declaração?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ao confirmar, a declaração será enviada ao cliente e o pedido será marcado como{' '}
            <strong>Finalizado</strong>. O cliente receberá uma notificação via WhatsApp
            automaticamente. Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeclaracaoOpen(false)} disabled={uploadingDeclaracao}>
            Cancelar
          </Button>
          <LoadingButton
            variant="contained"
            color="warning"
            loading={uploadingDeclaracao}
            onClick={handleEntregarDeclaracao}
          >
            Confirmar entrega
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
