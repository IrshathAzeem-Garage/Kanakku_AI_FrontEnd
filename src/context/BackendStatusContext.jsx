import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wakeBackend } from '../services/api';

const BackendStatusContext = createContext(null);

export function BackendStatusProvider({ children }) {
  const [isHealthy, setIsHealthy] = useState(true);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [wakeAttempt, setWakeAttempt] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const checkHealth = useCallback(async () => {
    if (!navigator.onLine) {
      setIsOffline(true);
      return;
    }
    await wakeBackend((status) => {
      if (status.isWakingUp !== undefined) setIsWakingUp(status.isWakingUp);
      if (status.attempt !== undefined) setWakeAttempt(status.attempt);
      if (status.isHealthy !== undefined) setIsHealthy(status.isHealthy);
    });
  }, []);

  useEffect(() => {
    // Initial silent health ping to wake Render
    checkHealth();

    const handleOnline = () => {
      setIsOffline(false);
      checkHealth();
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
