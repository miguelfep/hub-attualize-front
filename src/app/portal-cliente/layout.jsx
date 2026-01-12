'use client';

import { useEffect, useState } from 'react';
import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';

import { ClienteLayout } from 'src/layouts/cliente';
import { SettingsProvider } from 'src/contexts/SettingsContext';

import { SplashScreen } from 'src/components/loading-screen';

import { useAuthContext } from 'src/auth/hooks';
import { getUser } from 'src/auth/context/jwt/utils';
import { RoleBasedGuard } from 'src/auth/guard/role-based-guard';

import { getAulasOnboarding } from 'src/actions/onboarding';

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const [verificandoOnboarding, setVerificandoOnboarding] = useState(true);

  // Se não estiver autenticado, redireciona para login
  useEffect(() => {
    if (!loading && !user) {
      router.replace(paths.auth.jwt.signIn);
    }
  }, [loading, user, router]);

  // Verifica se o usuário é do tipo cliente e redireciona se necessário
  useEffect(() => {
    if (!loading && user) {
      const currentUser = getUser();
      const userType = currentUser?.userType ?? (currentUser?.role === 'cliente' ? 'cliente' : 'interno');
      
      if (userType !== 'cliente') {
        router.replace(paths.dashboard.root);
      }
    }
  }, [loading, user, router]);

  // Verifica conclusão do onboarding (por empresa)
  // Usa getAulasOnboarding() que já retorna se tem onboarding pendente
  useEffect(() => {
    const verificarOnboarding = async () => {
      if (!loading && user && pathname !== paths.cliente.onboarding) {
        try {
          const response = await getAulasOnboarding();
          if (response.data?.success) {
            const data = response.data.data;
            
            console.log('🔍 [LAYOUT] Status do onboarding:', {
              temOnboarding: data.temOnboarding,
              concluido: data.concluido,
              todosOnboardingsConcluidos: data.todosOnboardingsConcluidos,
            });
            
            // Se tem onboarding e não está concluído (todos), redireciona
            if (data.temOnboarding && !data.todosOnboardingsConcluidos) {
              console.log('➡️ [LAYOUT] Redirecionando para onboarding...');
              router.replace(paths.cliente.onboarding);
              return;
            }
          }
        } catch (error) {
          // Se houver erro, permite acesso (não bloqueia usuários)
          console.error('Erro ao verificar onboarding:', error);
        }
      }
      setVerificandoOnboarding(false);
    };

    if (!loading && user) {
      verificarOnboarding();
    } else {
      setVerificandoOnboarding(false);
    }
  }, [loading, user, pathname, router]);

  // Se não estiver autenticado, redireciona para login
  if (loading || verificandoOnboarding) {
    return <SplashScreen />;
  }

  if (!user) {
    return <SplashScreen />;
  }

  // Verifica se o usuário é do tipo cliente
  const currentUser = getUser();
  const userType = currentUser?.userType ?? (currentUser?.role === 'cliente' ? 'cliente' : 'interno');
  
  if (userType !== 'cliente') {
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
