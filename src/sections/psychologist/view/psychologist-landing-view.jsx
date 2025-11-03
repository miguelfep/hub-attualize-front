'use client';

import Box from '@mui/material/Box';

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
  return (
    <Box>
      {/* Hero com vídeo do YouTube */}
      <PsychologistHero />

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
    </Box>
  );
}
