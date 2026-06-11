'use client';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

export function SegmentCta({ segment }) {
  const { accent, whatsappLink, ctaSubtitle } = segment;

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
              Deixe seu contato que{' '}
              <Box component="span" sx={{ color: accent }}>
                cuidamos do resto!
              </Box>
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
              {ctaSubtitle}
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
              startIcon={<Iconify icon="mdi:whatsapp" width={26} />}
              sx={{
                bgcolor: '#28a745',
                color: 'white',
                px: { xs: 4, md: 6 },
                py: 2,
                fontSize: { xs: '0.95rem', md: '1.25rem' },
                fontWeight: 700,
                borderRadius: 10,
                boxShadow: '0 8px 24px 0 rgba(40, 167, 69, 0.4)',
                whiteSpace: 'nowrap',
                '&:hover': {
                  bgcolor: '#218838',
                  transform: 'scale(1.05)',
                  boxShadow: '0 12px 32px 0 rgba(40, 167, 69, 0.5)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Quero falar agora!
            </Button>
          </m.div>
        </Box>
      </Container>
    </Box>
  );
}
