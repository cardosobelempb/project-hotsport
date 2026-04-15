import { z } from "zod";

import { EmailString } from "./helpers.js";

export const LoginSchema = z.object({
  email: EmailString,
  password: z.string().min(1),
});

export const LoginOutputSchema = z.object({
  token: z.string(),
});

export const JwtMeOutputSchema = z.object({
  sub: z.string(),
  role: z.string().optional(),
});
