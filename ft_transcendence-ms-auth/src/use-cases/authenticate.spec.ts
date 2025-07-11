import { it, describe, expect, beforeEach } from "vitest";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository";
import { AuthenticateUseCase } from "./authenticate";
import { hash } from "bcryptjs";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error";
import { InMemoryRefreshTokensRepository } from "../repositories/in-memory/in-memory-refresh-tokens-repository";
import dotenv from "dotenv";

// load environment variables from .env file
dotenv.config();

describe("Authenticate Use Case", () => {
  let usersRepository: InMemoryUsersRepository;
  let refreshTokensRepository: InMemoryRefreshTokensRepository;
  let authenticateUseCase: AuthenticateUseCase;

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    refreshTokensRepository = new InMemoryRefreshTokensRepository();
    authenticateUseCase = new AuthenticateUseCase(
      usersRepository,
      refreshTokensRepository,
    );

    // create a user for testing
    await usersRepository.create({
      username: "johndoe",
      email: "johndoe@example.com",
      password: await hash("password123", Number(process.env.SALT_LEN) || 6),
    });
  });

  it("should be able to authenticate", async () => {
    const { accessToken, refreshToken, user } =
      await authenticateUseCase.execute({
        login: "johndoe@example.com",
        password: "password123",
      });

    expect(user.id).toEqual(expect.any(String));
    expect(accessToken).toEqual(expect.any(String));
    expect(refreshToken).toEqual(expect.any(String));
  });

  it("should not be able to authenticate with wrong password", async () => {
    await expect(() =>
      authenticateUseCase.execute({
        login: "johndoe@example.com",
        password: "wrong-password",
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("should not be able to authenticate with no existent user", async () => {
    await expect(() =>
      authenticateUseCase.execute({
        login: "nonexistent@example.com",
        password: "password123",
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
