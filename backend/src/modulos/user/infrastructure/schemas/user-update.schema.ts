import z from "zod";

import { UserBaseSchema } from "./user.schema";

// PATCH /users/:id
export const UserUpdateBodySchema = UserBaseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type UserUpdateBodyType = z.infer<typeof UserUpdateBodySchema>;
