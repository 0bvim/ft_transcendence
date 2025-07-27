import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { google } from "googleapis";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository";
import { PrismaRefreshTokensRepository } from "../../repositories/prisma/prisma-refresh-tokens-repository";
import { GoogleSignInUseCase } from "../../use-cases/google-signin";
import { UserAlreadyExistsError } from "../../use-cases/errors/user-already-exists-error";
import { env } from "../../env";

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI,
);

console.log("Google OAuth2 Client initialized with:");
console.log("- Redirect URI:", env.GOOGLE_REDIRECT_URI);
console.log(
  "- Client ID:",
  env.GOOGLE_CLIENT_ID
    ? `${env.GOOGLE_CLIENT_ID.substring(0, 20)}...`
    : "NOT SET",
);

export async function googleOAuthInitiate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      include_granted_scopes: true,
    });

    console.log("Generated Google OAuth URL:", authUrl);

    return reply.status(200).send({
      authUrl,
    });
  } catch (err) {
    console.error("Google OAuth initiate error:", err);
    return reply.status(500).send({ error: "Failed to initiate OAuth" });
  }
}

export async function googleOAuthCallback(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const callbackQuerySchema = z.object({
    code: z.string(),
    state: z.string().optional(),
  });

  try {
    console.log("Google OAuth callback received query:", request.query);

    const { code } = callbackQuerySchema.parse(request.query);

    console.log("Exchanging authorization code for tokens...");

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log("Tokens received, fetching user info...");

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email || !userInfo.id) {
      console.error("Missing user information from Google:", userInfo);
      return reply
        .status(400)
        .send({ error: "Failed to get user information from Google" });
    }

    const usersRepository = new PrismaUsersRepository();
    const refreshTokensRepository = new PrismaRefreshTokensRepository();
    const googleSignInUseCase = new GoogleSignInUseCase(
      usersRepository,
      refreshTokensRepository,
    );

    const { user, accessToken, refreshToken } =
      await googleSignInUseCase.execute({
        googleId: userInfo.id,
        email: userInfo.email,
      });

    if (user.twoFactorEnabled) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;

      return reply.status(200).send({
        user: userWithoutPassword,
        requiresTwoFactor: true,
        message: "Two-factor authentication required",
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return reply.status(200).send({
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      requiresTwoFactor: false,
    });
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) {
      return reply.status(409).send({
        error:
          "Email already exists with different account. Please link your accounts or use a different email.",
      });
    }

    console.error("OAuth callback error:", err);
    return reply.status(500).send({ error: "OAuth authentication failed" });
  }
}

export async function googleOAuthLink(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const linkBodySchema = z.object({
    code: z.string(),
    userId: z.string(),
  });

  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { code, userId } = linkBodySchema.parse(request.body);

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email || !userInfo.id) {
      return reply
        .status(400)
        .send({ error: "Failed to get user information from Google" });
    }

    const usersRepository = new PrismaUsersRepository();
    const refreshTokensRepository = new PrismaRefreshTokensRepository();
    const googleSignInUseCase = new GoogleSignInUseCase(
      usersRepository,
      refreshTokensRepository,
    );

    const { user, accessToken, refreshToken } =
      await googleSignInUseCase.execute({
        googleId: userInfo.id,
        email: userInfo.email,
        linkAccount: true,
      });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return reply.status(200).send({
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      linked: true,
    });
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) {
      return reply.status(409).send({
        error:
          "Failed to link accounts. User may not exist or Google account already linked.",
      });
    }

    console.error("OAuth link error:", err);
    return reply.status(500).send({ error: "Failed to link Google account" });
  }
}
