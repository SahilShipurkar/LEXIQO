import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { googleLogout } from '@react-oauth/google';
import api, { setAccessToken as setAxiosAccessToken, setOnTokenRefresh } from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [appLoading, setAppLoading] = useState(false);

  const updateAuth = useCallback((token, userData) => {
    setAccessToken(token);
    setUser(userData);
    setAxiosAccessToken(token);
  }, []);

  // Set up callback from Axios to update component state
  useEffect(() => {
    setOnTokenRefresh((token, userData) => {
      updateAuth(token, userData);
    });
  }, [updateAuth]);

  const refreshSession = useCallback(async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/refresh`,
        {},
        { withCredentials: true }
      );
      const { access_token, user: userData } = res.data;
      updateAuth(access_token, userData);
      return userData;
    } catch (error) {
      console.log('No active session found.');
      updateAuth(null, null);
    } finally {
      setLoading(false);
    }
  }, [updateAuth]);

  useEffect(() => {
    refreshSession();
    
    // 🛡️ SAFETY FALLBACK: Don't let the boot loader hang for more than 4s
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [refreshSession]);

  const loginWithGoogle = async (idToken) => {
    const res = await api.post('/auth/google-login', { token: idToken });
    const { access_token, user: userData } = res.data;
    updateAuth(access_token, userData);
    return userData;
  };

  const sendEmailOtp = async (email) => {
    await api.post('/auth/send-email-otp', { email });
  };

  const verifyEmailOtp = async (email, otp) => {
    const res = await api.post('/auth/verify-email-otp', { email, otp });
    const { access_token, user: userData } = res.data;
    updateAuth(access_token, userData);
    return userData;
  };

  const loginWithPassword = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = res.data;
    updateAuth(access_token, userData);
    return userData;
  };

  const loginAsGuest = async () => {
    const res = await api.post('/auth/guest-login');
    const { access_token, user: userData } = res.data;
    updateAuth(access_token, userData);
    return userData;
  };

  const registerWithPassword = async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  };

  const setUsername = async (username) => {
    const res = await api.patch('/users/profile', { username });
    setUser(res.data);
    return res.data;
  };

  const checkUsername = async (username) => {
    try {
      const res = await api.get(`/users/check-username?username=${username}`);
      return res.data.available;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const checkEmail = async (email) => {
    try {
      const res = await api.get(`/users/check-email?email=${email}`);
      return res.data.available;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const checkOtp = async (email, otp) => {
    try {
      const res = await api.post('/auth/check-otp', { email, otp });
      return res.data;
    } catch (error) {
      console.error(error);
      return { valid: false };
    }
  };

  const logout = async () => {
    setLogoutLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      updateAuth(null, null);
      localStorage.removeItem('lastVisitedRoute');
      try {
        googleLogout();
      } catch (error) {
        console.error('Google logout failed', error);
      }
      // Small delay for better UX
      setTimeout(() => setLogoutLoading(false), 800);
    }
  };

  const verifyOtpCheck = async (email, otp) => {
    try {
      const res = await api.post('/auth/verify-otp-check', { email, otp });
      return {
        valid: res.data.valid,
        resetToken: res.data.resetToken,
      };
    } catch (error) {
      console.error(error);
      return { valid: false };
    }
  };

  const resetPassword = async (email, newPassword, resetToken) => {
    await api.post('/auth/reset-password', {
      email,
      newPassword,
      resetToken,
    });
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      return res.data;
    } catch (error) {
      console.error('Failed to refresh user data', error);
    }
  };

  const value = {
    user,
    accessToken,
    loading,
    loginWithGoogle,
    sendEmailOtp,
    verifyEmailOtp,
    loginWithPassword,
    loginAsGuest,
    register: registerWithPassword,
    logout,
    checkUsername,
    checkEmail,
    checkOtp,
    verifyOtpCheck,
    refreshUser,
    resetPassword,
    setUsername,
    logoutLoading,
    appLoading,
    setAppLoading,
    isAuthenticated: !!user,
    api, // for other components to use
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
