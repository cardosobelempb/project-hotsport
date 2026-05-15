// ─── Factory ─────────────────────────────────────────────────────────────────

import { BirthDateVO } from "@/common/domain/values-objects/date-time/birth/birth-date.vo";
import { PhoneVO } from "@/common/domain/values-objects/phone/phone.vo";
import { UrlVO } from "@/common/domain/values-objects/url/url.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { UserProfileEntity } from "../../domain/entities/user-profile.entity";
import { CreateUserProfileDto } from "../dto/user-profile.dto";

/**
 * Fábrica de entidades do fluxo de registro.
 *
 * ✅ SRP: responsabilidade única — construir entidades do contexto de registro.
 * ✅ Extensível: adicione novos builders sem tocar no Use Case.
 * ✅ Testável: cada método é puro (sem I/O), testável de forma isolada.
 * ✅ Desacoplada: o Use Case não precisa conhecer VOs nem regras de construção.
 */
export class UserProfileFactory {
  /**
   * Cria o perfil pessoal do usuário.
   */
  /** Cria o perfil do usuário com dados pessoais e documento. */
  static build(dto: CreateUserProfileDto): UserProfileEntity {
    return UserProfileEntity.create({
      userId: UUIDVO.create(dto.userId),
      firstName: dto.firstName,
      lastName: dto.lastName,
      fullName: `${dto.firstName} ${dto.lastName}`,
      displayName: dto.displayName,
      birthDate: BirthDateVO.create(dto.birthDate),
      phone: PhoneVO.create(dto.phone, { minLength: 10, maxLength: 11 }),
      avatarUrl: UrlVO.create(dto.avatarUrl),
      documentType: dto.documentType,
      documentNumber: dto.documentNumber,
    });
  }
}
