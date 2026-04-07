export abstract class GetSaltAsync {
  abstract genSaltSync(rounds?: number): Promise<string>
}
