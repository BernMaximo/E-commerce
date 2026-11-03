import type { Order } from '../types';

export const ORDER_STATUSES: Order['status'][] = [
  'PENDING',
  'PAID',
  'SHIPPED',
  'DELIVERED',
  'CANCELED'
];

export const ORDER_STATUS_LABELS: Record<Order['status'], string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELED: 'Cancelado'
};

export const ORDER_STATUS_STYLES: Record<Order['status'], string> = {
  PENDING: 'bg-amber-100 text-amber-800 ring-amber-200',
  PAID: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  SHIPPED: 'bg-blue-100 text-blue-800 ring-blue-200',
  DELIVERED: 'bg-violet-100 text-violet-800 ring-violet-200',
  CANCELED: 'bg-rose-100 text-rose-800 ring-rose-200'
};

export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status as Order['status']] || status;
}

export function getOrderStatusStyle(status: string): string {
  return (
    ORDER_STATUS_STYLES[status as Order['status']] ||
    'bg-slate-100 text-slate-700 ring-slate-200'
  );
}

export function getStockBadge(stock: number, active = true) {
  if (!active) {
    return {
      label: 'Inativo',
      className: 'bg-slate-100 text-slate-600 ring-slate-200'
    };
  }

  if (stock === 0) {
    return {
      label: 'Esgotado',
      className: 'bg-rose-100 text-rose-700 ring-rose-200'
    };
  }

  if (stock <= 5) {
    return {
      label: `Estoque baixo (${stock})`,
      className: 'bg-amber-100 text-amber-800 ring-amber-200'
    };
  }

  return {
    label: `${stock} em estoque`,
    className: 'bg-emerald-100 text-emerald-800 ring-emerald-200'
  };
}
