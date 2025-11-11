import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, useFieldArray } from 'react-hook-form';

import { yellow } from '@mui/material/colors';
import Grid from '@mui/material/Unstable_Grid2';
import { DatePicker } from '@mui/x-date-pickers';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  Tab,
  Card,
  Tabs,
  Stack,
  Button,
  Switch,
  Divider,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { buscarCep } from 'src/actions/cep';
import { criarCliente, updateCliente, getClienteById, atualizarDadosCliente } from 'src/actions/clientes';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import FileUploadField from 'src/components/file-upload/FileUploadField';

// Removido uso de react-input-mask para evitar findDOMNode em StrictMode
import { useAuthContext } from 'src/auth/hooks';

import SociosForm from './cliete-socios-form';
import { ClientePortalSettings } from './cliente-portal-settings';
import { HistoricoComercialCliente } from './historico-comecial-cliente';

export const TRIBUTACAO_OPTIONS = [
  { value: 'anexo1', label: 'Anexo I' },
  { value: 'anexo2', label: 'Anexo II' },
  { value: 'anexo3', label: 'Anexo III' },
  { value: 'anexo4', label: 'Anexo IV' },
  { value: 'anexo5', label: 'Anexo V' },
  { value: 'simei', label: 'SIMEI' },
  { value: 'autonomo', label: 'Autônomo' },
];

export const TIPONEGOCIO = [
  { value: 'servico', label: 'Serviço' },
  { value: 'educacao', label: 'Educação' },
  { value: 'estetica', label: 'Estética' },
  { value: 'saude', label: 'Saúde' },
  { value: 'comercio', label: 'Comércio' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'beleza', label: 'Beleza' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'advocacia', label: 'Advocacia' },
  { value: 'fabrica', label: 'Fábrica' },
  { value: 'autonomo', label: 'Autônomo' },
  { value: 'imobiliaria', label: 'Imobiliaria' },
];

// ----------------------------------------------------------------------

export const NewUClienteSchema = zod.object({
  nome: zod.string().min(1, { message: 'Nome é obrigatório!' }),
  nomeFantasia: zod.string().optional(),
  razaoSocial: zod.string().optional(),
  cnpj: zod.string().min(1, { message: 'CNPJ é obrigatório!' }),
  codigo: zod
    .preprocess((val) => (val ? Number(val) : undefined), zod.number().optional())
    .optional(), // Preprocess para converter string para número
  email: zod
    .string()
    .min(1, { message: 'Email é obrigatório!' })
    .email({ message: 'Email deve ser um endereço válido!' }),
  emailFinanceiro: zod.string().optional(),
  whatsapp: zod.string().min(1, { message: 'Telefone é obrigatório!' }),
  telefoneComercial: zod.string().optional(),
  clienteVip: zod.boolean().optional(),
  observacao: zod.string().optional(),
  im: zod.string().optional(),
  ie: zod.string().optional(),
  atividade_principal: zod
    .array(
      zod.object({
        code: zod.string(),
        text: zod.string(),
      })
    )
    .optional(),
  atividades_secundarias: zod
    .array(
      zod.object({
        code: zod.string(),
        text: zod.string(),
      })
    )
    .optional(),
  dataEntrada: zod.date().optional().nullable(),
  dataSaida: zod.date().optional().nullable(),
  regimeTributario: zod.enum(['simples', 'presumido', 'real', 'pf'], { message: 'Seleciona uma opção valida' }).optional(),
  planoEmpresa: zod.enum(['carneleao', 'mei', 'start', 'pleno', 'premium', 'plus'], { message: 'Seleciona uma opção valida' }).optional(),
  tributacao: zod
    .array(zod.enum(['anexo1', 'anexo2', 'anexo3', 'anexo4', 'anexo5', 'simei', 'autonomo']))
    .optional(),
  dadosFiscal: zod.string().optional(),
  importarNotasSieg: zod.boolean().optional(),
  possuiExtrato: zod.boolean().optional(),
  dadosContabil: zod.string().optional(),
  possuiFuncionario: zod.boolean().optional(),
  dadosDepartamentoPessoal: zod.string().optional(),
  status: zod.boolean().optional(),
  tipoContato: zod.enum(['cliente', 'lead']).optional(),
  tipoNegocio: zod.array(zod.string()).optional(),
  contadorResponsavel: zod.enum(['semresponsavel', 'anne']).optional(),
  endereco: zod
    .array(
      zod.object({
        rua: zod.string().optional(),
        numero: zod.string().optional(),
        complemento: zod.string().optional(),
        bairro: zod.string().optional(),
        cidade: zod.string().optional(),
        estado: zod.string().optional(),
        cep: zod
          .string()
          .min(1, { message: 'CEP é obrigatório!' })
          .refine((v) => (v || '').replace(/\D/g, '').length === 8, {
            message: 'CEP deve ter 8 dígitos',
          }),
      })
    )
    .optional(),
  socios: zod
    .array(
      zod.object({
        nome: zod.string(),
        cpf: zod.string(),
        rg: zod.string(),
        cnh: zod.string().optional(),
        administrador: zod.boolean(),
      })
    )
    .optional(),
  contratoSocialUrl: zod.string().optional(),
  cartaoCnpjUrl: zod.string().optional(),
  contratoSocialFile: zod.any().optional(),
  cartaoCnpjFile: zod.any().optional(),
  settings: zod.object({
    funcionalidades: zod.object({
      emissaoNFSe: zod.boolean().optional(),
      cadastroClientes: zod.boolean().optional(),
      cadastroServicos: zod.boolean().optional(),
      vendas: zod.boolean().optional(),
      agendamentos: zod.boolean().optional(),
    }).optional(),
    configuracoes: zod.object({
      limiteClientes: zod
        .preprocess((v) => {
          if (v === '' || v === null || v === undefined) return undefined;
          if (typeof v === 'string') {
            const n = Number(v);
            return Number.isNaN(n) ? v : n;
          }
          return v;
        }, zod.number().nonnegative().optional())
        .optional(),
      limiteServicos: zod
        .preprocess((v) => {
          if (v === '' || v === null || v === undefined) return undefined;
          if (typeof v === 'string') {
            const n = Number(v);
            return Number.isNaN(n) ? v : n;
          }
          return v;
        }, zod.number().nonnegative().optional())
        .optional(),
      limiteOrcamentos: zod
        .preprocess((v) => {
          if (v === '' || v === null || v === undefined) return undefined;
          if (typeof v === 'string') {
            const n = Number(v);
            return Number.isNaN(n) ? v : n;
          }
          return v;
        }, zod.number().nonnegative().optional())
        .optional(),
    }).optional()
  })
  .optional()
  .superRefine((val, ctx) => {
    if (!val) return;
    const func = val.funcionalidades || {};
    const cfg = val.configuracoes || {};

    const ensureNumberIfActive = (active, value, path) => {
      if (!active) return; // não validar quando a feature não está ativa
      if (value === undefined) return; // não obrigatório, apenas validar tipo se informado
      if (typeof value !== 'number' || Number.isNaN(value)) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: 'Deve ser um número válido',
          path,
        });
      }
    };

    ensureNumberIfActive(Boolean(func.cadastroClientes), cfg.limiteClientes, ['configuracoes', 'limiteClientes']);
    ensureNumberIfActive(Boolean(func.cadastroServicos), cfg.limiteServicos, ['configuracoes', 'limiteServicos']);
    ensureNumberIfActive(Boolean(func.vendas), cfg.limiteOrcamentos, ['configuracoes', 'limiteOrcamentos']);
  }),
});

// ----------------------------------------------------------------------

export function ClienteNewEditForm({ currentCliente }) {
  const [tabIndex, setTabIndex] = useState(0);
  const [loadingReceita, setLoadingReceita] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  const router = useRouter();
  const { user } = useAuthContext();
  const canSeeHistorico = ['admin', 'comercial'].includes(user?.role);
  const historicoTabIndex = 5; // posição quando visível
  const portalTabIndex = canSeeHistorico ? 6 : 5;

  const normalizePhoneBR = (input) => {
    const raw = String(input || '');
    if (!raw) return '';
    if (raw.startsWith('+')) return raw;
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('55')) return `+${digits}`;
    return `+55${digits}`;
  };

  const defaultValues = useMemo(
    () => ({
      nome: currentCliente?.nome || '',
      nomeFantasia: currentCliente?.nomeFantasia || '',
      razaoSocial: currentCliente?.razaoSocial || '',
      cnpj: currentCliente?.cnpj || '',
      codigo: currentCliente?.codigo || null,
      email: currentCliente?.email || '',
      emailFinanceiro: currentCliente?.emailFinanceiro || '',
      whatsapp: normalizePhoneBR(currentCliente?.whatsapp),
      telefoneComercial: normalizePhoneBR(currentCliente?.telefoneComercial),
      observacao: currentCliente?.observacao || '',
      im: currentCliente?.im || '',
      ie: currentCliente?.ie || '',
      atividade_principal: currentCliente?.atividade_principal || [],
      atividades_secundarias: currentCliente?.atividades_secundarias || [],
      clienteVip: currentCliente?.clienteVip || false,
      dadosFiscal: currentCliente?.dadosFiscal || '',
      importarNotasSieg: currentCliente?.importarNotasSieg || false,
      possuiExtrato: currentCliente?.possuiExtrato || false,
      dadosContabil: currentCliente?.dadosContabil || '',
      possuiFuncionario: currentCliente?.possuiFuncionario || false,
      dadosDepartamentoPessoal: currentCliente?.dadosDepartamentoPessoal || '',
      planoEmpresa: currentCliente?.planoEmpresa || '',
      status: currentCliente?.status || true,
      tipoContato: currentCliente?.tipoContato || 'cliente',
      dataEntrada: currentCliente?.dataEntrada ? new Date(currentCliente.dataEntrada) : null,
      dataSaida: currentCliente?.dataSaida ? new Date(currentCliente.dataSaida) : null,
      regimeTributario: currentCliente?.regimeTributario || '',
      tipoNegocio: currentCliente?.tipoNegocio || [],
      contadorResponsavel: currentCliente?.contadorResponsavel || 'semresponsavel',
      endereco: currentCliente?.endereco || [
        { rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' },
      ],
      tributacao: currentCliente?.tributacao || [],
      socios: currentCliente?.socios || [],
      contratoSocialUrl: currentCliente?.contratoSocialUrl || '',
      cartaoCnpjUrl: currentCliente?.cartaoCnpjUrl || '',
      contratoSocialFile: null,
      cartaoCnpjFile: null,
      settings: currentCliente?.settings || {
        funcionalidades: {
          emissaoNFSe: false,
          cadastroClientes: false,
          cadastroServicos: false,
          vendas: false,
          agendamentos: false,
        },
        configuracoes: {
          limiteClientes: '',
          limiteServicos: '',
          limiteOrcamentos: '',
        }
      }
    }),
    [currentCliente]
  );

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(NewUClienteSchema),
    defaultValues,
  });

  const { reset, watch, control, handleSubmit, setValue, formState } = methods;
  const { isSubmitting, errors } = formState;

  const clienteVip = watch('clienteVip'); // Observar o valor de clienteVip

  const {
    fields: enderecoFields,
    append: appendEndereco,
    remove: removeEndereco,
  } = useFieldArray({
    control,
    name: 'endereco',
  });

const onSubmit = handleSubmit(
  async (data) => {
      try {

        const formData = new FormData();
        const textData = { ...data };
        const trimStartDeep = (obj) => {
          if (Array.isArray(obj)) return obj.map(trimStartDeep);
          // Preservar datas e objetos dayjs
          if (obj instanceof Date) return obj;
          if (dayjs.isDayjs?.(obj)) return obj.toDate();
          if (obj && typeof obj === 'object') {
            const out = {};
            Object.keys(obj).forEach((k) => {
              out[k] = trimStartDeep(obj[k]);
            });
            return out;
          }
          if (typeof obj === 'string') return obj.replace(/^\s+/, '');
          return obj;
        };
        const cleaned = trimStartDeep(textData);
        if (Array.isArray(cleaned.endereco)) {
          cleaned.endereco = cleaned.endereco.map((e) => ({
            ...e,
            cep: (e?.cep || '').toString().replace(/\D/g, ''),
          }));
        }
        
        delete cleaned.contratoSocialFile;
        delete cleaned.cartaoCnpjFile;

        formData.append('data', JSON.stringify(cleaned));

        if (data.contratoSocialFile instanceof File) {
          formData.append('contratoSocial', data.contratoSocialFile);
        }
        if (data.cartaoCnpjFile instanceof File) {
          formData.append('cartaoCnpj', data.cartaoCnpjFile);
        }

        if (currentCliente) {
          await updateCliente(currentCliente._id, formData);

          const updatedCliente = await getClienteById(currentCliente._id);
          reset({
            ...updatedCliente,
            dataEntrada: updatedCliente.dataEntrada ? new Date(updatedCliente.dataEntrada) : null,
            dataSaida: updatedCliente.dataSaida ? new Date(updatedCliente.dataSaida) : null,
            contratoSocialFile: null, 
            cartaoCnpjFile: null,
          });

          toast.success('Cliente Atualizado com sucesso!');
        } else {
          await criarCliente(formData);
          toast.success('Cliente Criado com sucesso!');
          reset();
          router.push(paths.dashboard.cliente.root);
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message);
      }
    },
    (error) => {
      console.log('Validation Errors:', error);
    }
  );

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleAtualizarReceita = async () => {
    setLoadingReceita(true);
    try {
      const clienteAtualizado = await atualizarDadosCliente(currentCliente._id);
      reset(clienteAtualizado);

      toast.success('Dados da Receita atualizados com sucesso!');
    } catch (error) {
      // toast.info(error.message || 'Dados desatualizados');
      toast.info('Dados desatualizados');
    } finally {
      setLoadingReceita(false);
    }
  };

  const handleCepChange = async (index, cep) => {
    setLoadingCep(true);
    try {
      const enderecoData = await buscarCep(cep);
      if (enderecoData) {
        setValue(`endereco.${index}.rua`, enderecoData.rua);
        setValue(`endereco.${index}.cidade`, enderecoData.cidade);
        setValue(`endereco.${index}.bairro`, enderecoData.bairro);
        setValue(`endereco.${index}.estado`, enderecoData.estado);
      } else {
        toast.error('CEP não encontrado');
      }
    } catch (error) {
      toast.error(error.message)
      console.error('Error fetching CEP data:', error);
      // toast.error('Erro ao buscar CEP');
    } finally {
      setLoadingCep(false);
    }
  };

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Cliente Editar">
        <Tab label="Dados da Empresa" />
        <Tab label="Sócios" />
        <Tab label="Dados Fiscais" />
        <Tab label="Dados Contábeis" />
        <Tab label="Departamento Pessoal" />
        {canSeeHistorico && <Tab label="Histórico Comercial" />}
        <Tab label="Configurações do Portal" />
      </Tabs>
      <Grid container spacing={3} mt={2}>
        {tabIndex === 0 && (
          <Grid xs={12}>
            <Card sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6">Dados da Empresa</Typography>
                {clienteVip && (
                  <Box display="flex" alignItems="center" gap={2}>
                    <Iconify
                      icon="mdi:star" // Ícone do pacote mdi
                      width={24}
                      height={24}
                      style={{ color: yellow[700] }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: yellow[700],
                        fontWeight: 'bold',
                      }}
                    >
                      Cliente VIP
                    </Typography>
                  </Box>
                )}
                <Button
                  variant="outlined"
                  onClick={handleAtualizarReceita}
                  disabled={loadingReceita}
                  startIcon={loadingReceita && <CircularProgress size={20} />}
                >
                  Atualizar na Receita
                </Button>
              </Box>
              <Grid container spacing={2} mt={2}>
                <Grid xs={12} sm={2}>
                  <Controller
                    name="codigo"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="number"
                        label="Código"
                        fullWidth
                        error={!!errors.codigo}
                        helperText={errors.codigo ? errors.codigo.message : ''}
                      />
                    )}
                  />
                </Grid>
                <Grid xs={12} sm={7} sx={{ display: { xs: 'none', sm: 'block' } }} />
                <Grid xs={12} sm={3}>
                  <Field.Select name="tipoContato" label="Tipo de conta" fullWidth>
                    <MenuItem value="cliente">Cliente</MenuItem>
                    <MenuItem value="lead">Lead</MenuItem>
                  </Field.Select>
                </Grid>
                <Grid xs={12}>
                  <Field.Text name="razaoSocial" label="Razão Social" fullWidth />
                </Grid>
                <Grid xs={12} sm={3}>
                  <Field.Text name="cnpj" label="CNPJ" fullWidth />
                </Grid>
                <Grid xs={12} sm={4}>
                  <Field.Text name="nome" label="Nome" fullWidth />
                </Grid>
                <Grid xs={12} sm={5}>
                  <Field.Text name="nomeFantasia" label="Nome Fantasia" fullWidth />
                </Grid>
                <Grid xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Contato</Typography>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Field.Text name="email" label="Email" fullWidth />
                </Grid>
                <Grid xs={12} sm={4}>
                  <Field.Text name="emailFinanceiro" label="Email Financeiro" fullWidth />
                </Grid>
                <Grid xs={12} sm={4}>
                  <Field.Phone name="whatsapp" label="Whatsapp" fullWidth />
                </Grid>
                <Grid xs={12} sm={4}>
                  <Field.Phone name="telefoneComercial" label="Telefone Comercial" fullWidth />
                </Grid>
                <Grid xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Endereço</Typography>
                </Grid>
                {enderecoFields.map((item, index) => (
                  <Grid container spacing={2} key={item.id} mt={2}>
                    <Grid xs={12} sm={3}>
                      <Controller
                        name={`endereco.${index}.cep`}
                        control={control}
                    render={({ field }) => {
                      const formatCep = (raw) => {
                        const digits = String(raw || '').replace(/\D/g, '');
                        if (digits.length <= 5) return digits;
                        return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
                      };
                      const handleChange = (e) => {
                        const digits = String(e.target.value || '').replace(/\D/g, '');
                        const formatted = digits.length <= 5 ? digits : `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
                        field.onChange(formatted);
                      };
                      const handleBlur = () => {
                        const digits = String(field.value || '').replace(/\D/g, '');
                        handleCepChange(index, digits);
                      };
                      return (
                        <TextField
                          label="CEP"
                          fullWidth
                          value={formatCep(field.value)}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={!!errors.endereco?.[index]?.cep}
                          helperText={errors.endereco?.[index]?.cep?.message}
                          inputProps={{ inputMode: 'numeric' }}
                        />
                      );
                    }}
                      />
                    </Grid>
                    <Grid xs={12} sm={3}>
                      <Controller
                        name={`endereco.${index}.rua`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Rua"
                            fullWidth
                            disabled={loadingCep}
                            error={!!errors.endereco?.[index]?.rua}
                            helperText={errors.endereco?.[index]?.rua?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid xs={12} sm={2}>
                      <Controller
                        name={`endereco.${index}.numero`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Número"
                            fullWidth
                            error={!!errors.endereco?.[index]?.numero}
                            helperText={errors.endereco?.[index]?.numero?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid xs={12} sm={4}>
                      <Controller
                        name={`endereco.${index}.complemento`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Complemento"
                            fullWidth
                            error={!!errors.endereco?.[index]?.complemento}
                            helperText={errors.endereco?.[index]?.complemento?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid xs={12} sm={3}>
                      <Controller
                        name={`endereco.${index}.bairro`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Bairro"
                            fullWidth
                            disabled={loadingCep}
                            error={!!errors.endereco?.[index]?.bairro}
                            helperText={errors.endereco?.[index]?.bairro?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid xs={12} sm={3}>
                      <Controller
                        name={`endereco.${index}.cidade`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Cidade"
                            fullWidth
                            disabled={loadingCep}
                            error={!!errors.endereco?.[index]?.cidade}
                            helperText={errors.endereco?.[index]?.cidade?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid xs={12} sm={3}>
                      <Controller
                        name={`endereco.${index}.estado`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Estado"
                            fullWidth
                            disabled={loadingCep}
                            error={!!errors.endereco?.[index]?.estado}
                            helperText={errors.endereco?.[index]?.estado?.message}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                ))}

                <Grid xs={12} sm={2}>
                  <Field.Select name="clienteVip" label="Cliente VIP" fullWidth>
                    <MenuItem value>Sim</MenuItem>
                    <MenuItem value={false}>Não</MenuItem>
                  </Field.Select>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Field.Text name="im" label="Inscrição Municipal" fullWidth />
                </Grid>
                <Grid xs={12} sm={6}>
                  <Field.Text name="ie" label="Inscrição Estadual" fullWidth />
                </Grid>
                <Grid xs={12} sm={6}>
                  <Field.Select name="regimeTributario" label="Regime Tributário" fullWidth>
                    {['simples', 'presumido', 'real', 'pf'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Field.Select>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Field.Select name="planoEmpresa" label="Plano Empresa" fullWidth>
                    {['carneleao', 'mei', 'start', 'pleno', 'premium', 'plus'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Field.Select>
                </Grid>
                <Grid xs={12}>
                  <Field.MultiSelect
                    name="tributacao"
                    label="Tributação"
                    options={TRIBUTACAO_OPTIONS}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12}>
                  <Field.MultiSelect
                    name="tipoNegocio"
                    label="Tipo do Negócio"
                    options={TIPONEGOCIO}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} sm={12}>
                  <Field.Select name="contadorResponsavel" label="Contador Responsável" fullWidth>
                    {['anne', 'semresponsavel'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Field.Select>
                </Grid>
                {/* <Grid xs={12} sm={6}>
                </Grid> */}
                <Grid xs={12}>
                  <Field.Editor name="observacao" label="Observação" fullWidth />
                </Grid>
                <Grid container item spacing={2} xs={12} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: -1 }}>Documentos da Empresa</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FileUploadField
                    name="contratoSocialFile"
                    label="Contrato Social"
                    existingFileUrl={watch('contratoSocialUrl')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FileUploadField
                    name="cartaoCnpjFile"
                    label="Cartão CNPJ"
                    existingFileUrl={watch('cartaoCnpjUrl')}
                  />
                </Grid>
              </Grid>
                <Grid xs={12} sm={6}>
                  <Controller
                    name="dataEntrada"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Data de Entrada"
                        value={field.value ? dayjs(field.value) : null} // Converte para `dayjs` para manipulação
                        onChange={(newValue) => {
                          field.onChange(newValue ? newValue.toDate() : null); // Converte `dayjs` de volta para `Date`
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={!!errors.dataEntrada}
                            helperText={errors.dataEntrada ? errors.dataEntrada.message : ''}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <Controller
                    name="dataSaida"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Data de Saída"
                        value={field.value ? dayjs(field.value) : null} // Convertendo para dayjs
                        onChange={(newValue) => {
                          field.onChange(newValue ? newValue.toDate() : null); // Convertendo de volta para Date
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={!!errors.dataSaida}
                            helperText={errors.dataSaida ? errors.dataSaida.message : ''}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        )}
        {tabIndex === 1 && (
          <Grid xs={12}>
            <SociosForm />
          </Grid>
        )}
        {tabIndex === 2 && (
          <Grid xs={12}>
            <Card sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid xs={12}>
                  <Controller
                    name="atividade_principal"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={
                          field.value
                            ? field.value.map((item) => `${item.code} - ${item.text}`).join(', ')
                            : ''
                        } // Exibir code e text
                        label="Atividade Principal"
                        fullWidth
                        disabled
                        error={!!errors.atividade_principal}
                        helperText={
                          errors.atividade_principal ? errors.atividade_principal.message : ''
                        }
                      />
                    )}
                  />
                </Grid>
                <Grid xs={12}>
                  <Controller
                    name="atividades_secundarias"
                    control={control}
                    render={({ field }) => {
                      const value = field.value
                        ? field.value.map((item) => `${item.code} - ${item.text}`).join('\n')
                        : ''; // Exibir code e text com quebra de linha
                      const rows = field.value ? field.value.length : 1; // Definir o número de linhas dinamicamente

                      return (
                        <TextField
                          {...field}
                          value={value}
                          label="Atividades Secundárias"
                          fullWidth
                          multiline
                          rows={rows} // Definir número de linhas baseado no número de atividades
                          disabled
                          error={!!errors.atividades_secundarias}
                          helperText={
                            errors.atividades_secundarias
                              ? errors.atividades_secundarias.message
                              : ''
                          }
                        />
                      );
                    }}
                  />
                </Grid>
                <Grid xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Integração Sieg</Typography>
                </Grid>
                <Grid xs={12}>
                  <Controller
                    name="importarNotasSieg"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label="Importar Notas Fiscais da Sieg automaticamente"
                      />
                    )}
                  />
                </Grid>
                <Grid xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid xs={12}>
                  <Field.Editor name="dadosFiscal" label="Dados Fiscais" fullWidth />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        )}
        {tabIndex === 3 && (
          <Grid xs={12}>
            <Card sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid xs={12}>
                  <Controller
                    name="possuiExtrato"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label="Possui Extrato ?"
                      />
                    )}
                  />
                </Grid>
                <Grid xs={12}>
                  <Field.Editor name="dadosContabil" label="Dados Contábeis" fullWidth />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        )}
        {tabIndex === 4 && (
          <Grid xs={12}>
            <Card sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid xs={12}>
                  <Controller
                    name="possuiFuncionario"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label="Possui Funcionário ?"
                      />
                    )}
                  />
                </Grid>
                <Grid xs={12}>
                  <Field.Editor
                    name="dadosDepartamentoPessoal"
                    label="Dados do Departamento Pessoal"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        )}
        {canSeeHistorico && tabIndex === historicoTabIndex && (
          <Grid xs={12}>
            <HistoricoComercialCliente cliente={currentCliente} />
          </Grid>
        )}
      {tabIndex === portalTabIndex && (
        <Grid xs={12}>
          <Card sx={{ p: 3 }}>
            <ClientePortalSettings clienteId={currentCliente?._id} control={control} />
          </Card>
        </Grid>
      )}
      </Grid>
      <Stack alignItems="flex-end" sx={{ mt: 3 }}>
        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
          {currentCliente ? 'Salvar alterações' : 'Criar Cliente'}
        </LoadingButton>
      </Stack>
    </Form>
  );
}
