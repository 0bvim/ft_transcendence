import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/refresh`, {
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
}

export interface RefreshTokenRequest {
  token: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  // Standard authentication
  register: async (data: RegisterRequest): Promise<void> => {
    const response = await api.post("/register", data);
    return response.data;
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

  enableTwoFactor: async (userId: string) => {
    const response = await api.post("/2fa/enable", { userId });
    return response.data;
  },

  disableTwoFactor: async (userId: string) => {
    const response = await api.post("/2fa/disable", { userId });
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
};

export default api;
