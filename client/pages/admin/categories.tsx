import { FormEvent, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { api, getErrorMessage } from '../../lib/api';
import { Category } from '../../types';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api<{ categories: Category[] }>('/api/categories');
        if (!cancelled) setCategories(response.categories || []);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Erro ao carregar as categorias.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (name.trim().length < 2) {
      setFormError('O nome da categoria deve ter pelo menos 2 caracteres.');
      return;
    }

    setSaving(true);

    try {
      await api<{ category: Category }>('/api/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || undefined
        })
      });

      setNotice(`Categoria "${name.trim()}" criada com sucesso.`);
      setName('');
      setSlug('');
      setReloadKey((current) => current + 1);
    } catch (err) {
      setFormError(getErrorMessage(err, 'Não foi possível criar a categoria.'));
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = categories.filter((category) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;

    return (
      category.name.toLowerCase().includes(term) || category.slug.toLowerCase().includes(term)
    );
  });

  const totalProducts = categories.reduce(
    (sum, category) => sum + (category._count?.products || 0),
    0
  );

  return (
    <>
      <Head>
        <title>Categorias Admin - TechStore</title>
      </Head>

      <AdminLayout
        title="Categorias"
        description="Organize o catálogo criando categorias para agrupar seus produtos."
        actions={
          <Link
            href="/admin/products"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Novo produto
          </Link>
        }
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-base font-semibold text-slate-900">Nova categoria</h2>
            <p className="mt-1 text-sm text-slate-500">
              A categoria ficará disponível imediatamente no catálogo.
            </p>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label htmlFor="category-name" className="mb-1 block text-sm font-medium text-slate-700">
                  Nome <span className="text-rose-500">*</span>
                </label>
                <input
                  id="category-name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ex.: Periféricos"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="category-slug" className="mb-1 block text-sm font-medium text-slate-700">
                  Slug <span className="text-xs font-normal text-slate-400">(opcional)</span>
                </label>
                <input
                  id="category-slug"
                  type="text"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  placeholder="gerado automaticamente"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {formError && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? 'Criando...' : 'Criar categoria'}
              </button>
            </form>

            <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-200 pt-4 text-center">
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-lg font-bold text-slate-900">{categories.length}</p>
                <p className="text-xs text-slate-500">Categorias</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-lg font-bold text-slate-900">{totalProducts}</p>
                <p className="text-xs text-slate-500">Produtos ativos</p>
              </div>
            </div>
          </section>

          <section className="min-w-0 space-y-4">
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

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="relative">
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
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Filtrar categorias por nome ou slug"
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" />
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
            ) : filteredCategories.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-sm text-slate-500">
                  {search ? 'Nenhuma categoria corresponde ao filtro.' : 'Nenhuma categoria cadastrada ainda.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredCategories.map((category) => {
                  const productCount = category._count?.products || 0;

                  return (
                    <article
                      key={category.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate text-base font-semibold text-slate-900">{category.name}</h2>
                          <p className="mt-0.5 truncate font-mono text-xs text-slate-400">/{category.slug}</p>
                        </div>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                            />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                          </svg>
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          {productCount} produto(s) ativo(s)
                        </span>
                        <Link
                          href={`/category/${category.slug}`}
                          target="_blank"
                          className="text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700"
                        >
                          Ver na loja
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </AdminLayout>
    </>
  );
}
