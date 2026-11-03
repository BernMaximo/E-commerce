import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { shippingController } from './shipping.controller.js'
import { calculateShippingSchema, cepParamSchema } from './shipping.schemas.js'

export async function shippingRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>()

  // Consulta de CEP para preenchimento automático de endereço
  typedApp.get(
    '/cep/:zipcode',
    {
      schema: {
        tags: ['Logística e Frete'],
        summary: 'Consultar endereço por CEP (ViaCEP)',
        params: cepParamSchema
      }
    },
    async (request, reply) => shippingController.getAddress(request as any, reply)
  )

  // Cotação de frete para o carrinho
  typedApp.post(
    '/calculate',
    {
      schema: {
        tags: ['Logística e Frete'],
        summary: 'Calcular opções de frete (PAC e Sedex) a partir de CEP e produtos',
        body: calculateShippingSchema
      }
    },
    async (request, reply) => shippingController.calculate(request as any, reply)
  )
}

