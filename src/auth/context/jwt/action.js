'use client';

import Cookies from 'js-cookie';

import axios, { endpoints } from 'src/utils/axios'; // Certifique-se de ter a biblioteca js-cookie instalada

import { setUser, setSession } from './utils';
import { USER_DATA, STORAGE_KEY } from './constant';

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }) => {
  try {
    const params = { email, password };

    const res = await axios.post(endpoints.auth.signIn, params);

    const { accessToken, userData } = res.data.response;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    setUser(userData);

    // Define o cookie usando js-cookie
    Cookies.set('accessToken', accessToken, { expires: 7 });
    setSession(accessToken);
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({ email, password, firstName, lastName }) => {
  const params = {
    email,
    password,
    firstName,
    lastName,
  };

  try {
    const res = await axios.post(endpoints.auth.signUp, params);

    const { accessToken } = res.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    sessionStorage.setItem(STORAGE_KEY, accessToken);
    Cookies.set('accessToken', accessToken, { expires: 7 });
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Reset Password
 *************************************** */
export const resetPassword = async ({ email }) => {
  try {
    const params = { email };
    const res = await axios.post(endpoints.auth.resetPassword, params);
    return res.data;
  } catch (error) {
    console.error('Error during password reset:', error);
    throw error;
  }
};

/** **************************************
 * Update Password
 *************************************** */
export const updatePassword = async ({ userId, token, password }) => {
  try {
    const params = { userId, token, password };
    const res = await axios.post(endpoints.auth.resetPassword, params);
    return res.data;
  } catch (error) {
    console.error('Error during password update:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async () => {
  try {
    Cookies.remove(STORAGE_KEY);
    Cookies.remove(USER_DATA);
    await setSession(null);
    await setUser(null);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
