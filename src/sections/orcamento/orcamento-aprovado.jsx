'use client';

import { z } from 'zod';
import axios from 'axios';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { CardPayment } from '@mercadopago/sdk-react';

import {
  Box,
  Grid,
  Card,
  Chip,
  Radio,
  Stack,
  Alert,
  Button,
  Dialog,
  Divider,
  TextField,
  Typography,
  CardContent,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from '@mui/material';

import { normalizePhoneToE164 } from 'src/utils/phone-e164';
import { fCurrency, onlyDigits, formatCPFOrCNPJ, validateCPFOrCNPJ } from 'src/utils/format-number';

import { updateInvoice, criarPedidoCheckout, crirarPedidoOrcamento } from 'src/actions/invoices';

import { Iconify } from 'src/components/iconify';
import { PhoneInput } from 'src/components/phone-input';

import { CobrancaExistente } from './orcamento-cobranca';

// Função para remover formatação do CEP
const sanitizeCep = (cep) => cep.replace(/\D/g, '');

// Função para validar CPF ou CNPJ usando validação oficial
const validateCpfCnpj = (value) => validateCPFOrCNPJ(value);

// Schema de validação com Zod
const formDataSchema = z.object({
  nome: z.string().nonempty('Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  telefone: z.string().nonempty('Telefone é obrigatório'),
  cpfCnpj: z.string().refine(validateCpfCnpj, {
    message: 'Use um CPF ou CNPJ válido',
  }),
  cep: z.string().nonempty('CEP é obrigatório'),
  endereco: z.string().nonempty('Endereço é obrigatório'),
  numero: z.string().nonempty('Número é obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().nonempty('Cidade é obrigatória'),
  estado: z.string().nonempty('Estado é obrigatório'),
});

export function OrcamentoAprovado({
  invoice,
  paymentMethod,
  handlePaymentMethodChange,
  loading,
  updateInvoiceData, // Nova prop para atualizar a invoice
}) {
  const [pixGerado, setPixGerado] = useState(false);
  const [gerandoPix, setGerandoPix] = useState(false);
  const [cartaoDialogOpen, setCartaoDialogOpen] = useState(false);
  const enderecoInicial = invoice?.cliente?.endereco?.[0] || invoice?.endereco || {};
  const [method, setMethod] = useState(paymentMethod);
  const [errors, setErrors] = useState({});
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepNotFound, setCepNotFound] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    nome: invoice?.cliente?.nome || invoice?.lead?.nome || '',
    email: invoice?.cliente?.email || invoice?.lead?.email || '',
    telefone: normalizePhoneToE164(
      invoice?.cliente?.whatsapp || invoice?.cliente?.telefone || invoice?.lead?.telefone || ''
    ),
    cpfCnpj: formatCPFOrCNPJ(invoice?.cliente?.cnpj || invoice?.lead?.cpf || ''),
    cep: enderecoInicial?.cep || '',
    endereco: enderecoInicial?.rua || enderecoInicial?.endereco || '',
    numero: enderecoInicial?.numero || '',
    complemento: enderecoInicial?.complemento || '',
    bairro: enderecoInicial?.bairro || '',
    cidade: enderecoInicial?.cidade || '',
    estado: enderecoInicial?.estado || '',
  });

  const hasCobrancas = invoice?.cobrancas && Array.isArray(invoice.cobrancas) && invoice.cobrancas.length > 0;

  useEffect(() => {
  }, [invoice?.cobrancas?.length, invoice?._id]);

  if (hasCobrancas) {
    return (
      <CobrancaExistente 
        invoice={invoice}
        onPagamentoConfirmado={async (dadosPix) => {
          try {
            // Atualizar status da invoice para "pago"
            await updateInvoice(invoice._id, { status: 'pago' });
            await updateInvoiceData();
            toast.success('Pagamento PIX confirmado!');
          } catch (error) {
            console.error('Erro ao atualizar status:', error);
            await updateInvoiceData();
            toast.success('Pagamento PIX confirmado!');
          }
        }}
      />
    );
  }

  const handleChangeMethod = (event) => {
    setMethod(event.target.value);
    handlePaymentMethodChange(event);
  };

  const handleCepChange = async (event) => {
    const rawCep = event.target.value;
    const cep = sanitizeCep(rawCep);
    setFormData((prev) => ({ ...prev, cep: rawCep }));
    if (cep.length === 8) {
      setLoadingCep(true);
      setCepNotFound(false);
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        const { logradouro, localidade, uf, bairro, erro } = response.data;
        if (!erro) {
          setFormData((prevData) => ({
            ...prevData,
            endereco: logradouro,
            bairro: bairro || '',
            cidade: localidade,
            estado: uf,
          }));
          toast.success('Endereço atualizado com sucesso!');
        } else {
          setCepNotFound(true);
          toast.error('CEP não encontrado.');
        }
      } catch (error) {
        setCepNotFound(true);
        toast.error('Erro ao buscar endereço. Verifique o CEP e tente novamente.');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTelefoneChange = (newValue) => {
    setFormData((prev) => ({ ...prev, telefone: newValue ?? '' }));
  };

  const handleCpfCnpjChange = (event) => {
    const formatted = formatCPFOrCNPJ(event.target.value);
    setFormData((prev) => ({ ...prev, cpfCnpj: formatted }));
  };

  const handleFinalize = async () => {
    setIsCreating(true);
    
    // Se for PIX, gerar PIX junto com os dados do formulário
    if (method === 'pix') {
      setGerandoPix(true);
      try {
        // Validar formulário primeiro
        const validationResult = formDataSchema.safeParse(formData);
        if (!validationResult.success) {
          const newErrors = {};
          validationResult.error.errors.forEach((error) => {
            newErrors[error.path[0]] = error.message;
          });
          setErrors(newErrors);
          setIsCreating(false);
          setGerandoPix(false);
          return;
        }

        setErrors({});

        // Preparar dados do formulário com todos os dados necessários
        // Isso atualizará o cliente/lead e processará o pagamento PIX
        const dataInvoice = {
          paymentMethod: 'pix',
          forcarNovoPix: false, // Não forçar novo PIX se já existir um válido
          ...formData,
          cep: sanitizeCep(formData.cep),
          cpfCnpj: onlyDigits(formData.cpfCnpj),
          telefone: onlyDigits(formData.telefone),
        };

        console.log('📤 Enviando dados do formulário para checkout:', dataInvoice);

        // Criar pedido e gerar PIX em uma única chamada
        // A API irá: atualizar cliente/lead com os dados do formulário e gerar o PIX
        await crirarPedidoOrcamento(invoice._id, dataInvoice);

        // Atualizar invoice para refletir as mudanças
        await updateInvoiceData();

        toast.success('QR Code PIX gerado com sucesso!');
        setPixGerado(true);
      } catch (error) {
        console.error('Erro ao gerar PIX:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Erro ao gerar QR Code PIX';
        toast.error(errorMessage);
      } finally {
        setIsCreating(false);
        setGerandoPix(false);
      }
      return;
    }

    // Cartão de crédito — abre dialog com Brick Mercado Pago e chama nova API checkout
    if (method === 'credit_card') {
      const validationResult = formDataSchema.safeParse(formData);
      if (!validationResult.success) {
        const newErrors = {};
        validationResult.error.errors.forEach((error) => {
          newErrors[error.path[0]] = error.message;
        });
        setErrors(newErrors);
        setIsCreating(false);
        return;
      }
      setErrors({});
      setCartaoDialogOpen(true);
      setIsCreating(false);
      return;
    }

    // Para boleto e outros
    const validationResult = formDataSchema.safeParse(formData);
    if (!validationResult.success) {
      const newErrors = {};
      validationResult.error.errors.forEach((error) => {
        newErrors[error.path[0]] = error.message;
      });
      setErrors(newErrors);
      setIsCreating(false);
      return;
    }

    setErrors({}); // Clear errors if validation is successful

    try {
      const dataInvoice = {
        paymentMethod: method,
        ...formData,
        cep: sanitizeCep(formData.cep),
        cpfCnpj: onlyDigits(formData.cpfCnpj),
        telefone: onlyDigits(formData.telefone),
      };

      console.log("DADOS DA INVOICE PARA CRIAR PEDIDO", dataInvoice);
      await crirarPedidoOrcamento(invoice._id, dataInvoice);

      // Chamar a função de atualização da invoice
      await updateInvoiceData();

      toast.success('Pagamento processado com sucesso!');
    } catch (error) {
      toast.error('Erro ao processar pagamento');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Box sx={{ pt: { xs: 2, sm: 4 }, pb: { xs: 8, md: 10 }, px: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" align="center" sx={{ mb: 1, fontSize: { xs: '1.15rem', sm: '1.35rem' } }}>
        Pronto para simplificar sua contabilidade?
      </Typography>
      <Typography variant="h5" align="center" sx={{ mb: { xs: 3, md: 4 }, color: 'text.secondary', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        Conclua seu orçamento agora!
      </Typography>

      {/* Mobile: formulário primeiro, depois resumo. Desktop: form à esquerda, resumo à direita */}
      <Grid container spacing={{ xs: 3, md: 4 }} alignItems="flex-start">
        <Grid xs={12} md={8} sx={{ order: { xs: 1, md: 1 }, pr: { md: 3 } }}>
          <Card
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 4, md: 5 },
              borderRadius: 2,
              minHeight: 320,
            }}
          >
            <PaymentBillingAddress
              formData={formData}
              errors={errors}
              handleCepChange={handleCepChange}
              handleInputChange={handleInputChange}
              handleTelefoneChange={handleTelefoneChange}
              handleCpfCnpjChange={handleCpfCnpjChange}
              loadingCep={loadingCep}
              cepNotFound={cepNotFound}
            />
            <Box sx={{ mt: 4 }}>
              <PaymentMethods method={method} handleChangeMethod={handleChangeMethod} />
            </Box>
            {method === 'pix' && (
              <Alert severity="info" sx={{ mt: 3 }}>
                Clique em &quot;Finalizar pedido&quot; para gerar o QR Code PIX. O QR Code aparecerá na seção &quot;Detalhes da Cobrança&quot;.
              </Alert>
            )}
            {method === 'credit_card' && (
              <Alert severity="info" sx={{ mt: 3 }}>
                Clique em &quot;Finalizar pedido&quot; e preencha os dados do cartão na próxima tela. Parcelamento em até 4x.
              </Alert>
            )}
          </Card>
        </Grid>
        <Grid xs={12} md={4} sx={{ order: { xs: 2, md: 2 }, pl: { md: 2 } }}>
          <PaymentSummary invoice={invoice} handleFinalize={handleFinalize} isCreating={isCreating} gerandoPix={gerandoPix} method={method} />
        </Grid>
      </Grid>

      {/* Dialog cartão de crédito — nova API ms-me POST /api/checkout/:id/pedido */}
      <OrcamentoCartaoDialog
        open={cartaoDialogOpen}
        onClose={() => setCartaoDialogOpen(false)}
        invoice={invoice}
        formData={formData}
        onSuccess={async () => {
          await updateInvoiceData();
          setCartaoDialogOpen(false);
          toast.success('Pagamento com cartão processado!');
        }}
      />
    </Box>
  );
}

const fieldSxBase = { '& .MuiInputBase-root': { minHeight: 56 } };
const rowSpacing = 5;
const colGap = 4;

const rowStackSx = { width: '100%', '& > *': { flex: 1, minWidth: 0 } };

function PaymentBillingAddress({
  formData,
  errors,
  handleCepChange,
  handleInputChange,
  handleTelefoneChange,
  handleCpfCnpjChange,
  loadingCep,
  cepNotFound,
}) {
  const isFieldDisabled = loadingCep || (!cepNotFound && formData.endereco !== '');

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 4, fontSize: { xs: '1rem', sm: '1.125rem' } }}>
        Dados para cobrança
      </Typography>
      <Stack spacing={rowSpacing}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={colGap} sx={rowStackSx}>
          <TextField
            fullWidth
            label="Nome"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            error={!!errors.nome}
            helperText={errors.nome}
            variant="outlined"
            sx={fieldSxBase}
          />
          <TextField
            fullWidth
            label="E-mail"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            error={!!errors.email}
            helperText={errors.email}
            variant="outlined"
            sx={fieldSxBase}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={colGap} sx={rowStackSx}>
          <PhoneInput
            fullWidth
            country="BR"
            label="Telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleTelefoneChange}
            error={!!errors.telefone}
            helperText={errors.telefone}
            variant="outlined"
            sx={fieldSxBase}
          />
          <TextField
            fullWidth
            label="CPF/CNPJ"
            name="cpfCnpj"
            value={formData.cpfCnpj}
            onChange={handleCpfCnpjChange}
            error={!!errors.cpfCnpj}
            helperText={errors.cpfCnpj}
            inputProps={{ maxLength: 18 }}
            variant="outlined"
            sx={fieldSxBase}
          />
        </Stack>

        <Typography variant="subtitle2" sx={{ pt: 1, pb: 0.5, color: 'text.secondary' }}>
          Endereço
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={colGap} sx={rowStackSx}>
          <TextField
            fullWidth
            label="CEP"
            name="cep"
            value={formData.cep}
            onChange={handleCepChange}
            InputProps={{
              endAdornment: loadingCep && <CircularProgress size={20} />,
            }}
            error={!!errors.cep}
            helperText={errors.cep}
            inputProps={{ maxLength: 9 }}
            variant="outlined"
            sx={fieldSxBase}
          />
          <TextField
            fullWidth
            label="Endereço"
            name="endereco"
            value={formData.endereco}
            onChange={handleInputChange}
            disabled={isFieldDisabled}
            error={!!errors.endereco}
            helperText={errors.endereco}
            variant="outlined"
            sx={fieldSxBase}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={colGap} sx={rowStackSx}>
          <TextField
            fullWidth
            label="Número"
            name="numero"
            value={formData.numero}
            onChange={handleInputChange}
            error={!!errors.numero}
            helperText={errors.numero}
            variant="outlined"
            sx={fieldSxBase}
          />
          <TextField
            fullWidth
            label="Complemento"
            name="complemento"
            value={formData.complemento}
            onChange={handleInputChange}
            error={!!errors.complemento}
            helperText={errors.complemento}
            variant="outlined"
            sx={fieldSxBase}
          />
          <TextField
            fullWidth
            label="Bairro"
            name="bairro"
            value={formData.bairro}
            onChange={handleInputChange}
            disabled={isFieldDisabled}
            error={!!errors.bairro}
            helperText={errors.bairro}
            variant="outlined"
            sx={fieldSxBase}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={colGap} sx={rowStackSx}>
          <TextField
            fullWidth
            label="Cidade"
            name="cidade"
            value={formData.cidade}
            onChange={handleInputChange}
            disabled={isFieldDisabled}
            error={!!errors.cidade}
            helperText={errors.cidade}
            variant="outlined"
            sx={fieldSxBase}
          />
          <TextField
            fullWidth
            label="Estado"
            name="estado"
            value={formData.estado}
            onChange={handleInputChange}
            disabled={isFieldDisabled}
            error={!!errors.estado}
            helperText={errors.estado}
            variant="outlined"
            sx={fieldSxBase}
          />
        </Stack>
      </Stack>
    </Box>
  );
}

function PaymentMethods({ method, handleChangeMethod }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.125rem' } }}>
        Forma de pagamento
      </Typography>
      <Stack spacing={2}>
        <Card
          component="label"
          sx={{
            cursor: 'pointer',
            border: method === 'pix' ? 2 : 1,
            borderColor: method === 'pix' ? 'primary.main' : 'divider',
            backgroundColor: method === 'pix' ? 'action.selected' : 'background.paper',
            transition: 'all 0.2s ease-in-out',
            '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
          }}
          onClick={() => handleChangeMethod({ target: { value: 'pix' } })}
        >
          <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Radio checked={method === 'pix'} value="pix" onChange={handleChangeMethod} sx={{ p: 0, mt: 0.5 }} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} flex={1} flexWrap="wrap">
                <Iconify icon="solar:qr-code-bold" width={28} sx={{ color: 'primary.main' }} />
                <Stack flex={1} minWidth={0}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>PIX</Typography>
                    <Chip label="Recomendado" color="success" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Confirmação imediata • Sem taxas
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card
          component="label"
          sx={{
            cursor: 'pointer',
            border: method === 'boleto' ? 2 : 1,
            borderColor: method === 'boleto' ? 'primary.main' : 'divider',
            backgroundColor: method === 'boleto' ? 'action.selected' : 'background.paper',
            transition: 'all 0.2s ease-in-out',
            '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
          }}
          onClick={() => handleChangeMethod({ target: { value: 'boleto' } })}
        >
          <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Radio checked={method === 'boleto'} value="boleto" onChange={handleChangeMethod} sx={{ p: 0, mt: 0.5 }} />
              <Stack direction="row" spacing={1} alignItems="center" flex={1}>
                <Iconify icon="solar:document-text-bold" width={28} sx={{ color: 'text.secondary' }} />
                <Stack flex={1} minWidth={0}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Boleto bancário</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Vencimento em até 3 dias úteis
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card
          component="label"
          sx={{
            cursor: 'pointer',
            border: method === 'credit_card' ? 2 : 1,
            borderColor: method === 'credit_card' ? 'primary.main' : 'divider',
            backgroundColor: method === 'credit_card' ? 'action.selected' : 'background.paper',
            transition: 'all 0.2s ease-in-out',
            '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
          }}
          onClick={() => handleChangeMethod({ target: { value: 'credit_card' } })}
        >
          <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Radio checked={method === 'credit_card'} value="credit_card" onChange={handleChangeMethod} sx={{ p: 0, mt: 0.5 }} />
              <Stack direction="row" spacing={1} alignItems="center" flex={1}>
                <Iconify icon="eva:credit-card-outline" width={28} sx={{ color: 'text.secondary' }} />
                <Stack flex={1} minWidth={0}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Cartão de crédito</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Parcelado em até 4x • Mercado Pago
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

// Dialog cartão de crédito — nova API ms-me POST /api/checkout/:invoiceId/pedido com cardToken (Mercado Pago)
function OrcamentoCartaoDialog({ open, onClose, invoice, formData, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [brickError, setBrickError] = useState(null);
  const total = Number(invoice?.total) || (Array.isArray(invoice?.items) ? invoice.items : Array.isArray(invoice?.itens) ? invoice.itens : []).reduce(
    (s, i) => s + Number(i.preco || i.valor || 0) * (i.quantidade || 1),
    0
  );

  const handleSubmit = async (mpFormData) => {
    const token = mpFormData?.token ?? mpFormData?.formData?.cardToken;
    if (!invoice?._id || !token) return;
    setLoading(true);
    setBrickError(null);
    try {
      const paymentMethodId =
        mpFormData?.paymentMethodId ??
        mpFormData?.payment_method_id ??
        mpFormData?.formData?.paymentMethodId ??
        'visa';
      const installments = mpFormData?.installments ?? mpFormData?.formData?.installments ?? 1;

      await criarPedidoCheckout(invoice._id, {
        paymentMethod: 'credit_card',
        cardToken: token,
        card_token: token,
        installments,
        payment_method_id: String(paymentMethodId).trim() || 'visa',
        paymentMethodId: String(paymentMethodId).trim() || 'visa',
        cpfCnpj: onlyDigits(formData?.cpfCnpj) || mpFormData?.payer?.identification?.number?.replace(/\D/g, '') || '',
        nome: formData?.nome || mpFormData?.payer?.first_name || '',
        email: formData?.email || mpFormData?.payer?.email || '',
      });
      onSuccess?.();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Erro ao processar cartão';
      setBrickError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err) => {
    setBrickError(err?.message || 'Erro no formulário do cartão');
    toast.error('Verifique os dados do cartão.');
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="eva:credit-card-outline" width={24} />
          <Typography variant="h6">Pagamento com cartão</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pt: 1, pb: 3 }}>
        <Stack spacing={2} sx={{ pb: 2 }}>
          <Alert severity="info">
            Total: <strong>{fCurrency(total)}</strong> — Parcelamento em até 4x via Mercado Pago.
          </Alert>
          {brickError && <Alert severity="error">{brickError}</Alert>}
          {open && total > 0 && (
            <Box sx={{ minHeight: 320 }}>
              <CardPayment
                initialization={{
                  amount: total,
                  payer: {
                    email: formData?.email || '',
                    firstName: (formData?.nome || '').split(' ')[0] || '',
                    lastName: (formData?.nome || '').split(' ').slice(1).join(' ') || '',
                    identification: { type: 'CPF', number: onlyDigits(formData?.cpfCnpj) || '' },
                  },
                }}
                customization={{ paymentMethods: { maxInstallments: 4, minInstallments: 1 } }}
                onSubmit={handleSubmit}
                onError={handleError}
              />
            </Box>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function PaymentSummary({ invoice, handleFinalize, isCreating, gerandoPix, method }) {
  const itens = Array.isArray(invoice?.items) ? invoice.items : Array.isArray(invoice?.itens) ? invoice.itens : [];

  return (
    <Box
      sx={{
        p: { xs: 2.5, sm: 3, md: 4 },
        borderRadius: 2,
        bgcolor: 'background.neutral',
        position: { md: 'sticky' },
        top: { md: 24 },
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.125rem' } }}>
        Resumo do pedido
      </Typography>
      <Stack spacing={1.5} sx={{ mb: 2 }}>
        {itens.map((item, index) => (
          <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" sx={{ color: 'text.secondary', flex: 1, mr: 1 }} noWrap>
              {item.titulo}
            </Typography>
            <Typography variant="body2" sx={{ flexShrink: 0 }}>{fCurrency((item.preco || 0) * (item.quantidade || 0))}</Typography>
          </Stack>
        ))}
      </Stack>
      <Divider sx={{ borderStyle: 'dashed', my: 2 }} />

      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Subtotal</Typography>
          <Typography variant="body2">{fCurrency(invoice?.subTotal)}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Desconto</Typography>
          <Typography variant="body2" color="error.main">- {fCurrency(invoice?.desconto)}</Typography>
        </Stack>
        <Divider sx={{ borderStyle: 'dashed' }} />
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="subtitle1">Total</Typography>
          <Typography variant="subtitle1">{fCurrency(invoice?.total)}</Typography>
        </Stack>
      </Stack>

      <Button
        fullWidth
        size="large"
        variant="contained"
        sx={{ mt: 3, mb: 2, minHeight: 48 }}
        onClick={handleFinalize}
        disabled={isCreating || gerandoPix}
        startIcon={(isCreating || gerandoPix) ? <CircularProgress size={22} color="inherit" /> : undefined}
      >
        {gerandoPix ? 'Gerando QR Code PIX...' : isCreating ? 'Processando...' : 'Finalizar pedido'}
      </Button>

      <Stack alignItems="center" spacing={0.5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:shield-check-bold" sx={{ color: 'success.main', width: 20 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Pagamento seguro</Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
