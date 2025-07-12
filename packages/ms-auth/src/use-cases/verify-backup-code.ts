import { BackupCodesRepository } from "../repositories/backup-codes-repository";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error";
import { BackupCode } from "@prisma/client";

interface VerifyBackupCodeUseCaseRequest {
  code: string;
}

interface VerifyBackupCodeUseCaseResponse {
  verified: boolean;
  backupCode: BackupCode;
}

export class VerifyBackupCodeUseCase {
  constructor(
    private backupCodesRepository: BackupCodesRepository,
  ) {}

  async execute({
    code,
  }: VerifyBackupCodeUseCaseRequest): Promise<VerifyBackupCodeUseCaseResponse> {
    // Find the backup code
    const backupCode = await this.backupCodesRepository.findByCode(code);

    if (!backupCode) {
      throw new InvalidCredentialsError();
    }

    // Check if the code has already been used
    if (backupCode.used) {
      throw new InvalidCredentialsError();
    }

    // Mark the code as used
    const updatedBackupCode = await this.backupCodesRepository.markAsUsed(backupCode.id);

    return {
      verified: true,
      backupCode: updatedBackupCode,
    };
  }
} 