import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { SalesHistoryView } from "@/components/pos/SalesHistoryView";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function SalesPage() {
  return (
    <RoleGuard allowedRoles={["TENANT_ADMIN", "CASHIER"]}>
      <PageBreadcrumb pageTitle="Historial de Ventas" />
      <SalesHistoryView />
    </RoleGuard>
  );
}
