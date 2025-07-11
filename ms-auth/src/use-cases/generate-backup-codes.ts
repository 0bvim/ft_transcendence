import { UsersRepository } from "../repositories/users-repository";
import { BackupCodesRepository } from "../repositories/backup-codes-repository";
import { UserNotFoundError } from "./errors/user-not-found-error";
import { randomBytes } from "node:crypto";

interface GenerateBackupCodesUseCaseRequest {
  userId: string;
}

interface GenerateBackupCodesUseCaseResponse {
  backupCodes: string[];
}

export class GenerateBackupCodesUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private backupCodesRepository: BackupCodesRepository,
  ) {}

  async execute({
    userId,
  }: GenerateBackupCodesUseCaseRequest): Promise<GenerateBackupCodesUseCaseResponse> {
    // Check if user exists
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    // Delete existing backup codes
    await this.backupCodesRepository.deleteByUserId(userId);

    // Generate new backup codes
    const codes: string[] = [];
    
    // Generate 8 backup codes
    for (let i = 0; i < 8; i++) {
      const code = randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
      
      // Store the backup code in the database
      await this.backupCodesRepository.create({
        userId,
        code,
      });
    }

    return {
      backupCodes: codes,
    };
  }
} 