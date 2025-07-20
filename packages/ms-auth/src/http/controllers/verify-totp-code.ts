import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository";
import { VerifyTotpCodeUseCase } from "../../use-cases/verify-totp-code";
import { UserNotFoundError } from "../../use-cases/errors/user-not-found-error";
import { InvalidCredentialsError } from "../../use-cases/errors/invalid-credentials-error";

export async function verifyTotpCode(request: FastifyRequest, reply: FastifyReply) {
  const verifyTotpBodySchema = z.object({
    userId: z.string(),
    code: z.string().length(6, "TOTP code must be exactly 6 digits"),
  });

  try {
    const { userId, code } = verifyTotpBodySchema.parse(request.body);

    const usersRepository = new PrismaUsersRepository();
    const verifyTotpUseCase = new VerifyTotpCodeUseCase(
      usersRepository,
    );

    const { verified, user } = await verifyTotpUseCase.execute({
      userId,
      code,
    });

    return reply.status(200).send({
      verified,
      user,
      message: "TOTP verification successful",
    });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return reply.status(404).send({ error: "User not found" });
    }
    
    if (err instanceof InvalidCredentialsError) {
      return reply.status(401).send({ error: "Invalid TOTP code" });
    }

    request.log.error('Verify TOTP error:', err);
    return reply.status(500).send({ error: "Failed to verify TOTP code" });
  }
} 