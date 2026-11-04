import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { api, getErrorMessage } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Address, ShippingOption } from '../types';

const EMPTY_ADDRESS_FORM = {
  recipientName: '',
  zipcode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal } = useCart();
  const { user, loading: authLoading } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>('');
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/checkout');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    const fetchAddresses = async () => {
      try {
        const response = await api<{ addresses: Address[] }>('/api/addresses');
        const list = response.addresses || [];
        setAddresses(list);
        if (list.length > 0) {
          setSelectedAddressId((current) => current || list[0].id || null);
        }
      } catch (err) {
        console.error('Erro ao carregar endereços', err);
      }
    };

    fetchAddresses();
  }, [user]);

  // Cotação de frete sempre que o endereço ou o carrinho mudar
  useEffect(() => {
    const address = addresses.find((item) => item.id === selectedAddressId);
    if (!address || items.length === 0) {
      // Limpa a cotação quando não há endereço/itens; dependência externa (localStorage).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShippingOptions([]);
      setSelectedShipping('');
      return;
    }

    let cancelled = false;

    const calculateShipping = async () => {
      setShippingLoading(true);
      setShippingError(null);

      try {
        const response = await api<{ options: ShippingOption[] }>('/api/shipping/calculate', {
          method: 'POST',
          body: JSON.stringify({
            zipcode: address.zipcode,
            items: items.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
            })),
          }),
        });

        if (cancelled) return;

        const options = response.options || [];
        setShippingOptions(options);
        setSelectedShipping((current) =>
          options.some((option) => option.code === current)
            ? current
            : options[0]?.code || ''
        );
      } catch (err) {
        if (!cancelled) {
          setShippingOptions([]);
          setShippingError(getErrorMessage(err, 'Não foi possível calcular o frete.'));
        }
      } finally {
        if (!cancelled) setShippingLoading(false);
      }
    };

    calculateShipping();

    return () => {
      cancelled = true;
    };
  }, [addresses, selectedAddressId, items]);

  const selectedShippingOption =
    shippingOptions.find((option) => option.code === selectedShipping) || null;
  const shippingCost = selectedShippingOption?.price || 0;
  const total = subtotal + shippingCost;

  const updateAddressField = (field: keyof typeof EMPTY_ADDRESS_FORM, value: string) => {
    setAddressForm((current) => ({ ...current, [field]: value }));
  };

  const handleZipcodeBlur = async () => {
    const digits = addressForm.zipcode.replace(/\D/g, '');
    if (digits.length !== 8) return;

    setCepLoading(true);
    try {
      const data = await api<{
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      }>(`/api/shipping/cep/${digits}`);

      setAddressForm((current) => ({
        ...current,
        street: current.street || data.logradouro || '',
        neighborhood: current.neighborhood || data.bairro || '',
        city: current.city || data.localidade || '',
        state: current.state || data.uf || '',
      }));
    } catch {
      // O preenchimento automático é opcional; o usuário pode digitar manualmente.
    } finally {
      setCepLoading(false);
    }
  };

  const handleCreateAddress = async () => {
    setAddressError(null);

    const required: Array<keyof typeof EMPTY_ADDRESS_FORM> = [
      'recipientName',
      'zipcode',
      'street',
      'number',
      'neighborhood',
      'city',
      'state',
    ];

    if (required.some((field) => !addressForm[field].trim())) {
      setAddressError('Preencha todos os campos obrigatórios do endereço.');
      return;
    }

    setSavingAddress(true);
    try {
      const response = await api<{ address: Address }>('/api/addresses', {
        method: 'POST',
        body: JSON.stringify({
          recipientName: addressForm.recipientName.trim(),
          zipcode: addressForm.zipcode.trim(),
          street: addressForm.street.trim(),
          number: addressForm.number.trim(),
          complement: addressForm.complement.trim() || undefined,
          neighborhood: addressForm.neighborhood.trim(),
          city: addressForm.city.trim(),
          state: addressForm.state.trim().toUpperCase(),
          isDefault: addresses.length === 0,
        }),
      });

      const created = response.address;
      setAddresses((current) => [...current, created]);
      setSelectedAddressId(created.id || null);
      setAddressForm(EMPTY_ADDRESS_FORM);
      setShowAddressForm(false);
    } catch (err) {
      setAddressError(getErrorMessage(err, 'Não foi possível salvar o endereço.'));
    } finally {
      setSavingAddress(false);
    }
  };

  const handleCheckout = async (paymentMethod: 'PIX' | 'CREDIT_CARD') => {
    if (!selectedAddressId) {
      setError('Selecione um endereço de entrega');
      return;
    }

    if (items.length === 0) {
      setError('Seu carrinho está vazio.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api<{ order: { id: string } }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          addressId: selectedAddressId,
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          paymentMethod,
          shippingCost,
        }),
      });

      const orderId = response.order?.id;
      if (!orderId) {
        throw new Error('Não foi possível identificar o pedido criado.');
      }

      router.push(
        paymentMethod === 'PIX'
          ? `/checkout/pix?orderId=${orderId}`
          : `/checkout/card?orderId=${orderId}`
      );
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao processar o pedido'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const inputClass =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <>
      <Head>
        <title>Checkout - TechStore</title>
      </Head>

      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Finalizar Compra</h1>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Endereços */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">Endereço de Entrega</h2>
                  {!showAddressForm && (
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(true)}
                      className="text-sm font-medium text-indigo-600 hover:underline"
                    >
                      + Novo endereço
                    </button>
                  )}
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {addresses.length === 0 && !showAddressForm && (
                  <div className="rounded-md border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                    Nenhum endereço cadastrado. Cadastre um endereço para continuar.
                  </div>
                )}

                {addresses.length > 0 && (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400"
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

                {showAddressForm && (
                  <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-medium text-gray-600">Destinatário *</label>
                        <input
                          value={addressForm.recipientName}
                          onChange={(event) => updateAddressField('recipientName', event.target.value)}
                          className={inputClass}
                          placeholder="Nome de quem recebe"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                          CEP * {cepLoading && <span className="text-indigo-500">(buscando...)</span>}
                        </label>
                        <input
                          value={addressForm.zipcode}
                          onChange={(event) => updateAddressField('zipcode', event.target.value)}
                          onBlur={handleZipcodeBlur}
                          className={inputClass}
                          placeholder="01001-000"
                          maxLength={9}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Número *</label>
                        <input
                          value={addressForm.number}
                          onChange={(event) => updateAddressField('number', event.target.value)}
                          className={inputClass}
                          placeholder="100"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-medium text-gray-600">Rua *</label>
                        <input
                          value={addressForm.street}
                          onChange={(event) => updateAddressField('street', event.target.value)}
                          className={inputClass}
                          placeholder="Praça da Sé"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Bairro *</label>
                        <input
                          value={addressForm.neighborhood}
                          onChange={(event) => updateAddressField('neighborhood', event.target.value)}
                          className={inputClass}
                          placeholder="Sé"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Complemento</label>
                        <input
                          value={addressForm.complement}
                          onChange={(event) => updateAddressField('complement', event.target.value)}
                          className={inputClass}
                          placeholder="Apto 42"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Cidade *</label>
                        <input
                          value={addressForm.city}
                          onChange={(event) => updateAddressField('city', event.target.value)}
                          className={inputClass}
                          placeholder="São Paulo"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">UF *</label>
                        <input
                          value={addressForm.state}
                          onChange={(event) => updateAddressField('state', event.target.value.toUpperCase())}
                          className={inputClass}
                          placeholder="SP"
                          maxLength={2}
                        />
                      </div>
                    </div>

                    {addressError && (
                      <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {addressError}
                      </p>
                    )}

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={handleCreateAddress}
                        disabled={savingAddress}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {savingAddress ? 'Salvando...' : 'Salvar endereço'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          setAddressError(null);
                        }}
                        disabled={savingAddress}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Frete */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Frete</h2>

                {shippingLoading ? (
                  <p className="text-sm text-gray-500">Calculando opções de frete...</p>
                ) : shippingError ? (
                  <p className="text-sm text-rose-600">{shippingError}</p>
                ) : shippingOptions.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Selecione um endereço com CEP válido para calcular o frete.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {shippingOptions.map((option) => (
                      <label
                        key={option.code}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-300 p-3 text-sm hover:border-indigo-400"
                      >
                        <span className="flex items-center">
                          <input
                            type="radio"
                            name="shipping"
                            checked={selectedShipping === option.code}
                            onChange={() => setSelectedShipping(option.code)}
                            className="mr-3"
                          />
                          <span>
                            <span className="block font-medium text-gray-900">{option.name}</span>
                            <span className="block text-xs text-gray-500">{option.description}</span>
                          </span>
                        </span>
                        <span className="font-semibold text-gray-900">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(option.price)}
                        </span>
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
                    disabled={loading || !selectedAddressId || items.length === 0}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    Pix
                  </button>
                  <button
                    onClick={() => handleCheckout('CREDIT_CARD')}
                    disabled={loading || !selectedAddressId || items.length === 0}
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

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Itens ({items.length})</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Frete</span>
                    <span className="font-medium">
                      {selectedShippingOption
                        ? new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(shippingCost)
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-indigo-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(total)}
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
      </div>
    </>
  );
}
