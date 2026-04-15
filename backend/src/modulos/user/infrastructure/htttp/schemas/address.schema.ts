import z from "zod";
import { AddressType } from "../../../domain/enums/address-type.enum";

export const AddressBodySchema = z.object({
  type: z.nativeEnum(AddressType).default(AddressType.HOME),
  isPrimary: z.boolean().default(false),
  street: z.string().min(1, "Street is required"),
  number: z.string().min(1, "Number is required"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Neighborhood is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().length(2, "State must be 2 characters"),
  country: z.string().length(2).default("BR"),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "Invalid zip code"),
});

export type AddressBodyType = z.infer<typeof AddressBodySchema>;
