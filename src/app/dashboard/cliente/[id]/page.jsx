import { CONFIG } from 'src/config-global';
import { getClientes, getClienteById } from 'src/actions/clientes-ssr';

import { ClienteEditView } from 'src/sections/cliente/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Editar cliente | Dashboard - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = params;

  const currentCliente = await getClienteById(id);
  
  return <ClienteEditView cliente={currentCliente} />;
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
export const dynamic = 'force-dynamic';

/**
 * [2] Static exports
 * https://nextjs.org/docs/app/building-your-application/deploying/static-exports
 */
export async function generateStaticParams() {
  if (CONFIG.isStaticExport) {
    try {
      const clientes = await getClientes(); // Assumindo que há uma função para obter todas as invoices
      return clientes.map((cliente) => ({ id: cliente._id }));
    } catch (error) {
      console.error('Failed to generate static params:', error);
      return [];
    }
  }
  return [];
}
