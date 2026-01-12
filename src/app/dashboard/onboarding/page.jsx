import { CONFIG } from 'src/config-global';
import { listarOnboardings } from 'src/actions/onboarding';

import { OnboardingsListView } from 'src/sections/onboarding/admin/view/onboardings-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Onboardings | Dashboard - ${CONFIG.site.name}` };

export default async function OnboardingsPage() {
  let onboardings = [];
  let error = null;

  try {
    const response = await listarOnboardings({ ativo: true });
    // Verifica diferentes estruturas de resposta
    if (response?.data?.success) {
      onboardings = response.data.data || [];
    } else if (response?.data && Array.isArray(response.data)) {
      onboardings = response.data;
    } else if (Array.isArray(response)) {
      onboardings = response;
    }
  } catch (err) {
    error = err;
    console.error('Erro ao carregar onboardings:', err);
  }

  return <OnboardingsListView onboardings={onboardings} error={error} />;
}

// ----------------------------------------------------------------------

const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };

