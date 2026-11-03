import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authenticate } from '../../middlewares/authenticate.js'
import { requireRole } from '../../middlewares/require-role.js'
import { adminController } from './admin.controller.js'

export async function adminRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>()

  typedApp.get(
    '/stats',
    {
      onRequest: [authenticate, requireRole('ADMIN')],
      schema: {
        tags: ['Admin'],
        summary: 'Obter indicadores e resumo do painel administrativo (Admin)',
        security: [{ bearerAuth: [] }]
      }
    },
    async (request, reply) => adminController.stats(request as any, reply)
  )
}
