import { FormEvent, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api, getErrorMessage } from '../../lib/api';
import { formatCurrency } from '../../lib/format';
import { getStockBadge } from '../../lib/admin';
import { Category, Pagination, Product } from '../../types';
import AdminLayout from '../../components/admin/AdminLayout';
import ProductFormModal from '../../components/admin/ProductFormModal';

type ProductsResponse = {
  products: Product[];
  pagination: Pagination;
};

const EMPTY_PAGINATION: Pagination = { page: 1, limit: 12, total: 0, totalPages: 0 };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: '12',
          sort
        });

        if (searchTerm) params.set('search', searchTerm);
        if (activeFilter) params.set('active', activeFilter);

        const response = await api<ProductsResponse>(`/api/products/admin/all?${params.toString()}`);
        if (!cancelled) {
          setProducts(response.products || []);
          setPagination(response.pagination || EMPTY_PAGINATION);
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Erro ao carregar os produtos.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [activeFilter, page, reloadKey, searchTerm, sort]);

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const response = await api<{ categories: Category[] }>('/api/categories');
        if (!cancelled) setCategories(response.categories || []);
      } catch {
        if (!cancelled) setCategories([]);
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleToggleActive = async (product: Product) => {
    const nextActive = !(product.active !== false);

    if (
      !nextActive &&
      !window.confirm(`Desativar "${product.name}"? O produto deixará de aparecer na loja.`)
    ) {
      return;
    }

    setTogglingId(product.id);

    try {
      await api<{ product: Product }>(`/api/products/${product.id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: nextActive })
      });

      setNotice(
        nextActive
          ? `Produto "${product.name}" reativado com sucesso.`
          : `Produto "${product.name}" desativado com sucesso.`
      );
      setReloadKey((current) => current + 1);
    } catch (err) {
      setNotice(null);
      setError(getErrorMessage(err, 'Não foi possível alterar a disponibilidade do produto.'));
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <>
      <Head>
        <title>Produtos Admin - TechStore</title>
      </Head>

      <AdminLayout
        title="Produtos"
        description="Cadastre, edite preços e estoque e controle a disponibilidade do catálogo."
        actions={
          <button
            type="button"
            onClick={openNewProduct}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Novo produto
          </button>
        }
      >
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <form onSubmit={handleSearch} className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Buscar produto por nome, descrição ou slug"
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <select
                  value={activeFilter}
                  onChange={(event) => {
                    setActiveFilter(event.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Filtrar por disponibilidade"
                >
                  <option value="">Todos os status</option>
                  <option value="true">Ativos</option>
                  <option value="false">Inativos</option>
                </select>

                <select
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Ordenar produtos"
                >
                  <option value="newest">Mais recentes</option>
                  <option value="name_asc">Nome (A-Z)</option>
                  <option value="price_asc">Menor preço</option>
                  <option value="price_desc">Maior preço</option>
                </select>

                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                >
                  Buscar
                </button>

                {(searchTerm || searchInput) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setSearchTerm('');
                      setPage(1);
                    }}
                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </form>
          </section>

          {notice && (
            <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <p>{notice}</p>
              <button
                type="button"
                onClick={() => setNotice(null)}
                className="text-emerald-700 transition-colors hover:text-emerald-900"
                aria-label="Fechar aviso"
              >
                ×
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm font-medium text-rose-600">{error}</p>
              <button
                type="button"
                onClick={() => setReloadKey((current) => current + 1)}
                className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
              >
                Tentar novamente
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-sm text-slate-500">Nenhum produto encontrado com os filtros atuais.</p>
              <button
                type="button"
                onClick={openNewProduct}
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                Cadastrar primeiro produto
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => {
                const stockBadge = getStockBadge(product.stock, product.active !== false);
                const isToggling = togglingId === product.id;

                return (
                  <article
                    key={product.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="relative aspect-square w-full bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className={`h-full w-full object-cover ${product.active === false ? 'opacity-50 grayscale' : ''}`}
                      />
                      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${stockBadge.className}`}
                        >
                          {stockBadge.label}
                        </span>
                        {product.active === false && (
                          <span className="rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                            Inativo
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
                        {product.category?.name || 'Sem categoria'}
                      </p>
                      <h2 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">
                        {product.name}
                      </h2>
                      <p className="mt-2 text-lg font-bold text-slate-900">{formatCurrency(product.price)}</p>

                      <div className="mt-auto flex flex-col gap-2 pt-4">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => openEditProduct(product)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(product)}
                            disabled={isToggling}
                            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:opacity-60 ${
                              product.active === false
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                            }`}
                          >
                            {isToggling ? 'Salvando...' : product.active === false ? 'Reativar' : 'Desativar'}
                          </button>
                        </div>

                        {product.active !== false && (
                          <Link
                            href={`/product/${product.slug}`}
                            target="_blank"
                            className="text-center text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700"
                          >
                            Ver na loja
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && !error && pagination.totalPages > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm sm:flex-row">
              <p className="text-slate-500">
                Mostrando {products.length} de {pagination.total} produto(s)
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="px-2 font-medium text-slate-700">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>

      {modalOpen && (
        <ProductFormModal
          key={editingProduct?.id || 'new'}
          product={editingProduct}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSaved={(message) => {
            setModalOpen(false);
            setNotice(message);
            setReloadKey((current) => current + 1);
          }}
        />
      )}
    </>
  );
}
