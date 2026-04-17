"use node";

import Stripe from "stripe";
import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key, {
    apiVersion: "2026-03-25.dahlia",
  });
}

// ── Called by Next.js API route after verifying the webhook signature ─────

export const handleWebhookEvent = internalAction({
  args: {
    type: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const { type, data } = args;

    switch (type) {
      case "checkout.session.completed": {
        const session = data as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) break;

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;

        const subscription =
          await getStripe().subscriptions.retrieve(subscriptionId);

        // Find user by email (which we set as client_reference_id in checkout)
        const clerkId = session.client_reference_id;
        if (!clerkId) break;

        const user: { _id: string } | null = await ctx.runQuery(
          internal.stripeHelpers.getUserByClerkId,
          { clerkId }
        );
        if (!user) break;

        const plan = determinePlan(subscription);

        await ctx.runMutation(internal.subscriptions.upsertFromStripe, {
          userId: user._id as any,
          stripeCustomerId: subscription.customer as string,
          stripeSubscriptionId: subscription.id,
          status: subscription.status,
          plan,
          currentPeriodEnd: subscription.items.data[0]?.current_period_end ?? 0,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });

        // Credit the referrer if this user was referred
        await ctx.runMutation(internal.referrals.creditReferral, {
          referredUserId: user._id as any,
        });

        // In-app notification
        await ctx.runMutation(internal.notifications.createInternal, {
          userId: user._id as any,
          type: "system",
          title: "Subscription activated",
          body: `Your ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan is now active. Welcome aboard!`,
          link: "/dashboard/settings",
        });

        // Send subscription confirmation email
        if (session.customer_email || session.customer_details?.email) {
          try {
            await ctx.runAction(internal.emails.sendSubscriptionConfirmed, {
              email: (session.customer_email || session.customer_details?.email)!,
              plan: plan.charAt(0).toUpperCase() + plan.slice(1),
            });
          } catch (e) {
            console.error("Failed to send subscription email:", e);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = data as Stripe.Subscription;
        const plan = determinePlan(subscription);

        await ctx.runMutation(internal.subscriptions.updateFromStripe, {
          stripeSubscriptionId: subscription.id,
          status: subscription.status,
          plan,
          currentPeriodEnd: subscription.items.data[0]?.current_period_end ?? 0,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });

        // Notify if cancellation scheduled
        if (subscription.cancel_at_period_end) {
          const userId = await ctx.runQuery(
            internal.stripeHelpers.getUserIdByStripeSubscriptionId,
            { stripeSubscriptionId: subscription.id }
          );
          if (userId) {
            await ctx.runMutation(internal.notifications.createInternal, {
              userId: userId as any,
              type: "system",
              title: "Subscription cancelling",
              body: "Your subscription will cancel at the end of the current billing period.",
              link: "/dashboard/settings",
            });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = data as Stripe.Subscription;

        // Get userId before deleting
        const userId = await ctx.runQuery(
          internal.stripeHelpers.getUserIdByStripeSubscriptionId,
          { stripeSubscriptionId: subscription.id }
        );

        await ctx.runMutation(internal.subscriptions.updateFromStripe, {
          stripeSubscriptionId: subscription.id,
          status: "canceled",
        });

        if (userId) {
          await ctx.runMutation(internal.notifications.createInternal, {
            userId: userId as any,
            type: "system",
            title: "Subscription canceled",
            body: "Your subscription has been canceled. You can resubscribe anytime.",
            link: "/dashboard/settings",
          });
        }
        break;
      }
    }
  },
});

// ── Create Stripe Checkout Session ────────────────────────────────────────

export const createCheckoutSession = action({
  args: {
    priceId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const email = identity.email ?? undefined;
    const clerkId = identity.subject;

    // Check if user already has a Stripe customer
    const user: any = await ctx.runQuery(
      internal.stripeHelpers.getUserByClerkId,
      { clerkId }
    );
    if (!user) throw new Error("User not found");

    const existingSub: any = await ctx.runQuery(
      internal.stripeHelpers.getSubscriptionByUserId,
      { userId: user._id }
    );

    // If they already have a subscription, send to portal instead
    if (existingSub && existingSub.stripeCustomerId) {
      const portalSession = await getStripe().billingPortal.sessions.create({
        customer: existingSub.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard/settings`,
      });
      return { url: portalSession.url };
    }

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: args.priceId, quantity: 1 }],
      customer_email: email,
      client_reference_id: clerkId,
      subscription_data: {
        trial_period_days: 30,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard/settings?billing=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard/settings?billing=canceled`,
    });

    return { url: session.url };
  },
});

// ── Create Stripe Customer Portal session ─────────────────────────────────

export const createPortalSession = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user: any = await ctx.runQuery(
      internal.stripeHelpers.getUserByClerkId,
      { clerkId: identity.subject }
    );
    if (!user) throw new Error("User not found");

    const sub: any = await ctx.runQuery(
      internal.stripeHelpers.getSubscriptionByUserId,
      { userId: user._id }
    );
    if (!sub?.stripeCustomerId) throw new Error("No subscription found");

    const session = await getStripe().billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard/settings`,
    });

    return { url: session.url };
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────

function determinePlan(subscription: Stripe.Subscription): string {
  const priceId = subscription.items.data[0]?.price?.id;
  const proPriceId =
    process.env.STRIPE_PRO_PRICE_ID ??
    process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
  const teamPriceId =
    process.env.STRIPE_TEAM_PRICE_ID ??
    process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID;

  if (priceId === teamPriceId) return "team";
  if (priceId === proPriceId) return "pro";
  return "pro"; // default to pro for unknown prices
}
