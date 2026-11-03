import { FormEvent, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api, getErrorMessage } from '../../lib/api';
import { formatCurrency, formatDateTime } from '../../lib/format';
import { ORDER_STATUSES, getOrderStatusLabel } from '../../lib/admin';
import { Order, Pagination } from '../../types';
import AdminLayout from '../../components/admin/AdminLayout';
import StatusBadge from '../../components/admin/StatusBadge';

type OrdersResponse = {
  orders: Order[];
  pagination: Pagination;
};

const EMPTY_PAGINATION: Pagination = { page: 1, limit: 10, total: 0, totalPages: 0 };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formStatus, setFormStatus] = useState<Order['status']>('PENDING');
  const [formTracking, setFormTracking] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: '10'
        });

        if (statusFilter) params.set('status', statusFilter);
        if (searchTerm) params.set('search', searchTerm);

        const response = await api<OrdersResponse>(`/api/orders/admin/all?${params.toString()}`);
        if (!cancelled) {
          setOrders(response.orders || []);
          setPagination(response.pagination || EMPTY_PAGINATION);
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Erro ao carregar os pedidos.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [page, reloadKey, searchTerm, statusFilter]);

  useEffect(() => {
    if (!editingOrder) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [editingOrder]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const openStatusModal = (order: Order) => {
    setEditingOrder(order);
    setFormStatus(order.status);
    setFormTracking(order.trackingCode || '');
    setFormError(null);
  };

  const closeStatusModal = () => {
    if (saving) return;
    setEditingOrder(null);
    setFormError(null);
  };

  const handleSaveStatus = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingOrder) return;

    setSaving(true);
    setFormError(null);

    try {
      await api<{ order: Order }>(`/api/orders/${editingOrder.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: formStatus,
          trackingCode: formTracking.trim() || undefined
        })
      });

      setEditingOrder(null);
      setNotice(`Pedido #${editingOrder.orderNumber} atualizado com sucesso.`);
      setReloadKey((current) => current + 1);
    } catch (err) {
      setFormError(getErrorMessage(err, 'Não foi possível atualizar o pedido.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Pedidos Admin - TechStore</title>
      </Head>

      <AdminLayout
        title="Pedidos"
        description="Acompanhe todos os pedidos da loja, altere status e insira o código de rastreio."
        actions={
          <button
            type="button"
            onClick={() => setReloadKey((current) => current + 1)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Atualizar lista
          </button>
        }
      >
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Buscar por número do pedido, cliente ou e-mail"
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 sm:flex-none"
                >
                  Buscar
                </button>
                {(searchTerm || searchInput) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setSearchTerm('');
                      setPage(1);
                    }}
                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </form>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => handleStatusFilter('')}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === ''
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos
              </button>
              {ORDER_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusFilter(status)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    statusFilter === status
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {getOrderStatusLabel(status)}
                </button>
              ))}
            </div>
          </section>

          {notice && (
            <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <p>{notice}</p>
              <button
                type="button"
                onClick={() => setNotice(null)}
                className="text-emerald-700 transition-colors hover:text-emerald-900"
                aria-label="Fechar aviso"
              >
                ×
              </button>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm font-medium text-rose-600">{error}</p>
              <button
                type="button"
                onClick={() => setReloadKey((current) => current + 1)}
                className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
              >
                Tentar novamente
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-sm text-slate-500">Nenhum pedido encontrado com os filtros atuais.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const expanded = expandedId === order.id;

                return (
                  <article key={order.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-sm font-bold text-slate-900">#{order.orderNumber}</h2>
                          <StatusBadge status={order.status} />
                          {order.payment && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                              {order.payment.paymentMethod === 'PIX' ? 'Pix' : 'Cartão'}
                            </span>
                          )}
                        </div>

                        <p className="mt-1.5 text-xs text-slate-500">
                          {formatDateTime(order.createdAt)} · {order.items.length} item(ns)
                        </p>

                        <p className="mt-2 truncate text-sm text-slate-600">
                          <span className="font-medium text-slate-900">{order.user?.name || 'Cliente'}</span>
                          {order.user?.email && <span className="text-slate-400"> · {order.user.email}</span>}
                        </p>

                        {order.trackingCode && (
                          <p className="mt-1 text-xs text-slate-500">
                            Rastreio:{' '}
                            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-700">
                              {order.trackingCode}
                            </code>
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 lg:flex-col lg:items-end">
                        <p className="text-lg font-bold text-slate-900">{formatCurrency(order.total)}</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedId(expanded ? null : order.id)}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                          >
                            {expanded ? 'Ocultar' : 'Detalhes'}
                          </button>
                          <button
                            type="button"
                            onClick={() => openStatusModal(order)}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
                          >
                            Atualizar status
                          </button>
                        </div>
                      </div>
                    </div>

                    {expanded && (
                      <div className="grid gap-5 border-t border-slate-200 bg-slate-50 p-4 sm:p-5 md:grid-cols-2">
                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Itens do pedido
                          </h3>
                          <ul className="mt-2 space-y-2">
                            {order.items.map((item) => (
                              <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                                <span className="text-slate-600">
                                  {item.quantity}x {item.productName}
                                </span>
                                <span className="shrink-0 font-medium text-slate-900">
                                  {formatCurrency(item.subtotal)}
                                </span>
                              </li>
                            ))}
                          </ul>

                          <div className="mt-3 space-y-1 border-t border-slate-200 pt-3 text-sm">
                            <div className="flex justify-between text-slate-500">
                              <span>Subtotal</span>
                              <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>Frete</span>
                              <span>{formatCurrency(order.shippingCost)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-slate-900">
                              <span>Total</span>
                              <span>{formatCurrency(order.total)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Entrega
                            </h3>
                            {order.address ? (
                              <div className="mt-2 text-sm text-slate-600">
                                <p className="font-medium text-slate-900">{order.address.recipientName}</p>
                                <p>
                                  {order.address.street}, {order.address.number}
                                  {order.address.complement ? ` - ${order.address.complement}` : ''}
                                </p>
                                <p>
                                  {order.address.neighborhood}, {order.address.city} - {order.address.state}
                                </p>
                                <p>CEP: {order.address.zipcode}</p>
                              </div>
                            ) : (
                              <p className="mt-2 text-sm text-slate-500">Endereço não disponível.</p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-3">
                            <Link
                              href={`/order/${order.id}`}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
                            >
                              Abrir página do pedido
                            </Link>
                            <button
                              type="button"
                              onClick={() => openStatusModal(order)}
                              className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
                            >
                              Editar status e rastreio
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {!loading && !error && pagination.totalPages > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm sm:flex-row">
              <p className="text-slate-500">
                Mostrando {orders.length} de {pagination.total} pedido(s)
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="px-2 font-medium text-slate-700">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>

      {editingOrder && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="status-modal-title"
          onClick={closeStatusModal}
        >
          <div
            className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <h2 id="status-modal-title" className="text-lg font-semibold text-slate-900">
                  Atualizar pedido #{editingOrder.orderNumber}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Altere o status e informe o código de rastreio quando disponível.
                </p>
              </div>
              <button
                type="button"
                onClick={closeStatusModal}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Fechar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4 p-5">
              <div>
                <label htmlFor="order-status" className="mb-1 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  id="order-status"
                  value={formStatus}
                  onChange={(event) => setFormStatus(event.target.value as Order['status'])}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {getOrderStatusLabel(status)}
                    </option>
                  ))}
                </select>
                {formStatus === 'CANCELED' && editingOrder.status !== 'CANCELED' && (
                  <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Ao cancelar, o estoque dos itens será devolvido automaticamente.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="tracking-code" className="mb-1 block text-sm font-medium text-slate-700">
                  Código de rastreio
                </label>
                <input
                  id="tracking-code"
                  type="text"
                  value={formTracking}
                  onChange={(event) => setFormTracking(event.target.value)}
                  maxLength={60}
                  placeholder="Ex.: BR123456789BR"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {formError && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {formError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeStatusModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
