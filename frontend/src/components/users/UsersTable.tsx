"use client";

import React from "react";
import {
  User,
  USER_ROLE_LABELS,
} from "@/lib/users";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { UserAvatar } from "./UserAvatar";

interface UsersTableProps {
  users: User[];
  currentUserId: string | null;
  onAddUser: () => void;
  onEditUser: (user: User) => void;
  onToggleActive: (user: User) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  currentUserId,
  onAddUser,
  onEditUser,
  onToggleActive,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Usuarios
        </h3>
        <Button size="sm" onClick={onAddUser}>
          Nuevo usuario
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader className="bg-gray-50 text-left text-theme-xs text-gray-500 dark:bg-gray-800/40 dark:text-gray-400">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium">
                Usuario
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium">
                Rol
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
            {users.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  Aun no hay usuarios. Crea el primero con el boton &quot;Nuevo
                  usuario&quot;.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isSelf = user.id === currentUserId;
                return (
                  <TableRow key={user.id}>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={user.name}
                          avatarUrl={user.avatarUrl}
                          className="h-10 w-10"
                        />
                        <div>
                          <p className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-white/90">
                            {user.name}
                            {isSelf && (
                              <span className="rounded bg-brand-50 px-1.5 py-0.5 text-theme-xs font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                                Tu
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge
                        variant="light"
                        color={user.role === "TENANT_ADMIN" ? "primary" : "warning"}
                      >
                        {USER_ROLE_LABELS[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      {user.isActive ? (
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
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditUser(user)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isSelf && user.isActive}
                          onClick={() => onToggleActive(user)}
                        >
                          {user.isActive ? "Desactivar" : "Activar"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
