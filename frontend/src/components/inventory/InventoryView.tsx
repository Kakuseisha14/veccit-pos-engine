"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Alert from "@/components/ui/alert/Alert";
import { ProductsTable } from "./ProductsTable";
import { CategoriesTable } from "./CategoriesTable";
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
  updateCategory,
  updateProduct,
  type Category,
  type CreateProductPayload,
  type Product,
} from "@/lib/inventory";

type InventoryTab = "products" | "categories";

const getTabClass = (active: boolean) =>
  active
    ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
    : "text-gray-500 dark:text-gray-400";

export const InventoryView: React.FC = () => {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const isAdmin = user?.role === "TENANT_ADMIN";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<InventoryTab>("products");

  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] =
    useState<Product | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
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
        showError(
          "Error de inventario",
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
  }, [user, showError]);

  const refresh = useCallback(async () => {
    setLoading(true);
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
      showError(
        "Error de inventario",
        err instanceof Error ? err.message : "Error al cargar el inventario",
      );
    } finally {
      setLoading(false);
    }
  }, [user, showError]);

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
      setEditingCategory(null);
      await refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al crear la categoria";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCategory = async (name: string) => {
    if (!editingCategory) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await updateCategory(editingCategory.id, { name });
      showSuccess("Categoria actualizada", name);
      setCategoryOpen(false);
      setEditingCategory(null);
      await refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al actualizar categoria";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleCategory = async (category: Category) => {
    if (!isAdmin) return;
    setSubmitting(true);
    try {
      await updateCategory(category.id, { isActive: !category.isActive });
      showSuccess(
        category.isActive ? "Categoria inactivada" : "Categoria activada",
        `"${category.name}" ${category.isActive ? "ya no" : "volvera a"} estar disponible`,
      );
      await refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al cambiar el estado";
      showError("Error de categoria", msg);
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

  const openCreateCategory = () => {
    setEditingCategory(null);
    setFormError(null);
    setModalNonce((n) => n + 1);
    setCategoryOpen(true);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormError(null);
    setModalNonce((n) => n + 1);
    setCategoryOpen(true);
  };

  const closeCategoryModal = () => {
    setCategoryOpen(false);
    setEditingCategory(null);
  };

  if (loading && products.length === 0 && categories.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
        Cargando inventario...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900 sm:w-auto">
        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getTabClass(
            activeTab === "products",
          )}`}
        >
          Productos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getTabClass(
            activeTab === "categories",
          )}`}
        >
          Categorias
        </button>
      </div>

      {activeTab === "products" && (
        <div className="space-y-4">
          {isAdmin && lowStockCount > 0 && (
            <Alert
              variant="warning"
              title={`${lowStockCount} producto(s) con stock bajo`}
              message="Revisa la columna de stock y realiza un ajuste para reponer inventario."
            />
          )}

          <ProductsTable
            products={products}
            isAdmin={isAdmin}
            onAddProduct={openCreateProduct}
            onEditProduct={openEditProduct}
            onAdjustStock={openAdjustStock}
            onAddCategory={openCreateCategory}
          />
        </div>
      )}

      {activeTab === "categories" && (
        <CategoriesTable
          categories={categories}
          isAdmin={isAdmin}
          onAddCategory={openCreateCategory}
          onEdit={openEditCategory}
          onToggleActive={handleToggleCategory}
        />
      )}

      <ProductFormModal
        key={`product-${modalNonce}`}
        isOpen={productFormOpen}
        onClose={() => setProductFormOpen(false)}
        product={editingProduct}
        categories={categories.filter((category) => category.isActive)}
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
        onClose={closeCategoryModal}
        submitting={submitting}
        error={formError}
        initialName={editingCategory?.name}
        isEditing={editingCategory !== null}
        onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
      />
    </div>
  );
};
