import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma.js'
import { CreateAddressInput } from './addresses.schemas.js'

export class AddressesController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.sub

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    })

    return reply.status(200).send({ addresses })
  }

  async create(request: FastifyRequest<{ Body: CreateAddressInput }>, reply: FastifyReply) {
    const userId = request.user.sub
    const data = request.body

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      })
    }

    const address = await prisma.address.create({
      data: {
        userId,
        recipientName: data.recipientName,
        zipcode: data.zipcode,
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state.toUpperCase(),
        isDefault: data.isDefault
      }
    })

    return reply.status(201).send({ address })
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userId = request.user.sub
    const { id } = request.params

    const existingAddress = await prisma.address.findFirst({
      where: { id, userId }
    })

    if (!existingAddress) {
      return reply.status(404).send({ message: 'Endereço não encontrado ou não pertence a este usuário.' })
    }

    await prisma.address.delete({
      where: { id }
    })

    return reply.status(204).send()
  }
}

export const addressesController = new AddressesController()

