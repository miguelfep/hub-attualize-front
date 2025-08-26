'use client';

import { useState, useEffect } from 'react';

import Grid from '@mui/material/Unstable_Grid2';

import { buscarDadosDashboard } from 'src/actions/lead';
import { DashboardContent } from 'src/layouts/dashboard';
import { SeoIllustration } from 'src/assets/illustrations';

import { getUser } from 'src/auth/context/jwt';

import { AppWelcome } from '../app-welcome';
import { AppNewInvoice } from '../app-new-invoice';


export default function DashboardComercialView() {
  const user = getUser();
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    buscarDadosDashboard().then((res) => {
      setLeads(res.leads || []);
    });
  }, []);

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        <Grid xs={12}>
          <AppWelcome
            title={`Olá 👋 \n ${user?.name}`}
            description="Seu painel de acompanhamento de leads e oportunidades"
            img={<SeoIllustration hideBackground />}
          />
        </Grid>

        <Grid xs={12}>
          <AppNewInvoice
            title="Leads"
            tableData={leads}
            headLabel={[
              { id: 'nome', label: 'Nome' },
              { id: 'segment', label: 'Segmento' },
              { id: 'local', label: 'Local' },
              { id: 'status', label: 'Contato' },
              { id: '' },
            ]}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
