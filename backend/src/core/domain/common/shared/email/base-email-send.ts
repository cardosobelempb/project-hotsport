// core/contracts/EmailSender.ts

export interface BaseEmailSendOptions {
  to: string | string[];
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export abstract class BaseEmailSender {
  abstract sendEmail(options: BaseEmailSendOptions): Promise<void>;
}
