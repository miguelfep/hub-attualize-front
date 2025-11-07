'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Dra. Mariana Silva',
    crp: 'CRP 08/12345',
    city: 'Curitiba - PR',
    avatar: '/assets/images/avatar/avatar-1.webp',
    rating: 5,
    testimonial: 'A Attualize revolucionou minha gestão financeira! Com a abertura de CNPJ gratuita e suporte constante, consegui focar 100% nos meus pacientes. Recomendo demais!',
    specialty: 'Psicologia Clínica',
  },
  {
    id: 2,
    name: 'Dr. Carlos Mendes',
    crp: 'CRP 06/45678',
    city: 'São Paulo - SP',
    avatar: '/assets/images/avatar/avatar-2.webp',
    rating: 5,
    testimonial: 'Economizei mais de R$ 3.000 no primeiro ano! A equipe é super atenciosa e resolve tudo rápido. Minha contabilidade nunca esteve tão organizada.',
    specialty: 'Psicologia Organizacional',
  },
  {
    id: 3,
    name: 'Dra. Juliana Costa',
    crp: 'CRP 12/23456',
    city: 'Florianópolis - SC',
    avatar: '/assets/images/avatar/avatar-3.webp',
    rating: 5,
    testimonial: 'O atendimento especializado para psicólogos faz toda a diferença. Eles entendem nossas particularidades e sempre têm soluções práticas. Excelente!',
    specialty: 'Neuropsicologia',
  },
  {
    id: 4,
    name: 'Dr. Roberto Alves',
    crp: 'CRP 01/34567',
    city: 'Brasília - DF',
    avatar: '/assets/images/avatar/avatar-4.webp',
    rating: 5,
    testimonial: 'Migrei de outra contabilidade e foi a melhor decisão! Preço justo, atendimento humanizado e total transparência. Minha vida profissional ficou muito mais leve.',
    specialty: 'Psicologia Escolar',
  },
  {
    id: 5,
    name: 'Dra. Ana Paula Santos',
    crp: 'CRP 03/56789',
    city: 'Salvador - BA',
    avatar: '/assets/images/avatar/avatar-5.webp',
    rating: 5,
    testimonial: 'Impressionante como simplificaram minha rotina! Dashboard intuitivo, relatórios claros e sempre disponíveis para tirar dúvidas. Parceria de confiança!',
    specialty: 'Psicologia Hospitalar',
  },
  {
    id: 6,
    name: 'Dr. Fernando Lima',
    crp: 'CRP 02/67890',
    city: 'Recife - PE',
    avatar: '/assets/images/avatar/avatar-6.webp',
    rating: 5,
    testimonial: 'A abertura do CNPJ foi super rápida e sem burocracia. Em menos de 30 dias já estava atendendo legalmente. Processo impecável do início ao fim!',
    specialty: 'Psicologia do Esporte',
  },
];

// ----------------------------------------------------------------------

export function PsychologistTestimonials() {
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
            <Iconify 
              icon="solar:star-bold" 
              width={32} 
              sx={{ color: 'warning.main' }} 
            />
            <Iconify 
              icon="solar:star-bold" 
              width={32} 
              sx={{ color: 'warning.main' }} 
            />
            <Iconify 
              icon="solar:star-bold" 
              width={32} 
              sx={{ color: 'warning.main' }} 
            />
            <Iconify 
              icon="solar:star-bold" 
              width={32} 
              sx={{ color: 'warning.main' }} 
            />
            <Iconify 
              icon="solar:star-bold" 
              width={32} 
              sx={{ color: 'warning.main' }} 
            />
          </Stack>

          <Typography variant="h2" sx={{ fontWeight: 800 }}>
            O que os psicólogos dizem sobre nós
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
            Mais de <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>200 psicólogos</Box> confiam na Attualize para cuidar de sua contabilidade
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
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  opacity: 0.1,
                }}
              >
                <Iconify 
                  icon="solar:chat-round-quote-bold" 
                  width={48}
                  sx={{ color: 'primary.main' }}
                />
              </Box>

              {/* Rating */}
              <Rating 
                value={testimonial.rating} 
                readOnly 
                size="small"
                sx={{ mb: 2 }}
              />

              {/* Depoimento */}
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

              {/* Profissional */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  sx={{ width: 56, height: 56 }}
                />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {testimonial.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {testimonial.crp}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                    <Iconify 
                      icon="solar:map-point-bold" 
                      width={14} 
                      sx={{ color: 'primary.main' }} 
                    />
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      {testimonial.city}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}>
                    {testimonial.specialty}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          ))}
        </Box>

        {/* CTA */}
        <Stack 
          spacing={2} 
          alignItems="center" 
          sx={{ 
            mt: { xs: 6, md: 8 },
            p: 4,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center' }}>
            Junte-se a centenas de psicólogos satisfeitos!
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', maxWidth: 600 }}>
            Comece hoje mesmo com <strong>CNPJ gratuito</strong> e experimente o melhor atendimento contábil especializado para psicólogos
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

