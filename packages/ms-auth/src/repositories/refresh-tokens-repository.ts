import { Prisma, RefreshToken } from "@prisma/client";

export interface RefreshTokensRepository {
  create(data: Prisma.RefreshTokenUncheckedCreateInput): Promise<RefreshToken>;
  findByToken(token: string): Promise<RefreshToken | null>;
  revoke(id: string): Promise<RefreshToken>;
  revokeAllForUser(userId: string): Promise<void>;
}
