'use client';

import Stack from '@mui/material/Stack';

import { BackToTop } from 'src/components/animate/back-to-top';
import { MeiStepper } from 'src/components/jornada/MeiStepper';
import { LeadCapture } from 'src/components/jornada/LeadCapture';
import { BannerJornada } from 'src/components/jornada/bannerJornada';
import { ScrollProgress, useScrollProgress } from 'src/components/animate/scroll-progress';

export function HomeJornada() {
  const pageProgress = useScrollProgress();

  return (
    <>
      <ScrollProgress
        variant="linear"
        progress={pageProgress.scrollYProgress}
        sx={{ position: 'fixed' }}
      />

      <BackToTop />

      <Stack sx={{ position: 'relative' }}>
        <BannerJornada
          title="Defina + Attualize"
          subtitle="Descubra como podemos transformar seu negócio"
          backgroundImage="/assets/background/background-defina.jpg"
        />
      </Stack>

      <LeadCapture />

      {/* Aqui removemos o bgcolor para definir no próprio MeiStepper */}
      <MeiStepper />

      <Stack sx={{ position: 'relative' }} />
    </>
  );
}
