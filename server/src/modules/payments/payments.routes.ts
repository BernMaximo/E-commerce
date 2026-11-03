import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authenticate } from '../../middlewares/authenticate.js'
import { paymentsController } from './payments.controller.js'
import { cardPaymentBodySchema, orderIdParamSchema } from './payments.schemas.js'

export async function paymentsRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>()

  // Gerar QR Code Pix para um pedido
  typedApp.post(
    '/orders/:orderId/pix',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Pagamentos (Mercado Pago)'],
        summary: 'Gerar QR Code Pix e Copia-e-Cola para pagamento de um pedido pendente',
        security: [{ bearerAuth: [] }],
        params: orderIdParamSchema
      }
    },
    async (request, reply) => paymentsController.generatePix(request as any, reply)
  )

  // Processar pagamento com Cartão de Crédito
  typedApp.post(
    '/orders/:orderId/card',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Pagamentos (Mercado Pago)'],
        summary: 'Processar pagamento de pedido via Cartão de Crédito tokenizado',
        security: [{ bearerAuth: [] }],
        params: orderIdParamSchema,
        body: cardPaymentBodySchema
      }
    },
    async (request, reply) => paymentsController.payWithCard(request as any, reply)
  )
}

export async function webhookRoutes(app: FastifyInstance) {
  // Webhook público do Mercado Pago
  app.post(
    '/mercadopago',
    {
      schema: {
        tags: ['Webhooks'],
        summary: 'Endpoint receptor de notificações assíncronas do Mercado Pago'
      }
    },
    paymentsController.handleWebhook
  )
}

