"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import Label from "@/components/form/Label";
import { formatUSD, formatVES } from "@/lib/inventory";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  type Customer,
  type PaymentCurrency,
  type PaymentMethod,
} from "@/lib/sales";

export interface PaymentDraft {
  id: string;
  method: PaymentMethod;
  amount: string;
  currency: PaymentCurrency;
  reference?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalUSD: number;
  rateVES: number | null;
  submitting: boolean;
  error: string | null;
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelectCustomer: (id: string | null) => void;
  onOpenNewCustomer: () => void;
  payments: PaymentDraft[];
  onChangePayments: (payments: PaymentDraft[]) => void;
  onSubmit: () => void;
}

const toCents = (value: number): number => Math.round(value * 100);

const selectClasses =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const inputClasses = selectClasses;

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  totalUSD,
  rateVES,
  submitting,
  error,
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onOpenNewCustomer,
  payments,
  onChangePayments,
  onSubmit,
}) => {
  const totalCents = toCents(totalUSD);
  const paidCents = payments.reduce((sum, payment) => {
    const amount = Number.parseFloat(payment.amount);
    if (!Number.isFinite(amount) || amount < 0) return sum;
    if (payment.currency === "USD") return sum + toCents(amount);
    if (!rateVES || rateVES <= 0) return sum;
    return sum + toCents(amount / rateVES);
  }, 0);

  const remainingCents = totalCents - paidCents;
  const paidUSD = paidCents / 100;
  const remainingUSD = remainingCents / 100;
  const canSubmit = Math.abs(remainingCents) <= 2;
  const hasVesPayment = payments.some((p) => p.currency === "VES");
  const vesBlocked = hasVesPayment && (!rateVES || rateVES <= 0);

  const addPayment = () => {
    onChangePayments([
      ...payments,
      { id: crypto.randomUUID(), method: "CASH_USD", amount: "", currency: "USD" },
    ]);
  };

  const updatePayment = (id: string, patch: Partial<PaymentDraft>) => {
    onChangePayments(
      payments.map((payment) =>
        payment.id === id ? { ...payment, ...patch } : payment,
      ),
    );
  };

  const removePayment = (id: string) => {
    onChangePayments(payments.filter((payment) => payment.id !== id));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Cobrar venta
        </h3>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Total a cobrar
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatUSD(totalUSD)}
            </p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {rateVES ? formatVES(totalUSD * rateVES) : "Sin tasa activa"}
          </p>
        </div>
      </div>

      {error && <Alert variant="error" title="Error" message={error} />}
      {vesBlocked && (
        <Alert
          variant="warning"
          title="Tasa de cambio requerida"
          message="Configura la tasa del dia para aceptar pagos en bolivares."
        />
      )}

      <div className="mt-4 space-y-3">
        <div>
          <Label>Cliente</Label>
          <div className="flex items-center gap-2">
            <select
              className={selectClasses}
              value={selectedCustomerId ?? ""}
              onChange={(e) =>
                onSelectCustomer(e.target.value === "" ? null : e.target.value)
              }
            >
              <option value="">Cliente de mostrador (sin registro)</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.identification}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={onOpenNewCustomer}
            >
              Nuevo cliente
            </Button>
          </div>
        </div>

        <div>
          <Label>Pagos</Label>
          <div className="space-y-2">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-start gap-2 rounded-lg border border-gray-200 p-2 dark:border-gray-700"
              >
                <div className="w-1/3">
                  <select
                    className={selectClasses}
                    value={payment.method}
                    onChange={(e) =>
                      updatePayment(payment.id, {
                        method: e.target.value as PaymentMethod,
                      })
                    }
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {PAYMENT_METHOD_LABELS[method]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-1/4">
                  <select
                    className={selectClasses}
                    value={payment.currency}
                    onChange={(e) =>
                      updatePayment(payment.id, {
                        currency: e.target.value as PaymentCurrency,
                      })
                    }
                  >
                    <option value="USD">USD</option>
                    <option value="VES">VES</option>
                  </select>
                </div>
                <div className="w-1/4">
                  <input
                    className={inputClasses}
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="Monto"
                    value={payment.amount}
                    onChange={(e) =>
                      updatePayment(payment.id, { amount: e.target.value })
                    }
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => removePayment(payment.id)}
                >
                  X
                </Button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addPayment}
            className="mt-2 text-sm font-medium text-brand-500 hover:text-brand-600"
          >
            + Agregar otro pago
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/40">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Pagado</span>
          <span className="font-semibold text-gray-800 dark:text-white/90">
            {formatUSD(paidUSD)}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {remainingCents > 2 ? "Saldo restante" : "Cambio"}
          </span>
          <span
            className={`font-bold ${
              remainingCents <= 2
                ? "text-success"
                : "text-warning"
            }`}
          >
            {remainingCents > 0 ? formatUSD(remainingUSD) : formatUSD(-remainingUSD)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onClose} type="button">
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={submitting || !canSubmit || vesBlocked}
          onClick={onSubmit}
        >
          {submitting ? "Procesando..." : "Confirmar venta"}
        </Button>
      </div>
    </Modal>
  );
};
