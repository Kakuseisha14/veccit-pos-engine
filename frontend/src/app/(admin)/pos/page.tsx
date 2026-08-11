import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { PosView } from "@/components/pos/PosView";

export default function PosPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Punto de Venta" />
      <PosView />
    </div>
  );
}
