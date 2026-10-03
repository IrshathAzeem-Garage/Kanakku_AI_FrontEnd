import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/authApi';
import { shopApi } from '../services/shopApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('kanakku_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('kanakku_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [shop, setShop] = useState(() => {
    const saved = localStorage.getItem('kanakku_shop');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const savedToken = localStorage.getItem('kanakku_token');
    if (!savedToken) {
      setIsLoading(false);
      return;
    }
    try {
      const userData = await authApi.getMe();
      setUser(userData);
      localStorage.setItem('kanakku_user', JSON.stringify(userData));
      if (userData.shop) {
        setShop(userData.shop);
        localStorage.setItem('kanakku_shop', JSON.stringify(userData.shop));
      }
    } catch (err) {
      console.error('Session verification failed:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (username, password) => {
    const data = await authApi.login(username, password);
    const { access_token, user: userData, shop: shopData } = data;
    
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('kanakku_token', access_token);
    localStorage.setItem('kanakku_user', JSON.stringify(userData));

    if (shopData) {
      setShop(shopData);
      localStorage.setItem('kanakku_shop', JSON.stringify(shopData));
    }
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setShop(null);
    localStorage.removeItem('kanakku_token');
    localStorage.removeItem('kanakku_user');
    localStorage.removeItem('kanakku_shop');
  };

  const updateUserProfile = async (profileData) => {
    const updatedUser = await authApi.updateProfile(profileData);
    setUser(updatedUser);
    localStorage.setItem('kanakku_user', JSON.stringify(updatedUser));
    if (updatedUser.shop) {
      setShop(updatedUser.shop);
      localStorage.setItem('kanakku_shop', JSON.stringify(updatedUser.shop));
    }
    return updatedUser;
  };

  const updateShopDetails = async (shopData) => {
    const updatedShop = await shopApi.updateShop(shopData);
    setShop(updatedShop);
    localStorage.setItem('kanakku_shop', JSON.stringify(updatedShop));
    return updatedShop;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        shop,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        refreshSession,
        updateUserProfile,
        updateShopDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
