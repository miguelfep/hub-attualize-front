'use client';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { ClienteLayout } from 'src/layouts/cliente';

import { SplashScreen } from 'src/components/loading-screen';

import { useAuthContext } from 'src/auth/hooks';
import { getUser } from 'src/auth/context/jwt/utils';
import { RoleBasedGuard } from 'src/auth/guard/role-based-guard';
import { SettingsProvider } from 'src/contexts/SettingsContext';

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  // Se não estiver autenticado, redireciona para login
  if (loading) {
    return <SplashScreen />;
  }

  if (!user) {
    router.replace(paths.auth.jwt.signIn);
    return <SplashScreen />;
  }

  // Verifica se o usuário é do tipo cliente
  const currentUser = getUser();
  const userType = currentUser?.userType ?? (currentUser?.role === 'cliente' ? 'cliente' : 'interno');
  
  if (userType !== 'cliente') {
    router.replace(paths.dashboard.root);
    return <SplashScreen />;
  }

  return (
    <RoleBasedGuard
      currentRole={user.role}
      acceptRoles={['cliente']}
      hasContent
    >
      <SettingsProvider>
        <ClienteLayout>{children}</ClienteLayout>
      </SettingsProvider>
    </RoleBasedGuard>
  );
}
