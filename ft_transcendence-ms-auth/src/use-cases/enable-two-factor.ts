import { UsersRepository } from "../repositories/users-repository";
import { BackupCodesRepository } from "../repositories/backup-codes-repository";
import { UserNotFoundError } from "./errors/user-not-found-error";
import { randomBytes } from "node:crypto";

interface EnableTwoFactorUseCaseRequest {
  userId: string;
}

interface EnableTwoFactorUseCaseResponse {
  enabled: boolean;
  backupCodes: string[];
}

export class EnableTwoFactorUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private backupCodesRepository: BackupCodesRepository,
  ) {}

  async execute({
    userId,
  }: EnableTwoFactorUseCaseRequest): Promise<EnableTwoFactorUseCaseResponse> {
    // Check if user exists
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    // Enable 2FA for the user
    await this.usersRepository.update(userId, {
      twoFactorEnabled: true,
    });

    // Generate backup codes
    const backupCodes = await this.generateBackupCodes(userId);

    return {
      enabled: true,
      backupCodes,
    };
  }

  private async generateBackupCodes(userId: string): Promise<string[]> {
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

    return codes;
  }
} 