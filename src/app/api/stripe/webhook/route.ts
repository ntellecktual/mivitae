import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/convex";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook verification failed:", message);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }

  // Forward to Convex HTTP endpoint for processing
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!.replace(
      ".convex.cloud",
      ".convex.site"
    );
    const response = await fetch(`${convexUrl}/stripe-webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.INTERNAL_WEBHOOK_SECRET
          ? { "x-webhook-secret": process.env.INTERNAL_WEBHOOK_SECRET }
          : {}),
      },
      body: JSON.stringify({
        id: event.id,
        type: event.type,
        data: event.data.object,
      }),
    });

    if (!response.ok) {
      console.error("Convex webhook handler failed:", response.status);
    }
  } catch (err) {
    console.error("Failed to forward to Convex:", err);
  }

  return NextResponse.json({ received: true });
}
