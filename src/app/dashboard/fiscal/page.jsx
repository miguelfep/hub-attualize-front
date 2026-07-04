import { redirect } from 'next/navigation';

import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export default function FiscalIndexPage() {
  redirect(paths.dashboard.fiscal.nfse);
}
