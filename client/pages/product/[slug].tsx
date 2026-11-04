import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { Product } from '../../types';
import { api } from '../../lib/api';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';

export default function ProductDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const response = await api<{ product: Product }>(`/api/products/${slug}`);
          setProduct(response.product);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Produto não encontrado');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [slug]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
    }
  };

  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(typeof price === 'string' ? parseFloat(price) : price);
  };

  if (!slug) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{product ? `${product.name} - TechStore` : 'Carregando...'}</title>
      </Head>
      
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline">
                Voltar ao catálogo
              </Link>
            </div>
          ) : product ? (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={product.imageUrl || '/next.svg'}
                  alt={product.name}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>

              {/* Product Details */}
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                
                {product.category && (
                  <Link 
                    href={`/?category=${product.category.id}`}
                    className="text-sm text-indigo-600 hover:underline mt-1"
                  >
                    {product.category.name}
                  </Link>
                )}

                <div className="mt-4">
                  <span className="text-3xl font-bold text-indigo-600">
                    {formatPrice(product.price)}
                  </span>
                </div>

                <div className="mt-4">
                  {product.stock > 0 ? (
                    <span className="text-green-600 font-medium">
                      Em estoque - {product.stock} unidades disponíveis
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">
                      Esgotado
                    </span>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h2>
                    <p className="text-gray-600">{product.description}</p>
                  </div>
                )}

                {/* Specifications */}
                {(product.weightG || product.lengthCm || product.widthCm || product.heightCm) && (
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Especificações</h2>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {product.weightG && (
                        <li><span className="font-medium">Peso:</span> {product.weightG}g</li>
                      )}
                      {product.lengthCm && (
                        <li><span className="font-medium">Dimensões:</span> {product.lengthCm}×{product.widthCm}×{product.heightCm} cm</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Quantity Selector */}
                {product.stock > 0 && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-gray-700 mb-2">
                      Quantidade
                    </label>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    >
                      {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map((qty) => (
                        <option key={qty} value={qty}>
                          {qty}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="mt-6 w-full px-6 py-3 text-lg font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Adicionar ao Carrinho
                </button>

                <Link
                  href="/cart"
                  className="mt-3 w-full text-center px-6 py-3 text-lg font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-gray-50"
                >
                  Ver Carrinho
                </Link>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </>
  );
}