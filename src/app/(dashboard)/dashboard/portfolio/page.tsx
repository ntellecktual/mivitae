"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Pencil,
  Trash2,
  Plus,
  Check,
  X,
  Zap,
  Link2,
  Unlink,
  Loader2,
} from "lucide-react";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { ImageUploader } from "@/components/image-uploader";

interface SectionForm {
  companyName: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  skills: string;
  achievements: string;
}

const emptyForm: SectionForm = {
  companyName: "",
  role: "",
  startDate: "",
  endDate: "",
  description: "",
  skills: "",
  achievements: "",
};

export default function PortfolioPage() {
  const sections = useQuery(api.portfolioSections.getSelfSections);
  const createSection = useMutation(api.portfolioSections.createSelf);
  const updateSection = useMutation(api.portfolioSections.updateSelf);
  const removeSection = useMutation(api.portfolioSections.removeSelf);
  const linkDemo = useMutation(api.portfolioSections.linkDemo);
  const unlinkDemo = useMutation(api.portfolioSections.unlinkDemo);
  const myDemos = useQuery(api.demos.getSelfDemos);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SectionForm>(emptyForm);
  const [adding, setAdding] = useState(false);
  const [linkingSectionId, setLinkingSectionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const startEdit = (section: {
    _id: string;
    companyName: string;
    role: string;
    startDate: string;
    endDate?: string;
    description: string;
    skills: string[];
    achievements: string[];
  }) => {
    setEditingId(section._id);
    setAdding(false);
    setForm({
      companyName: section.companyName,
      role: section.role,
      startDate: section.startDate,
      endDate: section.endDate ?? "",
      description: section.description,
      skills: section.skills.join(", "),
      achievements: section.achievements.join("\n"),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAdding(false);
    setForm(emptyForm);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!form.companyName.trim() || !form.role.trim()) {
      toast.error("Company and role are required");
      return;
    }
    setSaving(true);
    try {
      await updateSection({
        sectionId: editingId as Id<"portfolioSections">,
        companyName: form.companyName,
        role: form.role,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        description: form.description,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        achievements: form.achievements
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      toast.success("Experience updated");
      cancelEdit();
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const saveNew = async () => {
    if (!form.companyName.trim() || !form.role.trim()) {
      toast.error("Company and role are required");
      return;
    }
    setSaving(true);
    try {
      await createSection({
        companyName: form.companyName,
        role: form.role,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        description: form.description,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        achievements: form.achievements
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        order: sections ? sections.length : 0,
      });
      toast.success("Experience added");
      cancelEdit();
    } catch {
      toast.error("Failed to add experience");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sectionId: string) => {
    if (!window.confirm("Delete this experience? This cannot be undone.")) return;
    try {
      await removeSection({
        sectionId: sectionId as Id<"portfolioSections">,
      });
      toast.success("Experience removed");
    } catch {
      toast.error("Failed to remove experience");
    }
  };

  const renderForm = (onSave: () => Promise<void>) => (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Company</Label>
            <Input
              value={form.companyName}
              onChange={(e) =>
                setForm({ ...form, companyName: e.target.value })
              }
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <Label>Role</Label>
            <Input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Project Manager"
            />
          </div>
          <div>
            <Label>Start Date</Label>
            <Input
              value={form.startDate}
              onChange={(e) =>
                setForm({ ...form, startDate: e.target.value })
              }
              placeholder="Jan 2020"
            />
          </div>
          <div>
            <Label>End Date</Label>
            <Input
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              placeholder="Leave blank for current"
            />
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            placeholder="What did you do in this role?"
            rows={3}
          />
        </div>
        <div>
          <Label>Skills (comma-separated)</Label>
          <Input
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            placeholder="React, TypeScript, AWS"
          />
        </div>
        <div>
          <Label>Achievements (one per line)</Label>
          <Textarea
            value={form.achievements}
            onChange={(e) =>
              setForm({ ...form, achievements: e.target.value })
            }
            placeholder="Reduced deployment time by 40%\nLed team of 5 engineers"
            rows={3}
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onSave}
            disabled={saving}
            size="sm"
          >
            {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
            Save
          </Button>
          <Button
            onClick={cancelEdit}
            variant="outline"
            size="sm"
            disabled={saving}
          >
            <X className="mr-1.5 h-3.5 w-3.5" /> Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const sorted = sections
    ? [...sections].sort((a, b) => a.order - b.order)
    : [];

  if (sections === undefined) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-40 animate-pulse rounded-lg bg-muted" />
            <div className="mt-2 h-5 w-64 animate-pulse rounded bg-muted" />
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl border bg-muted/60" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work History</h1>
          <p className="mt-1.5 text-base text-muted-foreground">
            Your career journey — edit, reorder, or add entries.
          </p>
        </div>
        {!adding && !editingId && (
          <Button
            data-tour="portfolio-add"
            onClick={() => {
              setAdding(true);
              setEditingId(null);
              setForm(emptyForm);
            }}
            size="sm"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Entry
          </Button>
        )}
      </div>

      {adding && renderForm(saveNew)}

      {sorted.length > 0 ? (
        <div className="relative">
          {/* Continuous timeline line */}
          <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-border" />
          <div className="space-y-4">
            {sorted.map((section) =>
              editingId === section._id ? (
                <div key={section._id} className="pl-14">{renderForm(saveEdit)}</div>
              ) : (
                <div key={section._id} className="relative pl-14">
                  {/* Timeline dot */}
                  <div className="absolute left-[14px] top-5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                  <Card className="card-hover">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        {section.imageUrl ? (
                          <ImageUploader
                            imageUrl={section.imageUrl}
                            generateUploadUrlRef={api.portfolioSections.generateImageUploadUrl}
                            updateImageRef={api.portfolioSections.updateImage}
                            removeImageRef={api.portfolioSections.removeImage}
                            updateArgs={{ sectionId: section._id }}
                            removeArgs={{ sectionId: section._id }}
                          />
                        ) : (
                          <ImageUploader
                            imageUrl={null}
                            generateUploadUrlRef={api.portfolioSections.generateImageUploadUrl}
                            updateImageRef={api.portfolioSections.updateImage}
                            removeImageRef={api.portfolioSections.removeImage}
                            updateArgs={{ sectionId: section._id }}
                            removeArgs={{ sectionId: section._id }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2 min-w-0">
                              <h3 className="font-semibold leading-tight">{section.role}</h3>
                              {!section.endDate && (
                                <Badge variant="secondary" className="shrink-0">Current</Badge>
                              )}
                            </div>
                            <div className="flex shrink-0 gap-1">
                              <button
                                onClick={() => startEdit(section)}
                                title="Edit"
                                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(section._id)}
                                title="Delete"
                                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-muted-foreground">{section.companyName}</p>
                          {section.startDate && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {section.startDate} — {section.endDate ?? "Present"}
                            </p>
                          )}
                          {section.description && (
                            <>
                              <Separator className="my-3" />
                              <p className="text-sm">{section.description}</p>
                            </>
                          )}
                          {section.achievements && section.achievements.length > 0 && (
                            <ul className="mt-2 space-y-0.5 text-sm text-muted-foreground">
                              {section.achievements.map((a, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                                  {a}
                                </li>
                              ))}
                            </ul>
                          )}
                          {section.skills && section.skills.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {section.skills.map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Linked demos */}
                          <div className="mt-3 space-y-2">
                            {section.demoIds && section.demoIds.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {section.demoIds.map((demoId) => {
                                  const demo = myDemos?.find((d) => d._id === demoId);
                                  return (
                                    <span
                                      key={demoId}
                                      className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                                    >
                                      <Zap className="h-3 w-3" />
                                      {demo?.title ?? "Demo"}
                                      <button
                                        onClick={async () => {
                                          try {
                                            await unlinkDemo({
                                              sectionId: section._id as Id<"portfolioSections">,
                                              demoId: demoId as Id<"userDemos">,
                                            });
                                          } catch {
                                            toast.error("Failed to unlink demo");
                                          }
                                        }}
                                        title="Unlink demo"
                                        className="ml-0.5 rounded hover:text-destructive"
                                      >
                                        <Unlink className="h-3 w-3" />
                                      </button>
                                    </span>
                                  );
                                })}
                              </div>
                            )}

                            {linkingSectionId === section._id ? (
                              <div className="rounded-md border p-3">
                                <p className="mb-2 text-xs font-medium text-muted-foreground">
                                  Select a demo to link:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {myDemos
                                    ?.filter((d) => !section.demoIds?.includes(d._id as Id<"userDemos">))
                                    .map((d) => (
                                      <button
                                        key={d._id}
                                        onClick={async () => {
                                          try {
                                            await linkDemo({
                                              sectionId: section._id as Id<"portfolioSections">,
                                              demoId: d._id as Id<"userDemos">,
                                            });
                                            setLinkingSectionId(null);
                                          } catch {
                                            toast.error("Failed to link demo");
                                          }
                                        }}
                                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-primary/10"
                                      >
                                        <Zap className="h-3 w-3" />
                                        {d.title}
                                      </button>
                                    ))}
                                  {(!myDemos ||
                                    myDemos.filter((d) => !section.demoIds?.includes(d._id as Id<"userDemos">)).length === 0) && (
                                    <p className="text-xs text-muted-foreground">
                                      No unlinked demos available. Create one in the Demos tab first.
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => setLinkingSectionId(null)}
                                  className="mt-2 text-xs text-muted-foreground hover:text-foreground"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1.5 text-xs"
                                onClick={() => setLinkingSectionId(section._id)}
                              >
                                <Link2 className="h-3 w-3" />
                                Link demo
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        !adding && (
          <EmptyState
            icon={Briefcase}
            title="No work history yet"
            description={
              <>
                Add your work experience manually, or upload a résumé on the{" "}
                <a href="/dashboard/upload" className="text-primary hover:underline">Upload</a>{" "}
                page to auto-populate.
              </>
            }
            action={
              <button
                onClick={() => {
                  setAdding(true);
                  setForm(emptyForm);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Add first experience
              </button>
            }
          />
        )
      )}
    </div>
  );
}
