"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import { ProductsTable } from "./ProductsTable";
import { ProductFormModal } from "./ProductFormModal";
import { AdjustStockModal } from "./AdjustStockModal";
import { CategoryModal } from "./CategoryModal";
import {
  adjustStock,
  createCategory,
  createProduct,
  listCategories,
  listLowStock,
  listProducts,
  updateProduct,
  type Category,
  type CreateProductPayload,
  type Product,
} from "@/lib/inventory";

export const InventoryView: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess } = useToast();
  const isAdmin = user?.role === "TENANT_ADMIN";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] =
    useState<Product | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [modalNonce, setModalNonce] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      try {
        const [productRes, categoryRes] = await Promise.all([
          listProducts(),
          listCategories(),
        ]);
        if (cancelled) return;
        setProducts(productRes.products);
        setCategories(categoryRes.categories);
        if (user.role === "TENANT_ADMIN") {
          const lowStock = await listLowStock();
          if (cancelled) return;
          setLowStockCount(lowStock.count);
        }
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err instanceof Error ? err.message : "Error al cargar el inventario",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [productRes, categoryRes] = await Promise.all([
        listProducts(),
        listCategories(),
      ]);
      setProducts(productRes.products);
      setCategories(categoryRes.categories);
      if (user?.role === "TENANT_ADMIN") {
        const lowStock = await listLowStock();
        setLowStockCount(lowStock.count);
      }
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Error al cargar el inventario",
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleCreateProduct = async (payload: CreateProductPayload) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await createProduct(payload);
      showSuccess("Producto creado", `"${payload.name}" se agrego al catalogo`);
      setProductFormOpen(false);
      await refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al crear producto";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProduct = async (payload: CreateProductPayload) => {
    if (!editingProduct) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await updateProduct(editingProduct.id, payload);
      showSuccess("Producto actualizado", payload.name);
      setProductFormOpen(false);
      setEditingProduct(null);
      await refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al actualizar producto";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustStock = async (quantity: number, reason: string) => {
    if (!adjustingProduct) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const { product } = await adjustStock(
        adjustingProduct.id,
        quantity,
        reason,
      );
      showSuccess(
        "Stock ajustado",
        `${adjustingProduct.name} ahora tiene ${product.stock} unidades`,
      );
      setAdjustingProduct(null);
      await refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al ajustar stock";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCategory = async (name: string) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await createCategory(name);
      showSuccess("Categoria creada", `"${name}" se agrego al catalogo`);
      setCategoryOpen(false);
      await refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al crear la categoria";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateProduct = () => {
    setEditingProduct(null);
    setFormError(null);
    setModalNonce((n) => n + 1);
    setProductFormOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormError(null);
    setModalNonce((n) => n + 1);
    setProductFormOpen(true);
  };

  const openAdjustStock = (product: Product) => {
    setAdjustingProduct(product);
    setFormError(null);
    setModalNonce((n) => n + 1);
  };

  const openCategory = () => {
    setFormError(null);
    setModalNonce((n) => n + 1);
    setCategoryOpen(true);
  };

  if (loading && products.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
        Cargando inventario...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loadError && (
        <Alert variant="error" title="Error de carga" message={loadError} />
      )}

      {isAdmin && lowStockCount > 0 && (
        <Alert
          variant="warning"
          title={`${lowStockCount} producto(s) con stock bajo`}
          message="Revisa la columna de stock y realiza un ajuste para reponer inventario."
        />
      )}

      {isAdmin && (
        <div className="flex items-center justify-end">
          <Button size="sm" onClick={openCreateProduct}>
            Agregar producto
          </Button>
        </div>
      )}

      <ProductsTable
        products={products}
        isAdmin={isAdmin}
        onAddProduct={openCreateProduct}
        onEditProduct={openEditProduct}
        onAdjustStock={openAdjustStock}
        onAddCategory={openCategory}
      />

      <ProductFormModal
        key={`product-${modalNonce}`}
        isOpen={productFormOpen}
        onClose={() => setProductFormOpen(false)}
        product={editingProduct}
        categories={categories}
        submitting={submitting}
        error={formError}
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
      />

      <AdjustStockModal
        key={`adjust-${modalNonce}`}
        isOpen={adjustingProduct !== null}
        onClose={() => setAdjustingProduct(null)}
        product={adjustingProduct}
        submitting={submitting}
        error={formError}
        onSubmit={handleAdjustStock}
      />

      <CategoryModal
        key={`category-${modalNonce}`}
        isOpen={categoryOpen}
        onClose={() => setCategoryOpen(false)}
        submitting={submitting}
        error={formError}
        onSubmit={handleCreateCategory}
      />
    </div>
  );
};
