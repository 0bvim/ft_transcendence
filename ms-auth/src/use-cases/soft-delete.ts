import { User } from "@prisma/client";
import { UsersRepository } from "../repositories/users-repository";
import { RefreshTokensRepository } from "../repositories/refresh-tokens-repository";
import { UserNotFoundError } from "./errors/user-not-found-error";
import { UserAlreadyDeletedError } from "./errors/user-already-deleted-error";

interface SoftDeleteUseCaseRequest {
  userId: string;
}

interface SoftDeleteUseCaseResponse {
  user: User;
}

export class SoftDeleteUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private refreshTokensRepository: RefreshTokensRepository,
  ) {}

  async execute({
    userId,
  }: SoftDeleteUseCaseRequest): Promise<SoftDeleteUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    if (user.deletedAt) {
      throw new UserAlreadyDeletedError();
    }

    // Revoke all refresh tokens for the user before soft deleting
    await this.refreshTokensRepository.revokeAllForUser(userId);

    const deletedUser = await this.usersRepository.softDelete(userId);

    return {
      user: deletedUser,
    };
  }
} 