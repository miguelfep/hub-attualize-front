import { CONFIG } from 'src/config-global';

import { IrCheckoutView } from 'src/sections/ir/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `Imposto de Renda | Portal do Cliente - ${CONFIG.site.name}`,
};

export default function Page() {
  return <IrCheckoutView />;
}
