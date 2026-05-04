import { memberCreateUseCase } from "@/modulos/organization/container";
import { FastifyInstance } from "fastify";
import { memberCreateController } from "../controllers/member/member-create.controller";

export async function memberRoutes(app: FastifyInstance): Promise<void> {
  await app.register(memberCreateController(memberCreateUseCase));
  // await app.register(
  //   memberFindByIdController(memberFindByIdUseCase),
  // );
  // await app.register(memberUpdateController(memberUpdateUseCase));
  // await app.register(memberSearchController(memberPageUseCase));
  // await app.register(
  //   memberActivateController(memberActivateUseCase),
  // );
  // await app.register(
  //   memberDeactivateController(memberDeactivateUseCase),
  // );
}
