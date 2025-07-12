import { generateRegistrationOptions } from '@simplewebauthn/server';
import { UsersRepository } from '../repositories/users-repository';
import { WebAuthnCredentialsRepository } from '../repositories/webauthn-credentials-repository';
import { UserNotFoundError } from './errors/user-not-found-error';
import { env } from '../env';

interface GenerateWebAuthnRegistrationOptionsUseCaseRequest {
  userId: string;
  userDisplayName?: string;
}

interface GenerateWebAuthnRegistrationOptionsUseCaseResponse {
  options: any;
}

export class GenerateWebAuthnRegistrationOptionsUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private webAuthnCredentialsRepository: WebAuthnCredentialsRepository,
  ) {}

  async execute({
    userId,
    userDisplayName,
  }: GenerateWebAuthnRegistrationOptionsUseCaseRequest): Promise<GenerateWebAuthnRegistrationOptionsUseCaseResponse> {
    // Check if user exists
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    // Get user's existing credentials to exclude them
    const userCredentials = await this.webAuthnCredentialsRepository.findByUserId(userId);

    const options = await generateRegistrationOptions({
      rpName: env.WEBAUTHN_RP_NAME,
      rpID: env.WEBAUTHN_RP_ID,
      userID: new TextEncoder().encode(userId),
      userName: user.email,
      userDisplayName: userDisplayName || user.username,
      timeout: 60000,
      attestationType: 'none',
      excludeCredentials: userCredentials.map(cred => ({
        id: cred.credentialID,
        type: 'public-key' as const,
        transports: cred.transports ? JSON.parse(cred.transports) : undefined,
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
      supportedAlgorithmIDs: [-7, -257],
    });

    return {
      options,
    };
  }
} 