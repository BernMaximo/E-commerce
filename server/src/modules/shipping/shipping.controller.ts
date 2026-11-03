import { FastifyReply, FastifyRequest } from 'fastify'
import { CalculateShippingInput } from './shipping.schemas.js'
import { shippingService } from './shipping.service.js'

export class ShippingController {
  async getAddress(request: FastifyRequest<{ Params: { zipcode: string } }>, reply: FastifyReply) {
    try {
      const { zipcode } = request.params
      const address = await shippingService.getAddressByCep(zipcode)
      return reply.status(200).send({ address })
    } catch (err: any) {
      return reply.status(400).send({ message: err.message || 'Erro ao consultar CEP.' })
    }
  }

  async calculate(request: FastifyRequest<{ Body: CalculateShippingInput }>, reply: FastifyReply) {
    try {
      const calculation = await shippingService.calculateShipping(request.body)
      return reply.status(200).send(calculation)
    } catch (err: any) {
      return reply.status(400).send({ message: err.message || 'Erro ao calcular frete.' })
    }
  }
}

export const shippingController = new ShippingController()

