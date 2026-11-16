import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product, 1);
  };

  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(typeof price === 'string' ? parseFloat(price) : price);
  };

  return (
    <div className="group bg-white rounded-xl border border-neutral-200 hover:border-neutral-900 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      <div>
        <Link href={`/product/${product.slug}`} className="block relative aspect-square w-full overflow-hidden bg-neutral-100">
          <Image
            src={product.imageUrl || '/next.svg'}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        <div className="p-4">
          <h3 className="text-sm font-semibold text-neutral-900 mb-1.5 line-clamp-2 leading-snug">
            <Link href={`/product/${product.slug}`} className="hover:underline">
              {product.name}
            </Link>
          </h3>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
            <span className="text-base font-bold text-neutral-950">
              {formatPrice(product.price)}
            </span>
            {product.stock > 0 ? (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Em estoque
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                Esgotado
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-neutral-950 rounded-lg hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
        >
          {product.stock === 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
        </button>
      </div>
    </div>
  );
}
