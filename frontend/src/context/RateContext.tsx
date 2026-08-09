"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getActiveRate, setDailyRate, type ActiveRate } from "@/lib/rates";
import { useAuth } from "@/context/AuthContext";

interface RateContextValue {
  rate: ActiveRate | null;
  loading: boolean;
  refresh: () => Promise<void>;
  updateRate: (rateVES: number) => Promise<void>;
}

const RateContext = createContext<RateContextValue | undefined>(undefined);

export const RateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { status } = useAuth();
  const [rate, setRate] = useState<ActiveRate | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (status !== "authenticated") {
      setRate(null);
      setLoading(false);
      return;
    }
    try {
      const { rate: active } = await getActiveRate();
      setRate(active);
    } catch {
      setRate(null);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    let cancelled = false;

    if (status !== "authenticated") {
      return;
    }

    const loadRate = async () => {
      try {
        const { rate: active } = await getActiveRate();
        if (cancelled) return;
        setRate(active);
      } catch {
        if (cancelled) return;
        setRate(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadRate();

    return () => {
      cancelled = true;
    };
  }, [status]);

  const updateRate = useCallback(
    async (rateVES: number) => {
      const { rate: updated } = await setDailyRate(
        rateVES,
        new Date().toISOString().slice(0, 10),
      );
      setRate(updated);
    },
    [],
  );

  return (
    <RateContext.Provider value={{ rate, loading, refresh, updateRate }}>
      {children}
    </RateContext.Provider>
  );
};

export const useRate = (): RateContextValue => {
  const context = useContext(RateContext);
  if (context === undefined) {
    throw new Error("useRate must be used within a RateProvider");
  }
  return context;
};