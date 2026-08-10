"use client";

import React from "react";
import type { Category } from "@/lib/inventory";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";

interface CategoriesTableProps {
  categories: Category[];
  isAdmin: boolean;
  onAddCategory: () => void;
  onEdit: (category: Category) => void;
  onToggleActive: (category: Category) => void;
}

export const CategoriesTable: React.FC<CategoriesTableProps> = ({
  categories,
  isAdmin,
  onAddCategory,
  onEdit,
  onToggleActive,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-end gap-2 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        {isAdmin && (
          <Button size="sm" onClick={onAddCategory}>
            Nueva categoria
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader className="bg-gray-50 text-left text-theme-xs text-gray-500 dark:bg-gray-800/40 dark:text-gray-400">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium">
                Nombre
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium">
                Estado
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium">
                Creada
              </TableCell>
              {isAdmin && (
                <TableCell isHeader className="px-5 py-3 font-medium text-right">
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {categories.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  Aun no hay categorias. Crea la primera con el boton
                  &quot;Nueva categoria&quot;.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                    {category.name}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {category.isActive ? (
                      <Badge variant="light" color="success">
                        Activa
                      </Badge>
                    ) : (
                      <Badge variant="light" color="dark">
                        Inactiva
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {new Date(category.createdAt).toLocaleDateString("es-VE")}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(category)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onToggleActive(category)}
                        >
                          {category.isActive ? "Inactivar" : "Activar"}
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
