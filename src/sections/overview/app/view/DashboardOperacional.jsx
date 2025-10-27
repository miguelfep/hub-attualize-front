'use client';

// removed unused hooks

import Grid from '@mui/material/Unstable_Grid2';


import { DashboardContent } from 'src/layouts/dashboard';
import { SeoIllustration } from 'src/assets/illustrations';

import { getUser } from 'src/auth/context/jwt';

import { AppWelcome } from '../app-welcome';
// removed unused import


export default function DashboardComercialView() {
  const user = getUser();


  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        <Grid xs={12}>
          <AppWelcome
            title={`Olá 👋 \n ${user?.name}`}
            description="Seu painel operacional"
            img={<SeoIllustration hideBackground />}
          />
        </Grid>

        <Grid xs={12} />
      </Grid>
    </DashboardContent>
  );
}
