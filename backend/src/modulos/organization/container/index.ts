import { OrganizationActivateUseCase } from "../application/usecases/organization/organization-activate.usecase";
import { OrganizationCreateUseCase } from "../application/usecases/organization/organization-create.usecase";
import { OrganizationDeactivateUseCase } from "../application/usecases/organization/organization-deactivate.usecase";
import { OrganizationFindByIdUseCase } from "../application/usecases/organization/organization-find-by-id.usecase";
import { OrganizationPageUseCase } from "../application/usecases/organization/organization-page.usecase";
import { OrganizationUpdateUseCase } from "../application/usecases/organization/organization-update.usecase";
import { OrganizationPrismaRepository } from "../infrastructure/http/repositories/prisma/organization-prisma.repository";

// ── Repositories ──────────────────────────────────────────────────────────────

const organizationRepository = new OrganizationPrismaRepository();

// ── Providers ─────────────────────────────────────────────────────────────────

// ── Use Cases ─────────────────────────────────────────────────────────────────

export const organizationCreateUseCase = new OrganizationCreateUseCase(
  organizationRepository,
);
export const organizationFindByIdUseCase = new OrganizationFindByIdUseCase(
  organizationRepository,
);
export const organizationUpdateUseCase = new OrganizationUpdateUseCase(
  organizationRepository,
);
export const organizationPageUseCase = new OrganizationPageUseCase(
  organizationRepository,
);

export const organizationActivateUseCase = new OrganizationActivateUseCase(
  organizationRepository,
);
export const organizationDeactivateUseCase = new OrganizationDeactivateUseCase(
  organizationRepository,
);
