import { FastifyReply, FastifyRequest } from 'fastify'

export function requireRole(role: 'ADMIN' | 'CLIENT') {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user

    if (!user || user.role !== role) {
      return reply.status(403).send({
        message: 'Acesso negado. Permissão insuficiente para executar esta ação.'
      })
    }
  }
}

