"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRate } from "@/context/RateContext";
import { useToast } from "@/context/ToastContext";
import Alert from "@/components/ui/alert/Alert";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { formatUSD, formatVES, listProducts, type Product } from "@/lib/inventory";
import {
  listCustomers,
  processSale,
  quickRegisterCustomer,
  type Customer,
  type ProcessSalePayload,
} from "@/lib/sales";
import {
  CustomerModal,
  type CustomerDraft,
} from "./CustomerModal";
import { PaymentModal, type PaymentDraft } from "./PaymentModal";
import {
  canConfirmPayment,
  computeTotalCents,
} from "@/lib/payment";

interface CartItem {
  product: Product;
  quantity: number;
}

export const PosView: React.FC = () => {
  const { user } = useAuth();
  const { rate } = useRate();
  const { showError, showSuccess } = useToast();
  const isAdmin = user?.role === "TENANT_ADMIN";
  const rateVES = rate?.rateVES ?? null;

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentDrafts, setPaymentDrafts] = useState<PaymentDraft[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [customerOpen, setCustomerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      try {
        const [productRes, customerRes] = await Promise.all([
          listProducts(),
          listCustomers(),
        ]);
        if (cancelled) return;
        setProducts(productRes.products);
        setCustomers(customerRes.customers);
      } catch (err) {
        if (cancelled) return;
        showError(
          "Error de POS",
          err instanceof Error ? err.message : "Error al cargar el punto de venta",
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

  const refreshProducts = useCallback(async () => {
    try {
      const { products: updated } = await listProducts();
      setProducts(updated);
    } catch (err) {
      showError(
        "Error de inventario",
        err instanceof Error ? err.message : "Error al actualizar inventario",
      );
    }
  }, [showError]);

  const trimmedSearch = search.trim().toLowerCase();
  const filteredProducts = products.filter(
    (product) =>
      product.isActive &&
      (product.sku.toLowerCase().includes(trimmedSearch) ||
        product.name.toLowerCase().includes(trimmedSearch)),
  );

  const subtotalCents = computeTotalCents(
    cart.map((item) => ({
      unitPriceUSD: item.product.priceUSD,
      quantity: item.quantity,
    })),
  );
  const subtotalUSD = subtotalCents / 100;

  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          return current;
        }
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...current, { product, quantity: 1 }];
    });
  };

  const setQuantity = (productId: string, quantity: number) => {
    setCart((current) => {
      const item = current.find((i) => i.product.id === productId);
      if (!item) return current;
      const clamped = Math.max(1, Math.min(quantity, item.product.stock));
      return current.map((i) =>
        i.product.id === productId ? { ...i, quantity: clamped } : i,
      );
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((current) => current.filter((i) => i.product.id !== productId));
  };

  const openPayment = () => {
    setFormError(null);
    setPaymentDrafts([
      { id: crypto.randomUUID(), method: "CASH_USD", amount: "", currency: "USD" },
    ]);
    setPaymentOpen(true);
  };

  const handleRegisterCustomer = async (draft: CustomerDraft) => {
    setSubmitting(true);
    setFormError(null);
    try {
      const { customer } = await quickRegisterCustomer(draft);
      setCustomers((current) => [...current, customer]);
      setSelectedCustomerId(customer.id);
      showSuccess("Cliente registrado", customer.name);
      setCustomerOpen(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Error al registrar el cliente",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcessSale = async () => {
    if (!canConfirmSale()) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const payload: ProcessSalePayload = {
        customerId: selectedCustomerId ?? undefined,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        payments: paymentDrafts.map((payment) => ({
          paymentMethod: payment.method,
          amount: Number.parseFloat(payment.amount),
          currency: payment.currency,
          reference: payment.reference?.trim() || undefined,
        })),
      };
      const { sale } = await processSale(payload);
      showSuccess(
        "Venta registrada",
        `Factura ${sale.saleNumber} por ${formatUSD(sale.totalUSD)}`,
      );
      setPaymentOpen(false);
      setCart([]);
      setSelectedCustomerId(null);
      await refreshProducts();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Error al procesar la venta",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canConfirmSale = (): boolean => {
    return canConfirmPayment(subtotalUSD, paymentDrafts, rateVES);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
        Cargando punto de venta...
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por SKU o nombre del producto..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            autoFocus
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-8 text-center text-sm text-gray-500 dark:bg-gray-800/40 dark:text-gray-400">
            {products.length === 0
              ? "No hay productos activos. Agrega productos en el modulo de inventario."
              : "Ningun producto coincide con la busqueda."}
          </div>
        ) : (
          <div className="grid max-h-[calc(100vh-260px)] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:border-brand-300 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {product.sku}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatUSD(product.priceUSD)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {rateVES !== null
                        ? formatVES(product.priceUSD * rateVES)
                        : "Sin tasa"}
                    </p>
                  </div>
                  {product.stock <= 0 ? (
                    <Badge variant="light" color="error">
                      Agotado
                    </Badge>
                  ) : (
                    <Badge variant="light" color="success">
                      {product.stock} unds
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white/90">
          Carrito
        </h3>

        {cart.length === 0 ? (
          <p className="flex-1 rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500 dark:bg-gray-800/40 dark:text-gray-400">
            El carrito esta vacio. Toca un producto para agregarlo.
          </p>
        ) : (
          <div className="max-h-[320px] flex-1 space-y-2 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 p-2 dark:border-gray-700"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatUSD(item.product.priceUSD)} c/u
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(item.product.id, item.quantity - 1)
                    }
                    className="h-7 w-7 rounded-md border border-gray-300 text-sm text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    -
                  </button>
                  <span className="w-7 text-center text-sm font-medium text-gray-800 dark:text-white/90">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(item.product.id, item.quantity + 1)
                    }
                    className="h-7 w-7 rounded-md border border-gray-300 text-sm text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="ml-1 text-sm text-error hover:text-red-600"
                    aria-label={`Quitar ${item.product.name}`}
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 space-y-1 border-t border-gray-200 pt-3 dark:border-gray-800">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Subtotal</span>
            <span>{formatUSD(subtotalUSD)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Equivalente VES</span>
            <span>
              {rateVES !== null ? formatVES(subtotalUSD * rateVES) : "Sin tasa"}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 text-base font-bold text-gray-900 dark:text-white">
            <span>Total</span>
            <span>{formatUSD(subtotalUSD)}</span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {!rateVES && cart.length > 0 && (
            <Alert
              variant="warning"
              title="Sin tasa activa"
              message="Define la tasa del dia antes de cobrar."
            />
          )}
          <Button
            className="w-full"
            onClick={openPayment}
            disabled={cart.length === 0 || submitting}
          >
            Cobrar ({formatUSD(subtotalUSD)})
          </Button>
          {isAdmin && cart.length > 0 && (
            <Button
              className="w-full"
              variant="outline"
              size="sm"
              onClick={() => setCart([])}
              disabled={submitting}
            >
              Vaciar carrito
            </Button>
          )}
        </div>
      </section>

      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        totalUSD={subtotalUSD}
        rateVES={rateVES}
        submitting={submitting}
        error={formError}
        customers={customers}
        selectedCustomerId={selectedCustomerId}
        onSelectCustomer={setSelectedCustomerId}
        onOpenNewCustomer={() => {
          setFormError(null);
          setCustomerOpen(true);
        }}
        payments={paymentDrafts}
        onChangePayments={setPaymentDrafts}
        onSubmit={() => {
          void handleProcessSale();
        }}
      />

      <CustomerModal
        isOpen={customerOpen}
        onClose={() => setCustomerOpen(false)}
        submitting={submitting}
        error={formError}
        onSubmit={(draft) => {
          void handleRegisterCustomer(draft);
        }}
      />
    </div>
  );
};
