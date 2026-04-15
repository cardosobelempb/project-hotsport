import 'dotenv/config'
import { z } from 'zod'
import { EnvValidationError } from './EnvValidationError'

/**
 * Esquema de validação das variáveis de ambiente.
 * Executado durante o bootstrap da aplicação.
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3333),
  DB_TYPE: z.literal('postgres').default('postgres'),
  DB_SCHEMA: z.string().default('public'),
  API_URL: z.url().default('http://localhost:3333'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),
  APP_PORT: z.coerce.number().default(8080),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().default('postgres'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  DB_DIALECT: z.string().default('postgres'),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  const error = new EnvValidationError('env')

  /**
   * Mapeia os erros do Zod para o modelo de erro da aplicação.
   */
  parsedEnv.error.issues.forEach(issue => {
    error.addFieldError(issue.path.join('.') || 'env', issue.message)
  })

  throw error.toJSON()
}

export const env = parsedEnv.data
