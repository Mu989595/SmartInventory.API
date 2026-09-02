import { useEffect, useState } from 'react';
import type { StockUpdate } from '../types';

interface StockToastProps {
  update: StockUpdate | null;
  onDismiss: () => void;
}

export function StockToast({ update, onDismiss }: StockToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!update) return;

    setVisible(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [update, onDismiss]);

  if (!update || !visible) {
    return null;
  }

  return (
    <div className={`stock-toast ${update.isLowStock ? 'stock-toast-warning' : ''}`}>
      <strong>{update.productName}</strong> stock updated to {update.newQuantity}
      {update.isLowStock && ' — now low stock'}
      <button type="button" className="toast-close" onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
