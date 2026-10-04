import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { pingBackendHealth } from '../services/api';

const BackendStatusContext = createContext(null);

export function BackendStatusProvider({ children }) {
  const [isHealthy, setIsHealthy] = useState(true);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [wakeAttempt, setWakeAttempt] = useState(1);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const checkHealth = useCallback(async (force = false) => {
    if (!navigator.onLine) {
      setIsOffline(true);
      return false;
    }
    setIsOffline(false);

    try {
      const ok = await pingBackendHealth(force);
      if (ok) {
        setIsHealthy(true);
        setIsWakingUp(false);
      }
      return ok;
    } catch {
      // Never crash on wake-up failure
      return false;
    }
  }, []);

  useEffect(() => {
    // Single lightweight wake-up ping when frontend application loads
    checkHealth();

    const handleOnline = () => {
      setIsOffline(false);
      checkHealth(true);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkHealth]);


  return (
    <BackendStatusContext.Provider
      value={{
        isHealthy,
        isWakingUp,
        wakeAttempt,
        isOffline,
        checkHealth,
      }}
    >
      {children}
    </BackendStatusContext.Provider>
  );
}

export function useBackendStatus() {
  const context = useContext(BackendStatusContext);
  if (!context) {
    throw new Error('useBackendStatus must be used within BackendStatusProvider');
  }
  return context;
}
