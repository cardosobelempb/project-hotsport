import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

const SendMessageSchema = z.object({
  numero: z.string().min(1),
  mensagem: z.string().min(1),
});

type Body = z.infer<typeof SendMessageSchema>;

export const sendWhatsappMessageController = async (
  request: FastifyRequest<{ Body: Body }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    // const session = await auth.api.getSession({
    //   headers: fromNodeHeaders(request.headers),
    // });

    const session = null; // TODO: Implementar autenticação

    if (!session) {
      await reply
        .status(401)
        .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
      return;
    }

    void request.body;
    await reply.status(200).send({ message: "Mensagem enviada com sucesso" });
  } catch (error) {
    reply.log.error(error);
    await reply
      .status(500)
      .send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
  }
};
