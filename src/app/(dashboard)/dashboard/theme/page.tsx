"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import PortfolioRenderer from "@/components/portfolio/portfolio-renderer";
import {
  type ThemeConfig,
  type BgType,
  type HeroLayout,
  type CardStyle,
  type PatternType,
  type ContainerWidth,
  THEME_PRESETS,
  HEADING_FONTS,
  BODY_FONTS,
  resolveTheme,
} from "@/lib/theme";
import { cn } from "@/lib/utils";
import { ExternalLink, RotateCcw, Check, ImageIcon, Palette, Type, LayoutGrid, Layers, Code2, Sparkles } from "lucide-react";
import { toast } from "sonner";

// ── Sub-components ────────────────────────────────────────────────────────────

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2 rounded-xl border bg-muted/40 px-2 py-1.5">
        <div
          className="relative h-8 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-border/60"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${label} color picker`}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
        <span className="font-mono text-xs text-muted-foreground">#</span>
        <input
          type="text"
          value={value.replace(/^#/, "")}
          onChange={(e) => {
            const v = `#${e.target.value}`;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
          }}
          maxLength={6}
          aria-label={`${label} hex value`}
          className="min-w-0 flex-1 bg-transparent font-mono text-xs outline-none"
        />
      </div>
    </div>
  );
}

function ToggleGroup({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex rounded-xl bg-muted p-1 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all duration-150",
            value === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        className={cn(
          "inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </span>
    </label>
  );
}

// ── Tab panels ────────────────────────────────────────────────────────────────

function BackgroundTab({
  theme,
  update,
}: {
  theme: ThemeConfig;
  update: (p: Partial<ThemeConfig>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Background Type</p>
        <p className="mb-2 mt-0.5 text-xs text-muted-foreground">Choose how your portfolio background looks.</p>
        <ToggleGroup
          options={[
            { label: "Solid", value: "solid" },
            { label: "Gradient", value: "gradient" },
            { label: "Pattern", value: "pattern" },
          ]}
          value={theme.bgType}
          onChange={(v) => update({ bgType: v as BgType })}
        />
      </div>

      <Separator />

      <div className="space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Colors</p>
        <ColorRow
          label={theme.bgType === "gradient" ? "Gradient Start" : "Background Color"}
          value={theme.bgPrimary}
          onChange={(c) => update({ bgPrimary: c })}
        />

        {theme.bgType === "gradient" && (
          <>
            <ColorRow
              label="Gradient End"
              value={theme.bgSecondary}
              onChange={(c) => update({ bgSecondary: c })}
            />
            <div>
              <Label className="mb-1.5 block text-xs font-medium">
                Angle: {theme.bgAngle}°
              </Label>
              <input
                type="range"
                min={0}
                max={360}
                value={theme.bgAngle}
                onChange={(e) => update({ bgAngle: Number(e.target.value) })}
                className="w-full accent-primary"
              />
              <div
                className="mt-2 h-8 w-full rounded-md border"
                style={{
                  background: `linear-gradient(${theme.bgAngle}deg, ${theme.bgPrimary}, ${theme.bgSecondary})`,
                }}
              />
            </div>
          </>
        )}

        {theme.bgType === "pattern" && (
          <>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Pattern Type</Label>
              <ToggleGroup
                options={[
                  { label: "Dots", value: "dots" },
                  { label: "Grid", value: "grid" },
                  { label: "Lines", value: "lines" },
                ]}
                value={theme.patternType === "none" ? "dots" : theme.patternType}
                onChange={(v) => update({ patternType: v as PatternType })}
              />
            </div>
            <ColorRow
              label="Pattern Color"
              value={theme.patternColor}
              onChange={(c) => update({ patternColor: c })}
            />
          </>
        )}
      </div>
    </div>
  );
}

function ColorsTab({
  theme,
  update,
}: {
  theme: ThemeConfig;
  update: (p: Partial<ThemeConfig>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Brand</p>
        <p className="mb-3 mt-0.5 text-xs text-muted-foreground">Your portfolio&apos;s signature accent color.</p>
        <ColorRow
          label="Accent Color"
          value={theme.accentColor}
          onChange={(c) => update({ accentColor: c })}
        />
      </div>
      <Separator />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Text</p>
        <p className="mb-3 mt-0.5 text-xs text-muted-foreground">Color for headings and body copy.</p>
        <div className="space-y-3">
          <ColorRow
            label="Text Color"
            value={theme.textColor}
            onChange={(c) => update({ textColor: c })}
          />
          <ColorRow
            label="Subtext Color"
            value={theme.subtextColor}
            onChange={(c) => update({ subtextColor: c })}
          />
        </div>
      </div>
      <Separator />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Cards</p>
        <p className="mb-3 mt-0.5 text-xs text-muted-foreground">Background and border for content cards.</p>
        <div className="space-y-3">
          <ColorRow
            label="Card Background"
            value={theme.cardBg}
            onChange={(c) => update({ cardBg: c })}
          />
          <ColorRow
            label="Card Border"
            value={theme.cardBorder}
            onChange={(c) => update({ cardBorder: c })}
          />
        </div>
      </div>
    </div>
  );
}

function TypographyTab({
  theme,
  update,
}: {
  theme: ThemeConfig;
  update: (p: Partial<ThemeConfig>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Heading Font</p>
        <p className="mb-2 mt-0.5 text-xs text-muted-foreground">Used for your name, section titles, and headings.</p>
        <div className="overflow-hidden rounded-xl border bg-muted/40">
          <select
            title="Heading font"
            aria-label="Heading font"
            value={theme.headingFont}
            onChange={(e) => update({ headingFont: e.target.value })}
            className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
          >
            {HEADING_FONTS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 rounded-xl border bg-muted/20 px-4 py-3">
          <p
            className="text-xl font-bold leading-snug"
            style={{ fontFamily: `'${theme.headingFont}', sans-serif` }}
          >
            Portfolio &amp; Headings
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Heading preview</p>
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Body Font</p>
        <p className="mb-2 mt-0.5 text-xs text-muted-foreground">Used for descriptions, work history, and body copy.</p>
        <div className="overflow-hidden rounded-xl border bg-muted/40">
          <select
            title="Body font"
            aria-label="Body font"
            value={theme.bodyFont}
            onChange={(e) => update({ bodyFont: e.target.value })}
            className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
          >
            {BODY_FONTS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 rounded-xl border bg-muted/20 px-4 py-3">
          <p
            className="text-sm leading-relaxed text-muted-foreground"
            style={{ fontFamily: `'${theme.bodyFont}', sans-serif` }}
          >
            Body text, descriptions, and metadata appear in this font.
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Body preview</p>
        </div>
      </div>

      <Separator />

      <p className="text-[11px] text-muted-foreground">
        Fonts load from Google Fonts on your live portfolio — system fallbacks shown above.
      </p>
    </div>
  );
}

function LayoutTab({
  theme,
  update,
}: {
  theme: ThemeConfig;
  update: (p: Partial<ThemeConfig>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Hero Layout</p>
        <p className="mb-2 mt-0.5 text-xs text-muted-foreground">How your intro section is aligned.</p>
        <ToggleGroup
          options={[
            { label: "Centered", value: "centered" },
            { label: "Left", value: "left" },
          ]}
          value={theme.heroLayout}
          onChange={(v) => update({ heroLayout: v as HeroLayout })}
        />
      </div>

      <Separator />

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Card Style</p>
        <p className="mb-3 mt-0.5 text-xs text-muted-foreground">Visual style applied to all content cards.</p>
        <div className="grid grid-cols-1 gap-1.5">
          {(
            [
              { value: "default", label: "Default", desc: "Subtle background with soft border" },
              { value: "glass", label: "Glass", desc: "Frosted glass with blur effect" },
              { value: "bordered", label: "Bordered", desc: "Clean lines, strong border" },
              { value: "flat", label: "Flat", desc: "No border, minimal shadow" },
              { value: "elevated", label: "Elevated", desc: "Raised with prominent shadow" },
            ] satisfies { value: CardStyle; label: string; desc: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ cardStyle: opt.value })}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
                theme.cardStyle === opt.value
                  ? "border-primary bg-primary/8 ring-1 ring-primary/20"
                  : "border-border hover:border-foreground/20 hover:bg-muted/50"
              )}
            >
              <div className={cn(
                "flex h-8 w-10 shrink-0 items-center justify-center rounded-lg border text-[10px] font-bold",
                theme.cardStyle === opt.value
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-border bg-muted text-muted-foreground"
              )}>
                Aa
              </div>
              <div className="min-w-0">
                <p className={cn(
                  "text-xs font-semibold",
                  theme.cardStyle === opt.value ? "text-primary" : "text-foreground"
                )}>{opt.label}</p>
                <p className="truncate text-[10px] text-muted-foreground">{opt.desc}</p>
              </div>
              {theme.cardStyle === opt.value && (
                <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Content Width</p>
        <p className="mb-2 mt-0.5 text-xs text-muted-foreground">How wide your portfolio content stretches.</p>
        <ToggleGroup
          options={[
            { label: "Narrow", value: "narrow" },
            { label: "Default", value: "default" },
            { label: "Wide", value: "wide" },
          ]}
          value={theme.containerWidth}
          onChange={(v) => update({ containerWidth: v as ContainerWidth })}
        />
      </div>
    </div>
  );
}

function SectionsTab({
  theme,
  update,
}: {
  theme: ThemeConfig;
  update: (p: Partial<ThemeConfig>) => void;
}) {
  const items: { key: keyof ThemeConfig; label: string; description: string }[] = [
    {
      key: "showExperience",
      label: "Experience",
      description: "Work history and roles",
    },
    {
      key: "showEducation",
      label: "Education",
      description: "Degrees and certifications",
    },
    {
      key: "showDemos",
      label: "Demo Cards",
      description: "Showcased projects and demos",
    },
  ];

  return (
    <div className="space-y-1">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Visible Sections</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Toggle which sections appear on your public portfolio.
        </p>
      </div>
      <div className="space-y-2">
        {items.map(({ key, label, description }) => (
          <div
            key={key}
            className={cn(
              "flex items-center justify-between rounded-xl border px-4 py-3 transition-colors",
              Boolean(theme[key]) ? "border-primary/30 bg-primary/5" : "border-border bg-card hover:bg-muted/40"
            )}
          >
            <div>
              <p className={cn("text-sm font-medium", Boolean(theme[key]) && "text-primary")}>{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <ToggleSwitch
              checked={Boolean(theme[key])}
              onChange={(v) => update({ [key]: v })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function AdvancedTab({
  theme,
  update,
}: {
  theme: ThemeConfig;
  update: (p: Partial<ThemeConfig>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Custom CSS</p>
        <p className="mb-2 mt-0.5 text-xs text-muted-foreground">
          Applied only to your public portfolio. Useful for fine-grained
          typography, spacing, or animation tweaks.
        </p>
        <Textarea
          value={theme.customCss ?? ""}
          onChange={(e) => update({ customCss: e.target.value })}
          placeholder={`/* Examples:\nh1 { letter-spacing: -0.04em; }\na { text-decoration: underline; }\n*/`}
          className="font-mono text-xs"
          rows={14}
        />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ThemePage() {
  const profile = useQuery(api.profiles.getSelf);
  const sections = useQuery(
    api.portfolioSections.getByUserId,
    profile ? { userId: profile.userId } : "skip"
  );
  const education = useQuery(
    api.educationEntries.getByUserId,
    profile ? { userId: profile.userId } : "skip"
  );
  const demos = useQuery(
    api.demos.getByUserId,
    profile ? { userId: profile.userId } : "skip"
  );
  const saveThemeMutation = useMutation(api.profiles.saveTheme);

  // Local theme state — null until user makes a change (then reads from profile)
  const [localTheme, setLocalTheme] = useState<ThemeConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // The effective theme shown in the editor and preview
  const resolvedTheme: ThemeConfig =
    localTheme ??
    (profile ? resolveTheme(profile.themeConfig as ThemeConfig | undefined, profile.theme) : {
      bgType: "solid",
      bgPrimary: "#ffffff",
      bgSecondary: "#f0f4ff",
      bgAngle: 135,
      patternType: "none",
      patternColor: "#6366f1",
      accentColor: "#6366f1",
      textColor: "#111827",
      subtextColor: "#6b7280",
      cardBg: "#f9fafb",
      cardBorder: "#e5e7eb",
      headingFont: "Inter",
      bodyFont: "Inter",
      heroLayout: "centered",
      cardStyle: "default",
      containerWidth: "default",
      showExperience: true,
      showEducation: true,
      showDemos: true,
      showSkills: true,
      showVolunteering: true,
    });

  const update = useCallback(
    (patch: Partial<ThemeConfig>) => {
      setLocalTheme((prev) => ({ ...(prev ?? resolvedTheme), ...patch }));
      setSavedAt(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(resolvedTheme)]
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveThemeMutation({ themeConfig: resolvedTheme });
      setSavedAt(Date.now());
      toast.success("Theme saved");
    } catch (err) {
      console.error("Failed to save theme:", err);
      toast.error("Failed to save theme");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (profile) {
      setLocalTheme(resolveTheme(profile.themeConfig as ThemeConfig | undefined, profile.theme));
    }
  };

  const isDirty = localTheme !== null && savedAt === null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Theme Studio</h1>
          <p className="text-sm text-muted-foreground">
            Customize your portfolio&apos;s visual style with live preview
          </p>
        </div>
        <div className="flex items-center gap-2">
          {profile?.slug && (
            <a
              href={`/u/${profile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              View Live
            </a>
          )}
          {isDirty && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Reset
            </Button>
          )}
          {isDirty && (
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" aria-hidden="true" />
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className={cn(!isDirty && savedAt && "text-green-600")}
          >
            {saving ? (
              "Saving..."
            ) : savedAt && !isDirty ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5" /> Saved
              </>
            ) : (
              "Save Theme"
            )}
          </Button>
        </div>
      </div>

      {/* Preset Gallery */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Start from a preset</p>
            <p className="text-xs text-muted-foreground">Pick a style, then customize it to make it yours.</p>
          </div>
          <Sparkles className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5">
          {THEME_PRESETS.map((preset) => {
            const bg =
              preset.config.bgType === "gradient"
                ? `linear-gradient(${preset.config.bgAngle}deg, ${preset.config.bgPrimary}, ${preset.config.bgSecondary})`
                : preset.config.bgPrimary;
            const isActive =
              resolvedTheme.bgPrimary === preset.config.bgPrimary &&
              resolvedTheme.accentColor === preset.config.accentColor;
            return (
              <button
                key={preset.id}
                onClick={() => { setLocalTheme(preset.config); setSavedAt(null); }}
                title={preset.description}
                className={cn(
                  "group relative overflow-hidden rounded-xl border-2 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "border-primary shadow-md ring-2 ring-primary/20"
                    : "border-border hover:border-primary/60 hover:shadow-md"
                )}
              >
                {/* Swatch */}
                <div className="relative h-16" style={{ background: bg }}>
                  {/* Accent bar */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1"
                    style={{ backgroundColor: preset.config.accentColor }}
                  />
                  {/* Aa sample */}
                  <div className="flex h-full items-center justify-center">
                    <span
                      className="text-lg font-bold leading-none"
                      style={{
                        color: preset.config.textColor,
                        fontFamily: `'${preset.config.headingFont}', sans-serif`,
                      }}
                    >
                      Aa
                    </span>
                  </div>
                  {isActive && (
                    <div className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
                {/* Name label */}
                <div
                  className="px-2 py-1.5"
                  style={{ backgroundColor: preset.config.cardBg }}
                >
                  <p
                    className="truncate text-[11px] font-semibold"
                    style={{ color: preset.config.textColor }}
                  >
                    {preset.name}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left: Controls */}
        <div className="w-full lg:w-[380px] shrink-0 rounded-xl border bg-card">
          <Tabs defaultValue="background" className="gap-0">
            <TabsList className="grid w-full grid-cols-6 rounded-b-none border-b bg-transparent p-0 !h-auto">
              {[
                { value: "background", label: "BG", icon: ImageIcon },
                { value: "colors", label: "Colors", icon: Palette },
                { value: "typography", label: "Fonts", icon: Type },
                { value: "layout", label: "Layout", icon: LayoutGrid },
                { value: "sections", label: "Sec.", icon: Layers },
                { value: "advanced", label: "CSS", icon: Code2 },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="min-w-0 flex-col gap-1 rounded-none first:rounded-tl-xl last:rounded-tr-xl data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none py-2.5"
                >
                  <tab.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-[10px]">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="p-5">
              <TabsContent value="background">
                <BackgroundTab theme={resolvedTheme} update={update} />
              </TabsContent>
              <TabsContent value="colors">
                <ColorsTab theme={resolvedTheme} update={update} />
              </TabsContent>
              <TabsContent value="typography">
                <TypographyTab theme={resolvedTheme} update={update} />
              </TabsContent>
              <TabsContent value="layout">
                <LayoutTab theme={resolvedTheme} update={update} />
              </TabsContent>
              <TabsContent value="sections">
                <SectionsTab theme={resolvedTheme} update={update} />
              </TabsContent>
              <TabsContent value="advanced">
                <AdvancedTab theme={resolvedTheme} update={update} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right: Live Preview */}
        <div className="hidden lg:block flex-1 sticky top-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Live Preview</p>
            <p className="text-xs text-muted-foreground">
              Scaled view of your public portfolio
            </p>
          </div>
          <div
            className="overflow-hidden rounded-xl border shadow-sm"
            style={{ height: 620 }}
          >
            {profile ? (
              <div
                style={{
                  width: "200%",
                  transform: "scale(0.5)",
                  transformOrigin: "0 0",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                <PortfolioRenderer
                  profile={profile}
                  sections={sections ?? []}
                  education={education ?? []}
                  demos={demos ?? []}
                  themeOverride={resolvedTheme}
                  preview
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Preview hint */}
        <div className="lg:hidden rounded-xl border bg-muted/50 p-6 text-center">
          <p className="text-sm font-medium">Preview not available on small screens</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Open your public portfolio link to see changes live.
          </p>
        </div>
      </div>
    </div>
  );
}
