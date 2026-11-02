import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authenticate } from '../../middlewares/authenticate.js'
import { addressesController } from './addresses.controller.js'
import { createAddressSchema } from './addresses.schemas.js'

export async function addressesRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>()

  typedApp.addHook('onRequest', authenticate)

  typedApp.get(
    '/',
    {
      schema: {
        tags: ['Endereços'],
        summary: 'Listar endereços do usuário autenticado',
        security: [{ bearerAuth: [] }]
      }
    },
    async (request, reply) => addressesController.list(request as any, reply)
  )

  typedApp.post(
    '/',
    {
      schema: {
        tags: ['Endereços'],
        summary: 'Cadastrar novo endereço de entrega',
        security: [{ bearerAuth: [] }],
        body: createAddressSchema
      }
    },
    async (request, reply) => addressesController.create(request as any, reply)
  )

  typedApp.delete(
    '/:id',
    {
      schema: {
        tags: ['Endereços'],
        summary: 'Remover endereço do usuário',
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid()
        })
      }
    },
    async (request, reply) => addressesController.delete(request as any, reply)
  )
}
