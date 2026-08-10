"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import {
  Category,
  CreateProductPayload,
  Product,
} from "@/lib/inventory";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
  submitting: boolean;
  error: string | null;
  onSubmit: (payload: CreateProductPayload) => void;
}

const inputClasses =
  "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  product,
  categories,
  submitting,
  error,
  onSubmit,
}) => {
  const isEdit = product !== null;

  const [sku, setSku] = useState(() => product?.sku ?? "");
  const [name, setName] = useState(() => product?.name ?? "");
  const [description, setDescription] = useState(
    () => product?.description ?? "",
  );
  const [priceUSD, setPriceUSD] = useState(() =>
    product ? String(product.priceUSD) : "",
  );
  const [costUSD, setCostUSD] = useState(() =>
    product ? String(product.costUSD) : "",
  );
  const [stock, setStock] = useState(() =>
    product ? String(product.stock) : "0",
  );
  const [minStock, setMinStock] = useState(() =>
    product ? String(product.minStock) : "0",
  );
  const [categoryId, setCategoryId] = useState(
    () => product?.categoryId ?? "",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(priceUSD);
    if (!Number.isFinite(price) || price < 0) {
      return;
    }
    const payload: CreateProductPayload = {
      sku: sku.trim(),
      name: name.trim(),
      priceUSD: price,
      minStock: parseInt(minStock || "0", 10),
      categoryId: categoryId || undefined,
    };
    if (description.trim()) payload.description = description.trim();
    if (isEdit) {
      if (costUSD !== "") {
        const cost = parseFloat(costUSD);
        if (Number.isFinite(cost) && cost >= 0) payload.costUSD = cost;
      }
    } else {
      if (costUSD !== "") {
        const cost = parseFloat(costUSD);
        if (Number.isFinite(cost) && cost >= 0) payload.costUSD = cost;
      }
      const initialStock = parseInt(stock || "0", 10);
      if (Number.isFinite(initialStock) && initialStock >= 0) {
        payload.stock = initialStock;
      }
    }
    onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg p-6"
    >
      <div className="mb-5">
        <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
          {isEdit ? "Editar producto" : "Nuevo producto"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Los precios se registran en USD. El equivalente en VES se calcula con
          la tasa del dia.
        </p>
      </div>

      {error && <Alert variant="error" title="Error" message={error} />}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>SKU</Label>
            <Input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Ej: BEB-001"
              required
            />
          </div>
          <div>
            <Label>Nombre</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Coca-Cola 1.5L"
              required
            />
          </div>
        </div>

        <div>
          <Label>Descripcion (opcional)</Label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Detalles del producto"
            className={inputClasses}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Precio USD</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={priceUSD}
              onChange={(e) => setPriceUSD(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <Label>Costo USD (opcional)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={costUSD}
              onChange={(e) => setCostUSD(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {!isEdit && (
            <div>
              <Label>Stock inicial</Label>
              <Input
                type="number"
                step="1"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
              />
            </div>
          )}
          <div>
            <Label>Stock minimo</Label>
            <Input
              type="number"
              step="1"
              min="0"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <Label>Categoria</Label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClasses}
          >
            <option value="">Sin categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Guardando..."
              : isEdit
              ? "Guardar cambios"
              : "Crear producto"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
