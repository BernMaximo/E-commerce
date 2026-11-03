import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Address } from '../types';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/checkout');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await api<{ addresses: Address[] }>('/api/addresses');
        setAddresses(response.addresses || []);
        if ((response.addresses || []).length > 0) {
          setSelectedAddressId(response.addresses[0].id || null);
        }
      } catch (err) {
        console.error('Erro ao carregar endereços', err);
      }
    };
    fetchAddresses();
  }, []);

  const handleCheckout = async (paymentMethod: 'PIX' | 'CREDIT_CARD') => {
    if (!selectedAddressId) {
      setError('Selecione um endereço de entrega');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Criar o pedido
      const orderData = {
        addressId: selectedAddressId,
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        paymentMethod,
        shippingCost: 0 // Seria calculado dinamicamente
      };

      const response = await api('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      const orderId = response.order?.id || response.orderId;
      
      if (paymentMethod === 'PIX') {
        // Gerar QR Code Pix
        const pixResponse = await api(`/api/payments/orders/${orderId}/pix`);
        router.push(`/checkout/pix?orderId=${orderId}`);
      } else {
        router.push(`/checkout/card?orderId=${orderId}`);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar o pedido');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Checkout - TechStore</title>
      </Head>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Finalizar Compra</h1>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Endereços */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Endereço de Entrega</h2>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {addresses.length === 0 ? (
                  <p className="text-gray-500">Nenhum endereço cadastrado. Cadastre um endereço primeiro.</p>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id || null)}
                          className="mr-3"
                        />
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{address.recipientName}</p>
                          <p className="text-gray-600">
                            {address.street}, {address.number}
                            {address.complement && ` - ${address.complement}`}
                          </p>
                          <p className="text-gray-600">
                            {address.neighborhood}, {address.city} - {address.state}
                          </p>
                          <p className="text-gray-500 text-xs">CEP: {address.zipcode}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Forma de Pagamento */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Forma de Pagamento</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => handleCheckout('PIX')}
                    disabled={loading || !selectedAddressId}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    Pix
                  </button>
                  <button
                    onClick={() => handleCheckout('CREDIT_CARD')}
                    disabled={loading || !selectedAddressId}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    Cartão de Crédito
                  </button>
                </div>
              </div>
            </div>

            {/* Resumo */}
            <div className="lg:sticky lg:top-8 h-fit">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Pedido</h2>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Itens ({items.length})</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(subtotal)}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => handleCheckout('PIX')}
                    disabled={loading || !selectedAddressId || items.length === 0}
                    className="w-full px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processando...' : 'Finalizar Compra'}
                  </button>

                  <button
                    onClick={() => router.push('/cart')}
                    className="mt-3 w-full text-center px-4 py-3 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-gray-50"
                  >
                    Voltar ao Carrinho
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}