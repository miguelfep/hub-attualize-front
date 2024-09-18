import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, useFieldArray } from 'react-hook-form';

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
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { buscarCep } from 'src/actions/cep';
import { criarCliente, updateCliente, getClienteById } from 'src/actions/clientes';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import SociosForm from './cliete-socios-form';

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
  razaoSocial: zod.string().optional(),
  cnpj: zod.string().min(1, { message: 'CNPJ é obrigatório!' }),
  codigo: zod.number().optional(),
  email: zod
    .string()
    .min(1, { message: 'Email é obrigatório!' })
    .email({ message: 'Email deve ser um endereço válido!' }),
  emailFinanceiro: zod.string().optional(),
  whatsapp: zod.string().min(1, { message: 'Telefone é obrigatório!' }),
  telefoneComercial: zod.string().optional(),
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
  regimeTributario: zod.enum(['simples', 'presumido', 'real', 'pf']).optional(),
  planoEmpresa: zod.enum(['carneleao', 'mei', 'start', 'pleno', 'premium', 'plus']).optional(),
  tributacao: zod
    .array(zod.enum(['anexo1', 'anexo2', 'anexo3', 'anexo4', 'anexo5', 'simei', 'autonomo']))
    .optional(),
  dadosFiscal: zod.string().optional(),
  dadosContabil: zod.string().optional(),
  status: zod.boolean().optional(),
  tipoContato: zod.enum(['cliente', 'lead']).optional(),
  tipoNegocio: zod.array(zod.string()).optional(),
  contadorResponsavel: zod.enum(['luan', 'geremias', 'semresponsavel', 'anne']).optional(),
  endereco: zod
    .array(
      zod.object({
        rua: zod.string().optional(),
        numero: zod.string().optional(),
        complemento: zod.string().optional(),
        cidade: zod.string().optional(),
        estado: zod.string().optional(),
        cep: zod.string().optional(),
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
});

// ----------------------------------------------------------------------

export function ClienteNewEditForm({ currentCliente }) {
  const [tabIndex, setTabIndex] = useState(0);
  const [loadingReceita, setLoadingReceita] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  const router = useRouter();

  const defaultValues = useMemo(
    () => ({
      nome: currentCliente?.nome || '',
      razaoSocial: currentCliente?.razaoSocial || '',
      cnpj: currentCliente?.cnpj || '',
      codigo: currentCliente?.codigo || '',
      email: currentCliente?.email || '',
      emailFinanceiro: currentCliente?.emailFinanceiro || '',
      whatsapp: currentCliente?.whatsapp || '',
      telefoneComercial: currentCliente?.telefoneComercial || '',
      observacao: currentCliente?.observacao || '',
      im: currentCliente?.im || '',
      ie: currentCliente?.ie || '',
      atividade_principal: currentCliente?.atividade_principal || [],
      atividades_secundarias: currentCliente?.atividades_secundarias || [],
      dadosFiscal: currentCliente?.dadosFiscal || '',
      dadosContabil: currentCliente?.dadosContabil || '',
      planoEmpresa: currentCliente?.planoEmpresa || '',
      status: currentCliente?.status || true,
      tipoContato: currentCliente?.tipoContato || 'cliente',
      dataEntrada: currentCliente?.dataEntrada ? new Date(currentCliente.dataEntrada) : null,
      dataSaida: currentCliente?.dataSaida ? new Date(currentCliente.dataSaida) : null,
      regimeTributario: currentCliente?.regimeTributario || '',
      tipoNegocio: currentCliente?.tipoNegocio || [],
      contadorResponsavel: currentCliente?.contadorResponsavel || 'semresponsavel',
      endereco: currentCliente?.endereco || [
        { rua: '', numero: '', complemento: '', cidade: '', estado: '', cep: '' },
      ],
      tributacao: currentCliente?.tributacao || [],
      socios: currentCliente?.socios || [],
    }),
    [currentCliente]
  );

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(NewUClienteSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

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
        let response;
        if (currentCliente) {
          response = await updateCliente(currentCliente._id, data);

          const updatedCliente = await getClienteById(currentCliente._id);
          reset(updatedCliente);
          toast.success('Cliente Atualizado com sucesso!');
        } else {
          response = await criarCliente(data);
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
      // Chame a API para atualizar os dados da Receita aqui

      // const newCLiente = await updateCliente(currentCliente._id);
      // reset(newCLiente);

      toast.success('Dados da Receita atualizados com sucesso!');
    } catch (error) {
      console.error('Error updating data from Receita:', error);
      toast.error('Erro ao atualizar dados da Receita');
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
        setValue(`endereco.${index}.estado`, enderecoData.estado);
      } else {
        toast.error('CEP não encontrado');
      }
    } catch (error) {
      console.error('Error fetching CEP data:', error);
      toast.error('Erro ao buscar CEP');
    } finally {
      setLoadingCep(false);
    }
  };

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Client Edit Tabs">
        <Tab label="Dados da Empresa" />
        <Tab label="Sócios" />
        <Tab label="Dados Fiscais" />
        <Tab label="Dados Contábeis" />
        <Tab label="Endereço" />
      </Tabs>
      <Grid container spacing={3} mt={2}>
        {tabIndex === 0 && (
          <Grid xs={12}>
            <Card sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6">Dados da Empresa</Typography>
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
                <Grid xs={7}>
                  <Field.Text name="razaoSocial" label="Razão Social" fullWidth />
                </Grid>
                <Grid xs={12} sm={3}>
                  <Field.Text name="cnpj" label="CNPJ" fullWidth />
                </Grid>
                <Grid xs={12} sm={4}>
                  <Field.Text name="nome" label="Nome" fullWidth />
                </Grid>
                <Grid xs={12} sm={4}>
                  <Field.Text name="email" label="Email" fullWidth />
                </Grid>
                <Grid xs={12} sm={4}>
                  <Field.Text name="whatsapp" label="Whatsapp" fullWidth />
                </Grid>
                <Grid xs={12} sm={6}>
                  <Field.Text name="emailFinanceiro" label="Email Financeiro" fullWidth />
                </Grid>
                <Grid xs={12} sm={6}>
                  <Field.Text name="telefoneComercial" label="Telefone Comercial" fullWidth />
                </Grid>
                <Grid xs={12} sm={6}>
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
                    {['luan', 'anne', 'geremias', 'semresponsavel'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Field.Select>
                </Grid>
                <Grid xs={12}>
                  <Field.Editor name="observacao" label="Observação" fullWidth />
                </Grid>
                <Grid xs={12} sm={6}>
                  <Controller
                    name="dataEntrada"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Data de Entrada"
                        value={field.value ? dayjs(field.value) : null} // Convertendo para dayjs
                        onChange={(newValue) => {
                          field.onChange(newValue ? newValue.toDate() : null); // Convertendo de volta para Date
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
                  <Field.Editor name="dadosContabil" label="Dados Contábeis" fullWidth />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        )}
        {tabIndex === 4 && (
          <Grid xs={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6">Endereço</Typography>
              {enderecoFields.map((item, index) => (
                <Grid container spacing={2} key={item.id} mt={2}>
                  <Grid xs={12} sm={3}>
                    <Controller
                      name={`endereco.${index}.cep`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="CEP"
                          fullWidth
                          error={!!errors.endereco?.[index]?.cep}
                          helperText={errors.endereco?.[index]?.cep?.message}
                          onBlur={() => handleCepChange(index, field.value)}
                        />
                      )}
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
