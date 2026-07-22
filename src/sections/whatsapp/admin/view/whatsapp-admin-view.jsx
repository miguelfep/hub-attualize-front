'use client';

import { useState } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { RoleBasedGuard } from 'src/auth/guard';
import { useAuthContext } from 'src/auth/hooks';

import { WaConfigTab } from '../wa-config-tab';
import { WaCanaisTab } from '../wa-canais-tab';
import { WaTemplatesTab } from '../wa-templates-tab';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'canais', label: 'Canais / Números', icon: 'solar:phone-bold' },
  { value: 'templates', label: 'Templates', icon: 'solar:document-text-bold' },
  { value: 'config', label: 'Configuração da API', icon: 'solar:settings-bold' },
];

// ----------------------------------------------------------------------

export function WhatsAppAdminView() {
  const { user } = useAuthContext();
  const [aba, setAba] = useState('canais');

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="WhatsApp — Administração"
        links={[
          { name: 'Atendimento', href: paths.dashboard.whatsapp },
          { name: 'Administração' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <RoleBasedGuard hasContent currentRole={user?.role} acceptRoles={['admin']} sx={{ py: 10 }}>
        <Card>
          <Tabs
            value={aba}
            onChange={(_, v) => setAba(v)}
            sx={{ px: 2.5, boxShadow: (t) => `inset 0 -2px 0 0 ${t.vars.palette.grey['500Channel']}/0.08` }}
          >
            {TABS.map((t) => (
              <Tab
                key={t.value}
                value={t.value}
                label={t.label}
                icon={<Iconify icon={t.icon} />}
                iconPosition="start"
              />
            ))}
          </Tabs>

          <div style={{ padding: 24 }}>
            {aba === 'canais' && <WaCanaisTab />}
            {aba === 'templates' && <WaTemplatesTab />}
            {aba === 'config' && <WaConfigTab />}
          </div>
        </Card>
      </RoleBasedGuard>
    </DashboardContent>
  );
}
