import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, subtotal, hydrated } = useCart();
  const { user } = useAuth();

  const handleCheckout = () => {
    if (!user) {
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(typeof price === 'string' ? parseFloat(price) : price);
  };

  if (!hydrated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Carrinho de Compras - TechStore</title>
      </Head>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Carrinho de Compras</h1>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-24 w-24 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                Seu carrinho está vazio
              </h2>
              <p className="mt-2 text-gray-500">
                Adicione produtos ao carrinho para começar a compra.
              </p>
              <Link
                href="/"
                className="mt-6 inline-block px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Continuar comprando
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
                  {items.map((item) => (
                    <div key={item.product.id} className="p-4 flex items-center">
                      <div className="relative flex-shrink-0 h-20 w-20 mr-4 overflow-hidden rounded bg-gray-100">
                        <Image
                          src={item.product.imageUrl || '/next.svg'}
                          alt={item.product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <Link href={`/product/${item.product.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                          {item.product.name}
                        </Link>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatPrice(item.product.price)} × {item.quantity}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                          {formatPrice(Number(item.product.price) * item.quantity)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                        >
                          <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20-12H8l-5-5V5h14v4z" />
                          </svg>
                        </button>
                        <span className="text-sm font-medium text-gray-700 w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                        >
                          <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="ml-2 text-sm text-red-600 hover:underline"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4">
                  <button
                    onClick={clearCart}
                    className="text-sm text-gray-500 hover:text-red-600"
                  >
                    Limpar carrinho
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Pedido</h2>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium text-gray-900">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={handleCheckout}
                      className="w-full px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Finalizar Compra
                    </button>
                    <Link
                      href="/"
                      className="mt-3 w-full text-center px-4 py-3 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-gray-50"
                    >
                      Continuar comprando
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}