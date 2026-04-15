# Tasks — Módulo `whatsapp`

> **Caminho:** `src/modulos/whatsapp/`
> **Propósito:** integração com WhatsApp para envio de notificações e OTP.

---

## 1. Presentation — Controllers

- [ ] Revisar `connect-whatsapp.controller.ts` — gerenciar ciclo de vida da sessão WPP
- [ ] Revisar `get-whatsapp-status.controller.ts` — retornar status da conexão
- [ ] Revisar `send-whatsapp-message.controller.ts` — validar número e mensagem com Zod

## 2. Application — Use Cases (a criar)

- [ ] Criar `ConnectWhatsApp.ts` — inicia sessão e gera QR code
- [ ] Criar `GetWhatsAppStatus.ts` — retorna status atual da conexão
- [ ] Criar `SendWhatsAppMessage.ts` — envia mensagem via API WPP

## 3. Domain

- [ ] Criar `domain/entities/whatsapp-session.entity.ts`
- [ ] Criar `domain/errors/WhatsAppNotConnectedError.ts`

## 4. Arquitetura

- [ ] Criar `infrastructure/routes/whatsapp.routes.ts` com `tags` e `summary` (Swagger)
- [ ] Avaliar mover credenciais/sessão WPP de `tokens/hotspot-wpp/` para variáveis de ambiente
- [ ] Garantir que a rota de envio é protegida por autenticação
