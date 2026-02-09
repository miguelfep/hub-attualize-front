'use client';

import { lazy, Suspense } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

import { BackToTop } from 'src/components/animate/back-to-top';
import { ScrollProgress, useScrollProgress } from 'src/components/animate/scroll-progress';

import { AboutPartners } from 'src/sections/about/about-partners';

import HomeBanner from '../home-banner';
import { HomeMinimal } from '../home-minimal';
import { HomePricing } from '../home-pricing';
import HomeServicesSection from '../home-atuacao';
import { HomeTestimonials } from '../home-testimonials';
import { HomeAdvertisement } from '../home-advertisement';

// Dynamic import para evitar problemas com HMR e framer-motion
const HomeFAQs = lazy(() => import('../home-faqs').then((mod) => ({ default: mod.HomeFAQs })));

// ----------------------------------------------------------------------

export function HomeView() {
  const pageProgress = useScrollProgress();

  return (
    <>
      <ScrollProgress
        variant="linear"
        progress={pageProgress.scrollYProgress}
        sx={{ position: 'fixed' }}
      />

      <BackToTop />

      <HomeBanner />

      <Stack sx={{ position: 'relative', bgcolor: 'background.default' }}>
        <HomeMinimal />

        <HomeServicesSection />

        <HomePricing />

        <HomeTestimonials />

        <Suspense
          fallback={
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
          }
        >
          <HomeFAQs />
        </Suspense>

        <AboutPartners />

        <HomeAdvertisement />
      </Stack>
    </>
  );
}
