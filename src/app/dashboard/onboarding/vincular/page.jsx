import { CONFIG } from 'src/config-global';
import { listarOnboardings } from 'src/actions/onboarding';

import { VincularClienteOnboardingView } from 'src/sections/onboarding/admin/view/vincular-cliente-onboarding-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Vincular Cliente ao Onboarding | Dashboard - ${CONFIG.site.name}` };

export default async function VincularClienteOnboardingPage() {
  let onboardings = [];
  let error = null;

  try {
    const response = await listarOnboardings({ ativo: true });
    if (response.data?.success) {
      onboardings = response.data.data;
    }
  } catch (err) {
    error = err;
    console.error('Erro ao carregar onboardings:', err);
  }

  return <VincularClienteOnboardingView onboardings={onboardings} error={error} />;
}

// ----------------------------------------------------------------------

const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };

