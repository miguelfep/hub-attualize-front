import { notFound } from 'next/navigation';

import { CONFIG } from 'src/config-global';
import { getAlteracaoById } from 'src/actions/societario';

import AlteracaoEmpresaViewPage from 'src/sections/societario/alteracao/alteracao-view';

export const metadata = {
  title: `Alteração de empresa - ${CONFIG.site.name}`,
};

export const dynamic = 'force-dynamic';

export default async function Page({ params }) {
  // No Next.js 16, params é uma Promise e precisa ser aguardado
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
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