import { ErrorCode, IServiceError, StandardError } from "@/common";

export class WhatsappError extends StandardError implements IServiceError {
  constructor(path: string) {
    super({
      error: "WhatsappError",
      message: ErrorCode.WHATSAPP_ERROR,
      statusCode: 409,
      path,
    });
  }
}
