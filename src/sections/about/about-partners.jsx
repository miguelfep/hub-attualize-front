'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

const ACCENT = '#0096D9';

const PARTNERS = [
  {
    name: 'VR Benefícios',
    benefit: 'Vale-refeição e alimentação para sua equipe',
    icon: 'solar:card-bold-duotone',
    logo: `${CONFIG.site.basePath}/assets/images/partners/vr-beneficios.png`,
    website: 'https://www.vr.com.br',
  },
  {
    name: 'VR Ponto',
    benefit: 'Controle de ponto digital dos funcionários',
    icon: 'solar:clock-circle-bold-duotone',
    logo: `${CONFIG.site.basePath}/assets/images/partners/vr-beneficios.png`,
    website: 'https://www.vr.com.br/lp/controle-de-ponto/',
  },
  {
    name: 'TotalPass',
    benefit: 'Academias e bem-estar para sua equipe',
    icon: 'solar:dumbbell-small-bold-duotone',
    logo: `${CONFIG.site.basePath}/assets/images/partners/totalpass.svg`,
    website: 'https://www.totalpass.com.br',
    darkLogo: true,
  },
  {
    name: 'MedPass',
    benefit: 'Saúde e telemedicina com condições especiais',
    icon: 'solar:heart-pulse-bold-duotone',
    logo: `${CONFIG.site.basePath}/assets/images/partners/medpass.png`,
    website: 'https://www.medpassbeneficios.com.br',
    darkLogo: true,
  },
];

// Duas cópias da lista criam o loop infinito do marquee (a animação anda -50%)
const MARQUEE_PARTNERS = [...PARTNERS, ...PARTNERS];

// ----------------------------------------------------------------------

export function AboutPartners() {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.neutral',
        overflow: 'hidden',
      }}
    >
      <Container component={MotionViewport}>
        <Stack spacing={2.5} alignItems="center" textAlign="center" sx={{ mb: { xs: 5, md: 7 } }}>
          <m.div variants={varFade().inDown}>
            <Chip
              icon={<Iconify icon="solar:hand-heart-bold-duotone" width={18} />}
              label="ECOSSISTEMA DE BENEFÍCIOS"
              sx={{
                px: 1,
                fontWeight: 700,
                fontSize: '0.75rem',
                bgcolor: alpha(ACCENT, 0.1),
                color: ACCENT,
                '& .MuiChip-icon': { color: ACCENT },
              }}
            />
          </m.div>

          <m.div variants={varFade().inDown}>
            <Typography variant="h2">
              Nossos{' '}
              <Box component="span" sx={{ color: ACCENT }}>
                Parceiros
              </Box>
            </Typography>
          </m.div>

          <m.div variants={varFade().inDown}>
            <Typography sx={{ color: 'text.secondary', maxWidth: 640, mx: 'auto', lineHeight: 1.8 }}>
              Ser cliente Attualize vai além da contabilidade: trabalhamos com as melhores empresas
              para você cuidar da sua equipe e do seu negócio com condições especiais.
            </Typography>
          </m.div>
        </Stack>
      </Container>

      {/* Marquee em CSS puro - pausa no hover */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            width: { xs: 60, md: 150 },
            height: '100%',
            zIndex: 2,
            pointerEvents: 'none',
          },
          '&::before': {
            left: 0,
            background: `linear-gradient(to right, ${theme.vars.palette.background.neutral}, transparent)`,
          },
          '&::after': {
            right: 0,
            background: `linear-gradient(to left, ${theme.vars.palette.background.neutral}, transparent)`,
          },
        }}
      >
        <Stack
          direction="row"
          spacing={3}
          sx={{
            py: 3,
            px: 1.5,
            width: 'max-content',
            animation: 'partners-marquee 28s linear infinite',
            '&:hover': { animationPlayState: 'paused' },
            '@keyframes partners-marquee': {
              '0%': { transform: 'translateX(0)' },
              '100%': { transform: 'translateX(-50%)' },
            },
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
              flexWrap: 'wrap',
              justifyContent: 'center',
              width: '100%',
            },
          }}
        >
          {MARQUEE_PARTNERS.map((partner, index) => (
            <Box
              key={`${partner.name}-${index}`}
              component="a"
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${partner.name} - ${partner.benefit}`}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: { xs: 220, md: 260 },
                p: 3,
                borderRadius: 2.5,
                bgcolor: 'background.paper',
                border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                boxShadow: theme.customShadows.card,
                transition: 'all 0.3s ease',
                flexShrink: 0,
                textDecoration: 'none',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: theme.customShadows.z16,
                  borderColor: alpha(ACCENT, 0.4),
                },
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: 64,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1.5,
                  ...(partner.darkLogo && {
                    bgcolor: 'grey.900',
                    px: 2,
                  }),
                }}
              >
                <Box
                  component="img"
                  src={partner.logo}
                  alt={`Logo ${partner.name}`}
                  loading="lazy"
                  sx={{
                    maxWidth: '80%',
                    maxHeight: 48,
                    objectFit: 'contain',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </Box>

              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                {partner.name}
              </Typography>

              <Stack direction="row" spacing={0.75} alignItems="flex-start">
                <Iconify
                  icon={partner.icon}
                  width={16}
                  sx={{ color: ACCENT, flexShrink: 0, mt: 0.25 }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', textAlign: 'left', lineHeight: 1.5 }}
                >
                  {partner.benefit}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      <Container>
        <Typography
          variant="caption"
          sx={{ display: 'block', textAlign: 'center', mt: 4, color: 'text.disabled' }}
        >
          Condições especiais disponíveis para clientes Attualize. Consulte nosso time para saber
          mais.
        </Typography>
      </Container>
    </Box>
  );
}
