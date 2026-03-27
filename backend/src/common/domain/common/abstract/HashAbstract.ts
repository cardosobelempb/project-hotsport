export abstract class HashAbstract {
  abstract hash(password: string, saltRounds: number): Promise<string>
  abstract compare(password: string, hash: string): Promise<boolean>
}
