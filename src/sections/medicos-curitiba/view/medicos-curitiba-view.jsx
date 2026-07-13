'use client';

import Box from '@mui/material/Box';

import { MEDICOS } from 'src/sections/saude/segment/data/medicos';
import { SegmentSteps } from 'src/sections/saude/segment/segment-steps';
import { SegmentPricing } from 'src/sections/saude/segment/segment-pricing';
import { SegmentServices } from 'src/sections/saude/segment/segment-services';
import { SegmentTestimonials } from 'src/sections/saude/segment/segment-testimonials';

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

export function MedicosCuritibaView() {
  return (
    <Box sx={{ bgcolor: CORES.papel }}>
      <CuritibaHero />
      <CalculadoraFatorR />
      <SecaoEspecializada />
      <SecaoLocalCuritiba />

      {/* Seções compartilhadas com /contabilidade-para-medicos */}
      <SegmentSteps segment={MEDICOS} />
      <SegmentServices segment={MEDICOS} />
      <SegmentPricing segment={MEDICOS} />
      <SegmentTestimonials segment={MEDICOS} />

      <SecaoFaq />
      <CuritibaLeadForm />
      <SecaoLinksInternos />
    </Box>
  );
}
