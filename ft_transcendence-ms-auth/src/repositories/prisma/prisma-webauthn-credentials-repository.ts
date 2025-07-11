import { Prisma } from "@prisma/client";
import { WebAuthnCredentialsRepository } from "../webauthn-credentials-repository";
import { prisma } from "../../lib/prisma";

export class PrismaWebAuthnCredentialsRepository implements WebAuthnCredentialsRepository {
  async create(data: Prisma.WebAuthnCredentialUncheckedCreateInput) {
    const credential = await prisma.webAuthnCredential.create({
      data,
    });

    return credential;
  }

  async findById(id: string) {
    const credential = await prisma.webAuthnCredential.findUnique({
      where: {
        id,
      },
    });

    return credential;
  }

  async findByCredentialId(credentialId: string) {
    const credential = await prisma.webAuthnCredential.findUnique({
      where: {
        credentialID: credentialId,
      },
    });

    return credential;
  }

  async findByUserId(userId: string) {
    const credentials = await prisma.webAuthnCredential.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return credentials;
  }

  async updateCounter(id: string, counter: number) {
    const credential = await prisma.webAuthnCredential.update({
      where: {
        id,
      },
      data: {
        counter,
        updatedAt: new Date(),
      },
    });

    return credential;
  }

  async updateLastUsed(id: string) {
    const credential = await prisma.webAuthnCredential.update({
      where: {
        id,
      },
      data: {
        lastUsed: new Date(),
        updatedAt: new Date(),
      },
    });

    return credential;
  }

  async delete(id: string) {
    await prisma.webAuthnCredential.delete({
      where: {
        id,
      },
    });
  }
} 