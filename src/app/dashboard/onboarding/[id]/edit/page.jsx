import { CONFIG } from 'src/config-global';
import { getOnboardingById } from 'src/actions/onboarding';

import { OnboardingEditView } from 'src/sections/onboarding/admin/view/onboarding-edit-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Editar Onboarding | Dashboard - ${CONFIG.site.name}` };

export default async function OnboardingEditPage({ params }) {
  const { id } = await params;
  
  let onboarding = null;
  let error = null;

  try {
    const response = await getOnboardingById(id);
    if (response.data?.success) {
      onboarding = response.data.data;
    }
  } catch (err) {
    error = err;
    console.error('Erro ao carregar onboarding:', err);
  }

  return <OnboardingEditView onboarding={onboarding} error={error} />;
}

// ----------------------------------------------------------------------

const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };

