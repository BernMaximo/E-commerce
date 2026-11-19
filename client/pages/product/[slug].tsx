import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { Product } from '../../types';
import { api } from '../../lib/api';
import { useCart } from '../../context/CartContext';
import { COMPANY_CONFIG, getWhatsAppUrl } from '../../lib/companyConfig';
import { FALLBACK_PRODUCTS } from '../../lib/fallbackProducts';
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
        } catch {
          // Se o backend estiver desconectado, procura nos produtos de demonstração
          const fallback = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
          if (fallback) {
            setProduct(fallback);
          } else {
            setError('Produto não encontrado');
          }
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

  const questionAboutProductUrl = product
    ? getWhatsAppUrl(`Olá, MXM Maintenance! Tenho uma dúvida sobre a peça: *${product.name}* (Ref: ${product.slug}).`)
    : getWhatsAppUrl();

  return (
    <>
      <Head>
        <title>{product ? `${product.name} - ${COMPANY_CONFIG.name}` : 'Carregando...'}</title>
      </Head>
      
      <div className="min-h-screen bg-white">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          <nav className="mb-6">
            <Link href="/#pecas" className="text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-neutral-950 flex items-center gap-1">
              ← Voltar para Peças & Componentes
            </Link>
          </nav>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-10">
              <div className="aspect-square bg-neutral-100 rounded-xl animate-pulse" />
              <div className="space-y-4">
                <div className="h-8 bg-neutral-100 rounded w-3/4 animate-pulse" />
                <div className="h-6 bg-neutral-100 rounded w-1/4 animate-pulse" />
                <div className="h-12 bg-neutral-100 rounded animate-pulse" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-neutral-50 rounded-xl border border-neutral-200">
              <p className="text-sm font-semibold text-neutral-800">{error}</p>
              <Link href="/#pecas" className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-neutral-950 hover:underline">
                Voltar ao catálogo de peças
              </Link>
            </div>
          ) : product ? (
            <div className="grid md:grid-cols-2 gap-10 items-start">
              {/* Product Image */}
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100 border border-neutral-200">
                <Image
                  src={product.imageUrl || '/next.svg'}
                  alt={product.name}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                  priority
                />
              </div>

              {/* Product Details */}
              <div className="flex flex-col">
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight leading-tight">
                  {product.name}
                </h1>
                
                {product.category && (
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mt-2">
                    Categoria: {product.category.name}
                  </span>
                )}

                <div className="mt-4 flex items-baseline gap-4">
                  <span className="text-3xl font-black text-neutral-950">
                    {formatPrice(product.price)}
                  </span>
                  {product.stock > 0 ? (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      {product.stock} unidades em estoque
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                      Esgotado
                    </span>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mt-6 pt-6 border-t border-neutral-200">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Descrição da Peça</h2>
                    <p className="text-sm text-neutral-700 leading-relaxed">{product.description}</p>
                  </div>
                )}

                {/* Specifications */}
                {(product.weightG || product.lengthCm || product.widthCm || product.heightCm) && (
                  <div className="mt-6 pt-6 border-t border-neutral-200">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Especificações Físicas</h2>
                    <ul className="text-xs text-neutral-600 space-y-1">
                      {product.weightG && (
                        <li><span className="font-semibold text-neutral-900">Peso:</span> {product.weightG}g</li>
                      )}
                      {product.lengthCm && (
                        <li><span className="font-semibold text-neutral-900">Dimensões:</span> {product.lengthCm}×{product.widthCm}×{product.heightCm} cm</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Quantity Selector */}
                {product.stock > 0 && (
                  <div className="mt-6 flex items-center gap-3">
                    <label htmlFor="product-qty-select" className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                      Quantidade:
                    </label>
                    <select
                      id="product-qty-select"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="px-3 py-1.5 bg-white border border-neutral-300 rounded-md text-sm font-semibold text-neutral-900 focus:ring-2 focus:ring-neutral-950 focus:border-neutral-950"
                    >
                      {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map((qty) => (
                        <option key={qty} value={qty}>
                          {qty}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Buttons */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="w-full px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-neutral-950 hover:bg-neutral-800 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Adicionar ao Carrinho
                  </button>

                  <a
                    href={questionAboutProductUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.101-.476-.15-.676.15-.2.301-.776.979-.952 1.18-.176.201-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.894-.798-1.498-1.783-1.674-2.084-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.2-.301.3-.501.101-.2.05-.376-.025-.526-.075-.15-.676-1.629-.927-2.232-.244-.588-.492-.508-.676-.517-.175-.009-.376-.01-.577-.01-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.507s1.079 2.908 1.23 3.109c.15.2 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.378.198 1.898.12.579-.087 1.78-.727 2.03-1.429.25-.702.25-1.304.175-1.429-.075-.125-.276-.2-.577-.35zM12.04 2C6.51 2 2.023 6.486 2.023 12.016c0 1.936.554 3.743 1.517 5.275L2 22l4.858-1.503c1.474.887 3.208 1.394 5.182 1.394 5.53 0 10.017-4.486 10.017-10.015C22.057 6.486 17.57 2 12.04 2zm0 18.232c-1.714 0-3.307-.492-4.66-1.34l-.334-.209-2.87.888.89-2.795-.23-.365c-.958-1.52-1.464-3.29-1.464-5.11 0-4.57 3.718-8.288 8.288-8.288 4.57 0 8.288 3.718 8.288 8.288 0 4.57-3.718 8.288-8.288 8.288z" />
                    </svg>
                    <span>Dúvida sobre esta peça? Pergunte no WhatsApp</span>
                  </a>
                </div>

              </div>
            </div>
          ) : null}
        </main>
      </div>
    </>
  );
}
