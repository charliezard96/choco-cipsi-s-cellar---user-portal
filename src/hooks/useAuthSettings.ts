import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export function useAuthSettings() {
  const [googleEnabled, setGoogleEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSettings() {
      try {
        const enabled = await authService.isGoogleLoginEnabled();
        setGoogleEnabled(enabled);
      } catch (err) {
        console.error('Failed to check auth settings:', err);
        setGoogleEnabled(false);
      } finally {
        setLoading(false);
      }
    }

    checkSettings();
  }, []);

  return { googleEnabled, loading };
}
