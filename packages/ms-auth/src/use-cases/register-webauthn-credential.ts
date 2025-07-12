import { UsersRepository } from "../repositories/users-repository";
import { WebAuthnCredentialsRepository } from "../repositories/webauthn-credentials-repository";
import { UserNotFoundError } from "./errors/user-not-found-error";
import { WebAuthnCredential } from "@prisma/client";

interface RegisterWebAuthnCredentialUseCaseRequest {
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  name?: string;
  transports?: string[];
}

interface RegisterWebAuthnCredentialUseCaseResponse {
  credential: WebAuthnCredential;
}

export class RegisterWebAuthnCredentialUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private webAuthnCredentialsRepository: WebAuthnCredentialsRepository,
  ) {}

  async execute({
    userId,
    credentialId,
    publicKey,
    counter,
    name,
    transports,
  }: RegisterWebAuthnCredentialUseCaseRequest): Promise<RegisterWebAuthnCredentialUseCaseResponse> {
    // Check if user exists
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    // Create the WebAuthn credential
    const credential = await this.webAuthnCredentialsRepository.create({
      userId,
      credentialID: credentialId,
      publicKey,
      counter,
      name: name || null,
      transports: transports ? JSON.stringify(transports) : null,
    });

    return {
      credential,
    };
  }
} 