"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function useApiData<T>(load: () => Promise<T>, initialValue: T) {
  const t = useTranslations("common");
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await load());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("error"));
    } finally {
      setLoading(false);
    }
  }, [load, t]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void reload(), 0);
    return () => window.clearTimeout(timeout);
  }, [reload]);

  return { data, setData, loading, error, reload };
}
