import { Prisma, BackupCode } from "@prisma/client";

export interface BackupCodesRepository {
  create(data: Prisma.BackupCodeUncheckedCreateInput): Promise<BackupCode>;
  findByCode(code: string): Promise<BackupCode | null>;
  findByUserId(userId: string): Promise<BackupCode[]>;
  markAsUsed(id: string): Promise<BackupCode>;
  deleteByUserId(userId: string): Promise<void>;
} 