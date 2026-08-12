import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { PosView } from "@/components/pos/PosView";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function PosPage() {
  return (
    <RoleGuard allowedRoles={["TENANT_ADMIN", "CASHIER"]}>
      <PageBreadcrumb pageTitle="Punto de Venta" />
      <PosView />
    </RoleGuard>
  );
}
