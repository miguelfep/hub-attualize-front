'use client';

import { z } from 'zod';
import axios from 'axios';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import {
  Box,
  Grid,
  Radio,
  Stack,
  Alert,
  Button,
  Divider,
  Container,
  TextField,
  Typography,
  RadioGroup,
  FormControl,
  FormControlLabel,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material';

import { fCurrency, onlyDigits, formatTelefone, formatCPFOrCNPJ, validateCPFOrCNPJ } from 'src/utils/format-number';

import { crirarPedidoOrcamento, updateInvoice } from 'src/actions/invoices';

import { Iconify } from 'src/components/iconify';

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
  const enderecoInicial = invoice?.cliente?.endereco?.[0] || invoice?.endereco || {};
  const [method, setMethod] = useState(paymentMethod);
  const [errors, setErrors] = useState({});
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepNotFound, setCepNotFound] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    nome: invoice?.cliente?.nome || invoice?.lead?.nome || '',
    email: invoice?.cliente?.email || invoice?.lead?.email || '',
    telefone: formatTelefone(invoice?.cliente?.whatsapp || invoice?.cliente?.telefone || invoice?.lead?.telefone || ''),
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
    setFormData({ ...formData, cep: rawCep });
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
    setFormData({ ...formData, [name]: value });
  };

  const handleTelefoneChange = (event) => {
    const formatted = formatTelefone(event.target.value);
    setFormData({ ...formData, telefone: formatted });
  };

  const handleCpfCnpjChange = (event) => {
    const formatted = formatCPFOrCNPJ(event.target.value);
    setFormData({ ...formData, cpfCnpj: formatted });
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

    // Para outros métodos de pagamento (boleto, etc)
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
    <Container sx={{ pt: 5, pb: 10 }}>
      <Typography variant="h3" align="center" sx={{ mb: 2 }}>
        Pronto para simplificar sua contabilidade?
      </Typography>
      <Typography variant="h4" align="center" sx={{ mb: 2 }}>
        Conclua seu orçamento agora!
      </Typography>
      <Grid container rowSpacing={{ xs: 5, md: 0 }} columnSpacing={{ xs: 0, md: 5 }}>
        <Grid xs={12} md={8}>
          <Box
            gap={5}
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(1, 1fr)' }}
            sx={{
              p: { md: 5 },
              borderRadius: 2,
              border: (theme) => ({ md: `dashed 1px ${theme.vars.palette.divider}` }),
            }}
          >
            <PaymentBillingAddress
              invoice={invoice}
              formData={formData}
              errors={errors}
              handleCepChange={handleCepChange}
              handleInputChange={handleInputChange}
              handleTelefoneChange={handleTelefoneChange}
              handleCpfCnpjChange={handleCpfCnpjChange}
              loadingCep={loadingCep}
              cepNotFound={cepNotFound}
            />
            <PaymentMethods method={method} handleChangeMethod={handleChangeMethod} />
            {method === 'pix' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Clique em &quot;Finalizar Pedido&quot; para gerar o QR Code PIX. O QR Code será exibido na seção &quot;Detalhes da Cobrança&quot;.
              </Alert>
            )}
          </Box>
        </Grid>
        <Grid xs={12} md={4}>
          <PaymentSummary invoice={invoice} handleFinalize={handleFinalize} isCreating={isCreating} gerandoPix={gerandoPix} method={method} />
        </Grid>
      </Grid>
    </Container>
  );
}

function PaymentBillingAddress({
  invoice,
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
      <Typography variant="h6" sx={{ mb: 3 }}>
        Detalhes do Cliente
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nome"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            error={!!errors.nome}
            helperText={errors.nome}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            error={!!errors.email}
            helperText={errors.email}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleTelefoneChange}
            error={!!errors.telefone}
            helperText={errors.telefone}
            inputProps={{ maxLength: 15 }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="CPF/CNPJ"
            name="cpfCnpj"
            value={formData.cpfCnpj}
            onChange={handleCpfCnpjChange}
            error={!!errors.cpfCnpj}
            helperText={errors.cpfCnpj}
            inputProps={{ maxLength: 18 }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
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
            inputProps={{ maxLength: 8 }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Endereço"
            name="endereco"
            value={formData.endereco}
            onChange={handleInputChange}
            disabled={isFieldDisabled}
            error={!!errors.endereco}
            helperText={errors.endereco}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Número"
            name="numero"
            value={formData.numero}
            onChange={handleInputChange}
            error={!!errors.numero}
            helperText={errors.numero}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Complemento"
            name="complemento"
            value={formData.complemento}
            onChange={handleInputChange}
            error={!!errors.complemento}
            helperText={errors.complemento}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Bairro"
            name="bairro"
            value={formData.bairro}
            onChange={handleInputChange}
            disabled={isFieldDisabled}
            error={!!errors.bairro}
            helperText={errors.bairro}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Cidade"
            name="cidade"
            value={formData.cidade}
            onChange={handleInputChange}
            disabled={isFieldDisabled}
            error={!!errors.cidade}
            helperText={errors.cidade}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Estado"
            name="estado"
            value={formData.estado}
            onChange={handleInputChange}
            disabled={isFieldDisabled}
            error={!!errors.estado}
            helperText={errors.estado}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

function PaymentMethods({ method, handleChangeMethod }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Forma de Pagamento
      </Typography>
      <Stack spacing={2}>
        {/* PIX - Destacado com viés cognitivo */}
        <Card
          component="label"
          sx={{
            cursor: 'pointer',
            border: method === 'pix' ? 2 : 1,
            borderColor: method === 'pix' ? 'primary.main' : 'divider',
            backgroundColor: method === 'pix' ? 'action.selected' : 'background.paper',
            position: 'relative',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: 'primary.main',
              boxShadow: 2,
            },
          }}
          onClick={() => handleChangeMethod({ target: { value: 'pix' } })}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Radio
                checked={method === 'pix'}
                value="pix"
                onChange={handleChangeMethod}
                sx={{ p: 0 }}
              />
              <Stack direction="row" spacing={1} alignItems="center" flex={1}>
                <Iconify icon="solar:qr-code-bold" width={32} sx={{ color: 'primary.main' }} />
                <Stack flex={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      PIX
                    </Typography>
                    <Chip
                      label="Recomendado"
                      color="success"
                      size="small"
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                    />
                    <Chip
                      label="Pagamento Instantâneo"
                      color="primary"
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Confirmação imediata • Sem taxas • Mais rápido e seguro
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Boleto - Opção secundária */}
        <Card
          component="label"
          sx={{
            cursor: 'pointer',
            border: method === 'boleto' ? 2 : 1,
            borderColor: method === 'boleto' ? 'primary.main' : 'divider',
            backgroundColor: method === 'boleto' ? 'action.selected' : 'background.paper',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: 'primary.main',
              boxShadow: 2,
            },
          }}
          onClick={() => handleChangeMethod({ target: { value: 'boleto' } })}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Radio
                checked={method === 'boleto'}
                value="boleto"
                onChange={handleChangeMethod}
                sx={{ p: 0 }}
              />
              <Stack direction="row" spacing={1} alignItems="center" flex={1}>
                <Iconify icon="solar:document-text-bold" width={32} sx={{ color: 'text.secondary' }} />
                <Stack flex={1}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Boleto Bancário
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Vencimento em até 3 dias úteis • Pode levar até 2 dias para compensar
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

function PaymentSummary({ invoice, handleFinalize, isCreating, gerandoPix, method }) {
  return (
    <Box
      sx={{
        p: 5,
        borderRadius: 2,
        bgcolor: 'background.neutral',
      }}
    >
      <Typography variant="h6" sx={{ mb: 3 }}>
        Resumo do Pagamento
      </Typography>

      <Typography variant="h6" sx={{ mb: 3 }}>
        Itens do Pedido
      </Typography>
      <Stack spacing={2} sx={{ mb: 3 }}>
        {invoice?.items.map((item, index) => (
          <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {item.titulo}
            </Typography>
            <Typography variant="body2">{fCurrency(item.preco * item.quantidade)}</Typography>
          </Stack>
        ))}
      </Stack>
      <Divider sx={{ borderStyle: 'dashed', mb: 3 }} />

      <Stack spacing={2.5}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Subtotal
          </Typography>
          <Typography variant="subtitle1">{fCurrency(invoice?.subTotal)}</Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Desconto
          </Typography>
          <Typography variant="subtitle1" color="error">
            - {fCurrency(invoice?.desconto)}
          </Typography>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="subtitle1">Total</Typography>
          <Typography variant="subtitle1">{fCurrency(invoice?.total)}</Typography>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Button
          fullWidth
          size="large"
          variant="contained"
          sx={{ mt: 5, mb: 3 }}
          onClick={handleFinalize}
          disabled={isCreating || gerandoPix}
          startIcon={(isCreating || gerandoPix) ? <CircularProgress size={24} /> : undefined}
        >
          {gerandoPix ? 'Gerando QR Code PIX...' : isCreating ? 'Processando...' : 'Finalizar pedido'}
        </Button>
      </Stack>
      <Stack alignItems="center" spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:shield-check-bold" sx={{ color: 'success.main' }} />
          <Typography variant="subtitle2">Pagamento seguro</Typography>
        </Stack>

        <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'center' }}>
          Este é um pagamento criptografado SSL seguro de 128 bits
        </Typography>
      </Stack>
    </Box>
  );
}
