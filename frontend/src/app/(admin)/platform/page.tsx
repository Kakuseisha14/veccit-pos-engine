import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { PlatformView } from "@/components/platform/PlatformView";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function PlatformPage() {
  return (
    <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
      <PageBreadcrumb pageTitle="Comercios" />
      <PlatformView />
    </RoleGuard>
  );
}