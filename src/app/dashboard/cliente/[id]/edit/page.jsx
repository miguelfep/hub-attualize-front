import { CONFIG } from 'src/config-global';
import { getClienteById } from 'src/actions/clientes-ssr';

import { ClienteEditView } from 'src/sections/cliente/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Editar cliente | Dashboard - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  // No Next.js 16, params é uma Promise e precisa ser aguardado
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const currentCliente = await getClienteById(id);

    if (!currentCliente) {
      throw new Error('Cliente não encontrado');
    }

    return <ClienteEditView cliente={currentCliente} />;
  } catch (error) {
    console.error('Erro ao carregar cliente:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
export const dynamic = 'force-dynamic';

