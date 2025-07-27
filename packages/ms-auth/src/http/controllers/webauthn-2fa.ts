import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { randomUUID } from "crypto";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository";
import { PrismaWebAuthnCredentialsRepository } from "../../repositories/prisma/prisma-webauthn-credentials-repository";
import { PrismaBackupCodesRepository } from "../../repositories/prisma/prisma-backup-codes-repository";
import { RegisterWebAuthnCredentialUseCase } from "../../use-cases/register-webauthn-credential";
import { VerifyWebAuthnCredentialUseCase } from "../../use-cases/verify-webauthn-credential";
import { GenerateWebAuthnRegistrationOptionsUseCase } from "../../use-cases/generate-webauthn-registration-options";
import { GenerateWebAuthnAuthenticationOptionsUseCase } from "../../use-cases/generate-webauthn-authentication-options";
import { VerifyWebAuthnRegistrationUseCase } from "../../use-cases/verify-webauthn-registration";
import { VerifyWebAuthnAuthenticationUseCase } from "../../use-cases/verify-webauthn-authentication";
import { EnableTwoFactorUseCase } from "../../use-cases/enable-two-factor";
import { DisableTwoFactorUseCase } from "../../use-cases/disable-two-factor";
import { GenerateBackupCodesUseCase } from "../../use-cases/generate-backup-codes";
import { VerifyBackupCodeUseCase } from "../../use-cases/verify-backup-code";
import { UserNotFoundError } from "../../use-cases/errors/user-not-found-error";
import { InvalidCredentialsError } from "../../use-cases/errors/invalid-credentials-error";
import { sessionStore } from "../../lib/session-store";

export async function registerWebAuthnCredential(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const registerCredentialBodySchema = z.object({
    userId: z.string(),
    credentialId: z.string(),
    publicKey: z.string(),
    counter: z.number().default(0),
    name: z.string().optional(),
    transports: z.array(z.string()).optional(),
  });

  try {
    const { userId, credentialId, publicKey, counter, name, transports } =
      registerCredentialBodySchema.parse(request.body);

    const usersRepository = new PrismaUsersRepository();
    const webAuthnCredentialsRepository =
      new PrismaWebAuthnCredentialsRepository();
    const registerWebAuthnCredentialUseCase =
      new RegisterWebAuthnCredentialUseCase(
        usersRepository,
        webAuthnCredentialsRepository,
      );

    const { credential } = await registerWebAuthnCredentialUseCase.execute({
      userId,
      credentialId,
      publicKey,
      counter,
      name,
      transports,
    });

    return reply.status(201).send({
      credential: {
        id: credential.id,
        credentialID: credential.credentialID,
        name: credential.name,
        transports: credential.transports
          ? JSON.parse(credential.transports)
          : null,
        createdAt: credential.createdAt,
      },
    });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return reply.status(404).send({ error: "User not found" });
    }

    console.error("Register WebAuthn credential error:", err);
    return reply
      .status(500)
      .send({ error: "Failed to register WebAuthn credential" });
  }
}

export async function verifyWebAuthnCredential(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const verifyCredentialBodySchema = z.object({
    credentialId: z.string(),
    counter: z.number(),
  });

  try {
    const { credentialId, counter } = verifyCredentialBodySchema.parse(
      request.body,
    );

    const webAuthnCredentialsRepository =
      new PrismaWebAuthnCredentialsRepository();
    const verifyWebAuthnCredentialUseCase = new VerifyWebAuthnCredentialUseCase(
      webAuthnCredentialsRepository,
    );

    const { verified, credential } =
      await verifyWebAuthnCredentialUseCase.execute({
        credentialId,
        counter,
      });

    return reply.status(200).send({
      verified,
      credential: {
        id: credential.id,
        name: credential.name,
        lastUsed: credential.lastUsed,
      },
    });
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return reply.status(401).send({ error: "Invalid WebAuthn credential" });
    }

    console.error("Verify WebAuthn credential error:", err);
    return reply
      .status(500)
      .send({ error: "Failed to verify WebAuthn credential" });
  }
}

export async function enableTwoFactor(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const enableTwoFactorBodySchema = z.object({
    userId: z.string(),
  });

  try {
    const { userId } = enableTwoFactorBodySchema.parse(request.body);

    const usersRepository = new PrismaUsersRepository();
    const backupCodesRepository = new PrismaBackupCodesRepository();
    const enableTwoFactorUseCase = new EnableTwoFactorUseCase(
      usersRepository,
      backupCodesRepository,
    );

    const result = await enableTwoFactorUseCase.execute({
      userId,
    });

    return reply.status(200).send(result);
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return reply.status(404).send({ error: "User not found" });
    }

    console.error("Enable 2FA error:", err);
    return reply.status(500).send({ error: "Failed to enable 2FA" });
  }
}

export async function disableTwoFactor(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const disableTwoFactorBodySchema = z.object({
    userId: z.string(),
  });

  try {
    const { userId } = disableTwoFactorBodySchema.parse(request.body);

    const usersRepository = new PrismaUsersRepository();
    const webAuthnCredentialsRepository =
      new PrismaWebAuthnCredentialsRepository();
    const backupCodesRepository = new PrismaBackupCodesRepository();
    const disableTwoFactorUseCase = new DisableTwoFactorUseCase(
      usersRepository,
      webAuthnCredentialsRepository,
      backupCodesRepository,
    );

    const { disabled } = await disableTwoFactorUseCase.execute({
      userId,
    });

    return reply.status(200).send({
      disabled,
    });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return reply.status(404).send({ error: "User not found" });
    }

    console.error("Disable 2FA error:", err);
    return reply.status(500).send({ error: "Failed to disable 2FA" });
  }
}

export async function generateBackupCodes(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const generateBackupCodesBodySchema = z.object({
    userId: z.string(),
  });

  try {
    const { userId } = generateBackupCodesBodySchema.parse(request.body);

    const usersRepository = new PrismaUsersRepository();
    const backupCodesRepository = new PrismaBackupCodesRepository();
    const generateBackupCodesUseCase = new GenerateBackupCodesUseCase(
      usersRepository,
      backupCodesRepository,
    );

    const { backupCodes } = await generateBackupCodesUseCase.execute({
      userId,
    });

    return reply.status(200).send({
      backupCodes,
    });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return reply.status(404).send({ error: "User not found" });
    }

    console.error("Generate backup codes error:", err);
    return reply.status(500).send({ error: "Failed to generate backup codes" });
  }
}

export async function verifyBackupCode(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const verifyBackupCodeBodySchema = z.object({
    code: z.string(),
  });

  try {
    const { code } = verifyBackupCodeBodySchema.parse(request.body);

    const backupCodesRepository = new PrismaBackupCodesRepository();
    const verifyBackupCodeUseCase = new VerifyBackupCodeUseCase(
      backupCodesRepository,
    );

    const { verified, backupCode } = await verifyBackupCodeUseCase.execute({
      code,
    });

    return reply.status(200).send({
      verified,
      backupCode: {
        id: backupCode.id,
        used: backupCode.used,
        usedAt: backupCode.usedAt,
      },
    });
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return reply
        .status(401)
        .send({ error: "Invalid or already used backup code" });
    }

    console.error("Verify backup code error:", err);
    return reply.status(500).send({ error: "Failed to verify backup code" });
  }
}

export async function generateWebAuthnRegistrationOptions(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const generateOptionsBodySchema = z.object({
    userId: z.string(),
    userDisplayName: z.string().optional(),
  });

  try {
    const { userId, userDisplayName } = generateOptionsBodySchema.parse(
      request.body,
    );

    const usersRepository = new PrismaUsersRepository();
    const webAuthnCredentialsRepository =
      new PrismaWebAuthnCredentialsRepository();
    const generateOptionsUseCase =
      new GenerateWebAuthnRegistrationOptionsUseCase(
        usersRepository,
        webAuthnCredentialsRepository,
      );

    const { options } = await generateOptionsUseCase.execute({
      userId,
      userDisplayName,
    });

    // Store the challenge in session
    const sessionId = randomUUID();
    sessionStore.set(sessionId, {
      challenge: options.challenge,
      userId,
      type: "registration",
    });

    return reply.status(200).send({
      options,
      sessionId,
    });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return reply.status(404).send({ error: "User not found" });
    }

    console.error("Generate WebAuthn registration options error:", err);
    return reply
      .status(500)
      .send({ error: "Failed to generate registration options" });
  }
}

export async function verifyWebAuthnRegistration(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const verifyRegistrationBodySchema = z.object({
    sessionId: z.string(),
    registrationResponse: z.any(),
    name: z.string().optional(),
  });

  try {
    const { sessionId, registrationResponse, name } =
      verifyRegistrationBodySchema.parse(request.body);

    // Get the session data
    const sessionData = sessionStore.get(sessionId);
    if (!sessionData || sessionData.type !== "registration") {
      return reply.status(400).send({ error: "Invalid or expired session" });
    }

    const usersRepository = new PrismaUsersRepository();
    const webAuthnCredentialsRepository =
      new PrismaWebAuthnCredentialsRepository();
    const verifyRegistrationUseCase = new VerifyWebAuthnRegistrationUseCase(
      usersRepository,
      webAuthnCredentialsRepository,
    );

    const { credential, verified } = await verifyRegistrationUseCase.execute({
      userId: sessionData.userId!,
      registrationResponse,
      expectedChallenge: sessionData.challenge,
      name,
    });

    // Clean up session
    sessionStore.delete(sessionId);

    return reply.status(200).send({
      verified,
      credential: {
        id: credential.id,
        credentialID: credential.credentialID,
        name: credential.name,
        transports: credential.transports
          ? JSON.parse(credential.transports)
          : null,
        createdAt: credential.createdAt,
      },
    });
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return reply.status(401).send({ error: "Invalid WebAuthn registration" });
    }

    console.error("Verify WebAuthn registration error:", err);
    return reply
      .status(500)
      .send({ error: "Failed to verify WebAuthn registration" });
  }
}

export async function generateWebAuthnAuthenticationOptions(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const generateOptionsBodySchema = z.object({
    userId: z.string(),
  });

  try {
    const { userId } = generateOptionsBodySchema.parse(request.body);

    const usersRepository = new PrismaUsersRepository();
    const webAuthnCredentialsRepository =
      new PrismaWebAuthnCredentialsRepository();
    const generateOptionsUseCase =
      new GenerateWebAuthnAuthenticationOptionsUseCase(
        usersRepository,
        webAuthnCredentialsRepository,
      );

    const { options } = await generateOptionsUseCase.execute({
      userId,
    });

    // Store the challenge in session
    const sessionId = randomUUID();
    sessionStore.set(sessionId, {
      challenge: options.challenge,
      userId,
      type: "authentication",
    });

    return reply.status(200).send({
      options,
      sessionId,
    });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return reply.status(404).send({ error: "User not found" });
    }

    console.error("Generate WebAuthn authentication options error:", err);
    return reply
      .status(500)
      .send({ error: "Failed to generate authentication options" });
  }
}

export async function verifyWebAuthnAuthentication(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const verifyAuthenticationBodySchema = z.object({
    sessionId: z.string(),
    authenticationResponse: z.any(),
  });

  try {
    const { sessionId, authenticationResponse } =
      verifyAuthenticationBodySchema.parse(request.body);

    // Get the session data
    const sessionData = sessionStore.get(sessionId);
    if (!sessionData || sessionData.type !== "authentication") {
      return reply.status(400).send({ error: "Invalid or expired session" });
    }

    const webAuthnCredentialsRepository =
      new PrismaWebAuthnCredentialsRepository();
    const verifyAuthenticationUseCase = new VerifyWebAuthnAuthenticationUseCase(
      webAuthnCredentialsRepository,
    );

    const { credential, verified } = await verifyAuthenticationUseCase.execute({
      authenticationResponse,
      expectedChallenge: sessionData.challenge,
      userId: sessionData.userId,
    });

    // Clean up session
    sessionStore.delete(sessionId);

    return reply.status(200).send({
      verified,
      credential: {
        id: credential.id,
        name: credential.name,
        lastUsed: credential.lastUsed,
      },
    });
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return reply
        .status(401)
        .send({ error: "Invalid WebAuthn authentication" });
    }

    console.error("Verify WebAuthn authentication error:", err);
    return reply
      .status(500)
      .send({ error: "Failed to verify WebAuthn authentication" });
  }
}
