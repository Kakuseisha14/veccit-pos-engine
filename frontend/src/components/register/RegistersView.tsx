"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatUSD } from "@/lib/inventory";
import {
  closeCashRegister,
  getShiftSummary,
  listCashRegisters,
  openCashRegister,
  type CashRegister,
  type ShiftSummary,
} from "@/lib/registers";
import { PAYMENT_METHOD_LABELS as SALE_PAYMENT_LABELS } from "@/lib/sales";

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const RegistersView: React.FC = () => {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();

  const [shifts, setShifts] = useState<CashRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOpen, setShowOpen] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [selectedShift, setSelectedShift] = useState<CashRegister | null>(null);
  const [summary, setSummary] = useState<ShiftSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      try {
        const { shifts: fetched } = await listCashRegisters();
        if (cancelled) return;
        setShifts(fetched);
      } catch (err) {
        if (cancelled) return;
        showError(
          "Error de caja",
          err instanceof Error ? err.message : "Error al cargar los turnos",
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

  const openShift = shifts.find((shift) => shift.status === "OPEN") ?? null;

  const handleOpened = async (amount: number) => {
    try {
      const { shift } = await openCashRegister(amount);
      showSuccess("Caja abierta", `Turno iniciado con ${formatUSD(amount)}`);
      setShowOpen(false);
      setShifts((prev) => [shift, ...prev]);
    } catch (err) {
      showError(
        "No se pudo abrir",
        err instanceof Error ? err.message : "Error al abrir la caja",
      );
    }
  };

  const handleClosed = async (
    closingAmountUSD: number,
    notes?: string,
  ) => {
    if (!openShift) return;
    try {
      const { shift } = await closeCashRegister(openShift.id, {
        closingAmountUSD,
        notes,
      });
      showSuccess("Caja cerrada", "Arqueo registrado correctamente");
      setShowClose(false);
      setShifts((prev) =>
        prev.map((item) => (item.id === shift.id ? shift : item)),
      );
    } catch (err) {
      showError(
        "No se pudo cerrar",
        err instanceof Error ? err.message : "Error al cerrar la caja",
      );
    }
  };

  const openSummary = async (shift: CashRegister) => {
    setSelectedShift(shift);
    setSummary(null);
    setSummaryLoading(true);
    try {
      const result = await getShiftSummary(shift.id);
      setSummary(result);
    } catch (err) {
      showError(
        "Error de resumen",
        err instanceof Error ? err.message : "Error al cargar el resumen",
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
        Cargando caja...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Caja del turno
          </h3>
          {openShift ? (
            <Button size="sm" variant="outline" onClick={() => setShowClose(true)}>
              Cerrar caja
            </Button>
          ) : (
            <Button size="sm" onClick={() => setShowOpen(true)}>
              Abrir caja
            </Button>
          )}
        </div>

        {openShift ? (
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <InfoBox
              label="Apertura"
              value={formatUSD(openShift.openingAmountUSD)}
              sub={`Iniciado ${formatDate(openShift.openedAt)}`}
            />
            <InfoBox label="Estado" value="Abierta" badge="success" />
            <InfoBox
              label="Cajero"
              value={openShift.cashierId.slice(0, 8)}
              sub={user?.email}
            />
          </div>
        ) : (
          <div className="p-5 text-sm text-gray-500 dark:text-gray-400">
            No hay turno abierto. Apertura la caja para comenzar a registrar
            ventas en el turno.
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Turnos de caja
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-gray-50 text-left text-theme-xs text-gray-500 dark:bg-gray-800/40 dark:text-gray-400">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium">
                  Apertura
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium">
                  Cierre
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium">
                  Apertura (USD)
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium">
                  Efectivo esperado
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium">
                  Contado
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium">
                  Diferencia
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium">
                  Estado
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-right font-medium">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {shifts.length === 0 ? (
                <TableRow>
                  <TableCell className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Aun no hay turnos registrados.
                  </TableCell>
                </TableRow>
              ) : (
                shifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {formatDate(shift.openedAt)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {shift.closedAt ? formatDate(shift.closedAt) : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                      {formatUSD(shift.openingAmountUSD)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {shift.expectedCashUSD !== null
                        ? formatUSD(shift.expectedCashUSD)
                        : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {shift.closingAmountUSD !== null
                        ? formatUSD(shift.closingAmountUSD)
                        : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {shift.differenceUSD !== null ? (
                        <span
                          className={
                            shift.differenceUSD < 0
                              ? "font-medium text-red-600 dark:text-red-400"
                              : "font-medium text-emerald-600 dark:text-emerald-400"
                          }
                        >
                          {formatUSD(shift.differenceUSD)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      {shift.status === "OPEN" ? (
                        <Badge variant="light" color="info">
                          Abierta
                        </Badge>
                      ) : (
                        <Badge variant="light" color="dark">
                          Cerrada
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void openSummary(shift)}
                        >
                          Resumen
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {showOpen && (
        <OpenShiftModal
          onClose={() => setShowOpen(false)}
          onConfirm={handleOpened}
        />
      )}

      {showClose && openShift && (
        <CloseShiftModal
          onClose={() => setShowClose(false)}
          onConfirm={handleClosed}
        />
      )}

      {selectedShift && (
        <ShiftSummaryModal
          shift={selectedShift}
          summary={summary}
          loading={summaryLoading}
          onClose={() => setSelectedShift(null)}
        />
      )}
    </div>
  );
};

const InfoBox: React.FC<{
  label: string;
  value: string;
  sub?: string;
  badge?: "success";
}> = ({ label, value, sub, badge }) => (
  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-white/[0.03]">
    <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
      {label}
    </p>
    <div className="mt-1 flex items-center gap-2">
      {badge ? (
        <Badge variant="light" color="success">
          {value}
        </Badge>
      ) : (
        <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {value}
        </p>
      )}
    </div>
    {sub && (
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sub}</p>
    )}
  </div>
);

const OpenShiftModal: React.FC<{
  onClose: () => void;
  onConfirm: (openingAmountUSD: number) => Promise<void>;
}> = ({ onClose, onConfirm }) => {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const parsed = parseFloat(amount);

  return (
    <Modal isOpen onClose={onClose} className="max-w-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Abrir caja
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Indica el monto inicial en efectivo del turno (USD).
      </p>
      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Monto inicial (USD)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-500"
        />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          size="sm"
          disabled={Number.isNaN(parsed) || parsed < 0 || submitting}
          onClick={() => {
            if (Number.isNaN(parsed)) return;
            setSubmitting(true);
            void onConfirm(parsed).finally(() => setSubmitting(false));
          }}
        >
          {submitting ? "Abriendo..." : "Abrir caja"}
        </Button>
      </div>
    </Modal>
  );
};

const CloseShiftModal: React.FC<{
  onClose: () => void;
  onConfirm: (closingAmountUSD: number, notes?: string) => Promise<void>;
}> = ({ onClose, onConfirm }) => {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const parsed = parseFloat(amount);

  return (
    <Modal isOpen onClose={onClose} className="max-w-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Cerrar caja
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Registra el efectivo contado al cierre. La diferencia se calcula contra
        el efectivo esperado de las ventas del turno.
      </p>
      <div className="mt-4 space-y-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Efectivo contado (USD)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-500"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Observaciones (opcional)
          </label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={300}
            placeholder="Caja sin novedad"
            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-500"
          />
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          size="sm"
          disabled={Number.isNaN(parsed) || parsed < 0 || submitting}
          onClick={() => {
            if (Number.isNaN(parsed)) return;
            setSubmitting(true);
            void onConfirm(parsed, notes.trim() || undefined).finally(() =>
              setSubmitting(false),
            );
          }}
        >
          {submitting ? "Cerrando..." : "Cerrar caja"}
        </Button>
      </div>
    </Modal>
  );
};

const ShiftSummaryModal: React.FC<{
  shift: CashRegister;
  summary: ShiftSummary | null;
  loading: boolean;
  onClose: () => void;
}> = ({ shift, summary, loading, onClose }) => {
  return (
    <Modal isOpen onClose={onClose} className="max-w-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Resumen del turno
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {formatDate(shift.openedAt)}
        {shift.closedAt ? ` — ${formatDate(shift.closedAt)}` : ""}
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Cargando resumen...
        </p>
      ) : summary ? (
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <SummaryBox label="Ventas" value={String(summary.salesCount)} />
            <SummaryBox
              label="Total ventas"
              value={formatUSD(summary.totalSalesUSD)}
            />
            <SummaryBox
              label="Efectivo esperado"
              value={formatUSD(summary.expectedCashUSD)}
            />
            {summary.voidedSalesCount > 0 && (
              <SummaryBox
                label="Anuladas"
                value={`${summary.voidedSalesCount} (${formatUSD(
                  summary.totalVoidedUSD,
                )})`}
              />
            )}
            <SummaryBox
              label="Diferencia"
              value={
                shift.differenceUSD !== null
                  ? formatUSD(shift.differenceUSD)
                  : "—"
              }
            />
          </div>

          {summary.payments.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                Pagos por metodo
              </p>
              <div className="mt-2 space-y-1">
                {summary.payments.map((payment) => (
                  <div
                    key={payment.paymentMethod}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-600 dark:text-gray-300">
                      {SALE_PAYMENT_LABELS[payment.paymentMethod]} (
                      {payment.count})
                    </span>
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      {formatUSD(payment.totalUSD)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary.sales.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
              <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                Ventas del turno
              </p>
              <div className="mt-2 space-y-1">
                {summary.sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-600 dark:text-gray-300">
                      {sale.saleNumber}
                      {sale.status === "VOIDED" ? " (anulada)" : ""}
                    </span>
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      {formatUSD(sale.totalUSD)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          No se pudo cargar el resumen.
        </p>
      )}

      <div className="mt-5 flex justify-end">
        <Button size="sm" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </Modal>
  );
};

const SummaryBox: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-white/[0.03]">
    <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
      {label}
    </p>
    <p className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">
      {value}
    </p>
  </div>
);
