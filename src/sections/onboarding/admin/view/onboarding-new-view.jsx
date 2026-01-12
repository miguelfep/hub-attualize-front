'use client';

import { useRouter } from 'src/routes/hooks';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { OnboardingForm } from '../onboarding-form';

// ----------------------------------------------------------------------

export function OnboardingNewView() {
  const router = useRouter();

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Novo Onboarding"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Onboardings', href: paths.onboarding.root },
          { name: 'Novo' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <OnboardingForm
        onSuccess={() => {
          router.push(paths.onboarding.root);
        }}
      />
    </DashboardContent>
  );
}

