import {
  organizationActivateUseCase,
  organizationCreateUseCase,
  organizationDeactivateUseCase,
  organizationFindByIdUseCase,
  organizationSearchUseCase,
  organizationUpdateUseCase,
} from "@/modulos/organization/container";
import { FastifyInstance } from "fastify";
import { organizationActivateController } from "../controllers/organization-activate.controller";
import { organizationCreateController } from "../controllers/organization-create.controller";
import { organizationDeactivateController } from "../controllers/organization-deactivate.controller";
import { organizationFindByIdController } from "../controllers/organization-find-by-id.controller";
import { organizationSearchController } from "../controllers/organization-search.controller";
import { organizationUpdateController } from "../controllers/organization-update.controller";

export async function oerganizationRoutes(app: FastifyInstance): Promise<void> {
  await app.register(organizationCreateController(organizationCreateUseCase));
  await app.register(
    organizationFindByIdController(organizationFindByIdUseCase),
  );
  await app.register(organizationUpdateController(organizationUpdateUseCase));
  await app.register(organizationSearchController(organizationSearchUseCase));
  await app.register(
    organizationActivateController(organizationActivateUseCase),
  );
  await app.register(
    organizationDeactivateController(organizationDeactivateUseCase),
  );
}
