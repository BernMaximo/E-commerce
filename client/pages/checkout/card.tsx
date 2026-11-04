import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { api } from '../../lib/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function CardCheckoutPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const { clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para os campos do cartão
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [installments, setInstallments] = useState(1);

  useEffect(() => {
    if (!router.isReady || authLoading) return;
    if (!user) {
      router.push(`/login?redirect=/checkout/card?orderId=${orderId ?? ''}`);
      return;
    }
    if (!orderId) {
      router.push('/checkout');
    }
  }, [orderId, router, router.isReady, user, authLoading]);

  const handlePay = async () => {
    if (!orderId) return;
    
    setLoading(true);
    setError(null);

    try {
      // Simulação de tokenização - em produção usaria o SDK do Mercado Pago
      const response = await api<{ status: string; paymentStatus: string }>(
        `/api/payments/orders/${orderId}/card`,
        {
          method: 'POST',
          body: JSON.stringify({
            token: `mock-card-token-${Date.now()}`,
            installments,
            paymentMethodId: 'visa',
            issuerId: 'default',
            payer: {
              email: 'cliente@teste.com',
              first_name: cardName.split(' ')[0] || 'Cliente',
              last_name: cardName.split(' ').slice(1).join(' ') || 'TechStore',
              identification: {
                type: 'CPF',
                number: '12345678909'
              }
            }
          }),
        }
      );

      if (response.status === 'PAID' || response.paymentStatus === 'APPROVED') {
        clearCart();
        router.push(`/order/${orderId}`);
      } else {
        setError('Pagamento não foi aprovado');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  if (!orderId) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Pagamento com Cartão - TechStore</title>
      </Head>

      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Pagamento com Cartão de Crédito</h1>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Número do Cartão */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número do Cartão
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>

                {/* Nome no Cartão */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome no Cartão
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    placeholder="João da Silva"
                  />
                </div>

                {/* Validade e CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Validade (MM/AA)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                      placeholder="12/25"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>

                {/* Parcelamento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parcelamento
                  </label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={1}>1x à vista (desconto)</option>
                    <option value={2}>2x no débito</option>
                    <option value={3}>3x parcelado</option>
                    <option value={4}>4x parcelado</option>
                    <option value={5}>5x parcelado</option>
                    <option value={6}>6x parcelado</option>
                  </select>
                </div>
              </div>

              {/* Botões */}
              <div className="mt-6 flex gap-4">
                <button
                  onClick={handlePay}
                  disabled={loading || !cardNumber || !cardName || !cardExpiry || !cardCvc}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Processando...' : 'Pagar com Cartão'}
                </button>
                <button
                  onClick={() => router.push('/checkout')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Voltar
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>Ambiente de demonstração: o pagamento é simulado e aprovado automaticamente.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}