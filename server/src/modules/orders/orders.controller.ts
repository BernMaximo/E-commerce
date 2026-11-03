import { Prisma } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.js'
import { CreateOrderInput, ListAllOrdersQuery, UpdateOrderStatusInput } from './orders.schemas.js'

export class OrdersController {
  async create(request: FastifyRequest<{ Body: CreateOrderInput }>, reply: FastifyReply) {
    const userId = request.user.sub
    const { addressId, shippingCost, paymentMethod, items } = request.body

    try {
      // Executa toda a reserva de estoque e criação em transação atômica isolada
      const createdOrder = await prisma.$transaction(async (tx) => {
        // 1. Valida endereço
        const address = await tx.address.findFirst({
          where: { id: addressId, userId }
        })

        if (!address) {
          throw new Error('Endereço de entrega não encontrado ou não pertence a este usuário.')
        }

        let calculatedSubtotal = new Prisma.Decimal(0)
        const orderItemsData = []

        // 2. Itera sobre cada item para validar estoque e debitar
        for (const item of items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          })

          if (!product || !product.active) {
            throw new Error(`Produto não encontrado ou desativado: ${item.productId}`)
          }

          if (product.stock < item.quantity) {
            throw new Error(
              `Estoque insuficiente para o produto "${product.name}". Disponível: ${product.stock}, solicitado: ${item.quantity}.`
            )
          }

          // Debita o estoque de forma segura
          await tx.product.update({
            where: { id: product.id },
            data: {
              stock: { decrement: item.quantity }
            }
          })

          const itemSubtotal = product.price.mul(item.quantity)
          calculatedSubtotal = calculatedSubtotal.add(itemSubtotal)

          // Snapshot do produto gravado no item
          orderItemsData.push({
            productId: product.id,
            productName: product.name,
            quantity: item.quantity,
            unitPrice: product.price,
            subtotal: itemSubtotal
          })
        }

        const shippingDecimal = new Prisma.Decimal(shippingCost)
        const calculatedTotal = calculatedSubtotal.add(shippingDecimal)
        const orderNumber = `PED-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`

        // 3. Cria o pedido
        const order = await tx.order.create({
          data: {
            orderNumber,
            userId,
            addressId,
            status: 'PENDING',
            subtotal: calculatedSubtotal,
            shippingCost: shippingDecimal,
            total: calculatedTotal,
            items: {
              create: orderItemsData
            },
            payment: {
              create: {
                paymentMethod,
                status: 'PENDING'
              }
            }
          },
          include: {
            items: true,
            payment: true,
            address: true
          }
        })

        return order
      })

      return reply.status(201).send({ order: createdOrder })
    } catch (err: any) {
      return reply.status(400).send({
        message: err.message || 'Erro ao processar criação do pedido.'
      })
    }
  }

  async listMyOrders(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        payment: {
          select: {
            paymentMethod: true,
            status: true,
            qrCodePix: true,
            qrCodePixUrl: true,
            paidAt: true
          }
        },
        address: true
      }
    })

    return reply.status(200).send({ orders })
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.user.sub
    const userRole = request.user.role
    const { id } = request.params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payment: true,
        address: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!order) {
      return reply.status(404).send({ message: 'Pedido não encontrado.' })
    }

    // Permite visualização apenas do próprio dono ou de um ADMIN
    if (order.userId !== userId && userRole !== 'ADMIN') {
      return reply.status(403).send({ message: 'Acesso não autorizado a este pedido.' })
    }

    return reply.status(200).send({ order })
  }

  async listAll(request: FastifyRequest<{ Querystring: ListAllOrdersQuery }>, reply: FastifyReply) {
    const { status, search, page, limit } = request.query

    const where: Prisma.OrderWhereInput = {}
    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ]
    }

    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          items: true,
          payment: true,
          address: true,
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.order.count({ where })
    ])

    return reply.status(200).send({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  }

  async updateStatus(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateOrderStatusInput }>,
    reply: FastifyReply
  ) {
    const { id } = request.params
    const { status, trackingCode } = request.body

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    })

    if (!existingOrder) {
      return reply.status(404).send({ message: 'Pedido não encontrado.' })
    }

    // Se o pedido estiver sendo cancelado e antes não estava cancelado, restaura o estoque
    if (status === 'CANCELED' && existingOrder.status !== 'CANCELED') {
      await prisma.$transaction(async (tx) => {
        for (const item of existingOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity }
            }
          })
        }

        await tx.order.update({
          where: { id },
          data: {
            status,
            trackingCode: trackingCode || existingOrder.trackingCode
          }
        })
      })
    } else {
      await prisma.order.update({
        where: { id },
        data: {
          status,
          trackingCode: trackingCode || existingOrder.trackingCode
        }
      })
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true, payment: true }
    })

    return reply.status(200).send({ order: updatedOrder })
  }
}

export const ordersController = new OrdersController()

