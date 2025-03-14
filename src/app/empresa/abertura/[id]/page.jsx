import { CONFIG } from 'src/config-global';
import { getAberturaById } from 'src/actions/societario';

import AberturaEmpresaViewPage from 'src/sections/abertura/empresa/abertura-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Abertura de empresa - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = params;

  const currentAbertura = await getAberturaById(id);

  if (!currentAbertura.data) {
    throw new Error('Abertura Não encontrada');
  }

  return <AberturaEmpresaViewPage aberturaData={currentAbertura.data} />;
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };
