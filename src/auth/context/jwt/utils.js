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

export async function setUser(userData) {
  try {
    if (userData) {
      // Converter o objeto userData em uma string JSON antes de armazená-lo
      Cookies.set(USER_DATA, JSON.stringify(userData), { expires: 7 });
    } else {
      Cookies.remove(USER_DATA); // Remove o userData dos cookies
    }
  } catch (error) {
    console.error('Error during setting user session:', error);
    throw error;
  }
}

// Função adicional para obter userData da sessão
export function getUser() {
  try {
    const userData = Cookies.get(USER_DATA); // Obtém userData dos cookies
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error during getting user session:', error);
    return null;
  }
}