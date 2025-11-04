'use client';

import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import { PsychologistCta } from '../psychologist-cta';
import { PsychologistFaq } from '../psychologist-faq';
import { PsychologistWhy } from '../psychologist-why';
import { PsychologistHero } from '../psychologist-hero';
import { PsychologistOffer } from '../psychologist-offer';
import { PsychologistSteps } from '../psychologist-steps';
import { PsychologistPricing } from '../psychologist-pricing';
import { PsychologistServices } from '../psychologist-services';
import { PsychologistCoverage } from '../psychologist-coverage';
import { PsychologistTestimonials } from '../psychologist-testimonials';

// ----------------------------------------------------------------------

export function PsychologistLandingView() {
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        // Mostra o botão quando a seção hero sair da tela
        setShowFloatingButton(heroBottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box>
      {/* Hero com vídeo do YouTube */}
      <Box ref={heroRef}>
        <PsychologistHero />
      </Box>

      {/* Por que Attualize - 6 cards */}
      <PsychologistWhy />

      {/* Oferta - CNPJ Grátis */}
      <PsychologistOffer />

      {/* Processo - 6 passos */}
      <PsychologistSteps />

      {/* Serviços - Lista de checkmarks */}
      <PsychologistServices />

      {/* Planos - 3 planos detalhados */}
      <PsychologistPricing />

      {/* Depoimentos - Provas Sociais */}
      <PsychologistTestimonials />

      {/* Mapa de Cobertura - 21+ Estados */}
      <PsychologistCoverage />

      {/* FAQ - Perguntas frequentes */}
      <PsychologistFaq />

      {/* CTA Final - WhatsApp */}
      <PsychologistCta />

      {/* Botão Flutuante */}
      <Fade in={showFloatingButton}>
        <Box
          sx={{
            position: 'fixed',
            bottom: { xs: 16, md: 30 },
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1300,
            display: showFloatingButton ? 'block' : 'none',
            width: { xs: 'calc(100% - 32px)', sm: 'auto' },
          }}
        >
          <Button
            component={RouterLink}
            href={paths.aberturaCnpjPsicologo}
            size="large"
            variant="contained"
            endIcon={
              <Iconify
                icon="solar:arrow-right-bold"
                width={{ xs: 20, md: 24 }}
                sx={{ flexShrink: 0 }}
              />
            }
            sx={{
              bgcolor: '#28a745',
              color: 'white',
              px: { xs: 3, md: 6 },
              py: { xs: 1.5, md: 2.5 },
              fontSize: { xs: '0.875rem', md: '1.125rem' },
              fontWeight: 900,
              borderRadius: 50,
              boxShadow: '0 10px 40px 0 rgba(40, 167, 69, 0.6)',
              textTransform: 'none',
              position: 'relative',
              overflow: 'hidden',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              width: { xs: '100%', sm: 'auto' },
              minWidth: { sm: 320 },
              whiteSpace: 'nowrap',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              animation: 'float 3s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': {
                  transform: 'translateY(0px)',
                },
                '50%': {
                  transform: 'translateY(-5px)',
                },
              },
              '&:hover': {
                bgcolor: '#218838',
                transform: 'scale(1.05) translateY(-2px)',
                boxShadow: '0 15px 50px 0 rgba(40, 167, 69, 0.8)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                animation: 'shine 2.5s ease-in-out infinite',
              },
              '@keyframes shine': {
                '0%': { left: '-100%' },
                '50%, 100%': { left: '100%' },
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            🎁 Abra seu CNPJ Grátis!
          </Button>
        </Box>
      </Fade>
    </Box>
  );
}
