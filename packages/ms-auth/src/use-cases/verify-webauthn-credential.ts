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
    const credential =
      await this.webAuthnCredentialsRepository.findByCredentialId(credentialId);

    if (!credential) {
      throw new InvalidCredentialsError();
    }

    if (counter <= credential.counter) {
      throw new InvalidCredentialsError();
    }

    const updatedCredential =
      await this.webAuthnCredentialsRepository.updateCounter(
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
