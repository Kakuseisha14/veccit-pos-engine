"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRate } from "@/context/RateContext";
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
import { formatUSD, formatVES } from "@/lib/inventory";
import {
  listSales,
  PAYMENT_METHOD_LABELS,
  voidSale,
  type Sale,
} from "@/lib/sales";

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const SalesHistoryView: React.FC = () => {
  const { user } = useAuth();
  const { rate } = useRate();
  const { showError, showSuccess } = useToast();
  const rateVES = rate?.rateVES ?? null;
  const isAdmin = user?.role === "TENANT_ADMIN";

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Sale | null>(null);
  const [voiding, setVoiding] = useState<Sale | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      try {
        const { sales: fetched } = await listSales();
        if (cancelled) return;
        setSales(fetched);
      } catch (err) {
        if (cancelled) return;
        showError(
          "Error de ventas",
          err instanceof Error ? err.message : "Error al cargar el historial",
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

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
        Cargando historial de ventas...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Ventas registradas
        </h3>
        {rateVES !== null && (
          <Badge variant="light" color="info">
            Tasa: Bs {rateVES.toFixed(2)}
          </Badge>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader className="bg-gray-50 text-left text-theme-xs text-gray-500 dark:bg-gray-800/40 dark:text-gray-400">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium">
                Factura
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium">
                Fecha
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium">
                Cliente
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium">
                Articulos
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium">
                Total USD
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium">
                Total VES
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
            {sales.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  Aun no hay ventas registradas. Usa el modulo de POS para cobrar.
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {sale.saleNumber}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {sale.id.slice(0, 8)}
                    </p>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {formatDate(sale.createdAt)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {sale.customerId ? sale.customerId.slice(0, 8) : "Mostrador"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {sale.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                    {formatUSD(sale.totalUSD)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {formatVES(sale.totalVES)}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {sale.status === "COMPLETED" ? (
                      <Badge variant="light" color="success">
                        Completada
                      </Badge>
                    ) : (
                      <Badge variant="light" color="dark">
                        Anulada
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelected(sale)}
                      >
                        Ver recibo
                      </Button>
                      {isAdmin && sale.status === "COMPLETED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                          onClick={() => setVoiding(sale)}
                        >
                          Anular
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ReceiptModal
        sale={selected}
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
      />

      {voiding && (
        <VoidSaleModal
          sale={voiding}
          onClose={() => setVoiding(null)}
          onVoided={(voided) => {
            setSales((prev) =>
              prev.map((item) => (item.id === voided.id ? voided : item)),
            );
            showSuccess(
              "Venta anulada",
              `La venta ${voided.saleNumber} fue anulada`,
            );
            setVoiding(null);
          }}
          onError={(message) => showError("No se pudo anular", message)}
        />
      )}
    </div>
  );
};

const ReceiptModal: React.FC<{
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ sale, isOpen, onClose }) => {
  if (!sale) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <div className="mb-4 text-center">
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          Recibo {sale.saleNumber}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(sale.createdAt)}
        </p>
      </div>

      <div className="space-y-1 border-t border-dashed border-gray-300 pt-3 dark:border-gray-700">
        {sale.items.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between text-sm"
          >
            <div>
              <p className="font-medium text-gray-800 dark:text-white/90">
                {item.productName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {item.quantity} x {formatUSD(item.unitPriceUSD)}
              </p>
            </div>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {formatUSD(item.subtotalUSD)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-1 border-t border-dashed border-gray-300 pt-3 text-sm dark:border-gray-700">
        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Subtotal</span>
          <span>{formatUSD(sale.subtotalUSD)}</span>
        </div>
        {sale.taxUSD > 0 && (
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Impuesto</span>
            <span>{formatUSD(sale.taxUSD)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white">
          <span>Total</span>
          <span>{formatUSD(sale.totalUSD)}</span>
        </div>
      </div>

      <div className="mt-3 space-y-1 border-t border-dashed border-gray-300 pt-3 text-sm dark:border-gray-700">
        <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
          Pagos
        </p>
        {sale.payments.map((payment) => (
          <div key={payment.id} className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              {PAYMENT_METHOD_LABELS[payment.paymentMethod]}{" "}
              {payment.currency === "VES"
                ? `(${formatVES(payment.amount)})`
                : ""}
            </span>
            <span className="font-medium text-gray-800 dark:text-white/90">
              {payment.currency === "VES"
                ? formatVES(payment.amount)
                : formatUSD(payment.amount)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <Button onClick={onClose}>Cerrar</Button>
      </div>
    </Modal>
  );
};

const VoidSaleModal: React.FC<{
  sale: Sale;
  onClose: () => void;
  onVoided: (sale: Sale) => void;
  onError: (message: string) => void;
}> = ({ sale, onClose, onVoided, onError }) => {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <Modal isOpen onClose={onClose} className="max-w-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Anular venta {sale.saleNumber}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        La venta por {formatUSD(sale.totalUSD)} sera marcada como anulada y el
        stock de los productos se repondra automaticamente.
      </p>
      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Motivo de la anulacion
        </label>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={300}
          placeholder="Ej: error de caja, cliente se arrepintio"
          className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-500"
        />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          size="sm"
          disabled={submitting}
          className="bg-red-600 text-white shadow-theme-xs hover:bg-red-700 disabled:bg-red-400"
          onClick={() => {
            setSubmitting(true);
            void voidSale(sale.id, reason.trim() || undefined)
              .then(({ sale: voided }) => onVoided(voided))
              .catch((err: unknown) =>
                onError(
                  err instanceof Error ? err.message : "Error al anular la venta",
                ),
              )
              .finally(() => setSubmitting(false));
          }}
        >
          {submitting ? "Anulando..." : "Anular venta"}
        </Button>
      </div>
    </Modal>
  );
};
