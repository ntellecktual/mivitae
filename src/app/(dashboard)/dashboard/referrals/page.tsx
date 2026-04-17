"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { useState, useEffect } from "react";
import {
  Copy,
  Check,
  Gift,
  Users,
  Star,
  Clock,
  ArrowRight,
  QrCode,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ── Minimal SVG QR code placeholder ──────────────────────────────────────────
// Generates a visual QR-style grid from the URL string (decorative/scannable via
// a real service). We embed via a URL to goqr.me which is a free, CORS-safe API.
function QrDisplay({ url }: { url: string }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="QR code for your referral link"
      width={120}
      height={120}
      className="rounded-lg border bg-white p-1.5"
    />
  );
}

// ── Social icons (not in lucide) ────────────────────────────────────────────
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

// ── TikTok icon (not in lucide) ───────────────────────────────────────────────
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  );
}

export default function ReferralsPage() {
  const stats = useQuery(api.referrals.getMyStats);
  const ensureMyCode = useMutation(api.referrals.ensureMyCode);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (stats && !stats.code) ensureMyCode({});
  }, [stats, ensureMyCode]);

  const referralLink = stats?.code
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? "https://mivitae.org"}/sign-up?ref=${stats.code}`
    : null;

  function copyLink() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (stats == null)
    return (
      <div className="space-y-8">
        <div>
          <div className="h-9 w-44 animate-pulse rounded-lg bg-muted" />
          <div className="mt-2 h-5 w-80 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl border bg-muted" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl border bg-muted" />
        <div className="h-40 animate-pulse rounded-2xl border bg-muted" />
      </div>
    );

  const shareText = encodeURIComponent(
    "Build a portfolio that proves your skills, not just describes them 🔥 Try mivitae:"
  );

  return (
    <div className="space-y-8">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Refer &amp; Earn</h1>
        <p className="mt-1.5 text-base text-muted-foreground">
          Every referred user who subscribes earns you{" "}
          <span className="font-semibold text-foreground">1 month of Pro free</span>.
        </p>
      </div>

      {/* ── Stat bento cards ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="Total referrals"
          value={stats.total ?? 0}
          color="violet"
        />
        <StatCard
          icon={Clock}
          label="Pending conversion"
          value={stats.pending ?? 0}
          color="amber"
        />
        <StatCard
          icon={Star}
          label="Months credited"
          value={stats.credits ?? 0}
          color="emerald"
        />
      </div>

      {/* ── Referral link hero card ───────────────────────────────────────────── */}
      <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Gift className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-base font-semibold">Your referral link</h2>
        </div>

        {referralLink ? (
          <>
            {/* Link row + QR */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {/* Left: URL + copy + share */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-xl border bg-muted/50 px-3 py-2.5 text-sm font-mono text-muted-foreground truncate">
                    {referralLink}
                  </div>
                  <button
                    onClick={copyLink}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                      copied
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Share this link anywhere. When someone signs up and converts to a paid plan,
                  you get credited automatically.
                </p>

                {/* Social share pills */}
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${shareText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    <FacebookIcon className="h-3.5 w-3.5 text-[#1877F2]" />
                    Facebook
                  </a>
                  <a
                    href={`https://www.instagram.com/?url=${encodeURIComponent(referralLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    <InstagramIcon className="h-3.5 w-3.5 text-[#E1306C]" />
                    Instagram
                  </a>
                  <a
                    href={`https://www.tiktok.com/upload?refers_from=${encodeURIComponent(referralLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    <TikTokIcon className="h-3.5 w-3.5" />
                    TikTok
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    <svg className="h-3.5 w-3.5 text-[#0077B5]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </a>
                </div>
              </div>

              {/* Right: QR code */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <QrDisplay url={referralLink} />
                <p className="text-[10px] text-muted-foreground">Scan to share</p>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Generating your referral link…
          </div>
        )}
      </div>

      {/* ── How it works — horizontal stepper ────────────────────────────────── */}
      <div className="rounded-2xl border bg-card p-6 space-y-6">
        <h2 className="text-base font-semibold">How it works</h2>

        {/* Desktop stepper */}
        <div className="hidden sm:flex items-start gap-0">
          {[
            { step: "1", text: "Copy your unique referral link above." },
            { step: "2", text: "Share it — post, message, or email. Your code is auto-attached." },
            { step: "3", text: "Friend signs up. Their account records your referral as Pending." },
            { step: "4", text: "They upgrade to Pro or Team — you get 1 free month." },
          ].map(({ step, text }, i, arr) => (
            <div key={step} className="flex flex-1 flex-col items-center text-center gap-3">
              {/* Step circle + connector */}
              <div className="flex w-full items-center">
                <div className={`flex-1 h-px ${i > 0 ? "bg-primary/20" : "bg-transparent"}`} />
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 text-sm font-bold text-primary">
                  {step}
                </div>
                <div className={`flex-1 h-px ${i < arr.length - 1 ? "bg-primary/20" : "bg-transparent"}`} />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed px-2">{text}</p>
            </div>
          ))}
        </div>

        {/* Mobile vertical list */}
        <ol className="sm:hidden space-y-4">
          {[
            { step: "1", text: "Copy your unique referral link above." },
            { step: "2", text: "Share it — post, message, or email. Your code is auto-attached." },
            { step: "3", text: "Friend signs up. Status shows as Pending." },
            { step: "4", text: "They upgrade — you get 1 free month of Pro." },
          ].map(({ step, text }) => (
            <li key={step} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {step}
              </span>
              <span className="text-muted-foreground leading-relaxed">{text}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* ── Referred users list ───────────────────────────────────────────────── */}
      {stats.referred.length > 0 ? (
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="text-base font-semibold">
            People you&apos;ve referred{" "}
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              ({stats.referred.length})
            </span>
          </h2>
          <ul className="divide-y">
            {stats.referred.map((r, i) => (
              <li key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold uppercase shrink-0">
                    {r.name?.[0] ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(r.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    r.status === "credited"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {r.status === "credited" ? "Credited ✓" : "Pending"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 font-medium">No referrals yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Share your link and watch this list grow.
          </p>
          {referralLink && (
            <button
              onClick={copyLink}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Copy className="h-4 w-4" />
              Copy referral link
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: "emerald" | "amber" | "violet";
}) {
  const colorMap = {
    emerald: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
      icon: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-500/20",
    },
    amber: {
      bg: "bg-amber-500/10 dark:bg-amber-500/15",
      icon: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/20",
    },
    violet: {
      bg: "bg-violet-500/10 dark:bg-violet-500/15",
      icon: "text-violet-600 dark:text-violet-400",
      border: "border-violet-500/20",
    },
  };
  const c = colorMap[color];

  return (
    <div className={cn("card-hover rounded-2xl border p-6 bg-card", c.border)}>
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", c.bg)}>
        <Icon className={cn("h-5 w-5", c.icon)} />
      </div>
      <p className="mt-4 text-3xl font-bold">{value}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}


