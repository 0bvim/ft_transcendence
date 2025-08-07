import { UsersRepository } from "../repositories/users-repository";
import { WebAuthnCredentialsRepository } from "../repositories/webauthn-credentials-repository";
import { BackupCodesRepository } from "../repositories/backup-codes-repository";
import { UserNotFoundError } from "./errors/user-not-found-error";

interface DisableTwoFactorUseCaseRequest {
  userId: string;
}

interface DisableTwoFactorUseCaseResponse {
  disabled: boolean;
}

export class DisableTwoFactorUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private webAuthnCredentialsRepository: WebAuthnCredentialsRepository,
    private backupCodesRepository: BackupCodesRepository,
  ) {}

  async execute({
    userId,
  }: DisableTwoFactorUseCaseRequest): Promise<DisableTwoFactorUseCaseResponse> {
    // Check if user exists
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    // Disable 2FA for the user
    await this.usersRepository.update(userId, {
      twoFactorEnabled: false,
      totpSecret: null,
    });

    // Delete all WebAuthn credentials for the user
    const credentials = await this.webAuthnCredentialsRepository.findByUserId(userId);
    for (const credential of credentials) {
      await this.webAuthnCredentialsRepository.delete(credential.id);
    }

    // Delete all backup codes for the user
    await this.backupCodesRepository.deleteByUserId(userId);

    return {
      disabled: true,
    };
  }
} 