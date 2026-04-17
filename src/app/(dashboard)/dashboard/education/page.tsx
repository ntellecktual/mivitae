"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Pencil,
  Trash2,
  Plus,
  Check,
  X,
  Loader2,
  Award,
  ExternalLink,
} from "lucide-react";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";

interface EduForm {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  gpa: string;
  honors: string;
  activities: string;
  skills: string;
  relevantCoursework: string;
}

interface CertForm {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  credentialUrl: string;
}

const emptyForm: EduForm = {
  institution: "",
  degree: "",
  fieldOfStudy: "",
  startYear: "",
  endYear: "",
  gpa: "",
  honors: "",
  activities: "",
  skills: "",
  relevantCoursework: "",
};

const emptyCertForm: CertForm = {
  name: "",
  issuer: "",
  issueDate: "",
  expiryDate: "",
  credentialId: "",
  credentialUrl: "",
};

export default function EducationPage() {
  const entries = useQuery(api.educationEntries.getSelfEntries);
  const certificates = useQuery(api.certificates.getSelfCertificates);
  const createEntry = useMutation(api.educationEntries.createSelf);
  const updateEntry = useMutation(api.educationEntries.updateSelf);
  const removeEntry = useMutation(api.educationEntries.removeSelf);
  const createCert = useMutation(api.certificates.createSelf);
  const updateCert = useMutation(api.certificates.updateSelf);
  const removeCert = useMutation(api.certificates.removeSelf);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EduForm>(emptyForm);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [certForm, setCertForm] = useState<CertForm>(emptyCertForm);
  const [addingCert, setAddingCert] = useState(false);
  const [savingCert, setSavingCert] = useState(false);

  const startEdit = (entry: {
    _id: string;
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startYear: number;
    endYear?: number;
    gpa?: string;
    honors?: string;
    activities: string[];
    skills?: string[];
    relevantCoursework?: string;
  }) => {
    setEditingId(entry._id);
    setAdding(false);
    setForm({
      institution: entry.institution,
      degree: entry.degree,
      fieldOfStudy: entry.fieldOfStudy ?? "",
      startYear: String(entry.startYear),
      endYear: entry.endYear ? String(entry.endYear) : "",
      gpa: entry.gpa ?? "",
      honors: entry.honors ?? "",
      activities: entry.activities.join(", "),
      skills: entry.skills?.join(", ") ?? "",
      relevantCoursework: entry.relevantCoursework ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAdding(false);
    setForm(emptyForm);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!form.institution.trim() || !form.degree.trim()) {
      toast.error("Institution and degree are required");
      return;
    }
    if (!form.startYear || isNaN(Number(form.startYear))) {
      toast.error("A valid start year is required");
      return;
    }
    setSaving(true);
    try {
      await updateEntry({
        entryId: editingId as Id<"educationEntries">,
        institution: form.institution,
        degree: form.degree,
        fieldOfStudy: form.fieldOfStudy || undefined,
        startYear: Number(form.startYear),
        endYear: form.endYear ? Number(form.endYear) : undefined,
        gpa: form.gpa || undefined,
        honors: form.honors || undefined,
        activities: form.activities.split(",").map((s) => s.trim()).filter(Boolean),
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        relevantCoursework: form.relevantCoursework || undefined,
      });
      toast.success("Education updated");
      cancelEdit();
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const saveNew = async () => {
    if (!form.institution.trim() || !form.degree.trim()) {
      toast.error("Institution and degree are required");
      return;
    }
    if (!form.startYear || isNaN(Number(form.startYear))) {
      toast.error("A valid start year is required");
      return;
    }
    setSaving(true);
    try {
      await createEntry({
        institution: form.institution,
        degree: form.degree,
        fieldOfStudy: form.fieldOfStudy || undefined,
        startYear: Number(form.startYear),
        endYear: form.endYear ? Number(form.endYear) : undefined,
        gpa: form.gpa || undefined,
        honors: form.honors || undefined,
        activities: form.activities.split(",").map((s) => s.trim()).filter(Boolean),
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        relevantCoursework: form.relevantCoursework || undefined,
        order: entries ? entries.length : 0,
      });
      toast.success("Education added");
      cancelEdit();
    } catch {
      toast.error("Failed to add education");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!window.confirm("Delete this entry? This cannot be undone.")) return;
    try {
      await removeEntry({ entryId: entryId as Id<"educationEntries"> });
      toast.success("Education removed");
    } catch {
      toast.error("Failed to remove entry");
    }
  };

  // Cert helpers
  const startEditCert = (cert: {
    _id: string;
    name: string;
    issuer: string;
    issueDate?: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
  }) => {
    setEditingCertId(cert._id);
    setAddingCert(false);
    setCertForm({
      name: cert.name,
      issuer: cert.issuer,
      issueDate: cert.issueDate ?? "",
      expiryDate: cert.expiryDate ?? "",
      credentialId: cert.credentialId ?? "",
      credentialUrl: cert.credentialUrl ?? "",
    });
  };

  const cancelCertEdit = () => {
    setEditingCertId(null);
    setAddingCert(false);
    setCertForm(emptyCertForm);
  };

  const saveCertEdit = async () => {
    if (!editingCertId) return;
    if (!certForm.name.trim() || !certForm.issuer.trim()) {
      toast.error("Name and issuer are required");
      return;
    }
    setSavingCert(true);
    try {
      await updateCert({
        certId: editingCertId as Id<"certificates">,
        name: certForm.name,
        issuer: certForm.issuer,
        issueDate: certForm.issueDate || undefined,
        expiryDate: certForm.expiryDate || undefined,
        credentialId: certForm.credentialId || undefined,
        credentialUrl: certForm.credentialUrl || undefined,
      });
      toast.success("Certificate updated");
      cancelCertEdit();
    } catch {
      toast.error("Failed to save certificate");
    } finally {
      setSavingCert(false);
    }
  };

  const saveCertNew = async () => {
    if (!certForm.name.trim() || !certForm.issuer.trim()) {
      toast.error("Name and issuer are required");
      return;
    }
    setSavingCert(true);
    try {
      await createCert({
        name: certForm.name,
        issuer: certForm.issuer,
        issueDate: certForm.issueDate || undefined,
        expiryDate: certForm.expiryDate || undefined,
        credentialId: certForm.credentialId || undefined,
        credentialUrl: certForm.credentialUrl || undefined,
        order: certificates ? certificates.length : 0,
      });
      toast.success("Certificate added");
      cancelCertEdit();
    } catch {
      toast.error("Failed to add certificate");
    } finally {
      setSavingCert(false);
    }
  };

  const handleDeleteCert = async (certId: string) => {
    if (!window.confirm("Delete this certificate? This cannot be undone.")) return;
    try {
      await removeCert({ certId: certId as Id<"certificates"> });
      toast.success("Certificate removed");
    } catch {
      toast.error("Failed to remove certificate");
    }
  };

  const renderForm = (onSave: () => Promise<void>) => (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Institution</Label>
            <Input
              value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
              placeholder="MIT"
            />
          </div>
          <div>
            <Label>Degree</Label>
            <Input
              value={form.degree}
              onChange={(e) => setForm({ ...form, degree: e.target.value })}
              placeholder="Bachelor of Science"
            />
          </div>
          <div>
            <Label>Field of Study</Label>
            <Input
              value={form.fieldOfStudy}
              onChange={(e) => setForm({ ...form, fieldOfStudy: e.target.value })}
              placeholder="Computer Science"
            />
          </div>
          <div>
            <Label>GPA</Label>
            <Input
              value={form.gpa}
              onChange={(e) => setForm({ ...form, gpa: e.target.value })}
              placeholder="3.8 / 4.0"
            />
          </div>
          <div>
            <Label>Start Year</Label>
            <Input
              value={form.startYear}
              onChange={(e) => setForm({ ...form, startYear: e.target.value })}
              placeholder="2016"
              type="number"
              min={1950}
              max={2040}
            />
          </div>
          <div>
            <Label>End Year</Label>
            <Input
              value={form.endYear}
              onChange={(e) => setForm({ ...form, endYear: e.target.value })}
              placeholder="Leave blank if current"
              type="number"
              min={1950}
              max={2040}
            />
          </div>
        </div>
        <div>
          <Label>Honors</Label>
          <Input
            value={form.honors}
            onChange={(e) => setForm({ ...form, honors: e.target.value })}
            placeholder="Magna Cum Laude"
          />
        </div>
        <div>
          <Label>Activities (comma-separated)</Label>
          <Input
            value={form.activities}
            onChange={(e) => setForm({ ...form, activities: e.target.value })}
            placeholder="Robotics Club, Debate Team"
          />
        </div>
        <div>
          <Label>Skills (comma-separated)</Label>
          <Input
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            placeholder="Python, Machine Learning, Statistics"
          />
        </div>
        <div>
          <Label>Relevant Coursework</Label>
          <Textarea
            value={form.relevantCoursework}
            onChange={(e) => setForm({ ...form, relevantCoursework: e.target.value })}
            placeholder="Algorithms, Operating Systems, Distributed Systems"
            rows={2}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={onSave} disabled={saving} size="sm">
            {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
            Save
          </Button>
          <Button onClick={cancelEdit} variant="outline" size="sm" disabled={saving}>
            <X className="mr-1.5 h-3.5 w-3.5" /> Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCertForm = (onSave: () => Promise<void>) => (
    <Card className="border-primary/30 bg-primary/5 sm:col-span-2">
      <CardContent className="space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Certificate Name</Label>
            <Input
              value={certForm.name}
              onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
              placeholder="AWS Solutions Architect"
            />
          </div>
          <div>
            <Label>Issuer</Label>
            <Input
              value={certForm.issuer}
              onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
              placeholder="Amazon Web Services"
            />
          </div>
          <div>
            <Label>Issue Date</Label>
            <Input
              value={certForm.issueDate}
              onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
              placeholder="Mar 2024"
            />
          </div>
          <div>
            <Label>Expiry Date</Label>
            <Input
              value={certForm.expiryDate}
              onChange={(e) => setCertForm({ ...certForm, expiryDate: e.target.value })}
              placeholder="Mar 2027 (or leave blank)"
            />
          </div>
          <div>
            <Label>Credential ID</Label>
            <Input
              value={certForm.credentialId}
              onChange={(e) => setCertForm({ ...certForm, credentialId: e.target.value })}
              placeholder="ABC-123-XYZ"
            />
          </div>
          <div>
            <Label>Credential URL</Label>
            <Input
              value={certForm.credentialUrl}
              onChange={(e) => setCertForm({ ...certForm, credentialUrl: e.target.value })}
              placeholder="https://..."
              type="url"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onSave} disabled={savingCert} size="sm">
            {savingCert ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
            Save
          </Button>
          <Button onClick={cancelCertEdit} variant="outline" size="sm" disabled={savingCert}>
            <X className="mr-1.5 h-3.5 w-3.5" /> Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const sorted = entries ? [...entries].sort((a, b) => a.order - b.order) : [];
  const sortedCerts = certificates ? [...certificates].sort((a, b) => a.order - b.order) : [];

  return (
    <div className="space-y-10">
      {/* Education Entries */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Education</h1>
            <p className="mt-1.5 text-base text-muted-foreground">
              Degrees, certifications, and courses.
            </p>
          </div>
          {!adding && !editingId && (
            <Button
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

        {adding && <div className="sm:col-span-2">{renderForm(saveNew)}</div>}

        {sorted.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {sorted.map((entry) =>
              editingId === entry._id ? (
                <div key={entry._id} className="sm:col-span-2">{renderForm(saveEdit)}</div>
              ) : (
                <Card key={entry._id} className="card-hover">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold leading-tight">{entry.institution}</h3>
                          <p className="text-sm text-muted-foreground">
                            {entry.degree}
                            {entry.fieldOfStudy && ` — ${entry.fieldOfStudy}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          onClick={() => startEdit(entry)}
                          title="Edit"
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry._id)}
                          title="Delete"
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2.5 text-xs text-muted-foreground">
                      {entry.startYear} — {entry.endYear ?? "Present"}
                    </p>
                    {entry.gpa && (
                      <p className="mt-0.5 text-xs text-muted-foreground">GPA: {entry.gpa}</p>
                    )}
                    {entry.honors && (
                      <p className="mt-0.5 text-xs italic text-muted-foreground">{entry.honors}</p>
                    )}
                    {entry.activities && entry.activities.length > 0 && (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {entry.activities.join(" · ")}
                      </p>
                    )}
                    {entry.skills && entry.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {entry.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {entry.relevantCoursework && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Coursework: </span>
                        {entry.relevantCoursework}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            )}
          </div>
        ) : (
          !adding && (
            <EmptyState
              icon={GraduationCap}
              title="No education entries yet"
              description={
                <>
                  Add your degrees, certifications, and coursework — or upload a résumé on the{" "}
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
                  Add first entry
                </button>
              }
            />
          )
        )}
      </div>

      {/* Certificates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Certificates</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Professional certifications and credentials.
            </p>
          </div>
          {!addingCert && !editingCertId && (
            <Button
              onClick={() => {
                setAddingCert(true);
                setEditingCertId(null);
                setCertForm(emptyCertForm);
              }}
              size="sm"
              variant="outline"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Certificate
            </Button>
          )}
        </div>

        {addingCert && <div className="grid gap-4 sm:grid-cols-2">{renderCertForm(saveCertNew)}</div>}

        {sortedCerts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {sortedCerts.map((cert) =>
              editingCertId === cert._id ? (
                <div key={cert._id} className="sm:col-span-2">{renderCertForm(saveCertEdit)}</div>
              ) : (
                <Card key={cert._id} className="card-hover">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold leading-tight">{cert.name}</h3>
                          <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View credential"
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => startEditCert(cert)}
                          title="Edit"
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCert(cert._id)}
                          title="Delete"
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {(cert.issueDate || cert.expiryDate) && (
                      <p className="mt-2.5 text-xs text-muted-foreground">
                        {cert.issueDate ?? "—"}
                        {cert.expiryDate && ` → ${cert.expiryDate}`}
                      </p>
                    )}
                    {cert.credentialId && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        ID: {cert.credentialId}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            )}
          </div>
        ) : (
          !addingCert && (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Award className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">No certificates yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Add your AWS, Google, or other professional credentials.</p>
              <button
                onClick={() => {
                  setAddingCert(true);
                  setCertForm(emptyCertForm);
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Add certificate
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

