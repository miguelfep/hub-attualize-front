'use client';

import { useRouter } from 'src/routes/hooks';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Alert } from '@mui/material';

import { OnboardingForm } from '../onboarding-form';

// ----------------------------------------------------------------------

export function OnboardingEditView({ onboarding, error }) {
  const router = useRouter();

  if (error) {
    return (
      <DashboardContent>
        <Alert severity="error">
          Erro ao carregar o onboarding. Tente novamente mais tarde.
        </Alert>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Editar Onboarding"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Onboardings', href: paths.onboarding.root },
          { name: 'Editar' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <OnboardingForm
        onboarding={onboarding}
        onSuccess={() => {
          router.push(paths.onboarding.root);
        }}
      />
    </DashboardContent>
  );
}

