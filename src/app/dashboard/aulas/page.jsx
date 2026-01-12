import { CONFIG } from 'src/config-global';
import { listarAulas } from 'src/actions/onboarding';

import { AulasListView } from 'src/sections/aulas/admin/view/aulas-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Aulas | Dashboard - ${CONFIG.site.name}` };

export default async function AulasPage() {
  let aulas = [];
  let error = null;

  try {
    const response = await listarAulas({ ativo: true });
    // Verifica diferentes estruturas de resposta
    if (response?.data?.success) {
      aulas = response.data.data || [];
    } else if (response?.data && Array.isArray(response.data)) {
      aulas = response.data;
    } else if (Array.isArray(response)) {
      aulas = response;
    }
  } catch (err) {
    error = err;
    console.error('Erro ao carregar aulas:', err);
  }

  return <AulasListView aulas={aulas} error={error} />;
}

// ----------------------------------------------------------------------

const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };

