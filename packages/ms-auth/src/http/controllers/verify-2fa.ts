import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { sign } from "jsonwebtoken";
import { randomBytes, createHash } from "crypto";
import dayjs from "dayjs";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository";
import { PrismaRefreshTokensRepository } from "../../repositories/prisma/prisma-refresh-tokens-repository";
import { PrismaWebAuthnCredentialsRepository } from "../../repositories/prisma/prisma-webauthn-credentials-repository";
import { PrismaBackupCodesRepository } from "../../repositories/prisma/prisma-backup-codes-repository";
import { VerifyWebAuthnAuthenticationUseCase } from "../../use-cases/verify-webauthn-authentication";
import { VerifyBackupCodeUseCase } from "../../use-cases/verify-backup-code";
import { VerifyTotpCodeUseCase } from "../../use-cases/verify-totp-code";
import { UserNotFoundError } from "../../use-cases/errors/user-not-found-error";
import { InvalidCredentialsError } from "../../use-cases/errors/invalid-credentials-error";
import { sessionStore } from "../../lib/session-store";
import { env } from "../../env";

export async function verify2FA(request: FastifyRequest, reply: FastifyReply) {
  const verify2FABodySchema = z.object({
    userId: z.string(),
    method: z.enum(["webauthn", "backup_code", "totp", "sms", "email"]),
    sessionId: z.string().optional(),
    authenticationResponse: z.any().optional(),
    backupCode: z.string().optional(),
    totpCode: z.string().optional(),
    smsCode: z.string().optional(),
    emailCode: z.string().optional(),
  });

  try {
    const { 
      userId, 
      method, 
      sessionId, 
      authenticationResponse, 
      backupCode, 
      totpCode,
      smsCode,
      emailCode 
    } = verify2FABodySchema.parse(request.body);

    const usersRepository = new PrismaUsersRepository();
    const refreshTokensRepository = new PrismaRefreshTokensRepository();

    // Check if user exists and has 2FA enabled
    const user = await usersRepository.findById(userId);
    if (!user || !user.twoFactorEnabled) {
      return reply.status(401).send({ error: "Invalid user or 2FA not enabled" });
    }

    let verified = false;

    if (method === "webauthn") {
      if (!sessionId || !authenticationResponse) {
        return reply.status(400).send({ error: "Session ID and authentication response required for WebAuthn" });
      }

      // Get the session data
      const sessionData = sessionStore.get(sessionId);
      if (!sessionData || sessionData.type !== 'authentication' || sessionData.userId !== userId) {
        return reply.status(400).send({ error: "Invalid or expired session" });
      }

      const webAuthnCredentialsRepository = new PrismaWebAuthnCredentialsRepository();
      const verifyWebAuthnUseCase = new VerifyWebAuthnAuthenticationUseCase(
        webAuthnCredentialsRepository,
      );

      const { verified: webAuthnVerified } = await verifyWebAuthnUseCase.execute({
        authenticationResponse,
        expectedChallenge: sessionData.challenge,
        userId,
      });

      verified = webAuthnVerified;
      
      // Clean up session
      sessionStore.delete(sessionId);
    } else if (method === "backup_code") {
      if (!backupCode) {
        return reply.status(400).send({ error: "Backup code required" });
      }

      const backupCodesRepository = new PrismaBackupCodesRepository();
      const verifyBackupCodeUseCase = new VerifyBackupCodeUseCase(
        backupCodesRepository,
      );

      const { verified: backupCodeVerified } = await verifyBackupCodeUseCase.execute({
        code: backupCode,
      });

      verified = backupCodeVerified;
    } else if (method === "totp") {
      if (!totpCode) {
        return reply.status(400).send({ error: "TOTP code required" });
      }

      const verifyTotpUseCase = new VerifyTotpCodeUseCase(
        usersRepository,
      );

      const { verified: totpVerified } = await verifyTotpUseCase.execute({
        userId,
        code: totpCode,
      });

      verified = totpVerified;
    } else if (method === "sms") {
      if (!smsCode) {
        return reply.status(400).send({ error: "SMS code required" });
      }

      // In a real implementation, you would:
      // 1. Retrieve the stored SMS code from cache/session
      // 2. Compare with the provided code
      // 3. Check expiration time
      // For demo purposes, we'll accept a specific code
      verified = smsCode === "123456"; // Demo code
    } else if (method === "email") {
      if (!emailCode) {
        return reply.status(400).send({ error: "Email code required" });
      }

      // In a real implementation, you would:
      // 1. Retrieve the stored email code from cache/session
      // 2. Compare with the provided code
      // 3. Check expiration time
      // For demo purposes, we'll accept a specific code
      verified = emailCode === "123456"; // Demo code
    }

    if (!verified) {
      return reply.status(401).send({ error: "Invalid 2FA verification" });
    }

    // Generate tokens after successful 2FA verification
    const accessToken = sign({ username: user.username }, env.JWT_SECRET, {
      subject: user.id,
      expiresIn: "15m",
    });

    const clearRefreshToken = randomBytes(32).toString("hex");
    const hashedRefreshToken = createHash("sha256")
      .update(clearRefreshToken)
      .digest("hex");

    const refreshTokenExpiresAt = dayjs().add(30, "day").toDate();
    await refreshTokensRepository.create({
      userId: user.id,
      hashedToken: hashedRefreshToken,
      expiresAt: refreshTokenExpiresAt,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return reply.status(200).send({
      user: userWithoutPassword,
      accessToken,
      refreshToken: clearRefreshToken,
      message: "2FA verification successful",
    });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return reply.status(404).send({ error: "User not found" });
    }
    
    if (err instanceof InvalidCredentialsError) {
      return reply.status(401).send({ error: "Invalid 2FA verification" });
    }

    console.error("2FA verification error:", err);
    return reply.status(500).send({ error: "2FA verification failed" });
  }
} 