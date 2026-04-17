# Dashboard Mutation Audit Report

Generated for 7 dashboard page files.

**Global finding: `toast` from "sonner" is NOT imported in ANY of these 7 files.**

---

## 1. `src/app/(dashboard)/dashboard/team/page.tsx`

**Total lines:** ~415  
**Toast imported:** NO

### Mutation declarations
| Line | Declaration |
|------|------------|
| 99   | `const createTeam = useMutation(api.teams.createTeam)` |
| 232  | `const removeMember = useMutation(api.teams.removeMember)` |
| 309  | `const invite = useMutation(api.teams.inviteMember)` |
| 389  | `const update = useMutation(api.teams.updateTeam)` |

### Mutation calls

#### a) `await createTeam(...)` — Line 113 | **Action: "Create team"**
- **Has try/catch:** YES (try L112, catch L119)
- **Pattern:** try/catch/finally — error shown in inline `<div>` via `setError(err.message)`
```
L108: async function handleSubmit(e: React.FormEvent) {
L109:   e.preventDefault();
L110:   setError(null);
L111:   setLoading(true);
L112:   try {
L113:     await createTeam({
L114:       name: form.name.trim(),
L115:       slug: form.slug.trim() || autoSlug(form.name),
L116:       description: form.description || undefined,
L117:       website: form.website || undefined,
L118:     });
L119:   } catch (err: any) {
L120:     setError(err.message ?? "Something went wrong");
L121:   } finally {
L122:     setLoading(false);
L123:   }
```

#### b) `removeMember(...)` — Line 294 | **Action: "Remove team member"**
- **Has try/catch:** NO
- **Has await:** NO (fire-and-forget in onClick)
```
L292: {member.role !== "owner" && myRole === "owner" && (
L293:   <button
L294:     onClick={() =>
L295:       removeMember({ membershipId: member.membershipId as any })
L296:     }
```

#### c) `await invite(...)` — Line 321 | **Action: "Invite member"**
- **Has try/catch:** YES (try L320, catch L324)
- **Pattern:** try/catch/finally — error in inline `<p>`
```
L318: async function handleInvite(e: React.FormEvent) {
L319:   setError(null);
L320:   try {
L321:     await invite({ teamId, email: email.trim(), role });
L322:     setEmail("");
L323:     setOpen(false);
L324:   } catch (err: any) {
L325:     setError(err.message ?? "Something went wrong");
L326:   } finally {
L327:     setLoading(false);
L328:   }
```

#### d) `await update(...)` — Line 399 | **Action: "Save team settings"**
- **Has try/catch:** NO
- **Pattern:** bare await, no error handling at all
```
L396: async function handleSubmit(e: React.FormEvent) {
L397:   e.preventDefault();
L398:   await update({
L399:     teamId: team._id,
L400:     name: form.name || undefined,
L401:     description: form.description || undefined,
L402:     website: form.website || undefined,
L403:   });
L404:   setSaved(true);
L405:   setTimeout(() => setSaved(false), 2000);
```

---

## 2. `src/app/(dashboard)/dashboard/referrals/page.tsx`

**Total lines:** ~195  
**Toast imported:** NO

### Mutation declarations
| Line | Declaration |
|------|------------|
| 12   | `const ensureMyCode = useMutation(api.referrals.ensureMyCode)` |

### Mutation calls

#### a) `ensureMyCode({})` — Line 19 | **Action: "Ensure referral code exists"**
- **Has try/catch:** NO
- **Has await:** NO (fire-and-forget inside useEffect)
```
L16: useEffect(() => {
L17:   if (stats && !stats.code) {
L18:     ensureMyCode({});
L19:   }
L20: }, [stats, ensureMyCode]);
```

---

## 3. `src/app/(dashboard)/dashboard/profile/page.tsx`

**Total lines:** ~270  
**Toast imported:** NO

### Mutation declarations
| Line | Declaration |
|------|------------|
| 33   | `const upsertProfile = useMutation(api.profiles.upsertSelf)` |

### Mutation calls

#### a) `await upsertProfile(...)` — Line 90 | **Action: "Save profile"**
- **Has try/catch:** NO catch — only `try/finally`
- **Pattern:** try/finally — no error handling, just clears `saving` state
```
L87: const handleSave = async () => {
L88:   setSaving(true);
L89:   try {
L90:     await upsertProfile({
L91:       slug: slugInput || undefined,
L92:       headline: form.headline || undefined,
L93:       bio: form.bio || undefined,
L94:       location: form.location || undefined,
L95:       websiteUrl: form.websiteUrl || undefined,
L96:       linkedinUrl: form.linkedinUrl || undefined,
L97:       githubUrl: form.githubUrl || undefined,
L98:       isPublic: form.isPublic,
L99:       theme: form.theme || undefined,
L100:    });
L101:    setDirty(false);
L102:  } finally {
L103:    setSaving(false);
L104:  }
```

---

## 4. `src/app/(dashboard)/dashboard/portfolio/page.tsx`

**Total lines:** ~415  
**Toast imported:** NO

### Mutation declarations
| Line | Declaration |
|------|------------|
| 47   | `const createSection = useMutation(api.portfolioSections.createSelf)` |
| 48   | `const updateSection = useMutation(api.portfolioSections.updateSelf)` |
| 49   | `const removeSection = useMutation(api.portfolioSections.removeSelf)` |
| 50   | `const linkDemo = useMutation(api.portfolioSections.linkDemo)` |
| 51   | `const unlinkDemo = useMutation(api.portfolioSections.unlinkDemo)` |

### Mutation calls

#### a) `await updateSection(...)` — Line 90 | **Action: "Save edited work history entry"**
- **Has try/catch:** NO — bare await
```
L88: const saveEdit = async () => {
L89:   if (!editingId) return;
L90:   await updateSection({
...
L104:  });
L105:  cancelEdit();
```

#### b) `await createSection(...)` — Line 110 | **Action: "Create new work history entry"**
- **Has try/catch:** NO — bare await
```
L107: const saveNew = async () => {
L108:   await createSection({
...
L125:  });
L126:  cancelEdit();
```

#### c) `await removeSection(...)` — Line 130 | **Action: "Delete work history entry"**
- **Has try/catch:** NO — bare await
```
L128: const handleDelete = async (sectionId: string) => {
L129:   await removeSection({
L130:     sectionId: sectionId as Id<"portfolioSections">,
L131:   });
```

#### d) `unlinkDemo(...)` — Line 341 | **Action: "Unlink demo from section"**
- **Has try/catch:** NO
- **Has await:** NO (fire-and-forget in onClick)
```
L338: <button
L339:   onClick={() =>
L340:     unlinkDemo({
L341:       sectionId: section._id as Id<"portfolioSections">,
L342:       demoId: demoId as Id<"userDemos">,
L343:     })
L344:   }
```

#### e) `await linkDemo(...)` — Line 375 | **Action: "Link demo to section"**
- **Has try/catch:** NO — bare await in inline onClick
```
L372: onClick={async () => {
L373:   await linkDemo({
L374:     sectionId: section._id as Id<"portfolioSections">,
L375:     demoId: d._id as Id<"userDemos">,
L376:   });
L377:   setLinkingSectionId(null);
```

---

## 5. `src/app/(dashboard)/dashboard/education/page.tsx`

**Total lines:** ~280  
**Toast imported:** NO

### Mutation declarations
| Line | Declaration |
|------|------------|
| 43   | `const createEntry = useMutation(api.educationEntries.createSelf)` |
| 44   | `const updateEntry = useMutation(api.educationEntries.updateSelf)` |
| 45   | `const removeEntry = useMutation(api.educationEntries.removeSelf)` |

### Mutation calls

#### a) `await updateEntry(...)` — Line 84 | **Action: "Save edited education entry"**
- **Has try/catch:** NO — bare await
```
L82: const saveEdit = async () => {
L83:   if (!editingId) return;
L84:   await updateEntry({
...
L97:   });
L98:   cancelEdit();
```

#### b) `await createEntry(...)` — Line 102 | **Action: "Create new education entry"**
- **Has try/catch:** NO — bare await
```
L100: const saveNew = async () => {
L101:   await createEntry({
...
L115:   });
L116:   cancelEdit();
```

#### c) `await removeEntry(...)` — Line 120 | **Action: "Delete education entry"**
- **Has try/catch:** NO — bare await
```
L118: const handleDelete = async (entryId: string) => {
L119:   await removeEntry({ entryId: entryId as Id<"educationEntries"> });
L120: };
```

---

## 6. `src/app/(dashboard)/dashboard/demos/page.tsx`

**Total lines:** ~305  
**Toast imported:** NO

### Mutation declarations
| Line | Declaration |
|------|------------|
| 45   | `const createDemo = useMutation(api.demos.createSelf)` |
| 46   | `const updateDemo = useMutation(api.demos.updateSelf)` |
| 47   | `const removeDemo = useMutation(api.demos.removeSelf)` |

### Mutation calls

#### a) `await createDemo(...)` — Line 88 | **Action: "Create demo from template"**
- **Has try/catch:** NO — bare await
```
L85: const saveNew = async () => {
L86:   if (!selectedTemplateId) return;
L87:   await createDemo({
L88:     templateId: selectedTemplateId,
L89:     title: form.title,
L90:     description: form.description,
L91:     content: form.content,
L92:   });
L93:   cancelEdit();
```

#### b) `await updateDemo(...)` — Line 99 | **Action: "Save edited demo"**
- **Has try/catch:** NO — bare await
```
L96: const saveEdit = async () => {
L97:   if (!editingId) return;
L98:   await updateDemo({
L99:     demoId: editingId as Id<"userDemos">,
L100:    title: form.title,
L101:    description: form.description,
L102:    content: form.content,
L103:  });
L104:  cancelEdit();
```

#### c) `await updateDemo(...)` — Line 109 | **Action: "Toggle demo visibility"**
- **Has try/catch:** NO — bare await
```
L107: const toggleVisibility = async (demoId: string, current: boolean) => {
L108:   await updateDemo({
L109:     demoId: demoId as Id<"userDemos">,
L110:     isPublic: !current,
L111:   });
```

#### d) `await removeDemo(...)` — Line 116 | **Action: "Delete demo"**
- **Has try/catch:** NO — bare await
```
L114: const handleDelete = async (demoId: string) => {
L115:   await removeDemo({ demoId: demoId as Id<"userDemos"> });
L116: };
```

---

## 7. `src/app/(dashboard)/dashboard/analytics/page.tsx`

**Total lines:** ~265  
**Toast imported:** NO

### Mutation declarations
**NONE** — this is a read-only page (queries only).

### Mutation calls
**NONE**

---

## Summary Table

| File | Mutations | With try/catch | Bare await (no catch) | Fire-and-forget (no await) | Toast? |
|------|-----------|----------------|----------------------|---------------------------|--------|
| **team** | 4 | 2 (createTeam, invite) | 1 (updateTeam) | 1 (removeMember) | NO |
| **referrals** | 1 | 0 | 0 | 1 (ensureMyCode) | NO |
| **profile** | 1 | 0 (try/finally only) | 0 | 0 | NO |
| **portfolio** | 5 | 0 | 4 (create/update/remove/linkDemo) | 1 (unlinkDemo) | NO |
| **education** | 3 | 0 | 3 (create/update/remove) | 0 | NO |
| **demos** | 4 | 0 | 4 (create/updatex2/remove) | 0 | NO |
| **analytics** | 0 | — | — | — | NO |
| **TOTAL** | **18** | **2** | **12** | **3** | **0/7** |

## Key Observations

1. **0 of 7 files import `toast` from "sonner"** — no toast notifications anywhere in these pages.
2. **Only 2 of 18 mutation calls have proper try/catch** — both in `team/page.tsx` (createTeam + inviteMember), showing error via `setError()` state.
3. **`profile/page.tsx` has try/finally but NO catch** — errors from `upsertProfile` are completely swallowed.
4. **12 mutation calls are bare `await` with zero error handling** — if the mutation throws, the error propagates to the React error boundary with no user feedback.
5. **3 mutations are fire-and-forget (no await)** — `removeMember`, `unlinkDemo`, and `ensureMyCode` don't await the promise at all. Errors are silently lost.
6. **No success feedback** — apart from team settings' `setSaved(true)` timeout pattern, none of the mutations show success toasts. The user has no confirmation their action worked (beyond the UI reactively updating from the Convex subscription).
