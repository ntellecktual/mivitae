"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");
  return new Resend(apiKey);
}

const FROM_EMAIL = "mivitae <noreply@mivitae.org>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mivitae.org";

/** Escape HTML entities to prevent XSS in email templates */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Welcome Email ──────────────────────────────────────────────────────────

export const sendWelcome = internalAction({
  args: {
    email: v.string(),
    firstName: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const resend = getResend();
    const name = escapeHtml(args.firstName || "there");

    await resend.emails.send({
      from: FROM_EMAIL,
      to: args.email,
      subject: "Welcome to mivitae — your living portfolio awaits",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #111;">Hey ${name}! 👋</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Welcome to <strong>mivitae</strong> — where your career comes alive. Upload your resume and
            we'll transform it into a beautiful, shareable portfolio in seconds.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">Here's what to do next:</p>
          <ol style="font-size: 15px; line-height: 1.8; color: #444;">
            <li>Upload your resume PDF</li>
            <li>Review and customize your portfolio</li>
            <li>Share your unique link with the world</li>
          </ol>
          <a href="${APP_URL}/dashboard"
             style="display: inline-block; margin-top: 16px; padding: 12px 28px; background: #111; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Get Started →
          </a>
          <p style="margin-top: 32px; font-size: 13px; color: #999;">
            You're on the <strong>Free Trial</strong> — enjoy full access for 30 days.
          </p>
        </div>
      `,
    });
  },
});

// ── Team Invite Email ──────────────────────────────────────────────────────

export const sendTeamInvite = internalAction({
  args: {
    email: v.string(),
    teamName: v.string(),
    inviterName: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const resend = getResend();
    const inviter = escapeHtml(args.inviterName || "Someone");
    const teamName = escapeHtml(args.teamName);

    await resend.emails.send({
      from: FROM_EMAIL,
      to: args.email,
      subject: `${inviter} invited you to join ${teamName} on mivitae`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #111;">You're invited! 🎉</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            <strong>${inviter}</strong> has invited you to join the <strong>${teamName}</strong> team on mivitae.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            mivitae helps professionals build beautiful, AI-powered portfolios
            that showcase their career journey.
          </p>
          <a href="${APP_URL}/sign-up"
             style="display: inline-block; margin-top: 16px; padding: 12px 28px; background: #111; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Accept Invitation →
          </a>
          <p style="margin-top: 32px; font-size: 13px; color: #999;">
            If you weren't expecting this, you can safely ignore this email.
          </p>
        </div>
      `,
    });
  },
});

// ── Subscription Confirmed Email ───────────────────────────────────────────

export const sendSubscriptionConfirmed = internalAction({
  args: {
    email: v.string(),
    firstName: v.optional(v.string()),
    plan: v.string(),
  },
  handler: async (_ctx, args) => {
    const resend = getResend();
    const name = escapeHtml(args.firstName || "there");
    const plan = escapeHtml(args.plan);

    await resend.emails.send({
      from: FROM_EMAIL,
      to: args.email,
      subject: `You're now on the ${args.plan} plan \u2014 welcome aboard!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #111;">Welcome to ${plan}! \uD83D\uDE80</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Hey ${name}, your <strong>${args.plan}</strong> subscription is now active. Here's what you've unlocked:
          </p>
          <ul style="font-size: 15px; line-height: 1.8; color: #444;">
            ${args.plan.toLowerCase() === "team" ? `
              <li>Unlimited demos & portfolio entries</li>
              <li>Team page & member management</li>
              <li>Advanced analytics & insights</li>
              <li>Custom themes & branding</li>
            ` : `
              <li>Up to 50 portfolio entries & 25 demos</li>
              <li>Advanced analytics & insights</li>
              <li>Custom themes & branding</li>
              <li>Priority resume parsing</li>
            `}
          </ul>
          <a href="${APP_URL}/dashboard"
             style="display: inline-block; margin-top: 16px; padding: 12px 28px; background: #111; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Explore Your Dashboard →
          </a>
        </div>
      `,
    });
  },
});

// ── Trial Expiring Reminder (7 days before) ────────────────────────────────

export const sendTrialExpiring = internalAction({
  args: {
    email: v.string(),
    firstName: v.optional(v.string()),
    daysLeft: v.number(),
  },
  handler: async (_ctx, args) => {
    const resend = getResend();
    const name = escapeHtml(args.firstName || "there");

    await resend.emails.send({
      from: FROM_EMAIL,
      to: args.email,
      subject: `Your mivitae trial ends in ${args.daysLeft} days`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #111;">Your trial ends soon ⏳</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Hey ${name}, you have <strong>${args.daysLeft} days</strong> left on your free trial.
            Upgrade now to keep your portfolio, analytics, and customizations.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Pro plans start at just <strong>$12/month</strong> — less than the cost of a lunch.
          </p>
          <a href="${APP_URL}/dashboard/settings"
             style="display: inline-block; margin-top: 16px; padding: 12px 28px; background: #111; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Upgrade Now →
          </a>
          <p style="margin-top: 32px; font-size: 13px; color: #999;">
            Not ready? No worries — your portfolio stays on the Free plan with limited features.
          </p>
        </div>
      `,
    });
  },
});

// ── Contact Message Forward ────────────────────────────────────────────────

export const sendContactForward = internalAction({
  args: {
    recipientEmail: v.string(),
    senderName: v.string(),
    senderEmail: v.string(),
    message: v.string(),
  },
  handler: async (_ctx, args) => {
    const resend = getResend();
    const senderName = escapeHtml(args.senderName);
    const senderEmail = escapeHtml(args.senderEmail);
    const message = escapeHtml(args.message).replace(/\n/g, "<br>");

    await resend.emails.send({
      from: FROM_EMAIL,
      to: args.recipientEmail,
      replyTo: args.senderEmail,
      subject: `New message from ${args.senderName} via mivitae`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #111;">New Contact Message</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            <strong>${senderName}</strong> (${senderEmail}) sent you a message through your mivitae portfolio:
          </p>
          <div style="margin: 24px 0; padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #6366f1;">
            <p style="font-size: 15px; line-height: 1.7; color: #333; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="font-size: 14px; color: #666;">
            You can reply directly to this email to respond to ${senderName}.
          </p>
          <a href="${APP_URL}/dashboard/messages"
             style="display: inline-block; margin-top: 16px; padding: 12px 28px; background: #111; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
            View All Messages \u2192
          </a>
        </div>
      `,
    });
  },
});
// ── Drip Campaign Emails ───────────────────────────────────────────────────

const DRIP_TEMPLATES: Record<string, { subject: string; body: (name: string) => string }> = {
  day1_setup: {
    subject: "Quick tip: Complete your mivitae profile",
    body: (name) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 22px; font-weight: 700; color: #111;">Hey ${name}! 👋</h1>
        <p style="font-size: 15px; line-height: 1.6; color: #333;">
          You signed up for mivitae — great move! To get the most out of your portfolio, start by uploading your resume.
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #333;">
          Our AI will automatically extract your work history, education, and skills.
        </p>
        <a href="${APP_URL}/dashboard/upload"
           style="display: inline-block; margin-top: 16px; padding: 12px 28px; background: #111; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
          Upload Resume →
        </a>
        <p style="margin-top: 32px; font-size: 13px; color: #999;">
          — The mivitae team
        </p>
      </div>`,
  },
  day3_profile: {
    subject: "Make your portfolio stand out",
    body: (name) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 22px; font-weight: 700; color: #111;">Hi ${name} 🎨</h1>
        <p style="font-size: 15px; line-height: 1.6; color: #333;">
          Your portfolio is more than a resume — it's your brand. Here are a few things to try:
        </p>
        <ul style="font-size: 15px; line-height: 1.8; color: #444;">
          <li><strong>Choose a theme</strong> — 18+ presets to match your style</li>
          <li><strong>Add a headline and bio</strong> — first impressions matter</li>
          <li><strong>Set your custom URL</strong> — share mivitae.org/u/you</li>
        </ul>
        <a href="${APP_URL}/dashboard/theme"
           style="display: inline-block; margin-top: 16px; padding: 12px 28px; background: #111; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
          Customize Theme →
        </a>
        <p style="margin-top: 32px; font-size: 13px; color: #999;">
          — The mivitae team
        </p>
      </div>`,
  },
  day7_demo: {
    subject: "Show your code in action with live demos",
    body: (name) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 22px; font-weight: 700; color: #111;">Hey ${name} 🚀</h1>
        <p style="font-size: 15px; line-height: 1.6; color: #333;">
          Did you know you can add interactive demos to your portfolio? They run right in the browser!
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #333;">
          You can also import your best GitHub repositories with one click.
        </p>
        <a href="${APP_URL}/dashboard/demos"
           style="display: inline-block; margin-top: 16px; padding: 12px 28px; background: #111; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
          Create a Demo →
        </a>
        <p style="margin-top: 32px; font-size: 13px; color: #999;">
          — The mivitae team
        </p>
      </div>`,
  },
  day14_publish: {
    subject: "Ready to go live? Publish your portfolio",
    body: (name) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 22px; font-weight: 700; color: #111;">Hi ${name} 🌟</h1>
        <p style="font-size: 15px; line-height: 1.6; color: #333;">
          Your portfolio has been taking shape! If you haven't already, it's time to make it public and share it with the world.
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #333;">
          Go to your profile settings and toggle "Public" to make your portfolio visible at your custom URL.
        </p>
        <a href="${APP_URL}/dashboard/profile"
           style="display: inline-block; margin-top: 16px; padding: 12px 28px; background: #111; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
          Go to Profile →
        </a>
        <p style="margin-top: 32px; font-size: 13px; color: #999;">
          — The mivitae team
        </p>
      </div>`,
  },
};

export const sendDripEmail = internalAction({
  args: {
    email: v.string(),
    firstName: v.optional(v.string()),
    emailKey: v.string(),
  },
  handler: async (_ctx, args) => {
    const template = DRIP_TEMPLATES[args.emailKey];
    if (!template) return; // Unknown drip key, skip

    const resend = getResend();
    const name = escapeHtml(args.firstName || "there");

    await resend.emails.send({
      from: FROM_EMAIL,
      to: args.email,
      subject: template.subject,
      html: template.body(name),
    });
  },
});

// ── Notification Email ─────────────────────────────────────────────────────

export const sendNotificationEmail = internalAction({
  args: {
    email: v.string(),
    title: v.string(),
    body: v.string(),
    link: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const resend = getResend();
    const safeTitle = escapeHtml(args.title);
    const safeBody = escapeHtml(args.body);
    const ctaHtml = args.link
      ? `<a href="${APP_URL}${args.link}"
           style="display: inline-block; margin-top: 16px; padding: 12px 28px; background: #0d9373; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
          View Details →
        </a>`
      : "";

    await resend.emails.send({
      from: FROM_EMAIL,
      to: args.email,
      subject: safeTitle,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 22px; font-weight: 700; color: #111;">${safeTitle}</h1>
          <p style="font-size: 15px; line-height: 1.6; color: #333;">${safeBody}</p>
          ${ctaHtml}
          <p style="margin-top: 32px; font-size: 13px; color: #999;">
            — The mivitae team
          </p>
        </div>`,
    });
  },
});