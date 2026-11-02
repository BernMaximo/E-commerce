import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve conter pelo menos 2 caracteres').max(150),
  email: z.string().email('E-mail em formato inválido'),
  password: z.string().min(6, 'Senha deve conter pelo menos 6 caracteres')
})

export const loginSchema = z.object({
  email: z.string().email('E-mail em formato inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['CLIENT', 'ADMIN']),
  createdAt: z.date()
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>

