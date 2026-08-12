import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { UsersView } from "@/components/users/UsersView";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function UsersPage() {
  return (
    <RoleGuard allowedRoles={["TENANT_ADMIN"]}>
      <PageBreadcrumb pageTitle="Usuarios" />
      <UsersView />
    </RoleGuard>
  );
}