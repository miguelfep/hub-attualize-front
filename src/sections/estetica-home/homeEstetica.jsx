'use client';

import Stack from '@mui/material/Stack';

import { BackToTop } from 'src/components/animate/back-to-top';
import { ScrollProgress, useScrollProgress } from 'src/components/animate/scroll-progress';

import { FaqSection } from './FaqSection';
import { BannerEstetica } from './bannerEstetica';
import { DescubraImposto } from './DescubraImposto';
import { LeiSalaoParceiro } from './LeiSalaoParceiro';
import { InformacoesEssenciais } from './ImpostosClinicaEstetica';
import { ServicosEspecializados } from './ServicosEspecializados';
import { NaturezaTributacaoTabs } from './NaturezaTributacaoTabs';
import { ChecklistRegularizacao } from './ChecklistRegularizacao';
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

        <InformacoesEssenciais />

        <LegalizarClinicaEsteticaStepper />

        <ServicosEspecializados />

        <NaturezaTributacaoTabs />

        <LeiSalaoParceiro />

        <ChecklistRegularizacao />

        <DescubraImposto />

        <FaqSection />
      </Stack>
    </>
  );
}
