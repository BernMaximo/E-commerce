import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3333),
  JWT_SECRET: z.string().min(16).default('ecommerce_secret_jwt_key_development_2026_super_safe'),
  DATABASE_URL: z.string().url().default('postgresql://postgres:postgres@localhost:5432/ecommerce?schema=public'),
  MERCADOPAGO_ACCESS_TOKEN: z.string().optional().default('')
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('❌ Configuração inválida de variáveis de ambiente:', _env.error.format())
  throw new Error('Configuração inválida de variáveis de ambiente.')
}

export const env = _env.data
