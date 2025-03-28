import { CONFIG } from 'src/config-global';
import { getAlteracaoById } from 'src/actions/mockalteracoes';

import AlteracaoEmpresaViewPage  from 'src/sections/societario/alteracao/alteracao-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Alteração de empresa - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = params;
  const currentAlteracao = await getAlteracaoById(id);

  if (!currentAlteracao) {
    throw new Error('Alteração Não encontrada');
  }

  return <AlteracaoEmpresaViewPage alteracaoData={currentAlteracao} />;
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };
