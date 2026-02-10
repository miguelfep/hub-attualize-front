import { CONFIG } from 'src/config-global';
import { getAlteracaoById } from 'src/actions/societario';

import AlteracaoEditView from 'src/sections/societario/alteracao/alteracao-edit-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Editar Alteração | Dashboard - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  // No Next.js 16, params é uma Promise e precisa ser aguardado
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const currentAlteracao = await getAlteracaoById(id);

  // Extrair data se a resposta vier com essa estrutura
  const alteracaoData = currentAlteracao?.data || currentAlteracao;

  return <AlteracaoEditView alteracaoData={alteracaoData} />;
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
export const dynamic = 'force-dynamic';