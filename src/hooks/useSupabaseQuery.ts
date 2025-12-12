import { useCallback, useEffect, useState } from "react";

interface SupabaseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<T>;
}

export function useSupabaseQuery<T>(
  fetcher: () => Promise<T>
): SupabaseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
      return result;
    } catch (err) {
      const normalized = err instanceof Error ? err : new Error(String(err));
      console.error(normalized);
      setError(normalized);
      throw normalized;
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    execute().catch(() => {
      /* error handled in execute */
    });
  }, [execute]);

  return { data, loading, error, refetch: execute };
}
