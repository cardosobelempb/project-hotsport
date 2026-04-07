import z from "zod";

export const AuthLogoutSchema = z.object({
  token: z.string(),
});

export type AuthLogoutType = z.infer<typeof AuthLogoutSchema>;
