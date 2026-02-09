import { CONFIG } from 'src/config-global';
import { getAberturaById } from 'src/actions/societario';

import { AberturaEditView } from 'src/sections/societario/view/abertura-edit-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Editar Abertura | Dashboard - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = params;

  const currentAbertura = await getAberturaById(id);

  return <AberturaEditView abertura={currentAbertura.data} />;
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
export const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';
