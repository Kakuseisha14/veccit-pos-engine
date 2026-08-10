"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { Product } from "@/lib/inventory";

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  submitting: boolean;
  error: string | null;
  onSubmit: (quantity: number, reason: string) => void;
}

const inputClasses =
  "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
  isOpen,
  onClose,
  product,
  submitting,
  error,
  onSubmit,
}) => {
  const [type, setType] = useState<"in" | "out">("in");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseInt(quantity, 10);
    if (!Number.isFinite(value) || value <= 0) {
      return;
    }
    const signed = type === "out" ? -value : value;
    onSubmit(signed, reason.trim());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <div className="mb-5">
        <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
          Ajustar stock
        </h3>
        {product && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {product.name} (SKU {product.sku}) - Stock actual: {product.stock}
          </p>
        )}
      </div>

      {error && <Alert variant="error" title="Error" message={error} />}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <Label>Tipo de ajuste</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                name="adjust-type"
                checked={type === "in"}
                onChange={() => setType("in")}
                className="h-4 w-4 accent-brand-500"
              />
              Entrada (+)
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                name="adjust-type"
                checked={type === "out"}
                onChange={() => setType("out")}
                className="h-4 w-4 accent-brand-500"
              />
              Salida (-)
            </label>
          </div>
        </div>

        <div>
          <Label>Cantidad</Label>
          <Input
            type="number"
            step="1"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Ej: 5"
            required
          />
        </div>

        <div>
          <Label>Motivo</Label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: Compra a proveedor, merma, conteo..."
            className={inputClasses}
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Ajustando..." : "Aplicar ajuste"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
