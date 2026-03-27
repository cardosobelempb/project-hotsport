export abstract class HashSyncAbstract {
  abstract genSaltSync(rounds?: number): Promise<string>
  abstract hashSync(password: string, salt: number | string): Promise<string>
  abstract compareSync(password: string, hash: string): Promise<boolean>
}
