import { UsersRepository } from '../repositories/users-repository';
import { BackupCodesRepository } from '../repositories/backup-codes-repository';
import { SetupTwoFactorUseCase } from './setup-two-factor';

interface EnableTwoFactorUseCaseRequest {
  userId: string;
}

interface EnableTwoFactorUseCaseResponse {
  setup: boolean;
  backupCodes: string[];
  totpSecret: string;
  qrCodeUrl: string;
}

export class EnableTwoFactorUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private backupCodesRepository: BackupCodesRepository,
  ) {}

  async execute({
    userId,
  }: EnableTwoFactorUseCaseRequest): Promise<EnableTwoFactorUseCaseResponse> {
    // Use the setup use case to generate secrets without enabling 2FA
    const setupUseCase = new SetupTwoFactorUseCase(
      this.usersRepository,
      this.backupCodesRepository,
    );

    const result = await setupUseCase.execute({ userId });

    return {
      setup: true, // Changed from 'enabled' to 'setup' to indicate setup phase
      backupCodes: result.backupCodes,
      totpSecret: result.totpSecret,
      qrCodeUrl: result.qrCodeUrl,
    };
  }
} 