import { z } from 'zod'

export const cepParamSchema = z.object({
  zipcode: z.string().min(8).max(9).transform(val => val.replace(/\D/g, ''))
})

export const calculateShippingItemSchema = z.object({
  productId: z.string().uuid('ID de produto inválido'),
  quantity: z.number().int().min(1, 'Quantidade mínima é 1')
})

export const calculateShippingSchema = z.object({
  zipcode: z.string().min(8).max(9).transform(val => val.replace(/\D/g, '')),
  items: z.array(calculateShippingItemSchema).min(1, 'Informe pelo menos um item para cálculo de frete')
})

export type CalculateShippingInput = z.infer<typeof calculateShippingSchema>
