# 1. Contrato abstrato para envio de e-mail

```
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

```

# 2. Exemplo de implementação usando nodemailer com SMTP

```
// infrastructure/email/SmtpEmailSender.ts

import { EmailSender, EmailOptions } from '../../core/contracts/EmailSender';
import nodemailer from 'nodemailer';

export class SmtpEmailSender extends EmailSender {
  private transporter;

  constructor() {
    super();
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outras portas
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const mailOptions = {
      from: options.from || process.env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

```

# 3. Exemplo simples de uso

```
// service/NotificationService.ts

import { EmailSender } from '../core/contracts/EmailSender';

export class NotificationService {
  constructor(private emailSender: EmailSender) {}

  async sendWelcomeEmail(to: string) {
    await this.emailSender.sendEmail({
      to,
      subject: 'Seja bem-vindo!',
      text: 'Obrigado por se cadastrar na nossa plataforma.',
      html: '<h1>Obrigado por se cadastrar na nossa plataforma.</h1>',
    });
  }
}

```

# 4. Exemplo em uma rota Express

```
// routes/email.ts
import { Router } from 'express';
import { SmtpEmailSender } from '../infrastructure/email/SmtpEmailSender';
import { NotificationService } from '../service/NotificationService';

const router = Router();
const emailSender = new SmtpEmailSender();
const notificationService = new NotificationService(emailSender);

router.post('/welcome', async (req, res) => {
  try {
    const { email } = req.body;
    await notificationService.sendWelcomeEmail(email);
    res.status(200).json({ message: 'Email enviado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Falha ao enviar email' });
  }
});

export default router;


Extras

Pode criar outro EmailSender para SendGrid, AWS SES, Mailgun, etc.
Fácil mock para testes: um MockEmailSender que só registra os e-mails enviados.
Boas práticas: configuração via variáveis de ambiente, tratamento de erros, logging.
```
