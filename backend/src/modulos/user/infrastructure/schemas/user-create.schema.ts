import z from "zod";

import { UserBaseSchema } from "./user.schema";

// POST /users
export const UserCreateBodySchema = UserBaseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserCreateBodyType = z.infer<typeof UserCreateBodySchema>;
