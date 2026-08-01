"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  cloudConfig,
  getCloudUser,
  isCloudConfigured,
  loadCloudPayload,
  oauthUrl,
  readStoredSession,
  refreshCloudSession,
  saveCloudPayload,
  signOutCloud,
  writeStoredSession,
  type CloudPayload,
  type CloudSession,
  type CloudUser
} from "@/lib/cloud/client";

const LOCAL_UPDATED_KEY = "boranthegreat:cloud-local-updated-at";

const STORE_KEYS = [
  "boranthegreat:favorites",
  "boranthegreat:portfolio",
  "boranthegreat:alerts",
  "boranthegreat:market-notes",
  "boranthegreat:user-settings",
  "boranthegreat:theme",
  "btg-language"
] as const;

const UPDATE_EVENTS = [
  "boranthegreat:favorites-updated",
  "boranthegreat:portfolio-updated",
  "boranthegreat:alerts-updated",
  "boranthegreat:market-notes-updated",
  "boranthegreat:user-settings-updated",
  "boranthegreat:theme-updated",
  "boranthegreat:language-updated"
];

type SyncStatus = "disabled" | "signed-out" | "loading" | "synced" | "saving" | "error";

type CloudContextValue = {
  configured: boolean;
  user: CloudUser | null;
  session: CloudSession | null;
  status: SyncStatus;
  error: string;
  signIn: () => void;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
};

const CloudContext = createContext<CloudContextValue | null>(null);

function readLocalPayload(): CloudPayload {
  const stores: Record<string, string> = {};
  for (const key of STORE_KEYS) {
    const value = window.localStorage.getItem(key);
    if (value !== null) stores[key] = value;
  }
  const updatedAt = window.localStorage.getItem(LOCAL_UPDATED_KEY) ?? "1970-01-01T00:00:00.000Z";
  return { version: 1, updatedAt, stores };
}

function mergePayload(remote: CloudPayload | null, local: CloudPayload): CloudPayload {
  if (!remote) return { ...local, updatedAt: new Date().toISOString() };
  const remoteTime = new Date(remote.updatedAt).getTime();
  const localTime = new Date(local.updatedAt).getTime();
  const winner = localTime > remoteTime ? local : remote;
  return { version: 1, updatedAt: new Date().toISOString(), stores: { ...winner.stores } };
}

function applyPayload(payload: CloudPayload) {
  for (const key of STORE_KEYS) {
    const value = payload.stores[key];
    if (value === undefined) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  }
  window.localStorage.setItem(LOCAL_UPDATED_KEY, payload.updatedAt);
  for (const eventName of UPDATE_EVENTS) window.dispatchEvent(new Event(eventName));
}

export function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  const configured = isCloudConfigured();
  const [session, setSession] = useState<CloudSession | null>(null);
  const [user, setUser] = useState<CloudUser | null>(null);
  const [status, setStatus] = useState<SyncStatus>(configured ? "loading" : "disabled");
  const [error, setError] = useState("");
  const isApplyingRemote = useRef(false);
  const saveTimer = useRef<number | null>(null);

  const ensureFreshSession = useCallback(async (current: CloudSession) => {
    if (current.expires_at - Math.floor(Date.now() / 1000) > 120) return current;
    const refreshed = await refreshCloudSession(current);
    writeStoredSession(refreshed);
    setSession(refreshed);
    return refreshed;
  }, []);

  const syncNow = useCallback(async () => {
    if (!session || !user) return;
    try {
      setStatus("saving");
      const fresh = await ensureFreshSession(session);
      const local = readLocalPayload();
      const remote = await loadCloudPayload(fresh, user.id);
      const merged = mergePayload(remote, local);
      const remoteIsNewer = Boolean(remote && new Date(remote.updatedAt).getTime() >= new Date(local.updatedAt).getTime());
      if (remoteIsNewer) {
        isApplyingRemote.current = true;
        applyPayload(merged);
        isApplyingRemote.current = false;
      }
      await saveCloudPayload(fresh, user.id, merged);
      setStatus("synced");
      setError("");
    } catch (syncError) {
      setStatus("error");
      setError(syncError instanceof Error ? syncError.message : "Cloud sync failed.");
    }
  }, [ensureFreshSession, session, user]);

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    async function initialize() {
      const stored = readStoredSession();
      if (!stored) {
        if (!cancelled) setStatus("signed-out");
        return;
      }
      try {
        const fresh = await ensureFreshSession(stored);
        const currentUser = fresh.user ?? (await getCloudUser(fresh.access_token));
        fresh.user = currentUser;
        writeStoredSession(fresh);
        if (cancelled) return;
        setSession(fresh);
        setUser(currentUser);
        const local = readLocalPayload();
        const remote = await loadCloudPayload(fresh, currentUser.id);
        const merged = mergePayload(remote, local);
        isApplyingRemote.current = true;
        applyPayload(merged);
        isApplyingRemote.current = false;
        await saveCloudPayload(fresh, currentUser.id, merged);
        if (!cancelled) setStatus("synced");
      } catch (initialError) {
        writeStoredSession(null);
        if (!cancelled) {
          setSession(null);
          setUser(null);
          setStatus("signed-out");
          setError(initialError instanceof Error ? initialError.message : "Cloud sign-in expired.");
        }
      }
    }
    initialize();
    return () => {
      cancelled = true;
    };
  }, [configured, ensureFreshSession]);

  useEffect(() => {
    if (!session || !user) return;
    const scheduleSave = () => {
      if (isApplyingRemote.current) return;
      window.localStorage.setItem(LOCAL_UPDATED_KEY, new Date().toISOString());
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => void syncNow(), 900);
    };
    window.addEventListener("storage", scheduleSave);
    for (const eventName of UPDATE_EVENTS) window.addEventListener(eventName, scheduleSave);
    return () => {
      window.removeEventListener("storage", scheduleSave);
      for (const eventName of UPDATE_EVENTS) window.removeEventListener(eventName, scheduleSave);
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [session, syncNow, user]);

  useEffect(() => {
    if (!session || !user) return;
    const reconcile = () => void syncNow();
    const onVisibility = () => {
      if (document.visibilityState === "visible") reconcile();
    };
    window.addEventListener("focus", reconcile);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", reconcile);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [session, syncNow, user]);

  const value = useMemo<CloudContextValue>(
    () => ({
      configured,
      user,
      session,
      status,
      error,
      signIn: () => {
        if (!configured) return;
        window.location.href = oauthUrl(window.location.pathname);
      },
      signOut: async () => {
        if (session) await signOutCloud(session);
        writeStoredSession(null);
        setSession(null);
        setUser(null);
        setStatus("signed-out");
      },
      syncNow
    }),
    [configured, error, session, status, syncNow, user]
  );

  return <CloudContext.Provider value={value}>{children}</CloudContext.Provider>;
}

export function useCloudSync() {
  const value = useContext(CloudContext);
  if (!value) throw new Error("useCloudSync must be used inside CloudSyncProvider");
  return value;
}

export { cloudConfig };
