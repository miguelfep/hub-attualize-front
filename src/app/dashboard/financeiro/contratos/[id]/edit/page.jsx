import { CONFIG } from 'src/config-global';
import { getContratoPorId } from 'src/actions/financeiro';

import { ContratoEditView } from 'src/sections/financeiro/contrato/view/crontrato-edit-vew';
// ----------------------------------------------------------------------

export const metadata = { title: `Editar Venda | Dashboard - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  // No Next.js 16, params é uma Promise e precisa ser aguardado
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const currentContrato = await getContratoPorId(id);

    if (!currentContrato) {
      throw new Error('Contrato não encontrado');
    }

    return <ContratoEditView contrato={currentContrato} />;
  } catch (error) {
    console.error('Erro ao carregar contrato:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
export const dynamic = 'force-dynamic';
