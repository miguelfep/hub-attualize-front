'use client';

import * as z from 'zod';
import { useState, useEffect } from 'react';
import { NumericFormat } from 'react-number-format';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Box,
  Step,
  Grid,
  Card,
  Button,
  Switch,
  Stepper,
  Tooltip,
  Divider,
  MenuItem,
  Container,
  StepLabel,
  TextField,
  Typography,
  IconButton,
  CardContent,
  Autocomplete,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import { formatCep, formatCpf } from 'src/utils/format-input';

import { buscarCep } from 'src/actions/cep';
import { openMEI, getAllCnaes } from 'src/actions/parceiroId';

import { PhoneInput } from 'src/components/phone-input';

import { Iconify } from '../iconify';

const atuacoesOptions = [
  { id: 0, label: 'Estabelecimento Fixo' },
  { id: 1, label: 'Internet' },
  { id: 2, label: 'Local Fixo Fora da Loja' },
];

const estadosOptions = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

// Passos do formulário
const steps = ['Conta Gov.br e Contato', 'Dados Pessoais e Endereço', 'Informações do MEI'];

const schema = z.object({
  possuiGov: z.boolean(),
  contaGovNivel: z.boolean(),
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  ddd: z.string().min(2, 'DDD inválido'),
  cpf: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido'), // 11 dígitos puros ou 14 formatado
  rg: z.string().min(5, 'RG inválido'),
  orgaoEmissor: z.string().min(2, 'Órgão Emissor inválido'),
  ufEmissor: z.string().min(2, 'UF inválido').max(2, 'UF deve ter 2 caracteres'),
  cep: z.string().min(8, 'CEP inválido').max(9, 'CEP inválido'),
  logradouro: z.string().min(3, 'Endereço inválido'),
  bairro: z.string().min(3, 'Bairro inválido'),
  cidade: z.string().min(3, 'Cidade inválida'),
  numero: z.string().min(1, 'Número inválido'),
  complemento: z.string().optional(),
  senhaGov: z.string().min(6, 'Senha do Gov.br inválida'),
  capitalSocial: z.string().optional(),
  dataNascimento: z.string().nonempty('Data de nascimento é obrigatória'),
});

export function MeiStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aberturaExistente, setAberturaExistente] = useState(false);
  const [cnaes, setCnaes] = useState([]);

  const {
    handleSubmit,
    control,
    watch,
    trigger,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      possuiGov: false,
      contaGovNivel: false,
      name: '',
      email: '',
      phone: '',
      ddd: '',
      cpf: '',
      rg: '',
      orgaoEmissor: '',
      ufEmissor: '',
      cep: '',
      logradouro: '',
      bairro: '',
      cidade: '',
      numero: '',
      complemento: '',
      senhaGov: '',
      capitalSocial: '',
      atividadePrincipal: null, // ⬅️ NULL para objetos
        atividadesSecundarias: [], // ⬅️ ARRAY VAZIO para múltiplas seleções
        atuacao: null, // ⬅️ NULL para objetos
      dataNascimento: '',
    },
  });

  useEffect(() => {
    async function fetchCnaes() {
      const resp = await getAllCnaes();

      setCnaes(resp.data.cnaes);
    }
    fetchCnaes();
  }, []);

  const formValues = watch();

  const handleNext = async () => {
    let fieldsToValidate = [];

    if (activeStep === 0) {
      fieldsToValidate = [
        'possuiGov',
        'contaGovNivel',
        'name',
        'email',
        'phone',
        'senhaGov',
        'ddd',
        'cpf',
        'rg',
        'orgaoEmissor',
        'ufEmissor',
      ];
    } else if (activeStep === 1) {
      fieldsToValidate = ['cep', 'bairro', 'cidade', 'numero'];
    } else if (activeStep === 2) {
      fieldsToValidate = [
        'capitalSocial',
        'atividadePrincipal',
        'atividadesSecundarias',
        'atuacao',
      ];
    }

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

  const handleCepChange = async (value) => {
    const cep = String(value ?? '').replace(/\D/g, '');

    if (cep.length === 8) {
      const data = await buscarCep(cep);

      setValue('logradouro', data.rua);
      setValue('bairro', data.bairro);
      setValue('cidade', data.cidade);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
 

    try {
      const requestBody = {
        cpf: data.cpf,
        senha_gov: data.senhaGov,
        complemento: data.complemento || '',
        rg: data.rg,
        orgao_emissor: data.orgaoEmissor,
        capital_social: data.capitalSocial,
        cnpj_empresa: '53654503000147',
        email: data.email,
        telefone: data.phone.replace(/\D/g, ''),
        ddd: data.ddd,
        cep: data.cep.replace(/\D/g, ''),
        municipio: data.cidade,
        bairro: data.bairro,
        logradouro: data.logradouro,
        data_nascimento: new Date(data.dataNascimento).toISOString(),
        nome: data.name,
        atividade_principal: getValues("atividadePrincipal"), // ⬅️ Garante que não seja null
        atividades_secundarias: getValues("atividadesSecundarias"), // ⬅️ Envia array de objetos
        forma_atuacao: getValues("atuacao"), // ⬅️ Garante que não seja null
          uf_emissor: data.ufEmissor,
        numero: data.numero,
      };
      

const res = await openMEI(requestBody)

if(res.data.success === false){
    setAberturaExistente(true)
    setActiveStep((prevStep) => prevStep + 1);
    
} else {
    setAberturaExistente(false)
    setActiveStep((prevStep) => prevStep + 1);
}   
     
    } catch (error) {
      console.error('❌ Erro ao processar:', error);
      alert('Erro ao processar seu pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 8, bgcolor: '#680a87', display: 'flex', justifyContent: 'center' }}>
      <Container maxWidth="md">
        <Card sx={{ p: 4, boxShadow: 5, borderRadius: 2, bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 4 }}>
              Abra seu MEI gratuitamente!
            </Typography>

            <Stepper
              activeStep={activeStep}
              alternativeLabel
              sx={{
                mb: 4,
                '& .MuiStepConnector-line': {
                  borderColor: '#420655', // Fundo roxo escuro
                  borderWidth: 2,
                },
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mt: 4 }}>
              {activeStep === 0 && (
                <>
                  <FormControlLabel
                    control={
                      <Controller
                        name="possuiGov"
                        control={control}
                        render={({ field }) => <Switch {...field} checked={field.value} />}
                      />
                    }
                    label="Possui conta Gov.br?"
                  />
                  {formValues.possuiGov && (
                    <>
                      <FormControlLabel
                        control={
                          <Controller
                            name="contaGovNivel"
                            control={control}
                            render={({ field }) => <Switch {...field} checked={field.value} />}
                          />
                        }
                        label="A conta Gov.br é nível Prata ou Ouro?"
                      />

                      <Divider sx={{ my: 3 }} />

                      {formValues.contaGovNivel && (
                        <Grid container spacing={2}>
                          {/* Nome ocupa a linha toda */}
                          <Grid xs={12}>
                            <Controller
                              name="name"
                              control={control}
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Nome Completo"
                                  error={!!fieldState.error}
                                  helperText={fieldState.error ? fieldState.error.message : ''}
                                  sx={{ mb: 2 }}
                                />
                              )}
                            />
                          </Grid>

                          {/* CPF (50%) | RG (50%) */}
                          <Grid xs={12} sm={6}>
                            <Controller
                              name="cpf"
                              control={control}
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={(e) => field.onChange(formatCpf(e.target.value))}
                                  fullWidth
                                  label="CPF"
                                  error={!!fieldState.error}
                                  helperText={fieldState.error ? fieldState.error.message : ''}
                                  sx={{ mb: 2 }}
                                  inputProps={{ inputMode: 'numeric' }}
                                />
                              )}
                            />
                          </Grid>
                          <Grid xs={12} sm={6}>
                            <Controller
                              name="dataNascimento"
                              control={control}
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Data de Nascimento"
                                  type="date"
                                  InputLabelProps={{ shrink: true }} // Para manter o rótulo acima do input
                                  error={!!fieldState.error}
                                  helperText={fieldState.error?.message}
                                  sx={{ mb: 2 }}
                                />
                              )}
                            />
                          </Grid>
                          <Grid xs={12} sm={4}>
                            <Controller
                              name="rg"
                              control={control}
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="RG"
                                  error={!!fieldState.error}
                                  helperText={fieldState.error ? fieldState.error.message : ''}
                                  sx={{ mb: 2 }}
                                />
                              )}
                            />
                          </Grid>

                          {/* Órgão Emissor (50%) | UF Emissor (50%) */}
                          <Grid xs={12} sm={3}>
                            <Controller
                              name="orgaoEmissor"
                              control={control}
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Órgão Emissor"
                                  error={!!fieldState.error}
                                  helperText={fieldState.error ? fieldState.error.message : ''}
                                  sx={{ mb: 2 }}
                                />
                              )}
                            />
                          </Grid>
                          <Grid xs={12} sm={5}>
                            <Controller
                              name="ufEmissor"
                              control={control}
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  select
                                  fullWidth
                                  label="UF Emissor"
                                  error={!!fieldState.error}
                                  helperText={fieldState.error ? fieldState.error.message : ''}
                                  sx={{ mb: 2 }}
                                >
                                  {estadosOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              )}
                            />
                          </Grid>

                          {/* DDD (20%) | Telefone (80%) */}
                          <Grid xs={12} sm={2}>
                            <Controller
                              name="ddd"
                              control={control}
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={(e) =>
                                    field.onChange(String(e.target.value ?? '').replace(/\D/g, '').slice(0, 2))
                                  }
                                  fullWidth
                                  label="DDD"
                                  error={!!fieldState.error}
                                  helperText={fieldState.error ? fieldState.error.message : ''}
                                  sx={{ mb: 2 }}
                                  inputProps={{ inputMode: 'numeric', maxLength: 2 }}
                                />
                              )}
                            />
                          </Grid>
                          <Grid xs={12} sm={4}>
                            <Controller
                              name="phone"
                              control={control}
                              render={({ field, fieldState }) => (
                                <PhoneInput
                                  country="BR"
                                  fullWidth
                                  label="Telefone"
                                  value={
                                    `${String(formValues.ddd || '').replace(/\D/g, '') ? '+55' : ''}${String(formValues.ddd || '').replace(
                                      /\D/g,
                                      ''
                                    )}${(field.value || '').replace(/\D/g, '')}`
                                  }
                                  onChange={(newValue) => {
                                    const digits = String(newValue ?? '').replace(/\D/g, '');
                                    if (!digits) {
                                      setValue('ddd', '');
                                      setValue('phone', '');
                                      return;
                                    }

                                    const rest = digits.startsWith('55') ? digits.slice(2) : digits;
                                    const nextDdd = rest.slice(0, 2);
                                    const subscriberDigits = rest.slice(2);

                                    const formattedPhone =
                                      subscriberDigits.length === 9
                                        ? `${subscriberDigits.slice(0, 5)}-${subscriberDigits.slice(5)}`
                                        : subscriberDigits.length === 8
                                          ? `${subscriberDigits.slice(0, 4)}-${subscriberDigits.slice(4)}`
                                          : subscriberDigits;

                                    setValue('ddd', nextDdd);
                                    setValue('phone', formattedPhone);
                                  }}
                                  error={!!fieldState.error}
                                  helperText={fieldState.error ? fieldState.error.message : ''}
                                  sx={{ mb: 2 }}
                                />
                              )}
                            />
                          </Grid>

                          <Grid xs={6}>
                            <Controller
                              name="email"
                              control={control}
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="E-mail"
                                  error={!!fieldState.error}
                                  helperText={fieldState.error ? fieldState.error.message : ''}
                                  sx={{ mb: 2 }}
                                />
                              )}
                            />
                          </Grid>
                          <Grid xs={12}>
                            <Controller
                              name="senhaGov"
                              control={control}
                              render={({ field, fieldState }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  type="password"
                                  label="Senha do Gov.br"
                                  error={!!fieldState.error}
                                  helperText={fieldState.error?.message}
                                  sx={{ mb: 2 }}
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      )}
                    </>
                  )}
                </>
              )}

              <Box sx={{ mt: 4 }}>
                {activeStep === 1 && (
                  <>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Endereço
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid xs={12} sm={6}>
                        <Controller
                          name="cep"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => {
                                const next = formatCep(e.target.value);
                                field.onChange(next);
                                handleCepChange(next);
                              }}
                              fullWidth
                              label="CEP"
                              sx={{ mb: 2 }}
                              inputProps={{ inputMode: 'numeric' }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid xs={12} sm={6}>
                        <Controller
                          name="logradouro"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Endereço"
                              sx={{ mb: 2 }}
                              disabled
                            />
                          )}
                        />
                      </Grid>
                      <Grid xs={12} sm={6}>
                        <Controller
                          name="bairro"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Bairro"
                              sx={{ mb: 2 }}
                              disabled
                            />
                          )}
                        />
                      </Grid>
                      <Grid xs={12} sm={6}>
                        <Controller
                          name="cidade"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Cidade"
                              sx={{ mb: 2 }}
                              disabled
                            />
                          )}
                        />
                      </Grid>
                      <Grid xs={12} sm={6}>
                        <Controller
                          name="numero"
                          control={control}
                          render={({ field }) => (
                            <TextField {...field} fullWidth label="Número" sx={{ mb: 2 }} />
                          )}
                        />
                      </Grid>
                      <Grid xs={12} sm={6}>
                        <Controller
                          name="complemento"
                          control={control}
                          render={({ field }) => (
                            <TextField {...field} fullWidth label="Complemento" sx={{ mb: 2 }} />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </>
                )}
                {activeStep === 2 && (
                  <>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Informações do MEI
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid xs={12}>
                        <Controller
                          name="capitalSocial"
                          control={control}
                          render={({ field, fieldState }) => (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <NumericFormat
                                {...field}
                                fullWidth
                                label="Capital Social"
                                prefix="R$ "
                                decimalSeparator=","
                                thousandSeparator="."
                                fixedDecimalScale
                                decimalScale={2}
                                customInput={TextField}
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                                sx={{ mb: 2 }}
                              />
                              <Tooltip title="O capital social é o valor investido pelos sócios para iniciar as atividades da empresa.">
                                <IconButton size="small" sx={{ ml: 1 }}>
                                  <Iconify width={16} icon="eva:question-mark-circle-outline" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
                        />
                      </Grid>
                      <Grid xs={12}>
                      <Controller
                        name="atividadePrincipal"
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                            options={cnaes}
                            getOptionLabel={(option) => option.ocupacao}
                            value={field.value || null}
                            onChange={(_, newValue) => {
                                setValue("atividadePrincipal", newValue || null); // ⬅️ Armazena objeto completo
                                setValue(
                                "atividadesSecundarias",
                                getValues("atividadesSecundarias").filter((item) => item._id !== newValue?._id)
                                );
                                field.onChange(newValue || null);
                            }}
                            renderInput={(params) => <TextField {...params} label="Atividade Principal" fullWidth />}
                            />
                        )}
                        />
                      </Grid>

                      <Grid xs={12}>
                      <Controller
                        name="atividadesSecundarias"
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                            multiple
                            options={cnaes.filter((cnae) => cnae._id !== getValues("atividadePrincipal")?._id)}
                            getOptionLabel={(option) => option.ocupacao}
                            value={field.value || []}
                            onChange={(_, newValue) => {
                                setValue("atividadesSecundarias", newValue || []);
                                field.onChange(newValue || []);
                            }}
                            renderInput={(params) => <TextField {...params} label="Atividades Secundárias" fullWidth />}
                            />
                        )}
                        />

                      </Grid>

                      <Grid xs={12}>
                      <Controller
                        name="atuacao"
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                            options={atuacoesOptions}
                            getOptionLabel={(option) => option?.label || ""} // ✅ Garante que sempre tenha uma string válida
                            value={atuacoesOptions.find((opt) => opt.id === field.value?.id) || null} // ✅ Garante que um objeto válido seja selecionado
                            onChange={(_, newValue) => {
                                setValue("atuacao", newValue || null);
                                field.onChange(newValue || null);
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Forma de Atuação" fullWidth />
                            )}
                            />
                        )}
                        />

                      </Grid>
                    </Grid>
                  </>
                )}

                {/* Step 3 - Mensagem Final */}
                {activeStep === 3 && (
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    {aberturaExistente ? (
                      <>
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: 700, mb: 2, color: 'error.main' }}
                        >
                          Atenção! Já existe uma abertura em andamento! ⚠️
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          Nosso sistema identificou que já existe um pedido de abertura de MEI em
                          andamento. Caso precise de mais informações, entre em contato com nossa
                          equipe.
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          Você pode acompanhar seu processo pelo WhatsApp. 📲
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                          Tudo certo! Agora é com a gente! 🚀
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          Nosso time irá cuidar de todo o processo de abertura do seu MEI. Você não
                          precisa se preocupar!
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, color: 'error.main', mb: 2 }}
                        >
                          Para que possamos realizar a abertura, é necessário desativar a
                          autenticação em dois fatores da sua conta Gov.br.
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          Fique tranquilo! Vamos te manter atualizado sobre cada etapa do processo
                          pelo WhatsApp.
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          Se precisar de algo, estamos à disposição! 💬
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
              </Box>

              {/* Botões de navegação */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                {activeStep > 0 && (
                  <Button onClick={handleBack} variant="outlined">
                    Voltar
                  </Button>
                )}
                {
                  activeStep < 2 ? (
                    <Button onClick={handleNext} variant="contained">
                      Próximo
                    </Button>
                  ) : activeStep === 2 ? (
                    <Button
                      onClick={handleSubmit(onSubmit)}
                      variant="contained"
                      color="primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                      ) : (
                        'Abrir meu MEI'
                      )}
                    </Button>
                  ) : null /* 🔥 Remove o botão no Step 3 */
                }
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
