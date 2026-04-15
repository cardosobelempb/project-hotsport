import z from "zod";

export const AuthRefreshSchema = z.object({
  refreshToken: z.string(),
});

export type AuthRefreshType = z.infer<typeof AuthRefreshSchema>;
