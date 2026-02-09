import { CONFIG } from 'src/config-global';
import { getFaturaPorId } from 'src/actions/financeiro';

import FaturaViewPage from 'src/sections/faturas/fatura-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Fatura attualize - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  // No Next.js 16, params é uma Promise e precisa ser aguardado
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const currenteFature = await getFaturaPorId(id);

    if (!currenteFature) {
      throw new Error('Fatura Não encontrada');
    }

    return <FaturaViewPage faturaData={currenteFature} />;
  } catch (error) {
    console.error('Erro ao carregar fatura:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
export const dynamic = 'force-dynamic';
