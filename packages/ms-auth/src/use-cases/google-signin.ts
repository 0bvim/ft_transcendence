import { RefreshTokensRepository } from "../repositories/refresh-tokens-repository";
import { UsersRepository } from "../repositories/users-repository";
import { UserAlreadyExistsError } from "./errors/user-already-exists-error";
import { sign } from "jsonwebtoken";
import { env } from "../env";
import { createHash, randomBytes } from "node:crypto";
import { User } from "@prisma/client";
import dayjs from "dayjs";

interface GoogleSignInUseCaseRequest {
  googleId: string;
  email: string;
  linkAccount?: boolean;
}

interface GoogleSignInUseCaseResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export class GoogleSignInUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private refreshTokensRepository: RefreshTokensRepository,
  ) {}

  async execute({
    googleId,
    email,
    linkAccount = false,
  }: GoogleSignInUseCaseRequest): Promise<GoogleSignInUseCaseResponse> {
    let user = await this.usersRepository.findByGoogleId(googleId);

    if (user) {
      if (user.deletedAt) {
        throw new UserAlreadyExistsError();
      }

      return this.generateTokens(user);
    }

    const existingUserByEmail = await this.usersRepository.findByEmail(email);

    if (existingUserByEmail) {
      if (existingUserByEmail.deletedAt) {
        throw new UserAlreadyExistsError();
      }

      if (linkAccount) {
        user = await this.usersRepository.update(existingUserByEmail.id, {
          googleId,
        });

        return this.generateTokens(user);
      } else {
        throw new UserAlreadyExistsError();
      }
    }

    // Create new user
    const username = await this.generateUniqueUsername(email);

    user = await this.usersRepository.create({
      username,
      email,
      googleId,
      password: undefined, // No password for Google-only accounts
    });

    return this.generateTokens(user);
  }

  private async generateTokens(user: User) {
    // Generate access token
    const accessToken = sign({ username: user.username }, env.JWT_SECRET, {
      subject: user.id,
      expiresIn: "15m",
    });

    // Generate refresh token
    const clearRefreshToken = randomBytes(32).toString("hex");
    const hashedRefreshToken = createHash("sha256")
      .update(clearRefreshToken)
      .digest("hex");

    const refreshTokenExpiresAt = dayjs().add(30, "day").toDate();
    await this.refreshTokensRepository.create({
      userId: user.id,
      hashedToken: hashedRefreshToken,
      expiresAt: refreshTokenExpiresAt,
    });

    return {
      user,
      accessToken,
      refreshToken: clearRefreshToken,
    };
  }

  private async generateUniqueUsername(email: string): Promise<string> {
    const baseUsername = email.split("@")[0].toLowerCase();
    let username = baseUsername;
    let counter = 1;

    // Check if username already exists
    while (await this.usersRepository.findByUsername(username)) {
      username = `${baseUsername}.${counter}`;
      counter++;
    }

    return username;
  }
}
