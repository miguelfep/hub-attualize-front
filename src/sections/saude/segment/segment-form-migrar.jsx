'use client';

import { z } from 'zod';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, FormProvider } from 'react-hook-form';

import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Stack,
  Button,
  Dialog,
  TextField,
  Typography,
  IconButton,
  useMediaQuery,
  LinearProgress,
  CircularProgress,
} from '@mui/material';

import { criarLead } from 'src/actions/lead';

import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

function formatCnpj(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function isValidCnpj(value) {
  const cnpj = value.replace(/\D/g, '');
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  const calcDigit = (base) => {
    let factor = base.length - 7;
    const sum = base
      .split('')
      .reduce((acc, digit) => {
        const result = acc + Number(digit) * factor;
        factor -= 1;
        if (factor < 2) factor = 9;
        return result;
      }, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const d1 = calcDigit(cnpj.slice(0, 12));
  const d2 = calcDigit(cnpj.slice(0, 12) + d1);

  return cnpj === cnpj.slice(0, 12) + String(d1) + String(d2);
}

// ----------------------------------------------------------------------

const STEP_SCHEMAS = [
  z.object({
    nome: z.string().min(2, 'Conta pra gente o seu nome :)'),
    telefone: z.string().min(10, 'Precisamos do seu WhatsApp para falar com você'),
  }),
  z.object({
    cnpj: z
      .string()
      .min(1, 'Digite o CNPJ da sua empresa')
      .refine(isValidCnpj, 'Esse CNPJ não parece válido — confira os números'),
    regimeTributario: z.string().min(1, 'Escolha uma opção (se não souber, sem problemas!)'),
    numeroFuncionarios: z.string().min(1, 'Escolha uma opção'),
  }),
  z.object({
    email: z.string().email('Hmm, esse e-mail parece incompleto').min(1, 'O e-mail é obrigatório'),
    faturamentoMensal: z.string().min(1, 'Escolha uma faixa (pode ser aproximada)'),
    observacoes: z.string().optional(),
  }),
];

const STEPS_META = [
  {
    title: 'Vamos nos conhecer!',
    subtitle: 'Como podemos te chamar e qual o melhor número para falarmos com você?',
  },
  {
    title: 'Sobre sua empresa',
    subtitle: 'Esses dados nos ajudam a preparar uma proposta certeira para a migração.',
  },
  {
    title: 'Último passo!',
    subtitle: 'Uma estimativa do faturamento já nos permite indicar o melhor plano.',
  },
];

const REGIME_OPTIONS = [
  { value: 'simples', label: 'Simples Nacional' },
  { value: 'presumido', label: 'Lucro Presumido' },
  { value: 'real', label: 'Lucro Real' },
  { value: 'nao-sei', label: 'Não sei 🤷' },
];

const FUNCIONARIOS_OPTIONS = [
  { value: '0', label: 'Nenhum' },
  { value: '1-5', label: '1 a 5' },
  { value: '6-10', label: '6 a 10' },
  { value: '11+', label: 'Mais de 10' },
];

const FATURAMENTO_OPTIONS = [
  { value: 'ate-20k', label: 'Até R$ 20 mil' },
  { value: '20k-100k', label: 'R$ 20 a 100 mil' },
  { value: '100k-300k', label: 'R$ 100 a 300 mil' },
  { value: 'acima-300k', label: 'Acima de R$ 300 mil' },
];

// ----------------------------------------------------------------------

function OptionChips({ name, options, accent, error, helperText }) {
  const theme = useTheme();

  return (
    <Controller
      name={name}
      render={({ field }) => (
        <Box>
          <Stack direction="row" flexWrap="wrap" sx={{ gap: 1 }}>
            {options.map((option) => {
              const selected = field.value === option.value;
              return (
                <Box
                  key={option.value}
                  role="button"
                  tabIndex={0}
                  onClick={() => field.onChange(option.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      field.onChange(option.value);
                    }
                  }}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 50,
                    cursor: 'pointer',
                    userSelect: 'none',
                    fontSize: '0.875rem',
                    fontWeight: selected ? 700 : 500,
                    color: selected ? accent : 'text.secondary',
                    border: selected
                      ? `2px solid ${accent}`
                      : `1px solid ${alpha(theme.palette.grey[500], 0.32)}`,
                    bgcolor: selected ? alpha(accent, 0.08) : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: accent,
                      bgcolor: alpha(accent, 0.04),
                    },
                  }}
                >
                  {option.label}
                </Box>
              );
            })}
          </Stack>
          {(error || helperText) && (
            <Typography
              variant="caption"
              sx={{ display: 'block', mt: 0.75, ml: 0.5, color: error ? 'error.main' : 'text.disabled' }}
            >
              {error || helperText}
            </Typography>
          )}
        </Box>
      )}
    />
  );
}

// ----------------------------------------------------------------------

export function SegmentFormMigrar({
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

  const totalSteps = STEP_SCHEMAS.length;
  const progress = submitted ? 100 : ((activeStep + 1) / (totalSteps + 1)) * 100;

  const methods = useForm({
    resolver: zodResolver(STEP_SCHEMAS[activeStep]),
    defaultValues: {
      nome: '',
      telefone: '',
      cnpj: '',
      regimeTributario: '',
      numeroFuncionarios: '',
      email: '',
      faturamentoMensal: '',
      observacoes: '',
    },
    mode: 'onTouched',
  });

  const { trigger, getValues, control, formState } = methods;
  const { errors } = formState;

  const handleClose = useCallback(() => {
    onClose();
    // Aguarda a animação de saída do Dialog antes de resetar o conteúdo
    setTimeout(() => {
      methods.reset();
      setActiveStep(0);
      setSubmitted(false);
    }, 300);
  }, [onClose, methods]);

  const handleBack = () => setActiveStep((s) => Math.max(0, s - 1));

  const handleAdvance = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    if (activeStep < totalSteps - 1) {
      setActiveStep((s) => s + 1);
      return;
    }

    setSubmitting(true);
    try {
      const formData = getValues();

      const regimeLabel =
        REGIME_OPTIONS.find((o) => o.value === formData.regimeTributario)?.label || '-';
      const funcionariosLabel =
        FUNCIONARIOS_OPTIONS.find((o) => o.value === formData.numeroFuncionarios)?.label || '-';
      const faturamentoLabel =
        FATURAMENTO_OPTIONS.find((o) => o.value === formData.faturamentoMensal)?.label || '-';

      // Resumo no campo observações garante visibilidade dos dados da empresa no CRM
      const resumoEmpresa = `[MIGRAÇÃO DE CONTADOR] CNPJ: ${formData.cnpj} | Regime: ${regimeLabel} | Funcionários: ${funcionariosLabel} | Faturamento mensal: ${faturamentoLabel}`;
      const observacoes = formData.observacoes
        ? `${resumoEmpresa}\n\n${formData.observacoes}`
        : resumoEmpresa;

      await criarLead({
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        cnpj: formData.cnpj,
        regimeTributario: formData.regimeTributario,
        numeroFuncionarios: formData.numeroFuncionarios,
        faturamentoMensal: formData.faturamentoMensal,
        receberOrcamento: 'whatsapp',
        observacoes,
        segment: leadSegment,
        origem: `${origem}-migracao`,
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
          <Iconify icon="solar:rocket-bold-duotone" width={28} sx={{ color: accent }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
            Migrar para a Attualize
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Troca sem burocracia — nós cuidamos de tudo com seu contador atual
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

      <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 380, lineHeight: 1.8 }}>
        Nossa equipe vai analisar as informações da sua empresa e entrar em contato pelo{' '}
        <strong>WhatsApp</strong> com uma proposta de migração. A troca é simples e sem parar a
        emissão de notas! 🚀
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
          <Controller
            name="cnpj"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="CNPJ da sua empresa"
                placeholder="00.000.000/0000-00"
                fullWidth
                autoFocus
                inputMode="numeric"
                onChange={(e) => field.onChange(formatCnpj(e.target.value))}
                error={!!errors.cnpj}
                helperText={errors.cnpj?.message}
              />
            )}
          />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
              Qual o regime tributário atual?
            </Typography>
            <OptionChips
              name="regimeTributario"
              options={REGIME_OPTIONS}
              accent={accent}
              error={errors.regimeTributario?.message}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
              Quantos funcionários CLT?
            </Typography>
            <OptionChips
              name="numeroFuncionarios"
              options={FUNCIONARIOS_OPTIONS}
              accent={accent}
              error={errors.numeroFuncionarios?.message}
            />
          </Box>
        </Stack>
      )}

      {activeStep === 2 && (
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

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
              Faturamento mensal médio
            </Typography>
            <OptionChips
              name="faturamentoMensal"
              options={FATURAMENTO_OPTIONS}
              accent={accent}
              error={errors.faturamentoMensal?.message}
              helperText="Usamos essa faixa apenas para indicar o plano ideal"
            />
          </Box>

          <Field.Text
            name="observacoes"
            label="Quer nos contar algo? (opcional)"
            placeholder="Ex.: estou insatisfeito com o atendimento, quero pagar menos impostos, tenho pendências..."
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
            startIcon={
              <Iconify
                icon="solar:double-alt-arrow-right-bold-duotone"
                sx={{ transform: 'rotate(180deg)' }}
              />
            }
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
          {activeStep === totalSteps - 1 ? 'Receber minha proposta' : 'Continuar'}
        </Button>
      </Stack>

      <Stack
        direction="row"
        spacing={0.75}
        alignItems="center"
        justifyContent="center"
        sx={{ mt: 2.5 }}
      >
        <Iconify icon="solar:shield-check-bold-duotone" width={16} sx={{ color: 'success.main' }} />
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

      {submitted ? renderSuccess : <FormProvider {...methods}>{renderForm}</FormProvider>}
    </Dialog>
  );
}
