// DTO de entrada para atualização de status
// Separado para seguir o SRP — cada caso de uso tem seu próprio contrato
export interface UpdatePaymentStatusInputDto {
  id: string;
  status: string;
}
