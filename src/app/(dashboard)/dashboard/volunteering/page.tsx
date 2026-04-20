"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, X, Heart } from "lucide-react";
import { toast } from "sonner";
import { Id } from "../../../../../convex/_generated/dataModel";
import { ImageUploader } from "@/components/image-uploader";

export default function VolunteeringPage() {
  const entries = useQuery(api.volunteering.getSelfEntries);
  const createEntry = useMutation(api.volunteering.createSelf);
  const updateEntry = useMutation(api.volunteering.updateSelf);
  const removeEntry = useMutation(api.volunteering.removeSelf);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<Id<"volunteeringEntries"> | null>(null);
  const [form, setForm] = useState({
    organization: "",
    role: "",
    cause: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  function resetForm() {
    setForm({ organization: "", role: "", cause: "", startDate: "", endDate: "", description: "" });
  }

  async function handleCreate() {
    if (!form.organization.trim() || !form.role.trim() || !form.startDate) {
      toast.error("Organization, role, and start date are required");
      return;
    }
    try {
      await createEntry({
        organization: form.organization,
        role: form.role,
        cause: form.cause || undefined,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        description: form.description || undefined,
        order: entries?.length ?? 0,
      });
      resetForm();
      setIsAdding(false);
      toast.success("Volunteering entry added");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add entry");
    }
  }

  async function handleUpdate(id: Id<"volunteeringEntries">) {
    try {
      await updateEntry({
        id,
        organization: form.organization,
        role: form.role,
        cause: form.cause || undefined,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        description: form.description || undefined,
      });
      setEditingId(null);
      toast.success("Entry updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  }

  async function handleDelete(id: Id<"volunteeringEntries">) {
    try {
      await removeEntry({ id });
      toast.success("Entry removed");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    }
  }

  function startEdit(entry: NonNullable<typeof entries>[number]) {
    setEditingId(entry._id);
    setForm({
      organization: entry.organization,
      role: entry.role,
      cause: entry.cause ?? "",
      startDate: entry.startDate,
      endDate: entry.endDate ?? "",
      description: entry.description ?? "",
    });
  }

  function renderForm(onSubmit: () => void, submitLabel: string) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vol-org">Organization *</Label>
            <Input
              id="vol-org"
              placeholder="e.g. Code for America"
              value={form.organization}
              onChange={(e) => setForm({ ...form, organization: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="vol-role">Your Role *</Label>
            <Input
              id="vol-role"
              placeholder="e.g. Mentor"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="vol-cause">Cause</Label>
            <Input
              id="vol-cause"
              placeholder="e.g. Education"
              value={form.cause}
              onChange={(e) => setForm({ ...form, cause: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="vol-start">Start Date *</Label>
            <Input
              id="vol-start"
              type="month"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="vol-end">End Date</Label>
            <Input
              id="vol-end"
              type="month"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="vol-desc">Description</Label>
          <Textarea
            id="vol-desc"
            placeholder="Describe what you did..."
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={onSubmit}>{submitLabel}</Button>
          <Button
            variant="ghost"
            onClick={() => { setIsAdding(false); setEditingId(null); resetForm(); }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Volunteering</h1>
          <p className="text-muted-foreground">
            Highlight your community involvement and volunteer experience.
          </p>
        </div>
        <Button data-tour="volunteering-add" onClick={() => { setIsAdding(true); setEditingId(null); resetForm(); }} disabled={isAdding}>
          <Plus className="mr-2 h-4 w-4" /> Add Entry
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Volunteering Entry</CardTitle>
          </CardHeader>
          <CardContent>
            {renderForm(handleCreate, "Save Entry")}
          </CardContent>
        </Card>
      )}

      {(entries?.length ?? 0) === 0 && !isAdding && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Heart className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">No volunteering entries yet.</p>
            <Button variant="outline" onClick={() => setIsAdding(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add your first entry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {entries?.map((entry) => (
          <Card key={entry._id}>
            <CardContent className="py-4 px-5">
              {editingId === entry._id ? (
                renderForm(() => handleUpdate(entry._id), "Update")
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <ImageUploader
                      imageUrl={entry.imageUrl ?? null}
                      generateUploadUrlRef={api.volunteering.generateImageUploadUrl}
                      updateImageRef={api.volunteering.updateImage}
                      removeImageRef={api.volunteering.removeImage}
                      updateArgs={{ id: entry._id }}
                      removeArgs={{ id: entry._id }}
                    />
                    <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{entry.role}</span>
                      <span className="text-muted-foreground">at</span>
                      <span className="font-medium">{entry.organization}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{entry.startDate}</span>
                      <span>&mdash;</span>
                      <span>{entry.endDate ?? "Present"}</span>
                      {entry.cause && (
                        <Badge variant="secondary" className="text-xs">{entry.cause}</Badge>
                      )}
                    </div>
                    {entry.description && (
                      <p className="text-sm text-muted-foreground mt-2">{entry.description}</p>
                    )}
                  </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => startEdit(entry)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleDelete(entry._id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
