"use client";

import React, { useState } from "react";
import { useRate } from "@/context/RateContext";
import { useAuth } from "@/context/AuthContext";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

export const RateBanner: React.FC = () => {
  const { rate, updateRate } = useRate();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rateVES, setRateVES] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.role === "TENANT_ADMIN";

  const openModal = () => {
    setRateVES(rate ? String(rate.rateVES) : "");
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(rateVES);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Ingresa una tasa valida mayor a 0");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await updateRate(value);
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la tasa");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 dark:border-brand-800/50 dark:bg-brand-950/40">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2.75C10.4812 2.75 9.25 3.98122 9.25 5.5V8H7.5C6.5335 8 5.75 8.7835 5.75 9.75V18.5C5.75 19.4665 6.5335 20.25 7.5 20.25H16.5C17.4665 20.25 18.25 19.4665 18.25 18.5V9.75C18.25 8.7835 17.4665 8 16.5 8H14.75V5.5C14.75 3.98122 13.5188 2.75 12 2.75ZM12 5.25C12.1381 5.25 12.25 5.36193 12.25 5.5V8H11.75V5.5C11.75 5.36193 11.8619 5.25 12 5.25Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Tasa del dia (USD a VES):{" "}
              <span className="font-semibold text-brand-600 dark:text-brand-400">
                {rate ? `${rate.rateVES} Bs` : "Sin definir"}
              </span>
            </p>
            {rate && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Vigente desde {rate.date}
              </p>
            )}
          </div>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={openModal} className="shrink-0">
            Actualizar tasa
          </Button>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-md p-6"
      >
        <div className="mb-5">
          <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
            Actualizar tasa del dia
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Define cuantos Bolivares equivale 1 Dolar (USD).
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tasa VES
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              inputMode="decimal"
              value={rateVES}
              onChange={(e) => setRateVES(e.target.value)}
              placeholder="Ej: 60.50"
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm font-medium text-error-500">
              {error}
            </p>
          )}
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
