import { FastifyInstance } from "fastify";
import { register } from "./controllers/register";
import { login } from "./controllers/login";
import { refreshToken } from "./controllers/refresh-token";
import { deleteUser } from "./controllers/delete";
import { verify2FA } from "./controllers/verify-2fa";
import {
  googleOAuthInitiate,
  googleOAuthCallback,
  googleOAuthLink,
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
import { verifyTotpCode } from "./controllers/verify-totp-code";
import { completeTwoFactorSetup } from "./controllers/complete-2fa-setup";
import { getProfile } from "./controllers/get-profile";
import { updateProfile } from "./controllers/update-profile";
import { uploadAvatar } from "./controllers/upload-avatar";
import { removeAvatar } from "./controllers/remove-avatar";
import { authMiddleware } from "./middleware/auth";
import path from "path";

export async function appRoutes(app: FastifyInstance) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  app.register(require("@fastify/static"), {
    root: path.join(process.cwd(), "uploads"),
    prefix: "/uploads/",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setHeaders: (res: any) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    },
  });

  app.post("/register", register);
  app.post("/login", login);
  app.post("/refresh", refreshToken);
  app.post("/verify-2fa", verify2FA);

  // Google OAuth routes (no auth required)
  app.get("/auth/google", googleOAuthInitiate);
  app.get("/auth/google/callback", googleOAuthCallback);
  app.post("/auth/google/link", googleOAuthLink);

  // Protected routes - require authentication
  app.register(async function (protectedRoutes) {
    // Add auth middleware to all routes in this context
    protectedRoutes.addHook("preHandler", authMiddleware);

    // Profile management routes
    protectedRoutes.get("/profile", getProfile);
    protectedRoutes.put("/profile", updateProfile);
    protectedRoutes.post("/profile/avatar", uploadAvatar);
    protectedRoutes.delete("/profile/avatar", removeAvatar);

    // User management
    protectedRoutes.delete("/delete/:id", deleteUser);

    // 2FA routes
    protectedRoutes.post("/2fa/enable", enableTwoFactor);
    protectedRoutes.post("/2fa/disable", disableTwoFactor);
    protectedRoutes.post("/2fa/verify-totp", verifyTotpCode);
    protectedRoutes.post("/2fa/complete-setup", completeTwoFactorSetup);

    // WebAuthn 2FA routes
    protectedRoutes.post("/2fa/webauthn/register", registerWebAuthnCredential);
    protectedRoutes.post("/2fa/webauthn/verify", verifyWebAuthnCredential);
    protectedRoutes.post("/2fa/backup-codes/generate", generateBackupCodes);
    protectedRoutes.post("/2fa/backup-codes/verify", verifyBackupCode);

    // New WebAuthn endpoints with proper challenge handling
    protectedRoutes.post(
      "/2fa/webauthn/registration-options",
      generateWebAuthnRegistrationOptions,
    );
    protectedRoutes.post(
      "/2fa/webauthn/verify-registration",
      verifyWebAuthnRegistration,
    );
    protectedRoutes.post(
      "/2fa/webauthn/authentication-options",
      generateWebAuthnAuthenticationOptions,
    );
    protectedRoutes.post(
      "/2fa/webauthn/verify-authentication",
      verifyWebAuthnAuthentication,
    );
  });
}
