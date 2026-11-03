import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authenticate } from '../../middlewares/authenticate.js'
import { requireRole } from '../../middlewares/require-role.js'
import { productsController } from './products.controller.js'
import {
  createProductSchema,
  listAllProductsQuerySchema,
  listProductsQuerySchema,
  updateProductSchema
} from './products.schemas.js'

export async function productsRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>()

  // Rota pública: listar produtos com filtros e busca
  typedApp.get(
    '/',
    {
      schema: {
        tags: ['Produtos'],
        summary: 'Listar produtos com filtros por categoria, busca e preço',
        querystring: listProductsQuerySchema
      }
    },
    async (request, reply) => productsController.list(request as any, reply)
  )

  // Rota admin: listar todos os produtos (inclusive inativos)
  typedApp.get(
    '/admin/all',
    {
      onRequest: [authenticate, requireRole('ADMIN')],
      schema: {
        tags: ['Produtos'],
        summary: 'Listar todos os produtos, inclusive inativos (Admin)',
        security: [{ bearerAuth: [] }],
        querystring: listAllProductsQuerySchema
      }
    },
    async (request, reply) => productsController.listAll(request as any, reply)
  )

  // Rota pública: obter produto por slug
  typedApp.get(
    '/:slug',
    {
      schema: {
        tags: ['Produtos'],
        summary: 'Obter detalhes de um produto pelo slug',
        params: z.object({
          slug: z.string()
        })
      }
    },
    async (request, reply) => productsController.getBySlug(request as any, reply)
  )

  // Rota admin: cadastrar produto
  typedApp.post(
    '/',
    {
      onRequest: [authenticate, requireRole('ADMIN')],
      schema: {
        tags: ['Produtos'],
        summary: 'Cadastrar novo produto (Admin)',
        security: [{ bearerAuth: [] }],
        body: createProductSchema
      }
    },
    async (request, reply) => productsController.create(request as any, reply)
  )

  // Rota admin: atualizar produto
  typedApp.put(
    '/:id',
    {
      onRequest: [authenticate, requireRole('ADMIN')],
      schema: {
        tags: ['Produtos'],
        summary: 'Atualizar informações, preço e estoque do produto (Admin)',
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid()
        }),
        body: updateProductSchema
      }
    },
    async (request, reply) => productsController.update(request as any, reply)
  )

  // Rota admin: desativar produto (soft delete)
  typedApp.delete(
    '/:id',
    {
      onRequest: [authenticate, requireRole('ADMIN')],
      schema: {
        tags: ['Produtos'],
        summary: 'Desativar produto no catálogo (Admin)',
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid()
        })
      }
    },
    async (request, reply) => productsController.delete(request as any, reply)
  )
}
