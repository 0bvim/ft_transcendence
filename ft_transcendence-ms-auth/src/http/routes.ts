import { FastifyInstance } from "fastify";
import { register } from "./controllers/register";
import { login } from "./controllers/login";
import { refreshToken } from "./controllers/refresh-token";
import { deleteUser } from "./controllers/delete";
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
} from "./controllers/webauthn-2fa";

export async function appRoutes(app: FastifyInstance) {
  // Standard authentication routes
  app.post("/register", register);
  app.post("/login", login);
  app.post("/refresh", refreshToken);
  app.delete("/delete/:id", deleteUser);

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
}
