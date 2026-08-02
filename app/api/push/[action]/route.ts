import { NextResponse } from "next/server";
import { GET as getPublicKey } from "@/lib/server/routeHandlers/pushPublicKey";
import { GET as getPending } from "@/lib/server/routeHandlers/pushPending";
import {
  POST as subscribe,
  DELETE as unsubscribe
} from "@/lib/server/routeHandlers/pushSubscribe";

type RouteContext = {
  params: Promise<{ action: string }>;
};

async function actionFrom(context: RouteContext) {
  return (await context.params).action;
}

export async function GET(request: Request, context: RouteContext) {
  const action = await actionFrom(context);
  if (action === "public-key") return getPublicKey();
  if (action === "pending") return getPending(request);
  return NextResponse.json({ error: "Push route not found" }, { status: 404 });
}

export async function POST(request: Request, context: RouteContext) {
  const action = await actionFrom(context);
  if (action === "subscribe") return subscribe(request);
  return NextResponse.json({ error: "Push route not found" }, { status: 404 });
}

export async function DELETE(request: Request, context: RouteContext) {
  const action = await actionFrom(context);
  if (action === "subscribe") return unsubscribe(request);
  return NextResponse.json({ error: "Push route not found" }, { status: 404 });
}
