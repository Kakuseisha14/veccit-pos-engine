"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  createUser,
  listUsers,
  setUserActive,
  updateUser,
  uploadUserAvatar,
  type CreateUserPayload,
  type UpdateUserPayload,
  type User,
} from "@/lib/users";
import { UsersTable } from "./UsersTable";
import { UserFormModal } from "./UserFormModal";

export const UsersView: React.FC = () => {
  const { user, refreshSession } = useAuth();
  const { showError, showSuccess } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalNonce, setModalNonce] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      try {
        const res = await listUsers();
        if (cancelled) return;
        setUsers(res.users);
      } catch (err) {
        if (cancelled) return;
        showError(
          "Error de usuarios",
          err instanceof Error ? err.message : "Error al cargar los usuarios",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [user, showError]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listUsers();
      setUsers(res.users);
    } catch (err) {
      showError(
        "Error de usuarios",
        err instanceof Error ? err.message : "Error al cargar los usuarios",
      );
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const openCreate = () => {
    setEditingUser(null);
    setFormError(null);
    setModalNonce((n) => n + 1);
    setModalOpen(true);
  };

  const openEdit = (target: User) => {
    setEditingUser(target);
    setFormError(null);
    setModalNonce((n) => n + 1);
    setModalOpen(true);
  };

  const handleCreate = async (payload: CreateUserPayload) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await createUser(payload);
      showSuccess("Usuario creado", `"${payload.name}" puede iniciar sesion`);
      setModalOpen(false);
      await refresh();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Error al crear el usuario",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (payload: UpdateUserPayload) => {
    if (!editingUser) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await updateUser(editingUser.id, payload);
      showSuccess("Usuario actualizado", editingUser.name);
      setModalOpen(false);
      setEditingUser(null);
      await refresh();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Error al actualizar el usuario",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (target: User) => {
    const next = !target.isActive;
    if (!next && target.id === user?.id) {
      showError("No permitido", "No puedes desactivar tu propio usuario");
      return;
    }
    setSubmitting(true);
    try {
      const { user: updated } = await setUserActive(target.id, next);
      showSuccess(
        next ? "Usuario activado" : "Usuario desactivado",
        `"${updated.name}" ${next ? "puede" : "ya no puede"} iniciar sesion`,
      );
      await refresh();
    } catch (err) {
      showError(
        "Error al cambiar el estado",
        err instanceof Error ? err.message : "Error desconocido",
      );
      if (err instanceof Error && err.message.includes("tu propio usuario")) {
        await refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadAvatar = async (file: File) => {
    if (!editingUser) return;
    setAvatarUploading(true);
    setFormError(null);
    try {
      const { user: updated } = await uploadUserAvatar(editingUser.id, file);
      showSuccess("Avatar actualizado", `Avatar de "${updated.name}" guardado`);
      setEditingUser((prev) =>
        prev ? { ...prev, avatarUrl: updated.avatarUrl } : prev,
      );
      await refresh();
      if (updated.id === user?.id) {
        await refreshSession();
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Error al subir el avatar",
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = (
    payload: CreateUserPayload | UpdateUserPayload,
  ) => {
    if (editingUser) {
      void handleUpdate(payload as UpdateUserPayload);
    } else {
      void handleCreate(payload as CreateUserPayload);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
        Cargando usuarios...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <UsersTable
        users={users}
        currentUserId={user?.id ?? null}
        onAddUser={openCreate}
        onEditUser={openEdit}
        onToggleActive={handleToggleActive}
      />

      <UserFormModal
        key={`user-${modalNonce}`}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        user={editingUser}
        submitting={submitting}
        avatarUploading={avatarUploading}
        error={formError}
        onSubmit={handleSubmit}
        onUploadAvatar={handleUploadAvatar}
      />
    </div>
  );
};