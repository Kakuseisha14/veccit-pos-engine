"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import React from "react";
import type { DailySalesPoint } from "@/lib/dashboard";
import { formatUSD } from "@/lib/inventory";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface SalesChartProps {
  dailySales: DailySalesPoint[];
}

const formatDayLabel = (date: string): string => {
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
  });
};

const SalesChart: React.FC<SalesChartProps> = ({ dailySales }) => {
  const categories = dailySales.map((point) => formatDayLabel(point.date));
  const data = dailySales.map((point) => point.salesUSD);

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 300,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "42%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: { show: false },
    grid: {
      yaxis: { lines: { show: true } },
      padding: { left: 8, right: 8 },
    },
    fill: { opacity: 1 },
    yaxis: {
      labels: {
        formatter: (value: number) => `$${value.toFixed(0)}`,
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => formatUSD(value),
      },
    },
  };

  const series = [{ name: "Ventas", data }];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Ventas de los últimos 7 días
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Ingresos diarios en USD
        </p>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[560px]">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={300}
          />
        </div>
      </div>
    </div>
  );
};

export default SalesChart;
