export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  categoryId: number;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  rowVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface DecrementStockRequest {
  quantity: number;
  rowVersion: string;
}

export interface StockUpdate {
  productId: number;
  productName: string;
  newQuantity: number;
  isLowStock: boolean;
  updatedAt: string;
}

export interface ApiError {
  message?: string;
}
