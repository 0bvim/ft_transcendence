import axios from "axios";

// Dynamic API base URL - use current hostname with auth service port
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const port = 3001; // Auth service port
  return `https://${hostname}:${port}`;
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: any) => response,
  async (error: { config: any; response: { status: number } }) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${getApiBaseUrl()}/refresh`, {
            token: refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  googleId?: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  requiresTwoFactor?: boolean;
  message?: string;
}

export interface RefreshTokenRequest {
  token: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
}

export const authApi = {
  // Standard authentication
  register: async (data: RegisterRequest): Promise<void> => {
    await api.post("/register", data);
    // Backend returns empty response with 201 status on success
    return;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post("/login", data);
    return response.data;
  },

  refresh: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await api.post("/refresh", data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<{ user: User }> => {
    const response = await api.delete(`/delete/${id}`);
    return response.data;
  },

  // Profile management
  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get("/profile");
    return response.data;
  },

  updateProfile: async (
    data: UpdateProfileRequest,
  ): Promise<{ user: User }> => {
    const response = await api.put("/profile", data);
    return response.data;
  },

  uploadAvatar: async (
    file: File,
  ): Promise<{ user: User; avatarUrl: string }> => {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await api.post("/profile/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  removeAvatar: async (): Promise<{ user: User }> => {
    const response = await api.delete("/profile/avatar");
    return response.data;
  },

  // Google OAuth
  getGoogleAuthUrl: async (): Promise<{ authUrl: string }> => {
    const response = await api.get("/auth/google");
    return response.data;
  },

  // 2FA WebAuthn
  registerWebAuthnCredential: async (data: {
    userId: string;
    credentialId: string;
    publicKey: string;
    counter?: number;
    name?: string;
    transports?: string[];
  }) => {
    const response = await api.post("/2fa/webauthn/register", data);
    return response.data;
  },

  verifyWebAuthnCredential: async (data: {
    credentialId: string;
    counter: number;
  }) => {
    const response = await api.post("/2fa/webauthn/verify", data);
    return response.data;
  },

  // New WebAuthn endpoints with proper challenge handling
  generateWebAuthnRegistrationOptions: async (data: {
    userId: string;
    userDisplayName?: string;
  }) => {
    const response = await api.post("/2fa/webauthn/registration-options", data);
    return response.data;
  },

  verifyWebAuthnRegistration: async (data: {
    sessionId: string;
    registrationResponse: any;
    name?: string;
  }) => {
    const response = await api.post("/2fa/webauthn/verify-registration", data);
    return response.data;
  },

  generateWebAuthnAuthenticationOptions: async (data: { userId: string }) => {
    const response = await api.post(
      "/2fa/webauthn/authentication-options",
      data,
    );
    return response.data;
  },

  verifyWebAuthnAuthentication: async (data: {
    sessionId: string;
    authenticationResponse: any;
  }) => {
    const response = await api.post(
      "/2fa/webauthn/verify-authentication",
      data,
    );
    return response.data;
  },

  // 2FA Authentication APIs
  enableTwoFactor: async (
    userId: string,
  ): Promise<{
    setup: boolean;
    backupCodes: string[];
    totpSecret: string;
    qrCodeUrl: string;
  }> => {
    const response = await api.post("/2fa/enable", { userId });
    return response.data;
  },

  completeTwoFactorSetup: async (
    userId: string,
    code: string,
  ): Promise<{
    enabled: boolean;
    user: User;
    message: string;
  }> => {
    console.log("🔍 Frontend API call details:", {
      url: "/2fa/complete-setup",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")?.substring(0, 20)}...`,
      },
      body: { userId, code },
      timestamp: new Date().toISOString(),
    });

    const response = await api.post("/2fa/complete-setup", { userId, code });

    console.log("🔍 Frontend API response:", {
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString(),
    });

    return response.data;
  },

  disableTwoFactor: async (userId: string): Promise<{ disabled: boolean }> => {
    const response = await api.post("/2fa/disable", { userId });
    return response.data;
  },

  verify2FA: async (data: {
    userId: string;
    method: "webauthn" | "backup_code" | "totp" | "sms" | "email";
    sessionId?: string;
    authenticationResponse?: any;
    backupCode?: string;
    totpCode?: string;
  }): Promise<AuthResponse> => {
    const response = await api.post("/verify-2fa", data);
    return response.data;
  },

  verifyTotpCode: async (
    userId: string,
    code: string,
  ): Promise<{
    verified: boolean;
    user: User;
  }> => {
    const response = await api.post("/2fa/verify-totp", { userId, code });
    return response.data;
  },

  generateBackupCodes: async (userId: string) => {
    const response = await api.post("/2fa/backup-codes/generate", { userId });
    return response.data;
  },

  verifyBackupCode: async (data: { userId: string; code: string }) => {
    const response = await api.post("/2fa/backup-codes/verify", data);
    return response.data;
  },

  // User search for tournaments
  searchUsers(username: string): Promise<{ success: boolean; user?: { id: string; username: string; displayName: string; avatarUrl?: string } }> {
    return api.get(`/search-users?username=${encodeURIComponent(username)}`).then((res) => res.data);
  },
};

export default api;
