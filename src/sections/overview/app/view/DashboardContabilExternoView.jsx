'use client';

import Grid from '@mui/material/Unstable_Grid2';

import { DashboardContent } from 'src/layouts/dashboard';
import { SeoIllustration } from 'src/assets/illustrations';

import { getUser } from 'src/auth/context/jwt';

import { AppWelcome } from '../app-welcome';


export default function DashboardContabilExternoView() {
  const user = getUser();


  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        <Grid xs={12}>
          <AppWelcome
            title={`Olá 👋 \n ${user?.name}`}
            description="Acesse suas conciliações no menu ao lado!"
            img={<SeoIllustration hideBackground />}
          />
        </Grid>

        <Grid xs={12} />
      </Grid>
    </DashboardContent>
  );
}
