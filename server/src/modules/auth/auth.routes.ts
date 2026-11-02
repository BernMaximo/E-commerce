import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authenticate } from '../../middlewares/authenticate.js'
import { authController } from './auth.controller.js'
import { loginSchema, registerSchema } from './auth.schemas.js'

export async function authRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>()

  typedApp.post(
    '/register',
    {
      schema: {
        tags: ['Autenticação'],
        summary: 'Cadastrar novo usuário (cliente)',
        body: registerSchema
      }
    },
    async (request, reply) => authController.register(request as any, reply)
  )

  typedApp.post(
    '/login',
    {
      schema: {
        tags: ['Autenticação'],
        summary: 'Login com e-mail e senha',
        body: loginSchema
      }
    },
    async (request, reply) => authController.login(request as any, reply)
  )

  typedApp.post(
    '/refresh',
    {
      schema: {
        tags: ['Autenticação'],
        summary: 'Renovar Access Token com Refresh Token'
      }
    },
    async (request, reply) => authController.refresh(request as any, reply)
  )

  typedApp.get(
    '/me',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['Autenticação'],
        summary: 'Obter dados do usuário autenticado',
        security: [{ bearerAuth: [] }]
      }
    },
    async (request, reply) => authController.me(request as any, reply)
  )
}
