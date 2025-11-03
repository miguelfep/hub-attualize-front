'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

const STEPS = [
  {
    number: '1',
    title: 'Comercial',
    description:
      'Nesta etapa, você analisa nossa proposta e, se ela fizer sentido para você, o próximo passo é o envio dos seus documentos através do nosso formulário.',
    icon: 'solar:document-text-bold-duotone',
  },
  {
    number: '2',
    title: 'Kickoff',
    description:
      'Após nossa equipe validar eles, vamos marcar uma reunião para alinharmos a abertura da sua empresa. Além disso, você também poderá acompanhar todo o processo do início ao fim.',
    icon: 'solar:calendar-bold-duotone',
  },
  {
    number: '3',
    title: 'Abertura',
    description:
      'Nessa etapa, nós cuidamos de toda a burocracia em um processo que leva em média 30 dias úteis até ser concluído. E claro, que exige o pagamento de taxas aos órgãos envolvidos.',
    icon: 'solar:clock-circle-bold-duotone',
  },
  {
    number: '4',
    title: 'Contrato',
    description:
      'Após a abertura da sua empresa, formalizamos nossa parceria com um contrato simples. A primeira mensalidade só será paga no mês seguinte.',
    icon: 'solar:document-add-bold-duotone',
  },
  {
    number: '5',
    title: 'Onboarding',
    description:
      'Liberamos o acesso à nossa plataforma com guias e vídeos. Agendamos uma reunião para tirar suas dúvidas e começarmos alinhados.',
    icon: 'solar:monitor-bold-duotone',
  },
  {
    number: '6',
    title: 'Conclusão',
    description:
      'Parceria iniciada! Cuidaremos das obrigações contábeis e fiscais para você focar no crescimento do seu negócio!',
    icon: 'solar:buildings-bold-duotone',
  },
];

// ----------------------------------------------------------------------

export function PsychologistSteps() {
  const theme = useTheme();

  return (
    <Box
      id="processo"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.paper',
      }}
    >
      <Container component={MotionViewport}>
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <m.div variants={varFade().inDown}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              Sua Abertura de Empresa Realizada em Apenas{' '}
              <Box component="span" sx={{ color: '#FEC615' }}>
                6 Passos
              </Box>
            </Typography>
          </m.div>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: { xs: 8, md: 6 },
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            position: 'relative',
            mt: 4,
          }}
        >
          {STEPS.map((step, index) => (
            <m.div key={step.number} variants={varFade().inUp}>
              <Card
                sx={{
                  p: 4,
                  pt: 7,
                  height: '100%',
                  position: 'relative',
                  bgcolor: alpha(theme.palette.grey[500], 0.04),
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                  transition: 'all 0.3s ease',
                  overflow: 'visible',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.customShadows.z16,
                  },
                  '&::before': {
                    content: `"${step.number}"`,
                    position: 'absolute',
                    top: -24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: '#0096D9',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    boxShadow: theme.customShadows.primary,
                    border: `4px solid ${theme.palette.background.paper}`,
                    zIndex: 2,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    mx: 'auto',
                    mb: 3,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon={step.icon} width={40} sx={{ color: '#0096D9' }} />
                </Box>

                <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', fontWeight: 700 }}>
                  {step.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', textAlign: 'center', fontSize: '0.875rem' }}
                >
                  {step.description}
                </Typography>
              </Card>
            </m.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
