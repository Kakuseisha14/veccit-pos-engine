"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  submitting: boolean;
  error: string | null;
  onSubmit: (name: string) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  submitting,
  error,
  onSubmit,
}) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name.trim());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <div className="mb-5">
        <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
          Nueva categoria
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Agrupa tus productos para organizar el catalogo.
        </p>
      </div>

      {error && <Alert variant="error" title="Error" message={error} />}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <Label>Nombre</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Bebidas"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Guardando..." : "Crear categoria"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
