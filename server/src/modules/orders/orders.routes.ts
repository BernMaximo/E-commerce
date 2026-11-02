import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authenticate } from '../../middlewares/authenticate.js'
import { requireRole } from '../../middlewares/require-role.js'
import { ordersController } from './orders.controller.js'
import { createOrderSchema, listAllOrdersQuerySchema, updateOrderStatusSchema } from './orders.schemas.js'

export async function ordersRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>()

  // Todas as rotas de pedidos exigem autenticação
  typedApp.addHook('onRequest', authenticate)

  // Criar pedido (Cliente)
  typedApp.post(
    '/',
    {
      schema: {
        tags: ['Pedidos'],
        summary: 'Criar novo pedido a partir do carrinho com reserva atômica de estoque',
        security: [{ bearerAuth: [] }],
        body: createOrderSchema
      }
    },
    async (request, reply) => ordersController.create(request as any, reply)
  )

  // Listar pedidos do cliente logado
  typedApp.get(
    '/my',
    {
      schema: {
        tags: ['Pedidos'],
        summary: 'Listar histórico de pedidos do usuário autenticado',
        security: [{ bearerAuth: [] }]
      }
    },
    async (request, reply) => ordersController.listMyOrders(request as any, reply)
  )

  // Obter detalhes de um pedido
  typedApp.get(
    '/:id',
    {
      schema: {
        tags: ['Pedidos'],
        summary: 'Obter detalhes de um pedido específico',
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid()
        })
      }
    },
    async (request, reply) => ordersController.getById(request as any, reply)
  )

  // Listar todos os pedidos da loja (Admin)
  typedApp.get(
    '/admin/all',
    {
      onRequest: [requireRole('ADMIN')],
      schema: {
        tags: ['Pedidos'],
        summary: 'Listar todos os pedidos da loja (Admin)',
        security: [{ bearerAuth: [] }],
        querystring: listAllOrdersQuerySchema
      }
    },
    async (request, reply) => ordersController.listAll(request as any, reply)
  )

  // Atualizar status e código de rastreamento (Admin)
  typedApp.patch(
    '/:id/status',
    {
      onRequest: [requireRole('ADMIN')],
      schema: {
        tags: ['Pedidos'],
        summary: 'Atualizar status do pedido e código de rastreamento (Admin)',
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid()
        }),
        body: updateOrderStatusSchema
      }
    },
    async (request, reply) => ordersController.updateStatus(request as any, reply)
  )
}
