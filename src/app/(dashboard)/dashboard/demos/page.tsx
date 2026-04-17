"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/lib/convex";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { resolveTheme, buildDemoIframeCss } from "@/lib/theme";
import {
  Zap,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  X,
  Code2,
  Upload,
  Play,
  LayoutGrid,
  Loader2,
  Globe,
  Tag,
  Image as ImageIcon,
  Monitor,
  Sparkles,
  Briefcase,
  ChevronDown,
  ArrowRight,
  MessageSquare,
  Wand2,
  Check,
} from "lucide-react";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.694.825.577C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  backend: "Backend / API",
  frontend: "Frontend",
  ml: "Machine Learning",
  data: "Data Engineering",
  devops: "DevOps",
  general: "General",
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  backend: { bg: "rgba(139,92,246,.1)", text: "#8b5cf6", border: "rgba(139,92,246,.2)" },
  frontend: { bg: "rgba(59,130,246,.1)", text: "#3b82f6", border: "rgba(59,130,246,.2)" },
  ml: { bg: "rgba(249,115,22,.1)", text: "#f97316", border: "rgba(249,115,22,.2)" },
  data: { bg: "rgba(245,158,11,.1)", text: "#f59e0b", border: "rgba(245,158,11,.2)" },
  devops: { bg: "rgba(16,185,129,.1)", text: "#10b981", border: "rgba(16,185,129,.2)" },
  general: { bg: "rgba(107,114,128,.1)", text: "#6b7280", border: "rgba(107,114,128,.2)" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  live: { label: "Live", color: "#10b981", bg: "rgba(16,185,129,.1)" },
  wip: { label: "In Progress", color: "#f59e0b", bg: "rgba(245,158,11,.1)" },
  archived: { label: "Archived", color: "#6b7280", bg: "rgba(107,114,128,.1)" },
};

const SUGGESTED_TAGS = [
  "React", "TypeScript", "Python", "Node.js", "API", "Chart.js",
  "Real-time", "Dashboard", "Machine Learning", "Data Pipeline",
  "CI/CD", "Docker", "AWS", "Azure", "GraphQL", "REST",
  "WebSocket", "PostgreSQL", "MongoDB", "Redis",
];

// ── Types ────────────────────────────────────────────────────────────────

interface DemoFormData {
  title: string;
  description: string;
  content: string;
  htmlContent: string;
  status: string;
  tags: string[];
  demoUrl: string;
  githubUrl: string;
  bannerStorageId?: Id<"_storage">;
}

const emptyForm: DemoFormData = {
  title: "",
  description: "",
  content: "",
  htmlContent: "",
  status: "live",
  tags: [],
  demoUrl: "",
  githubUrl: "",
};

// ── Sandboxed Preview ────────────────────────────────────────────────────

function DemoPreview({ html, themeCss }: { html: string; themeCss: string }) {
  if (!html.trim()) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
        <div className="text-center text-sm text-muted-foreground">
          <Monitor className="mx-auto mb-2 h-8 w-8 opacity-40" />
          <p>Paste HTML/CSS/JS to see a live preview</p>
        </div>
      </div>
    );
  }

  const wrappedHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${themeCss}</style>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4"><\/script>
</head>
<body>${html}</body>
</html>`;

  return (
    <iframe
      srcDoc={wrappedHtml}
      sandbox="allow-scripts"
      className="h-full min-h-[400px] w-full rounded-xl border border-border bg-[#0f1117]"
      title="Demo Preview"
      style={{ colorScheme: "dark" }}
    />
  );
}

// ── Tag Input ────────────────────────────────────────────────────────────

function TagInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = SUGGESTED_TAGS.filter(
    (t) =>
      !tags.includes(t) &&
      t.toLowerCase().includes(input.toLowerCase())
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="ml-0.5 rounded-sm opacity-60 hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag(input);
            }
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Add tags…"
          className="h-8 text-xs"
        />
        {showSuggestions && filtered.length > 0 && input.length > 0 && (
          <div className="absolute left-0 top-full z-20 mt-1 max-h-32 w-full overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-lg">
            {filtered.slice(0, 8).map((t) => (
              <button
                key={t}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag(t)}
                className="block w-full rounded px-2 py-1 text-left text-xs hover:bg-muted"
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Demo Card ────────────────────────────────────────────────────────────

function DemoCard({
  demo,
  templateCategory,
  themeCss,
  onEdit,
  onToggleVisibility,
  onDelete,
}: {
  demo: {
    _id: string;
    title: string;
    description: string;
    htmlContent?: string;
    bannerUrl?: string;
    status?: string;
    tags?: string[];
    demoUrl?: string;
    githubUrl?: string;
    isPublic: boolean;
  };
  templateCategory?: string;
  themeCss: string;
  onEdit: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
}) {
  const status = demo.status ?? "live";
  const sc = STATUS_CONFIG[status] ?? STATUS_CONFIG.live;
  const cc =
    templateCategory && CATEGORY_COLORS[templateCategory]
      ? CATEGORY_COLORS[templateCategory]
      : null;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5">
      {/* Banner */}
      {demo.bannerUrl ? (
        <div className="relative h-36 overflow-hidden bg-muted">
          <img
            src={demo.bannerUrl}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
        </div>
      ) : demo.htmlContent ? (
        <div className="relative h-36 overflow-hidden" style={{ background: 'var(--card)' }}>
          <iframe
            srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>${themeCss} body{overflow:hidden;transform:scale(.5);transform-origin:top left;width:200%;height:200%}</style></head><body>${demo.htmlContent.slice(0, 8000)}</body></html>`}
            sandbox=""
            className="pointer-events-none h-[288px] w-[200%] origin-top-left scale-50"
            title="Preview"
            tabIndex={-1}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        </div>
      ) : (
        <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
          <Code2 className="h-10 w-10 text-primary/20" />
        </div>
      )}

      {/* Status badge */}
      <div className="absolute right-3 top-3">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
          style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}30` }}
        >
          {sc.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold">{demo.title}</h3>
            {demo.description && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {demo.description}
              </p>
            )}
          </div>
        </div>

        {/* Tags */}
        {demo.tags && demo.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {demo.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            {demo.tags.length > 4 && (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                +{demo.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Category + Links */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {cc && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: cc.bg, color: cc.text, border: `1px solid ${cc.border}` }}
              >
                {CATEGORY_LABELS[templateCategory!] ?? templateCategory}
              </span>
            )}
            <Badge
              variant={demo.isPublic ? "default" : "secondary"}
              className="h-5 text-[10px]"
            >
              {demo.isPublic ? "Public" : "Private"}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {demo.demoUrl && (
              <a
                href={demo.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Live demo"
              >
                <Globe className="h-3.5 w-3.5" />
              </a>
            )}
            {demo.githubUrl && (
              <a
                href={demo.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="GitHub"
              >
                <GitHubIcon className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Action bar */}
        <div className="mt-3 flex items-center gap-1 border-t border-border pt-3 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-7 flex-1 text-xs"
          >
            <Pencil className="mr-1 h-3 w-3" /> Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleVisibility}
            className="h-7 text-xs"
          >
            {demo.isPublic ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-7 text-xs text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Demo Editor ──────────────────────────────────────────────────────────

function DemoEditor({
  initial,
  themeCss,
  onSave,
  onCancel,
  saving,
}: {
  initial: DemoFormData;
  themeCss: string;
  onSave: (data: DemoFormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<DemoFormData>(initial);
  const [activeTab, setActiveTab] = useState<"details" | "code" | "preview">(
    initial.htmlContent ? "code" : "details"
  );
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.demos.generateBannerUploadUrl);
  const [uploading, setUploading] = useState(false);

  const uploadBanner = useCallback(
    async (file: File) => {
      if (file.size > 5_000_000) {
        toast.error("Banner must be under 5MB");
        return;
      }
      setUploading(true);
      try {
        const url = await generateUploadUrl();
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await res.json();
        setForm((f) => ({ ...f, bannerStorageId: storageId as Id<"_storage"> }));
        toast.success("Banner uploaded");
      } catch {
        toast.error("Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [generateUploadUrl]
  );

  const tabs = [
    { id: "details" as const, label: "Details", icon: Tag },
    { id: "code" as const, label: "HTML / CSS / JS", icon: Code2 },
    { id: "preview" as const, label: "Preview", icon: Play },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-primary/20 bg-card">
      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-border bg-muted/30 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 py-2">
          <Button
            size="sm"
            onClick={() => onSave(form)}
            disabled={saving || !form.title.trim()}
            className="h-7 text-xs"
          >
            {saving && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            Save Demo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={saving}
            className="h-7 text-xs"
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Details Tab */}
      {activeTab === "details" && (
        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold">Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Real-time Anomaly Detection Engine"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="What does this demo showcase? What problem does it solve?"
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Status</Label>
              <div className="mt-1.5 flex gap-2">
                {Object.entries(STATUS_CONFIG).map(([key, sc]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm({ ...form, status: key })}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                      form.status === key
                        ? "border-transparent text-white"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                    style={
                      form.status === key
                        ? { background: sc.color }
                        : undefined
                    }
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold">Tags</Label>
              <div className="mt-1.5">
                <TagInput
                  tags={form.tags}
                  onChange={(tags) => setForm({ ...form, tags })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold">Banner Image</Label>
              <div className="mt-1.5">
                {form.bannerStorageId ? (
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <span className="flex-1 text-xs text-muted-foreground">
                      Banner uploaded
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() =>
                        setForm({ ...form, bannerStorageId: undefined })
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted/30"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload banner (max 5MB)
                  </button>
                )}
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadBanner(file);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold">Live Demo URL</Label>
              <div className="relative mt-1">
                <Globe className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={form.demoUrl}
                  onChange={(e) =>
                    setForm({ ...form, demoUrl: e.target.value })
                  }
                  placeholder="https://your-demo.vercel.app"
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold">GitHub URL</Label>
              <div className="relative mt-1">
                <GitHubIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={form.githubUrl}
                  onChange={(e) =>
                    setForm({ ...form, githubUrl: e.target.value })
                  }
                  placeholder="https://github.com/you/repo"
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold">
                Notes / Markdown Content
              </Label>
              <Textarea
                value={form.content}
                onChange={(e) =>
                  setForm({ ...form, content: e.target.value })
                }
                placeholder="Additional notes, write-up, or markdown documentation…"
                rows={4}
                className="mt-1 font-mono text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Code Tab */}
      {activeTab === "code" && (
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 border-b border-border lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-4 py-2">
              <Code2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold">
                HTML / CSS / JS Editor
              </span>
              <span className="ml-auto text-[10px] text-muted-foreground">
                {form.htmlContent.length.toLocaleString()} chars
              </span>
            </div>
            <textarea
              value={form.htmlContent}
              onChange={(e) =>
                setForm({ ...form, htmlContent: e.target.value })
              }
              placeholder={`<!-- Paste your demo HTML here -->\n<style>\n  .demo { ... }\n</style>\n\n<div class="demo">\n  <h1>My Interactive Demo</h1>\n</div>\n\n<script>\n  // Your JS logic\n<\/script>`}
              className="h-[500px] w-full resize-none bg-[#0d1117] p-4 font-mono text-xs text-[#c9d1d9] outline-none placeholder:text-[#484f58]"
              spellCheck={false}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-4 py-2">
              <Play className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs font-bold">Live Preview</span>
            </div>
            <div className="h-[500px]">
              <DemoPreview html={form.htmlContent} themeCss={themeCss} />
            </div>
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === "preview" && (
        <div className="p-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-4 overflow-hidden rounded-2xl border border-border bg-card">
              {form.htmlContent ? (
                <div className="h-[600px]">
                  <DemoPreview html={form.htmlContent} themeCss={themeCss} />
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Code2 className="mx-auto mb-2 h-10 w-10 opacity-30" />
                    <p className="text-sm">
                      Add HTML content in the Code tab to see a preview
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <h3 className="text-lg font-bold">
                {form.title || "Untitled Demo"}
              </h3>
              {form.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {form.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Simple Create Form (non-technical mode) ───────────────────────────────

const WIZARD_STEPS = [
  { label: "Your Role", icon: Briefcase },
  { label: "Your Work", icon: MessageSquare },
  { label: "Building", icon: Wand2 },
  { label: "Review", icon: Check },
] as const;

function SimpleCreateForm({
  sections,
  themeCss,
  saving,
  onSave,
  onCancel,
}: {
  sections: Array<{
    _id: string;
    companyName: string;
    role: string;
    skills: string[];
    description: string;
    achievements: string[];
  }>;
  themeCss: string;
  saving: boolean;
  onSave: (data: {
    title: string;
    description: string;
    htmlContent: string;
    tags: string[];
    sectionId?: Id<"portfolioSections">;
  }) => void;
  onCancel: () => void;
}) {
  const generateDemo = useAction(api.demoGenerator.generateDemo);

  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);

  // Step 0: Role selection
  const [sectionId, setSectionId] = useState("");
  const [manualRole, setManualRole] = useState("");
  const [manualCompany, setManualCompany] = useState("");
  const [manualSkills, setManualSkills] = useState("");

  // Step 1: Questionnaire
  const [accomplishment, setAccomplishment] = useState("");
  const [impact, setImpact] = useState("");
  const [audience, setAudience] = useState("recruiters");

  // Step 3: Generated result
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [generatedDesc, setGeneratedDesc] = useState("");
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);

  // Derive role context from selection or manual entry
  const selectedSection = sections.find((s) => s._id === sectionId);
  const roleContext = selectedSection
    ? {
        role: selectedSection.role,
        company: selectedSection.companyName,
        skills: selectedSection.skills,
        description: selectedSection.description,
        achievements: selectedSection.achievements,
      }
    : {
        role: manualRole,
        company: manualCompany,
        skills: manualSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        description: "",
        achievements: [] as string[],
      };

  const canProceedStep0 = sectionId
    ? true
    : manualRole.trim() && manualCompany.trim();
  const canProceedStep1 = accomplishment.trim().length >= 10;

  // Pre-fill accomplishment from section data
  const handleSectionChange = (id: string) => {
    setSectionId(id);
    const sec = sections.find((s) => s._id === id);
    if (sec) {
      if (sec.achievements.length > 0 && !accomplishment) {
        setAccomplishment(sec.achievements[0]);
      }
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setStep(2);
    try {
      const result = await generateDemo({
        role: roleContext.role,
        company: roleContext.company,
        skills: roleContext.skills,
        accomplishment,
        impact: impact || accomplishment,
        audience,
      });
      setGeneratedHtml(result.html);
      setGeneratedTitle(result.title);
      setGeneratedDesc(result.description);
      setGeneratedTags(result.tags);
      setStep(3);
      if (result.fromCache) {
        toast.success("Found a matching demo instantly!");
      }
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to generate demo"
      );
      setStep(1);
    } finally {
      setGenerating(false);
    }
  };

  const iframeSrc = generatedHtml
    ? `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${themeCss}</style><link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet"><script src="https://cdn.jsdelivr.net/npm/chart.js@4"><\/script></head><body>${generatedHtml}</body></html>`
    : "";

  return (
    <div>
      {/* Header + Step indicator */}
      <div className="mb-6">
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" /> Back
          </button>
          <span className="text-muted-foreground/40">·</span>
          <span className="text-sm font-bold">Create a Demo</span>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-0">
          {WIZARD_STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={s.label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs transition-all ${
                      isDone
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : isActive
                          ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20"
                          : "border-border bg-muted/30 text-muted-foreground"
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <span
                    className={`mt-1 text-[10px] font-semibold ${
                      isActive
                        ? "text-foreground"
                        : isDone
                          ? "text-emerald-600"
                          : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < WIZARD_STEPS.length - 1 && (
                  <div
                    className={`mx-2 mt-[-14px] h-0.5 w-8 rounded sm:w-12 ${
                      i < step ? "bg-emerald-500" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 0: Pick your role */}
      {step === 0 && (
        <div className="mx-auto max-w-lg space-y-5">
          <div className="text-center">
            <h2 className="text-lg font-bold">What role is this demo for?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick from your work history, or describe the role manually.
            </p>
          </div>

          {sections.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Your Roles</Label>
              <div className="space-y-2">
                {sections.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => handleSectionChange(s._id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      sectionId === s._id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/30 hover:bg-muted/30"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        sectionId === s._id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">
                        {s.role}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {s.companyName}
                        {s.skills.length > 0 && (
                          <> · {s.skills.slice(0, 3).join(", ")}</>
                        )}
                      </div>
                    </div>
                    {sectionId === s._id && (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sections.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                or describe manually
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}

          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div>
              <Label className="mb-1 block text-xs font-semibold">
                Job Title
              </Label>
              <input
                value={manualRole}
                onChange={(e) => {
                  setManualRole(e.target.value);
                  setSectionId("");
                }}
                placeholder="e.g. Senior Data Engineer"
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <Label className="mb-1 block text-xs font-semibold">
                Company
              </Label>
              <input
                value={manualCompany}
                onChange={(e) => {
                  setManualCompany(e.target.value);
                  setSectionId("");
                }}
                placeholder="e.g. Acme Corp"
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <Label className="mb-1 block text-xs font-semibold">
                Key Skills
                <span className="ml-1 font-normal text-muted-foreground">
                  (comma-separated)
                </span>
              </Label>
              <input
                value={manualSkills}
                onChange={(e) => setManualSkills(e.target.value)}
                placeholder="e.g. Python, SQL, AWS, Machine Learning"
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setStep(1)}
              disabled={!canProceedStep0}
              size="sm"
            >
              Next
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 1: Questionnaire */}
      {step === 1 && (
        <div className="mx-auto max-w-lg space-y-5">
          <div className="text-center">
            <h2 className="text-lg font-bold">Tell us about your work</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Describe what you built or accomplished — we&apos;ll turn it into
              an interactive demo.
            </p>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Briefcase className="h-3.5 w-3.5" />
              {roleContext.role} at {roleContext.company}
            </div>
            {roleContext.skills.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {roleContext.skills.slice(0, 6).map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block text-xs font-semibold">
                What did you build or accomplish?
                <span className="ml-1 text-destructive">*</span>
              </Label>
              <textarea
                value={accomplishment}
                onChange={(e) => setAccomplishment(e.target.value)}
                placeholder="e.g. Built an ML pipeline that predicts customer churn with 94% accuracy, processing 2M records daily across 15 feature dimensions..."
                rows={4}
                className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                Include specific numbers, tools used, and scope. The more
                detail, the better your demo will look.
              </p>
            </div>

            <div>
              <Label className="mb-1.5 block text-xs font-semibold">
                What was the measurable impact?
              </Label>
              <textarea
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                placeholder="e.g. Reduced churn by 23%, saved $1.2M annually, cut processing time from 4 hours to 12 minutes..."
                rows={2}
                className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <Label className="mb-1.5 block text-xs font-semibold">
                Who will see this demo?
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    value: "recruiters",
                    label: "Recruiters",
                    desc: "Non-technical",
                  },
                  {
                    value: "engineers",
                    label: "Engineers",
                    desc: "Technical peers",
                  },
                  {
                    value: "executives",
                    label: "Executives",
                    desc: "Business leaders",
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAudience(opt.value)}
                    className={`rounded-lg border p-2.5 text-center transition-all ${
                      audience === opt.value
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!canProceedStep1}
              size="sm"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Generate Demo
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Generating */}
      {step === 2 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Wand2 className="h-7 w-7 text-primary" />
            </div>
            <div className="absolute -right-1 -top-1 h-4 w-4 animate-ping rounded-full bg-primary/40" />
          </div>
          <h2 className="mt-5 text-lg font-bold">Building your demo...</h2>
          <p className="mt-1.5 max-w-sm text-center text-sm text-muted-foreground">
            Our AI is crafting an interactive, visual demo based on your work
            history. This takes about 15–30 seconds.
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Generating HTML, CSS & interactivity...
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="text-center">
            <h2 className="text-lg font-bold">Your demo is ready!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review and customize the title, then add it to your portfolio.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                <div>
                  <Label className="mb-1 block text-xs font-semibold">
                    Demo Title
                  </Label>
                  <input
                    value={generatedTitle}
                    onChange={(e) => setGeneratedTitle(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <Label className="mb-1 block text-xs font-semibold">
                    Description
                  </Label>
                  <textarea
                    value={generatedDesc}
                    onChange={(e) => setGeneratedDesc(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                {generatedTags.length > 0 && (
                  <div>
                    <Label className="mb-1 block text-xs font-semibold">
                      Tags
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {generatedTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <Label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold">
                    <Briefcase className="h-3 w-3" />
                    Attach to Role
                  </Label>
                  {sections.length === 0 ? (
                    <p className="rounded-lg bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
                      Add work experience first to attach demos.
                    </p>
                  ) : (
                    <div className="relative">
                      <select
                        value={sectionId}
                        onChange={(e) => setSectionId(e.target.value)}
                        className="w-full appearance-none rounded-md border border-border bg-background px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="">— No role —</option>
                        {sections.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.role} at {s.companyName}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    onSave({
                      title: generatedTitle,
                      description: generatedDesc,
                      htmlContent: generatedHtml,
                      tags: generatedTags,
                      sectionId: sectionId
                        ? (sectionId as Id<"portfolioSections">)
                        : undefined,
                    })
                  }
                  disabled={!generatedTitle.trim() || saving}
                  className="flex-1"
                >
                  {saving ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Add to Portfolio
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={saving}
                >
                  Regenerate
                </Button>
              </div>
            </div>

            {/* Live preview */}
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-4 py-2">
                <Monitor className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs font-bold">Demo Preview</span>
              </div>
              <iframe
                srcDoc={iframeSrc}
                sandbox="allow-scripts"
                title="Demo Preview"
                className="block h-[550px] w-full border-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Template Picker ──────────────────────────────────────────────────────

function TemplatePicker({
  templates,
  onPick,
  onBlank,
}: {
  templates: { _id: string; name: string; category: string; description: string; htmlContent?: string }[];
  onPick: (t: (typeof templates)[number]) => void;
  onBlank?: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string | null>(null);

  const cats = useMemo(
    () => [...new Set(templates.map((t) => t.category))],
    [templates]
  );

  const filtered = useMemo(() => {
    let result = templates;
    if (filterCat) result = result.filter((t) => t.category === filterCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [templates, filterCat, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="h-8 pl-8 text-xs"
          />
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setFilterCat(null)}
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
              !filterCat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {cats.map((cat) => {
            const cc = CATEGORY_COLORS[cat];
            return (
              <button
                key={cat}
                onClick={() =>
                  setFilterCat(filterCat === cat ? null : cat)
                }
                className="rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors"
                style={
                  filterCat === cat
                    ? { background: cc?.text ?? "#6b7280", color: "#fff" }
                    : { background: cc?.bg, color: cc?.text, border: `1px solid ${cc?.border}` }
                }
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {onBlank && (
          <button
            onClick={onBlank}
            className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 transition-all hover:border-primary/40 hover:bg-primary/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <span className="mt-2 text-sm font-semibold">From Scratch</span>
            <span className="mt-0.5 text-[10px] text-muted-foreground">
              Start with a blank canvas
            </span>
          </button>
        )}

        {filtered.map((t) => {
          const cc = CATEGORY_COLORS[t.category];
          return (
            <button
              key={t._id}
              onClick={() => onPick(t)}
              className="group flex flex-col rounded-xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <div className="mb-3 flex h-20 items-center justify-center rounded-lg bg-muted/50">
                {t.htmlContent ? (
                  <Code2 className="h-6 w-6 text-primary/30" />
                ) : (
                  <LayoutGrid className="h-6 w-6 text-muted-foreground/30" />
                )}
              </div>
              <span
                className="mb-1.5 self-start rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={
                  cc
                    ? { background: cc.bg, color: cc.text, border: `1px solid ${cc.border}` }
                    : {}
                }
              >
                {CATEGORY_LABELS[t.category] ?? t.category}
              </span>
              <h4 className="text-sm font-bold">{t.name}</h4>
              <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                {t.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// ── Main Page
// ══════════════════════════════════════════════════════════════════════════

export default function DemosPage() {
  const templates = useQuery(api.demos.listTemplates);
  const myDemos = useQuery(api.demos.getSelfDemos);
  const profile = useQuery(api.profiles.getSelf);
  const sections = useQuery(api.portfolioSections.getSelfSections);
  const createDemo = useMutation(api.demos.createSelf);
  const updateDemo = useMutation(api.demos.updateSelf);
  const removeDemo = useMutation(api.demos.removeSelf);
  const linkDemoToSection = useMutation(api.portfolioSections.linkDemo);

  const themeCss = useMemo(() => {
    const theme = resolveTheme(profile?.themeConfig, profile?.theme);
    return buildDemoIframeCss(theme);
  }, [profile?.themeConfig, profile?.theme]);

  const [pageMode, setPageMode] = useState<"simple" | "advanced">("simple");

  const [mode, setMode] = useState<
    | { type: "grid" }
    | { type: "picking" }
    | { type: "creating"; templateId?: Id<"demoTemplates">; initial: DemoFormData }
    | { type: "editing"; demoId: Id<"userDemos">; initial: DemoFormData }
    | { type: "simple-wizard" }
  >({ type: "grid" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string | null>(null);

  const templateMap = useMemo(() => {
    const map = new Map<string, { name: string; category: string }>();
    (templates ?? []).forEach((t) =>
      map.set(t._id, { name: t.name, category: t.category })
    );
    return map;
  }, [templates]);

  const filteredDemos = useMemo(() => {
    let result = myDemos ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          (d.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filterCat) {
      result = result.filter((d) => {
        const t = d.templateId ? templateMap.get(d.templateId) : null;
        return t?.category === filterCat;
      });
    }
    return result;
  }, [myDemos, search, filterCat, templateMap]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    (myDemos ?? []).forEach((d) => {
      const t = d.templateId ? templateMap.get(d.templateId) : null;
      if (t?.category) cats.add(t.category);
    });
    return [...cats];
  }, [myDemos, templateMap]);

  const handleSimpleCreate = async (data: {
    title: string;
    description: string;
    htmlContent: string;
    tags: string[];
    sectionId?: Id<"portfolioSections">;
  }) => {
    if (mode.type !== "simple-wizard") return;
    setSaving(true);
    try {
      const demoId = await createDemo({
        templateId: undefined,
        title: data.title.trim(),
        description: data.description.trim(),
        content: "",
        htmlContent: data.htmlContent || undefined,
        status: "live",
        tags: data.tags,
        demoUrl: undefined,
        githubUrl: undefined,
        bannerStorageId: undefined,
      });
      if (data.sectionId) {
        await linkDemoToSection({ sectionId: data.sectionId, demoId });
      }
      toast.success("Demo added to your portfolio!");
      setMode({ type: "grid" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create demo");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (data: DemoFormData) => {
    setSaving(true);
    try {
      await createDemo({
        templateId:
          mode.type === "creating" ? mode.templateId : undefined,
        title: data.title,
        description: data.description,
        content: data.content,
        htmlContent: data.htmlContent || undefined,
        bannerStorageId: data.bannerStorageId,
        status: data.status,
        tags: data.tags,
        demoUrl: data.demoUrl || undefined,
        githubUrl: data.githubUrl || undefined,
      });
      toast.success("Demo created");
      setMode({ type: "grid" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create demo");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data: DemoFormData) => {
    if (mode.type !== "editing") return;
    setSaving(true);
    try {
      await updateDemo({
        demoId: mode.demoId,
        title: data.title,
        description: data.description,
        content: data.content,
        htmlContent: data.htmlContent || undefined,
        bannerStorageId: data.bannerStorageId,
        status: data.status,
        tags: data.tags,
        demoUrl: data.demoUrl || undefined,
        githubUrl: data.githubUrl || undefined,
      });
      toast.success("Demo updated");
      setMode({ type: "grid" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update demo");
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (demoId: string, current: boolean) => {
    try {
      await updateDemo({
        demoId: demoId as Id<"userDemos">,
        isPublic: !current,
      });
      toast.success(current ? "Demo hidden" : "Demo visible");
    } catch {
      toast.error("Failed to update visibility");
    }
  };

  const handleDelete = async (demoId: string) => {
    if (!window.confirm("Delete this demo? This cannot be undone.")) return;
    try {
      await removeDemo({ demoId: demoId as Id<"userDemos"> });
      toast.success("Demo removed");
    } catch {
      toast.error("Failed to remove demo");
    }
  };

  const startEdit = (demo: NonNullable<typeof myDemos>[number]) => {
    setMode({
      type: "editing",
      demoId: demo._id,
      initial: {
        title: demo.title,
        description: demo.description,
        content: demo.content,
        htmlContent: demo.htmlContent ?? "",
        status: demo.status ?? "live",
        tags: demo.tags ?? [],
        demoUrl: demo.demoUrl ?? "",
        githubUrl: demo.githubUrl ?? "",
        bannerStorageId: demo.bannerStorageId ?? undefined,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-transparent to-primary/5 p-6">
        <div className="relative">
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
            <Zap className="h-3 w-3" />
            Interactive Demos
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Demo Studio
          </h1>
          <p className="mt-1 max-w-lg text-sm text-muted-foreground">
            {pageMode === "simple"
              ? "Pick a pre-built demo, give it a title, and attach it to a role — no coding required."
              : "Write HTML/CSS/JS directly, attach to portfolio entries, and let visitors experience your projects live."}
          </p>
          {/* Mode toggle */}
          <div className="mt-4 inline-flex rounded-lg border border-border bg-muted/30 p-0.5">
            <button
              onClick={() => { setPageMode("simple"); setMode({ type: "grid" }); }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                pageMode === "simple"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Simple
            </button>
            <button
              onClick={() => { setPageMode("advanced"); setMode({ type: "grid" }); }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                pageMode === "advanced"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              Advanced
            </button>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Mode: Grid */}
      {mode.type === "grid" && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search demos…"
                className="h-8 pl-8 text-xs"
              />
            </div>
            <div className="flex gap-1">
              {categories.map((cat) => {
                const cc = CATEGORY_COLORS[cat];
                return (
                  <button
                    key={cat}
                    onClick={() =>
                      setFilterCat(filterCat === cat ? null : cat)
                    }
                    className="rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors"
                    style={
                      filterCat === cat
                        ? { background: cc?.text, color: "#fff" }
                        : { background: cc?.bg, color: cc?.text }
                    }
                  >
                    {CATEGORY_LABELS[cat] ?? cat}
                  </button>
                );
              })}
            </div>
            <Button
              size="sm"
              onClick={() => setMode(pageMode === "simple" ? { type: "simple-wizard" } : { type: "picking" })}
              className="h-8"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              New Demo
            </Button>
          </div>

          {filteredDemos.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDemos.map((demo) => {
                const tpl = demo.templateId
                  ? templateMap.get(demo.templateId)
                  : null;
                return (
                  <DemoCard
                    key={demo._id}
                    demo={demo}
                    templateCategory={tpl?.category}
                    themeCss={themeCss}
                    onEdit={() => startEdit(demo)}
                    onToggleVisibility={() =>
                      toggleVisibility(demo._id, demo.isPublic)
                    }
                    onDelete={() => handleDelete(demo._id)}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Zap}
              title="No demos yet"
              description="Demos are interactive, visual proof of your engineering skills. Create your first one to impress recruiters and collaborators."
              action={
                <Button
                  onClick={() => setMode(pageMode === "simple" ? { type: "simple-wizard" } : { type: "picking" })}
                  size="sm"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create Your First Demo
                </Button>
              }
            />
          )}
        </>
      )}

      {/* Mode: Picking Template */}
      {mode.type === "picking" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Choose a Starting Point</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode({ type: "grid" })}
            >
              <X className="mr-1 h-3.5 w-3.5" /> Cancel
            </Button>
          </div>
          <TemplatePicker
            templates={(templates ?? []).map((t) => ({
              _id: t._id,
              name: t.name,
              category: t.category,
              description: t.description,
              htmlContent: t.htmlContent ?? undefined,
            }))}
            onPick={(t) =>
              setMode({
                type: "creating",
                templateId: t._id as Id<"demoTemplates">,
                initial: {
                  ...emptyForm,
                  title: t.name,
                  htmlContent: t.htmlContent ?? "",
                },
              })
            }
            onBlank={() =>
              setMode({
                type: "creating",
                initial: { ...emptyForm },
              })
            }
          />
        </div>
      )}

      {/* Mode: Creating / Editing */}
      {(mode.type === "creating" || mode.type === "editing") && (
        <DemoEditor
          initial={mode.initial}
          themeCss={themeCss}
          onSave={mode.type === "creating" ? handleCreate : handleUpdate}
          onCancel={() => setMode({ type: "grid" })}
          saving={saving}
        />
      )}

      {/* Mode: Simple Wizard (AI-powered) */}
      {mode.type === "simple-wizard" && (
        <SimpleCreateForm
          sections={(sections ?? []).map((s) => ({
            _id: s._id,
            companyName: s.companyName,
            role: s.role,
            skills: s.skills ?? [],
            description: s.description ?? "",
            achievements: s.achievements ?? [],
          }))}
          themeCss={themeCss}
          saving={saving}
          onSave={handleSimpleCreate}
          onCancel={() => setMode({ type: "grid" })}
        />
      )}
    </div>
  );
}
