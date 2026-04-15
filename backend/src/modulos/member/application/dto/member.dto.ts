export interface MemberDto {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberInputDto extends Omit<
  MemberDto,
  "id" | "createdAt" | "updatedAt"
> {
  organizationId: string;
  userId: string;
  role: string;
}

export interface MemberOutputDto extends Omit<MemberDto, "updatedAt"> {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: string;
}

export interface MemberOptionalDto extends Partial<MemberDto> {}
