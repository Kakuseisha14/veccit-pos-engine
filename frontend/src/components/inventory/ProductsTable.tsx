"use client";

import React from "react";
import { Product, formatUSD, formatVES } from "@/lib/inventory";
import { useRate } from "@/context/RateContext";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";

interface ProductsTableProps {
  products: Product[];
  isAdmin: boolean;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
  onAddCategory: () => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  isAdmin,
  onAddProduct,
  onEditProduct,
  onAdjustStock,
  onAddCategory,
}) => {
  const { rate } = useRate();
  const rateVES = rate?.rateVES ?? null;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Productos
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <>
              <Button size="sm" variant="outline" onClick={onAddCategory}>
                Nueva categoria
              </Button>
              <Button size="sm" onClick={onAddProduct}>
                Agregar producto
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50 text-left text-theme-xs text-gray-500 dark:bg-gray-800/40 dark:text-gray-400">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium">
                Producto
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium">
                Categoria
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium">
                Precio USD
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium">
                Precio VES
              </TableCell>
              {isAdmin && (
                <TableCell isHeader className="px-5 py-3 font-medium">
                  Costo USD
                </TableCell>
              )}
              <TableCell isHeader className="px-5 py-3 font-medium">
                Stock
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium">
                Estado
              </TableCell>
              {isAdmin && (
                <TableCell isHeader className="px-5 py-3 font-medium">
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  Aun no hay productos. Crea el primero con el boton &quot;Agregar
                  producto&quot;.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const lowStock = product.stock <= product.minStock;
                return (
                  <TableRow key={product.id}>
                    <TableCell className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {product.sku}
                      </p>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {product.categoryName ?? "Sin categoria"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {formatUSD(product.priceUSD)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {rateVES !== null
                        ? formatVES(product.priceUSD * rateVES)
                        : "Sin tasa"}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {formatUSD(product.costUSD)}
                      </TableCell>
                    )}
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {lowStock ? (
                          <Badge variant="light" color="error">
                            Stock bajo
                          </Badge>
                        ) : (
                          <Badge variant="light" color="success">
                            En stock
                          </Badge>
                        )}
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {product.stock}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      {product.isActive ? (
                        <Badge variant="light" color="success">
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="light" color="dark">
                          Inactivo
                        </Badge>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAdjustStock(product)}
                          >
                            Ajustar stock
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditProduct(product)}
                          >
                            Editar
                          </Button>
                        </div>
                      </TableCell>
                    )}
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
