export function translateErrorMessage(message: string): string {
  const messages: Record<string, string> = {
    "conflict.operation-conflict.error":
      "Já existe um registro com esse valor.",
    "general.invalid-request.error": "Requisição inválida.",
  };

  return messages[message] ?? message;
}
