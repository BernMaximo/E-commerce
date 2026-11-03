import { ReactNode, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api, getErrorMessage } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/format';
import { getOrderStatusLabel } from '../../lib/admin';
import { AdminStatsResponse, Order } from '../../types';
import AdminLayout from '../../components/admin/AdminLayout';
import StatusBadge from '../../components/admin/StatusBadge';

const STATUS_BAR_COLORS: Record<Order['status'], string> = {
  PENDING: 'bg-amber-400',
  PAID: 'bg-emerald-500',
  SHIPPED: 'bg-blue-500',
  DELIVERED: 'bg-violet-500',
  CANCELED: 'bg-rose-500'
};

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  tone: 'indigo' | 'emerald' | 'amber' | 'violet';
  icon: ReactNode;
};

const STAT_TONES: Record<StatCardProps['tone'], string> = {
  indigo: 'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600'
};

function StatCard({ label, value, helper, tone, icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold text-slate-900">{value}</p>
          {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${STAT_TONES[tone]}`}>
          {icon}
        </span>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white lg:col-span-2" />
        <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api<AdminStatsResponse>('/api/admin/stats');
        if (!cancelled) setData(response);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Erro ao carregar os indicadores.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const stats = data?.stats;
  const recentOrders = data?.recentOrders || [];
  const lowStockProducts = data?.lowStockProducts || [];
  const salesLast7Days = data?.salesLast7Days || [];

  const maxDailyRevenue = Math.max(...salesLast7Days.map((day) => day.revenue), 1);
  const statusTotal = stats
    ? Object.values(stats.statusCounts).reduce((sum, count) => sum + count, 0)
    : 0;

  return (
    <>
      <Head>
        <title>Dashboard Admin - TechStore</title>
      </Head>

      <AdminLayout
        title="Dashboard"
        description="Acompanhe vendas, pedidos e a saúde do catálogo em tempo real."
        actions={
          <>
            <Link
              href="/admin/orders"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Ver pedidos
            </Link>
            <Link
              href="/admin/products"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Novo produto
            </Link>
          </>
        }
      >
        {loading ? (
          <DashboardSkeleton />
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
        ) : stats ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Receita confirmada"
                value={formatCurrency(stats.revenue)}
                helper="Pedidos pagos, enviados ou entregues"
                tone="emerald"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
              <StatCard
                label="Pedidos totais"
                value={String(stats.totalOrders)}
                helper={`${stats.statusCounts.PENDING} aguardando pagamento`}
                tone="indigo"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
              />
              <StatCard
                label="A receber"
                value={formatCurrency(stats.pendingRevenue)}
                helper={`${stats.statusCounts.PENDING} pedido(s) pendente(s)`}
                tone="amber"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
              <StatCard
                label="Ticket médio"
                value={formatCurrency(stats.averageTicket)}
                helper="Média dos pedidos confirmados"
                tone="violet"
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    />
                  </svg>
                }
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-medium text-slate-500">Produtos ativos</p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {stats.activeProducts}
                  <span className="ml-1 text-xs font-normal text-slate-400">
                    de {stats.totalProducts}
                  </span>
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-medium text-slate-500">Estoque baixo</p>
                <p className="mt-1 text-lg font-bold text-amber-600">{stats.lowStockCount}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-medium text-slate-500">Esgotados</p>
                <p className="mt-1 text-lg font-bold text-rose-600">{stats.outOfStockCount}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-medium text-slate-500">Clientes e categorias</p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {stats.totalClients}
                  <span className="mx-1 text-slate-300">/</span>
                  {stats.totalCategories}
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Receita dos últimos 7 dias</h2>
                    <p className="text-xs text-slate-500">Pedidos confirmados por dia</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {formatCurrency(salesLast7Days.reduce((sum, day) => sum + day.revenue, 0))}
                  </span>
                </div>

                <div className="mt-6 flex h-44 items-end gap-2 sm:gap-3">
                  {salesLast7Days.map((day) => {
                    const height = Math.max(6, (day.revenue / maxDailyRevenue) * 100);
                    const label = new Date(`${day.date}T12:00:00`).toLocaleDateString('pt-BR', {
                      weekday: 'short'
                    });

                    return (
                      <div key={day.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-violet-500 transition-all hover:from-indigo-600 hover:to-violet-600"
                          style={{ height: `${height}%` }}
                          title={`${formatDate(`${day.date}T12:00:00`)}: ${formatCurrency(day.revenue)} em ${day.orders} pedido(s)`}
                        />
                        <span className="text-[11px] font-medium capitalize text-slate-500">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">Pedidos por status</h2>
                <p className="text-xs text-slate-500">{statusTotal} pedido(s) no total</p>

                <div className="mt-5 space-y-4">
                  {(Object.keys(stats.statusCounts) as Order['status'][]).map((status) => {
                    const count = stats.statusCounts[status];
                    const percentage = statusTotal > 0 ? (count / statusTotal) * 100 : 0;

                    return (
                      <div key={status}>
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-600">{getOrderStatusLabel(status)}</span>
                          <span className="font-semibold text-slate-900">{count}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${STATUS_BAR_COLORS[status]}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Pedidos recentes</h2>
                    <p className="text-xs text-slate-500">Últimas movimentações da loja</p>
                  </div>
                  <Link href="/admin/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                    Ver todos
                  </Link>
                </div>

                {recentOrders.length === 0 ? (
                  <p className="px-5 py-10 text-center text-sm text-slate-500">Nenhum pedido registrado ainda.</p>
                ) : (
                  <>
                    <div className="hidden overflow-x-auto md:block">
                      <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-5 py-3">Pedido</th>
                            <th className="px-5 py-3">Cliente</th>
                            <th className="px-5 py-3">Data</th>
                            <th className="px-5 py-3">Total</th>
                            <th className="px-5 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {recentOrders.map((order) => (
                            <tr key={order.id} className="transition-colors hover:bg-slate-50">
                              <td className="px-5 py-3 font-medium text-slate-900">#{order.orderNumber}</td>
                              <td className="px-5 py-3 text-slate-600">{order.user?.name || 'Cliente'}</td>
                              <td className="px-5 py-3 text-slate-500">{formatDate(order.createdAt)}</td>
                              <td className="px-5 py-3 font-semibold text-slate-900">{formatCurrency(order.total)}</td>
                              <td className="px-5 py-3">
                                <StatusBadge status={order.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="divide-y divide-slate-100 md:hidden">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-start justify-between gap-3 px-4 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900">#{order.orderNumber}</p>
                            <p className="truncate text-xs text-slate-500">{order.user?.name || 'Cliente'}</p>
                            <p className="mt-1 text-xs text-slate-400">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-sm font-semibold text-slate-900">{formatCurrency(order.total)}</span>
                            <StatusBadge status={order.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Repor estoque</h2>
                    <p className="text-xs text-slate-500">Produtos com 5 unidades ou menos</p>
                  </div>
                </div>

                {lowStockProducts.length === 0 ? (
                  <p className="px-5 py-10 text-center text-sm text-slate-500">Todo o catálogo está abastecido.</p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {lowStockProducts.map((product) => (
                      <li key={product.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{product.name}</p>
                          <p className="truncate text-xs text-slate-500">{product.category?.name || 'Sem categoria'}</p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                            product.stock === 0
                              ? 'bg-rose-100 text-rose-700 ring-rose-200'
                              : 'bg-amber-100 text-amber-800 ring-amber-200'
                          }`}
                        >
                          {product.stock === 0 ? 'Esgotado' : `${product.stock} un.`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="border-t border-slate-200 p-3">
                  <Link
                    href="/admin/products"
                    className="block rounded-xl px-3 py-2 text-center text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
                  >
                    Gerenciar produtos
                  </Link>
                </div>
              </section>
            </div>
          </div>
        ) : null}
      </AdminLayout>
    </>
  );
}
