import { EmailVO, UUIDVO } from "@/core";

export interface AuthProps {
  id?: UUIDVO;
  userId: UUIDVO;
  email: EmailVO;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date | null;
}
