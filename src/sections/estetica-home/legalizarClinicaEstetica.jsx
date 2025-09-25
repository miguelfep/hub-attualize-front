import { toast } from 'sonner';
import React, { useState } from 'react';
import InputMask from 'react-input-mask';
import { m, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';

import { alpha, styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Step,
  Grid,
  Chip,
  Paper,
  Stack,
  Alert,
  Button,
  Stepper,
  Container,
  TextField,
  StepLabel,
  Accordion,
  AlertTitle,
  Typography,
  StepConnector,
  AccordionSummary,
  AccordionDetails,
  stepConnectorClasses,
} from '@mui/material';

import { criarLead } from 'src/actions/lead';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

const steps = [
    {
    label: 'Viabilidade do Endereço',
    description: (
      <>
        <Typography variant="body1" paragraph sx={{ color: 'text.secondary' }}>
          Este é o ponto de partida oficial, é aqui que você descobre se seu negócio poderá existir naquele endereço.
        </Typography>

        <Paper variant="outlined" sx={{ p: 2.5, mt: 3, borderRadius: 2, bgcolor: 'background.neutral' }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Iconify icon="solar:checklist-bold" width={20} color="primary.main" />
            <Typography variant="subtitle1">Dados Necessários</Typography>
          </Stack>
          <Stack spacing={1.5} sx={{ pl: 0.5 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Iconify icon="eva:checkmark-circle-2-fill" width={20} color="primary.main" />
              <Typography variant="body2">Carnê do IPTU do endereço</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Iconify icon="eva:checkmark-circle-2-fill" width={20} color="primary.main" />
              <Typography variant="body2">Metragem do imóvel</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Iconify icon="eva:checkmark-circle-2-fill" width={20} color="primary.main" />
              <Typography variant="body2">Atividades que serão exercidas</Typography>
            </Stack>
          </Stack>
        </Paper>
      </>
    ),
  },
  {
    label: 'Registro na Junta Comercial',
    description: (
      <>
        <Typography variant="body1" paragraph sx={{ color: 'text.secondary' }}>
          Este é a certidão de nascimento da sua empresa. É o que
          cria a base legal para sua clínica operar e te permite avançar para os próximos passos com
          segurança.
        </Typography>

        <Paper variant="outlined" sx={{ p: 2.5, mt: 3, borderRadius: 2, bgcolor: 'background.neutral' }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Iconify icon="solar:clipboard-check-bold-duotone" width={32} color="primary.main" />
            <Typography variant="subtitle1">Documentos Essenciais</Typography>
          </Stack>
          <Stack spacing={1.5} sx={{ pl: 0.5 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Iconify icon="eva:checkmark-circle-2-fill" width={20} color="primary.main" />
              <Typography variant="body2">Contrato social da empresa</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Iconify icon="eva:checkmark-circle-2-fill" width={20} color="primary.main" />
              <Typography variant="body2">Documentos dos sócios (RG, CPF, etc.)</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Iconify icon="eva:checkmark-circle-2-fill" width={20} color="primary.main" />
              <Typography variant="body2">Requerimento de Empresário (se aplicável)</Typography>
            </Stack>
          </Stack>
        </Paper>
      </>
    ),
  },
  {
    label: 'Tipos de Empresa para Clínicas de Estética',
    description: (
      <>
        <Typography variant="body1" paragraph sx={{ color: 'text.secondary' }}>
          Essa escolha define o futuro tributário e legal do seu negócio. Pense nela como a
          escolha da fundação de uma casa. Analise cada opção para ver qual se encaixa no seu
          momento e visão.
        </Typography>

        <Box sx={{ my: 3 }}>
          <Accordion sx={{ bgcolor: 'transparent', boxShadow: 'none', '&:before': { display: 'none' }, borderTop: 1, borderColor: 'divider' }}>
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Iconify icon="solar:user-circle-bold-duotone" width={24} color="text.secondary" />
                <Typography variant="subtitle1">MEI</Typography>
                <Chip label="Para autônomos" size="small" color="primary" variant="soft" />
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Ideal para quem está começando sozinho e tem um faturamento anual de até R$ 81.000. É a
                forma mais simples de formalização, com impostos reduzidos em guia única (DAS).
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ bgcolor: 'transparent', boxShadow: 'none', '&:before': { display: 'none' }, borderTop: 1, borderColor: 'divider' }}>
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Iconify icon="solar:buildings-2-bold-duotone" width={24} color="text.secondary" />
                <Typography variant="subtitle1">Microempresa (ME)</Typography>
                <Chip label="Negócio em crescimento" size="small" color="info" variant="soft" />
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Para clínicas com faturamento anual de até R$ 360.000. Permite contratar mais
                funcionários e oferece mais opções de regimes tributários, como o Simples Nacional.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ bgcolor: 'transparent', boxShadow: 'none', '&:before': { display: 'none' }, borderTop: 1, borderBottom: 1, borderColor: 'divider' }}>
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Iconify icon="solar:users-group-rounded-bold-duotone" width={24} color="text.secondary" />
                <Typography variant="subtitle1">Sociedade Limitada (LTDA)</Typography>
                <Chip label="Para sócios" size="small" color="warning" variant="soft" />
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Perfeito para clínicas com dois ou mais sócios. O patrimônio pessoal de cada um é
                protegido, e as responsabilidades são divididas de acordo com o capital investido.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </>
    ),
  },
  {
    label: 'CNPJ: a identidade de sua clínica',
    description: (
      <>
        <Typography variant="body1" paragraph sx={{ color: 'text.secondary' }}>
          O CNPJ é <b>documento</b> que transforma sua clínica de estética em uma empresa formal.
          Com ele, você poderá <b>emitir notas fiscais</b>, <b>firmar contratos</b>, <b>abrir conta PJ</b> e muito mais.
        </Typography>
        <Alert severity="info" icon={<Iconify icon="solar:document-add-bold-duotone" />} sx={{ mt: 3 }}>
          <AlertTitle>Ação Necessária</AlertTitle>
            O cadastro é feito diretamente na Receita Federal. Vinculado ao protocolo da Junta Comercial.
        </Alert>
      </>
    ),
  },
  {
    label: 'Alvará de Funcionamento',
    description: (
      <>
        <Typography variant="body1" paragraph sx={{ color: 'text.secondary' }}>
          Sem o alvará, sua clínica não pode atuar legalmente. Esse documento assegura que o espaço
          físico atende às exigências da lei e transmite <b>credibilidade aos seus clientes.</b></Typography>
        <Alert severity="info" icon={<Iconify icon="solar:map-point-wave-bold-duotone" />} sx={{ mt: 3 }}>
          <AlertTitle>Fique Atento</AlertTitle>
            A vistoria dos órgãos como vigilância será necessária! Por isso, garanta que sua clínica
            esteja preparada em relação a todos os protocolos sanitários como <b>saída de emergência,
            acessibilidade etc</b>
        </Alert>
      </>
    ),
  },
  {
    label: 'Licença da Vigilância Sanitária',
    description: (
      <>
        <Typography variant="subtitle1" paragraph sx={{ color: 'text.secondary' }}>
          Para clínicas de estética, este é um dos passos mais importantes. A licença garante aos clientes que
          sua clínica <b>segue padrões rígidos de segurança</b>, transmitindo confiança desde o primeiro atendimento.
        </Typography>
        <Alert severity="warning" icon={<Iconify icon="solar:shield-warning-bold-duotone" />} sx={{ mt: 3 }}>
          <AlertTitle>Passo Obrigatório e Essencial</AlertTitle>
          <Stack spacing={1} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Iconify icon="pepicons-pop:checkmark-filled" width={16} />
              <Typography variant="body2">Prepare seu <b>Manual de Boas Práticas</b>.</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Iconify icon="pepicons-pop:checkmark-filled" width={16} />
              <Typography variant="body2">Mantenha os <b>certificados de manutenção dos equipamentos</b> sempre em dia.</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Iconify icon="pepicons-pop:checkmark-filled" width={16} />
              <Typography variant="body2">Aualize regularmente o <b>registro de esterilização</b>.</Typography>
            </Stack>
          </Stack>
        </Alert>
      </>
    ),
  },
  {
    label: 'Deixe em dia suas Obrigações Fiscais',
    description: (
      <>
        <Typography variant="body1" paragraph sx={{ color: 'text.secondary' }}>
          Não deixar as obrigações fiscais em dia pode gerar multas, bloqueios e até dificuldades para manter sua clínica ativa.
          Organizar essa parte é essencial para manter a <b>tranquilidade e a confiança dos seus clientes</b>.
        </Typography>
        <Alert severity="success" icon={<Iconify icon="solar:banknote-2-bold-duotone" />} sx={{ mt: 3 }}>
          <AlertTitle>Dica de Ouro</AlertTitle>
            Ter uma contabilidade especializada em estética significa não se preocupar com prazos fiscais.
            Ela também mantém tudo regularizado para que sua energia esteja onde deve estar: <b>cuidando dos seus clientes</b>
        </Alert>
      </>
    ),
  },
  {
    label: 'Vamos simplificar sua contabilidade?',
    description: (
        <Paper
          sx={{
            p: 3,
            borderLeft: 4,
            borderColor: 'primary.main',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Iconify icon="solar:chat-round-like-bold-duotone" width={40} color="primary.main" />
            <Box>
              <Typography variant="h6" sx={{ color: 'primary.darker' }}>Você chegou ao final!</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' , mt: 1 }}>
                <i>Abrir e manter uma clínica de estética pode ser mais fácil do que você imagina.</i>
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                Preencha seus dados e descubra como pagar menos impostos, ter mais segurança e crescer com tranquilidade.
              </Typography>
            </Box>
          </Stack>
        </Paper>
    ),
    isFormStep: true,
  },
];

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.primary.main,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.primary.main,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.divider,
    borderLeftWidth: 2,
    minHeight: 24,
    marginLeft: '11px'
  },
}));

const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.background.default,
  zIndex: 1,
  color: ownerState.active ? theme.palette.primary.main : theme.palette.text.disabled,
  width: 24,
  height: 24,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  border: `2px solid ${ownerState.active ? theme.palette.primary.main : theme.palette.divider}`,
  ...(ownerState.completed && {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
  }),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className, icon } = props;

  const icons = {
    1: <Iconify icon="streamline-flex:street-road-solid" width={16} />,
    2: <Iconify icon="solar:file-text-line-duotone" width={16} />,
    3: <Iconify icon="solar:buildings-line-duotone" width={16} />,
    4: <Iconify icon="solar:document-add-line-duotone" width={16} />,
    5: <Iconify icon="solar:map-point-line-duotone" width={16} />,
    6: <Iconify icon="solar:shield-check-line-duotone" width={16} />,
    7: <Iconify icon="solar:card-2-line-duotone" width={16} />,
    8: <Iconify icon="solar:chat-round-like-line-duotone" width={16} />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {completed ? <Iconify icon="eva:checkmark-fill" width={16} /> : icons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}

export function LegalizarClinicaEsteticaStepper() {
  const theme = useTheme();

  const [activeStep, setActiveStep] = useState(0);

  const { handleSubmit, control, formState: { errors } } = useForm( {
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      origem: 'paginaEstetica',
    },
  });

  const handleNext = () => {
    if (steps[activeStep].isFormStep) return;
    setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
  };
  const handleBack = () => setActiveStep((prev) => (prev > 0 ? prev - 1 : prev));
  const handleStep = (step) => () => setActiveStep(step);
  const handleReset = () => setActiveStep(0);


  const onSubmit = async (data) => {
    try {
      const res = await criarLead(data);

      if (res.status === 201) {
        handleReset();
      }
    } catch (error) {
      console.error('Erro ao enviar os dados:', error);
      toast.error('Erro ao enviar os dados');
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.neutral' }}>
      <Container component={MotionViewport} sx={{ py: { xs: 10, md: 15 } }}>
        <Stack spacing={4} sx={{ textAlign: 'center', mb: { xs: 8, md: 10 } }}>
          <m.div variants={varFade().inUp}>
            <Typography variant="h3" component="h2">
              Como Legalizar uma Clínica de Estética?
            </Typography>
          </m.div>
          <m.div variants={varFade().inUp}>
            <Typography sx={{ color: 'text.secondary' }}>
              Conheça os principais passos para legalizar sua clínica e operar com segurança e
              tranquilidade, transmitindo confiança para seus clientes e parceiros.
            </Typography>
          </m.div>
        </Stack>

        <Grid container spacing={{ xs: 3, md: 6 }}>
          <Grid item xs={12} md={4}>
            <m.div variants={varFade().inLeft}>
              <Stepper
                activeStep={activeStep}
                orientation="vertical"
                connector={<ColorlibConnector />}
              >
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel
                      StepIconComponent={ColorlibStepIcon}
                      onClick={handleStep(index)}
                      sx={{
                        cursor: 'pointer',
                        py: 1,
                        '& .MuiStepLabel-label': {
                          transition: 'color 0.2s ease'
                        },
                        '&:hover .MuiStepLabel-label': {
                          color: 'primary.main'
                        }
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: activeStep === index ? 'fontWeightBold' : 'fontWeightRegular',
                          color: activeStep === index ? 'primary.main' : 'text.primary',
                        }}
                      >
                        {step.label}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </m.div>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper
              elevation={3}
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 2,
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease'
              }}
            >
              <AnimatePresence mode="wait">
                <m.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%' }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ mb: 3, color: 'primary.main' }}>
                      {steps[activeStep].label}
                    </Typography>
                    {steps[activeStep].description}
                    {steps[activeStep].isFormStep && (
                      <Stack spacing={2} sx={{ mt: 3 }}>
                        <Controller
                          name="nome"
                          control={control}
                          rules={{
                            required: 'Nome é obrigatório!',
                            minLength: {
                              value: 5,
                              message: 'Nome deve ter pelo menos 5 caracteres!',
                            },
                          }}
                          render={({ field, fieldState: { error } }) => (
                            <TextField
                              {...field}
                              label="Nome"
                              error={!!error}
                              helperText={error?.message}
                              fullWidth
                            />
                          )}
                        />
                        <Controller
                          name="email"
                          control={control}
                          rules={{
                            required: 'O e-mail é obrigatório',
                            pattern: {
                              value: /^\S+@\S+\.\S+$/,
                              message: 'Insira um endereço de e-mail válido!',
                            },
                          }}
                          render={({ field, fieldState: { error } }) => (
                            <TextField
                              {...field}
                              label="Email"
                              type="email"
                              fullWidth
                              error={!!error}
                              helperText={error?.message}
                            />
                          )}
                        />
                        <Controller
                          name="telefone"
                          control={control}
                          rules={{
                            required: 'O telefone é obrigatório',
                            pattern: {
                              value: /\(\d{2}\)\s\d\s\d{4}-\d{4}/,
                              message: 'Insira um número de telefone válido',
                            },
                          }}
                          render={({ field, fieldState: { error } }) => (
                            <InputMask
                              mask="(99) 9 9999-9999"
                              value={field.value || ''}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                            >
                              {(inputProps) => (
                                <TextField
                                  {...inputProps}
                                  label="Telefone"
                                  fullWidth
                                  error={!!error}
                                  helperText={error?.message}
                                />
                              )}
                            </InputMask>
                          )}
                        />
                      </Stack>
                    )}
                  </Box>

                  <Stack direction="row" spacing={2} sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
                    >
                      Voltar
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    {steps[activeStep].isFormStep ? (
                       <Button
                         variant="contained"
                         color="primary"
                         onClick={handleSubmit(onSubmit)}
                         size="large"
                         endIcon={<Iconify icon="eva:message-circle-fill" />}
                       >
                         Falar com especialista
                       </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
                      >
                        Próximo
                      </Button>
                    )}
                  </Stack>
                </m.div>
              </AnimatePresence>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
