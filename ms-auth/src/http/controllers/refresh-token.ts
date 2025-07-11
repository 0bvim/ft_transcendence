import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository";
import { PrismaRefreshTokensRepository } from "../../repositories/prisma/prisma-refresh-tokens-repository";
import { RefreshTokenUseCase } from "../../use-cases/refresh-token";
import { InvalidRefreshTokenError } from "../../use-cases/errors/invalid-refresh-token-error";

export async function refreshToken(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const refreshTokenBodySchema = z.object({
    token: z.string(),
  });

  const { token } = refreshTokenBodySchema.parse(request.body);

  try {
    const usersRepository = new PrismaUsersRepository();
    const refreshTokensRepository = new PrismaRefreshTokensRepository();
    const refreshTokenUseCase = new RefreshTokenUseCase(
      usersRepository,
      refreshTokensRepository,
    );

    const { accessToken, refreshToken } = await refreshTokenUseCase.execute({
      token,
    });

    return reply.status(200).send({
      accessToken,
      refreshToken,
    });
  } catch (err) {
    if (err instanceof InvalidRefreshTokenError) {
      return reply
        .status(401)
        .send({ error: "Unauthorized: Invalid refresh token." });
    }
    throw err;
  }
}
