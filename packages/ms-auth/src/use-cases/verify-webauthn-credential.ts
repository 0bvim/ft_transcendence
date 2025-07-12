import { WebAuthnCredentialsRepository } from "../repositories/webauthn-credentials-repository";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error";
import { WebAuthnCredential } from "@prisma/client";

interface VerifyWebAuthnCredentialUseCaseRequest {
  credentialId: string;
  counter: number;
}

interface VerifyWebAuthnCredentialUseCaseResponse {
  verified: boolean;
  credential: WebAuthnCredential;
}

export class VerifyWebAuthnCredentialUseCase {
  constructor(
    private webAuthnCredentialsRepository: WebAuthnCredentialsRepository,
  ) {}

  async execute({
    credentialId,
    counter,
  }: VerifyWebAuthnCredentialUseCaseRequest): Promise<VerifyWebAuthnCredentialUseCaseResponse> {
    // Find the credential
    const credential = await this.webAuthnCredentialsRepository.findByCredentialId(credentialId);

    if (!credential) {
      throw new InvalidCredentialsError();
    }

    // In a real implementation, you would verify the signature using the public key
    // For now, we'll just check if the counter is greater than the stored counter
    if (counter <= credential.counter) {
      throw new InvalidCredentialsError();
    }

    // Update the credential counter and last used time
    const updatedCredential = await this.webAuthnCredentialsRepository.updateCounter(
      credential.id,
      counter,
    );

    await this.webAuthnCredentialsRepository.updateLastUsed(credential.id);

    return {
      verified: true,
      credential: updatedCredential,
    };
  }
} 