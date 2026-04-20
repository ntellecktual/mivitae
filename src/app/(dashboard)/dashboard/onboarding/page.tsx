"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  User,
  Upload,
  FileText,
  Briefcase,
  GraduationCap,
  Rocket,
  Check,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

// ── Step metadata ────────────────────────────────────────────────────────────

const STEPS = [
  { id: 0, title: "Profile", icon: User, description: "Tell us about yourself" },
  { id: 1, title: "Upload", icon: Upload, description: "Add your resume" },
  { id: 2, title: "Review", icon: FileText, description: "Check parsed data" },
  { id: 3, title: "Work History", icon: Briefcase, description: "Your career" },
  { id: 4, title: "Education", icon: GraduationCap, description: "Academic background" },
  { id: 5, title: "Publish", icon: Rocket, description: "Go live!" },
];

// ── Main wizard page ─────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const isSuperAdmin = user?.id === "user_3CW4IYOWilTTTrhF3vnAQMZ9tkx";
  const state = useQuery(api.onboarding.getSelf);
  const initializeSelf = useMutation(api.onboarding.initializeSelf);
  const advanceSelf = useMutation(api.onboarding.advanceSelf);

  const [step, setStep] = useState(0);
  const [initialized, setInitialized] = useState(false);

  // Create onboarding state for brand-new users
  useEffect(() => {
    if (state === null && !initialized) {
      setInitialized(true);
      initializeSelf();
    }
  }, [state, initialized, initializeSelf]);

  // Sync step from Convex on first load
  useEffect(() => {
    if (state != null) {
      setStep(state.currentStep ?? 0);
    }
  }, [state]);

  // Redirect once completed — but not for superadmin (they are previewing)
  useEffect(() => {
    if (state?.isComplete && !isSuperAdmin) {
      router.replace("/dashboard");
    }
  }, [state?.isComplete, isSuperAdmin, router]);

  const advance = useCallback(async () => {
    await advanceSelf({ completedStep: step, nextStep: step + 1 });
    setStep((s) => s + 1);
  }, [step, advanceSelf]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  if (state === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Build Your Living Portfolio</h1>
        <p className="mt-1 text-muted-foreground">
          Complete each step to publish your professional portfolio.
        </p>
      </div>

      {/* Stepper */}
      <WizardStepper
        currentStep={step}
        completedSteps={state?.completedSteps ?? []}
        onStepClick={(s) => {
          const completed = state?.completedSteps ?? [];
          if (completed.includes(s) || s <= step) setStep(s);
        }}
      />

      {/* Step content */}
      {step === 0 && <ProfileStep onNext={advance} />}
      {step === 1 && <UploadStep onNext={advance} onBack={goBack} />}
      {step === 2 && <ReviewStep onNext={advance} onBack={goBack} />}
      {step === 3 && <PortfolioStep onNext={advance} onBack={goBack} />}
      {step === 4 && <EducationStep onNext={advance} onBack={goBack} />}
      {step === 5 && <PublishStep onBack={goBack} />}
    </div>
  );
}

// ── Wizard stepper ────────────────────────────────────────────────────────────

function WizardStepper({
  currentStep,
  completedSteps,
  onStepClick,
}: {
  currentStep: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
}) {
  return (
    <div className="flex items-start">
      {STEPS.map((s, idx) => {
        const isCompleted = completedSteps.includes(s.id);
        const isCurrent = currentStep === s.id;
        const isClickable = isCompleted || s.id <= currentStep;

        return (
          <div key={s.id} className="flex flex-1 items-center">
            <button
              onClick={() => isClickable && onStepClick(s.id)}
              disabled={!isClickable}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-opacity",
                isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-40"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCurrent
                      ? "border-primary text-primary"
                      : "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <s.icon className="h-3.5 w-3.5" />
                )}
              </div>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:block",
                  isCurrent
                    ? "text-primary"
                    : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                )}
              >
                {s.title}
              </span>
            </button>

            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 mb-4 h-0.5 flex-1",
                  completedSteps.includes(s.id) ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Shared navigation row ─────────────────────────────────────────────────────

function StepNav({
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  loading = false,
  showBack = true,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  showBack?: boolean;
}) {
  return (
    <div className="flex items-center justify-between pt-4">
      <div>
        {showBack && onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        )}
      </div>
      {onNext && (
        <Button onClick={onNext} disabled={nextDisabled || loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {nextLabel} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// ── Step 0: Profile ───────────────────────────────────────────────────────────

function ProfileStep({ onNext }: { onNext: () => void }) {
  const { user } = useUser();
  const existingProfile = useQuery(api.profiles.getSelf);
  const upsertSelf = useMutation(api.profiles.upsertSelf);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    headline: "",
    bio: "",
    location: "",
    linkedinUrl: "",
    githubUrl: "",
    websiteUrl: "",
  });

  // Pre-fill from Clerk user + existing profile
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        firstName: user.firstName ?? f.firstName,
        lastName: user.lastName ?? f.lastName,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (existingProfile) {
      setForm((f) => ({
        ...f,
        headline: existingProfile.headline ?? "",
        bio: existingProfile.bio ?? "",
        location: existingProfile.location ?? "",
        linkedinUrl: existingProfile.linkedinUrl ?? "",
        githubUrl: existingProfile.githubUrl ?? "",
        websiteUrl: existingProfile.websiteUrl ?? "",
        ...(existingProfile.displayName
          ? {
              firstName: existingProfile.displayName.split(" ")[0] ?? f.firstName,
              lastName: existingProfile.displayName.split(" ").slice(1).join(" ") ?? f.lastName,
            }
          : {}),
      }));
    }
  }, [existingProfile]);

  const handleNext = async () => {
    if (!form.firstName.trim()) {
      setError("First name is required.");
      return;
    }
    if (!form.headline.trim()) {
      setError("Headline is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      // Update name in Clerk
      await user?.update({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || undefined,
      });
      const displayName = [form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(" ");
      await upsertSelf({
        displayName,
        headline: form.headline.trim(),
        bio: form.bio.trim() || undefined,
        location: form.location.trim() || undefined,
        linkedinUrl: form.linkedinUrl.trim() || undefined,
        githubUrl: form.githubUrl.trim() || undefined,
        websiteUrl: form.websiteUrl.trim() || undefined,
      });
      await onNext();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Let&apos;s start with the basics so visitors know who you are.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input id="firstName" placeholder="Jane" {...field("firstName")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" placeholder="Smith" {...field("lastName")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="headline">
            Professional Headline <span className="text-destructive">*</span>
          </Label>
          <Input
            id="headline"
            placeholder='e.g. "Marketing Director @ Unilever" or "Registered Nurse @ Mayo Clinic"'
            {...field("headline")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            rows={4}
            placeholder="Write a 3–5 sentence professional summary..."
            {...field("bio")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="San Francisco, CA" {...field("location")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" placeholder="https://yoursite.com" {...field("websiteUrl")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              placeholder="https://linkedin.com/in/..."
              {...field("linkedinUrl")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="github">GitHub URL</Label>
            <Input
              id="github"
              placeholder="https://github.com/..."
              {...field("githubUrl")}
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <StepNav
          showBack={false}
          onNext={handleNext}
          nextLabel="Save & Continue"
          loading={saving}
        />
      </CardContent>
    </Card>
  );
}

// ── Step 1: Upload Resume ─────────────────────────────────────────────────────

function UploadStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { user } = useUser();
  const convexUser = useQuery(api.users.getByClerkId, { clerkId: user?.id ?? "" });
  const latestResume = useQuery(
    api.resumes.getLatest,
    convexUser ? { userId: convexUser._id } : "skip"
  );
  const generateUploadUrl = useMutation(api.resumes.generateUploadUrl);
  const createResume = useMutation(api.resumes.create);
  const startParse = useMutation(api.resumes.startParse);

  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploadedName, setUploadedName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (latestResume) {
      setUploaded(true);
      setUploadedName(latestResume.fileName);
    }
  }, [latestResume]);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!convexUser) return;
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setError("Only PDF files are currently supported.");
        return;
      }
      setUploading(true);
      setError("");
      try {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!result.ok) throw new Error("Upload failed. Please try again.");
        const { storageId } = await result.json();
        const resumeId = await createResume({ storageId, fileName: file.name });
        await startParse({ resumeId, storageId, fileType: "pdf" });
        setUploaded(true);
        setUploadedName(file.name);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Upload failed.");
      } finally {
        setUploading(false);
      }
    },
    [convexUser, generateUploadUrl, createResume, startParse]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Your Resume</CardTitle>
        <CardDescription>
          Drop your PDF resume and we&apos;ll extract your career story automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {uploaded ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-green-500/30 bg-green-50 p-8 text-center dark:bg-green-950/20">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div>
              <p className="font-semibold text-green-700 dark:text-green-400">{uploadedName}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Resume received — queued for AI processing.
              </p>
            </div>
            <label className="cursor-pointer text-sm text-primary underline underline-offset-2">
              Upload a different file
              <input type="file" accept=".pdf" className="hidden" onChange={handleInput} />
            </label>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={cn(
              "flex flex-col items-center gap-4 rounded-lg border-2 border-dashed p-12 text-center transition-colors",
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/30 hover:border-primary/50"
            )}
          >
            {uploading ? (
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            ) : (
              <Upload className="h-10 w-10 text-muted-foreground" />
            )}
            <div>
              <p className="font-semibold">
                {uploading ? "Uploading…" : "Drag & drop your resume here"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">PDF only · max 10 MB</p>
            </div>
            {!uploading && (
              <label
                className={cn(
                  "inline-flex cursor-pointer items-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                Choose File
                <input type="file" accept=".pdf" className="hidden" onChange={handleInput} />
              </label>
            )}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <StepNav
          onBack={onBack}
          onNext={onNext}
          nextLabel={uploaded ? "Continue" : "Skip for now"}
        />
      </CardContent>
    </Card>
  );
}

// ── Step 2: Review ────────────────────────────────────────────────────────────

function ReviewStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { user } = useUser();
  const convexUser = useQuery(api.users.getByClerkId, { clerkId: user?.id ?? "" });
  const latestResume = useQuery(
    api.resumes.getLatest,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  // Elapsed timer for pending/processing states
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const status = latestResume?.parseStatus;
    if (status !== "pending" && status !== "processing") {
      setElapsed(0);
      return;
    }
    const start = latestResume?.uploadedAt ?? Date.now();
    setElapsed(Math.floor((Date.now() - start) / 1000));
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [latestResume?.parseStatus, latestResume?.uploadedAt]);

  const formatElapsed = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const statusConfig = {
    pending: {
      icon: Clock,
      label: "Queued for processing",
      color: "text-amber-500",
      bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/20",
    },
    processing: {
      icon: Loader2,
      label: "AI is reading your resume…",
      color: "text-blue-500",
      bg: "bg-blue-50 border-blue-200 dark:bg-blue-950/20",
    },
    done: {
      icon: CheckCircle,
      label: "Parsing complete! Your data has been extracted.",
      color: "text-green-600",
      bg: "bg-green-50 border-green-200 dark:bg-green-950/20",
    },
    error: {
      icon: AlertCircle,
      label: "Parsing failed — add details manually in the next steps.",
      color: "text-destructive",
      bg: "bg-destructive/5 border-destructive/20",
    },
  } as const;

  const status = latestResume?.parseStatus;
  const cfg = status ? statusConfig[status] : null;
  const isActive = status === "pending" || status === "processing";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume Processing</CardTitle>
        <CardDescription>
          Our AI will extract your work history and education automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!latestResume ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <FileText className="mx-auto mb-3 h-10 w-10" />
            <p>No resume uploaded. You can add your details manually in the next steps.</p>
          </div>
        ) : cfg ? (
          <div className={cn("flex items-center gap-4 rounded-lg border p-6", cfg.bg)}>
            <cfg.icon
              className={cn(
                "h-8 w-8 shrink-0",
                cfg.color,
                status === "processing" && "animate-spin"
              )}
            />
            <div className="flex-1">
              <p className="font-semibold">{latestResume.fileName}</p>
              <p className={cn("mt-0.5 text-sm", cfg.color)}>{cfg.label}</p>
            </div>
            {isActive && (
              <span className="tabular-nums text-sm font-medium text-muted-foreground">
                {formatElapsed(elapsed)}
              </span>
            )}
          </div>
        ) : null}

        {isActive && (
          <div className="space-y-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full animate-pulse rounded-full bg-primary/60" style={{ width: elapsed < 15 ? `${Math.min((elapsed / 30) * 100, 90)}%` : "90%" }} />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Typically takes 15–30 seconds
            </p>
          </div>
        )}

        <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
          <p>
            <strong>What happens next:</strong> Once processing completes, your work history and
            education entries will be pre-filled. You can still add and edit everything manually
            in the next steps.
          </p>
        </div>

        <StepNav onBack={onBack} onNext={onNext} nextLabel="Continue" />
      </CardContent>
    </Card>
  );
}

// ── Step 3: Work History ──────────────────────────────────────────────────────

function PortfolioStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const ensureDefault = useMutation(api.portfolios.ensureDefault);
  const createSection = useMutation(api.portfolioSections.createSelf);
  const sections = useQuery(api.portfolioSections.getSelfSections);

  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    role: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: "",
    skills: "",
  });

  // Ensure the portfolio record exists before this step can add sections
  useEffect(() => {
    ensureDefault().catch(() => {});
  }, [ensureDefault]);

  const field = (key: keyof typeof form) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const handleAdd = async () => {
    if (!form.companyName.trim() || !form.role.trim() || !form.startDate.trim()) {
      setError("Company, role, and start date are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createSection({
        companyName: form.companyName.trim(),
        role: form.role.trim(),
        startDate: form.startDate.trim(),
        endDate: form.isCurrent ? undefined : form.endDate.trim() || undefined,
        description: form.description.trim() || "Role added during onboarding.",
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        achievements: [],
        order: sections?.length ?? 0,
      });
      setForm({
        companyName: "",
        role: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        description: "",
        skills: "",
      });
      setAdding(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save entry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work History</CardTitle>
        <CardDescription>
          Add your work experience. You can always edit more in the portfolio editor.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing sections */}
        {sections && sections.length > 0 && (
          <div className="space-y-2">
            {sections.map((s) => (
              <div
                key={s._id}
                className="flex items-center gap-3 rounded-lg border bg-card p-4"
              >
                <Briefcase className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{s.role}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {s.companyName} · {s.startDate} – {s.endDate ?? "Present"}
                  </p>
                </div>
                <Badge variant="secondary">Saved</Badge>
              </div>
            ))}
          </div>
        )}

        {/* Add form */}
        {adding ? (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>
                  Company <span className="text-destructive">*</span>
                </Label>
                <Input placeholder="Stripe" {...field("companyName")} />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Role <span className="text-destructive">*</span>
                </Label>
                <Input placeholder="Project Manager" {...field("role")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <Input placeholder="2021-03" {...field("startDate")} />
              </div>
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <Input
                  placeholder="2024-01"
                  disabled={form.isCurrent}
                  {...field("endDate")}
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isCurrent}
                onChange={(e) => setForm((f) => ({ ...f, isCurrent: e.target.checked }))}
                className="h-4 w-4"
              />
              I currently work here
            </label>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                rows={3}
                placeholder="Brief summary of your role and impact…"
                {...field("description")}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Skills (comma-separated)</Label>
              <Input placeholder="React, TypeScript, Node.js" {...field("skills")} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={saving} size="sm">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Entry
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAdding(false);
                  setError("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Plus className="h-4 w-4" /> Add Work Entry
          </button>
        )}

        <StepNav
          onBack={onBack}
          onNext={onNext}
          nextLabel={(sections?.length ?? 0) > 0 ? "Continue" : "Skip for now"}
        />
      </CardContent>
    </Card>
  );
}

// ── Step 4: Education ─────────────────────────────────────────────────────────

function EducationStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const ensureDefault = useMutation(api.portfolios.ensureDefault);
  const createEntry = useMutation(api.educationEntries.createSelf);
  const entries = useQuery(api.educationEntries.getSelfEntries);

  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startYear: "",
    endYear: "",
    inProgress: false,
    honors: "",
  });

  useEffect(() => {
    ensureDefault().catch(() => {});
  }, [ensureDefault]);

  const field = (key: keyof typeof form) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const handleAdd = async () => {
    if (!form.institution.trim() || !form.degree.trim() || !form.startYear.trim()) {
      setError("Institution, degree, and start year are required.");
      return;
    }
    const startYear = parseInt(form.startYear, 10);
    if (isNaN(startYear)) {
      setError("Start year must be a valid number (e.g. 2017).");
      return;
    }
    const endYear =
      !form.inProgress && form.endYear ? parseInt(form.endYear, 10) : undefined;

    setSaving(true);
    setError("");
    try {
      await createEntry({
        institution: form.institution.trim(),
        degree: form.degree.trim(),
        fieldOfStudy: form.fieldOfStudy.trim() || undefined,
        startYear,
        endYear,
        honors: form.honors.trim() || undefined,
        activities: [],
        order: entries?.length ?? 0,
      });
      setForm({
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startYear: "",
        endYear: "",
        inProgress: false,
        honors: "",
      });
      setAdding(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save entry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Education</CardTitle>
        <CardDescription>Add your academic background.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing entries */}
        {entries && entries.length > 0 && (
          <div className="space-y-2">
            {entries.map((e) => (
              <div
                key={e._id}
                className="flex items-center gap-3 rounded-lg border bg-card p-4"
              >
                <GraduationCap className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{e.degree}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {e.institution} · {e.startYear} – {e.endYear ?? "Present"}
                  </p>
                </div>
                <Badge variant="secondary">Saved</Badge>
              </div>
            ))}
          </div>
        )}

        {/* Add form */}
        {adding ? (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>
                  Institution <span className="text-destructive">*</span>
                </Label>
                <Input placeholder="MIT" {...field("institution")} />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Degree <span className="text-destructive">*</span>
                </Label>
                <Input placeholder="B.S. Computer Science" {...field("degree")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Field of Study</Label>
              <Input placeholder="Computer Science" {...field("fieldOfStudy")} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>
                  Start Year <span className="text-destructive">*</span>
                </Label>
                <Input placeholder="2017" {...field("startYear")} />
              </div>
              <div className="space-y-1.5">
                <Label>End Year</Label>
                <Input
                  placeholder="2021"
                  disabled={form.inProgress}
                  {...field("endYear")}
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.inProgress}
                onChange={(e) => setForm((f) => ({ ...f, inProgress: e.target.checked }))}
                className="h-4 w-4"
              />
              Currently enrolled
            </label>

            <div className="space-y-1.5">
              <Label>Honors / Awards</Label>
              <Input placeholder="Summa Cum Laude, Dean's List…" {...field("honors")} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={saving} size="sm">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Entry
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAdding(false);
                  setError("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Plus className="h-4 w-4" /> Add Education
          </button>
        )}

        <StepNav
          onBack={onBack}
          onNext={onNext}
          nextLabel={(entries?.length ?? 0) > 0 ? "Continue" : "Skip for now"}
        />
      </CardContent>
    </Card>
  );
}

// ── Step 5: Publish ───────────────────────────────────────────────────────────

function PublishStep({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const profile = useQuery(api.profiles.getSelf);
  const sections = useQuery(api.portfolioSections.getSelfSections);
  const entries = useQuery(api.educationEntries.getSelfEntries);
  const upsertSelf = useMutation(api.profiles.upsertSelf);
  const completeSelf = useMutation(api.onboarding.completeSelf);

  const [slug, setSlug] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile?.slug) setSlug(profile.slug);
  }, [profile?.slug]);

  const slugCheckResult = useQuery(
    api.profiles.checkSlug,
    slug.length > 2 ? { slug } : "skip"
  );
  const slugAvailable =
    !slugCheckResult || slugCheckResult.available || slug === profile?.slug;

  const handlePublish = async () => {
    if (!slug.trim()) {
      setError("A URL slug is required.");
      return;
    }
    if (!slugAvailable) {
      setError("This slug is taken. Please choose another.");
      return;
    }
    setPublishing(true);
    setError("");
    try {
      await upsertSelf({ slug: slug.trim(), isPublic });
      await completeSelf();
      router.replace("/dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to publish.");
    } finally {
      setPublishing(false);
    }
  };

  const summaryItems = [
    {
      label: "Profile",
      value: profile?.headline ? "Complete" : "Incomplete",
      ok: !!profile?.headline,
    },
    {
      label: "Work Entries",
      value: String(sections?.length ?? 0),
      ok: (sections?.length ?? 0) > 0,
    },
    {
      label: "Education",
      value: String(entries?.length ?? 0),
      ok: (entries?.length ?? 0) > 0,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Go Live! 🚀</CardTitle>
        <CardDescription>
          Review your portfolio summary and publish it to the world.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary grid */}
        <div className="grid grid-cols-3 gap-4 text-center">
          {summaryItems.map(({ label, value, ok }) => (
            <div
              key={label}
              className={cn(
                "rounded-lg border p-4",
                ok
                  ? "border-green-500/30 bg-green-50 dark:bg-green-950/10"
                  : "border-muted bg-muted/30"
              )}
            >
              <p className="text-2xl font-bold">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug">Your Portfolio URL</Label>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-sm text-muted-foreground">mivitae.org/u/</span>
            <Input
              id="slug"
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              }
              placeholder="your-name-1234"
            />
          </div>
          {slug.length > 2 && slugCheckResult !== undefined && (
            <p
              className={cn(
                "text-xs",
                slugAvailable ? "text-green-600" : "text-destructive"
              )}
            >
              {slugAvailable ? "✓ This slug is available" : "✗ This slug is taken"}
            </p>
          )}
        </div>

        {/* Public toggle */}
        <button
          type="button"
          onClick={() => setIsPublic((v) => !v)}
          className="flex w-full cursor-pointer items-center justify-between rounded-lg border p-4 text-left transition-colors hover:bg-muted/30"
        >
          <div>
            <p className="font-medium">Make portfolio public</p>
            <p className="text-sm text-muted-foreground">
              Anyone with the link can view your portfolio
            </p>
          </div>
          <div
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              isPublic ? "bg-primary" : "bg-muted"
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                isPublic ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </div>
        </button>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button
            onClick={handlePublish}
            disabled={publishing || !slugAvailable || slug.length < 3}
            className="min-w-40"
          >
            {publishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing…
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-4 w-4" /> Publish Portfolio
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
