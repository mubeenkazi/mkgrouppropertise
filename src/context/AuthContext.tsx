import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, AppUser, authStore, toErrorResult } from "@/lib/api";

type AuthContextType = {
  user: AppUser | null;
  session: { access_token: string } | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
};

type AuthResponse = {
  user: AppUser;
  token: string;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const applyAuth = (data: AuthResponse) => {
    authStore.setToken(data.token);
    setSession({ access_token: data.token });
    setUser(data.user);
    setIsAdmin(data.isAdmin);
  };

  useEffect(() => {
    const token = authStore.getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api<{ user: AppUser; isAdmin: boolean }>("/auth/me")
      .then((data) => {
        setSession({ access_token: token });
        setUser(data.user);
        setIsAdmin(data.isAdmin);
      })
      .catch(() => {
        authStore.clear();
        setSession(null);
        setUser(null);
        setIsAdmin(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      applyAuth(await api<AuthResponse>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, fullName }),
        auth: false,
      }));
      return { error: null };
    } catch (error) {
      return toErrorResult(error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      applyAuth(await api<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        auth: false,
      }));
      return { error: null };
    } catch (error) {
      return toErrorResult(error);
    }
  };

  const signInWithGoogle = async () => ({
    error: new Error("Google sign-in is not configured for this Express/MongoDB setup."),
  });

  const signOut = async () => {
    authStore.clear();
    setSession(null);
    setUser(null);
    setIsAdmin(false);
  };

  const resetPassword = async (email: string) => {
    try {
      await api("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email }),
        auth: false,
      });
      return { error: null };
    } catch (error) {
      return toErrorResult(error);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      await api("/auth/update-password", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      return { error: null };
    } catch (error) {
      return toErrorResult(error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signUp, signIn, signInWithGoogle, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
