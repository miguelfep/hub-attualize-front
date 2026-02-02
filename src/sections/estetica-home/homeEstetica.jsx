'use client';

import { lazy, Suspense } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

import { BackToTop } from 'src/components/animate/back-to-top';
import { ScrollProgress, useScrollProgress } from 'src/components/animate/scroll-progress';

import { BannerEstetica } from './bannerEstetica';

// Lazy load de componentes não críticos para melhorar FCP e LCP
const ImportanciaContabilidadeEstetica = lazy(() =>
  import('./ImportanciaContabilidadeEstetica').then((module) => ({
    default: module.ImportanciaContabilidadeEstetica,
  }))
);

const LegalizarClinicaEsteticaStepper = lazy(() =>
  import('./legalizarClinicaEstetica').then((module) => ({
    default: module.LegalizarClinicaEsteticaStepper,
  }))
);

const ServicosEspecializados = lazy(() =>
  import('./ServicosEspecializados').then((module) => ({
    default: module.ServicosEspecializados,
  }))
);

const NaturezaTributacaoTabs = lazy(() =>
  import('./NaturezaTributacaoTabs').then((module) => ({
    default: module.NaturezaTributacaoTabs,
  }))
);

const LeiSalaoParceiro = lazy(() =>
  import('./LeiSalaoParceiro').then((module) => ({
    default: module.LeiSalaoParceiro,
  }))
);

const ChecklistRegularizacao = lazy(() =>
  import('./ChecklistRegularizacao').then((module) => ({
    default: module.ChecklistRegularizacao,
  }))
);

const RegularizationRoadmap = lazy(() =>
  import('./RoadmapRegularizacao').then((module) => ({
    default: module.RegularizationRoadmap,
  }))
);

const InformacoesEssenciais = lazy(() =>
  import('./ImpostosClinicaEstetica').then((module) => ({
    default: module.InformacoesEssenciais,
  }))
);

const FaqSection = lazy(() =>
  import('./FaqSection').then((module) => ({
    default: module.FaqSection,
  }))
);

// ----------------------------------------------------------------------

// Componente de loading simples
function ComponentLoader() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
        py: 4,
      }}
    >
      <CircularProgress size={40} />
    </Box>
  );
}

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
        {/* Banner carrega primeiro (crítico para LCP) */}
        <BannerEstetica />

        {/* Componentes abaixo do fold carregam de forma lazy */}
        <Suspense fallback={<ComponentLoader />}>
          <ImportanciaContabilidadeEstetica />
        </Suspense>

        <Suspense fallback={<ComponentLoader />}>
          <LegalizarClinicaEsteticaStepper />
        </Suspense>

        <Suspense fallback={<ComponentLoader />}>
          <ServicosEspecializados />
        </Suspense>

        <Suspense fallback={<ComponentLoader />}>
          <NaturezaTributacaoTabs />
        </Suspense>

        <Suspense fallback={<ComponentLoader />}>
          <LeiSalaoParceiro />
        </Suspense>

        <Suspense fallback={<ComponentLoader />}>
          <ChecklistRegularizacao />
        </Suspense>

        <Suspense fallback={<ComponentLoader />}>
          <RegularizationRoadmap />
        </Suspense>

        <Suspense fallback={<ComponentLoader />}>
          <InformacoesEssenciais />
        </Suspense>

        <Suspense fallback={<ComponentLoader />}>
          <FaqSection />
        </Suspense>
      </Stack>
    </>
  );
}
