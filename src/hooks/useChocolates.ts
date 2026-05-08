import { useState, useEffect, useCallback } from 'react';
import { Chocolate } from '../types';
import { chocolateService } from '../services/chocolateService';

export const useChocolates = () => {
  const [chocolates, setChocolates] = useState<Chocolate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchChocolates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setChocolates(await chocolateService.fetchAll());
    } catch (err: any) {
      setError(err.message || 'Impossibile caricare i cioccolati');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchChocolates(); }, [fetchChocolates, retryCount]);

  return {
    chocolates, loading, error,
    retry: () => setRetryCount(c => c + 1),
  };
};