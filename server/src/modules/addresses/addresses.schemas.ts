import { z } from 'zod'

export const createAddressSchema = z.object({
  recipientName: z.string().min(2, 'Nome do destinatário obrigatório').max(150),
  zipcode: z.string().min(8).max(9),
  street: z.string().min(2).max(255),
  number: z.string().min(1).max(20),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  state: z.string().length(2, 'UF deve conter 2 letras'),
  isDefault: z.boolean().default(false)
})

export type CreateAddressInput = z.infer<typeof createAddressSchema>

