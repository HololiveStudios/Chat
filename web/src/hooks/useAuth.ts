import { useState, useEffect, useCallback } from 'react';
import { User, AuthTokens } from '../types';
import { apiService } from '../services/api';
import { socketService } from '../services/socket';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userData = localStorage.getItem('user');

      if (accessToken && refreshToken && userData) {
        try {
          const user = JSON.parse(userData);
          const tokens = { accessToken, refreshToken };
          
          setAuthState({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });

          socketService.connect(accessToken);
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          clearAuth();
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response: any = await apiService.login(email, password);
      const { user, tokens } = response;

      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
      });

      socketService.connect(tokens.accessToken);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    try {
      const response: any = await apiService.register(username, email, password);
      const { user, tokens } = response;

      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
      });

      socketService.connect(tokens.accessToken);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    setAuthState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    });

    socketService.disconnect();
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        clearAuth();
        return false;
      }

      const response: any = await apiService.refreshToken(refreshToken);
      const newAccessToken = response.accessToken;

      localStorage.setItem('accessToken', newAccessToken);
      
      setAuthState(prev => ({
        ...prev,
        tokens: prev.tokens ? { ...prev.tokens, accessToken: newAccessToken } : null,
      }));

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuth();
      return false;
    }
  }, [clearAuth]);

  return {
    ...authState,
    login,
    register,
    logout,
    refreshToken,
  };
};