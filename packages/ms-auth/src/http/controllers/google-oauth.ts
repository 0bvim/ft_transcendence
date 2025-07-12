import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { google } from "googleapis";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository";
import { PrismaRefreshTokensRepository } from "../../repositories/prisma/prisma-refresh-tokens-repository";
import { GoogleSignInUseCase } from "../../use-cases/google-signin";
import { UserAlreadyExistsError } from "../../use-cases/errors/user-already-exists-error";
import { env } from "../../env";

// Initialize Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

export async function googleOAuthInitiate(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Generate the authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      include_granted_scopes: true,
    });

    return reply.status(200).send({
      authUrl,
    });
  } catch (err) {
    return reply.status(500).send({ error: "Failed to initiate OAuth" });
  }
}

export async function googleOAuthCallback(request: FastifyRequest, reply: FastifyReply) {
  const callbackQuerySchema = z.object({
    code: z.string(),
    state: z.string().optional(),
  });

  try {
    const { code } = callbackQuerySchema.parse(request.query);

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email || !userInfo.id) {
      return reply.status(400).send({ error: "Failed to get user information from Google" });
    }

    // Sign in or create user
    const usersRepository = new PrismaUsersRepository();
    const refreshTokensRepository = new PrismaRefreshTokensRepository();
    const googleSignInUseCase = new GoogleSignInUseCase(
      usersRepository,
      refreshTokensRepository,
    );

    const { user, accessToken, refreshToken } = await googleSignInUseCase.execute({
      googleId: userInfo.id,
      email: userInfo.email,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return reply.status(200).send({
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ 
        error: "Email already exists with different account. Please link your accounts or use a different email." 
      });
    }
    
    console.error('OAuth callback error:', err);
    return reply.status(500).send({ error: "OAuth authentication failed" });
  }
}

export async function googleOAuthLink(request: FastifyRequest, reply: FastifyReply) {
  const linkBodySchema = z.object({
    code: z.string(),
    userId: z.string(),
  });

  try {
    const { code, userId } = linkBodySchema.parse(request.body);

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email || !userInfo.id) {
      return reply.status(400).send({ error: "Failed to get user information from Google" });
    }

    // Link Google account to existing user
    const usersRepository = new PrismaUsersRepository();
    const refreshTokensRepository = new PrismaRefreshTokensRepository();
    const googleSignInUseCase = new GoogleSignInUseCase(
      usersRepository,
      refreshTokensRepository,
    );

    const { user, accessToken, refreshToken } = await googleSignInUseCase.execute({
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
        error: "Failed to link accounts. User may not exist or Google account already linked." 
      });
    }
    
    console.error('OAuth link error:', err);
    return reply.status(500).send({ error: "Failed to link Google account" });
  }
} 