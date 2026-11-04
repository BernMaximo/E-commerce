import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Product, Category } from '../../types';
import { api } from '../../lib/api';
import ProductCard from '../../components/ProductCard';

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Buscar produtos por categoria
          const params = new URLSearchParams();
          params.append('category', slug as string);
          
          const response = await api<{ products: Product[] }>(`/api/products?${params.toString()}`);
          setProducts(response.products || []);
          
          // Buscar nome da categoria
          const categories = await api<{ categories: Category[] }>('/api/categories');
          const cat = categories.categories?.find(c => c.slug === slug);
          setCategory(cat || null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [slug]);

  if (!slug) {
    return null;
  }

  return (
    <>
      <Head>
        <title>
          {category ? `${category.name} - TechStore` : 'Categoria'}
        </title>
      </Head>

      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {category ? category.name : 'Categoria'}
          </h1>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhum produto nesta categoria.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}