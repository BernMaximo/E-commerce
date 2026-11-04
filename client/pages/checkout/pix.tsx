import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { api, getErrorMessage } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

interface PixPaymentData {
  qrCodePix: string;
  qrCodePixUrl: string;
  orderId: string;
  status: string;
}

export default function PixCheckoutPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const { user, loading: authLoading } = useAuth();
  const { clearCart } = useCart();
  const [pixData, setPixData] = useState<PixPaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(300); // 5 minutos

  useEffect(() => {
    if (!router.isReady || authLoading) return;

    if (!user) {
      router.push(`/login?redirect=/checkout/pix?orderId=${orderId ?? ''}`);
      return;
    }

    if (!orderId) {
      router.push('/checkout');
      return;
    }

    // Buscar/gerar dados do Pix
    const fetchPixData = async () => {
      setLoading(true);
      try {
        const response = await api<PixPaymentData>(`/api/payments/orders/${orderId}/pix`, {
          method: 'POST',
        });
        setPixData(response);
      } catch (err) {
        setError(getErrorMessage(err, 'Erro ao gerar os dados do pagamento'));
      } finally {
        setLoading(false);
      }
    };

    fetchPixData();

    // Countdown do QR Code
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId, router, router.isReady, user, authLoading]);

  useEffect(() => {
    // Verificar se o pagamento foi aprovado periodicamente
    if (!orderId || !user) return;

    const checkPayment = setInterval(async () => {
      try {
        const response = await api<{ order: { status: string } }>(`/api/orders/${orderId}`);
        if (response.order?.status === 'PAID') {
          clearCart();
          router.push(`/order/${orderId}`);
        }
      } catch {
        // Ignora falhas transitórias de polling.
      }
    }, 3000);

    return () => clearInterval(checkPayment);
  }, [orderId, router, clearCart, user]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Pagamento Pix - TechStore</title>
      </Head>

      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Pagamento via Pix
            </h1>

            {loading ? (
              <div className="text-center py-8">
                <p>Carregando dados do pagamento...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
              </div>
            ) : pixData ? (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-2">
                    Escaneie o QR Code ou copie e cole o código para pagar
                  </p>
                  <p className="text-sm text-gray-500">
                    ⏰ Tempo restante: {formatTime(countdown)}
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {pixData.qrCodePixUrl && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <Image
                        src={pixData.qrCodePixUrl}
                        alt="QR Code Pix"
                        width={250}
                        height={250}
                        className="mx-auto"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Pix (Copia e Cola)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={pixData.qrCodePix || ''}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md font-mono text-xs"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(pixData.qrCodePix || '')}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-500">
                    Após o pagamento ser confirmado, esta página atualiza automaticamente e
                    redireciona para os detalhes do pedido.
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => router.push('/')}
                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => router.push('/cart')}
                    className="px-4 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Ver Carrinho
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </>
  );
}