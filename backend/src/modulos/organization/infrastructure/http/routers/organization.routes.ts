import {
  organizationActivateUseCase,
  organizationCreateUseCase,
  organizationDeactivateUseCase,
  organizationFindByIdUseCase,
  organizationPageUseCase,
  organizationUpdateUseCase,
} from "@/modulos/organization/container";
import { FastifyInstance } from "fastify";
import { organizationActivateController } from "../controllers/organization/organization-activate.controller";
import { organizationCreateController } from "../controllers/organization/organization-create.controller";
import { organizationDeactivateController } from "../controllers/organization/organization-deactivate.controller";
import { organizationFindByIdController } from "../controllers/organization/organization-find-by-id.controller";
import { organizationSearchController } from "../controllers/organization/organization-page.controller";
import { organizationUpdateController } from "../controllers/organization/organization-update.controller";

export async function organizationRoutes(app: FastifyInstance): Promise<void> {
  await app.register(organizationCreateController(organizationCreateUseCase));
  await app.register(
    organizationFindByIdController(organizationFindByIdUseCase),
  );
  await app.register(organizationUpdateController(organizationUpdateUseCase));
  await app.register(organizationSearchController(organizationPageUseCase));
  await app.register(
    organizationActivateController(organizationActivateUseCase),
  );
  await app.register(
    organizationDeactivateController(organizationDeactivateUseCase),
  );
}
