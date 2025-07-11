import { sign } from "jsonwebtoken";
import { createHash } from "node:crypto";
import dayjs from "dayjs";
import { UsersRepository } from "../repositories/users-repository";
import { RefreshTokensRepository } from "../repositories/refresh-tokens-repository";
import { InvalidRefreshTokenError } from "./errors/invalid-refresh-token-error";
import { env } from "../env";
import { randomBytes } from "node:crypto";

interface RefreshTokenUseCaseRequest {
  token: string;
}

interface RefreshTokenUseCaseResponse {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private refreshTokensRepository: RefreshTokensRepository,
  ) {}

  async execute({
    token,
  }: RefreshTokenUseCaseRequest): Promise<RefreshTokenUseCaseResponse> {
    const hashedToken = createHash("sha256").update(token).digest("hex");

    const storedToken =
      await this.refreshTokensRepository.findByToken(hashedToken);

    if (!storedToken || storedToken.revoked) {
      throw new InvalidRefreshTokenError();
    }

    const isTokenExpired = dayjs().isAfter(dayjs(storedToken.expiresAt));

    if (isTokenExpired) {
      throw new InvalidRefreshTokenError();
    }

    // Find the associated user
    const user = await this.usersRepository.findById(storedToken.userId);

    if (!user || user.deletedAt) {
      throw new InvalidRefreshTokenError();
    }

    // Invalidate the used token
    await this.refreshTokensRepository.revoke(storedToken.id);

    // --- Generate New Tokens ---

    // 1. New Access Token
    const accessToken = sign({ username: user.username }, env.JWT_SECRET, {
      subject: user.id,
      expiresIn: "15m",
    });

    // 2. New Refresh Token
    const newRefreshToken = randomBytes(32).toString("hex");
    const hashedNewRefreshToken = createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");
    const newRefreshTokenExpiresAt = dayjs().add(30, "days").toDate();

    await this.refreshTokensRepository.create({
      userId: user.id,
      hashedToken: hashedNewRefreshToken,
      expiresAt: newRefreshTokenExpiresAt,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
