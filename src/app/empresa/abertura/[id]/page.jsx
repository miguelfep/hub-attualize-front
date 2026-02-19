import { notFound } from 'next/navigation';

import { CONFIG } from 'src/config-global';
import { getAberturaById } from 'src/actions/societario';

import AberturaEmpresaViewPage from 'src/sections/abertura/empresa/abertura-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Abertura de empresa - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  // No Next.js 16, params é uma Promise e precisa ser aguardado
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    if (!id) {
      notFound();
    }

    const response = await getAberturaById(id);
    
    // A resposta do axios pode ter diferentes estruturas
    // Verifica se é response.data ou apenas data
    const aberturaData = response?.data || response;
    
    if (!aberturaData || (typeof aberturaData === 'object' && Object.keys(aberturaData).length === 0)) {
      console.error('Abertura não encontrada ou dados vazios:', { id, response });
      notFound();
    }

    return <AberturaEmpresaViewPage aberturaData={aberturaData} />;
  } catch (error) {
    console.error('Erro ao buscar abertura:', error);
    console.error('Detalhes do erro:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    });
    notFound();
  }
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
export const dynamic = 'force-dynamic';
