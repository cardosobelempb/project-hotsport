export abstract class BaseHashGenerator {
  abstract hash(plain: string): Promise<string>;
}
