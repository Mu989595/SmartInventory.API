import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import * as productsApi from '../api/products';
import type { ProductInput } from '../api/products';
import { useAuth } from '../auth/AuthContext';
import type { Product } from '../types';

const emptyForm: ProductInput = {
  name: '',
  sku: '',
  categoryId: 1,
  quantity: 0,
  minQuantity: 10,
  unitPrice: 0,
};

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const productId = Number(id);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [form, setForm] = useState<ProductInput>(emptyForm);
  const [rowVersion, setRowVersion] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;

    async function load() {
      try {
        const product = await productsApi.getProduct(productId);
        setForm({
          name: product.name,
          sku: product.sku,
          categoryId: product.categoryId,
          quantity: product.quantity,
          minQuantity: product.minQuantity,
          unitPrice: product.unitPrice,
        });
        setRowVersion(product.rowVersion);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [isEdit, productId]);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  function updateField<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (isEdit) {
        const product: Product = {
          id: productId,
          ...form,
          rowVersion,
          createdAt: '',
          updatedAt: '',
        };
        await productsApi.updateProduct(product);
        navigate(`/products/${productId}`);
      } else {
        const created = await productsApi.createProduct(form);
        navigate(`/products/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="page-status">Loading…</p>;
  }

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <div>
          <Link to={isEdit ? `/products/${productId}` : '/'} className="back-link">
            ← Back
          </Link>
          <h1>{isEdit ? 'Edit product' : 'New product'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card form-card">
        <label>
          Name
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
          />
        </label>

        <label>
          SKU
          <input
            type="text"
            value={form.sku}
            onChange={(e) => updateField('sku', e.target.value)}
            required
          />
        </label>

        <label>
          Category ID
          <input
            type="number"
            min={1}
            value={form.categoryId}
            onChange={(e) => updateField('categoryId', Number(e.target.value))}
            required
          />
          <span className="field-hint">No categories API yet — enter a numeric category ID.</span>
        </label>

        <div className="form-row">
          <label>
            Quantity
            <input
              type="number"
              min={0}
              value={form.quantity}
              onChange={(e) => updateField('quantity', Number(e.target.value))}
              required
            />
          </label>
          <label>
            Min quantity
            <input
              type="number"
              min={0}
              value={form.minQuantity}
              onChange={(e) => updateField('minQuantity', Number(e.target.value))}
              required
            />
          </label>
          <label>
            Unit price
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.unitPrice}
              onChange={(e) => updateField('unitPrice', Number(e.target.value))}
              required
            />
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </form>
    </div>
  );
}
