import { z } from 'zod'

export const listProductsQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(), // slug da categoria
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
  sort: z.enum(['price_asc', 'price_desc', 'newest']).default('newest')
})

export const createProductSchema = z.object({
  categoryId: z.string().uuid('ID de categoria inválido'),
  name: z.string().min(2, 'Nome do produto deve ter pelo menos 2 caracteres').max(255),
  slug: z.string().min(2).max(280).optional(),
  description: z.string().optional(),
  price: z.number().min(0.01, 'Preço deve ser maior que zero'),
  stock: z.number().int().min(0, 'Estoque não pode ser negativo'),
  imageUrl: z.string().url('URL da imagem inválida'),
  weightG: z.number().int().min(1).default(300),
  lengthCm: z.number().int().min(1).default(20),
  widthCm: z.number().int().min(1).default(15),
  heightCm: z.number().int().min(1).default(10)
})

export const updateProductSchema = createProductSchema.partial().extend({
  active: z.boolean().optional()
})

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>

