import { FastifyInstance } from "fastify";
import { register } from "./controllers/register";
import { login } from "./controllers/login";
import { refreshToken } from "./controllers/refresh-token";
import { deleteUser } from "./controllers/delete";
import { verify2FA } from "./controllers/verify-2fa";
import { 
  googleOAuthInitiate, 
  googleOAuthCallback, 
  googleOAuthLink 
} from "./controllers/google-oauth";
import {
  registerWebAuthnCredential,
  verifyWebAuthnCredential,
  enableTwoFactor,
  disableTwoFactor,
  generateBackupCodes,
  verifyBackupCode,
  generateWebAuthnRegistrationOptions,
  verifyWebAuthnRegistration,
  generateWebAuthnAuthenticationOptions,
  verifyWebAuthnAuthentication,
} from "./controllers/webauthn-2fa";
import { env } from "../env";

export async function appRoutes(app: FastifyInstance) {
  // Debug endpoint - remove in production
  app.get("/debug/config", async (request, reply) => {
    return reply.status(200).send({
      environment: env.NODE_ENV,
      cors_configured: true,
      google_oauth: {
        client_id_configured: !!env.GOOGLE_CLIENT_ID,
        client_secret_configured: !!env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
      },
      webauthn: {
        rp_id: env.WEBAUTHN_RP_ID,
        rp_name: env.WEBAUTHN_RP_NAME,
        origin: env.WEBAUTHN_ORIGIN,
      },
      hosts: {
        host: env.HOST,
        frontend_host: env.FRONTEND_HOST,
        frontend_port: env.FRONTEND_PORT,
        auth_port: env.PORT,
      },
      jwt_configured: !!env.JWT_SECRET,
    });
  });

  // Standard authentication routes
  app.post("/register", register);
  app.post("/login", login);
  app.post("/refresh", refreshToken);
  app.delete("/delete/:id", deleteUser);
  app.post("/verify-2fa", verify2FA);

  // Google OAuth routes
  app.get("/auth/google", googleOAuthInitiate);
  app.get("/auth/google/callback", googleOAuthCallback);
  app.post("/auth/google/link", googleOAuthLink);

  // WebAuthn 2FA routes
  app.post("/2fa/webauthn/register", registerWebAuthnCredential);
  app.post("/2fa/webauthn/verify", verifyWebAuthnCredential);
  app.post("/2fa/enable", enableTwoFactor);
  app.post("/2fa/disable", disableTwoFactor);
  app.post("/2fa/backup-codes/generate", generateBackupCodes);
  app.post("/2fa/backup-codes/verify", verifyBackupCode);
  
  // New WebAuthn endpoints with proper challenge handling
  app.post("/2fa/webauthn/registration-options", generateWebAuthnRegistrationOptions);
  app.post("/2fa/webauthn/verify-registration", verifyWebAuthnRegistration);
  app.post("/2fa/webauthn/authentication-options", generateWebAuthnAuthenticationOptions);
  app.post("/2fa/webauthn/verify-authentication", verifyWebAuthnAuthentication);
}
