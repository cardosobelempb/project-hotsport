import type { FastifyReply, FastifyRequest } from 'fastify';
import { type z } from 'zod';

import { signJwt } from '../../../auth/jwt.js';
import { AppError, UnauthorizedError } from '../../../errors/index.js';
import { LoginSchema } from '../../../schemas/index.js';
import { AdminLoginUseCase } from '../../application/usecases/admin-login.usecase.js';
import { AdminPrismaRepository } from '../repositories/admin.prisma.repository.js';

type LoginBody = z.infer<typeof LoginSchema>;

export const adminLoginController = async (
  request: FastifyRequest<{ Body: LoginBody }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const repository = new AdminPrismaRepository();
    const useCase = new AdminLoginUseCase(repository);
    const result = await useCase.execute(request.body);
    const token = signJwt({ sub: String(result.id), role: 'admin' });
    await reply.status(200).send({ token });
  } catch (error) {
    request.log.error(error);
    if (error instanceof UnauthorizedError) {
      await reply.status(401).send({ error: error.message, code: error.code });
      return;
    }
    if (error instanceof AppError) {
      await reply.status(error.statusCode).send({ error: error.message, code: error.code });
      return;
    }
    await reply.status(500).send({ error: 'Erro interno no servidor', code: 'INTERNAL_SERVER_ERROR' });
  }
};
