'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ClienteNewEditForm } from '../cliente-new-edit-form';

// ----------------------------------------------------------------------

export function ClienteEditView({ cliente: currentCliente }) {
  return (
    <DashboardContent
      maxWidth={false}
      sx={{
        pt: { xs: 2, md: 3 },
        px: { xs: 2, md: 2.5 },
      }}
    >
      <CustomBreadcrumbs
        heading="Editar"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Cliente', href: paths.dashboard.cliente.root },
          { name: currentCliente?.nome },
        ]}
        sx={{ mb: 2 }}
      />

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            px: { xs: 2.5, md: 3 },
            py: { xs: 2, md: 2.5 },
            pb: { xs: 1.5, md: 2 },
            bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
          }}
        >
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Editar cliente
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {currentCliente?.nome ? `Alterar dados de ${currentCliente.nome}` : 'Altere os dados do cliente.'}
          </Typography>
        </Box>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <ClienteNewEditForm currentCliente={currentCliente} />
        </CardContent>
      </Card>
    </DashboardContent>
  );
}
