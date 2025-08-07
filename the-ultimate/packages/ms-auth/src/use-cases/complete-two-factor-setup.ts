import { UsersRepository } from '../repositories/users-repository';
import { UserNotFoundError } from './errors/user-not-found-error';
import { InvalidCredentialsError } from './errors/invalid-credentials-error';
import * as speakeasy from 'speakeasy';

interface CompleteTwoFactorSetupUseCaseRequest {
  userId: string;
  code: string;
}

interface CompleteTwoFactorSetupUseCaseResponse {
  enabled: boolean;
  user: {
    id: string;
    email: string;
    username: string;
    twoFactorEnabled: boolean;
  };
}

export class CompleteTwoFactorSetupUseCase {
  constructor(
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    userId,
    code,
  }: CompleteTwoFactorSetupUseCaseRequest): Promise<CompleteTwoFactorSetupUseCaseResponse> {
    console.log('🔍 Complete 2FA Setup Use Case Started:', { userId, code, time: new Date().toISOString() });
    
    // Check if user exists
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      console.log('❌ User not found:', userId);
      throw new UserNotFoundError();
    }

    console.log('🔍 User found:', { 
      id: user.id, 
      email: user.email, 
      twoFactorEnabled: user.twoFactorEnabled,
      hasTotpSecret: !!user.totpSecret,
      totpSecretLength: user.totpSecret?.length || 0
    });

    // Check if user has a TOTP secret but 2FA is not enabled yet
    if (!user.totpSecret) {
      console.log('❌ No TOTP secret found for user');
      throw new InvalidCredentialsError();
    }

    if (user.twoFactorEnabled) {
      console.log('❌ 2FA already enabled for user');
      throw new InvalidCredentialsError(); // 2FA already enabled
    }

    // Clean and validate the code
    const cleanCode = code.replace(/\s/g, '').trim();
    console.log('🔍 Code validation:', { originalCode: code, cleanCode, length: cleanCode.length });
    
    if (!/^\d{6}$/.test(cleanCode)) {
      console.log('❌ Invalid code format:', cleanCode);
      throw new InvalidCredentialsError();
    }

    // Verify the TOTP code with more tolerant settings
    console.log('🔍 Starting TOTP verification:', { 
      secret: user.totpSecret.substring(0, 8) + '...', 
      token: cleanCode,
      currentTime: new Date().toISOString()
    });
    
    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: cleanCode,
      step: 30, // 30-second time step (standard)
      window: 6, // Allow 6 time steps (3 minutes) before/after for setup tolerance
    });

    console.log('🔍 Initial TOTP verification result:', verified);

    if (!verified) {
      console.log('🔍 Initial verification failed, trying time-shifted verification...');
      // Try with different time windows for time synchronization issues
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Test with manual time calculations for better tolerance
      for (let delta = -4; delta <= 4; delta++) {
        const testTime = currentTime + (delta * 30);
        console.log(`🔍 Testing with time delta ${delta} (${testTime})`);
        
        const testVerified = speakeasy.totp.verify({
          secret: user.totpSecret,
          encoding: 'base32',
          token: cleanCode,
          step: 30,
          window: 0,
          time: testTime,
        });
        
        console.log(`🔍 Time delta ${delta} result:`, testVerified);
        
        if (testVerified) {
          console.log('✅ Time-shifted verification succeeded!');
          // Enable 2FA now that verification succeeded
          const updatedUser = await this.usersRepository.update(userId, {
            twoFactorEnabled: true,
          });

          return {
            enabled: true,
            user: {
              id: updatedUser.id,
              email: updatedUser.email,
              username: updatedUser.username,
              twoFactorEnabled: updatedUser.twoFactorEnabled,
            },
          };
        }
      }
      
      console.log('❌ All verification attempts failed');
      throw new InvalidCredentialsError();
    }

    // Enable 2FA now that verification succeeded
    const updatedUser = await this.usersRepository.update(userId, {
      twoFactorEnabled: true,
    });

    return {
      enabled: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        twoFactorEnabled: updatedUser.twoFactorEnabled,
      },
    };
  }
} 