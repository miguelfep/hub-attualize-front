import { CONFIG } from 'src/config-global';
import { getAulaById } from 'src/actions/onboarding';

import { AulaEditView } from 'src/sections/aulas/admin/view/aula-edit-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Editar Aula | Dashboard - ${CONFIG.site.name}` };

export default async function AulaEditPage({ params }) {
  const { id } = await params;
  let aula = null;
  let error = null;

  try {
    const response = await getAulaById(id);
    if (response?.data?.success) {
      aula = response.data.data;
    }
  } catch (err) {
    error = err;
    console.error('Erro ao carregar aula:', err);
  }

  return <AulaEditView aula={aula} error={error} />;
}

// ----------------------------------------------------------------------

const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };

