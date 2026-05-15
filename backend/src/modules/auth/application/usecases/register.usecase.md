import { AlreadyExistsError } from "@/common/domain/errors/usecases/already-exists.error";

import {
  Either,
  left,
  right,
} from "@/common/domain/errors/handle-errors/either";
import { MethodNotAllowedError } from "@/common/domain/errors/usecases/method-not-allowed.error";
import { TransactionManager } from "@/common/infrastructure/db/transaction/transaction-manager";
import { BaseBcryptHasher } from "@/common/shared/cryptography/base-bcrypt-hasher";
import { TenantSummaryDto } from "@/modulos/identity/application/dto/tenant.dto";
import { CreateUserProfileDto } from "@/modulos/identity/application/dto/user-profile.dto";
import { UserSummaryDto } from "@/modulos/identity/application/dto/user.dto";
import { LgpdConsentFactory } from "@/modulos/identity/application/factories/lgpd-consents.factory";
import { MembershipFactory } from "@/modulos/identity/application/factories/member-ship.factory";
import { TenantFactory } from "@/modulos/identity/application/factories/tenant.factory";
import { UserProfileFactory } from "@/modulos/identity/application/factories/user-profile.factory";
import { UserFactory } from "@/modulos/identity/application/factories/user.factory";
import { UserMapper } from "@/modulos/identity/application/mappers/user-mapper";
import { MembershipRepository } from "@/modulos/identity/domain/repositories/member-ship.repository";
import { UserProfileRepository } from "@/modulos/identity/domain/repositories/user-profile.repository";
import { UserRepository } from "@/modulos/identity/domain/repositories/user.repository";
import { TenantMapper } from "@/modulos/tenant/domain/mappres/tenant.mapper";
import { TenantRepository } from "@/modulos/tenant/domain/repositories/tenant.repository";
import { LgpdConsentsRepository } from "../../../domain/repositories/lgpd-consent.repository";
import { CreateRegisterDto } from "../dto/register.dto";

// ─── Tipos de I/O ────────────────────────────────────────────────────────────

interface RegisterInput {
  user: CreateRegisterDto;
  profile: CreateUserProfileDto;
}

interface RegisterOutput {
  user: UserSummaryDto;
  tenant: TenantSummaryDto;
}

/**
 * Tipo de retorno seguindo o padrão Either:
 * - Left  → erro de negócio (usuário já existe ou não permitido)
 * - Right → dados do usuário e tenant criados com sucesso
 */
export type RegisterCreateUseCaseResponse = Either<
  AlreadyExistsError | MethodNotAllowedError,
  RegisterOutput
>;

// ─── Use Case ────────────────────────────────────────────────────────────────

export class RegisterCreateUseCase {
  /**
   * ✅ static inject alinhado 1:1 com os parâmetros do construtor.
   * A ordem importa — o container injeta posicionalmente.
   *
   * ⚠️ Erro comum: adicionar/remover dependência no construtor
   *    e esquecer de refletir no inject → bug silencioso em runtime.
   */
  static inject = [
    UserRepository,
    MembershipRepository,
    UserProfileRepository,
    BaseBcryptHasher,
    TenantRepository,
    LgpdConsentsRepository,
    TransactionManager,
  ] as const;

  constructor(
    private readonly usersRepository: UserRepository,
    private readonly membershipsRepository: MembershipRepository,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly hasher: BaseBcryptHasher,
    private readonly tenantRepository: TenantRepository,
    private readonly lgpdConsentsRepository: LgpdConsentsRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(input: RegisterInput): Promise<RegisterCreateUseCaseResponse> {
    // ── 1. Guarda: verificação de e-mail ANTES de qualquer criação ───────────
    //
    // ✅ Feito fora da transação intencionalmente — é uma leitura simples
    //    que evita abrir transação à toa para casos que já falhariam.
    //
    // ⚠️ Race condition teórica: dois cadastros simultâneos com mesmo e-mail
    //    podem passar aqui. A proteção final é a constraint UNIQUE no banco,
    //    que lançará erro dentro da transação. Trate esse erro no catch.
    const existingUser = await this.usersRepository.findActiveByEmail(
      input.user.email,
    );

    if (existingUser) {
      // Usuário deletado logicamente — não pode re-registrar pelo mesmo e-mail
      if (existingUser.deletedAt !== null) {
        return left(
          new MethodNotAllowedError({
            message: `E-mail ${input.user.email} pertence a uma conta desativada.`,
            fieldName: "email",
          }),
        );
      }

      // ✅ Usuário ativo — retorna o erro correto alinhado ao tipo de retorno
      return left(
        new AlreadyExistsError({
          message: `Já existe uma conta com o e-mail ${input.user.email}.`,
          fieldName: "email",
        }),
      );
    }

    // ── 2. Criação das entidades de domínio ──────────────────────────────────
    //
    // ✅ Criadas APÓS a validação — não desperdiça objetos se falhar na guarda.
    // ✅ Fora da transação — são operações em memória, sem I/O.
    //    A transação deve ser o menor bloco possível de I/O atômico.

    const passwordHash = await this.hasher.hash(input.user.passwordHash, 12);

    const user = UserFactory.build({
      email: input.user.email,
      passwordHash,
    });
    const userProfile = UserProfileFactory.build({
      ...input.profile,
      userId: user.id.toString(),
    });
    const tenant = TenantFactory.build({
      name: input.profile.firstName,
      slug: input.profile.firstName.toLowerCase(),
      documentNumber: input.profile.documentNumber,
      contactEmail: input.user.email,
      phone: input.profile.phone,
    });
    const membership = MembershipFactory.build({
      userId: user.id.toString(),
      tenantId: tenant.id.toString(),
      organizationId: "", // TODO: revisar regra de negócio
      invitedById: "", // TODO: revisar regra de negócio
      invitedEmail: input.user.email,
      role: "OWNER",
      status: "ACCEPTED",
    });
    const lgpdConsent = LgpdConsentFactory.build({
      userId: user.id.toString(),
      consentTerms: true,
      consentMarketing: false,
      consentDataSharing: false,
      consentAnalytics: false,
      ipAddress: "",
      macAddress: "",
      userAgent: "",
      consentVersion: "1.0",
    });

    // ── 3. Persistência atômica ──────────────────────────────────────────────
    //
    // ✅ Todas as escritas dentro de uma única transação.
    //    Se qualquer uma falhar → rollback automático em todas.
    //    Não existe estado parcial no banco.
    const result = await this.transactionManager.run(async (tx) => {
      // Cada repositório recebe o contexto transacional via withTx
      const tenantRepo = this.tenantRepository.withTx(tx);
      const userRepo = this.usersRepository.withTx(tx);
      const membershipRepo = this.membershipsRepository.withTx(tx);
      const profileRepo = this.userProfileRepository.withTx(tx);
      const lgpdRepo = this.lgpdConsentsRepository.withTx(tx);

      // ✅ Ordem importa para respeitar FKs:
      //    tenanimport { TransactionManager } from './../../../../common/infrastructure/db/transaction/transaction-manager';

      await tenantRepo.create(tenant);
      await userRepo.create(user);
      await membershipRepo.create(membership);
      await profileRepo.create(userProfile);
      await lgpdRepo.create(lgpdConsent);

      return {
        user: UserMapper.toSummary(user),
        tenant: TenantMapper.toSummary(tenant),
      };
    });

    return right(result);
  }
}
