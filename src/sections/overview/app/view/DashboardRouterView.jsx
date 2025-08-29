'use client';

import { getUser } from 'src/auth/context/jwt';

import DashboardAdminView from './DashboardAdminView';
import DashboardComercialView from './DashboardComercialView';
import DashboardFinanceiroView from './DashboardFinanceiroView';

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
