'use client';

import Stack from '@mui/material/Stack';

import { BackToTop } from 'src/components/animate/back-to-top';
import { ScrollProgress, useScrollProgress } from 'src/components/animate/scroll-progress';

import { HomeFAQs } from '../home-faqs';
import  HomeBanner  from '../home-banner';
import { HomeMinimal } from '../home-minimal';
import { HomePricing } from '../home-pricing';
import HomeServicesSection  from '../home-atuacao';
import { HomeTestimonials } from '../home-testimonials';
import { HomeAdvertisement } from '../home-advertisement';


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

      <HomeBanner/>    

      <Stack sx={{ position: 'relative', bgcolor: 'background.default' }}>
        <HomeMinimal />

        <HomeServicesSection />

        <HomePricing />

        <HomeTestimonials />

        <HomeFAQs />

        <HomeAdvertisement />
      </Stack>
    </>
  );
}
