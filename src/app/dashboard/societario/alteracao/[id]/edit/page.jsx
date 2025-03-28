import { CONFIG } from 'src/config-global';
import { getAlteracaoById } from 'src/actions/mockalteracoes';

import AlteracaoEditView from 'src/sections/societario/alteracao/alteracao-edit-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Editar Alteração | Dashboard - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = params;

  const currentAlteracao = await getAlteracaoById(id);

  return <AlteracaoEditView alteracaoData={currentAlteracao} />;
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };
