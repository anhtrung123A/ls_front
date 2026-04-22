import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { API_HOSTS } from "../constants/api";

type TokenBundle = {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
};

type UserProfile = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  dateOfBirth: string;
};

type LoginPayload = {
  loginId: string;
  password: string;
  rememberMe: boolean;
};

type AuthContextType = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

type ApiResponse<T> = {
  success: boolean;
  status?: number;
  message?: string;
  data: T;
  error?: {
    code?: string;
    message?: string;
  };
};

const AUTH_STORAGE_KEY = "auth_tokens";
const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readTokensFromStorage(): TokenBundle | null {
  const localValue = localStorage.getItem(AUTH_STORAGE_KEY);
  if (localValue) {
    return JSON.parse(localValue) as TokenBundle;
  }

  const sessionValue = sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (sessionValue) {
    return JSON.parse(sessionValue) as TokenBundle;
  }

  return null;
}

function writeTokensToStorage(tokens: TokenBundle, rememberMe: boolean) {
  const serialized = JSON.stringify(tokens);
  if (rememberMe) {
    localStorage.setItem(AUTH_STORAGE_KEY, serialized);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  sessionStorage.setItem(AUTH_STORAGE_KEY, serialized);
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function clearTokensFromStorage() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

function getErrorMessage(status: number, fallback: string) {
  if (status === 401) {
    return "Thong tin dang nhap khong dung.";
  }
  return fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<TokenBundle | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const clearAuthState = useCallback(() => {
    setTokens(null);
    setUser(null);
    clearTokensFromStorage();
  }, []);

  const refreshToken = useCallback(
    async (currentRefreshToken: string): Promise<TokenBundle | null> => {
      const response = await fetch(`${API_HOSTS.auth}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as ApiResponse<TokenBundle>;
      if (!payload.success || !payload.data) {
        return null;
      }

      return payload.data;
    },
    [],
  );

  const fetchProfileWithAutoRefresh = useCallback(
    async (inputTokens: TokenBundle): Promise<UserProfile | null> => {
      const doFetchProfile = async (accessToken: string) => {
        const response = await fetch(
          `${API_HOSTS.v1}/api/v1/users/user_profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!response.ok) {
          return null;
        }

        const payload = (await response.json()) as ApiResponse<UserProfile>;
        if (!payload.success || !payload.data) {
          return null;
        }
        return payload.data;
      };

      const profile = await doFetchProfile(inputTokens.accessToken);
      if (profile) {
        return profile;
      }

      const refreshedTokens = await refreshToken(inputTokens.refreshToken);
      if (!refreshedTokens) {
        return null;
      }

      const savedInLocalStorage =
        localStorage.getItem(AUTH_STORAGE_KEY) !== null;
      writeTokensToStorage(refreshedTokens, savedInLocalStorage);
      setTokens(refreshedTokens);

      return doFetchProfile(refreshedTokens.accessToken);
    },
    [refreshToken],
  );

  const refreshProfile = useCallback(async () => {
    if (!tokens) {
      throw new Error("No auth token found.");
    }

    const profile = await fetchProfileWithAutoRefresh(tokens);
    if (!profile) {
      clearAuthState();
      throw new Error("Cannot fetch profile.");
    }

    setUser(profile);
  }, [clearAuthState, fetchProfileWithAutoRefresh, tokens]);

  const login = useCallback(
    async ({ loginId, password, rememberMe }: LoginPayload) => {
      const response = await fetch(`${API_HOSTS.auth}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loginId, password }),
      });

      const payload = (await response.json()) as ApiResponse<TokenBundle>;
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(
          payload.error?.message ||
            getErrorMessage(response.status, "Dang nhap that bai."),
        );
      }

      setTokens(payload.data);
      writeTokensToStorage(payload.data, rememberMe);

      const profile = await fetchProfileWithAutoRefresh(payload.data);
      if (!profile) {
        clearAuthState();
        throw new Error("Dang nhap thanh cong nhung khong lay duoc profile.");
      }

      setUser(profile);
    },
    [clearAuthState, fetchProfileWithAutoRefresh],
  );

  const logout = useCallback(async () => {
    const refreshTokenValue = tokens?.refreshToken;

    if (refreshTokenValue) {
      try {
        await fetch(`${API_HOSTS.auth}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken: refreshTokenValue }),
        });
      } catch {
        // Ignore network/logout API errors and still clear local state.
      }
    }

    clearAuthState();
  }, [clearAuthState, tokens?.refreshToken]);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const storedTokens = readTokensFromStorage();
      if (!storedTokens) {
        setIsBootstrapping(false);
        return;
      }

      setTokens(storedTokens);
      const profile = await fetchProfileWithAutoRefresh(storedTokens);
      if (!profile) {
        clearAuthState();
        setIsBootstrapping(false);
        return;
      }

      setUser(profile);
      setIsBootstrapping(false);
    };

    void bootstrapAuth();
  }, [clearAuthState, fetchProfileWithAutoRefresh]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: Boolean(tokens?.accessToken),
      isBootstrapping,
      login,
      logout,
      refreshProfile,
    }),
    [isBootstrapping, login, logout, refreshProfile, tokens?.accessToken, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}

