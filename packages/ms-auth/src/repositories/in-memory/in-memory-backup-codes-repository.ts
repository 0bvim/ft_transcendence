import { Prisma, BackupCode } from "@prisma/client";
import { BackupCodesRepository } from "../backup-codes-repository";
import { randomUUID } from "node:crypto";

export class InMemoryBackupCodesRepository implements BackupCodesRepository {
  public items: BackupCode[] = [];

  async create(data: Prisma.BackupCodeUncheckedCreateInput): Promise<BackupCode> {
    const backupCode: BackupCode = {
      id: randomUUID(),
      userId: data.userId,
      code: data.code,
      used: data.used || false,
      createdAt: new Date(),
      usedAt: null,
    };

    this.items.push(backupCode);
    return backupCode;
  }

  async findByCode(code: string): Promise<BackupCode | null> {
    const backupCode = this.items.find((item) => item.code === code);
    return backupCode || null;
  }

  async findByUserId(userId: string): Promise<BackupCode[]> {
    return this.items.filter((item) => item.userId === userId);
  }

  async markAsUsed(id: string): Promise<BackupCode> {
    const backupCodeIndex = this.items.findIndex((item) => item.id === id);
    
    if (backupCodeIndex === -1) {
      throw new Error("Backup code not found");
    }

    this.items[backupCodeIndex] = {
      ...this.items[backupCodeIndex],
      used: true,
      usedAt: new Date(),
    };

    return this.items[backupCodeIndex];
  }

  async deleteByUserId(userId: string): Promise<void> {
    this.items = this.items.filter((item) => item.userId !== userId);
  }
} 