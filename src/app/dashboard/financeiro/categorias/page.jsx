import { CONFIG } from 'src/config-global';

import { CategoriasListView } from 'src/sections/financeiro/categorias/categorias-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Categorias Financeiras | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
    return <CategoriasListView />;
}
