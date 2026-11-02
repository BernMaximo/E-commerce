import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authenticate } from '../../middlewares/authenticate.js'
import { requireRole } from '../../middlewares/require-role.js'
import { categoriesController } from './categories.controller.js'
import { createCategorySchema } from './categories.schemas.js'

export async function categoriesRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>()

  // Rota pública: listar categorias
  typedApp.get(
    '/',
    {
      schema: {
        tags: ['Categorias'],
        summary: 'Listar categorias ativas no catálogo'
      }
    },
    async (request, reply) => categoriesController.list(request as any, reply)
  )

  // Rota administrativa: criar categoria
  typedApp.post(
    '/',
    {
      onRequest: [authenticate, requireRole('ADMIN')],
      schema: {
        tags: ['Categorias'],
        summary: 'Cadastrar nova categoria (Requer perfil ADMIN)',
        security: [{ bearerAuth: [] }],
        body: createCategorySchema
      }
    },
    async (request, reply) => categoriesController.create(request as any, reply)
  )
}
