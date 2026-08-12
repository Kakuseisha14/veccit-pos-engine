import type { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { RoleGuard } from "@/components/auth/RoleGuard";

export const metadata: Metadata = {
  title: "Dashboard | Veccit ERP",
  description: "Panel de control y dashboard principal de Veccit ERP",
};

export default function DashboardPage() {
  return (
    <RoleGuard allowedRoles={["TENANT_ADMIN"]}>
      <PageBreadcrumb pageTitle="Dashboard" />
      <DashboardView />
    </RoleGuard>
  );
}
