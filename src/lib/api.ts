const TOKEN_KEY = "mkgrup_token";

export type AppUser = {
  id: string;
  email: string;
  role?: "user" | "admin";
  user_metadata?: {
    full_name?: string | null;
    avatar_url?: string | null;
  };
};

type ApiOptions = RequestInit & {
  auth?: boolean;
};

export const authStore = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = async <T>(path: string, options: ApiOptions = {}): Promise<T> => {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = authStore.getToken();
  if (options.auth !== false && token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`/api${path}`, { ...options, headers });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
};

export const toErrorResult = (error: unknown) => ({
  error: error instanceof Error ? error : new Error("Something went wrong"),
});
