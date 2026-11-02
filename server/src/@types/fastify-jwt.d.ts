import '@fastify/jwt'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      sub: string
      role: 'CLIENT' | 'ADMIN'
      email: string
      name: string
    }
  }
}

