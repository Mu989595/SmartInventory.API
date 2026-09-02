interface LowStockBadgeProps {
  quantity: number;
  minQuantity: number;
}

export function LowStockBadge({ quantity, minQuantity }: LowStockBadgeProps) {
  if (quantity > minQuantity) {
    return null;
  }

  return <span className="badge badge-warning">Low stock</span>;
}
