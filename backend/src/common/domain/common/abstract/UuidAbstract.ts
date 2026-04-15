export abstract class UuidAbstract {
  abstract getId(): string;
  abstract equals(entity: UuidAbstract): boolean;
}

/**
 * 👇 Exemplo de uso:
 Agora, uma entidade que implementa esse contrato:
 // domain/User.ts
import { UUIDContract } from '../core/contracts/UUIDContract';
import { v4 as uuidv4, validate as validateUUID } from 'uuid';

export class User extends UUIDContract {
  private readonly _id: string;
  public readonly name: string;

  constructor(name: string, id?: string) {
    super();
    if (id && !validateUUID(id)) {
      throw new Error(`Invalid UUID: ${id}`);
    }

    this._id = id ?? uuidv4();
    this.name = name;
  }

  public getId(): string {
    return this._id;
  }

  public equals(other: UUIDContract): boolean {
    return this._id === other.getId();
  }
}

 */
