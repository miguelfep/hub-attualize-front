import { CONFIG } from 'src/config-global';
import { getClienteById } from 'src/actions/clientes-ssr';

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

