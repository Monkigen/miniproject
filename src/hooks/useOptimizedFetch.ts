import { useState, useEffect } from 'react';
import { cache } from '@/lib/cache';

interface FetchOptions {
  cacheKey: string;
  cacheDuration?: number;
  limit?: number;
}

export function useOptimizedFetch<T>(
  fetchFn: () => Promise<T>,
  options: FetchOptions
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cachedData = cache.get<T>(options.cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return;
        }

        // Fetch new data
        const result = await fetchFn();
        
        // Cache the result
        cache.set(options.cacheKey, result, options.cacheDuration);
        
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchFn, options.cacheKey, options.cacheDuration]);

  return { data, loading, error };
} 