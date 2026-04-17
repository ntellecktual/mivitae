"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { useState, useRef } from "react";
import {
  Users,
  Plus,
  Crown,
  Shield,
  User,
  Trash2,
  ExternalLink,
  Globe,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  Sparkles,
  LayoutGrid,
  Link2,
  Upload,
  MapPin,
  Building2,
  Palette,
  Settings,
  Check,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function TeamPage() {
  const myTeam = useQuery(api.teams.getMyTeam);
  const members = useQuery(
    api.teams.getTeamMembers,
    myTeam ? { teamId: myTeam._id } : "skip"
  );
  const [tab, setTab] = useState<"members" | "settings" | "theme">("members");

  if (myTeam === undefined)
    return (
      <div className="mx-auto max-w-4xl space-y-8 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="h-9 w-48 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-5 w-56 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border bg-muted" />
          ))}
        </div>
      </div>
    );

  if (!myTeam) {
    return <CreateTeamForm />;
  }

  const isOwnerOrAdmin = myTeam.role === "owner" || myTeam.role === "admin";

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {myTeam.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={myTeam.logoUrl}
              alt={myTeam.name}
              className="h-14 w-14 shrink-0 rounded-2xl border object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border bg-primary/10 text-xl font-bold text-primary">
              {myTeam.name[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{myTeam.name}</h1>
            <div className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Globe className="h-3.5 w-3.5" />
              <span className="font-mono">mivitae.io/org/{myTeam.slug}</span>
            </div>
          </div>
        </div>
        <Link
          href={`/org/${myTeam.slug}`}
          target="_blank"
          className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          <ExternalLink className="h-4 w-4" />
          View page
        </Link>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border bg-muted/40 p-1">
        {(
          [
            { id: "members", icon: Users, label: "Members" },
            ...(isOwnerOrAdmin
              ? [
                  { id: "settings", icon: Settings, label: "Settings" },
                  { id: "theme", icon: Palette, label: "Theme Studio" },
                ]
              : []),
          ] as { id: "members" | "settings" | "theme"; icon: React.FC<any>; label: string }[]
        ).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Members */}
      {tab === "members" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Team members</h2>
              <p className="text-sm text-muted-foreground">
                {members?.length ?? 0} of 5 seats filled
              </p>
            </div>
            {isOwnerOrAdmin && (members?.length ?? 0) < 5 && (
              <InviteDialog teamId={myTeam._id} />
            )}
          </div>

          <div className="space-y-3">
            {members?.map((m) => (
              <MemberRow
                key={m.membershipId}
                member={m as any}
                myRole={myTeam.role}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab: Settings */}
      {tab === "settings" && isOwnerOrAdmin && (
        <TeamSettingsForm team={myTeam} />
      )}

      {/* Tab: Theme Studio */}
      {tab === "theme" && isOwnerOrAdmin && (
        <TeamThemeStudio team={myTeam} />
      )}
    </div>
  );
}

// ── Create Team ─────────────────────────────────────────────────────────────

const TEAM_BENEFITS = [
  {
    icon: LayoutGrid,
    title: "Shared org page",
    desc: "One URL — mivitae.io/org/your-team — showing all members' portfolios.",
  },
  {
    icon: Users,
    title: "Up to 5 members",
    desc: "Invite teammates, manage roles, and present your crew in one place.",
  },
  {
    icon: Link2,
    title: "Cross-linked portfolios",
    desc: "Each member links back to the team so visitors can explore everyone.",
  },
  {
    icon: Sparkles,
    title: "Cohesive branding",
    desc: "Team identity applied consistently across all members' pages.",
  },
];

function CreateTeamForm() {
  const planData = useQuery(api.subscriptions.getSelfPlan);
  const createTeam = useMutation(api.teams.createTeam);
  const [form, setForm] = useState({ name: "", slug: "", description: "", website: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Show upgrade gate if not on team plan
  if (planData !== undefined && planData.plan !== "team") {
    return (
      <div className="mx-auto max-w-xl p-6 space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Team plan required</h1>
          <p className="text-muted-foreground">
            Creating a team requires the Team plan. Upgrade to get a shared org page,
            up to 5 members, and cross-linked portfolios.
          </p>
        </div>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" />
          Upgrade to Team
        </Link>
      </div>
    );
  }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createTeam({
        name: form.name.trim(),
        slug: form.slug.trim() || autoSlug(form.name),
        description: form.description || undefined,
        website: form.website || undefined,
      });
      toast.success("Team created!");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
      toast.error("Failed to create team");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Left: Benefits */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create your team</h1>
            <p className="mt-2 text-base text-muted-foreground">
              Bring your crew together under one shared portfolio page.
            </p>
          </div>

          <div className="space-y-5">
            {TEAM_BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-muted-foreground">
            Your team page will live at{" "}
            <span className="font-mono text-foreground">
              mivitae.io/org/{form.slug || "your-team"}
            </span>
          </div>
        </div>

        {/* Right: Form */}
        <div className="rounded-2xl border bg-card p-6 space-y-5">
          <h2 className="text-base font-semibold">Team details</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Team name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({
                    ...f,
                    name: e.target.value,
                    slug: f.slug || autoSlug(e.target.value),
                  }));
                }}
                placeholder="Acme Dev Shop"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Team URL</Label>
              <div className="flex items-center gap-2">
                <span className="shrink-0 font-mono text-sm text-muted-foreground">
                  mivitae.io/org/
                </span>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                    }))
                  }
                  placeholder="acme-devshop"
                  required
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="description">
                Description{" "}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="A short tagline about your team"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">
                Website{" "}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="website"
                type="url"
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                placeholder="https://your-company.com"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Create team
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Member Row ─────────────────────────────────────────────────────────────

const ROLE_CONFIG = {
  owner: {
    icon: Crown,
    label: "Owner",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  admin: {
    icon: Shield,
    label: "Admin",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  member: {
    icon: User,
    label: "Member",
    className: "bg-muted text-muted-foreground",
  },
};

function MemberRow({
  member,
  myRole,
}: {
  member: {
    membershipId: string;
    name: string;
    email?: string;
    slug?: string;
    headline?: string;
    role: "owner" | "admin" | "member";
    status: "active" | "invited";
    avatarUrl?: string;
  };
  myRole: string;
}) {
  const removeMember = useMutation(api.teams.removeMember);
  const { icon: RoleIcon, label: roleLabel, className: roleClass } =
    ROLE_CONFIG[member.role];

  return (
    <div className="card-hover flex items-center justify-between gap-4 rounded-2xl border bg-card px-5 py-4">
      {/* Avatar + info */}
      <div className="flex min-w-0 items-center gap-3">
        {member.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.avatarUrl}
            alt={member.name}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold uppercase">
            {member.name[0]}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{member.name}</p>
          {member.headline && (
            <p className="truncate text-xs text-muted-foreground">{member.headline}</p>
          )}
        </div>
      </div>

      {/* Badges + actions */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Status badge */}
        {member.status === "invited" ? (
          <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            <Clock className="h-3 w-3" />
            Invited
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </span>
        )}

        {/* Role chip */}
        <span
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
            roleClass
          )}
        >
          <RoleIcon className="h-3 w-3" />
          {roleLabel}
        </span>

        {/* View portfolio */}
        {member.slug && (
          <Link
            href={`/u/${member.slug}`}
            target="_blank"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        )}

        {/* Remove (owner only, not self) */}
        {member.role !== "owner" && myRole === "owner" && (
          <button
            aria-label={`Remove ${member.name} from team`}
            onClick={() =>
              removeMember({ membershipId: member.membershipId as any })
                .then(() => toast.success("Member removed"))
                .catch(() => toast.error("Failed to remove member"))
            }
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Invite Dialog ──────────────────────────────────────────────────────────

function InviteDialog({ teamId }: { teamId: any }) {
  const invite = useMutation(api.teams.inviteMember);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await invite({ teamId, email: email.trim(), role });
      setEmail("");
      setOpen(false);
      toast.success("Invitation sent!");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
      toast.error("Failed to invite member");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
      >
        <Plus className="h-4 w-4" />
        Invite member
      </button>
    );
  }

  return (
    <form onSubmit={handleInvite} className="flex flex-wrap items-start gap-2">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="colleague@email.com"
        required
        className="w-52"
        autoFocus
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as any)}
        title="Member role"
        aria-label="Member role"
        className="rounded-md border bg-background px-3 py-2 text-sm"
      >
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </select>
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send invite"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          setOpen(false);
          setError(null);
        }}
      >
        Cancel
      </Button>
      {error && <p className="w-full text-xs text-destructive">{error}</p>}
    </form>
  );
}

// ── Team Settings ──────────────────────────────────────────────────────────

const TEAM_SIZES = ["1–5", "6–15", "16–50", "51–150", "151–500", "500+"];
const INDUSTRIES = [
  "Design", "Engineering", "Marketing", "Product", "Sales",
  "Consulting", "Agency", "Startup", "Education", "Other",
];

function TeamSettingsForm({ team }: { team: any }) {
  const update = useMutation(api.teams.updateTeam);
  const genUploadUrl = useMutation(api.teams.generateTeamUploadUrl);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: team.name ?? "",
    description: team.description ?? "",
    website: team.website ?? "",
    location: team.location ?? "",
    industry: team.industry ?? "",
    teamSize: team.teamSize ?? "",
    twitterUrl: team.twitterUrl ?? "",
    linkedinUrl: team.linkedinUrl ?? "",
    githubUrl: team.githubUrl ?? "",
  });

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo must be under 5 MB");
      return;
    }
    setUploading(true);
    try {
      const uploadUrl = await genUploadUrl({ teamId: team._id });
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { storageId } = await res.json();
      await update({ teamId: team._id, logoStorageId: storageId });
      toast.success("Logo updated");
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await update({
        teamId: team._id,
        name: form.name || undefined,
        description: form.description || undefined,
        website: form.website || undefined,
        location: form.location || undefined,
        industry: form.industry || undefined,
        teamSize: form.teamSize || undefined,
        twitterUrl: form.twitterUrl || undefined,
        linkedinUrl: form.linkedinUrl || undefined,
        githubUrl: form.githubUrl || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast.success("Team settings saved");
    } catch {
      toast.error("Failed to save team settings");
    }
  }

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">Team logo</h2>
          <p className="text-sm text-muted-foreground">PNG, JPG or WebP, max 5 MB.</p>
        </div>
        <div className="flex items-center gap-5">
          <div className="relative">
            {team.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={team.logoUrl}
                alt={team.name}
                className="h-20 w-20 rounded-2xl border object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border bg-muted text-2xl font-bold">
                {team.name[0]}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              aria-label="Upload team logo"
              onChange={handleLogoUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {uploading ? "Uploading…" : "Upload logo"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Recommended: square, at least 256×256px
            </p>
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="rounded-2xl border bg-card p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold">Team profile</h2>
          <p className="text-sm text-muted-foreground">Shown on your public org page.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Team name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                type="url"
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                placeholder="https://"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="A short tagline about your team"
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Location
              </Label>
              <Input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="City, Country"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                Industry
              </Label>
              <select
                value={form.industry}
                onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Industry"
              >
                <option value="">Select…</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                Team size
              </Label>
              <select
                value={form.teamSize}
                onChange={(e) => setForm((f) => ({ ...f, teamSize: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Team size"
              >
                <option value="">Select…</option>
                {TEAM_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium mb-3">Social links</p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-muted-foreground" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.26 5.632 5.904-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <Input
                  value={form.twitterUrl}
                  onChange={(e) => setForm((f) => ({ ...f, twitterUrl: e.target.value }))}
                  placeholder="https://x.com/yourteam"
                />
              </div>
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-muted-foreground" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                <Input
                  value={form.linkedinUrl}
                  onChange={(e) => setForm((f) => ({ ...f, linkedinUrl: e.target.value }))}
                  placeholder="https://linkedin.com/company/yourteam"
                />
              </div>
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-muted-foreground" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                <Input
                  value={form.githubUrl}
                  onChange={(e) => setForm((f) => ({ ...f, githubUrl: e.target.value }))}
                  placeholder="https://github.com/yourteam"
                />
              </div>
            </div>
          </div>

          <Button type="submit" size="sm" className="gap-2">
            {saved ? <Check className="h-4 w-4" /> : null}
            {saved ? "Saved!" : "Save changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ── Team Theme Studio ───────────────────────────────────────────────────────

const ACCENT_COLORS = [
  { label: "Emerald",  value: "#10b981" },
  { label: "Lime",     value: "#84cc16" },
  { label: "Blue",     value: "#3b82f6" },
  { label: "Indigo",   value: "#6366f1" },
  { label: "Cyan",     value: "#06b6d4" },
  { label: "Violet",   value: "#8b5cf6" },
  { label: "Fuchsia",  value: "#d946ef" },
  { label: "Rose",     value: "#f43f5e" },
  { label: "Pink",     value: "#ec4899" },
  { label: "Amber",    value: "#f59e0b" },
  { label: "Orange",   value: "#f97316" },
  { label: "Slate",    value: "#64748b" },
  { label: "Onyx",     value: "#0f172a" },
  { label: "Pearl",    value: "#f1f5f9" },
];

const BG_STYLES = [
  { label: "Dark",   value: "dark",   preview: "bg-zinc-900" },
  { label: "Deep",   value: "deep",   preview: "bg-[#0a0f1a]" },
  { label: "Light",  value: "light",  preview: "bg-zinc-50 border" },
  { label: "Warm",   value: "warm",   preview: "bg-[#1a1208]" },
  { label: "Slate",  value: "slate",  preview: "bg-[#1e293b]" },
  { label: "Aurora", value: "aurora", preview: "bg-gradient-to-br from-[#0d1117] via-[#1a0a2e] to-[#0a1628]" },
];

const CARD_STYLES = [
  { label: "Bordered", value: "bordered", desc: "Clean outline cards" },
  { label: "Filled",   value: "filled",   desc: "Solid background cards" },
  { label: "Ghost",    value: "ghost",    desc: "Minimal, no border" },
];

const HOVER_STYLES = [
  { label: "Lift", value: "lift", desc: "Scales up gently on hover" },
  { label: "Glow", value: "glow", desc: "Accent-colored glow on hover" },
  { label: "None", value: "none", desc: "No animation" },
];

const LAYOUT_STYLES = [
  { label: "Centered", value: "centered" },
  { label: "Left",     value: "left" },
];

const COLUMN_OPTIONS = [
  { label: "Auto",  value: "auto", desc: "2 → 3 responsive" },
  { label: "2 col", value: "2",   desc: "Two columns" },
  { label: "3 col", value: "3",   desc: "Three at mid-screen" },
];

const PRESETS: Array<{ label: string; emoji: string; t: TeamTheme }> = [
  { label: "Forest",   emoji: "🌿", t: { accent: "#10b981", bg: "dark",   card: "filled",   hover: "lift", layout: "centered", tagline: "", columns: "auto" } },
  { label: "Midnight", emoji: "🌙", t: { accent: "#3b82f6", bg: "deep",   card: "bordered", hover: "glow", layout: "centered", tagline: "", columns: "auto" } },
  { label: "Aurora",   emoji: "🎨", t: { accent: "#06b6d4", bg: "aurora", card: "ghost",    hover: "glow", layout: "left",     tagline: "", columns: "3"    } },
  { label: "Crimson",  emoji: "🔴", t: { accent: "#f43f5e", bg: "dark",   card: "bordered", hover: "glow", layout: "centered", tagline: "", columns: "auto" } },
  { label: "Golden",   emoji: "✨", t: { accent: "#f59e0b", bg: "warm",   card: "filled",   hover: "lift", layout: "centered", tagline: "", columns: "auto" } },
  { label: "Studio",   emoji: "⚫", t: { accent: "#8b5cf6", bg: "deep",   card: "ghost",    hover: "none", layout: "left",     tagline: "", columns: "3"    } },
  { label: "Minimal",  emoji: "⬜", t: { accent: "#0f172a", bg: "light",  card: "bordered", hover: "lift", layout: "centered", tagline: "", columns: "3"    } },
];

type TeamTheme = {
  accent: string;
  bg: string;
  card: string;
  hover: string;
  layout: string;
  tagline: string;
  columns: string;
};

const DEFAULT_THEME: TeamTheme = {
  accent: "#10b981",
  bg: "dark",
  card: "bordered",
  hover: "lift",
  layout: "centered",
  tagline: "",
  columns: "auto",
};

// ── Live Preview ───────────────────────────────────────────────────────────────

const PREVIEW_BG: Record<string, { color: string; isDark: boolean; gradient?: string }> = {
  dark:   { color: "#18181b", isDark: true },
  light:  { color: "#fafafa", isDark: false },
  deep:   { color: "#0a0f1a", isDark: true },
  warm:   { color: "#1a1208", isDark: true },
  slate:  { color: "#1e293b", isDark: true },
  aurora: { color: "#0d1117", isDark: true, gradient: "linear-gradient(135deg, #0d1117 0%, #1a0a2e 40%, #0a1628 100%)" },
};

function ThemePreview({ theme, teamName }: { theme: TeamTheme; teamName?: string }) {
  const bg        = PREVIEW_BG[theme.bg] ?? PREVIEW_BG.dark;
  const textBase  = bg.isDark ? "#f4f4f5" : "#18181b";
  const textMuted = bg.isDark ? "#a1a1aa" : "#71717a";
  const border    = bg.isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const cardBg    =
    theme.card === "filled"  ? bg.isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)"
    : theme.card === "ghost" ? "transparent"
    : bg.isDark ? "rgba(255,255,255,0.03)" : "#fff";
  const cardBorder = theme.card === "ghost" ? "1px solid transparent" : `1px solid ${border}`;
  const isLeft = theme.layout === "left";
  const cols   = theme.columns === "2" ? 2 : 3;

  const mocks = [
    { initial: "A", name: "Alex Chen",  headline: "Full-stack eng" },
    { initial: "M", name: "Mia Park",   headline: "Product design" },
    { initial: "S", name: "Sam Torres", headline: "Growth & brand" },
  ];

  return (
    <div
      className="select-none overflow-hidden rounded-xl border pointer-events-none"
      style={{ background: bg.gradient ?? bg.color, color: textBase }}
    >
      {/* Nav */}
      <div style={{ borderBottom: `1px solid ${border}`, padding: "6px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 9, fontWeight: 700 }}>
          mi<span style={{ color: theme.accent }}>vitae</span>
        </span>
        <span style={{ fontSize: 7, padding: "2px 8px", borderRadius: 5, background: theme.accent, color: "#fff", fontWeight: 600 }}>
          Get started
        </span>
      </div>

      {/* Hero */}
      <div style={{ padding: "14px 14px 10px", textAlign: isLeft ? "left" : "center", display: "flex", flexDirection: "column", alignItems: isLeft ? "flex-start" : "center" }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: `${theme.accent}22`, color: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
          {(teamName ?? "T")[0].toUpperCase()}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: textBase }}>{teamName ?? "Your Team"}</div>
        {theme.tagline && (
          <div style={{ fontSize: 7, color: theme.accent, marginTop: 2, fontStyle: "italic" }}>
            {theme.tagline.length > 36 ? theme.tagline.slice(0, 36) + "…" : theme.tagline}
          </div>
        )}
        <div style={{ fontSize: 7, color: textMuted, marginTop: 3 }}>3 members</div>
      </div>

      {/* Cards */}
      <div style={{ padding: "0 10px 12px", display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 5 }}>
        {mocks.slice(0, cols).map((m) => (
          <div
            key={m.name}
            style={{ background: cardBg, border: cardBorder, borderRadius: 8, padding: "7px 7px 6px" }}
          >
            <div style={{ width: 16, height: 16, borderRadius: 4, background: `${theme.accent}22`, color: theme.accent, fontSize: 7, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
              {m.initial}
            </div>
            <div style={{ fontSize: 7, fontWeight: 600, color: textBase, marginBottom: 1 }}>{m.name.split(" ")[0]}</div>
            <div style={{ fontSize: 6, color: textMuted, lineHeight: 1.4 }}>{m.headline}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Team Theme Studio ─────────────────────────────────────────────────────────

function TeamThemeStudio({ team }: { team: any }) {
  const update = useMutation(api.teams.updateTeam);
  const [theme, setTheme] = useState<TeamTheme>(() => {
    if (team.themeSettings) {
      try { return { ...DEFAULT_THEME, ...JSON.parse(team.themeSettings) }; }
      catch { return DEFAULT_THEME; }
    }
    return DEFAULT_THEME;
  });
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof TeamTheme>(key: K, val: TeamTheme[K]) {
    setTheme((t) => ({ ...t, [key]: val }));
    setIsDirty(true);
  }

  function applyPreset(t: TeamTheme) {
    setTheme({ ...DEFAULT_THEME, ...t });
    setIsDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await update({ teamId: team._id, themeSettings: JSON.stringify(theme) });
      setIsDirty(false);
      toast.success("Team theme saved");
    } catch {
      toast.error("Failed to save theme");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Team Theme Studio</h2>
          <p className="text-sm text-muted-foreground">Customize your public org page.</p>
        </div>
        <Button size="sm" disabled={!isDirty || saving} onClick={handleSave} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>

      {/* Two-column layout: controls + sticky preview */}
      <div className="grid gap-5 lg:grid-cols-[1fr_210px]">
        <div className="space-y-5">

          {/* Presets */}
          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <div>
              <p className="text-sm font-semibold">Quick presets</p>
              <p className="text-xs text-muted-foreground mt-0.5">Apply a curated full theme in one click.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.t)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors",
                    theme.accent === p.t.accent && theme.bg === p.t.bg && theme.card === p.t.card
                      ? "border-primary bg-primary/5 text-primary"
                      : "hover:bg-muted/60"
                  )}
                >
                  <span>{p.emoji}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accent color */}
          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <p className="text-sm font-semibold">Accent color</p>
            <div className="flex flex-wrap gap-2">
              {ACCENT_COLORS.map(({ label, value }) => (
                <button
                  key={value}
                  title={label}
                  onClick={() => set("accent", value)}
                  className={cn(
                    "relative h-8 w-8 rounded-xl border-2 transition-all hover:scale-110",
                    theme.accent === value ? "border-foreground scale-110 shadow-md" : "border-transparent"
                  )}
                  style={{ backgroundColor: value }}
                >
                  {theme.accent === value && (
                    <Check className="absolute inset-0 m-auto h-3.5 w-3.5 drop-shadow" style={{ color: "#fff" }} />
                  )}
                </button>
              ))}
              {/* Custom hex */}
              <div className="flex h-8 items-center rounded-xl border bg-muted/40 px-2.5 gap-1.5">
                <span className="h-3.5 w-3.5 shrink-0 rounded-full border" style={{ backgroundColor: theme.accent }} />
                <span className="text-xs text-muted-foreground">#</span>
                <input
                  type="text"
                  value={theme.accent.replace(/^#/, "")}
                  aria-label="Custom accent hex"
                  onChange={(e) => {
                    const v = `#${e.target.value}`;
                    if (/^#[0-9a-fA-F]{0,6}$/.test(v)) set("accent", v);
                  }}
                  className="w-14 bg-transparent text-xs font-mono outline-none"
                  maxLength={6}
                />
              </div>
            </div>
          </div>

          {/* Background */}
          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <p className="text-sm font-semibold">Background</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {BG_STYLES.map(({ label, value, preview }) => (
                <button
                  key={value}
                  onClick={() => set("bg", value)}
                  className={cn(
                    "flex flex-col gap-1.5 rounded-xl border-2 p-2 text-left transition-all",
                    theme.bg === value
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:border-border"
                  )}
                >
                  <div className={cn("h-7 w-full rounded-lg", preview)} />
                  <span className="text-[10px] font-medium leading-none">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Member cards */}
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <p className="text-sm font-semibold">Member cards</p>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Card style</p>
              <div className="space-y-1.5">
                {CARD_STYLES.map(({ label, value, desc }) => (
                  <button
                    key={value}
                    onClick={() => set("card", value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-colors",
                      theme.card === value ? "border-primary/40 bg-primary/5" : "hover:bg-muted/40"
                    )}
                  >
                    <div>
                      <p className={cn("text-xs font-medium", theme.card === value && "text-primary")}>{label}</p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </div>
                    {theme.card === value && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs text-muted-foreground mb-2">Hover effect</p>
              <div className="space-y-1.5">
                {HOVER_STYLES.map(({ label, value, desc }) => (
                  <button
                    key={value}
                    onClick={() => set("hover", value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-colors",
                      theme.hover === value ? "border-primary/40 bg-primary/5" : "hover:bg-muted/40"
                    )}
                  >
                    <div>
                      <p className={cn("text-xs font-medium", theme.hover === value && "text-primary")}>{label}</p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </div>
                    {theme.hover === value && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Layout */}
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <p className="text-sm font-semibold">Layout</p>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Hero alignment</p>
              <div className="flex gap-2">
                {LAYOUT_STYLES.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => set("layout", value)}
                    className={cn(
                      "flex flex-1 flex-col gap-2 rounded-xl border-2 p-3 transition-all",
                      theme.layout === value
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:border-border"
                    )}
                  >
                    <div className={cn("flex flex-col gap-0.5 rounded bg-muted/60 px-1.5 py-1.5", value === "centered" ? "items-center" : "items-start")}>
                      <div className="h-1 w-5 rounded bg-muted-foreground/40" />
                      <div className="h-1 w-7 rounded bg-muted-foreground/60" />
                      <div className="h-1 w-4 rounded bg-muted-foreground/30" />
                    </div>
                    <span className={cn("text-[10px] font-medium", theme.layout === value ? "text-primary" : "text-muted-foreground")}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs text-muted-foreground mb-2">Member grid columns</p>
              <div className="flex gap-2">
                {COLUMN_OPTIONS.map(({ label, value, desc }) => (
                  <button
                    key={value}
                    onClick={() => set("columns", value)}
                    className={cn(
                      "flex flex-1 flex-col gap-1 rounded-xl border-2 p-2.5 text-left transition-all",
                      theme.columns === value
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:border-border"
                    )}
                  >
                    <span className={cn("text-xs font-medium", theme.columns === value ? "text-primary" : "")}>{label}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">{desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <div>
              <p className="text-sm font-semibold">Custom tagline</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Shown beneath your team name in your accent color.
              </p>
            </div>
            <input
              type="text"
              value={theme.tagline}
              maxLength={80}
              placeholder="e.g. Building the future of design tools"
              onChange={(e) => set("tagline", e.target.value)}
              className="w-full rounded-xl border bg-muted/40 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground/50"
            />
            <p className="text-right text-[10px] text-muted-foreground">{theme.tagline.length}/80</p>
          </div>

          {isDirty && (
            <p className="text-center text-xs text-amber-500">You have unsaved changes</p>
          )}
        </div>

        {/* Sticky live preview */}
        <div className="lg:sticky lg:top-6 h-fit space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Live preview</p>
          <ThemePreview theme={theme} teamName={team.name} />
          <p className="text-[10px] text-center text-muted-foreground">Updates as you edit</p>
        </div>
      </div>
    </div>
  );
}
