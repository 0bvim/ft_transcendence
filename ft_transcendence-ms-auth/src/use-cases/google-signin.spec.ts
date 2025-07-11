import { it, describe, expect, beforeEach } from "vitest";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository";
import { InMemoryRefreshTokensRepository } from "../repositories/in-memory/in-memory-refresh-tokens-repository";
import { GoogleSignInUseCase } from "./google-signin";
import { hash } from "bcryptjs";
import { UserAlreadyExistsError } from "./errors/user-already-exists-error";
import dotenv from "dotenv";

// load environment variables from .env file
dotenv.config();

describe("Google Sign-In Use Case", () => {
  let usersRepository: InMemoryUsersRepository;
  let refreshTokensRepository: InMemoryRefreshTokensRepository;
  let googleSignInUseCase: GoogleSignInUseCase;

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    refreshTokensRepository = new InMemoryRefreshTokensRepository();
    googleSignInUseCase = new GoogleSignInUseCase(
      usersRepository,
      refreshTokensRepository,
    );
  });

  it("should be able to sign in with Google for new user", async () => {
    const { user, accessToken, refreshToken } = await googleSignInUseCase.execute({
      googleId: "google-123456789",
      email: "john.doe@gmail.com",
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user.email).toBe("john.doe@gmail.com");
    expect(user.googleId).toBe("google-123456789");
    expect(user.username).toBe("john.doe"); // Generated from email
    expect(user.password).toBeNull();
    expect(accessToken).toEqual(expect.any(String));
    expect(refreshToken).toEqual(expect.any(String));
  });

  it("should be able to sign in with Google for existing user", async () => {
    // Create existing user with Google ID
    await usersRepository.create({
      username: "johndoe",
      email: "john.doe@gmail.com",
      googleId: "google-123456789",
    });

    const { user, accessToken, refreshToken } = await googleSignInUseCase.execute({
      googleId: "google-123456789",
      email: "john.doe@gmail.com",
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user.email).toBe("john.doe@gmail.com");
    expect(user.googleId).toBe("google-123456789");
    expect(user.username).toBe("johndoe");
    expect(accessToken).toEqual(expect.any(String));
    expect(refreshToken).toEqual(expect.any(String));
  });

  it("should not be able to sign in with Google if email already exists with different account", async () => {
    // Create existing user with same email but no Google ID
    await usersRepository.create({
      username: "johndoe",
      email: "john.doe@gmail.com",
      password: await hash("password123", 6),
    });

    await expect(() =>
      googleSignInUseCase.execute({
        googleId: "google-123456789",
        email: "john.doe@gmail.com",
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });

  it("should generate unique username if email username is taken", async () => {
    // Create existing user with username that would conflict
    await usersRepository.create({
      username: "john.doe",
      email: "existing@example.com",
      password: await hash("password123", 6),
    });

    const { user } = await googleSignInUseCase.execute({
      googleId: "google-123456789",
      email: "john.doe@gmail.com",
    });

    expect(user.username).not.toBe("john.doe");
    expect(user.username).toContain("john.doe");
    expect(user.email).toBe("john.doe@gmail.com");
  });

  it("should be able to link Google account to existing user", async () => {
    // Create existing user with same email but no Google ID
    const existingUser = await usersRepository.create({
      username: "johndoe",
      email: "john.doe@gmail.com",
      password: await hash("password123", 6),
    });

    const { user, accessToken, refreshToken } = await googleSignInUseCase.execute({
      googleId: "google-123456789",
      email: "john.doe@gmail.com",
      linkAccount: true,
    });

    expect(user.id).toBe(existingUser.id);
    expect(user.email).toBe("john.doe@gmail.com");
    expect(user.googleId).toBe("google-123456789");
    expect(user.username).toBe("johndoe");
    expect(user.password).not.toBeNull(); // Password should be preserved
    expect(accessToken).toEqual(expect.any(String));
    expect(refreshToken).toEqual(expect.any(String));
  });

  it("should not be able to sign in with deleted user", async () => {
    // Create and delete user
    const user = await usersRepository.create({
      username: "johndoe",
      email: "john.doe@gmail.com",
      googleId: "google-123456789",
    });

    await usersRepository.softDelete(user.id);

    await expect(() =>
      googleSignInUseCase.execute({
        googleId: "google-123456789",
        email: "john.doe@gmail.com",
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });
}); 