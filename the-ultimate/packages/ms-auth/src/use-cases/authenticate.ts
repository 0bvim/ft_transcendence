import { compare } from "bcryptjs";
import { RefreshTokensRepository } from "../repositories/refresh-tokens-repository";
import { UsersRepository } from "../repositories/users-repository";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error";
import { sign } from "jsonwebtoken";
import { env } from "../env";
import { createHash, randomBytes } from "node:crypto";
import { User } from "@prisma/client";
import dayjs from "dayjs";

interface AuthenticateUseCaseRequest {
  login: string;
  password: string;
}

interface AuthenticateUseCaseResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export class AuthenticateUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private refreshTokensRepository: RefreshTokensRepository,
  ) {}

  async execute({
    login,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const user = login.includes("@")
      ? await this.usersRepository.findByEmail(login)
      : await this.usersRepository.findByUsername(login);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (user.deletedAt) {
      throw new InvalidCredentialsError();
    }

    const doesPasswordMatch = await compare(password, user.password!);

    if (!doesPasswordMatch) {
      throw new InvalidCredentialsError();
    }

    // generate access token
    const accessToken = sign({ username: user.username }, env.JWT_SECRET, {
      subject: user.id,
      expiresIn: "15m",
    });

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
}
