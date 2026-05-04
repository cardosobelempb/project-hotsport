import { PageRepository } from "@/common/domain/repositories/page-repository";
import { MemberEntity } from "../entities/member.entity";

export abstract class MemberRepository extends PageRepository<MemberEntity> {
  abstract findByEmail(email: string): Promise<MemberEntity | null>;
  abstract findByUserIdAndAccountId(
    userId: string,
    accountId: string,
  ): Promise<MemberEntity | null>;

  abstract findOwnerByAccountId(
    accountId: string,
  ): Promise<MemberEntity | null>;

  // abstract findManyByAccountId(params: {
  //   accountId: string;
  //   page: number;
  //   perPage: number;
  //   search?: string;
  //   role?: MemberRole;
  //   status?: MemberStatus;
  // }): Promise<MemberSearchResult>;
  abstract findManyByUserId(userId: string): Promise<MemberEntity[]>;
  abstract existsByUserIdAndAccountId(
    userId: string,
    accountId: string,
  ): Promise<boolean>;

  abstract countOwnersByAccountId(accountId: string): Promise<number>;
  abstract countActiveByAccountId(accountId: string): Promise<number>;
}
