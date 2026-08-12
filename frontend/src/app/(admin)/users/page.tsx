import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { UsersView } from "@/components/users/UsersView";

export default function UsersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Usuarios" />
      <UsersView />
    </div>
  );
}