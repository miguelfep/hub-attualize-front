import { CONFIG } from 'src/config-global';
import { getAulasOnboarding } from 'src/actions/onboarding';

import { OnboardingView } from 'src/sections/onboarding/view/onboarding-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Onboarding | Portal Cliente - ${CONFIG.site.name}` };

export default async function OnboardingPage() {
  let aulasData = null;
  let error = null;

  try {
    const response = await getAulasOnboarding();
    if (response.data?.success) {
      aulasData = response.data.data || null;
    }
  } catch (err) {
    error = err;
    console.error('Erro ao carregar aulas do onboarding:', err);
  }

  return <OnboardingView aulasData={aulasData} error={error} />;
}

// ----------------------------------------------------------------------

const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };

