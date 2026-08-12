"use client";

import React, { useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import {
  CREATABLE_ROLES,
  USER_ROLE_LABELS,
  CreateUserPayload,
  UpdateUserPayload,
  User,
} from "@/lib/users";
import type { Role } from "@/lib/roles";
import { UserAvatar } from "./UserAvatar";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  submitting: boolean;
  avatarUploading: boolean;
  error: string | null;
  onSubmit: (payload: CreateUserPayload | UpdateUserPayload) => void;
  onUploadAvatar: (file: File) => void;
}

const inputClasses =
  "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  user,
  submitting,
  avatarUploading,
  error,
  onSubmit,
  onUploadAvatar,
}) => {
  const isEdit = user !== null;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(() => user?.name ?? "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(() => user?.role ?? "CASHIER");
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      const payload: UpdateUserPayload = { role: role as UpdateUserPayload["role"] };
      if (name.trim() !== user?.name) payload.name = name.trim();
      onSubmit(payload);
    } else {
      onSubmit({
        name: name.trim(),
        email: email.trim(),
        password,
        role: role as CreateUserPayload["role"],
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) {
      setAvatarError("El avatar debe ser PNG, JPG o WEBP");
      return;
    }
    if (file.size > 7 * 1024 * 1024) {
      setAvatarError("El avatar no puede superar los 7MB");
      return;
    }
    setAvatarError(null);
    onUploadAvatar(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6">
      <div className="mb-5">
        <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
          {isEdit ? "Editar usuario" : "Nuevo usuario"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isEdit
            ? "Puedes cambiar el nombre, el rol y el avatar del usuario."
            : "Los cajeros solo pueden operar el POS; los administradores gestionan el negocio."}
        </p>
      </div>

      {error && <Alert variant="error" title="Error" message={error} />}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <Label>Nombre</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre y apellido"
            required
          />
        </div>

        {!isEdit && (
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@tucomercio.com"
              required
            />
          </div>
        )}

        {!isEdit && (
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
        )}

        <div>
          <Label>Rol</Label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className={inputClasses}
          >
            {CREATABLE_ROLES.map((r) => (
              <option key={r} value={r}>
                {USER_ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>

        {isEdit && (
          <div>
            <Label>Avatar</Label>
            <div className="flex items-center gap-4">
              <UserAvatar
                name={user?.name ?? ""}
                avatarUrl={user?.avatarUrl ?? null}
                className="h-14 w-14"
              />
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={avatarUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarUploading
                    ? "Subiendo..."
                    : user?.avatarUrl
                    ? "Cambiar avatar"
                    : "Subir avatar"}
                </Button>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG o WEBP (maximo 7MB).
                </p>
              </div>
            </div>
            {avatarError && (
              <p className="mt-2 text-theme-xs text-red-500">{avatarError}</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-1">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Guardando..."
              : isEdit
              ? "Guardar cambios"
              : "Crear usuario"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};