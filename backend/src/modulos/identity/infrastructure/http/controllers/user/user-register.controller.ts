import { Controller } from "@/common/shared/http/decorators/controller.decorator";
import { Post } from "@/common/shared/http/decorators/route.decorator";
import { Validate } from "@/common/shared/http/decorators/validate.decorator";
import { CreateUserDto } from "@/modulos/identity/application/dto/user.dto";
import {
  CreateUserSchema,
  UserResponseSchema,
} from "@/modulos/identity/application/schemas/user.schema";
import { UserCreateUseCase } from "@/modulos/identity/application/usecases/users/user-create.usecase";
import type { FastifyReply, FastifyRequest } from "fastify";

@Controller("/users")
export class UserCreateController {
  static inject = [UserCreateUseCase];

  constructor(private readonly userCreateUseCase: UserCreateUseCase) {}

  @Validate({ body: CreateUserSchema })
  @Post("/", {
    tags: ["User"],
    summary: "Cria um novo usuário",
    description: "Endpoint para criar um novo usuário no sistema.",
    body: CreateUserSchema,
    responses: {
      201: { description: "Usuário criado", schema: UserResponseSchema },
      400: { description: "Dados inválidos" },
    },
  })
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as CreateUserDto;
    const result = await this.userCreateUseCase.execute(body);

    if (result.isLeft()) {
      throw result.value;
    }

    return reply.status(201).send(result.value);
  }
}
