import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api/client';
import * as productsApi from '../api/products';
import { useAuth } from '../auth/AuthContext';
import { LowStockBadge } from '../components/LowStockBadge';
import { StockToast } from '../components/StockToast';
import { useStockHub } from '../hooks/useStockHub';
import type { Product, StockUpdate } from '../types';

export function ProductListPage() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [toastUpdate, setToastUpdate] = useState<StockUpdate | null>(null);

  const loadProducts = useCallback(async () => {
    setError(null);
    try {
      const data = await productsApi.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const handleStockChanged = useCallback((update: StockUpdate) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === update.productId
          ? { ...product, quantity: update.newQuantity, updatedAt: update.updatedAt }
          : product,
      ),
    );
    setHighlightedId(update.productId);
    setToastUpdate(update);
    window.setTimeout(() => setHighlightedId(null), 3000);
  }, []);

  const { connectionState } = useStockHub({
    onStockChanged: handleStockChanged,
  });

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Delete "${name}"?`)) return;

    try {
      await productsApi.deleteProduct(id);
      setProducts((current) => current.filter((product) => product.id !== id));
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Delete failed');
    }
  }

  if (loading) {
    return <p className="page-status">Loading products…</p>;
  }

  if (error) {
    return (
      <div className="page-status page-error">
        <p>{error}</p>
        <button type="button" className="btn btn-primary" onClick={() => void loadProducts()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p className="page-subtitle">
            Live updates via SignalR —{' '}
            <span className={`connection-dot connection-${connectionState}`}>
              {connectionState}
            </span>
          </p>
        </div>
        {isAdmin && (
          <Link to="/products/new" className="btn btn-primary">
            Add product
          </Link>
        )}
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <p>No products yet.</p>
          {isAdmin && <Link to="/products/new">Create the first product</Link>}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Min</th>
                <th>Price</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className={
                    highlightedId === product.id
                      ? 'row-highlight'
                      : product.quantity <= product.minQuantity
                        ? 'row-low-stock'
                        : undefined
                  }
                >
                  <td>
                    <Link to={`/products/${product.id}`} className="table-link">
                      {product.name}
                    </Link>
                  </td>
                  <td>{product.sku}</td>
                  <td>{product.quantity}</td>
                  <td>{product.minQuantity}</td>
                  <td>${product.unitPrice.toFixed(2)}</td>
                  <td>
                    <LowStockBadge
                      quantity={product.quantity}
                      minQuantity={product.minQuantity}
                    />
                  </td>
                  <td className="table-actions">
                    <Link to={`/products/${product.id}`} className="btn btn-ghost btn-sm">
                      View
                    </Link>
                    {isAdmin && (
                      <>
                        <Link
                          to={`/products/${product.id}/edit`}
                          className="btn btn-ghost btn-sm"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => void handleDelete(product.id, product.name)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <StockToast update={toastUpdate} onDismiss={() => setToastUpdate(null)} />
    </div>
  );
}
