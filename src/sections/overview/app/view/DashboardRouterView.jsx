'use client';

import { getUser } from 'src/auth/context/jwt';
import DashboardAdminView from './DashboardAdminView';
import DashboardFinanceiroView from './DashboardFinanceiroView';
import DashboardComercialView from './DashboardComercialView';

export function DashboardRouterView() {
  const user = getUser();  

  if (!user) return null;

  if (user.role === 'admin') {
    return <DashboardAdminView />;
  }

  if (user.role === 'financeiro') {
    return <DashboardFinanceiroView />;
  }

  if (user.role === 'comercial') {
    return <DashboardComercialView />;
  }

  return <div>Permissão não reconhecida.</div>;
}
