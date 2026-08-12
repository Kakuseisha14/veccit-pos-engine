"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";
import {
  createTenant,
  listTenants,
  updateTenant,
  type CreateTenantPayload,
  type Tenant,
  type TenantPlan,
} from "@/lib/tenants";
import { TenantsTable } from "./TenantsTable";
import { TenantFormModal } from "./TenantFormModal";

export const PlatformView: React.FC = () => {
  const { showError, showSuccess } = useToast();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNonce, setModalNonce] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const items = await listTenants();
        if (cancelled) return;
        setTenants(items);
      } catch (err) {
        if (cancelled) return;
        showError(
          "Error de comercios",
          err instanceof Error ? err.message : "Error al cargar los comercios",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [showError]);

  const refresh = useCallback(async () => {
    try {
      const items = await listTenants();
      setTenants(items);
    } catch (err) {
      showError(
        "Error de comercios",
        err instanceof Error ? err.message : "Error al cargar los comercios",
      );
    }
  }, [showError]);

  const openCreate = () => {
    setFormError(null);
    setModalNonce((n) => n + 1);
    setModalOpen(true);
  };

  const handleCreate = async (payload: CreateTenantPayload) => {
    setSubmitting(true);
    setFormError(null);
    try {
      const { tenant } = await createTenant(payload);
      showSuccess(
        "Comercio creado",
        `"${tenant.name}" puede iniciar sesion como administrador`,
      );
      setModalOpen(false);
      await refresh();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Error al crear el comercio",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (target: Tenant) => {
    const next = !target.isActive;
    setSubmitting(true);
    try {
      await updateTenant(target.id, { isActive: next });
      showSuccess(
        next ? "Comercio activado" : "Comercio desactivado",
        `"${target.name}" ${next ? "puede" : "ya no puede"} operar`,
      );
      await refresh();
    } catch (err) {
      showError(
        "Error al cambiar el estado",
        err instanceof Error ? err.message : "Error desconocido",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveTier = async (target: Tenant, plan: TenantPlan) => {
    if (target.plan === plan) return;
    setSubmitting(true);
    try {
      await updateTenant(target.id, { plan });
      showSuccess("Plan actualizado", `"${target.name}" ahora tiene plan ${plan}`);
      await refresh();
    } catch (err) {
      showError(
        "Error al actualizar el plan",
        err instanceof Error ? err.message : "Error desconocido",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && tenants.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
        Cargando comercios...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TenantsTable
        tenants={tenants}
        onAddTenant={openCreate}
        onToggleActive={handleToggleActive}
        onSaveTier={handleSaveTier}
      />

      <TenantFormModal
        key={`tenant-${modalNonce}`}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        submitting={submitting}
        error={formError}
        onSubmit={handleCreate}
      />
    </div>
  );
};