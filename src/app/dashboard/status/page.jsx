'use client';

import { useState } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { StatusFilas } from 'src/sections/status/status-filas';
import { StatusView } from 'src/sections/status/view/status-view';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function StatusPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [aba, setAba] = useState('geral');

  // Página restrita a administradores
  if (user?.role !== 'admin') {
    router.replace(paths.dashboard.permission);
    return null;
  }

  return (
    <DashboardContent maxWidth={false}>
      <CustomBreadcrumbs
        heading="Status do Sistema"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Status do Sistema' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Tabs value={aba} onChange={(_, valor) => setAba(valor)} sx={{ mb: 3 }}>
        <Tab
          value="geral"
          label="Visão geral"
          icon={<Iconify icon="solar:heart-pulse-bold" width={20} />}
          iconPosition="start"
        />
        <Tab
          value="filas"
          label="Filas (BullMQ)"
          icon={<Iconify icon="solar:layers-bold" width={20} />}
          iconPosition="start"
        />
      </Tabs>

      {aba === 'geral' && <StatusView />}
      {aba === 'filas' && <StatusFilas />}
    </DashboardContent>
  );
}
