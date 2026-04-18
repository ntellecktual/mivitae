"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Id } from "../../../../../convex/_generated/dataModel";

const SKILL_CATEGORIES = [
  // Professional
  "Leadership",
  "Communication",
  "Project Management",
  "Strategy",
  "Analytics",
  // Technology
  "Languages",
  "Frameworks",
  "Tools",
  "Databases",
  "Cloud",
  // Creative
  "Design",
  // Business
  "Sales & Marketing",
  "Finance & Accounting",
  "Operations",
  "Human Resources",
  // Industry-Specific
  "Healthcare",
  "Education",
  "Legal",
  "Other",
];

export default function SkillsPage() {
  const skills = useQuery(api.skills.getSelfSkills);
  const createSkill = useMutation(api.skills.createSelf);
  const updateSkill = useMutation(api.skills.updateSelf);
  const removeSkill = useMutation(api.skills.removeSelf);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<Id<"skills"> | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "Languages",
    proficiency: 3,
    yearsOfExperience: undefined as number | undefined,
  });

  async function handleCreate() {
    if (!form.name.trim()) {
      toast.error("Skill name is required");
      return;
    }
    try {
      await createSkill({
        name: form.name.trim(),
        category: form.category,
        proficiency: form.proficiency,
        yearsOfExperience: form.yearsOfExperience,
        order: skills?.length ?? 0,
      });
      setForm({ name: "", category: "Languages", proficiency: 3, yearsOfExperience: undefined });
      setIsAdding(false);
      toast.success("Skill added");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add skill");
    }
  }

  async function handleUpdate(id: Id<"skills">) {
    try {
      await updateSkill({
        id,
        name: form.name.trim(),
        category: form.category,
        proficiency: form.proficiency,
        yearsOfExperience: form.yearsOfExperience,
      });
      setEditingId(null);
      toast.success("Skill updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  }

  async function handleDelete(id: Id<"skills">) {
    try {
      await removeSkill({ id });
      toast.success("Skill removed");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    }
  }

  function startEdit(skill: NonNullable<typeof skills>[number]) {
    setEditingId(skill._id);
    setForm({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency ?? 3,
      yearsOfExperience: skill.yearsOfExperience,
    });
  }

  // Group skills by category
  const grouped: Record<string, NonNullable<typeof skills>> = {};
  for (const skill of skills ?? []) {
    if (!grouped[skill.category]) grouped[skill.category] = [];
    grouped[skill.category].push(skill);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Skills</h1>
          <p className="text-muted-foreground">
            Showcase your technical and soft skills on your public portfolio.
          </p>
        </div>
        <Button onClick={() => { setIsAdding(true); setEditingId(null); }} disabled={isAdding}>
          <Plus className="mr-2 h-4 w-4" /> Add Skill
        </Button>
      </div>

      {/* Add form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Skill</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="skill-name">Name</Label>
                <Input
                  id="skill-name"
                  placeholder="e.g. TypeScript"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="skill-category">Category</Label>
                <select
                  id="skill-category"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {SKILL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Proficiency (1-5)</Label>
                <div className="flex items-center gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setForm({ ...form, proficiency: level })}
                      className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${
                        form.proficiency >= level
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="skill-years">Years of experience</Label>
                <Input
                  id="skill-years"
                  type="number"
                  min={0}
                  max={50}
                  placeholder="Optional"
                  value={form.yearsOfExperience ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      yearsOfExperience: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Save Skill</Button>
              <Button variant="ghost" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grouped skills display */}
      {Object.keys(grouped).length === 0 && !isAdding && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">No skills added yet.</p>
            <Button variant="outline" onClick={() => setIsAdding(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add your first skill
            </Button>
          </CardContent>
        </Card>
      )}

      {Object.entries(grouped).map(([category, categorySkills]) => (
        <div key={category} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {category}
          </h2>
          <div className="grid gap-2">
            {categorySkills.map((skill) => (
              <Card key={skill._id}>
                <CardContent className="flex items-center justify-between py-3 px-4">
                  {editingId === skill._id ? (
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                        >
                          {SKILL_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => setForm({ ...form, proficiency: level })}
                              className={`h-6 w-6 rounded text-xs font-medium transition-colors ${
                                form.proficiency >= level
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                        <Button size="sm" onClick={() => handleUpdate(skill._id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{skill.name}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-2 w-5 rounded-sm ${
                                (skill.proficiency ?? 0) >= level
                                  ? "bg-primary"
                                  : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                        {skill.yearsOfExperience != null && (
                          <Badge variant="secondary" className="text-xs">
                            {skill.yearsOfExperience}y
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => startEdit(skill)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => handleDelete(skill._id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
