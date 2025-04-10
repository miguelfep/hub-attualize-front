'use client';

import Stack from '@mui/material/Stack';

import { BackToTop } from 'src/components/animate/back-to-top';
import { ScrollProgress, useScrollProgress } from 'src/components/animate/scroll-progress';

import { BannerEstetica } from './bannerEstetica';
import { ImpostosClinicaEstetica } from './ImpostosClinicaEstetica';
import { LegalizarClinicaEsteticaStepper } from './legalizarClinicaEstetica';
import { ImportanciaContabilidadeEstetica } from './ImportanciaContabilidadeEstetica';

// ----------------------------------------------------------------------

export function HomeEstetica() {
  const pageProgress = useScrollProgress();

  return (
    <>
      <ScrollProgress
        variant="linear"
        progress={pageProgress.scrollYProgress}
        sx={{ position: 'fixed' }}
      />

      <BackToTop />

      <Stack sx={{ position: 'relative', bgcolor: 'background.default' }}>
        <BannerEstetica />

        <ImportanciaContabilidadeEstetica />

        <LegalizarClinicaEsteticaStepper />

        <ImpostosClinicaEstetica />
      </Stack>
    </>
  );
}
