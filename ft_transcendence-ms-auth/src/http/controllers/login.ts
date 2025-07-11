import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository";
import { AuthenticateUseCase } from "../../use-cases/authenticate";
import { InvalidCredentialsError } from "../../use-cases/errors/invalid-credentials-error";
import { PrismaRefreshTokensRepository } from "../../repositories/prisma/prisma-refresh-tokens-repository";

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const loginBodySchema = z.object({
    login: z.string(), // can be email or username
    password: z.string().min(8),
  });

  const { login, password } = loginBodySchema.parse(request.body);

  try {
    const usersRepository = new PrismaUsersRepository();
    const refreshTokensRepository = new PrismaRefreshTokensRepository();
    const authenticateUseCase = new AuthenticateUseCase(
      usersRepository,
      refreshTokensRepository,
    );

    const { user, accessToken, refreshToken } =
      await authenticateUseCase.execute({
        login,
        password,
      });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return reply.status(200).send({
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return reply.status(401).send({ error: "Invalid email or password" });
    }
    throw err;
  }
}
