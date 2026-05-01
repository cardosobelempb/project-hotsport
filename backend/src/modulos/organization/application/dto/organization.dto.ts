// export interface OrganizationDto {
//   id?: string;
//   name: string;
//   slug: string;
//   logoUrl: string | null;
//   status?: string;
//   createdAt?: Date;
//   updatedAt?: Date | null;
//   deletedAt?: Date | null;
// }

// export interface CreateOrganizationDto {
//   name: string;
//   slug: string;
//   logoUrl: string | null;
// }

// export interface UpdateOrganizationDto extends DeepPartial<OrganizationDto> {}

// export interface OrganizationPresenterDto {
//   id: string;
//   name: string;
//   slug: string;
//   logoUrl: string | null;
//   status: string;
//   createdAt: Date;
//   updatedAt: Date | null;
//   deletedAt: Date | null;
// }

// export const createOrganizationRawExample: OrganizationDto = {
//   id: "00000000-0000-4000-8000-000000000000",
//   name: "John Doe",
//   slug: "john-doe",
//   logoUrl: null,
//   status: OrganizationStatus.ACTIVE,
//   createdAt: new Date(),
//   updatedAt: null,
//   deletedAt: null,
// };

// export const organizationPresenterRawExample: OrganizationPresenterDto = {
//   id: "00000000-0000-4000-8000-000000000000",
//   name: "John Doe",
//   slug: "john-doe",
//   logoUrl: null,
//   status: OrganizationStatus.ACTIVE,
//   createdAt: new Date(),
//   updatedAt: null,
//   deletedAt: null,
// };

// ============================================================
// organization.dto.ts
// DTOs de apresentação: create, update e page
// ============================================================

// ─── Membro ───────────────────────────────────────────────────────────────────
export interface OrganizationMemberPresentDto {
  id: string;
  userId: string;
  role: string;
  joinedAt: string; // ISO 8601
}

// ─── Organização completa (create / update / getById) ────────────────────────
export interface OrganizationPresentDto {
  id: string;
  name: string;
  slug: string;
  status: string;
  logoUrl: string | null;
  // members: OrganizationMemberPresentDto[];
  // totalMembers: number;
  createdAt: string; // ISO 8601
  updatedAt: string | null;
  deletedAt: string | null;
}

// ─── Item resumido para listagem paginada ─────────────────────────────────────
export interface OrganizationSummaryDto {
  id: string;
  name: string;
  slug: string;
  status: string;
  // totalMembers: number;
  createdAt: string;
}
