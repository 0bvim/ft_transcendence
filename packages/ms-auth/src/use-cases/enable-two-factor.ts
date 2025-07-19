import { randomBytes } from 'crypto';
import { UsersRepository } from '../repositories/users-repository';
import { BackupCodesRepository } from '../repositories/backup-codes-repository';
import { UserNotFoundError } from './errors/user-not-found-error';
import * as speakeasy from 'speakeasy';
import { env } from '../env';

interface EnableTwoFactorUseCaseRequest {
  userId: string;
}

interface EnableTwoFactorUseCaseResponse {
  enabled: boolean;
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
    // Check if user exists
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    // Generate TOTP secret for authenticator apps
    const secret = speakeasy.generateSecret({
      name: `${env.WEBAUTHN_RP_NAME || 'ft_transcendence'}:${user.email}`,
      issuer: env.WEBAUTHN_RP_NAME || 'ft_transcendence',
      length: 32,
    });

    // Construct proper OTP Auth URL
    const issuer = encodeURIComponent(env.WEBAUTHN_RP_NAME || 'ft_transcendence');
    const accountName = encodeURIComponent(user.email);
    const secretKey = secret.base32;
    
    const otpAuthUrl = `otpauth://totp/${issuer}:${accountName}?secret=${secretKey}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;

    // Store the TOTP secret
    await this.usersRepository.update(userId, {
      totpSecret: secret.base32,
      twoFactorEnabled: true,
    });

    // Generate backup codes
    const backupCodes = await this.generateBackupCodes(userId);

    return {
      enabled: true,
      backupCodes,
      totpSecret: secret.base32,
      qrCodeUrl: otpAuthUrl, // Use our properly formatted URL
    };
  }

  private async generateBackupCodes(userId: string): Promise<string[]> {
    const codes: string[] = [];
    
    // Delete existing backup codes
    await this.backupCodesRepository.deleteByUserId(userId);
    
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