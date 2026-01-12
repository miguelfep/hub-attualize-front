import { CONFIG } from 'src/config-global';

import { OnboardingNewView } from 'src/sections/onboarding/admin/view/onboarding-new-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Novo Onboarding | Dashboard - ${CONFIG.site.name}` };

export default function OnboardingNewPage() {
  return <OnboardingNewView />;
}

// ----------------------------------------------------------------------

const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };

