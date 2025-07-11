import { it, describe, expect, beforeEach } from "vitest";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository";
import { InMemoryRefreshTokensRepository } from "../repositories/in-memory/in-memory-refresh-tokens-repository";
import { SoftDeleteUseCase } from "./soft-delete";
import { hash } from "bcryptjs";
import { UserNotFoundError } from "./errors/user-not-found-error";
import { UserAlreadyDeletedError } from "./errors/user-already-deleted-error";
import { createHash } from "node:crypto";
import dayjs from "dayjs";

describe("Soft Delete Use Case", () => {
  let usersRepository: InMemoryUsersRepository;
  let refreshTokensRepository: InMemoryRefreshTokensRepository;
  let softDeleteUseCase: SoftDeleteUseCase;

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    refreshTokensRepository = new InMemoryRefreshTokensRepository();
    softDeleteUseCase = new SoftDeleteUseCase(usersRepository, refreshTokensRepository);

    // create a user for testing
    await usersRepository.create({
      username: "johndoe",
      email: "johndoe@example.com",
      password: await hash("password123", 6),
    });
  });

  it("should be able to soft delete a user by id", async () => {
    const users = usersRepository.items;
    const user = users[0];

    const result = await softDeleteUseCase.execute({
      userId: user.id,
    });

    expect(result.user.id).toEqual(user.id);
    expect(result.user.deletedAt).toBeInstanceOf(Date);
    expect(result.user.deletedAt).not.toBeNull();
    
    // Verify user is soft deleted in repository
    const deletedUser = await usersRepository.findById(user.id);
    expect(deletedUser?.deletedAt).toBeInstanceOf(Date);
  });

  it("should revoke all refresh tokens before soft deleting user", async () => {
    const users = usersRepository.items;
    const user = users[0];

    // Create some refresh tokens for the user
    const token1 = createHash("sha256").update("token1").digest("hex");
    const token2 = createHash("sha256").update("token2").digest("hex");
    
    await refreshTokensRepository.create({
      userId: user.id,
      hashedToken: token1,
      expiresAt: dayjs().add(30, "days").toDate(),
    });

    await refreshTokensRepository.create({
      userId: user.id,
      hashedToken: token2,
      expiresAt: dayjs().add(30, "days").toDate(),
    });

    // Verify tokens are not revoked initially
    const initialTokens = refreshTokensRepository.items.filter(
      (token) => token.userId === user.id && !token.revoked
    );
    expect(initialTokens).toHaveLength(2);

    // Soft delete the user
    await softDeleteUseCase.execute({
      userId: user.id,
    });

    // Verify all tokens are revoked
    const revokedTokens = refreshTokensRepository.items.filter(
      (token) => token.userId === user.id && token.revoked
    );
    expect(revokedTokens).toHaveLength(2);
  });

  it("should not be able to soft delete a user that does not exist", async () => {
    await expect(() =>
      softDeleteUseCase.execute({
        userId: "non-existent-id",
      }),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it("should not be able to soft delete a user that is already soft deleted", async () => {
    const users = usersRepository.items;
    const user = users[0];

    // First soft delete
    await softDeleteUseCase.execute({
      userId: user.id,
    });

    // Try to soft delete again
    await expect(() =>
      softDeleteUseCase.execute({
        userId: user.id,
      }),
    ).rejects.toBeInstanceOf(UserAlreadyDeletedError);
  });
}); 