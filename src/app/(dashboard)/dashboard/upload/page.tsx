"use client";

import { useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  FileText,
  CheckCircle,
  Loader2,
  Briefcase,
  GraduationCap,
  Wrench,
  Mail,
  Lightbulb,
  Clock,
  AlertCircle,
  FileText as LinkedinIcon,
  ClipboardPaste,
} from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  { number: 1, label: "Upload", description: "Drop your PDF" },
  { number: 2, label: "Parse", description: "AI reads your resume" },
  { number: 3, label: "Review", description: "Edit & publish" },
];

const EXTRACTS = [
  { icon: Briefcase, label: "Work experience", detail: "roles, companies, dates, achievements" },
  { icon: GraduationCap, label: "Education", detail: "degrees, institutions, years" },
  { icon: Wrench, label: "Skills", detail: "technical & soft skills" },
  { icon: Mail, label: "Contact info", detail: "email, LinkedIn, GitHub, website" },
];

const TIPS = [
  "Use a single-column, text-based PDF — not an image or scan",
  "Avoid tables and multi-column layouts; they confuse most parsers",
  "Keep formatting simple: bold headings, bullet achievements",
  "Remove headers/footers with repeated text to reduce noise",
  "File size under 10 MB",
];

export default function UploadPage() {
  const { user } = useUser();
  const convexUser = useQuery(api.users.getByClerkId, {
    clerkId: user?.id ?? "",
  });
  const generateUploadUrl = useMutation(api.resumes.generateUploadUrl);
  const createResume = useMutation(api.resumes.create);
  const startParse = useMutation(api.resumes.startParse);
  const startTextParse = useMutation(api.resumes.startTextParse);
  const latestResume = useQuery(
    api.resumes.getLatest,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasting, setPasting] = useState(false);

  const handleUpload = useCallback(
    async (file: File) => {
      const name = file.name.toLowerCase();
      const isValid = name.endsWith(".pdf") || name.endsWith(".docx");
      if (!convexUser || !isValid) {
        toast.error("Please upload a PDF or Word (.docx) file");
        return;
      }

      const fileType = name.endsWith(".docx") ? "docx" : "pdf";

      setUploading(true);
      try {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();
        const resumeId = await createResume({
          storageId,
          fileName: file.name,
        });
        await startParse({ resumeId, storageId, fileType });
        setUploaded(true);
        toast.success("Resume uploaded — parsing in progress");
      } catch {
        toast.error("Upload failed — please try again");
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

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Resume</h1>
        <p className="mt-1.5 text-base text-muted-foreground">
          Drop your resume (PDF or Word) or paste LinkedIn text, and our AI will parse your career story.
        </p>
      </div>

      {/* Step flow */}
      <div className="flex items-center gap-0">
        {STEPS.map((step, i) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className={`flex flex-1 flex-col items-center text-center px-2 py-4 rounded-xl border transition-colors ${
              uploaded && step.number <= 2
                ? "bg-primary/5 border-primary/20"
                : step.number === 1 && !uploaded
                  ? "bg-primary/5 border-primary/20"
                  : "border-border bg-card"
            }`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold mb-1.5 ${
                uploaded && step.number <= 2
                  ? "bg-primary text-primary-foreground"
                  : step.number === 1 && !uploaded
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              }`}>
                {uploaded && step.number <= 2 ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>
              <p className="text-sm font-semibold">{step.label}</p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-4 shrink-0 h-px bg-border mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <Card
        data-tour="upload-dropzone"
        className={`transition-all ${
          dragActive
            ? "border-primary bg-primary/5"
            : uploaded
              ? "border-green-500/50 bg-green-50 dark:bg-green-950/20"
              : "border-dashed"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          {uploaded ? (
            <>
              <CheckCircle className="mb-4 h-12 w-12 text-green-500" />
              <h3 className="text-lg font-semibold">Resume uploaded!</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your resume is being processed. Check your{" "}
                <a href="/dashboard/portfolio" className="text-primary hover:underline">Work History</a>{" "}
                and{" "}
                <a href="/dashboard/education" className="text-primary hover:underline">Education</a>{" "}
                pages in a moment.
              </p>
            </>
          ) : uploading ? (
            <>
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
              <h3 className="text-lg font-semibold">Uploading…</h3>
              <p className="mt-1 text-sm text-muted-foreground">Hang tight, this takes a few seconds</p>
            </>
          ) : (
            <>
              {dragActive ? (
                <FileText className="mb-4 h-12 w-12 text-primary animate-bounce" />
              ) : (
                <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
              )}
              <h3 className="text-lg font-semibold">
                {dragActive ? "Drop to upload" : "Drag & drop your resume"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">PDF or Word (.docx) · up to 10 MB</p>
              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                <Upload className="h-4 w-4" />
                Browse Files
                <input
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </label>
            </>
          )}
        </CardContent>
      </Card>

      {/* LinkedIn / paste text */}
      <Card data-tour="upload-linkedin">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <LinkedinIcon className="h-5 w-5 text-[#0A66C2]" />
            <h2 className="text-base font-semibold">Paste from LinkedIn or text</h2>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">
            Copy your LinkedIn profile page text (or any resume text) and paste below.
          </p>
          <Textarea
            placeholder="Paste your LinkedIn profile text, resume text, or career summary here…"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={6}
            className="mb-3"
          />
          <div className="flex items-center gap-2">
            <Button
              disabled={pasting || pasteText.trim().length < 50}
              onClick={async () => {
                setPasting(true);
                try {
                  await startTextParse({ text: pasteText, source: "LinkedIn" });
                  setUploaded(true);
                  setPasteText("");
                  toast.success("Text submitted — AI is parsing your career data");
                } catch (err) {
                  toast.error(
                    err instanceof Error ? err.message : "Failed to parse text"
                  );
                } finally {
                  setPasting(false);
                }
              }}
            >
              {pasting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ClipboardPaste className="mr-2 h-4 w-4" />
              )}
              Parse Text
            </Button>
            <span className="text-xs text-muted-foreground">
              {pasteText.length < 50
                ? `${50 - pasteText.length} more characters needed`
                : `${pasteText.length.toLocaleString()} characters`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Info row: What AI extracts + Tips */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* What AI extracts */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">What we extract</h2>
            <div className="space-y-3">
              {EXTRACTS.map(({ icon: Icon, label, detail }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tips for best results</h2>
            <div className="space-y-2.5">
              {TIPS.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Lightbulb className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                  <p className="text-sm text-muted-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Previous upload history */}
      {latestResume && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Previous upload</h2>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{latestResume.fileName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    {new Date(latestResume.uploadedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <ParseStatusPill status={latestResume.parseStatus} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function ParseStatusPill({ status }: { status: string }) {
  if (status === "done") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle className="h-3 w-3" /> Parsed
      </span>
    );
  }
  if (status === "processing") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        <Loader2 className="h-3 w-3 animate-spin" /> Processing
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
        <AlertCircle className="h-3 w-3" /> Error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
      <Clock className="h-3 w-3" /> Pending
    </span>
  );
}



