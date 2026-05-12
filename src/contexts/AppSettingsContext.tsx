import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

interface AppSettingsContextValue {
  tastingsEnabled: boolean;
  loading: boolean;
}

const AppSettingsContext = createContext<AppSettingsContextValue>({ tastingsEnabled: true, loading: true });

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tastingsEnabled, setTastingsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.isTastingsEnabled()
      .then(setTastingsEnabled)
      .catch(() => setTastingsEnabled(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppSettingsContext.Provider value={{ tastingsEnabled, loading }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => useContext(AppSettingsContext);
