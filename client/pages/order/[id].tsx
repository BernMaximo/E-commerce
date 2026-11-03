import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Order } from '../../types';
import { api } from '../../lib/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchOrder = async () => {
        setLoading(true);
        try {
          const response = await api<{ order: Order }>(`/api/orders/${id}`);
          setOrder(response.order);
        } catch (err: any) {
          setError(err.message || 'Pedido não encontrado');
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id]);

  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(typeof price === 'string' ? parseFloat(price) : price);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-purple-100 text-purple-800',
      canceled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      paid: 'Pago',
      shipped: 'Enviado',
      delivered: 'Entregue',
      canceled: 'Cancelado',
    };
    return labels[status] || status;
  };

  if (!id) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{order ? `Pedido #${order.orderNumber}` : 'Carregando...'}</title>
      </Head>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : order ? (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Pedido #{order.orderNumber}
                  </h1>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Data: {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Items */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Itens</h2>
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity}x — {formatPrice(item.subtotal as number | string)}
                          </p>
                        </div>
                        <span className="font-medium text-gray-900">
                          {formatPrice(item.unitPrice as number | string)}/un
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address */}
                {order.address && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Endereço de Entrega</h2>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">{order.address.recipientName}</p>
                      <p className="text-gray-600">
                        {order.address.street}, {order.address.number}
                        {order.address.complement && ` - ${order.address.complement}`}
                      </p>
                      <p className="text-gray-600">
                        {order.address.neighborhood}, {order.address.city} - {order.address.state}
                      </p>
                      <p className="text-gray-600">CEP: {order.address.zipcode}</p>
                    </div>
                  </div>
                )}

                {/* Payment */}
                {order.payment && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Forma de Pagamento</h2>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">{order.payment.paymentMethod === 'PIX' ? 'Pix' : 'Cartão de Crédito'}</p>
                      <p className="text-sm text-gray-600">
                        Status: {getStatusLabel(order.payment.status)}
                      </p>
                      {order.payment.qrCodePix && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Código Pix:</p>
                          <code className="text-xs bg-white p-2 rounded block break-all">
                            {order.payment.qrCodePix}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total do Pedido</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </main>
        <Footer />
      </div>
    </>
  );
}