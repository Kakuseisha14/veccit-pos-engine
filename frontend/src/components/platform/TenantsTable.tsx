"use client";

import React from "react";
import {
  TENANT_PLAN_LABELS,
  type Tenant,
  type TenantPlan,
} from "@/lib/tenants";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";

interface TenantsTableProps {
  tenants: Tenant[];
  onAddTenant: () => void;
  onToggleActive: (tenant: Tenant) => void;
  onSaveTier: (tenant: Tenant, plan: TenantPlan) => void;
}

export const TenantsTable: React.FC<TenantsTableProps> = ({
  tenants,
  onAddTenant,
  onToggleActive,
  onSaveTier,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Comercios
        </h3>
        <Button size="sm" onClick={onAddTenant}>
          Nuevo comercio
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader className="bg-gray-50 text-left text-theme-xs text-gray-500 dark:bg-gray-800/40 dark:text-gray-400">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium">
                Comercio
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium">
                Plan
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium">
                Estado
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium">
                Acciones
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tenants.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  Aun no hay comercios. Crea el primero con el boton
                  &quot;Nuevo comercio&quot;.
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {tenant.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {tenant.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <select
                      value={tenant.plan}
                      onChange={(e) =>
                        onSaveTier(
                          tenant,
                          e.target.value as TenantPlan,
                        )
                      }
                      className="w-36 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      aria-label={`Plan de ${tenant.name}`}
                    >
                      {Object.entries(TENANT_PLAN_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {tenant.isActive ? (
                      <Badge variant="light" color="success">
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="light" color="dark">
                        Inactivo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onToggleActive(tenant)}
                    >
                      {tenant.isActive ? "Desactivar" : "Activar"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};