export abstract class EncrypterAbstract {
  abstract encrypt(payload: Record<string, unknown>): Promise<string>
}
