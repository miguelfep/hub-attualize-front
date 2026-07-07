import { notFound } from 'next/navigation';

import { CONFIG } from 'src/config-global';
import { getAberturaById } from 'src/actions/societario';

import { AberturaConversaView } from 'src/sections/abertura/empresa/conversa/abertura-conversa-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Abertura de empresa - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    if (!id) {
      notFound();
    }

    const response = await getAberturaById(id);
    const aberturaData = response?.data || response;

    if (!aberturaData || (typeof aberturaData === 'object' && Object.keys(aberturaData).length === 0)) {
      notFound();
    }

    return <AberturaConversaView aberturaData={aberturaData} />;
  } catch (error) {
    console.error('Erro ao buscar abertura:', error);
    notFound();
  }
}

// ----------------------------------------------------------------------

export const dynamic = 'force-dynamic';
