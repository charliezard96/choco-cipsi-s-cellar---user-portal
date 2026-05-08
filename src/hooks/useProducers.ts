import { useState, useEffect, useCallback } from 'react';
import { Producer } from '../types';
import { producerService } from '../services/producerService';

export const useProducers = () => {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setProducers(await producerService.fetchAll());
    } catch (err: any) {
      setError(err.message || 'Impossibile caricare i produttori');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { producers, loading, error, refetch: fetch };
};