import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export function useAuthSettings() {
  const [googleEnabled, setGoogleEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService
      .isGoogleLoginEnabled()
      .then(setGoogleEnabled)
      .catch(() => setGoogleEnabled(false))
      .finally(() => setLoading(false));
  }, []);

  return { googleEnabled, loading };
}