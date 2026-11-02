import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Nome deve conter pelo menos 2 caracteres').max(100),
  slug: z.string().min(2).max(120).optional()
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>

