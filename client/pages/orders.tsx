import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Order } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { getOrderStatusLabel, getOrderStatusStyle } from '../lib/admin';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await api<{ orders: Order[] }>('/api/orders/my');
        setOrders(response.orders || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(typeof price === 'string' ? parseFloat(price) : price);
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Meus Pedidos - TechStore</title>
      </Head>

      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Meus Pedidos</h1>

          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Pedido #{order.orderNumber}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Enviado em: {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ring-1 ring-inset ${getOrderStatusStyle(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-1">Itens do Pedido</h3>
                        <ul className="space-y-2">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">{item.quantity}x {item.productName}</span>
                              <span className="font-medium">{formatPrice(item.subtotal as number | string)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Total</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    </div>

                    {order.trackingCode && (
                      <div className="text-sm text-gray-500">
                        <p>Rastreamento: <code className="bg-gray-100 px-2 py-1 rounded">{order.trackingCode}</code></p>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Link
                        href={`/order/${order.id}`}
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        Ver detalhes do pedido
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500 text-lg">Você ainda não realizou nenhum pedido.</p>
              <Link
                href="/"
                className="mt-4 inline-block text-indigo-600 hover:underline"
              >
                Continuar comprando
              </Link>
            </div>
          )}
        </main>
      </div>
    </>
  );
}