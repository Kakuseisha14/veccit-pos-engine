"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

export interface CustomerDraft {
  identification: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  submitting: boolean;
  error: string | null;
  onSubmit: (data: CustomerDraft) => void;
}

const inputClasses =
  "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  submitting,
  error,
  onSubmit,
}) => {
  const [identification, setIdentification] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      identification: identification.trim(),
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <div className="mb-5">
        <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
          Cliente rapido
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Registra un cliente en segundos (RIF o cedula).
        </p>
      </div>

      {error && <Alert variant="error" title="Error" message={error} />}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <Label>Identificacion (RIF / Cedula)</Label>
          <Input
            value={identification}
            onChange={(e) => setIdentification(e.target.value)}
            placeholder="Ej: V-12345678"
            required
          />
        </div>

        <div>
          <Label>Nombre</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre y apellido"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Telefono</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0414..."
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@mail.com"
            />
          </div>
        </div>

        <div>
          <Label>Direccion (opcional)</Label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Direccion"
            className={inputClasses}
            maxLength={300}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar cliente"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
