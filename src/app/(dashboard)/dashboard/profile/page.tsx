"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/lib/convex";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Globe,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Camera,
  MapPin,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import type { Id } from "../../../../../convex/_generated/dataModel";

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const profile = useQuery(api.profiles.getSelf);
  const upsertProfile = useMutation(api.profiles.upsertSelf);
  const generateAvatarUploadUrl = useMutation(api.profiles.generateAvatarUploadUrl);
  const updateAvatar = useMutation(api.profiles.updateAvatar);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    headline: "",
    bio: "",
    location: "",
    websiteUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    slug: "",
    isPublic: false,
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [slugInput, setSlugInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [dirty, setDirty] = useState(false);

  const slugCheck = useQuery(
    api.profiles.checkSlug,
    slugInput && slugInput !== profile?.slug ? { slug: slugInput } : "skip"
  );

  useEffect(() => {
    if (profile) {
      setForm({
        headline: profile.headline ?? "",
        bio: profile.bio ?? "",
        location: profile.location ?? "",
        websiteUrl: profile.websiteUrl ?? "",
        linkedinUrl: profile.linkedinUrl ?? "",
        githubUrl: profile.githubUrl ?? "",
        slug: profile.slug ?? "",
        isPublic: profile.isPublic ?? false,
      });
      setSlugInput(profile.slug ?? "");
      setAvatarUrl(profile.avatarUrl ?? null);
    }
  }, [profile]);

  const updateField = (field: string, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
    setDirty(true);
    if (field === "slug") {
      setSlugInput(
        String(value)
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "-")
          .replace(/-+/g, "-")
      );
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }
    setAvatarUploading(true);
    try {
      const postUrl = await generateAvatarUploadUrl();
      const res = await fetch(postUrl, {
        method: "POST",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!res.ok) throw new Error("Upload failed");
      const { storageId } = await res.json() as { storageId: Id<"_storage"> };
      const url = await updateAvatar({ storageId });
      setAvatarUrl(url ?? null);
      toast.success("Avatar updated");
    } catch {
      toast.error("Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertProfile({
        slug: slugInput || undefined,
        headline: form.headline || undefined,
        bio: form.bio || undefined,
        location: form.location || undefined,
        websiteUrl: form.websiteUrl || undefined,
        linkedinUrl: form.linkedinUrl || undefined,
        githubUrl: form.githubUrl || undefined,
        isPublic: form.isPublic,
      });
      setDirty(false);
      toast.success("Profile saved");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="mt-1.5 text-base text-muted-foreground">
            Complete onboarding first to create your profile.
          </p>
        </div>
        <EmptyState
          icon={User}
          title="No profile yet"
          description="Upload a resume or complete onboarding to get started."
        />
      </div>
    );
  }

  const slugOwnedByMe = slugInput === profile.slug;
  const slugAvailable = slugOwnedByMe || slugCheck?.available;
  const displayName = clerkUser?.fullName ?? clerkUser?.username ?? "Your Name";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="mt-1.5 text-base text-muted-foreground">
            Manage your public profile and vanity URL.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {profile.isPublic && (
            <a
              href={`/u/${profile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View Public Page
            </a>
          )}
          <button
            disabled={saving || (!dirty && slugInput === profile.slug)}
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>

      {/* Two-column layout: form + preview */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* ── Unified form card ───────────────────────────────────── */}
        <Card>
          <CardContent className="p-6 space-y-0 divide-y divide-border">

            {/* Section: Profile URL & Visibility */}
            <div className="pb-6 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Profile URL &amp; Visibility
              </h3>
              <div className="space-y-2">
                <Label>Portfolio URL</Label>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    mivitae.org/u/
                  </span>
                  <Input
                    value={slugInput}
                    onChange={(e) => {
                      const clean = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-")
                        .replace(/-+/g, "-");
                      setSlugInput(clean);
                      setDirty(true);
                    }}
                    placeholder="your-name"
                    className="max-w-xs"
                  />
                  {slugInput && (
                    <span className="flex items-center gap-1 text-sm">
                      {slugAvailable ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">Available</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-red-600">Taken</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="relative h-6 w-11 flex-shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublic}
                    onChange={() => updateField("isPublic", !form.isPublic)}
                    className="sr-only"
                    aria-label="Toggle public visibility"
                  />
                  <span
                    className={`absolute inset-0 rounded-full transition-colors ${
                      form.isPublic ? "bg-primary" : "bg-muted"
                    }`}
                  />
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      form.isPublic ? "translate-x-5" : ""
                    }`}
                  />
                </label>
                <div className="min-w-0">
                  <p className="text-sm font-medium">Public Portfolio</p>
                  <p className="text-xs text-muted-foreground">
                    {form.isPublic
                      ? "Visible to anyone with the link."
                      : "Private — only you can see it."}
                  </p>
                </div>
                <Badge variant={form.isPublic ? "default" : "secondary"} className="shrink-0">
                  {form.isPublic ? "Public" : "Private"}
                </Badge>
              </div>
            </div>

            {/* Section: Avatar */}
            <div className="py-6 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Photo
              </h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-border bg-muted flex items-center justify-center">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile photo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-semibold text-muted-foreground">
                        {initials}
                      </span>
                    )}
                  </div>
                  {avatarUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    {avatarUrl ? "Change Photo" : "Upload Photo"}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or WebP · max 5 MB
                  </p>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  aria-label="Upload profile photo"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>

            {/* Section: About */}
            <div className="py-6 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                About You
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Headline</Label>
                  <Input
                    value={form.headline}
                    onChange={(e) => updateField("headline", e.target.value)}
                    placeholder="Full-Stack Engineer · AI Enthusiast"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={form.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    placeholder="A brief description about yourself…"
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={form.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>
            </div>

            {/* Section: Links */}
            <div className="pt-6 space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                <Globe className="h-4 w-4" /> Links
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Website</Label>
                  <Input
                    value={form.websiteUrl}
                    onChange={(e) => updateField("websiteUrl", e.target.value)}
                    placeholder="https://yoursite.com"
                  />
                </div>
                <div>
                  <Label>LinkedIn</Label>
                  <Input
                    value={form.linkedinUrl}
                    onChange={(e) =>
                      updateField("linkedinUrl", e.target.value)
                    }
                    placeholder="https://linkedin.com/in/you"
                  />
                </div>
                <div>
                  <Label>GitHub</Label>
                  <Input
                    value={form.githubUrl}
                    onChange={(e) => updateField("githubUrl", e.target.value)}
                    placeholder="https://github.com/you"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Live preview card ────────────────────────────────────── */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Preview
          </p>
          <Card className="overflow-hidden">
            {/* Theme color bar */}
            <div className="h-2 w-full bg-primary" />
            <CardContent className="p-5 space-y-4">
              {/* Avatar + name */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-border bg-muted flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-muted-foreground">
                      {initials}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm">{displayName}</p>
                  {form.headline && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {form.headline}
                    </p>
                  )}
                </div>
              </div>

              {form.bio && (
                <p className="text-xs text-muted-foreground line-clamp-3 text-center">
                  {form.bio}
                </p>
              )}

              {form.location && (
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {form.location}
                </div>
              )}

              {(form.websiteUrl || form.linkedinUrl || form.githubUrl) && (
                <div className="flex items-center justify-center gap-3">
                  {form.websiteUrl && (
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  )}
                  {form.linkedinUrl && (
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                  {form.githubUrl && (
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>mivitae.org/u/{slugInput || "your-name"}</span>
                <Badge
                  variant={form.isPublic ? "default" : "secondary"}
                  className="text-[10px]"
                >
                  {form.isPublic ? "Public" : "Private"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}