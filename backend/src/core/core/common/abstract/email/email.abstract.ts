// core/contracts/EmailSender.ts

export interface EmailOptions {
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

export abstract class EmailSender {
  abstract sendEmail(options: EmailOptions): Promise<void>;
}
