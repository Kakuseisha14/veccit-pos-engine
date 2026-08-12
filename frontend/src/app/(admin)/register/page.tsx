import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { RegistersView } from "@/components/register/RegistersView";

export default function RegisterPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Arqueo y Cierre de Caja" />
      <RegistersView />
    </div>
  );
}