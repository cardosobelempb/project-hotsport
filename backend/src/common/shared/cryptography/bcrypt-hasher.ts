import { BaseHashComparer } from "@/common/shared/utils/base-hash-comparer";
import { BaseHashGenerator } from "@/common/shared/utils/base-hash-generator";
import { compare, hash } from "bcryptjs";

export class BcryptHasher implements BaseHashGenerator, BaseHashComparer {
  private HASH_SALT_LENGTH = 8;

  hash(plain: string): Promise<string> {
    return hash(plain, this.HASH_SALT_LENGTH);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash);
  }
}
