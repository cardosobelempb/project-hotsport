export abstract class BaseGetSaltAsync {
  abstract genSaltSync(rounds?: number): Promise<string>;
}
