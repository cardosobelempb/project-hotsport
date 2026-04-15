export abstract class ServiceAbstract<Input, Output> {
  abstract execute(input: Input): Promise<Output>
}
