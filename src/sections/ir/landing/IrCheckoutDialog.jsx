'use client';

import { QRCodeSVG } from 'qrcode.react';
import { CardPayment } from '@mercadopago/sdk-react';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Step from '@mui/material/Step';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Stepper from '@mui/material/Stepper';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import StepLabel from '@mui/material/StepLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { normalizePhoneToE164 } from 'src/utils/phone-e164';
import axiosInstance, { baseUrl, endpoints } from 'src/utils/axios';

import { iniciarCheckoutPublico } from 'src/actions/ir';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { PhoneInput } from 'src/components/phone-input';
import PixCopiaCola from 'src/components/ir/PixCopiaCola';
import BoletoLinhaDigitavel from 'src/components/ir/BoletoLinhaDigitavel';

// URL para download do PDF do boleto via codigoSolicitacao
const boletoUrl = `${baseUrl}contratos/cobrancas/faturas/`;

// ─── Helpers de máscara ───────────────────────────────────────────────────────

function maskCpf(v) {
  return v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskCep(v) {
  return v
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})/, '$1-$2');
}

// ─── Busca de CEP (ViaCEP) ────────────────────────────────────────────────────

async function buscarCep(cep) {
  const digits = cep.replace(/\D/g, '');
  if (digits.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    const data = await res.json();
    if (data.erro) return null;
    return {
      endereco: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      uf: data.uf || '',
    };
  } catch {
    return null;
  }
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const STEPS = ['Seus dados', 'Endereço', 'Pagamento', 'Confirmação'];

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const MODALIDADE_LABELS = {
  basica: 'Básica',
  intermediaria: 'Intermediária',
  completa: 'Completa',
};

const EMPTY_DADOS = {
  nome: '', cpfCnpj: '', email: '', telefone: '',
  cep: '', endereco: '', numero: '', bairro: '', cidade: '', uf: '',
  paymentType: 'pix',
};

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Dialog multi-step de checkout público de IR
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   plano: { modalidade: string, titulo: string, descricao: string, valorFinal: number|null, valorCheio: number|null } | null
 * }} props
 */
export default function IrCheckoutDialog({ open, onClose, plano }) {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [erroApi, setErroApi] = useState('');
  const [dados, setDados] = useState(EMPTY_DADOS);
  const [errors, setErrors] = useState({});
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [activePaymentTab, setActivePaymentTab] = useState('pix');
  const cepTimerRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Inicialização estável do Brick (evita remontagem e perda de token/CPF)
  const cardPaymentInitialization = useMemo(
    () =>
      plano?.valorFinal != null
        ? {
          amount: Number(plano.valorFinal),
          payer: {
            email: dados.email?.trim() || '',
            firstName: (dados.nome || '').trim().split(' ')[0] || '',
            lastName: (dados.nome || '').trim().split(' ').slice(1).join(' ') || '',
            identification: {
              type: 'CPF',
              number: (dados.cpfCnpj ?? '').replace(/\D/g, '') || '',
            },
          },
        }
        : null,
    [
      plano?.valorFinal,
      dados.email,
      dados.nome,
      dados.cpfCnpj,
    ]
  );

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleChange = useCallback((field, maskFn) => (e) => {
    const value = maskFn ? maskFn(e.target.value) : e.target.value;
    setDados((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));

    // Auto-preenchimento via ViaCEP quando campo for cep e tiver 8 dígitos
    if (field === 'cep') {
      const digits = value.replace(/\D/g, '');
      if (cepTimerRef.current) clearTimeout(cepTimerRef.current);
      if (digits.length === 8) {
        cepTimerRef.current = setTimeout(async () => {
          setBuscandoCep(true);
          const endereco = await buscarCep(digits);
          setBuscandoCep(false);
          if (endereco) {
            setDados((prev) => ({ ...prev, ...endereco }));
            setErrors((prev) => ({
              ...prev, endereco: '', bairro: '', cidade: '', uf: '',
            }));
          }
        }, 400);
      }
    }
  }, []);

  const handlePaymentType = (type) =>
    setDados((prev) => ({ ...prev, paymentType: type }));

  // ─── Validações por step ──────────────────────────────────────────────────

  const validateStep0 = () => {
    const e = {};
    if (!dados.nome.trim()) e.nome = 'Informe seu nome completo.';
    if (dados.cpfCnpj.replace(/\D/g, '').length < 11) e.cpfCnpj = 'CPF inválido.';
    if (!dados.email.includes('@')) e.email = 'E-mail inválido.';
    if (dados.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Telefone inválido.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validateStep1 = () => {
    const e = {};
    if (dados.cep.replace(/\D/g, '').length < 8) e.cep = 'CEP inválido.';
    if (!dados.endereco.trim()) e.endereco = 'Informe o logradouro.';
    if (!dados.numero.trim()) e.numero = 'Informe o número.';
    if (!dados.bairro.trim()) e.bairro = 'Informe o bairro.';
    if (!dados.cidade.trim()) e.cidade = 'Informe a cidade.';
    if (!dados.uf) e.uf = 'Selecione o estado.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  // ─── Navegação ────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (activeStep === 0 && !validateStep0()) return;
    if (activeStep === 1 && !validateStep1()) return;
    if (activeStep === 2) {
      handleSubmit();
      return;
    }
    setActiveStep((s) => s + 1);
  };

  const handleBack = () => setActiveStep((s) => s - 1);

  // ─── Submit ───────────────────────────────────────────────────────────────

  const buildCheckoutPayload = useCallback(
    (extra = {}) => ({
      modalidade: plano.modalidade,
      ano: plano.ano ?? 'IR2026',
      year: plano.year ?? 2026,
      paymentType: dados.paymentType,
      tipoPessoa: 'FISICA',
      nome: dados.nome.trim(),
      cpfCnpj: dados.cpfCnpj.replace(/\D/g, ''),
      email: dados.email.trim(),
      telefone: dados.telefone.replace(/\D/g, ''),
      cep: dados.cep.replace(/\D/g, ''),
      endereco: dados.endereco.trim(),
      numero: dados.numero.trim(),
      bairro: dados.bairro.trim(),
      cidade: dados.cidade.trim(),
      uf: dados.uf,
      ...extra,
    }),
    [plano, dados]
  );

  const handleSubmit = async () => {
    if (!plano) return;
    if (dados.paymentType === 'credit_card') return; // cartão é enviado pelo Brick (handleCardSubmit)
    setLoading(true);
    setErroApi('');
    try {
      const result = await iniciarCheckoutPublico(buildCheckoutPayload());
      const orderData = result.order || result;
      setOrder(orderData);
      setActivePaymentTab(orderData.paymentType || 'pix');
      setActiveStep(3);
    } catch (err) {
      const msg =
        (typeof err === 'string' ? err : err?.message)
        || 'Erro ao processar pagamento. Tente novamente.';
      setErroApi(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCardSubmit = useCallback(
    async (mpFormData) => {
      if (!plano) return;

      // Extrair dados do Brick: token, payment_method_id (visa, master, etc.), installments, issuer_id
      // O Brick pode enviar no 1º arg direto ou em formData; nomes em snake_case ou camelCase
      const raw = mpFormData && typeof mpFormData === 'object' ? mpFormData : {};
      if (process.env.NODE_ENV === 'development' && !raw.payment_method_id && !raw.paymentMethodId) {
        console.warn('[IR Checkout] CardPayment onSubmit – objeto recebido (para debug payment_method_id):', raw);
      }
      const token =
        raw.token ??
        raw.cardToken ??
        raw.formData?.token ??
        raw.formData?.cardToken;
      const paymentMethodId =
        raw.payment_method_id ??
        raw.paymentMethodId ??
        raw.formData?.payment_method_id ??
        raw.formData?.paymentMethodId ??
        raw.data?.payment_method_id ??
        raw.data?.paymentMethodId ??
        raw.detail?.payment_method_id ??
        raw.detail?.paymentMethodId ??
        '';
      const installments = raw.installments ?? raw.formData?.installments ?? 1;
      const issuerId =
        raw.issuer_id ?? raw.formData?.issuer_id ?? raw.issuerId ?? raw.formData?.issuerId ?? '';

      if (!token || typeof token !== 'string' || !token.trim()) {
        setErroApi('Token do cartão não foi gerado. Preencha todos os dados do cartão e tente novamente.');
        toast.error('Token do cartão não gerado. Verifique os dados do cartão.');
        return;
      }

      const paymentMethodIdStr =
        typeof paymentMethodId === 'string' ? paymentMethodId.trim() : String(paymentMethodId || '').trim();
      if (!paymentMethodIdStr) {
        setErroApi('Bandeira do cartão não foi identificada. Tente novamente ou use outro cartão.');
        toast.error('Dados do cartão incompletos. Preencha e envie novamente.');
        return;
      }

      // Garantir CPF válido no payload (evita erro no backend e "preencher novamente")
      const cpfDigits = dados.cpfCnpj?.replace(/\D/g, '') ?? '';
      if (cpfDigits.length < 11) {
        setErroApi('CPF é obrigatório para pagamento com cartão.');
        setErrors((prev) => ({ ...prev, cpfCnpj: 'Informe um CPF válido.' }));
        toast.error('Preencha o CPF nos seus dados pessoais.');
        return;
      }

      setLoading(true);
      setErroApi('');
      try {
        const cardPayload = {
          paymentType: 'credit_card',
          cardToken: token,
          card_token: token,
          token,
          installments,
          payment_method_id: paymentMethodIdStr,
          paymentMethodId: paymentMethodIdStr,
          ...(issuerId && { issuer_id: String(issuerId) }),
          // Objeto aninhado para backends que leem card.token / card.payment_method_id
          card: {
            token,
            cardToken: token,
            card_token: token,
            payment_method_id: paymentMethodIdStr,
            installments,
            ...(issuerId && { issuer_id: String(issuerId) }),
          },
        };
        const payload = buildCheckoutPayload(cardPayload);
        if (process.env.NODE_ENV === 'development') {
          console.info('[IR Checkout] Payload enviado (card):', {
            hasToken: Boolean(payload.token),
            hasCardToken: Boolean(payload.cardToken),
            payment_method_id: payload.payment_method_id,
            cardKeys: payload.card ? Object.keys(payload.card) : [],
          });
        }
        const result = await iniciarCheckoutPublico(payload);
        const orderData = result.order || result;
        setOrder(orderData);
        setActivePaymentTab('credit_card');
        setActiveStep(3);
      } catch (err) {
        const data = err?.response?.data;
        const msg =
          (typeof err === 'string' ? err : null)
          || data?.message
          || err?.message
          || 'Erro ao processar pagamento com cartão. Tente novamente.';
        if (process.env.NODE_ENV === 'development' && err?.response) {
          console.error('[IR Checkout] Erro da API:', err.response.status, data);
        }
        setErroApi(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [plano, dados, buildCheckoutPayload]
  );

  const handleClose = () => {
    if (loading) return;
    clearInterval(pollingIntervalRef.current);
    onClose();
    setTimeout(() => {
      setActiveStep(0);
      setOrder(null);
      setErroApi('');
      setErrors({});
      setDados(EMPTY_DADOS);
      setActivePaymentTab('pix');
    }, 300);
  };

  // ─── Polling de pagamento ─────────────────────────────────────────────────
  useEffect(() => {
    if (!order?._id) return undefined;
    const needsPolling =
      (order.paymentType === 'pix' && !order.pixCopiaECola) ||
      (order.paymentType === 'boleto' && !order.linhaDigitavel);
    if (!needsPolling) return undefined;

    let attempts = 0;
    const intervalMs = order.paymentType === 'pix' ? 3000 : 5000;

    pollingIntervalRef.current = setInterval(async () => {
      attempts += 1;
      if (attempts < 10) {
        try {
          const res = await axiosInstance.get(endpoints.ir.publicOrder(order._id), {
            headers: { Authorization: '' },
          });
          const updated = res.data?.order || res.data;
          const hasData =
            (order.paymentType === 'pix' && updated.pixCopiaECola) ||
            (order.paymentType === 'boleto' && updated.linhaDigitavel);
          if (hasData) {
            setOrder((prev) => ({ ...prev, ...updated }));
            clearInterval(pollingIntervalRef.current);
          }
        } catch {
          // continuar tentando
        }
      } else {
        clearInterval(pollingIntervalRef.current);
      }
    }, intervalMs);

    return () => clearInterval(pollingIntervalRef.current);
  }, [order?._id, order?.paymentType]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Render ───────────────────────────────────────────────────────────────

  const nomeModalidade = plano ? (MODALIDADE_LABELS[plano.modalidade] ?? plano.modalidade) : '';

  const isStepPagamentoOuConfirmacao = activeStep >= 2;
  const modalSize = isStepPagamentoOuConfirmacao ? 'lg' : 'md';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={modalSize}
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      {/* Cabeçalho */}
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'common.white',
          position: 'relative',
        }}
      >
        <IconButton
          onClick={handleClose}
          disabled={loading}
          size="small"
          sx={{ position: 'absolute', top: 12, right: 12, color: 'common.white' }}
        >
          <Iconify icon="eva:close-fill" />
        </IconButton>

        <Typography variant="h6" fontWeight={700}>
          Contratar Declaração IR 2026
        </Typography>

        {plano && (
          <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
            {plano.titulo ?? `Plano ${nomeModalidade}`}
            {plano.valorFinal != null ? ` — R$ ${plano.valorFinal.toFixed(2).replace('.', ',')}` : ''}
          </Typography>
        )}

        <Stepper
          activeStep={activeStep}
          sx={{
            mt: 2,
            '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.65)', fontSize: 11 },
            '& .MuiStepLabel-label.Mui-active': { color: 'common.white', fontWeight: 700 },
            '& .MuiStepLabel-label.Mui-completed': { color: 'rgba(255,255,255,0.85)' },
            // Círculo inativo: borda branca translúcida, fundo quase invisível
            '& .MuiStepIcon-root': { color: 'rgba(255,255,255,0.2)' },
            // Número inativo: visível sobre fundo escuro
            '& .MuiStepIcon-text': { fill: 'rgba(255,255,255,0.85)', fontWeight: 700 },
            // Círculo ativo: branco sólido
            '& .MuiStepIcon-root.Mui-active': { color: 'common.white' },
            // Número do step ativo: cor primária (contraste com círculo branco)
            '& .MuiStepIcon-root.Mui-active .MuiStepIcon-text': { fill: theme.palette.primary.dark },
            // Círculo concluído: branco com leve transparência
            '& .MuiStepIcon-root.Mui-completed': { color: 'rgba(255,255,255,0.85)' },
            '& .MuiStepConnector-line': { borderColor: 'rgba(255,255,255,0.2)' },
          }}
        >
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ pt: 3 }}>

        {/* ── Step 0: Dados pessoais ─────────────────────────────────────────── */}
        {activeStep === 0 && (
          <Stack spacing={2.5}>
            <Typography variant="body2" color="text.secondary">
              Preencha os dados de quem irá constar na declaração de IR.
            </Typography>
            <TextField
              label="Nome completo *"
              value={dados.nome}
              onChange={handleChange('nome')}
              error={!!errors.nome}
              helperText={errors.nome}
              fullWidth
              autoFocus
            />
            <TextField
              label="CPF *"
              value={dados.cpfCnpj}
              onChange={handleChange('cpfCnpj', maskCpf)}
              error={!!errors.cpfCnpj}
              helperText={errors.cpfCnpj}
              placeholder="000.000.000-00"
              inputProps={{ inputMode: 'numeric' }}
              fullWidth
            />
            <TextField
              required
              label="E-mail"
              type="email"
              value={dados.email}
              onChange={handleChange('email')}
              error={!!errors.email}
              helperText={errors.email || 'Você receberá o link de acesso por aqui'}
              fullWidth
            />
            <PhoneInput
              required
              country="BR"
              label="WhatsApp / Telefone"
              value={normalizePhoneToE164(dados.telefone) || ''}
              onChange={(newValue) => {
                setDados((prev) => ({ ...prev, telefone: newValue ?? '' }));
                setErrors((prev) => ({ ...prev, telefone: '' }));
              }}
              error={!!errors.telefone}
              helperText={errors.telefone || 'Para confirmação de pagamento e atualizações'}
              placeholder="Digite seu WhatsApp"
              fullWidth
            />
          </Stack>
        )}

        {/* ── Step 1: Endereço (obrigatório para emissão de boleto/PIX pelo Inter) ── */}
        {activeStep === 1 && (
          <Stack spacing={2.5}>
            <Typography variant="body2" color="text.secondary">
              Endereço de cobrança — necessário para emissão do pagamento.
            </Typography>

            <Stack direction="row" spacing={1.5}>
              <TextField
                required
                label="CEP"
                value={dados.cep}
                onChange={handleChange('cep', maskCep)}
                error={!!errors.cep}
                helperText={errors.cep || (buscandoCep ? 'Buscando endereço...' : '')}
                placeholder="00000-000"
                inputProps={{ inputMode: 'numeric' }}
                sx={{ width: 160 }}
                InputProps={{
                  endAdornment: buscandoCep ? (
                    <InputAdornment position="end">
                      <CircularProgress size={16} />
                    </InputAdornment>
                  ) : dados.cep.replace(/\D/g, '').length === 8 ? (
                    <InputAdornment position="end">
                      <Iconify icon="eva:checkmark-circle-2-fill" width={18} color="success.main" />
                    </InputAdornment>
                  ) : null,
                }}
              />
              <TextField
                label="Logradouro *"
                value={dados.endereco}
                onChange={handleChange('endereco')}
                error={!!errors.endereco}
                helperText={errors.endereco}
                fullWidth
              />
            </Stack>

            <Stack direction="row" spacing={1.5}>
              <TextField
                label="Número *"
                value={dados.numero}
                onChange={handleChange('numero')}
                error={!!errors.numero}
                helperText={errors.numero}
                sx={{ width: 120 }}
              />
              <TextField
                label="Bairro *"
                value={dados.bairro}
                onChange={handleChange('bairro')}
                error={!!errors.bairro}
                helperText={errors.bairro}
                fullWidth
              />
            </Stack>

            <Stack direction="row" spacing={1.5}>
              <TextField
                label="Cidade *"
                value={dados.cidade}
                onChange={handleChange('cidade')}
                error={!!errors.cidade}
                helperText={errors.cidade}
                fullWidth
              />
              <TextField
                select
                label="UF *"
                value={dados.uf}
                onChange={handleChange('uf')}
                error={!!errors.uf}
                helperText={errors.uf}
                sx={{ width: 100 }}
              >
                {ESTADOS_BR.map((uf) => (
                  <MenuItem key={uf} value={uf}>{uf}</MenuItem>
                ))}
              </TextField>
            </Stack>
          </Stack>
        )}

        {/* ── Step 2: Forma de pagamento ────────────────────────────────────── */}
        {activeStep === 2 && (
          <Stack spacing={2.5}>
            <Typography variant="body2" color="text.secondary">
              Escolha como prefere pagar.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap">
              {[
                { value: 'pix', label: 'PIX', icon: 'eva:flash-fill', desc: 'Aprovação imediata' },
                { value: 'boleto', label: 'Boleto', icon: 'eva:file-text-outline', desc: 'Vence em 3 dias úteis' },
                { value: 'credit_card', label: 'Cartão', icon: 'eva:credit-card-outline', desc: 'Parcelado', emBreve: false },
              ].map((opt) => (
                <Box
                  key={opt.value}
                  onClick={() => !opt.emBreve && handlePaymentType(opt.value)}
                  sx={{
                    flex: 1,
                    minWidth: 120,
                    p: 2,
                    border: '2px solid',
                    borderColor: dados.paymentType === opt.value ? 'primary.main' : 'divider',
                    borderRadius: 1.5,
                    cursor: opt.emBreve ? 'not-allowed' : 'pointer',
                    opacity: opt.emBreve ? 0.7 : 1,
                    bgcolor: dados.paymentType === opt.value
                      ? alpha(theme.palette.primary.main, 0.06)
                      : 'transparent',
                    transition: 'all 0.15s',
                    '&:hover': opt.emBreve ? {} : { borderColor: 'primary.light' },
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Iconify
                      icon={opt.icon}
                      width={24}
                      color={dados.paymentType === opt.value ? 'primary.main' : 'text.secondary'}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight={dados.paymentType === opt.value ? 700 : 400}>
                        {opt.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{opt.desc}</Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>

            {erroApi && <Alert severity="error">{erroApi}</Alert>}

            {/* Brick Mercado Pago — cartão: token + installments enviados no checkout */}
            {dados.paymentType === 'credit_card' && cardPaymentInitialization && (
              <Box sx={{ mt: 2, minHeight: 340 }}>
                <CardPayment
                  key="ir-card-payment-brick"
                  initialization={cardPaymentInitialization}
                  customization={{ paymentMethods: { maxInstallments: 4, minInstallments: 1 } }}
                  onSubmit={handleCardSubmit}
                  onError={(err) => {
                    setErroApi(err?.message || 'Erro no formulário do cartão.');
                    toast.error('Verifique os dados do cartão.');
                  }}
                />
              </Box>
            )}

            {/* Resumo do pedido */}
            {plano && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.success.main, 0.06),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.success.main, 0.2),
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2">{plano.titulo ?? `Plano ${nomeModalidade}`}</Typography>
                    <Typography variant="caption" color="text.secondary">{plano.descricao}</Typography>
                  </Box>
                  {plano.valorFinal != null ? (
                    <Stack alignItems="flex-end">
                      {plano.valorCheio != null && plano.valorCheio > plano.valorFinal && (
                        <Typography variant="caption" color="text.disabled" sx={{ textDecoration: 'line-through' }}>
                          R$ {plano.valorCheio.toFixed(2).replace('.', ',')}
                        </Typography>
                      )}
                      <Typography variant="h5" color="primary.main" fontWeight={700}>
                        R$ {plano.valorFinal.toFixed(2).replace('.', ',')}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">Consulte valores</Typography>
                  )}
                </Stack>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  {dados.nome} · {dados.email}
                </Typography>
              </Box>
            )}
          </Stack>
        )}

        {/* ── Step 3: Pagamento ─────────────────────────────────────────────── */}
        {activeStep === 3 && order && (
          <Stack spacing={3} sx={{ pb: 3 }}>

            {/* Cabeçalho de sucesso */}
            <Stack alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 56, height: 56, borderRadius: '50%',
                  bgcolor: alpha(theme.palette.success.main, 0.12),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Iconify icon="eva:checkmark-circle-2-fill" width={32} color="success.main" />
              </Box>
              <Typography variant="h6" textAlign="center">Pedido criado com sucesso!</Typography>
              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                {order.valor && (
                  <Chip
                    label={`R$ ${Number(order.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    color="primary"
                    size="small"
                  />
                )}
                {order.modalidade && (
                  <Chip
                    label={{ basica: 'IR Básica', intermediaria: 'IR Intermediária', completa: 'IR Completa' }[order.modalidade] ?? order.modalidade}
                    variant="outlined"
                    size="small"
                  />
                )}
              </Stack>
            </Stack>

            {/* Tabs de método (exibidas somente quando o alternativo também está disponível; não para cartão) */}
            {activePaymentTab !== 'credit_card' &&
              ((activePaymentTab === 'pix' && order.linhaDigitavel) ||
                (activePaymentTab === 'boleto' && order.pixCopiaECola)) && (
                <Tabs
                  value={activePaymentTab}
                  onChange={(_, v) => setActivePaymentTab(v)}
                  sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab
                    value="pix"
                    label="PIX"
                    icon={<Iconify icon="eva:flash-fill" width={16} />}
                    iconPosition="start"
                  />
                  <Tab
                    value="boleto"
                    label="Boleto"
                    icon={<Iconify icon="eva:file-text-outline" width={16} />}
                    iconPosition="start"
                  />
                </Tabs>
              )}

            {/* Conteúdo: Cartão (sucesso) */}
            {activePaymentTab === 'credit_card' && (
              <Alert severity="success" icon={<Iconify icon="eva:credit-card-outline" width={24} />}>
                <Typography variant="body2">
                  Pagamento com cartão processado. Em instantes você receberá a confirmação por e-mail e WhatsApp.
                </Typography>
              </Alert>
            )}

            {/* Conteúdo: PIX */}
            {activePaymentTab === 'pix' && (
              order.pixCopiaECola ? (
                <Box
                  sx={{
                    p: 2.5, borderRadius: 2,
                    border: '2px solid', borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                  }}
                >
                  <Stack spacing={2} alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="eva:flash-fill" width={20} color="primary.main" />
                      <Typography variant="subtitle1" color="primary.main" fontWeight={700}>
                        Pague com PIX
                      </Typography>
                      <Chip label="Aprovação imediata" color="primary" size="small" variant="soft" />
                    </Stack>

                    <Box
                      sx={{
                        p: 2, bgcolor: '#fff', borderRadius: 2,
                        border: '1px solid', borderColor: 'divider',
                        display: 'inline-flex', boxShadow: 1,
                      }}
                    >
                      <QRCodeSVG value={order.pixCopiaECola} size={200} level="M" includeMargin={false} />
                    </Box>

                    <Typography variant="caption" color="text.secondary" textAlign="center">
                      Abra o app do seu banco → PIX → Ler QR Code
                    </Typography>

                    <Divider flexItem>
                      <Typography variant="caption" color="text.disabled">ou use o código</Typography>
                    </Divider>

                    <Box sx={{ width: '100%' }}>
                      <PixCopiaCola code={order.pixCopiaECola} />
                    </Box>
                  </Stack>
                </Box>
              ) : (
                <Alert severity="info" icon={<CircularProgress size={16} />}>
                  <Typography variant="body2">Gerando código PIX…</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Você também receberá o código por WhatsApp após a geração.
                  </Typography>
                </Alert>
              )
            )}

            {/* Conteúdo: Boleto */}
            {activePaymentTab === 'boleto' && (
              order.linhaDigitavel ? (
                <Box
                  sx={{
                    p: 2.5, borderRadius: 2,
                    border: '2px solid', borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="eva:file-text-outline" width={20} color="primary.main" />
                      <Typography variant="subtitle1" color="primary.main" fontWeight={700}>
                        Pague com Boleto
                      </Typography>
                      <Chip label="Vence em 3 dias úteis" size="small" variant="soft" />
                    </Stack>

                    <BoletoLinhaDigitavel code={order.linhaDigitavel} />

                    {order.codigoSolicitacao && (
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        startIcon={<Iconify icon="eva:download-outline" />}
                        href={`${boletoUrl}${order.codigoSolicitacao}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Baixar boleto PDF
                      </Button>
                    )}

                    <Typography variant="caption" color="text.disabled" textAlign="center">
                      Vencimento em até 3 dias úteis
                    </Typography>
                  </Stack>
                </Box>
              ) : (
                <Alert severity="info" icon={<CircularProgress size={16} />}>
                  <Typography variant="body2">Gerando boleto…</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Você também receberá os dados por WhatsApp após a geração.
                  </Typography>
                </Alert>
              )
            )}

            {/* Avisos */}
            {order.vinculadoAoPortal && (
              <Alert severity="success" icon={<Iconify icon="eva:person-fill" />}>
                Encontramos seu cadastro! O pedido já estará visível no seu portal após o login.
              </Alert>
            )}

            <Alert severity="info" icon={<Iconify icon="eva:message-circle-outline" />}>
              Após o pagamento enviaremos o link para envio de documentos para{' '}
              <strong>{dados.email}</strong> e WhatsApp <strong>{dados.telefone}</strong>.
            </Alert>

            <Button variant="contained" fullWidth size="large" onClick={handleClose}>
              Fechar
            </Button>
          </Stack>
        )}
      </DialogContent>

      {/* Rodapé de navegação (steps 0, 1 e 2). No step 2 com cartão, o envio é pelo Brick. */}
      {activeStep < 3 && (
        <Box sx={{ px: 3, pb: 3, pt: 1, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={activeStep === 0 ? handleClose : handleBack}
            disabled={loading}
          >
            {activeStep === 0 ? 'Cancelar' : 'Voltar'}
          </Button>
          {!(activeStep === 2 && dados.paymentType === 'credit_card') && (
            <LoadingButton
              variant="contained"
              onClick={handleNext}
              loading={loading}
              endIcon={
                activeStep === 2
                  ? <Iconify icon="eva:flash-fill" />
                  : <Iconify icon="eva:arrow-forward-fill" />
              }
            >
              {activeStep === 2 ? 'Confirmar e pagar' : 'Continuar'}
            </LoadingButton>
          )}
        </Box>
      )}
    </Dialog>
  );
}
