import { redirect } from 'next/navigation';

import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export default async function Page({ params }) {
  const { id } = await params;
  redirect(paths.dashboard.cliente.departamentoPessoal(id));
}
