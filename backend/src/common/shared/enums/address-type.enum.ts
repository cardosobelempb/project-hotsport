import z from "zod";

export enum AddressType {
  HOME = "HOME",
  WORK = "WORK",
  BILLING = "BILLING",
  ORGANIZATION = "ORGANIZATION",
  OTHER = "OTHER",
}

export const AddressTypeSchema = z.enum(AddressType);
