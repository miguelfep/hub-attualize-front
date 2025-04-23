import { notFound } from 'next/navigation';

import { CONFIG } from 'src/config-global';
import { getAlteracaoById } from 'src/actions/societario';

import AlteracaoEmpresaViewPage from 'src/sections/societario/alteracao/alteracao-view';

export const metadata = {
  title: `Alteração de empresa - ${CONFIG.site.name}`,
};

export const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export default async function Page({ params }) {

  try {
    const { id } = params;

    if (!id) {
      notFound();
    }

    // Busca dados da alteração
    const currentAlteracao = await getAlteracaoById(id);

    if (!currentAlteracao) {
      notFound();
    }


    return (
      <AlteracaoEmpresaViewPage
        alteracaoData={currentAlteracao}
      />
    );
  } catch (error) {
    notFound();
  }
}