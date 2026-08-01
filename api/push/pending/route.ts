import { NextResponse } from "next/server";
import { serviceRest } from "@/lib/server/supabaseRest";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token || token.length < 20) return NextResponse.json({ message: "Invalid token" }, { status: 400 });
  const response = await serviceRest(`push_subscriptions?select=id,pending_title,pending_body,pending_url&device_token=eq.${encodeURIComponent(token)}&limit=1`);
  if (!response.ok) return NextResponse.json({ message: "Unavailable" }, { status: 502 });
  const rows = (await response.json()) as Array<{ id: string; pending_title?: string; pending_body?: string; pending_url?: string }>;
  const row = rows[0];
  if (!row) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const message = {
    title: row.pending_title || "BoranTheGreat fiyat alarmı",
    body: row.pending_body || "Takip ettiğin bir fiyat hedefi gerçekleşti.",
    url: row.pending_url || "/tr/alerts"
  };
  await serviceRest(`push_subscriptions?id=eq.${row.id}`, {
    method: "PATCH",
    body: JSON.stringify({ pending_title: null, pending_body: null, pending_url: null, updated_at: new Date().toISOString() })
  }).catch(() => undefined);
  return NextResponse.json(message);
}
