export type CloudUser = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
};

export type CloudSession = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  token_type?: string;
  user?: CloudUser;
};

export type CloudPayload = {
  version: 1;
  updatedAt: string;
  stores: Record<string, string>;
};

const SESSION_KEY = "boranthegreat:cloud-session";

export const cloudConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "",
  key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ""
};

export function isCloudConfigured() {
  return Boolean(cloudConfig.url && cloudConfig.key);
}

function authHeaders(accessToken?: string) {
  return {
    apikey: cloudConfig.key,
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
  };
}

export function readStoredSession(): CloudSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as CloudSession) : null;
  } catch {
    return null;
  }
}

export function writeStoredSession(session: CloudSession | null) {
  if (typeof window === "undefined") return;
  if (!session) window.localStorage.removeItem(SESSION_KEY);
  else window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function oauthUrl(nextPath: string) {
  const first = nextPath.split("/").filter(Boolean)[0];
  const locale = ["tr", "en", "el"].includes(first) ? first : "tr";
  const redirectTo = `${window.location.origin}/${locale}/auth/callback?next=${encodeURIComponent(nextPath)}`;
  const url = new URL(`${cloudConfig.url}/auth/v1/authorize`);
  url.searchParams.set("provider", "google");
  url.searchParams.set("redirect_to", redirectTo);
  url.searchParams.set("scopes", "openid email profile");
  return url.toString();
}

export function sessionFromHash(hash: string): CloudSession | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const expiresIn = Number(params.get("expires_in") ?? 3600);
  if (!accessToken || !refreshToken) return null;
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    token_type: params.get("token_type") ?? "bearer"
  };
}

export async function getCloudUser(accessToken: string): Promise<CloudUser> {
  const response = await fetch(`${cloudConfig.url}/auth/v1/user`, {
    headers: authHeaders(accessToken),
    cache: "no-store"
  });
  if (!response.ok) throw new Error("Cloud session could not be verified.");
  return response.json() as Promise<CloudUser>;
}

export async function refreshCloudSession(session: CloudSession): Promise<CloudSession> {
  const response = await fetch(`${cloudConfig.url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ refresh_token: session.refresh_token }),
    cache: "no-store"
  });
  if (!response.ok) throw new Error("Cloud session could not be refreshed.");
  const data = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type?: string;
    user?: CloudUser;
  };
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
    token_type: data.token_type,
    user: data.user
  };
}

export async function signOutCloud(session: CloudSession) {
  await fetch(`${cloudConfig.url}/auth/v1/logout`, {
    method: "POST",
    headers: authHeaders(session.access_token)
  }).catch(() => undefined);
}

export async function loadCloudPayload(session: CloudSession, userId: string): Promise<CloudPayload | null> {
  const url = new URL(`${cloudConfig.url}/rest/v1/user_data`);
  url.searchParams.set("select", "data,updated_at");
  url.searchParams.set("user_id", `eq.${userId}`);
  url.searchParams.set("limit", "1");
  const response = await fetch(url, {
    headers: authHeaders(session.access_token),
    cache: "no-store"
  });
  if (!response.ok) throw new Error("Cloud data could not be downloaded.");
  const rows = (await response.json()) as Array<{ data?: CloudPayload }>;
  return rows[0]?.data ?? null;
}

export async function saveCloudPayload(session: CloudSession, userId: string, payload: CloudPayload) {
  const url = new URL(`${cloudConfig.url}/rest/v1/user_data`);
  url.searchParams.set("on_conflict", "user_id");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...authHeaders(session.access_token),
      Prefer: "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify({ user_id: userId, data: payload, updated_at: payload.updatedAt })
  });
  if (!response.ok) throw new Error("Cloud data could not be saved.");
}
