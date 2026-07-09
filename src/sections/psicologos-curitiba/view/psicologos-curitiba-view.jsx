'use client';

import Box from '@mui/material/Box';

import {
  PsychologistSteps,
  PsychologistPricing,
  PsychologistServices,
  PsychologistTestimonials,
} from 'src/sections/psychologist';

import { CORES } from '../dados';
import { CuritibaHero } from '../curitiba-hero';
import { CuritibaLeadForm } from '../curitiba-lead-form';
import { CalculadoraFatorR } from '../calculadora-fator-r';
import {
  SecaoFaq,
  SecaoEspecializada,
  SecaoLocalCuritiba,
  SecaoLinksInternos,
} from '../curitiba-sections';

// ----------------------------------------------------------------------

export function PsicologosCuritibaView() {
  return (
    <Box sx={{ bgcolor: CORES.papel }}>
      <CuritibaHero />
      <CalculadoraFatorR />
      <SecaoEspecializada />
      <SecaoLocalCuritiba />

      {/* Seções compartilhadas com /contabilidade-para-psicologos */}
      <PsychologistSteps />
      <PsychologistServices />
      <PsychologistPricing />
      <PsychologistTestimonials />

      <SecaoFaq />
      <CuritibaLeadForm />
      <SecaoLinksInternos />
    </Box>
  );
}
