import { UsersRepository } from '../repositories/users-repository';
import { UserNotFoundError } from './errors/user-not-found-error';
import { InvalidCredentialsError } from './errors/invalid-credentials-error';
import * as speakeasy from 'speakeasy';

interface VerifyTotpCodeUseCaseRequest {
  userId: string;
  code: string;
}

interface VerifyTotpCodeUseCaseResponse {
  verified: boolean;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export class VerifyTotpCodeUseCase {
  constructor(
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    userId,
    code,
  }: VerifyTotpCodeUseCaseRequest): Promise<VerifyTotpCodeUseCaseResponse> {
    // Check if user exists
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    if (!user.twoFactorEnabled || !user.totpSecret) {
      throw new InvalidCredentialsError();
    }

    // Clean and validate the code
    const cleanCode = code.replace(/\s/g, '').trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      throw new InvalidCredentialsError();
    }

    // Verify the TOTP code with more tolerant settings
    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: cleanCode,
      step: 30, // 30-second time step (standard)
      window: 6, // Allow 6 time steps (3 minutes) before/after for time sync issues
    });

    if (!verified) {
      // Try with different time windows for time synchronization issues
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Test with manual time calculations for better tolerance
      for (let delta = -4; delta <= 4; delta++) {
        const testTime = currentTime + (delta * 30);
        const testVerified = speakeasy.totp.verify({
          secret: user.totpSecret,
          encoding: 'base32',
          token: cleanCode,
          step: 30,
          window: 0,
          time: testTime,
        });
        
        if (testVerified) {
          return {
            verified: true,
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
            },
          };
        }
      }
      
      throw new InvalidCredentialsError();
    }

    return {
      verified: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }
} 