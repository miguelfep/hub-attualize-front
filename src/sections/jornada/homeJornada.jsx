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
      {/* Barra de progresso de rolagem */}
      <ScrollProgress
        variant="linear"
        progress={pageProgress.scrollYProgress}
        sx={{ position: 'fixed' }}
      />

      <BackToTop />

      {/* Banner Principal */}
      <Stack sx={{ position: 'relative' }}>
        <BannerJornada
          title="Defina + Attualize"
          subtitle="Descubra como podemos transformar seu negócio"
          backgroundImage="/assets/background/background-defina.jpg"
          logoAttualize="/logo/hub-tt.png"
          logoDefina="/logo/logo_defina_alta-01.png"
        />
      </Stack>

      {/* Section - Pegar Meu Presente */}
      <section id="presente" >
          <LeadCapture />
      </section>

      {/* Section - Abrir Meu MEI */}
      <section id="abrir-mei" >
          <MeiStepper />
      </section>

      <Stack sx={{ position: 'relative' }} />
    </>
  );
}
