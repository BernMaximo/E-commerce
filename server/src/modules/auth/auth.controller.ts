import { FastifyReply, FastifyRequest } from 'fastify'
import { LoginInput, RegisterInput } from './auth.schemas.js'
import { authService } from './auth.service.js'

export class AuthController {
  async register(request: FastifyRequest<{ Body: RegisterInput }>, reply: FastifyReply) {
    try {
      const user = await authService.register(request.body)

      const token = await reply.jwtSign(
        { role: user.role, email: user.email, name: user.name },
        { sign: { sub: user.id, expiresIn: '15m' } }
      )

      const refreshToken = await reply.jwtSign(
        { role: user.role, email: user.email, name: user.name },
        { sign: { sub: user.id, expiresIn: '7d' } }
      )

      return reply.status(201).send({
        user,
        token,
        refreshToken
      })
    } catch (err: any) {
      return reply.status(400).send({ message: err.message || 'Erro ao registrar usuário.' })
    }
  }

  async login(request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) {
    try {
      const user = await authService.validateUserCredentials(request.body)

      const token = await reply.jwtSign(
        { role: user.role, email: user.email, name: user.name },
        { sign: { sub: user.id, expiresIn: '15m' } }
      )

      const refreshToken = await reply.jwtSign(
        { role: user.role, email: user.email, name: user.name },
        { sign: { sub: user.id, expiresIn: '7d' } }
      )

      return reply.status(200).send({
        user,
        token,
        refreshToken
      })
    } catch (err: any) {
      return reply.status(401).send({ message: err.message || 'Credenciais inválidas.' })
    }
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify({ onlyCookie: false })

      const user = request.user

      const newToken = await reply.jwtSign(
        { role: user.role, email: user.email, name: user.name },
        { sign: { sub: user.sub, expiresIn: '15m' } }
      )

      const newRefreshToken = await reply.jwtSign(
        { role: user.role, email: user.email, name: user.name },
        { sign: { sub: user.sub, expiresIn: '7d' } }
      )

      return reply.status(200).send({
        token: newToken,
        refreshToken: newRefreshToken
      })
    } catch {
      return reply.status(401).send({ message: 'Refresh token inválido ou expirado.' })
    }
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.sub
      const user = await authService.getUserById(userId)

      return reply.status(200).send({ user })
    } catch (err: any) {
      return reply.status(404).send({ message: err.message || 'Usuário não encontrado.' })
    }
  }
}

export const authController = new AuthController()

