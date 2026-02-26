import { redirect } from 'next/navigation';

import { paths } from 'src/routes/paths';

// Dashboard financeiro redireciona para a lista de contas a pagar
export default function FinanceiroDashboardPage() {
  redirect(paths.dashboard.financeiro.pagar);
}
