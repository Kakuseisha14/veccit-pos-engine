"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import {
  TENANT_PLAN_LABELS,
  TENANT_PLANS,
  type CreateTenantPayload,
  type TenantPlan,
} from "@/lib/tenants";

interface TenantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  submitting: boolean;
  error: string | null;
  onSubmit: (payload: CreateTenantPayload) => void;
}

const inputClasses =
  "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export const TenantFormModal: React.FC<TenantFormModalProps> = ({
  isOpen,
  onClose,
  submitting,
  error,
  onSubmit,
}) => {
  const [tenantName, setTenantName] = useState("");
  const [tenantAdminName, setTenantAdminName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState<TenantPlan>("FREE");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateTenantPayload = {
      tenantName: tenantName.trim(),
      tenantAdminName: tenantAdminName.trim(),
      email: email.trim(),
      password,
      plan,
    };
    if (businessName.trim()) payload.businessName = businessName.trim();
    if (phone.trim()) payload.phone = phone.trim();
    onSubmit(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl p-6">
      <div className="mb-5">
        <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
          Nuevo comercio
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Crea el comercio y su administrador. Se le enviara acceso de
          administrador con el plan indicado.
        </p>
      </div>

      {error && <Alert variant="error" title="Error" message={error} />}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-1 gap-5.5 sm:grid-cols-2">
          <div>
            <Label>Nombre del comercio</Label>
            <Input
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              placeholder="Mi Tienda C.A."
              required
            />
          </div>

          <div>
            <Label>Razon social (opcional)</Label>
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Mi Tienda C.A."
            />
          </div>

          <div>
            <Label>Administrador</Label>
            <Input
              value={tenantAdminName}
              onChange={(e) => setTenantAdminName(e.target.value)}
              placeholder="Nombre y apellido"
              required
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mi-tienda.com"
              required
            />
          </div>

          <div>
            <Label>Telefono (opcional)</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+584121234567"
            />
          </div>

          <div>
            <Label>Contrasena</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 8 caracteres"
              required
            />
          </div>
        </div>

        <div>
          <Label>Plan</Label>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value as TenantPlan)}
            className={inputClasses}
          >
            {TENANT_PLANS.map((p) => (
              <option key={p} value={p}>
                {TENANT_PLAN_LABELS[p]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-4 pt-1">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creando..." : "Crear comercio"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};