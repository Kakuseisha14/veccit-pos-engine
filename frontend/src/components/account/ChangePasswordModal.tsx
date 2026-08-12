"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { changePassword } from "@/lib/account";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Las contrasenas no coinciden");
      return;
    }
    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar la contrasena");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md p-6">
      <div className="mb-5">
        <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
          Cambiar contrasena
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ingresa tu contrasena actual y una nueva de al menos 8 caracteres.
        </p>
      </div>

      {error && <Alert variant="error" title="Error" message={error} />}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <Label>Contrasena actual</Label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Contrasena actual"
            required
          />
        </div>
        <div>
          <Label>Nueva contrasena</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimo 8 caracteres"
            required
          />
        </div>
        <div>
          <Label>Confirmar nueva contrasena</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite la nueva contrasena"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <Button variant="outline" onClick={handleClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Guardando..." : "Cambiar contrasena"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};