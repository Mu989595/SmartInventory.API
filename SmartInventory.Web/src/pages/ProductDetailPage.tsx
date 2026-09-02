import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import * as productsApi from '../api/products';
import { useAuth } from '../auth/AuthContext';
import { LowStockBadge } from '../components/LowStockBadge';
import { useStockHub } from '../hooks/useStockHub';
import type { Product, StockUpdate } from '../types';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decrementQty, setDecrementQty] = useState(1);
  const [decrementLoading, setDecrementLoading] = useState(false);
  const [decrementError, setDecrementError] = useState<string | null>(null);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!productId) return;

    setError(null);
    setLoading(true);
    try {
      const data = await productsApi.getProduct(productId);
      setProduct(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError('Product not found');
      } else {
        setError(err instanceof ApiError ? err.message : 'Failed to load product');
      }
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  const handleStockChanged = useCallback(
    (update: StockUpdate) => {
      if (update.productId !== productId) return;

      void productsApi.getProduct(productId).then((fresh) => {
        setProduct(fresh);
      });
    },
    [productId],
  );

  useStockHub({ onStockChanged: handleStockChanged });

  async function handleDecrement(event: FormEvent) {
    event.preventDefault();
    if (!product) return;

    setDecrementError(null);
    setConflictMessage(null);
    setDecrementLoading(true);

    try {
      const updated = await productsApi.decrementStock(product.id, {
        quantity: decrementQty,
        rowVersion: product.rowVersion,
      });
      setProduct(updated);
      setDecrementQty(1);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setConflictMessage(err.message);
          await loadProduct();
        } else if (err.status === 400) {
          setDecrementError(err.message);
        } else if (err.status === 404) {
          setError('Product not found');
        } else {
          setDecrementError(err.message);
        }
      } else {
        setDecrementError('Failed to decrement stock');
      }
    } finally {
      setDecrementLoading(false);
    }
  }

  if (loading) {
    return <p className="page-status">Loading product…</p>;
  }

  if (error || !product) {
    return (
      <div className="page-status page-error">
        <p>{error ?? 'Product not found'}</p>
        <Link to="/" className="btn btn-primary">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/" className="back-link">
            ← Products
          </Link>
          <h1>{product.name}</h1>
          <p className="page-subtitle">
            SKU {product.sku} · Category #{product.categoryId}
          </p>
        </div>
        <div className="header-actions">
          <LowStockBadge quantity={product.quantity} minQuantity={product.minQuantity} />
          {isAdmin && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate(`/products/${product.id}/edit`)}
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <section className="card">
          <h2>Stock</h2>
          <dl className="detail-list">
            <div>
              <dt>Quantity</dt>
              <dd className="detail-qty">{product.quantity}</dd>
            </div>
            <div>
              <dt>Minimum</dt>
              <dd>{product.minQuantity}</dd>
            </div>
            <div>
              <dt>Unit price</dt>
              <dd>${product.unitPrice.toFixed(2)}</dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>{new Date(product.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
        </section>

        <section className="card">
          <h2>Decrement stock</h2>
          <p className="card-help">
            Withdraw units when stock is sold or used. A fresh row version is fetched
            automatically on conflict.
          </p>

          <form onSubmit={handleDecrement} className="decrement-form">
            <label>
              Quantity to withdraw
              <input
                type="number"
                min={1}
                max={product.quantity}
                value={decrementQty}
                onChange={(e) => setDecrementQty(Number(e.target.value))}
                required
              />
            </label>

            {conflictMessage && (
              <div className="alert alert-warning">
                <strong>Conflict:</strong> {conflictMessage}
                <p>Stock levels above have been refreshed. Review and retry if needed.</p>
              </div>
            )}

            {decrementError && <p className="form-error">{decrementError}</p>}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={decrementLoading || product.quantity === 0}
            >
              {decrementLoading ? 'Processing…' : 'Decrement stock'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
