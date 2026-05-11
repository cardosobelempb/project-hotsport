export abstract class BaseHashComparer {
  abstract compare(plain: string, hash: string): Promise<boolean>;
}
