import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { RegistersView } from "@/components/register/RegistersView";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function RegisterPage() {
  return (
    <RoleGuard allowedRoles={["TENANT_ADMIN", "CASHIER"]}>
      <PageBreadcrumb pageTitle="Arqueo y Cierre de Caja" />
      <RegistersView />
    </RoleGuard>
  );
}