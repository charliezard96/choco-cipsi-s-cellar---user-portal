
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
      const data = await chocolateService.fetchAll();
      setChocolates(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch chocolates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChocolates();
  }, [fetchChocolates, retryCount]);

  const retry = () => setRetryCount(prev => prev + 1);

  return { chocolates, loading, error, retry };
};
