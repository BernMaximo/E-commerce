import { FastifyReply, FastifyRequest } from 'fastify'
import { CardPaymentInput } from './payments.schemas.js'
import { paymentsService } from './payments.service.js'

export class PaymentsController {
  async generatePix(request: FastifyRequest<{ Params: { orderId: string } }>, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const { orderId } = request.params

      const pixData = await paymentsService.generatePixForOrder(orderId, userId)
      return reply.status(200).send(pixData)
    } catch (err: any) {
      return reply.status(400).send({ message: err.message || 'Erro ao gerar Pix.' })
    }
  }

  async payWithCard(
    request: FastifyRequest<{ Params: { orderId: string }; Body: CardPaymentInput }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user.sub
      const { orderId } = request.params

      const result = await paymentsService.processCardPayment(orderId, userId, request.body)
      return reply.status(200).send(result)
    } catch (err: any) {
      return reply.status(400).send({ message: err.message || 'Erro ao processar cartão.' })
    }
  }

  async handleWebhook(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body || {}
      const query = (request.query as any) || {}
      const notification = { ...body, ...query }

      // Responde HTTP 200 OK imediatamente para o Mercado Pago não reenviar
      reply.status(200).send({ received: true })

      // Processa a notificação assincronamente
      await paymentsService.processWebhook(notification)
    } catch (err) {
      console.error('Erro ao processar webhook Mercado Pago:', err)
      // Mesmo com erro interno, responde 200 para evitar loops infinitos do webhook
      return reply.status(200).send({ received: true, error: true })
    }
  }
}

export const paymentsController = new PaymentsController()
