import { CONFIG } from 'src/config-global';
import { buscarContaPagarPorId } from 'src/actions/contas';

import { PagarEditView } from 'src/sections/financeiro/pagar/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Editar cliente | Dashboard - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  // No Next.js 16, params é uma Promise e precisa ser aguardado
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const currentConta = await buscarContaPagarPorId(id);

    if (!currentConta) {
      throw new Error('Conta não encontrada');
    }

    return <PagarEditView conta={currentConta} />;
  } catch (error) {
    console.error('Erro ao carregar conta:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
export const dynamic = 'force-dynamic';

