import z from "zod";

export enum AddressType {
  HOME = "HOME",
  WORK = "WORK",
  BILLING = "BILLING",
  DELIVERY = "DELIVERY",
  OTHER = "OTHER",
}

export const AddressTypeSchema = z.enum(AddressType);
