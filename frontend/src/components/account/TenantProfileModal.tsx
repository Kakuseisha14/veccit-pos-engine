"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useAuth } from "@/context/AuthContext";
import { updateTenantProfile } from "@/lib/account";

interface TenantProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TenantProfileModal: React.FC<TenantProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, tenant, refreshSession } = useAuth();

  const [name, setName] = useState(() => tenant?.name ?? "");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId) return;
    setError(null);
    setSubmitting(true);
    try {
      await updateTenantProfile({
        name: name.trim(),
        businessName: businessName.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      await refreshSession();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el comercio");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md p-6">
      <div className="mb-5">
        <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
          Mi comercio
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Actualiza los datos de tu negocio.
        </p>
      </div>

      {error && <Alert variant="error" title="Error" message={error} />}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <Label>Nombre del comercio</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mi Tienda C.A."
            required
          />
        </div>
        <div>
          <Label>Razon social</Label>
          <Input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Mi Tienda C.A."
          />
        </div>
        <div>
          <Label>Telefono</Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+584121234567"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <Button variant="outline" onClick={handleClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};