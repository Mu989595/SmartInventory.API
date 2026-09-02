import { apiFetch } from './client';
import type { DecrementStockRequest, Product } from '../types';

export type ProductInput = Omit<
  Product,
  'id' | 'rowVersion' | 'createdAt' | 'updatedAt'
>;

export async function getProducts(): Promise<Product[]> {
  return apiFetch<Product[]>('/api/products');
}

export async function getProduct(id: number): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}`);
}

export async function createProduct(product: ProductInput): Promise<Product> {
  return apiFetch<Product>('/api/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

export async function updateProduct(product: Product): Promise<void> {
  await apiFetch<void>(`/api/products/${product.id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
}

export async function deleteProduct(id: number): Promise<void> {
  await apiFetch<void>(`/api/products/${id}`, {
    method: 'DELETE',
  });
}

export async function decrementStock(
  id: number,
  request: DecrementStockRequest,
): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}/decrement-stock`, {
    method: 'PATCH',
    body: JSON.stringify(request),
  });
}
