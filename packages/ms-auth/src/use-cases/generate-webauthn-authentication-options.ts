import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { UsersRepository } from '../repositories/users-repository';
import { WebAuthnCredentialsRepository } from '../repositories/webauthn-credentials-repository';
import { UserNotFoundError } from './errors/user-not-found-error';
import { env } from '../env';

interface GenerateWebAuthnAuthenticationOptionsUseCaseRequest {
  userId: string;
}

interface GenerateWebAuthnAuthenticationOptionsUseCaseResponse {
  options: any;
}

export class GenerateWebAuthnAuthenticationOptionsUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private webAuthnCredentialsRepository: WebAuthnCredentialsRepository,
  ) {}

  async execute({
    userId,
  }: GenerateWebAuthnAuthenticationOptionsUseCaseRequest): Promise<GenerateWebAuthnAuthenticationOptionsUseCaseResponse> {
    // Check if user exists
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    // Get user's existing credentials
    const userCredentials = await this.webAuthnCredentialsRepository.findByUserId(userId);

    const options = await generateAuthenticationOptions({
      rpID: env.WEBAUTHN_RP_ID,
      timeout: 60000,
      userVerification: 'preferred',
      allowCredentials: userCredentials.map(cred => ({
        id: cred.credentialID,
        type: 'public-key' as const,
        transports: cred.transports ? JSON.parse(cred.transports) : undefined,
      })),
    });

    return {
      options,
    };
  }
} 