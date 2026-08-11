import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { SalesHistoryView } from "@/components/pos/SalesHistoryView";

export default function SalesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Historial de Ventas" />
      <SalesHistoryView />
    </div>
  );
}
