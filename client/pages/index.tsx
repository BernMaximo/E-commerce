import { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { Product, Category } from '../types';
import { api } from '../lib/api';
import ProductCard from '../components/ProductCard';
import MaintenanceHero from '../components/MaintenanceHero';
import ServicesGrid from '../components/ServicesGrid';
import WorkflowSteps from '../components/WorkflowSteps';
import { COMPANY_CONFIG } from '../lib/companyConfig';
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '../lib/fallbackProducts';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api<{ categories: Category[] }>('/api/categories');
        if (response.categories && response.categories.length > 0) {
          setCategories(response.categories);
        } else {
          setCategories(FALLBACK_CATEGORIES);
        }
      } catch {
        // Fallback para visualização quando o backend não estiver rodando
        setCategories(FALLBACK_CATEGORIES);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (searchTerm) params.append('search', searchTerm);
        
        const response = await api<{ products: Product[] }>(`/api/products?${params.toString()}`);
        if (response.products) {
          setProducts(response.products);
          setUsingFallback(false);
        } else {
          throw new Error('Sem produtos');
        }
      } catch {
        // Fallback gracioso com peças de demonstração para a vitrine
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchTerm]);

  // Se estiver em modo fallback, filtra localmente
  const displayedProducts = useMemo(() => {
    if (!usingFallback) return products;

    return FALLBACK_PRODUCTS.filter((prod) => {
      const matchCategory =
        !selectedCategory ||
        prod.category?.slug === selectedCategory ||
        prod.categoryId === selectedCategory;

      const matchSearch =
        !searchTerm ||
        prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prod.description && prod.description.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchCategory && matchSearch;
    });
  }, [usingFallback, products, selectedCategory, searchTerm]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchTerm('');
  };

  return (
    <>
      <Head>
        <title>{`${COMPANY_CONFIG.name} - Manutenção Eletrônica & Catálogo de Peças`}</title>
        <meta
          name="description"
          content={`Assistência Técnica Especializada em Eletrônica e venda de componentes e peças de reposição. WhatsApp: ${COMPANY_CONFIG.phoneDisplay}`}
        />
      </Head>

      <div className="bg-white">
        {/* 1. Maintenance Hero (Principal / Topo) */}
        <MaintenanceHero />

        {/* 2. Specialized Services Grid */}
        <ServicesGrid />

        {/* 3. Workflow Steps (Como Funciona) */}
        <WorkflowSteps />

        {/* 4. Parts & Components Store (E-commerce Section) */}
        <section id="pecas" className="py-16 bg-neutral-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Store Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-neutral-200 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                  Pronta Entrega & Reposição
                </span>
                <h2 className="text-3xl font-extrabold text-neutral-950 mt-1">
                  Peças & Componentes para Eletrônica
                </h2>
                <p className="text-neutral-600 text-sm mt-2 max-w-2xl">
                  Componentes avulsos, fontes, adaptadores, conectores e peças para o acaso. Adicione ao carrinho e receba onde estiver.
                </p>
              </div>

              <div className="text-xs text-neutral-500 shrink-0">
                <span>{displayedProducts.length} {displayedProducts.length === 1 ? 'item disponível' : 'itens disponíveis'}</span>
              </div>
            </div>

            {/* Aviso sutil de modo demonstração se o backend estiver desconectado */}
            {usingFallback && (
              <div className="mb-6 px-4 py-3 bg-neutral-100 border border-neutral-300 rounded-xl flex items-center justify-between text-xs text-neutral-700">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>
                    <strong>Catálogo em Demonstração:</strong> O servidor backend (porta 3333) está desconectado. Exibindo peças de exemplo da bancada MXM.
                  </span>
                </div>
                <span className="hidden sm:inline font-mono text-[11px] text-neutral-500">
                  server: offline
                </span>
              </div>
            )}

            {/* Search and Filter Section */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    placeholder="Buscar por peça, modelo ou componente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-950 focus:border-neutral-950"
                  />
                  <svg
                    className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.357-4.357M11.5 21a9.5 9.5 0 100-19 9.5 9.5 0 000 19z"
                    />
                  </svg>
                </div>
                
                {(selectedCategory || searchTerm) && (
                  <button
                    onClick={clearFilters}
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>

              {/* Categories Pills */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${
                      selectedCategory === null
                        ? 'bg-neutral-950 text-white'
                        : 'bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-900'
                    }`}
                  >
                    Todas as Peças
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.slug)}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${
                        selectedCategory === category.slug
                          ? 'bg-neutral-950 text-white'
                          : 'bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-900'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Products Grid */}
            <div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-neutral-200 p-4 animate-pulse">
                      <div className="aspect-square bg-neutral-200 rounded-lg mb-4" />
                      <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-neutral-200 rounded w-1/2 mb-4" />
                      <div className="h-9 bg-neutral-200 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : displayedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {displayedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-neutral-300">
                  <svg className="mx-auto h-10 w-10 text-neutral-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-sm font-bold text-neutral-800">Nenhuma peça encontrada.</p>
                  <p className="text-xs text-neutral-500 mt-1">Tente buscar por outro termo ou limpe os filtros.</p>
                </div>
              )}
            </div>

          </div>
        </section>
      </div>
    </>
  );
}
