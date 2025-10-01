'use client';

import { useState, useEffect } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { SplashScreen } from 'src/components/loading-screen';

import { useAuthContext } from '../hooks';
import { getUser } from '../context/jwt/utils';

// ----------------------------------------------------------------------

export function GuestGuard({ children }) {
  const router = useRouter();

  const searchParams = useSearchParams();

  const { loading, authenticated, user } = useAuthContext();

  const [isChecking, setIsChecking] = useState(true);

  const returnTo = searchParams.get('returnTo') || CONFIG.auth.redirectPath;

  const checkPermissions = async () => {
    if (loading) {
      return;
    }

    if (authenticated) {
      // Redireciona baseado no tipo de usuário
      const currentUser = getUser();
      // Determina o userType baseado no role se não estiver definido
      const userType = currentUser?.userType ?? (currentUser?.role === 'cliente' ? 'cliente' : 'interno');
      
      if (userType === 'cliente') {
        router.replace(paths.cliente.dashboard);
      } else {
        // Para usuários internos, verifica se o returnTo é válido
        const validReturnTo = returnTo && !returnTo.includes('/portal-cliente') ? returnTo : paths.dashboard.root;
        router.replace(validReturnTo);
      }
      return;
    }

    setIsChecking(false);
  };

  useEffect(() => {
    checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, loading]);

  if (isChecking) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
