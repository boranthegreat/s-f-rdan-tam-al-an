import { NextResponse } from "next/server";

export function GET() {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key) return NextResponse.json({ message: "Push notifications are not configured." }, { status: 503 });
  return NextResponse.json({ key });
}
