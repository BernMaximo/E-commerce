import { FormEvent, useEffect, useState } from 'react';
import { api, getErrorMessage } from '../../lib/api';
import { Category, Product } from '../../types';

type ProductFormModalProps = {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: (message: string) => void;
};

type FormState = {
  name: string;
  categoryId: string;
  slug: string;
  description: string;
  price: string;
  stock: string;
  imageUrl: string;
  weightG: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
};

function buildInitialState(product: Product | null): FormState {
  return {
    name: product?.name || '',
    categoryId: product?.categoryId || product?.category?.id || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product ? String(product.price) : '',
    stock: product ? String(product.stock) : '0',
    imageUrl: product?.imageUrl || '',
    weightG: String(product?.weightG ?? 300),
    lengthCm: String(product?.lengthCm ?? 20),
    widthCm: String(product?.widthCm ?? 15),
    heightCm: String(product?.heightCm ?? 10)
  };
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500';

export default function ProductFormModal({
  product,
  categories,
  onClose,
  onSaved
}: ProductFormModalProps) {
  const isEditing = Boolean(product);
  const [form, setForm] = useState<FormState>(() => buildInitialState(product));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('Informe o nome do produto.');
      return;
    }

    if (!form.categoryId) {
      setError('Selecione uma categoria.');
      return;
    }

    const price = Number(form.price);
    const stock = Number(form.stock);
    const weightG = Number(form.weightG);
    const lengthCm = Number(form.lengthCm);
    const widthCm = Number(form.widthCm);
    const heightCm = Number(form.heightCm);

    if (!Number.isFinite(price) || price <= 0) {
      setError('Informe um preço maior que zero.');
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError('O estoque deve ser um número inteiro maior ou igual a zero.');
      return;
    }

    if (!form.imageUrl.trim()) {
      setError('Informe a URL da imagem do produto.');
      return;
    }

    if ([weightG, lengthCm, widthCm, heightCm].some((value) => !Number.isFinite(value) || value <= 0)) {
      setError('Peso e dimensões devem ser maiores que zero.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      categoryId: form.categoryId,
      slug: form.slug.trim() || undefined,
      description: form.description.trim(),
      price,
      stock,
      imageUrl: form.imageUrl.trim(),
      weightG,
      lengthCm,
      widthCm,
      heightCm
    };

    setSaving(true);

    try {
      if (isEditing && product) {
        await api<{ product: Product }>(`/api/products/${product.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        onSaved(`Produto "${payload.name}" atualizado com sucesso.`);
      } else {
        await api<{ product: Product }>('/api/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        onSaved(`Produto "${payload.name}" cadastrado com sucesso.`);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível salvar o produto.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      onClick={() => !saving && onClose()}
    >
      <div
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5">
          <div>
            <h2 id="product-modal-title" className="text-lg font-semibold text-slate-900">
              {isEditing ? 'Editar produto' : 'Novo produto'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? 'Atualize preço, estoque, imagem e dados de frete.'
                : 'Preencha os dados para adicionar um item ao catálogo.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
            aria-label="Fechar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="product-name" className="mb-1 block text-sm font-medium text-slate-700">
                Nome <span className="text-rose-500">*</span>
              </label>
              <input
                id="product-name"
                type="text"
                required
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="Ex.: Teclado Mecânico RGB"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="product-category" className="mb-1 block text-sm font-medium text-slate-700">
                Categoria <span className="text-rose-500">*</span>
              </label>
              <select
                id="product-category"
                required
                value={form.categoryId}
                onChange={(event) => updateField('categoryId', event.target.value)}
                className={inputClass}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="mt-1 text-xs text-amber-700">
                  Nenhuma categoria disponível. Cadastre uma categoria antes de criar produtos.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="product-slug" className="mb-1 block text-sm font-medium text-slate-700">
                Slug <span className="text-xs font-normal text-slate-400">(opcional)</span>
              </label>
              <input
                id="product-slug"
                type="text"
                value={form.slug}
                onChange={(event) => updateField('slug', event.target.value)}
                placeholder="gerado automaticamente"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="product-price" className="mb-1 block text-sm font-medium text-slate-700">
                Preço (R$) <span className="text-rose-500">*</span>
              </label>
              <input
                id="product-price"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.price}
                onChange={(event) => updateField('price', event.target.value)}
                placeholder="0,00"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="product-stock" className="mb-1 block text-sm font-medium text-slate-700">
                Estoque <span className="text-rose-500">*</span>
              </label>
              <input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                required
                value={form.stock}
                onChange={(event) => updateField('stock', event.target.value)}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="product-image" className="mb-1 block text-sm font-medium text-slate-700">
                URL da imagem <span className="text-rose-500">*</span>
              </label>
              <input
                id="product-image"
                type="url"
                required
                value={form.imageUrl}
                onChange={(event) => updateField('imageUrl', event.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="product-description" className="mb-1 block text-sm font-medium text-slate-700">
                Descrição
              </label>
              <textarea
                id="product-description"
                rows={3}
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Detalhes e especificações do produto"
                className={inputClass}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Frete e embalagem</h3>
            <p className="mt-0.5 text-xs text-slate-500">Usado no cálculo de PAC e Sedex.</p>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label htmlFor="product-weight" className="mb-1 block text-xs font-medium text-slate-600">
                  Peso (g)
                </label>
                <input
                  id="product-weight"
                  type="number"
                  min="1"
                  step="1"
                  value={form.weightG}
                  onChange={(event) => updateField('weightG', event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="product-length" className="mb-1 block text-xs font-medium text-slate-600">
                  Comp. (cm)
                </label>
                <input
                  id="product-length"
                  type="number"
                  min="1"
                  step="1"
                  value={form.lengthCm}
                  onChange={(event) => updateField('lengthCm', event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="product-width" className="mb-1 block text-xs font-medium text-slate-600">
                  Larg. (cm)
                </label>
                <input
                  id="product-width"
                  type="number"
                  min="1"
                  step="1"
                  value={form.widthCm}
                  onChange={(event) => updateField('widthCm', event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="product-height" className="mb-1 block text-xs font-medium text-slate-600">
                  Alt. (cm)
                </label>
                <input
                  id="product-height"
                  type="number"
                  min="1"
                  step="1"
                  value={form.heightCm}
                  onChange={(event) => updateField('heightCm', event.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || categories.length === 0}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
