'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { getInitials } from 'src/utils/helper';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const TESTIMONIALS = [
  {
    id: 1,
    title: 'Dra.',
    name: 'Camila Ferreira',
    registry: 'CRM-PR',
    city: 'Curitiba - PR',
    rating: 5,
    testimonial:
      'Migrei do carnê-leão para o CNPJ com a Attualize e a economia foi imediata. Eles cuidam de tudo e eu finalmente parei de perder tempo com burocracia.',
    specialty: 'Médica Dermatologista',
  },
  {
    id: 2,
    title: 'Dr.',
    name: 'Rafael Moreira',
    registry: 'CRO-SP',
    city: 'São Paulo - SP',
    rating: 5,
    testimonial:
      'Minha clínica odontológica estava pagando imposto a mais há anos. Com o planejamento tributário deles, a mensalidade da contabilidade se paga sozinha.',
    specialty: 'Cirurgião-Dentista',
  },
  {
    id: 3,
    title: 'Dra.',
    name: 'Patrícia Lemos',
    registry: 'CRP-SC',
    city: 'Florianópolis - SC',
    rating: 5,
    testimonial:
      'O atendimento humanizado faz toda a diferença. Falo direto com o time pelo WhatsApp e sempre recebo resposta rápida, sem robô e sem ticket.',
    specialty: 'Psicóloga Clínica',
  },
  {
    id: 4,
    title: 'Dr.',
    name: 'Gustavo Andrade',
    registry: 'CREFITO-MG',
    city: 'Belo Horizonte - MG',
    rating: 5,
    testimonial:
      'Abri meu estúdio de fisioterapia com a Attualize. CNPJ saiu rápido, me orientaram sobre alvará e vigilância sanitária e hoje cuidam de toda a rotina.',
    specialty: 'Fisioterapeuta',
  },
  {
    id: 5,
    title: 'Dra.',
    name: 'Renata Campos',
    registry: 'CRN-RS',
    city: 'Porto Alegre - RS',
    rating: 5,
    testimonial:
      'Eles entendem as particularidades de quem atende em consultório. Minha secretária fala direto com a equipe e tudo flui sem eu precisar parar os atendimentos.',
    specialty: 'Nutricionista',
  },
  {
    id: 6,
    title: 'Dr.',
    name: 'Eduardo Tavares',
    registry: 'CRM-DF',
    city: 'Brasília - DF',
    rating: 5,
    testimonial:
      'A análise de equiparação hospitalar reduziu drasticamente os impostos da nossa clínica. Profissionais que realmente conhecem a área da saúde.',
    specialty: 'Médico - Clínica de Imagem',
  },
];

// ----------------------------------------------------------------------

export function SaudeTestimonials() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.neutral',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorativo */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          backgroundImage: `radial-gradient(${alpha(theme.palette.primary.main, 0.2)} 2px, transparent 2px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        {/* Header */}
        <Stack spacing={3} sx={{ mb: { xs: 5, md: 8 }, textAlign: 'center' }}>
          <Stack direction="row" justifyContent="center" spacing={1}>
            {[...Array(5)].map((_, index) => (
              <Iconify
                key={index}
                icon="solar:star-bold"
                width={32}
                sx={{ color: 'warning.main' }}
              />
            ))}
          </Stack>

          <Typography variant="h2" sx={{ fontWeight: 800 }}>
            O que os profissionais da saúde dizem sobre nós
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              fontWeight: 400,
              maxWidth: 720,
              mx: 'auto',
            }}
          >
            Mais de{' '}
            <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
              200 profissionais e clínicas
            </Box>{' '}
            confiam na Attualize para cuidar de sua contabilidade
          </Typography>
        </Stack>

        {/* Grid de Depoimentos */}
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
          }}
        >
          {TESTIMONIALS.map((testimonial) => (
            <Card
              key={testimonial.id}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: theme.customShadows.z20,
                },
              }}
            >
              {/* Aspas decorativas */}
              <Box sx={{ position: 'absolute', top: 16, right: 16, opacity: 0.1 }}>
                <Iconify
                  icon="solar:chat-round-quote-bold"
                  width={48}
                  sx={{ color: 'primary.main' }}
                />
              </Box>

              <Rating value={testimonial.rating} readOnly size="small" sx={{ mb: 2 }} />

              <Typography
                variant="body2"
                sx={{
                  mb: 3,
                  flexGrow: 1,
                  fontStyle: 'italic',
                  color: 'text.secondary',
                  lineHeight: 1.8,
                }}
              >
                &ldquo;{testimonial.testimonial}&rdquo;
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar alt={testimonial.name} sx={{ width: 56, height: 56 }}>
                  {getInitials(testimonial.name)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {testimonial.title ? `${testimonial.title} ` : ''}
                    {testimonial.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {testimonial.registry}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                    <Iconify icon="solar:map-point-bold" width={14} sx={{ color: 'primary.main' }} />
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      {testimonial.city}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}
                  >
                    {testimonial.specialty}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
