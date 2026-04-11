import { redirect } from 'next/navigation';

import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

/** Rota antiga: apontamentos passaram a ficar só em `/departamento-pessoal/apontamentos`. */
export default async function Page({ params }) {
  const { funcionarioId } = await params;
  redirect(paths.cliente.departamentoPessoal.apontamentosLancar({ funcionario: funcionarioId }));
}
