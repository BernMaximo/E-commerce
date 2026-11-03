import { z } from 'zod'

export const orderIdParamSchema = z.object({
  orderId: z.string().uuid('ID de pedido inválido')
})

export const cardPaymentBodySchema = z.object({
  token: z.string().min(1, 'Token do cartão de crédito obrigatório'),
  installments: z.number().int().min(1).max(12).default(1),
  paymentMethodId: z.string().min(1, 'Identificador da bandeira obrigatório (ex: visa, master)'),
  issuerId: z.string().optional(),
  payer: z.object({
    email: z.string().email('E-mail do pagador inválido'),
    identification: z.object({
      type: z.string().default('CPF'),
      number: z.string().min(11, 'Número do documento obrigatório')
    })
  })
})

export const webhookQuerySchema = z.object({
  id: z.string().optional(),
  topic: z.string().optional(),
  type: z.string().optional(),
  'data.id': z.string().optional()
})

export type CardPaymentInput = z.infer<typeof cardPaymentBodySchema>
export type WebhookQuery = z.infer<typeof webhookQuerySchema>

