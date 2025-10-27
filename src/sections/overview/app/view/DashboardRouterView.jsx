'use client';

import { useEffect } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { getUser } from 'src/auth/context/jwt';

import DashboardAdminView from './DashboardAdminView';
import DashboardComercialView from './DashboardComercialView';
import DashboardFinanceiroView from './DashboardFinanceiroView';
import DashboardOperacional from './DashboardOperacional';

export function DashboardRouterView() {
  const user = getUser();
  const router = useRouter();

  // Se for cliente, redireciona para área do cliente
  useEffect(() => {
    if (user && user.userType === 'cliente') {
      router.replace(paths.cliente.dashboard);
    }
  }, [user, router]);

  if (!user) return null;

  if (user.userType === 'cliente') {
    return null;
  }

  if (user.role === 'admin') {
    return <DashboardAdminView />;
  }

  if (user.role === 'financeiro') {
    return <DashboardFinanceiroView />;
  }

  if (user.role === 'comercial') {
    return <DashboardComercialView />;
  }

  if (user.role === 'operacional') {
    return <DashboardOperacional />;
  }

  return <div>Permissão não reconhecida.</div>;
}
