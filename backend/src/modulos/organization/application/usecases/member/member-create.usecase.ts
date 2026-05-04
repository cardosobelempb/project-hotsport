import {
  Either,
  left,
  right,
} from "@/common/domain/errors/handle-errors/either";
import { AlreadyExistsError } from "@/common/domain/errors/usecases/already-exists.error";
import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { MemberEntity } from "@/modulos/organization/domain/entities/member.entity";
import { MemberMapper } from "@/modulos/organization/domain/mappers/member.mapper";
import { MemberRepository } from "@/modulos/organization/domain/repositories/member.repository";
import {
  CreateMemberDto,
  MemberResponseDto,
} from "../../schemas/member.schema";

export type MemberCreateUseCaseResponse = Either<
  AlreadyExistsError,
  MemberResponseDto
>;

export class MemberCreateUseCase {
  constructor(private readonly memberRepository: MemberRepository) {}

  async execute(input: CreateMemberDto): Promise<MemberCreateUseCaseResponse> {
    if (!input.userId || !input.organizationId || !input.role) {
      return left(
        new AlreadyExistsError({
          message: "Member name is required",
          fieldName: "organizationId, userId, role",
        }),
      );
    }

    const entity = MemberEntity.create({
      organizationId: UUIDVO.create(input.organizationId),
      userId: UUIDVO.create(input.userId),
      email: EmailVO.create(input.email),
      invitedBy: UUIDVO.create(input.invitedBy || input.userId), // Se não for fornecido, assume que o usuário está se auto-invitando
      joinedAt: new Date(),
      role: input.role,
    });

    const member = await this.memberRepository.create(entity);
    const memberDto = MemberMapper.toHttp(member);

    return right(memberDto);
  }
}
