'use client';

import { useState } from 'react';
import axios from 'axios';
import { z } from 'zod';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material';
import { fCurrency } from 'src/utils/format-number';
import { toast } from 'sonner';
import { Iconify } from 'src/components/iconify';
import { crirarPedidoOrcamento } from 'src/actions/invoices';
import { CobrancaExistente } from './orcamento-cobranca';

// Função para remover formatação do CEP
const sanitizeCep = (cep) => cep.replace(/\D/g, '');

// Função para validar CPF ou CNPJ
const validateCpfCnpj = (value) => {
  const cpfCnpj = value.replace(/\D/g, '');
  if (cpfCnpj.length === 11) {
    return z
      .string()
      .length(11)
      .regex(/^\d{11}$/)
      .safeParse(cpfCnpj).success;
  }
  if (cpfCnpj.length === 14) {
    return z
      .string()
      .length(14)
      .regex(/^\d{14}$/)
      .safeParse(cpfCnpj).success;
  }
  return false;
};

// Schema de validação com Zod
const formDataSchema = z.object({
  nome: z.string().nonempty('Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  telefone: z.string().nonempty('Telefone é obrigatório'),
  cpfCnpj: z.string().refine(validateCpfCnpj, 'CPF ou CNPJ inválido'),
  cep: z.string().nonempty('CEP é obrigatório'),
  endereco: z.string().nonempty('Endereço é obrigatório'),
  numero: z.string().nonempty('Número é obrigatório'),
  complemento: z.string().optional(),
  cidade: z.string().nonempty('Cidade é obrigatória'),
  estado: z.string().nonempty('Estado é obrigatório'),
});

export function OrcamentoAprovado({
  invoice,
  paymentMethod,
  handlePaymentMethodChange,
  handlePayment,
  loading,
  updateInvoiceData, // Nova prop para atualizar a invoice
}) {
  // Verificar se a invoice tem cobranças
  if (invoice.cobrancas && invoice.cobrancas.length > 0) {
    return <CobrancaExistente invoice={invoice} />;
  }

  const enderecoInicial = invoice?.cliente.endereco?.[0] || {};
  const [method, setMethod] = useState(paymentMethod);
  const [formData, setFormData] = useState({
    nome: invoice?.cliente.nome || '',
    email: invoice?.cliente.email || '',
    telefone: invoice?.cliente.whatsapp || '',
    cpfCnpj: invoice?.cliente.cnpj || '',
    cep: enderecoInicial.cep || '',
    endereco: enderecoInicial.rua || '',
    numero: enderecoInicial.numero || '',
    complemento: enderecoInicial.complemento || '',
    cidade: enderecoInicial.cidade || '',
    estado: enderecoInicial.estado || '',
  });

  const [errors, setErrors] = useState({});
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepNotFound, setCepNotFound] = useState(false);

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
        const { logradouro, localidade, uf, erro } = response.data;
        if (!erro) {
          setFormData((prevData) => ({
            ...prevData,
            endereco: logradouro,
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

  const handleFinalize = async () => {
    const validationResult = formDataSchema.safeParse(formData);
    if (!validationResult.success) {
      const newErrors = {};
      validationResult.error.errors.forEach((error) => {
        newErrors[error.path[0]] = error.message;
      });
      setErrors(newErrors);
      return;
    }

    setErrors({}); // Clear errors if validation is successful

    try {
      const dataInvoice = {
        paymentMethod: method,
        ...formData,
        cep: sanitizeCep(formData.cep),
        cpfCnpj: formData.cpfCnpj.replace(/\D/g, ''),
      };

      await crirarPedidoOrcamento(invoice._id, dataInvoice);

      // Chamar a função de atualização da invoice
      await updateInvoiceData();

      toast.success('Pagamento processado com sucesso!');
    } catch (error) {
      toast.error('Erro ao processar pagamento');
    }
  };

  return (
    <Container sx={{ pt: 5, pb: 10 }}>
      <Typography variant="h3" align="center" sx={{ mb: 2 }}>
        {`Pronto para simplificar sua contabilidade?`}
      </Typography>
      <Typography variant="h4" align="center" sx={{ mb: 2 }}>
        {`Conclua seu orçamento agora!`}
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
              loadingCep={loadingCep}
              cepNotFound={cepNotFound}
            />
            <PaymentMethods
              method={method}
              handleChangeMethod={handleChangeMethod}
              handlePayment={handlePayment}
              loading={loading}
            />
          </Box>
        </Grid>
        <Grid xs={12} md={4}>
          <PaymentSummary invoice={invoice} handleFinalize={handleFinalize} loading={loading} />
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
            onChange={handleInputChange}
            error={!!errors.telefone}
            helperText={errors.telefone}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="CPF/CNPJ"
            name="cpfCnpj"
            value={formData.cpfCnpj}
            onChange={handleInputChange}
            error={!!errors.cpfCnpj}
            helperText={errors.cpfCnpj}
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
      <FormControl component="fieldset">
        <RadioGroup name="formaPagamento" value={method} onChange={handleChangeMethod}>
          <FormControlLabel value="boleto" control={<Radio />} label="Boleto" />
          <FormControlLabel value="pix" control={<Radio />} label="PIX" />
        </RadioGroup>
      </FormControl>
    </Box>
  );
}

function PaymentSummary({ invoice, handleFinalize, loading }) {
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
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Finalizar pedido'}
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
