import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

interface SuccessProps {
  orderId: string;
  status: 'paid' | 'pending' | 'failed';
}

export default function SuccessPage() {
  const router = useRouter();
  const { orderId, status } = router.query as { orderId?: string; status?: string };
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await api(`/api/orders/${orderId}`);
        setOrder(response.order);
        if (response.order?.status === 'PAID') {
          clearCart();
        }
      } catch (err) {
        console.error('Erro ao buscar pedido', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router, clearCart]);

  if (!orderId) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-600">Pedido não encontrado</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Compra Concluída - TechStore</title>
      </Head>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-md mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {order.status === 'PAID' ? (
              <>
                <div className="text-green-500 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Pagamento Realizado com Sucesso!
                </h1>
                <p className="text-gray-600 mb-4">
                  Seu pedido <strong>#{order.orderNumber}</strong> foi processado com sucesso.
                </p>
                <p className="text-sm text-gray-500">
                  Em breve você receberá uma atualização sobre o envio.
                </p>
              </>
            ) : (
              <>
                <div className="text-yellow-500 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Pagamento em Processamento
                </h1>
                <p className="text-gray-600 mb-4">
                  Seu pagamento ainda está sendo processado. Aguarde a confirmação.
                </p>
              </>
            )}
          </div>

          <div className="mt-6">
            <a
              href="/"
              className="inline-block px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Continuar Comprando
            </a>
          </div>
        </main>
      </div>
    </>
  );
}