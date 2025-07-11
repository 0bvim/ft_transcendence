import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository";
import { PrismaRefreshTokensRepository } from "../../repositories/prisma/prisma-refresh-tokens-repository";
import { SoftDeleteUseCase } from "../../use-cases/soft-delete";
import { UserNotFoundError } from "../../use-cases/errors/user-not-found-error";
import { UserAlreadyDeletedError } from "../../use-cases/errors/user-already-deleted-error";

export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
  const deleteParamsSchema = z.object({
    id: z.string(),
  });

  const { id } = deleteParamsSchema.parse(request.params);

  try {
    const usersRepository = new PrismaUsersRepository();
    const refreshTokensRepository = new PrismaRefreshTokensRepository();
    const softDeleteUseCase = new SoftDeleteUseCase(usersRepository, refreshTokensRepository);

    const { user } = await softDeleteUseCase.execute({
      userId: id,
    });

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return reply.status(200).send({
      user: userWithoutPassword,
    });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return reply.status(404).send({ error: "User not found" });
    }

    if (err instanceof UserAlreadyDeletedError) {
      return reply.status(409).send({ error: "User is already deleted" });
    }

    throw err;
  }
} 