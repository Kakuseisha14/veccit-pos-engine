import { apiFetch } from "./api";

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  priceUSD: number;
  costUSD: number;
  stock: number;
  minStock: number;
  categoryId: string | null;
  categoryName: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  sku: string;
  name: string;
  description?: string;
  priceUSD: number;
  costUSD?: number;
  stock?: number;
  minStock?: number;
  categoryId?: string;
}

export interface UpdateProductPayload {
  sku?: string;
  name?: string;
  description?: string | null;
  priceUSD?: number;
  costUSD?: number;
  minStock?: number;
  categoryId?: string | null;
  isActive?: boolean;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  quantity: number;
  reason: string;
  performedById: string;
  createdAt: string;
}

export function listCategories(): Promise<{ categories: Category[] }> {
  return apiFetch<{ categories: Category[] }>("/categories");
}

export function createCategory(name: string): Promise<{ category: Category }> {
  return apiFetch<{ category: Category }>("/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function listProducts(): Promise<{ products: Product[] }> {
  return apiFetch<{ products: Product[] }>("/products");
}

export function listLowStock(): Promise<{
  count: number;
  products: Product[];
}> {
  return apiFetch<{ count: number; products: Product[] }>(
    "/products/low-stock",
  );
}

export function createProduct(
  payload: CreateProductPayload,
): Promise<{ product: Product }> {
  return apiFetch<{ product: Product }>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProduct(
  id: string,
  payload: UpdateProductPayload,
): Promise<{ product: Product }> {
  return apiFetch<{ product: Product }>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function adjustStock(
  id: string,
  quantity: number,
  reason: string,
): Promise<{ product: Product; adjustment: StockAdjustment }> {
  return apiFetch<{ product: Product; adjustment: StockAdjustment }>(
    `/products/${id}/adjust-stock`,
    {
      method: "POST",
      body: JSON.stringify({ quantity, reason }),
    },
  );
}

export function formatUSD(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function formatVES(value: number): string {
  return value.toLocaleString("es-VE", {
    style: "currency",
    currency: "VES",
    maximumFractionDigits: 2,
  });
}
