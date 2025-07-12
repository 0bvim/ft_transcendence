import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { UsersRepository } from '../repositories/users-repository';
import { WebAuthnCredentialsRepository } from '../repositories/webauthn-credentials-repository';
import { UserNotFoundError } from './errors/user-not-found-error';
import { InvalidCredentialsError } from './errors/invalid-credentials-error';
import { env } from '../env';
import { WebAuthnCredential } from '@prisma/client';

interface VerifyWebAuthnRegistrationUseCaseRequest {
  userId: string;
  registrationResponse: any;
  expectedChallenge: string;
  name?: string;
}

interface VerifyWebAuthnRegistrationUseCaseResponse {
  credential: WebAuthnCredential;
  verified: boolean;
}

export class VerifyWebAuthnRegistrationUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private webAuthnCredentialsRepository: WebAuthnCredentialsRepository,
  ) {}

  async execute({
    userId,
    registrationResponse,
    expectedChallenge,
    name,
  }: VerifyWebAuthnRegistrationUseCaseRequest): Promise<VerifyWebAuthnRegistrationUseCaseResponse> {
    // Check if user exists
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    // Verify the registration response
    const verification = await verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge,
      expectedOrigin: env.WEBAUTHN_ORIGIN,
      expectedRPID: env.WEBAUTHN_RP_ID,
      requireUserVerification: false,
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new InvalidCredentialsError();
    }

    const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;

    // Convert credentialID to base64url string if it's not already
    const credentialIdString = typeof credentialID === 'string' 
      ? credentialID 
      : Buffer.from(credentialID).toString('base64url');

    // Convert public key to base64url string
    const publicKeyString = Buffer.from(credentialPublicKey).toString('base64url');

    // Store the credential
    const credential = await this.webAuthnCredentialsRepository.create({
      userId,
      credentialID: credentialIdString,
      publicKey: publicKeyString,
      counter,
      name: name || null,
      transports: registrationResponse.response.transports 
        ? JSON.stringify(registrationResponse.response.transports) 
        : null,
    });

    return {
      credential,
      verified: true,
    };
  }
} 