import { Prisma, WebAuthnCredential } from "@prisma/client";
import { WebAuthnCredentialsRepository } from "../webauthn-credentials-repository";
import { randomUUID } from "node:crypto";

export class InMemoryWebAuthnCredentialsRepository implements WebAuthnCredentialsRepository {
  public items: WebAuthnCredential[] = [];

  async create(data: Prisma.WebAuthnCredentialUncheckedCreateInput): Promise<WebAuthnCredential> {
    const credential: WebAuthnCredential = {
      id: randomUUID(),
      userId: data.userId,
      credentialID: data.credentialID,
      publicKey: data.publicKey,
      counter: data.counter || 0,
      name: data.name || null,
      transports: data.transports || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUsed: null,
    };

    this.items.push(credential);
    return credential;
  }

  async findById(id: string): Promise<WebAuthnCredential | null> {
    const credential = this.items.find((item) => item.id === id);
    return credential || null;
  }

  async findByCredentialId(credentialId: string): Promise<WebAuthnCredential | null> {
    const credential = this.items.find((item) => item.credentialID === credentialId);
    return credential || null;
  }

  async findByUserId(userId: string): Promise<WebAuthnCredential[]> {
    return this.items.filter((item) => item.userId === userId);
  }

  async updateCounter(id: string, counter: number): Promise<WebAuthnCredential> {
    const credentialIndex = this.items.findIndex((item) => item.id === id);
    
    if (credentialIndex === -1) {
      throw new Error("Credential not found");
    }

    this.items[credentialIndex] = {
      ...this.items[credentialIndex],
      counter,
      updatedAt: new Date(),
    };

    return this.items[credentialIndex];
  }

  async updateLastUsed(id: string): Promise<WebAuthnCredential> {
    const credentialIndex = this.items.findIndex((item) => item.id === id);
    
    if (credentialIndex === -1) {
      throw new Error("Credential not found");
    }

    this.items[credentialIndex] = {
      ...this.items[credentialIndex],
      lastUsed: new Date(),
      updatedAt: new Date(),
    };

    return this.items[credentialIndex];
  }

  async delete(id: string): Promise<void> {
    const credentialIndex = this.items.findIndex((item) => item.id === id);
    
    if (credentialIndex === -1) {
      throw new Error("Credential not found");
    }

    this.items.splice(credentialIndex, 1);
  }
} 