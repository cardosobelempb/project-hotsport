import { Either } from "@/common/domain/errors/handle-errors/either";
import { AlreadyExistsError } from "@/common/domain/errors/usecases/already-exists.error";
import { SessionSummaryDto } from "../dto/session.dto";

export type CreateSessionUseCaseResponse = Either<
AlreadyExistsError,
SessionSummaryDto

> ;

export class CreateSessionUseCase {
constructor() {}

async execute(input: {
email: string;
password: string;
}): Promise<CreateSessionUseCaseResponse> {
// Lógica para criar uma nova sessão
}
}
