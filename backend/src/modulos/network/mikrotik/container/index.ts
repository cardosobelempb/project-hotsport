import { CreateMikrotikUseCase } from "../application/usecases/create-mikrotik.use-case";
import { MikrotikPrismaRepository } from "../infrastructure/http/repositories/prisma/mikrotik-prisma.repository";

// ── Repositories ──────────────────────────────────────────────────────────────
const mikrotikPrismaRepository = new MikrotikPrismaRepository();

// ── Providers ─────────────────────────────────────────────────────────────────

// ── Use Cases ─────────────────────────────────────────────────────────────────

export const createMikrotikUseCase = new CreateMikrotikUseCase(
  mikrotikPrismaRepository,
);
