import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider
} from 'fastify-type-provider-zod'
import { env } from './config/env.js'
import { appRoutes } from './routes.js'

export const app = fastify({
  logger: true
}).withTypeProvider<ZodTypeProvider>()

// Compiladores Zod
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Plugins essenciais
await app.register(fastifyCors, {
  origin: true,
  credentials: true
})

await app.register(fastifyCookie)

await app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'refreshToken',
    signed: false
  }
})

// Documentação Swagger / OpenAPI
await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'E-Commerce REST API',
      description: 'API para portfólio de E-commerce com Fastify, Prisma e PostgreSQL',
      version: '1.0.0'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token JWT gerado no endpoint /api/auth/login'
        }
      }
    }
  },
  transform: jsonSchemaTransform
})

await app.register(fastifySwaggerUi, {
  routePrefix: '/docs'
})

// Registro de todas as rotas
await app.register(appRoutes)

// Inicialização do servidor
const start = async () => {
  try {
    const address = await app.listen({ port: env.PORT, host: '0.0.0.0' })
    console.log(`🚀 Servidor HTTP rodando em: ${address}`)
    console.log(`📚 Documentação Swagger disponível em: ${address}/docs`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

if (process.env.NODE_ENV !== 'test') {
  start()
}

