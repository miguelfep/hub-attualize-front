import Cookies from 'js-cookie';

import { paths } from 'src/routes/paths';

import axios from 'src/utils/axios';

import { USER_DATA, STORAGE_KEY } from './constant';

// ----------------------------------------------------------------------

export function jwtDecode(token) {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) {
      throw new Error('Invalid token!');
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));

    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export function isValidToken(accessToken) {
  if (!accessToken) {
    return false;
  }

  try {
    const decoded = jwtDecode(accessToken);

    if (!decoded || !('exp' in decoded)) {
      return false;
    }

    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error during token validation:', error);
    return false;
  }
}

// ----------------------------------------------------------------------

export function tokenExpired(exp) {
  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;

  setTimeout(() => {
    try {
      alert('Token expired!');
      Cookies.remove(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
      window.location.href = paths.auth.jwt.signIn;
    } catch (error) {
      console.error('Error during token expiration:', error);
      throw error;
    }
  }, timeLeft);
}

// ----------------------------------------------------------------------

export async function setSession(accessToken) {
  try {
    if (accessToken) {
      // Salva o token nos cookies em vez do sessionStorage
      Cookies.set(STORAGE_KEY, accessToken, { expires: 7 });

      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      const decodedToken = jwtDecode(accessToken); // ~3 days by minimals server

      if (decodedToken && 'exp' in decodedToken) {
        tokenExpired(decodedToken.exp);
      } else {
        throw new Error('Invalid access token!');
      }
    } else {
      Cookies.remove(STORAGE_KEY); // Remove o token dos cookies
      delete axios.defaults.headers.common.Authorization;
    }
  } catch (error) {
    console.error('Error during set session:', error);
    throw error;
  }
}

// O userData é guardado no localStorage (não em cookie): usuários com muitas
// empresas/setores vinculados geram um JSON > 4KB, que estoura o limite do
// cookie — o navegador descartava o cookie e a sessão "sumia" (login caía para
// não-admins). localStorage não tem esse limite.
export async function setUser(userData) {
  try {
    if (typeof window !== 'undefined') {
      if (userData) {
        localStorage.setItem(USER_DATA, JSON.stringify(userData));
      } else {
        localStorage.removeItem(USER_DATA);
      }
    }
    // Remove o resquício em cookie (sessões antigas / migração).
    Cookies.remove(USER_DATA);
  } catch (error) {
    console.error('Error during setting user session:', error);
    throw error;
  }
}

// Função adicional para obter userData da sessão
export function getUser() {
  try {
    // localStorage primeiro; cookie como fallback para sessões antigas.
    let raw = typeof window !== 'undefined' ? localStorage.getItem(USER_DATA) : null;
    if (!raw) raw = Cookies.get(USER_DATA) || null;
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Error during getting user session:', error);
    return null;
  }
}
