import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository";
import { CompleteTwoFactorSetupUseCase } from "../../use-cases/complete-two-factor-setup";
import { UserNotFoundError } from "../../use-cases/errors/user-not-found-error";
import { InvalidCredentialsError } from "../../use-cases/errors/invalid-credentials-error";

export async function completeTwoFactorSetup(request: FastifyRequest, reply: FastifyReply) {
  const completeTwoFactorSetupBodySchema = z.object({
    userId: z.string(),
    code: z.string().length(6, "TOTP code must be exactly 6 digits"),
  });

  try {
    request.log.info('🔍 Complete 2FA Setup Request:', {
      body: request.body,
      headers: request.headers,
      method: request.method,
      url: request.url,
      time: new Date().toISOString()
    });

    const { userId, code } = completeTwoFactorSetupBodySchema.parse(request.body);
    
    request.log.info('🔍 Parsed data:', { userId, code, codeLength: code.length });

    const usersRepository = new PrismaUsersRepository();
    const completeTwoFactorSetupUseCase = new CompleteTwoFactorSetupUseCase(
      usersRepository,
    );

    const { enabled, user } = await completeTwoFactorSetupUseCase.execute({
      userId,
      code,
    });

    return reply.status(200).send({
      enabled,
      user,
      message: "Two-factor authentication setup completed successfully",
    });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return reply.status(404).send({ error: "User not found" });
    }
    
    if (err instanceof InvalidCredentialsError) {
      return reply.status(401).send({ error: "Invalid TOTP code" });
    }

    request.log.error('Complete 2FA setup error:', err);
    return reply.status(500).send({ error: "Failed to complete 2FA setup" });
  }
} 