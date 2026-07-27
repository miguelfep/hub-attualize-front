import { CONFIG } from 'src/config-global';

import { FatorRDetailView } from 'src/sections/fator-r/view';

export const metadata = { title: `Fator R do cliente | Fiscal - ${CONFIG.site.name}` };

export default async function Page({ params }) {
  const { id } = await params;

  return <FatorRDetailView id={id} />;
}
