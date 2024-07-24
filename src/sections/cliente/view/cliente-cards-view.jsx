'use client';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _userCards } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ClienteCardList } from '../cliente-card-list';

// ----------------------------------------------------------------------

export function ClienteCardsView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Clientes cards"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'User', href: paths.dashboard.cliente.root },
          { name: 'Cards' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.user.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New user
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ClienteCardList users={_userCards} />
    </DashboardContent>
  );
}
