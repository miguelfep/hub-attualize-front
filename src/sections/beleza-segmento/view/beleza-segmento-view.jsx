'use client';

import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';

import { SegmentSteps } from 'src/sections/saude/segment/segment-steps';
import { SegmentPricing } from 'src/sections/saude/segment/segment-pricing';
import { SegmentServices } from 'src/sections/saude/segment/segment-services';
import { SegmentTestimonials } from 'src/sections/saude/segment/segment-testimonials';

import { HeroBeleza } from '../hero-beleza';
import { LeadFormBeleza } from '../lead-form-beleza';
import { SecaoImplantacao } from '../secao-implantacao';
import { SecaoSistemaParceiros } from '../secao-sistema-parceiros';
import { SecaoLeiSalaoParceiro } from '../secao-lei-salao-parceiro';
import { CalculadoraSalaoParceiro } from '../calculadora-salao-parceiro';
import { SecaoFaqBeleza, SecaoTributacao, SecaoLinksInternosBeleza } from '../secoes-apoio';

// ----------------------------------------------------------------------

export function BelezaSegmentoView({ segmento }) {
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
    <Box sx={{ bgcolor: segmento.cores.papel }}>
      <Box ref={heroRef}>
        <HeroBeleza segmento={segmento} />
      </Box>
      <CalculadoraSalaoParceiro segmento={segmento} />
      <SecaoLeiSalaoParceiro segmento={segmento} />
      <SecaoSistemaParceiros segmento={segmento} />
      <SecaoImplantacao segmento={segmento} />
      <SecaoTributacao segmento={segmento} />

      {/* Seções compartilhadas com as landings de saúde */}
      <SegmentSteps segment={segmento.segment} />
      <SegmentServices segment={segmento.segment} />
      <SegmentPricing segment={segmento.segment} />
      <SegmentTestimonials segment={segmento.segment} />

      <SecaoFaqBeleza segmento={segmento} />
      <LeadFormBeleza segmento={segmento} />
      <SecaoLinksInternosBeleza segmento={segmento} />

      {/* Botão flutuante de WhatsApp */}
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
            href={segmento.segment.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            size="large"
            variant="contained"
            startIcon={<Iconify icon="mdi:whatsapp" width={24} sx={{ flexShrink: 0 }} />}
            sx={{
              bgcolor: '#28a745',
              color: 'white',
              px: { xs: 3, md: 6 },
              py: { xs: 1.5, md: 2 },
              fontSize: { xs: '0.875rem', md: '1.05rem' },
              fontWeight: 800,
              borderRadius: 50,
              boxShadow: '0 10px 40px 0 rgba(40, 167, 69, 0.6)',
              textTransform: 'none',
              width: { xs: '100%', sm: 'auto' },
              minWidth: { sm: 300 },
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: '#218838' },
            }}
          >
            Fale com um especialista!
          </Button>
        </Box>
      </Fade>
    </Box>
  );
}
