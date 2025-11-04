'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

export function PsychologistCta() {
  const theme = useTheme();

  const whatsappLink =
    'https://wa.me/554196982267?text=Ol%C3%A1%2C+sou+psic%C3%B3logo(a)+e+gostaria+de+saber+mais+sobre+a+Attualize+Contabilidade%21';

  return (
    <Box
      id="cta-final"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.paper',
      }}
    >
      <Container component={MotionViewport}>
        <Box sx={{ textAlign: 'center', maxWidth: 900, mx: 'auto' }}>
          <m.div variants={varFade().inUp}>
            <Typography variant="h2" sx={{ mb: 3 }}>
              Pronto para{' '}
              <Box component="span" sx={{ color: '#FEC615' }}>
                Transformar
              </Box>{' '}
              a Contabilidade do Seu Consultório?
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Typography
              variant="h5"
              sx={{
                mb: 5,
                color: 'text.secondary',
                fontWeight: 400,
                lineHeight: 1.8,
              }}
            >
              Chega de contabilidade genérica! Tenha especialistas que entendem a rotina de
              psicólogos e potencialize seus resultados.
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp}>
            <Button
              component="a"
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              size="large"
              variant="contained"
              sx={{
                bgcolor: '#FEC615',
                color: '#333',
                px: { xs: 4, md: 6 },
                py: 2,
                fontSize: { xs: '0.95rem', md: '1.25rem' },
                fontWeight: 700,
                borderRadius: 10,
                boxShadow: '0 8px 24px 0 rgba(254, 198, 21, 0.4)',
                whiteSpace: 'nowrap',
                '&:hover': {
                  bgcolor: '#e5b213',
                  transform: 'scale(1.05)',
                  boxShadow: '0 12px 32px 0 rgba(254, 198, 21, 0.5)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Fale com um Especialista Agora!
            </Button>
          </m.div>
        </Box>
      </Container>
    </Box>
  );
}
