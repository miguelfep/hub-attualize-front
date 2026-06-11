'use client';

import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';

import { SaudeCta } from '../saude-cta';
import { SaudeFaq } from '../saude-faq';
import { SaudeTax } from '../saude-tax';
import { SaudeWhy } from '../saude-why';
import { SaudeHero } from '../saude-hero';
import { SaudeSteps } from '../saude-steps';
import { SaudeServices } from '../saude-services';
import { SaudeSegments } from '../saude-segments';
import { WHATSAPP_LINK_SAUDE } from '../saude-utils';
import { SaudeTestimonials } from '../saude-testimonials';
import { SegmentSistema } from '../segment/segment-sistema';
import { SegmentPricing } from '../segment/segment-pricing';
import { SegmentAbertura } from '../segment/segment-abertura';
import { SegmentPlanejamento } from '../segment/segment-planejamento';

// ----------------------------------------------------------------------

const SAUDE_SEGMENT = {
  accent: '#0096D9',
  name: 'Profissionais da Saúde',
  whatsappLink: WHATSAPP_LINK_SAUDE,
};

// ----------------------------------------------------------------------

export function SaudeLandingView() {
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
      {/* Hero com estatísticas */}
      <Box ref={heroRef}>
        <SaudeHero />
      </Box>

      {/* Segmentos atendidos - médicos, dentistas, psicólogos... */}
      <SaudeSegments />

      {/* Diferenciais - atendimento humanizado */}
      <SaudeWhy />

      {/* Sistema - indicadores e dashboards */}
      <SegmentSistema segment={SAUDE_SEGMENT} />

      {/* Tributação - Fator R, equiparação hospitalar, PF x PJ */}
      <SaudeTax />

      {/* Planejamento estratégico - natureza jurídica e regimes (tabs) */}
      <SegmentPlanejamento segment={SAUDE_SEGMENT} />

      {/* Como funciona - 4 passos */}
      <SaudeSteps />

      {/* Planos - Start, Pleno e Premium */}
      <SegmentPricing segment={SAUDE_SEGMENT} />

      {/* Abertura de empresa em 6 passos */}
      <SegmentAbertura segment={SAUDE_SEGMENT} />

      {/* Serviços inclusos */}
      <SaudeServices />

      {/* Depoimentos - Provas Sociais */}
      <SaudeTestimonials />

      {/* FAQ - Perguntas frequentes */}
      <SaudeFaq />

      {/* CTA Final - WhatsApp */}
      <SaudeCta />

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
            component="a"
            href={WHATSAPP_LINK_SAUDE}
            target="_blank"
            rel="noopener noreferrer"
            size="large"
            variant="contained"
            startIcon={
              <Iconify icon="mdi:whatsapp" width={{ xs: 20, md: 24 }} sx={{ flexShrink: 0 }} />
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
            Fale com um especialista!
          </Button>
        </Box>
      </Fade>
    </Box>
  );
}
