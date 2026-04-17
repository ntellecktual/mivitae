import { Webhook } from "svix";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: { type: string; data: Record<string, unknown> };

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as typeof evt;
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  // Forward verified payload to Convex HTTP endpoint
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
  // Convex HTTP endpoints are at the same domain but on the HTTP router
  const convexSiteUrl = convexUrl.replace(".convex.cloud", ".convex.site");

  const forwardResponse = await fetch(`${convexSiteUrl}/clerk-webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.INTERNAL_WEBHOOK_SECRET
        ? { "x-webhook-secret": process.env.INTERNAL_WEBHOOK_SECRET }
        : {}),
    },
    body: JSON.stringify(evt),
  });

  if (!forwardResponse.ok) {
    console.error("Convex clerk webhook handler failed:", forwardResponse.status);
    return new Response("Forward failed", { status: 502 });
  }

  return new Response(null, { status: 200 });
}

