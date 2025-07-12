import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { WebAuthnCredentialsRepository } from '../repositories/webauthn-credentials-repository';
import { InvalidCredentialsError } from './errors/invalid-credentials-error';
import { env } from '../env';
import { WebAuthnCredential } from '@prisma/client';

interface VerifyWebAuthnAuthenticationUseCaseRequest {
  authenticationResponse: any;
  expectedChallenge: string;
  userId?: string;
}

interface VerifyWebAuthnAuthenticationUseCaseResponse {
  credential: WebAuthnCredential;
  verified: boolean;
}

export class VerifyWebAuthnAuthenticationUseCase {
  constructor(
    private webAuthnCredentialsRepository: WebAuthnCredentialsRepository,
  ) {}

  async execute({
    authenticationResponse,
    expectedChallenge,
    userId,
  }: VerifyWebAuthnAuthenticationUseCaseRequest): Promise<VerifyWebAuthnAuthenticationUseCaseResponse> {
    // Get the credential ID from the response
    const credentialID = authenticationResponse.id;

    // Find the credential
    const credential = await this.webAuthnCredentialsRepository.findByCredentialId(credentialID);

    if (!credential) {
      throw new InvalidCredentialsError();
    }

    // If userId is provided, verify it matches
    if (userId && credential.userId !== userId) {
      throw new InvalidCredentialsError();
    }

    // Convert stored public key back to Uint8Array
    const publicKey = Buffer.from(credential.publicKey, 'base64url');

    // Verify the authentication response
    const verification = await verifyAuthenticationResponse({
      response: authenticationResponse,
      expectedChallenge,
      expectedOrigin: env.WEBAUTHN_ORIGIN,
      expectedRPID: env.WEBAUTHN_RP_ID,
      authenticator: {
        credentialID: credential.credentialID,
        credentialPublicKey: publicKey,
        counter: credential.counter,
        transports: credential.transports ? JSON.parse(credential.transports) : undefined,
      },
      requireUserVerification: false,
    });

    if (!verification.verified) {
      throw new InvalidCredentialsError();
    }

    // Update the credential counter and last used time
    const updatedCredential = await this.webAuthnCredentialsRepository.updateCounter(
      credential.id,
      verification.authenticationInfo.newCounter,
    );

    await this.webAuthnCredentialsRepository.updateLastUsed(credential.id);

    return {
      credential: updatedCredential,
      verified: true,
    };
  }
} 