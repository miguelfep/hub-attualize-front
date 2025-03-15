'use client';

import Stack from '@mui/material/Stack';

import { BackToTop } from 'src/components/animate/back-to-top';
import { MeiStepper } from 'src/components/jornada/MeiStepper';
import { LeadCapture } from 'src/components/jornada/LeadCapture';
import { BannerJornada } from 'src/components/jornada/bannerJornada';
import { ScrollProgress, useScrollProgress } from 'src/components/animate/scroll-progress';
import { Footer } from 'src/layouts/main/footer';



export function HomeJornada() {
  const pageProgress = useScrollProgress();
  const layoutQuery = 'md';

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
          title="Attualize e Defina"
          subtitle="Conheça os beneficos dessa parceria e como podemos ajudar seu negócio"
          backgroundImage="/assets/background/banner-defina.png"
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
