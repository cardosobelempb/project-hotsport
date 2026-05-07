import { Controller } from "@/common/shared/http/decorators/controller.decorator";
import { Post } from "@/common/shared/http/decorators/route.decorator";
import { Validate } from "@/common/shared/http/decorators/validate.decorator";

import type { FastifyReply, FastifyRequest } from "fastify";
import { CreateMikrotikDto } from "../../../application/dto/mikrotik.dto";
import {
  CreateMikrotikSchema,
  MikrotikResponseSchema,
} from "../../../application/schema/mikrotik.schema";
import { CreateMikrotikUseCase } from "../../../application/usecases/create-mikrotik.use-case";

@Controller("/mikrotiks")
export class CreateMikrotikController {
  static inject = [CreateMikrotikUseCase];

  constructor(private readonly createMikrotikUseCase: CreateMikrotikUseCase) {}

  @Validate({ body: CreateMikrotikSchema })
  @Post("/", {
    tags: ["Mikrotik"],
    summary: "Cria um novo usuário",
    description: "Endpoint para criar um novo usuário no sistema.",
    body: CreateMikrotikSchema,
    responses: {
      201: { description: "Usuário criado", schema: MikrotikResponseSchema },
      400: { description: "Dados inválidos" },
    },
  })
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as CreateMikrotikDto;
    const result = await this.createMikrotikUseCase.execute(body);

    if (result.isLeft()) {
      throw result.value;
    }

    return reply.status(201).send(result.value);
  }
}
