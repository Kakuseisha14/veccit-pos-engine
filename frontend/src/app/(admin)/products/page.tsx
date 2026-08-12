import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { InventoryView } from "@/components/inventory/InventoryView";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function ProductsPage() {
  return (
    <RoleGuard allowedRoles={["TENANT_ADMIN", "CASHIER"]}>
      <PageBreadcrumb pageTitle="Inventario" />
      <InventoryView />
    </RoleGuard>
  );
}
