
import { useState, useEffect, useCallback } from 'react';
import { Producer } from '../types';
import { producerService } from '../services/producerService';

export const useProducers = () => {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await producerService.fetchAll();
      setProducers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch producers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducers();
  }, [fetchProducers]);

  return { producers, loading, error, refetch: fetchProducers };
};
