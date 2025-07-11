import { it, describe, expect, beforeEach } from "vitest";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository";
import { InMemoryWebAuthnCredentialsRepository } from "../repositories/in-memory/in-memory-webauthn-credentials-repository";
import { InMemoryBackupCodesRepository } from "../repositories/in-memory/in-memory-backup-codes-repository";
import { RegisterWebAuthnCredentialUseCase } from "./register-webauthn-credential";
import { VerifyWebAuthnCredentialUseCase } from "./verify-webauthn-credential";
import { EnableTwoFactorUseCase } from "./enable-two-factor";
import { DisableTwoFactorUseCase } from "./disable-two-factor";
import { GenerateBackupCodesUseCase } from "./generate-backup-codes";
import { VerifyBackupCodeUseCase } from "./verify-backup-code";
import { hash } from "bcryptjs";
import { UserNotFoundError } from "./errors/user-not-found-error";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error";
import dotenv from "dotenv";

// load environment variables from .env file
dotenv.config();

describe("WebAuthn 2FA Use Cases", () => {
  let usersRepository: InMemoryUsersRepository;
  let webAuthnCredentialsRepository: InMemoryWebAuthnCredentialsRepository;
  let backupCodesRepository: InMemoryBackupCodesRepository;
  let registerWebAuthnCredentialUseCase: RegisterWebAuthnCredentialUseCase;
  let verifyWebAuthnCredentialUseCase: VerifyWebAuthnCredentialUseCase;
  let enableTwoFactorUseCase: EnableTwoFactorUseCase;
  let disableTwoFactorUseCase: DisableTwoFactorUseCase;
  let generateBackupCodesUseCase: GenerateBackupCodesUseCase;
  let verifyBackupCodeUseCase: VerifyBackupCodeUseCase;

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    webAuthnCredentialsRepository = new InMemoryWebAuthnCredentialsRepository();
    backupCodesRepository = new InMemoryBackupCodesRepository();
    
    registerWebAuthnCredentialUseCase = new RegisterWebAuthnCredentialUseCase(
      usersRepository,
      webAuthnCredentialsRepository,
    );
    
    verifyWebAuthnCredentialUseCase = new VerifyWebAuthnCredentialUseCase(
      webAuthnCredentialsRepository,
    );
    
    enableTwoFactorUseCase = new EnableTwoFactorUseCase(
      usersRepository,
      backupCodesRepository,
    );
    
    disableTwoFactorUseCase = new DisableTwoFactorUseCase(
      usersRepository,
      webAuthnCredentialsRepository,
      backupCodesRepository,
    );
    
    generateBackupCodesUseCase = new GenerateBackupCodesUseCase(
      usersRepository,
      backupCodesRepository,
    );
    
    verifyBackupCodeUseCase = new VerifyBackupCodeUseCase(
      backupCodesRepository,
    );
  });

  describe("Register WebAuthn Credential", () => {
    it("should be able to register a WebAuthn credential", async () => {
      const user = await usersRepository.create({
        username: "johndoe",
        email: "john.doe@example.com",
        password: await hash("password123", 6),
      });

      const { credential } = await registerWebAuthnCredentialUseCase.execute({
        userId: user.id,
        credentialId: "test-credential-id",
        publicKey: "test-public-key",
        counter: 0,
        name: "YubiKey 5 NFC",
        transports: ["usb", "nfc"],
      });

      expect(credential.id).toEqual(expect.any(String));
      expect(credential.credentialID).toBe("test-credential-id");
      expect(credential.publicKey).toBe("test-public-key");
      expect(credential.name).toBe("YubiKey 5 NFC");
      expect(credential.userId).toBe(user.id);
    });

    it("should not be able to register credential for non-existent user", async () => {
      await expect(() =>
        registerWebAuthnCredentialUseCase.execute({
          userId: "non-existent-user",
          credentialId: "test-credential-id",
          publicKey: "test-public-key",
          counter: 0,
          name: "YubiKey 5 NFC",
          transports: ["usb", "nfc"],
        }),
      ).rejects.toBeInstanceOf(UserNotFoundError);
    });
  });

  describe("Verify WebAuthn Credential", () => {
    it("should be able to verify a WebAuthn credential", async () => {
      const user = await usersRepository.create({
        username: "johndoe",
        email: "john.doe@example.com",
        password: await hash("password123", 6),
      });

      const credential = await webAuthnCredentialsRepository.create({
        userId: user.id,
        credentialID: "test-credential-id",
        publicKey: "test-public-key",
        counter: 0,
        name: "YubiKey 5 NFC",
        transports: JSON.stringify(["usb", "nfc"]),
      });

      const result = await verifyWebAuthnCredentialUseCase.execute({
        credentialId: "test-credential-id",
        counter: 1,
      });

      expect(result.verified).toBe(true);
      expect(result.credential.id).toBe(credential.id);
      expect(result.credential.counter).toBe(1);
    });

    it("should not be able to verify with invalid credential ID", async () => {
      await expect(() =>
        verifyWebAuthnCredentialUseCase.execute({
          credentialId: "invalid-credential-id",
          counter: 1,
        }),
      ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });
  });

  describe("Enable Two Factor", () => {
    it("should be able to enable 2FA for a user", async () => {
      const user = await usersRepository.create({
        username: "johndoe",
        email: "john.doe@example.com",
        password: await hash("password123", 6),
      });

      const result = await enableTwoFactorUseCase.execute({
        userId: user.id,
      });

      expect(result.enabled).toBe(true);
      expect(result.backupCodes).toHaveLength(8);
      expect(result.backupCodes[0]).toMatch(/^[A-Za-z0-9]{8}$/);
    });

    it("should not be able to enable 2FA for non-existent user", async () => {
      await expect(() =>
        enableTwoFactorUseCase.execute({
          userId: "non-existent-user",
        }),
      ).rejects.toBeInstanceOf(UserNotFoundError);
    });
  });

  describe("Disable Two Factor", () => {
    it("should be able to disable 2FA for a user", async () => {
      const user = await usersRepository.create({
        username: "johndoe",
        email: "john.doe@example.com",
        password: await hash("password123", 6),
        twoFactorEnabled: true,
      });

      // Create some credentials and backup codes
      await webAuthnCredentialsRepository.create({
        userId: user.id,
        credentialID: "test-credential-id",
        publicKey: "test-public-key",
        counter: 0,
      });

      await backupCodesRepository.create({
        userId: user.id,
        code: "12345678",
      });

      const result = await disableTwoFactorUseCase.execute({
        userId: user.id,
      });

      expect(result.disabled).toBe(true);
      
      // Verify user's 2FA is disabled
      const updatedUser = await usersRepository.findById(user.id);
      expect(updatedUser?.twoFactorEnabled).toBe(false);
      
      // Verify credentials are deleted
      const credentials = await webAuthnCredentialsRepository.findByUserId(user.id);
      expect(credentials).toHaveLength(0);
    });

    it("should not be able to disable 2FA for non-existent user", async () => {
      await expect(() =>
        disableTwoFactorUseCase.execute({
          userId: "non-existent-user",
        }),
      ).rejects.toBeInstanceOf(UserNotFoundError);
    });
  });

  describe("Generate Backup Codes", () => {
    it("should be able to generate backup codes", async () => {
      const user = await usersRepository.create({
        username: "johndoe",
        email: "john.doe@example.com",
        password: await hash("password123", 6),
        twoFactorEnabled: true,
      });

      const result = await generateBackupCodesUseCase.execute({
        userId: user.id,
      });

      expect(result.backupCodes).toHaveLength(8);
      expect(result.backupCodes[0]).toMatch(/^[A-Za-z0-9]{8}$/);
    });

    it("should not be able to generate backup codes for non-existent user", async () => {
      await expect(() =>
        generateBackupCodesUseCase.execute({
          userId: "non-existent-user",
        }),
      ).rejects.toBeInstanceOf(UserNotFoundError);
    });
  });

  describe("Verify Backup Code", () => {
    it("should be able to verify a backup code", async () => {
      const user = await usersRepository.create({
        username: "johndoe",
        email: "john.doe@example.com",
        password: await hash("password123", 6),
        twoFactorEnabled: true,
      });

      const backupCode = await backupCodesRepository.create({
        userId: user.id,
        code: "12345678",
      });

      const result = await verifyBackupCodeUseCase.execute({
        code: "12345678",
      });

      expect(result.verified).toBe(true);
      expect(result.backupCode.id).toBe(backupCode.id);
      expect(result.backupCode.used).toBe(true);
    });

    it("should not be able to verify invalid backup code", async () => {
      await expect(() =>
        verifyBackupCodeUseCase.execute({
          code: "invalid-code",
        }),
      ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    it("should not be able to verify already used backup code", async () => {
      const user = await usersRepository.create({
        username: "johndoe",
        email: "john.doe@example.com",
        password: await hash("password123", 6),
        twoFactorEnabled: true,
      });

      await backupCodesRepository.create({
        userId: user.id,
        code: "12345678",
        used: true,
      });

      await expect(() =>
        verifyBackupCodeUseCase.execute({
          code: "12345678",
        }),
      ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });
  });
}); 