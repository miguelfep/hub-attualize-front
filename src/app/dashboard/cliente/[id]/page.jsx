import { CONFIG } from 'src/config-global';
import { getClienteById } from 'src/actions/clientes';

import { ClienteEditView } from 'src/sections/cliente/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Editar cliente | Dashboard - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = params;
  console.log('esta nesse');

  const currentCliente = await getClienteById(id);
  console.log('clientea aqui: ', currentCliente);
  return <ClienteEditView cliente={currentCliente} />;
}

// ----------------------------------------------------------------------

/**
 * [1] Default
 * Remove [1] and [2] if not using [2]
 */
const dynamic = CONFIG.isStaticExport ? 'auto' : 'force-dynamic';

export { dynamic };
