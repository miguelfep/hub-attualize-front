'use client';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';

import { useTabs } from 'src/hooks/use-tabs';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AccountGeneral } from '../account-general';
import { AccountChangePassword } from '../account-change-password';

// ----------------------------------------------------------------------
// Minha conta: Geral (foto de perfil + dados) e Segurança (troca de senha).
// ----------------------------------------------------------------------

const TABS = [
  { value: 'general', label: 'Geral', icon: <Iconify icon="solar:user-id-bold" width={24} /> },
  { value: 'security', label: 'Segurança', icon: <Iconify icon="ic:round-vpn-key" width={24} /> },
];

export function AccountView() {
  const tabs = useTabs('general');

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Minha conta"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Minha conta' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Tabs value={tabs.value} onChange={tabs.onChange} sx={{ mb: { xs: 3, md: 5 } }}>
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>

      {tabs.value === 'general' && <AccountGeneral />}

      {tabs.value === 'security' && <AccountChangePassword />}
    </DashboardContent>
  );
}
