import { PageRepository } from "@/common/domain/repositories/page-repository";
import { MemberEntity } from "../entities/member.entity";

export abstract class MemberInviteRepository extends PageRepository<MemberEntity> {
  // abstract findByToken(token: string): Promise<MemberInvite | null>;
  // abstract findPendingByEmailAndAccountId(
  //   email: string,
  //   accountId: string,
  // ): Promise<MemberInvite | null>;
  // abstract findManyByAccountId(params: {
  //   accountId: string;
  //   page: number;
  //   perPage: number;
  //   status?: $ZodInvalidTypeExpected;
  // }): Promise<MemberInviteSearchResult>;
  // abstract existsPendingByEmailAndAccountId(
  //   email: string,
  //   accountId: string,
  // ): Promise<boolean>;
}
