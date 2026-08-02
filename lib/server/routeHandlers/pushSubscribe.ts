import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { serviceRest, verifyAccessToken } from "@/lib/server/supabaseRest";

function bearer(request: Request) {
  const value = request.headers.get("authorization") ?? "";
  return value.toLowerCase().startsWith("bearer ") ? value.slice(7) : "";
}

function safePushEndpoint(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) return null;
    const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return null;
    if (/^(?:0|10|127)\./.test(host) || /^169\.254\./.test(host) || /^192\.168\./.test(host)) return null;
    const private172 = host.match(/^172\.(\d{1,3})\./);
    if (private172 && Number(private172[1]) >= 16 && Number(private172[1]) <= 31) return null;
    if (host.includes(":") && (host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:"))) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const user = await verifyAccessToken(bearer(request));
  if (!user) return NextResponse.json({ message: "Google hesabıyla giriş yapmalısınız." }, { status: 401 });
  const body = (await request.json()) as { subscription?: PushSubscriptionJSON };
  const endpoint = body.subscription?.endpoint ? safePushEndpoint(body.subscription.endpoint) : null;
  if (!endpoint) return NextResponse.json({ message: "Geçersiz bildirim aboneliği." }, { status: 400 });
  const deviceToken = randomUUID();
  const response = await serviceRest("push_subscriptions?on_conflict=endpoint", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({ user_id: user.id, endpoint, subscription: body.subscription, device_token: deviceToken, updated_at: new Date().toISOString() })
  });
  if (!response.ok) return NextResponse.json({ message: "Bildirim aboneliği kaydedilemedi." }, { status: 502 });
  const rows = (await response.json()) as Array<{ device_token: string }>;
  return NextResponse.json({ token: rows[0]?.device_token ?? deviceToken });
}

export async function DELETE(request: Request) {
  const user = await verifyAccessToken(bearer(request));
  if (!user) return NextResponse.json({ message: "Oturum gerekli." }, { status: 401 });
  const body = (await request.json()) as { endpoint?: string };
  if (!body.endpoint) return NextResponse.json({ message: "Endpoint gerekli." }, { status: 400 });
  const response = await serviceRest(`push_subscriptions?user_id=eq.${encodeURIComponent(user.id)}&endpoint=eq.${encodeURIComponent(body.endpoint)}`, { method: "DELETE" });
  return NextResponse.json({ ok: response.ok });
}
