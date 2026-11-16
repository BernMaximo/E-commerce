import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { COMPANY_CONFIG } from '../lib/companyConfig';

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
        <title>{`Carrinho de Compras - ${COMPANY_CONFIG.name}`}</title>
      </Head>

      <div className="min-h-screen bg-white">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                Resumo de Compras
              </span>
              <h1 className="text-3xl font-extrabold text-neutral-950 mt-1">
                Carrinho de Peças & Componentes
              </h1>
            </div>
            <Link
              href="/#pecas"
              className="text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-neutral-950"
            >
              ← Continuar Comprando
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-neutral-200">
              <svg
                className="mx-auto h-16 w-16 text-neutral-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h2 className="text-lg font-bold text-neutral-900">
                Seu carrinho está vazio
              </h2>
              <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto">
                Explore nossas peças e componentes de reposição e adicione ao carrinho.
              </p>
              <Link
                href="/#pecas"
                className="mt-6 inline-block px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-neutral-950 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Ver Peças Disponíveis
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-200 overflow-hidden shadow-xs">
                  {items.map((item) => (
                    <div key={item.product.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative shrink-0 h-18 w-18 overflow-hidden rounded-lg bg-neutral-100 border border-neutral-200">
                          <Image
                            src={item.product.imageUrl || '/next.svg'}
                            alt={item.product.name}
                            fill
                            sizes="72px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link href={`/product/${item.product.slug}`} className="text-sm font-bold text-neutral-950 hover:underline line-clamp-1">
                            {item.product.name}
                          </Link>
                          <div className="text-xs text-neutral-500 mt-0.5">
                            Unitário: {formatPrice(item.product.price)}
                          </div>
                          <div className="text-sm font-black text-neutral-950 mt-1">
                            Total: {formatPrice(Number(item.product.price) * item.quantity)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-sm"
                          aria-label="Diminuir quantidade"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-neutral-900 w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-sm"
                          aria-label="Aumentar quantidade"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="ml-3 text-xs font-semibold text-neutral-400 hover:text-red-600 transition-colors"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={clearCart}
                    className="text-xs font-semibold text-neutral-500 hover:text-red-600 transition-colors"
                  >
                    Esvaziar carrinho
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="md:col-span-1">
                <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6 shadow-xs">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-950 mb-4">
                    Resumo do Pedido
                  </h2>
                  
                  <div className="border-t border-neutral-200 pt-4 space-y-2">
                    <div className="flex justify-between items-center text-xs text-neutral-600">
                      <span>Itens ({items.reduce((acc, i) => acc + i.quantity, 0)}):</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-black text-neutral-950 pt-2 border-t border-neutral-200">
                      <span>Total:</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleCheckout}
                      className="w-full px-4 py-3 text-xs font-bold uppercase tracking-wider text-white bg-neutral-950 hover:bg-neutral-800 rounded-lg shadow-sm transition-colors"
                    >
                      Avançar para Checkout
                    </button>
                    <Link
                      href="/#pecas"
                      className="block w-full text-center px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-800 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                      Continuar Comprando
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
