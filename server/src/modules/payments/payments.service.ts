import { env } from '../../config/env.js'
import { prisma } from '../../lib/prisma.js'
import { CardPaymentInput } from './payments.schemas.js'

export class PaymentsService {
  private isConfigured(): boolean {
    return !!env.MERCADOPAGO_ACCESS_TOKEN && env.MERCADOPAGO_ACCESS_TOKEN.trim().length > 10
  }

  async generatePixForOrder(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        payment: true,
        items: true
      }
    })

    if (!order) {
      throw new Error('Pedido não encontrado.')
    }

    if (order.userId !== userId) {
      throw new Error('Acesso não autorizado a este pedido.')
    }

    if (order.status === 'PAID') {
      throw new Error('Este pedido já foi pago.')
    }

    if (order.status === 'CANCELED') {
      throw new Error('Este pedido foi cancelado e não pode receber pagamentos.')
    }

    // Se já gerou Pix anteriormente e ainda está pendente, reutiliza
    if (order.payment?.qrCodePix && order.payment?.status === 'PENDING') {
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: Number(order.total),
        paymentMethod: 'PIX',
        status: order.payment.status,
        qrCodePix: order.payment.qrCodePix,
        qrCodePixUrl: order.payment.qrCodePixUrl,
        expiresAt: new Date(order.createdAt.getTime() + 30 * 60 * 1000).toISOString()
      }
    }

    let transactionId = `MOCK-PIX-${Date.now()}`
    let qrCodePix = `00020126580014br.gov.bcb.pix0136${order.id}520400005303986540${order.total.toFixed(2)}5802BR5916ECOMMERCE BRASIL6009SAO PAULO62070503***6304`
    let qrCodePixUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodePix)}`
    let rawResponse: any = { simulated: true }

    // Se o usuário tiver configurado o token real de sandbox do Mercado Pago
    if (this.isConfigured()) {
      try {
        const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': `pix-${order.id}`
          },
          body: JSON.stringify({
            transaction_amount: Number(order.total),
            description: `Pedido ${order.orderNumber}`,
            payment_method_id: 'pix',
            external_reference: order.id,
            payer: {
              email: order.user.email,
              first_name: order.user.name.split(' ')[0],
              last_name: order.user.name.split(' ').slice(1).join(' ') || 'Cliente'
            }
          })
        })

        if (mpResponse.ok) {
          const mpData = await mpResponse.json()
          transactionId = String(mpData.id)
          qrCodePix = mpData.point_of_interaction?.transaction_data?.qr_code || qrCodePix
          qrCodePixUrl =
            mpData.point_of_interaction?.transaction_data?.qr_code_base64
              ? `data:image/png;base64,${mpData.point_of_interaction.transaction_data.qr_code_base64}`
              : qrCodePixUrl
          rawResponse = mpData
        }
      } catch (err) {
        console.warn('⚠️ Falha ao conectar à API do Mercado Pago. Usando simulação Sandbox:', err)
      }
    }

    // Salva ou atualiza os dados na tabela payments
    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        paymentMethod: 'PIX',
        status: 'PENDING',
        transactionId,
        qrCodePix,
        qrCodePixUrl,
        rawResponse
      },
      create: {
        orderId: order.id,
        paymentMethod: 'PIX',
        status: 'PENDING',
        transactionId,
        qrCodePix,
        qrCodePixUrl,
        rawResponse
      }
    })

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: Number(order.total),
      paymentMethod: 'PIX',
      status: 'PENDING',
      qrCodePix,
      qrCodePixUrl,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    }
  }

  async processCardPayment(orderId: string, userId: string, cardData: CardPaymentInput) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        payment: true,
        items: true
      }
    })

    if (!order) {
      throw new Error('Pedido não encontrado.')
    }

    if (order.userId !== userId) {
      throw new Error('Acesso não autorizado a este pedido.')
    }

    if (order.status === 'PAID') {
      throw new Error('Este pedido já foi pago.')
    }

    let isApproved = true
    let transactionId = `CARD-${Date.now()}`
    let rawResponse: any = { simulated: true }

    if (this.isConfigured()) {
      try {
        const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': `card-${order.id}`
          },
          body: JSON.stringify({
            token: cardData.token,
            transaction_amount: Number(order.total),
            installments: cardData.installments,
            payment_method_id: cardData.paymentMethodId,
            issuer_id: cardData.issuerId,
            external_reference: order.id,
            payer: cardData.payer
          })
        })

        const mpData = await mpResponse.json()
        rawResponse = mpData
        transactionId = String(mpData.id || transactionId)
        isApproved = mpData.status === 'approved'
      } catch (err) {
        console.warn('⚠️ Falha ao comunicar com gateway de cartão. Simulando aprovação em Sandbox:', err)
      }
    }

    if (isApproved) {
      await prisma.$transaction(async (tx) => {
        await tx.payment.upsert({
          where: { orderId: order.id },
          update: {
            paymentMethod: 'CREDIT_CARD',
            status: 'APPROVED',
            transactionId,
            paidAt: new Date(),
            rawResponse
          },
          create: {
            orderId: order.id,
            paymentMethod: 'CREDIT_CARD',
            status: 'APPROVED',
            transactionId,
            paidAt: new Date(),
            rawResponse
          }
        })

        await tx.order.update({
          where: { id: order.id },
          data: { status: 'PAID' }
        })
      })

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: 'PAID',
        paymentStatus: 'APPROVED',
        transactionId,
        message: 'Pagamento aprovado com sucesso!'
      }
    } else {
      // Se recusado, cancela o pedido e restaura o estoque
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          })
        }

        await tx.payment.upsert({
          where: { orderId: order.id },
          update: {
            paymentMethod: 'CREDIT_CARD',
            status: 'REJECTED',
            transactionId,
            rawResponse
          },
          create: {
            orderId: order.id,
            paymentMethod: 'CREDIT_CARD',
            status: 'REJECTED',
            transactionId,
            rawResponse
          }
        })

        await tx.order.update({
          where: { id: order.id },
          data: { status: 'CANCELED' }
        })
      })

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: 'CANCELED',
        paymentStatus: 'REJECTED',
        transactionId,
        message: 'Pagamento recusado pela operadora do cartão. O estoque foi liberado.'
      }
    }
  }

  async processWebhook(notification: any) {
    const paymentId = notification.data?.id || notification.id

    if (!paymentId) {
      return { received: true, action: 'ignored_no_id' }
    }

    let paymentData: any = null

    if (this.isConfigured()) {
      try {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`
          }
        })
        if (response.ok) {
          paymentData = await response.json()
        }
      } catch (err) {
        console.error('Erro ao consultar status no webhook Mercado Pago:', err)
      }
    } else {
      // Simulação para testes locais
      paymentData = {
        id: paymentId,
        status: notification.status || 'approved',
        external_reference: notification.external_reference
      }
    }

    if (!paymentData || !paymentData.external_reference) {
      return { received: true, action: 'skipped_no_external_reference' }
    }

    const orderId = paymentData.external_reference
    const mpStatus = paymentData.status

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true, items: true }
    })

    if (!order) {
      return { received: true, action: 'order_not_found' }
    }

    // Idempotência: Se já foi aprovado e o webhook notificar de novo, ignora
    if (order.status === 'PAID' && mpStatus === 'approved') {
      return { received: true, action: 'already_paid_idempotent' }
    }

    if (mpStatus === 'approved') {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { orderId: order.id },
          data: {
            status: 'APPROVED',
            paidAt: new Date(),
            transactionId: String(paymentId)
          }
        })

        await tx.order.update({
          where: { id: order.id },
          data: { status: 'PAID' }
        })
      })
      return { received: true, action: 'order_marked_as_paid' }
    } else if (mpStatus === 'cancelled' || mpStatus === 'rejected') {
      if (order.status !== 'CANCELED') {
        await prisma.$transaction(async (tx) => {
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } }
            })
          }

          await tx.payment.update({
            where: { orderId: order.id },
            data: {
              status: 'REJECTED',
              transactionId: String(paymentId)
            }
          })

          await tx.order.update({
            where: { id: order.id },
            data: { status: 'CANCELED' }
          })
        })
      }
      return { received: true, action: 'order_canceled_stock_replenished' }
    }

    return { received: true, action: 'status_unhandled', status: mpStatus }
  }
}

export const paymentsService = new PaymentsService()
