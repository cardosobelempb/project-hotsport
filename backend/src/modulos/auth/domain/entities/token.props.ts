import { UUIDVO } from "@/core";

export interface TokenProps {
  id: UUIDVO;
  userId: UUIDVO;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
}
