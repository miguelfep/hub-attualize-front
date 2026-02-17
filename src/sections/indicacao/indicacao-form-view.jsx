'use client';

import * as zod from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';

import { useIndicacoes } from 'src/hooks/use-indicacoes';

import { formatCPF, formatTelefone } from 'src/utils/formatters';
import { validarCPF, validarTelefone } from 'src/utils/validators';

import { validarCodigoIndicacao } from 'src/actions/indicacao';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const IndicacaoSchema = zod.object({
  nome: zod.string().min(1, { message: 'Nome é obrigatório' }),
  email: zod.string().email({ message: 'Email inválido' }),
  telefone: zod
    .string()
    .min(10, { message: 'Telefone inválido' })
    .refine((val) => validarTelefone(val), { message: 'Telefone inválido' }),
  cpf: zod
    .string()
    .optional()
    .refine((val) => !val || validarCPF(val), { message: 'CPF inválido' }),
  estado: zod.string().optional(),
  cidade: zod.string().optional(),
  observacoes: zod.string().optional(),
});

// ----------------------------------------------------------------------

export function IndicacaoFormView({ codigo }) {
  const router = useRouter();
  const { criar } = useIndicacoes();
  const [success, setSuccess] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [indicadorInfo, setIndicadorInfo] = useState({ codigo });
  const [loadingCodigo, setLoadingCodigo] = useState(true);
  

  // Validar código e buscar informações do indicador (opcional)
  useEffect(() => {
    const validarCodigo = async () => {
      try {
        setLoadingCodigo(true);
        const response = await validarCodigoIndicacao(codigo);
        setIndicadorInfo(response);
      } catch (error) {
        console.error('Erro ao validar código:', error);
        // Se o endpoint não existir (404), continua mesmo assim
        if (error.response?.status === 404 || error.message?.includes('404')) {
          console.warn('Endpoint de validação não implementado, usando código básico');
          setIndicadorInfo({ codigo, nomeEmpresa: null });
        } else {
          // Para outros erros, mostra mensagem mas permite continuar
          setIndicadorInfo({ codigo, nomeEmpresa: null });
        }
      } finally {
        setLoadingCodigo(false);
      }
    };

    if (codigo) {
      validarCodigo();
    } else {
      setLoadingCodigo(false);
    }
  }, [codigo]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    clearErrors,
  } = useForm({
    resolver: zodResolver(IndicacaoSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      estado: '',
      cidade: '',
      observacoes: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoadingSubmit(true);
      
      await criar({
        codigoIndicacao: codigo,
        ...data,
      });
      
      setSuccess(true);
      reset();
    } catch (error) {
      console.error('Erro ao enviar indicação:', error);
    } finally {
      setLoadingSubmit(false);
    }
  });

  const theme = useTheme();

  if (success) {
    return (
      <Box sx={{ bgcolor: 'background.neutral', minHeight: '100vh', py: 8 }}>
        <Container maxWidth="md">
          <Card 
            sx={{ 
              p: { xs: 4, md: 6 }, 
              textAlign: 'center',
              boxShadow: theme.customShadows.z24,
            }}
          >
            <Box 
              sx={{ 
                mb: 3,
                '& svg': {
                  animation: 'pulse 2s infinite',
                },
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                },
              }}
            >
              <Iconify 
                icon="solar:verified-check-bold-duotone" 
                width={100} 
                sx={{ color: 'success.main' }} 
              />
            </Box>
            
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
              🎉 Indicação recebida com sucesso!
            </Typography>
            
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 480, mx: 'auto' }}>
              Nosso time de especialistas entrará em contato em até 24 horas para apresentar soluções personalizadas para sua empresa.
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Stack spacing={2} sx={{ mb: 4 }}>
              <Typography variant="subtitle1" color="primary.main" fontWeight={600}>
                Próximos passos:
              </Typography>
              
              <Stack spacing={2} alignItems="center">
                {[
                  { icon: 'solar:phone-calling-bold-duotone', text: 'Análise do seu perfil' },
                  { icon: 'solar:calendar-mark-bold-duotone', text: 'Agendamento de reunião' },
                  { icon: 'solar:star-bold-duotone', text: 'Proposta personalizada' },
                ].map((step, index) => (
                  <Paper 
                    key={index}
                    sx={{ 
                      p: 2, 
                      width: '100%',
                      maxWidth: 400,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    }}
                  >
                    <Iconify icon={step.icon} width={32} sx={{ color: 'primary.main' }} />
                    <Typography variant="body1">{step.text}</Typography>
                  </Paper>
                ))}
              </Stack>
            </Stack>
            
            <Button 
              variant="contained" 
              size="large"
              onClick={() => router.push('/')}
              sx={{ minWidth: 200 }}
            >
              Voltar para o site
            </Button>
          </Card>
        </Container>
      </Box>
    );
  }

  if (loadingCodigo) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="h6">Carregando...</Typography>
          </Stack>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.neutral' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'common.white',
          py: { xs: 6, md: 10 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/assets/background/overlay_3.jpg)',
            opacity: 0.1,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          },
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3} alignItems="center" textAlign="center" sx={{ position: 'relative', zIndex: 1 }}>
            {indicadorInfo?.nomeEmpresa && (
              <Chip
                icon={<Iconify icon="solar:star-bold-duotone" />}
                label={`Indicado por ${indicadorInfo.nomeEmpresa}`}
                sx={{
                  bgcolor: alpha(theme.palette.common.white, 0.2),
                  color: 'common.white',
                  fontWeight: 600,
                  px: 2,
                  height: 40,
                  fontSize: '0.95rem',
                  backdropFilter: 'blur(10px)',
                  '& .MuiChip-icon': {
                    color: 'warning.light',
                  },
                }}
              />
            )}

            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 800,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              🎯 Você foi escolhido para receber uma consultoria especializada!
            </Typography>

            <Typography 
              variant="h5" 
              sx={{ 
                maxWidth: 700,
                opacity: 0.95,
                fontWeight: 400,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
              }}
            >
              Simplifique sua contabilidade e foque no crescimento do seu negócio. 
              Atendimento 100% digital e especializado no seu segmento.
            </Typography>

            <Stack direction="row" spacing={3} flexWrap="wrap" justifyContent="center">
              {[
                { icon: 'solar:shield-check-bold-duotone', text: 'Seguro e confiável' },
                { icon: 'solar:clock-circle-bold-duotone', text: 'Atendimento 24h' },
                { icon: 'solar:medal-ribbons-star-bold-duotone', text: '+500 empresas atendidas' },
              ].map((item, index) => (
                <Stack key={index} direction="row" spacing={1} alignItems="center">
                  <Iconify icon={item.icon} width={24} />
                  <Typography variant="body2" fontWeight={600}>
                    {item.text}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {[
            {
              icon: 'solar:wallet-money-bold-duotone',
              title: 'Economia Garantida',
              description: 'Reduza custos operacionais em até 40% com nossa gestão inteligente',
              color: 'success',
            },
            {
              icon: 'solar:shield-user-bold-duotone',
              title: 'Time Especializado',
              description: 'Contadores experientes dedicados ao seu segmento de negócio',
              color: 'primary',
            },
            {
              icon: 'solar:graph-up-bold-duotone',
              title: 'Crescimento Acelerado',
              description: 'Relatórios estratégicos para tomada de decisões assertivas',
              color: 'info',
            },
            {
              icon: 'solar:chat-round-money-bold-duotone',
              title: 'Suporte Prioritário',
              description: 'Canal direto com seu contador via WhatsApp e videochamada',
              color: 'warning',
            },
          ].map((benefit, index) => (
            <Grid key={index} xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.customShadows.z20,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette[benefit.color].main, 0.12),
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <Iconify icon={benefit.icon} width={32} sx={{ color: `${benefit.color}.main` }} />
                </Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                  {benefit.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {benefit.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Form Section */}
        <Grid container spacing={4} alignItems="flex-start">
          <Grid xs={12} md={7}>
            <Card sx={{ p: { xs: 3, md: 4 }, boxShadow: theme.customShadows.z16 }}>
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Iconify icon="solar:document-text-bold-duotone" width={28} sx={{ color: 'primary.main' }} />
                    <Typography variant="h4" fontWeight={700}>
                      Solicite sua Consultoria Gratuita
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Preencha os dados abaixo. Levará apenas 2 minutos ⏱️
                  </Typography>
                </Box>

                <Alert 
                  severity="info" 
                  icon={<Iconify icon="solar:gift-bold-duotone" />}
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    '& .MuiAlert-icon': { color: 'primary.main' },
                  }}
                >
                <Box sx={{ typography: 'body2', fontWeight: 600 }}>
                  Código de indicação: <Chip label={codigo} size="small" sx={{ ml: 1 }} />
                </Box>    
                </Alert>

                <form onSubmit={onSubmit}>
                  <Stack spacing={3}>
                    <TextField
                      {...register('nome')}
                      label="Nome completo"
                      fullWidth
                      required
                      error={!!errors.nome}
                      helperText={errors.nome?.message}
                      InputProps={{
                        startAdornment: <Iconify icon="solar:user-bold-duotone" width={20} sx={{ mr: 1, color: 'text.disabled' }} />,
                      }}
                    />

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        {...register('email')}
                        label="Email"
                        type="email"
                        fullWidth
                        required
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        InputProps={{
                          startAdornment: <Iconify icon="solar:letter-bold-duotone" width={20} sx={{ mr: 1, color: 'text.disabled' }} />,
                        }}
                      />

                      <TextField
                        {...register('telefone')}
                        label="WhatsApp"
                        fullWidth
                        required
                        placeholder="(00) 00000-0000"
                        error={!!errors.telefone}
                        helperText={errors.telefone?.message}
                        onChange={(e) => {
                          const formatted = formatTelefone(e.target.value);
                          setValue('telefone', formatted);
                          clearErrors('telefone');
                        }}
                        InputProps={{
                          startAdornment: <Iconify icon="logos:whatsapp-icon" width={20} sx={{ mr: 1 }} />,
                        }}
                      />
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        {...register('cpf')}
                        label="CPF (opcional)"
                        fullWidth
                        placeholder="000.000.000-00"
                        error={!!errors.cpf}
                        helperText={errors.cpf?.message}
                        onChange={(e) => {
                          const formatted = formatCPF(e.target.value);
                          setValue('cpf', formatted);
                          clearErrors('cpf');
                        }}
                        InputProps={{
                          startAdornment: <Iconify icon="solar:card-bold-duotone" width={20} sx={{ mr: 1, color: 'text.disabled' }} />,
                        }}
                      />

                      <TextField
                        {...register('estado')}
                        label="Estado"
                        fullWidth
                        placeholder="Ex: SP"
                        error={!!errors.estado}
                        helperText={errors.estado?.message}
                        InputProps={{
                          startAdornment: <Iconify icon="solar:map-point-bold-duotone" width={20} sx={{ mr: 1, color: 'text.disabled' }} />,
                        }}
                      />
                    </Stack>

                    <TextField
                      {...register('cidade')}
                      label="Cidade"
                      fullWidth
                      error={!!errors.cidade}
                      helperText={errors.cidade?.message}
                      InputProps={{
                        startAdornment: <Iconify icon="solar:buildings-bold-duotone" width={20} sx={{ mr: 1, color: 'text.disabled' }} />,
                      }}
                    />

                    <TextField
                      {...register('observacoes')}
                      label="Conte-nos sobre sua empresa (opcional)"
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Qual seu segmento? Quantos funcionários? Quais seus desafios atuais?"
                      error={!!errors.observacoes}
                      helperText={errors.observacoes?.message}
                    />

                    <LoadingButton
                      type="submit"
                      variant="contained"
                      size="large"
                      loading={loadingSubmit || isSubmitting}
                      fullWidth
                      sx={{ 
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        boxShadow: theme.customShadows.z8,
                      }}
                    >
                      🚀 Quero minha consultoria gratuita
                    </LoadingButton>

                    <Typography variant="caption" color="text.secondary" textAlign="center">
                      ✅ Seus dados estão seguros e protegidos
                    </Typography>
                  </Stack>
                </form>
              </Stack>
            </Card>
          </Grid>

          {/* Social Proof Sidebar */}
          <Grid xs={12} md={5}>
            <Stack spacing={3}>
              {/* Trust Badge */}
              <Paper 
                sx={{ 
                  p: 3, 
                  bgcolor: alpha(theme.palette.success.main, 0.08),
                  border: `2px solid ${theme.palette.success.main}`,
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="solar:verified-check-bold-duotone" width={32} sx={{ color: 'success.main' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Por que nos escolher?
                    </Typography>
                  </Stack>
                  
                  <Stack spacing={1.5}>
                    {[
                      'Atendimento personalizado para seu segmento',
                      'Sem burocracias ou processos lentos',
                      'Economia real comprovada',
                      'Consultoria estratégica inclusa',
                      'Primeira análise 100% gratuita',
                    ].map((item, index) => (
                      <Stack key={index} direction="row" spacing={1}>
                        <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: 'success.main', mt: 0.3 }} />
                        <Typography variant="body2">{item}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Paper>

              {/* Testimonial */}
              <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{ 
                        width: 56, 
                        height: 56,
                        bgcolor: 'primary.main',
                      }}
                    >
                      <Iconify icon="solar:user-bold-duotone" width={32} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Maria Silva
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        CEO - Beleza & Estética
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    &quot;Reduzi meus custos em 35% e ainda ganhei um time que me ajuda com estratégia. 
                    Melhor decisão que tomei para minha empresa!&quot;
                  </Typography>                  
                  <Stack direction="row" spacing={0.5}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Iconify key={star} icon="solar:star-bold" width={20} sx={{ color: 'warning.main' }} />
                    ))}
                  </Stack>
                </Stack>
              </Paper>

              {/* Urgency */}
              <Paper 
                sx={{ 
                  p: 3, 
                  bgcolor: alpha(theme.palette.warning.main, 0.08),
                  border: `1px dashed ${theme.palette.warning.main}`,
                }}
              >
                <Stack spacing={1.5} alignItems="center" textAlign="center">
                  <Iconify icon="solar:clock-circle-bold-duotone" width={40} sx={{ color: 'warning.main' }} />
                  <Typography variant="h6" fontWeight={700}>
                    ⚡ Atendimento Prioritário
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Por ser indicado, você terá retorno em até 24h e condições especiais!
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
