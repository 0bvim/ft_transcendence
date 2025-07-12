import { Prisma } from "@prisma/client";
import { RefreshTokensRepository } from "../refresh-tokens-repository";
import { prisma } from "../../lib/prisma";

export class PrismaRefreshTokensRepository implements RefreshTokensRepository {
  async create(data: Prisma.RefreshTokenUncheckedCreateInput) {
    const refreshToken = await prisma.refreshToken.create({
      data,
    });

    return refreshToken;
  }

  async findByToken(hashedToken: string) {
    const refreshToken = await prisma.refreshToken.findFirst({
      where: {
        hashedToken,
        revoked: false,
      },
    });

    return refreshToken || null;
  }

  async revoke(id: string) {
    const refreshToken = await prisma.refreshToken.update({
      where: {
        id,
      },
      data: {
        revoked: true,
      },
    });

    return refreshToken;
  }

  async revokeAllForUser(userId: string) {
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        revoked: false,
      },
      data: {
        revoked: true,
      },
    });
  }
}
