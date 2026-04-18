"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  CreditCard,
  Crown,
  Users,
  Check,
  ExternalLink,
  Sparkles,
  Shield,
  Loader2,
  Trash2,
  Download,
  Zap,
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const PLANS = [
  {
    id: "free",
    name: "Free Trial",
    price: "$0",
    period: "30 days",
    icon: Shield,
    features: [
      "1 portfolio",
      "3 demo cards",
      "Public profile page",
      "Resume parsing",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$12",
    period: "/month",
    icon: Crown,
    popular: true,
    features: [
      "Unlimited portfolios",
      "Unlimited demo cards",
      "Custom slug",
      "Profile analytics",
      "Priority support",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: "$49",
    period: "/month",
    icon: Users,
    features: [
      "Everything in Pro",
      "5 team seats",
      "Shared demo library",
      "White-label subdomain",
      "Admin dashboard",
    ],
  },
];

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const selfPlan = useQuery(api.subscriptions.getSelfPlan);
  const subscription = useQuery(api.subscriptions.getSelf);
  const exportData = useQuery(api.account.exportData);
  const createCheckout = useAction(api.stripeActions.createCheckoutSession);
  const createPortal = useAction(api.stripeActions.createPortalSession);
  const deleteAccount = useMutation(api.account.deleteSelf);
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState<string | null>(null);
  const [billingMessage, setBillingMessage] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (searchParams.get("billing") === "success") {
      setBillingMessage("Subscription activated! Welcome to Pro.");
    } else if (searchParams.get("billing") === "canceled") {
      setBillingMessage("Checkout canceled. You can upgrade anytime.");
    }
  }, [searchParams]);

  const currentPlan = selfPlan?.plan ?? "free";
  const isCreator = selfPlan?.isCreator ?? false;
  const isFoundingUser = selfPlan?.isFoundingUser ?? false;
  const isBypassUser = isCreator || isFoundingUser;
  const isTrialing = !isBypassUser && subscription?.status === "trialing";
  const isActive =
    !isBypassUser && (subscription?.status === "active" || isTrialing);
  const isCanceled = !isBypassUser && subscription?.cancelAtPeriodEnd;

  async function handleUpgrade(priceEnvKey: string) {
    setLoading(priceEnvKey);
    try {
      const result = await createCheckout({ priceId: priceEnvKey });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setBillingMessage("Failed to start checkout. Please try again.");
      toast.error("Failed to start checkout");
    } finally {
      setLoading(null);
    }
  }

  async function handleManageBilling() {
    setLoading("portal");
    try {
      const result = await createPortal();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      console.error("Portal error:", err);
      setBillingMessage("Failed to open billing portal.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1.5 text-base text-muted-foreground">
          Manage your account and subscription.
        </p>
      </div>

      {/* Success / cancel messages */}
      {billingMessage && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-medium">{billingMessage}</p>
        </div>
      )}

      {/* ── Account Info ─────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" /> Account
        </h2>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              {user?.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt=""
                  className="h-12 w-12 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">
              Account managed by Clerk. Use the avatar menu in the top bar to
              update your profile picture, email, or password.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ── Current Plan ─────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5" /> Subscription
        </h2>

        {/* Creator bypass card */}
        {isCreator && (
          <Card className="mb-6 border-primary/40 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">Creator Account</p>
                    <Badge className="bg-primary text-primary-foreground">
                      Full Access
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    You have unrestricted access to all features across every plan tier.
                    Billing does not apply to this account.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Founding member card */}
        {isFoundingUser && (
          <Card className="mb-6 border-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">Founding Member</p>
                    <Badge className="bg-amber-500 text-white border-0">
                      Team · Free for Life
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    You&apos;re one of our first members — thank you for helping shape mivitae.
                    You have full Team plan access, permanently, at no cost.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Regular subscription card */}
        {!isBypassUser && subscription !== undefined && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold capitalize">
                      {currentPlan} Plan
                    </p>
                    {isTrialing && (
                      <Badge variant="secondary">
                        <Sparkles className="mr-1 h-3 w-3" /> Trial
                      </Badge>
                    )}
                    {isActive && !isTrialing && (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Active
                      </Badge>
                    )}
                    {isCanceled && (
                      <Badge variant="destructive">Cancels at period end</Badge>
                    )}
                    {!subscription && (
                      <Badge variant="outline">Free</Badge>
                    )}
                  </div>
                  {subscription?.currentPeriodEnd && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {isCanceled ? "Access until" : "Renews"}{" "}
                      {new Date(
                        subscription.currentPeriodEnd * 1000
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {subscription && (
                  <Button
                    variant="outline"
                    onClick={handleManageBilling}
                    disabled={loading === "portal"}
                  >
                    {loading === "portal" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="mr-2 h-4 w-4" />
                    )}
                    Manage Billing
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Plan Cards ────────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const Icon = plan.icon;

            return (
              <Card
                key={plan.id}
                className={
                  plan.popular
                    ? "border-primary shadow-md"
                    : isCurrent
                      ? "border-primary/50"
                      : ""
                }
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">{plan.name}</h3>
                    </div>
                    {plan.popular && !isBypassUser && (
                      <Badge className="bg-primary text-primary-foreground">
                        Popular
                      </Badge>
                    )}
                    {isCreator && plan.id === "team" && (
                      <Badge className="bg-primary/10 text-primary border-primary/30">
                        Your level
                      </Badge>
                    )}
                    {isFoundingUser && plan.id === "team" && (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-300 dark:border-amber-700">
                        Your plan
                      </Badge>
                    )}
                  </div>

                  <div>
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">
                      {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isBypassUser ? (
                    <Button
                      className="w-full"
                      variant={plan.id === "team" ? "default" : "outline"}
                      disabled
                    >
                      {plan.id === "team" ? "Included" : "Available"}
                    </Button>
                  ) : isCurrent ? (
                    <Button className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : plan.id === "free" ? (
                    <Button className="w-full" variant="outline" disabled>
                      Free Trial
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => {
                        const priceId =
                          plan.id === "pro"
                            ? (process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? "")
                            : (process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID ?? "");
                        if (!priceId) {
                          toast.error("Pricing not configured — please contact support");
                          return;
                        }
                        handleUpgrade(priceId);
                      }}
                      disabled={loading !== null}
                    >
                      {loading === plan.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Upgrade to {plan.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── Data & Privacy ──────────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" /> Data &amp; Privacy
        </h2>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="font-medium">Export Your Data</p>
              <p className="text-sm text-muted-foreground">
                Download a JSON file containing all your profile, portfolio,
                education, and demo data.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={exportData === undefined}
              onClick={() => {
                if (!exportData) return;
                const blob = new Blob(
                  [JSON.stringify(exportData, null, 2)],
                  { type: "application/json" }
                );
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `mivitae-export-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Data exported successfully");
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              {exportData === undefined ? "Loading…" : "Export Data"}
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* ── Danger Zone ─────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-destructive">
          Danger Zone
        </h2>
        <Card className="border-destructive/30">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data. This cannot be
                undone.
              </p>
            </div>
            <Dialog open={deleteOpen} onOpenChange={(open) => { setDeleteOpen(open); if (!open) setDeleteConfirm(""); }}>
              <DialogTrigger
                render={
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action is irreversible. All your portfolios, demos,
                    resumes, and profile data will be permanently deleted.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-4">
                  <p className="text-sm">
                    Type <span className="font-mono font-bold">delete my account</span> to confirm:
                  </p>
                  <Input
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="delete my account"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={deleteConfirm !== "delete my account" || deleting}
                    onClick={async () => {
                      setDeleting(true);
                      try {
                        await deleteAccount();
                        await signOut({ redirectUrl: "/" });
                      } catch (err) {
                        console.error("Delete error:", err);
                        setDeleting(false);
                      }
                    }}
                  >
                    {deleting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete Everything
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
