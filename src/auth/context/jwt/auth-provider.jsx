'use client';

import Cookies from 'js-cookie';
import { useMemo, useEffect, useCallback } from 'react';

import { useEmpresa } from 'src/hooks/use-empresa';
import { useSetState } from 'src/hooks/use-set-state';

import { signOut } from './action';
import { STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { getUser, setSession, isValidToken } from './utils';

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({
    user: null,
    loading: true,
  });

  // Hook para gerenciar empresas (apenas para usuários do tipo cliente)
  const shouldLoadEmpresas = state.user?.userType === 'cliente';
  const userIdForEmpresas = shouldLoadEmpresas ? (state.user?.id || state.user?._id || state.user?.userId) : null;
  
  const empresaHook = useEmpresa(userIdForEmpresas);

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = Cookies.get(STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const user = getUser();

        setState({ user, loading: false });
      } else {
        setState({ user: null, loading: false });
      }
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  const logout = useCallback(async () => {
    try {
      await signOut();
      setState({ user: null, loading: false });
      // Redireciona para a página de login
      window.location.href = '/auth/jwt/sign-in';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => {
      const user = state.user
        ? {
            ...state.user,
            role: state.user?.role ?? 'operacional',
            userType: state.user?.userType ?? (state.user?.role === 'cliente' ? 'cliente' : 'interno'),
          }
        : null;
      
      // Informações de empresa (apenas para usuários cliente)
      const empresaInfo = user?.userType === 'cliente' ? {
        empresas: empresaHook.empresas,
        empresaAtiva: empresaHook.empresaAtiva,
        empresaAtivaData: empresaHook.empresaAtivaData,
        temMultiplasEmpresas: empresaHook.temMultiplasEmpresas,
        trocarEmpresa: empresaHook.trocarEmpresa,
        loadingEmpresa: empresaHook.loading,
      } : null;
      
      return {
        user,
        empresa: empresaInfo,
        checkUserSession,
        logout,
        loading: status === 'loading',
        authenticated: status === 'authenticated',
        unauthenticated: status === 'unauthenticated',
      };
    },
    [checkUserSession, logout, state.user, status, empresaHook]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
