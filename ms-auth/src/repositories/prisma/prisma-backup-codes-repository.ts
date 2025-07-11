import { Prisma } from "@prisma/client";
import { BackupCodesRepository } from "../backup-codes-repository";
import { prisma } from "../../lib/prisma";

export class PrismaBackupCodesRepository implements BackupCodesRepository {
  async create(data: Prisma.BackupCodeUncheckedCreateInput) {
    const backupCode = await prisma.backupCode.create({
      data,
    });

    return backupCode;
  }

  async findByCode(code: string) {
    const backupCode = await prisma.backupCode.findUnique({
      where: {
        code,
      },
    });

    return backupCode;
  }

  async findByUserId(userId: string) {
    const backupCodes = await prisma.backupCode.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return backupCodes;
  }

  async markAsUsed(id: string) {
    const backupCode = await prisma.backupCode.update({
      where: {
        id,
      },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    return backupCode;
  }

  async deleteByUserId(userId: string) {
    await prisma.backupCode.deleteMany({
      where: {
        userId,
      },
    });
  }
} 