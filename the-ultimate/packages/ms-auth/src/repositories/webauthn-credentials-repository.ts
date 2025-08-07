import { Prisma, WebAuthnCredential } from "@prisma/client";

export interface WebAuthnCredentialsRepository {
  create(data: Prisma.WebAuthnCredentialUncheckedCreateInput): Promise<WebAuthnCredential>;
  findById(id: string): Promise<WebAuthnCredential | null>;
  findByCredentialId(credentialId: string): Promise<WebAuthnCredential | null>;
  findByUserId(userId: string): Promise<WebAuthnCredential[]>;
  updateCounter(id: string, counter: number): Promise<WebAuthnCredential>;
  updateLastUsed(id: string): Promise<WebAuthnCredential>;
  delete(id: string): Promise<void>;
} 