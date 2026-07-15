"use client";

import { useCallback, useEffect, useState } from "react";

export function useApiData<T>(load: () => Promise<T>, initialValue: T) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await load());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void reload(), 0);
    return () => window.clearTimeout(timeout);
  }, [reload]);

  return { data, setData, loading, error, reload };
}
