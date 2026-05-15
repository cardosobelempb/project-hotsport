export interface RadiusUserOutputDto {
  id: number;
  username: string;
  planId: number | null;
  nasId: number | null;
  createdAt: string;
}

interface RadiusUserMapperInput {
  id: number;
  username: string;
  planId: number | null;
  nasId: number | null;
  createdAt: Date;
}

export const mapRadiusUser = (
  user: RadiusUserMapperInput,
): RadiusUserOutputDto => ({
  id: user.id,
  username: user.username,
  planId: user.planId,
  nasId: user.nasId,
  createdAt: user.createdAt.toISOString(),
});
