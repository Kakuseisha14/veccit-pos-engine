"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowUpIcon,
  BoxCubeIcon,
  BoxIconLine,
  DollarLineIcon,
  ShootingStarIcon,
  TimeIcon,
} from "@/icons";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import MetricCard from "./MetricCard";
import SalesChart from "./SalesChart";
import {
  getDashboardMetrics,
  type DashboardMetrics,
} from "@/lib/dashboard";
import { formatUSD } from "@/lib/inventory";

const todayLabel = (): string =>
  new Date().toLocaleDateString("es-VE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const { showError } = useToast();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      try {
        const result = await getDashboardMetrics();
        if (cancelled) return;
        setMetrics(result);
      } catch (err) {
        if (cancelled) return;
        showError(
          "Error de métricas",
          err instanceof Error ? err.message : "Error al cargar el dashboard",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [user, showError]);

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 md:gap-6">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-36 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <div className="animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800 h-12 w-12" />
              <div className="mt-5 space-y-2">
                <div className="animate-pulse rounded-md bg-gray-100 dark:bg-gray-800 h-3 w-2/3" />
                <div className="animate-pulse rounded-md bg-gray-100 dark:bg-gray-800 h-6 w-1/2" />
              </div>
            </div>
          ))}
        </div>
        <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 capitalize dark:text-white/90">
          Buen día, {user?.name?.split(" ")[0] ?? "admin"}
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {todayLabel()}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 md:gap-6">
        <MetricCard
          title="Ventas hoy"
          value={String(metrics.today.salesCount)}
          caption="Transacciones completadas del día"
          icon={<BoxIconLine className="size-6" />}
        />
        <MetricCard
          title="Ingresos hoy"
          value={formatUSD(metrics.today.salesUSD)}
          caption="Total vendido en USD"
          icon={<DollarLineIcon className="size-6" />}
        />
        <MetricCard
          title="Ganancia bruta hoy"
          value={formatUSD(metrics.today.grossProfitUSD)}
          caption="Ingresos menos costo de los productos"
          icon={<ArrowUpIcon className="size-6" />}
        />
        <MetricCard
          title="Ventas últimos 7 días"
          value={String(metrics.last7Days.salesCount)}
          caption="Transacciones de la semana"
          icon={<TimeIcon className="size-6" />}
        />
        <MetricCard
          title="Ingresos últimos 7 días"
          value={formatUSD(metrics.last7Days.salesUSD)}
          caption="Total vendido en USD en la semana"
          icon={<DollarLineIcon className="size-6" />}
        />
        <MetricCard
          title="Ganancia últimos 7 días"
          value={formatUSD(metrics.last7Days.grossProfitUSD)}
          caption="Ganancia bruta de la semana"
          icon={<ArrowUpIcon className="size-6" />}
        />
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-7">
          <SalesChart dailySales={metrics.dailySales} />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 h-full">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Producto más vendido
              </h3>
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <ShootingStarIcon className="size-5" />
              </span>
            </div>

            {metrics.bestSellingProduct ? (
              <div className="mt-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <BoxCubeIcon className="size-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white/90">
                      {metrics.bestSellingProduct.productName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {metrics.bestSellingProduct.productSku}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-gray-50 p-4 dark:bg-white/[0.03]">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Unidades vendidas
                  </span>
                  <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                    {metrics.bestSellingProduct.quantitySold}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                Aún no hay ventas registradas.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
