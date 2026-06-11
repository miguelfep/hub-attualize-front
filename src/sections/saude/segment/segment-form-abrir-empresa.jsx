'use client';

import { z } from 'zod';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';

import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Stack,
  Button,
  Dialog,
  Typography,
  IconButton,
  useMediaQuery,
  LinearProgress,
  CircularProgress,
} from '@mui/material';

import { buscarCep } from 'src/actions/cep';
import { criarLead } from 'src/actions/lead';

import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const STEP_SCHEMAS = [
  z.object({
    nome: z.string().min(2, 'Conta pra gente o seu nome :)'),
    telefone: z.string().min(10, 'Precisamos do seu WhatsApp para enviar o orçamento'),
  }),
  z.object({
    email: z.string().email('Hmm, esse e-mail parece incompleto').min(1, 'O e-mail é obrigatório'),
    cep: z.string().min(8, 'Digite um CEP válido'),
    estado: z.string().min(2, 'Estado obrigatório'),
    cidade: z.string().min(1, 'Cidade obrigatória'),
  }),
  z.object({
    receberOrcamento: z.string().min(1, 'Escolha como prefere receber o orçamento'),
    observacoes: z.string().optional(),
  }),
];

const STEPS_META = [
  {
    title: 'Vamos nos conhecer!',
    subtitle: 'Como podemos te chamar e qual o melhor número para falarmos com você?',
  },
  {
    title: 'Onde você está?',
    subtitle: 'Digite seu CEP e preenchemos a cidade automaticamente.',
  },
  {
    title: 'Último passo!',
    subtitle: 'Como você prefere receber seu orçamento?',
  },
];

const CONTATO_OPTIONS = [
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    description: 'Resposta mais rápida',
    icon: 'mdi:whatsapp',
    color: '#28a745',
  },
  {
    value: 'email',
    label: 'E-mail',
    description: 'Proposta detalhada',
    icon: 'solar:letter-bold-duotone',
    color: '#0096D9',
  },
];

// ----------------------------------------------------------------------

export function SegmentFormAbrirEmpresa({
  open,
  onClose,
  origem = 'site-saude',
  leadSegment = 'saude',
  accent = '#0096D9',
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  const totalSteps = STEP_SCHEMAS.length;
  const progress = submitted ? 100 : ((activeStep + 1) / (totalSteps + 1)) * 100;

  const methods = useForm({
    resolver: zodResolver(STEP_SCHEMAS[activeStep]),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      cep: '',
      estado: '',
      cidade: '',
      receberOrcamento: 'whatsapp',
      observacoes: '',
    },
    mode: 'onTouched',
  });

  const { trigger, getValues, setValue, watch, formState } = methods;
  const { errors } = formState;

  const receberOrcamento = watch('receberOrcamento');
  const cidade = watch('cidade');
  const estado = watch('estado');

  const handleClose = useCallback(() => {
    onClose();
    // Aguarda a animação de saída do Dialog antes de resetar o conteúdo
    setTimeout(() => {
      methods.reset();
      setActiveStep(0);
      setSubmitted(false);
    }, 300);
  }, [onClose, methods]);

  const handleCepChange = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      setBuscandoCep(true);
      try {
        const endereco = await buscarCep(cep);
        if (endereco) {
          setValue('estado', endereco.estado, { shouldValidate: true });
          setValue('cidade', endereco.cidade, { shouldValidate: true });
        }
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  const handleBack = () => setActiveStep((s) => Math.max(0, s - 1));

  const handleAdvance = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    if (activeStep < totalSteps - 1) {
      setActiveStep((s) => s + 1);
      return;
    }

    // Última etapa: envia o lead
    setSubmitting(true);
    try {
      const formData = getValues();
      await criarLead({
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        cep: formData.cep,
        estado: formData.estado,
        cidade: formData.cidade,
        receberOrcamento: formData.receberOrcamento,
        observacoes: formData.observacoes,
        segment: leadSegment,
        origem,
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      methods.setError('observacoes', {
        message: 'Não conseguimos enviar agora. Tente novamente em instantes.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !submitted) {
      e.preventDefault();
      handleAdvance();
    }
  };

  const renderHeader = (
    <Box
      sx={{
        position: 'relative',
        px: 3,
        pt: 3,
        pb: 2.5,
        background: `linear-gradient(135deg, ${alpha(accent, 0.12)} 0%, ${alpha(accent, 0.04)} 100%)`,
      }}
    >
      <IconButton
        onClick={handleClose}
        size="small"
        aria-label="Fechar"
        sx={{ position: 'absolute', top: 12, right: 12, color: 'text.secondary' }}
      >
        <Iconify icon="solar:close-circle-bold-duotone" width={26} />
      </IconButton>

      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(accent, 0.15),
            flexShrink: 0,
          }}
        >
          <Iconify icon="solar:buildings-2-bold-duotone" width={28} sx={{ color: accent }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
            Abrir Minha Empresa
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Orçamento gratuito e sem compromisso · leva menos de 1 minuto
          </Typography>
        </Box>
      </Stack>
    </Box>
  );

  const renderSuccess = (
    <Stack spacing={2.5} alignItems="center" sx={{ px: 4, py: 6, textAlign: 'center' }}>
      <Box
        sx={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha('#28a745', 0.12),
        }}
      >
        <Iconify icon="solar:check-circle-bold" width={56} sx={{ color: '#28a745' }} />
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        Recebemos seus dados!
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360, lineHeight: 1.8 }}>
        Nossa equipe vai preparar seu orçamento e entrar em contato{' '}
        {receberOrcamento === 'whatsapp' ? (
          <>
            pelo <strong>WhatsApp</strong>
          </>
        ) : (
          <>
            por <strong>e-mail</strong>
          </>
        )}{' '}
        em breve. Fique de olho! 😉
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={handleClose}
        sx={{
          mt: 1,
          px: 5,
          borderRadius: 50,
          fontWeight: 700,
          bgcolor: accent,
          '&:hover': { bgcolor: alpha(accent, 0.85) },
        }}
      >
        Fechar
      </Button>
    </Stack>
  );

  const renderStepFields = (
    <>
      {activeStep === 0 && (
        <Stack spacing={2.5}>
          <Field.Text
            name="nome"
            label="Seu nome"
            placeholder="Como podemos te chamar?"
            fullWidth
            autoFocus
            error={!!errors.nome}
            helperText={errors.nome?.message}
          />
          <Field.Phone
            name="telefone"
            label="WhatsApp"
            placeholder="(00) 00000-0000"
            fullWidth
            error={!!errors.telefone}
            helperText={errors.telefone?.message}
          />
        </Stack>
      )}

      {activeStep === 1 && (
        <Stack spacing={2.5}>
          <Field.Text
            name="email"
            label="Seu melhor e-mail"
            placeholder="nome@email.com"
            fullWidth
            autoFocus
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <Field.Text
            name="cep"
            label="CEP"
            placeholder="00000-000"
            fullWidth
            onBlur={handleCepChange}
            error={!!errors.cep}
            helperText={errors.cep?.message || 'Cidade e estado são preenchidos automaticamente'}
            InputProps={{
              endAdornment: buscandoCep ? <CircularProgress size={18} /> : null,
            }}
          />
          {(cidade || estado) && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: alpha(accent, 0.06),
                border: `1px dashed ${alpha(accent, 0.3)}`,
              }}
            >
              <Iconify icon="solar:map-point-bold-duotone" width={20} sx={{ color: accent }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {cidade}
                {cidade && estado ? ' - ' : ''}
                {estado}
              </Typography>
            </Stack>
          )}
          {(errors.cidade || errors.estado) && !cidade && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              Não encontramos seu CEP — confira o número digitado.
            </Typography>
          )}
        </Stack>
      )}

      {activeStep === 2 && (
        <Stack spacing={2.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {CONTATO_OPTIONS.map((option) => {
              const selected = receberOrcamento === option.value;
              return (
                <Box
                  key={option.value}
                  role="button"
                  tabIndex={0}
                  onClick={() => setValue('receberOrcamento', option.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setValue('receberOrcamento', option.value);
                    }
                  }}
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    border: selected
                      ? `2px solid ${option.color}`
                      : `1px solid ${alpha(theme.palette.grey[500], 0.24)}`,
                    bgcolor: selected ? alpha(option.color, 0.06) : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: option.color,
                      bgcolor: alpha(option.color, 0.04),
                    },
                  }}
                >
                  <Iconify icon={option.icon} width={28} sx={{ color: option.color }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {option.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {option.description}
                    </Typography>
                  </Box>
                  <Iconify
                    icon={selected ? 'solar:check-circle-bold' : 'solar:stop-circle-bold'}
                    width={22}
                    sx={{ color: selected ? option.color : alpha(theme.palette.grey[500], 0.4) }}
                  />
                </Box>
              );
            })}
          </Stack>

          <Field.Text
            name="observacoes"
            label="Quer nos contar algo? (opcional)"
            placeholder="Ex.: já atendo como autônomo, tenho pressa para abrir, quero migrar de contador..."
            fullWidth
            multiline
            rows={3}
            error={!!errors.observacoes}
            helperText={errors.observacoes?.message}
          />
        </Stack>
      )}
    </>
  );

  const renderForm = (
    <Box onKeyDown={handleKeyDown} sx={{ px: 3, py: 3 }}>
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography variant="caption" sx={{ color: accent, fontWeight: 700 }}>
          PASSO {activeStep + 1} DE {totalSteps}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {STEPS_META[activeStep].title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {STEPS_META[activeStep].subtitle}
        </Typography>
      </Stack>

      {renderStepFields}

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 4 }}>
        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            color="inherit"
            startIcon={<Iconify icon="solar:double-alt-arrow-right-bold-duotone" sx={{ transform: 'rotate(180deg)' }} />}
            sx={{ fontWeight: 600, flexShrink: 0 }}
          >
            Voltar
          </Button>
        )}

        <Button
          fullWidth
          size="large"
          variant="contained"
          onClick={handleAdvance}
          disabled={submitting}
          endIcon={
            submitting ? (
              <CircularProgress size={18} sx={{ color: 'inherit' }} />
            ) : (
              <Iconify
                icon={
                  activeStep === totalSteps - 1
                    ? 'solar:check-circle-bold'
                    : 'solar:double-alt-arrow-right-bold-duotone'
                }
              />
            )
          }
          sx={{
            py: 1.5,
            borderRadius: 50,
            fontWeight: 800,
            fontSize: '1rem',
            bgcolor: accent,
            boxShadow: `0 8px 20px ${alpha(accent, 0.35)}`,
            '&:hover': { bgcolor: alpha(accent, 0.85) },
          }}
        >
          {activeStep === totalSteps - 1 ? 'Receber meu orçamento grátis' : 'Continuar'}
        </Button>
      </Stack>

      <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center" sx={{ mt: 2.5 }}>
        <Iconify
          icon="solar:shield-check-bold-duotone"
          width={16}
          sx={{ color: 'success.main' }}
        />
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          Seus dados estão seguros — nada de spam, prometemos.
        </Typography>
      </Stack>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 3,
          overflow: 'hidden',
        },
      }}
    >
      {renderHeader}

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 4,
          bgcolor: alpha(accent, 0.1),
          '& .MuiLinearProgress-bar': { bgcolor: accent },
        }}
      />

      {submitted ? (
        renderSuccess
      ) : (
        <FormProvider {...methods}>{renderForm}</FormProvider>
      )}
    </Dialog>
  );
}
