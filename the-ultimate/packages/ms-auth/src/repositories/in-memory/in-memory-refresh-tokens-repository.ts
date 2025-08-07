import { Prisma, RefreshToken } from "@prisma/client";
import { RefreshTokensRepository } from "../refresh-tokens-repository";
import { randomUUID } from "node:crypto";

export class InMemoryRefreshTokensRepository
  implements RefreshTokensRepository
{
  public items: RefreshToken[] = [];

  async create(
    data: Prisma.RefreshTokenUncheckedCreateInput,
  ): Promise<RefreshToken> {
    const refreshToken: RefreshToken = {
      id: randomUUID(),
      hashedToken: data.hashedToken,
      userId: data.userId,
      revoked: data.revoked ?? false,
      expiresAt: new Date(data.expiresAt),
      createdAt: new Date(),
    };

    this.items.push(refreshToken);

    return refreshToken;
  }

  async findByToken(hashedToken: string): Promise<RefreshToken | null> {
    const refreshToken = this.items.find(
      (item) => item.hashedToken === hashedToken,
    );

    return refreshToken ?? null;
  }

  async revoke(id: string): Promise<RefreshToken> {
    const token = this.items.find((item) => item.id === id);

    if (!token) {
      throw new Error("Token not found to be revoked.");
    }

    token.revoked = true;

    return token;
  }

  async revokeAllForUser(userId: string): Promise<void> {
    this.items.forEach((token) => {
      if (token.userId === userId && !token.revoked) {
        token.revoked = true;
      }
    });
  }
}
