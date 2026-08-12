import type { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard | Veccit POS",
  description: "Métricas de ventas y ganancias del negocio",
};

export default function DashboardPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Dashboard" />
      <DashboardView />
    </div>
  );
}
