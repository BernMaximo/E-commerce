import { z } from 'zod'

export const createOrderItemSchema = z.object({
  productId: z.string().uuid('ID de produto inválido'),
  quantity: z.number().int().min(1, 'Quantidade mínima é 1')
})

export const createOrderSchema = z.object({
  addressId: z.string().uuid('ID de endereço inválido'),
  shippingCost: z.number().min(0).default(0),
  paymentMethod: z.enum(['PIX', 'CREDIT_CARD']).default('PIX'),
  items: z.array(createOrderItemSchema).min(1, 'O pedido deve conter pelo menos 1 item')
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELED']),
  trackingCode: z.string().max(60).optional()
})

export const listAllOrdersQuerySchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELED']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(15)
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type ListAllOrdersQuery = z.infer<typeof listAllOrdersQuerySchema>

