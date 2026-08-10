import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { InventoryView } from "@/components/inventory/InventoryView";

export default function ProductsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Inventario" />
      <InventoryView />
    </div>
  );
}
