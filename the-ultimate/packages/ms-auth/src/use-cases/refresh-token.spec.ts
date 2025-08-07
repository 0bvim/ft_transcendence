import { it, describe, expect, beforeEach, vi, afterEach } from "vitest";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository";
import { InMemoryRefreshTokensRepository } from "../repositories/in-memory/in-memory-refresh-tokens-repository";
import { createHash } from "node:crypto";
import { RefreshTokenUseCase } from "./refresh-token";
import { InvalidRefreshTokenError } from "./errors/invalid-refresh-token-error";
import { User } from "@prisma/client";

describe("Refresh Token Use Case", () => {
  let usersRepository: InMemoryUsersRepository;
  let refreshTokensRepository: InMemoryRefreshTokensRepository;
  let refreshTokenUseCase: RefreshTokenUseCase;
  let testUser: User;

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    refreshTokensRepository = new InMemoryRefreshTokensRepository();
    refreshTokenUseCase = new RefreshTokenUseCase(
      usersRepository,
      refreshTokensRepository,
    );
    testUser = await usersRepository.create({
      username: "johndoe",
      email: "johndoe@example.com",
      password: "password_hash",
    });
    vi.useFakeTimers(); // Use fake timers to control time
  });

  afterEach(() => {
    vi.useRealTimers(); // Restore real timers after each test
  });

  it("should be able to refresh a token", async () => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const oldToken = "valid-refresh-token";
    const hashedOldToken = createHash("sha256").update(oldToken).digest("hex");
    await refreshTokensRepository.create({
      userId: testUser.id,
      hashedToken: hashedOldToken,
      expiresAt: thirtyDaysFromNow,
    });

    const { accessToken, refreshToken } = await refreshTokenUseCase.execute({
      token: oldToken,
    });

    const revokedToken =
      await refreshTokensRepository.findByToken(hashedOldToken);

    expect(accessToken).toEqual(expect.any(String));
    expect(refreshToken).not.toEqual(oldToken); // A new token is issued
    expect(revokedToken?.revoked).toBe(true); // The old token is revoked
  });

  it("should not be able to refresh with a non-existent token", async () => {
    await expect(
      refreshTokenUseCase.execute({ token: "non-existent-token" }),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
  });

  it("should not be able to refresh with a revoked token", async () => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const oldToken = "revoked-refresh-token";
    const hashedOldToken = createHash("sha256").update(oldToken).digest("hex");
    const token = await refreshTokensRepository.create({
      userId: testUser.id,
      hashedToken: hashedOldToken,
      expiresAt: thirtyDaysFromNow,
    });
    await refreshTokensRepository.revoke(token.id);

    await expect(
      refreshTokenUseCase.execute({ token: oldToken }),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
  });

  it("should not be able to refresh with an expired token", async () => {
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 1); // 1 day in the past

    const oldToken = "expired-refresh-token";
    const hashedOldToken = createHash("sha256").update(oldToken).digest("hex");
    await refreshTokensRepository.create({
      userId: testUser.id,
      hashedToken: hashedOldToken,
      expiresAt: expiredDate,
    });

    await expect(
      refreshTokenUseCase.execute({ token: oldToken }),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
  });
});
