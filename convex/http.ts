import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

/**
 * Verify the shared secret sent by Next.js API routes when forwarding webhooks.
 * Uses constant-time comparison to prevent timing attacks.
 */
function verifyInternalSecret(request: Request): boolean {
  const secret = request.headers.get("x-webhook-secret");
  const expected = process.env.INTERNAL_WEBHOOK_SECRET;
  if (!expected) return true; // Skip check if not configured (dev mode)
  if (!secret || secret.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= secret.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!verifyInternalSecret(request)) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const eventType = body.type as string;
    const data = body.data;

    // Idempotency: skip if this event was already processed
    const eventId = body.id ?? `clerk_${data.id}_${eventType}`;
    const alreadyProcessed = await ctx.runQuery(
      internal.webhookHelpers.isEventProcessed,
      { eventId }
    );
    if (alreadyProcessed) {
      return new Response(null, { status: 200 });
    }

    switch (eventType) {
      case "user.created": {
        const userId = await ctx.runMutation(internal.users.upsertFromClerk, {
          clerkId: data.id,
          email: data.email_addresses?.[0]?.email_address ?? "",
          firstName: data.first_name ?? undefined,
          lastName: data.last_name ?? undefined,
          imageUrl: data.image_url ?? undefined,
        });
        // Claim referral if the signup link carried a ref code
        const refCode =
          data.unsafe_metadata?.referralCode ||
          data.public_metadata?.referralCode;
        if (refCode && typeof refCode === "string") {
          await ctx.runMutation(internal.referrals.claimReferral, {
            referredUserId: userId,
            referralCode: refCode,
          });
        }
        // Send welcome email
        const email = data.email_addresses?.[0]?.email_address;
        if (email) {
          try {
            await ctx.runAction(internal.emails.sendWelcome, {
              email,
              firstName: data.first_name ?? undefined,
            });
          } catch (e) {
            console.error("Failed to send welcome email:", e);
          }
        }
        break;
      }
      case "user.updated": {
        await ctx.runMutation(internal.users.upsertFromClerk, {
          clerkId: data.id,
          email: data.email_addresses?.[0]?.email_address ?? "",
          firstName: data.first_name ?? undefined,
          lastName: data.last_name ?? undefined,
          imageUrl: data.image_url ?? undefined,
        });
        break;
      }
      case "user.deleted": {
        if (data.id) {
          await ctx.runMutation(internal.users.deleteByClerkId, {
            clerkId: data.id,
          });
        }
        break;
      }
    }

    // Mark event as processed for idempotency
    await ctx.runMutation(internal.webhookHelpers.markEventProcessed, {
      eventId,
      source: "clerk" as const,
    });

    return new Response(null, { status: 200 });
  }),
});

// ── Stripe webhook (forwarded from Next.js after signature verification) ──

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!verifyInternalSecret(request)) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { id: stripeEventId, type, data } = body;

    // Idempotency: skip if this Stripe event was already processed
    if (stripeEventId) {
      const alreadyProcessed = await ctx.runQuery(
        internal.webhookHelpers.isEventProcessed,
        { eventId: stripeEventId }
      );
      if (alreadyProcessed) {
        return new Response(null, { status: 200 });
      }
    }

    try {
      await ctx.runAction(internal.stripeActions.handleWebhookEvent, {
        type,
        data,
      });
    } catch (err) {
      console.error("Error handling Stripe webhook:", err);
      return new Response("Internal error", { status: 500 });
    }

    // Mark event as processed for idempotency
    if (stripeEventId) {
      await ctx.runMutation(internal.webhookHelpers.markEventProcessed, {
        eventId: stripeEventId,
        source: "stripe" as const,
      });
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
