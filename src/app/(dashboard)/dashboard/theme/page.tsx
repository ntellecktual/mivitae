"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import PortfolioRenderer from "@/components/portfolio/portfolio-renderer";
import {
  type ThemeConfig,
  type BgType,
  type HeroLayout,
  type CardStyle,
  type PatternType,
  type ContainerWidth,
  type AnimationStyle,
  type GradientType,
  type HoverEffect,
  type PageTransition,
  type NavVariant,
  type NavPosition,
  type NavIconStyle,
  type ButtonStyle,
  type ImageFilter,
  type SectionSpacing,
  type SocialIconStyle,
  type FontScale,
  type SplashStyle,
  type DarkModeConfig,
  type NavStyleConfig,
  type SplashScreenConfig,
  THEME_PRESETS,
  HEADING_FONTS,
  BODY_FONTS,
  CARD_TEMPLATES,
  HERO_LAYOUTS,
  resolveTheme,
} from "@/lib/theme";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Palette,
  Type,
  LayoutGrid,
  Layers,
  Code2,
  Sparkles,
  Check,
  Undo2,
  Redo2,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
  GripVertical,
  X,
  ChevronDown,
  ImageIcon,
  Wand2,
  Crown,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ArrowLeft,
  Menu,
  Zap,
  Paintbrush,
} from "lucide-react";
import { toast } from "sonner";

// ── Preset categories ─────────────────────────────────────────────────────

const PRESET_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "gradient", label: "Gradient" },
  { id: "warm", label: "Warm" },
  { id: "cool", label: "Cool" },
] as const;

function getPresetCategory(preset: (typeof THEME_PRESETS)[number]): string[] {
  const c = preset.config;
  const cats: string[] = ["all"];

  // Light vs dark
  const r = parseInt(c.bgPrimary.slice(1, 3), 16);
  const g = parseInt(c.bgPrimary.slice(3, 5), 16);
  const b = parseInt(c.bgPrimary.slice(5, 7), 16);
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  cats.push(luma > 128 ? "light" : "dark");

  if (c.bgType === "gradient") cats.push("gradient");

  // Warm vs cool based on accent color
  const ar = parseInt(c.accentColor.slice(1, 3), 16);
  const ab = parseInt(c.accentColor.slice(5, 7), 16);
  cats.push(ar > ab ? "warm" : "cool");

  return cats;
}

// ── Color swatch presets for quick-pick ───────────────────────────────────

const COLOR_SWATCHES = [
  "#6366f1", "#818cf8", "#8b5cf6", "#a855f7", "#c084fc",
  "#e879f9", "#ec4899", "#f43f5e", "#ef4444", "#f97316",
  "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#10b981",
  "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", "#cbd5e1",
  "#94a3b8", "#64748b", "#475569", "#334155", "#1e293b",
  "#0f172a", "#020617", "#000000", "#faf6f1", "#f4ede4",
];

// ── AI palette suggestions ───────────────────────────────────────────────

const AI_PALETTES = [
  {
    name: "Tech Startup",
    desc: "Clean & modern",
    accent: "#6366f1",
    bg: "#0f172a",
    text: "#f1f5f9",
    card: "#1e293b",
  },
  {
    name: "Creative Agency",
    desc: "Bold & expressive",
    accent: "#e879f9",
    bg: "#1a0533",
    text: "#f5f3ff",
    card: "#1e0a3a",
  },
  {
    name: "Finance",
    desc: "Trust & authority",
    accent: "#0ea5e9",
    bg: "#ffffff",
    text: "#111827",
    card: "#f8fafc",
  },
  {
    name: "Healthcare",
    desc: "Calm & reassuring",
    accent: "#10b981",
    bg: "#f0fdf4",
    text: "#14532d",
    card: "#ecfdf5",
  },
  {
    name: "Education",
    desc: "Warm & scholarly",
    accent: "#92673a",
    bg: "#faf6f1",
    text: "#2c1810",
    card: "#f4ede4",
  },
  {
    name: "Entertainment",
    desc: "Energetic & fun",
    accent: "#f43f5e",
    bg: "#0d0d0d",
    text: "#f5f5f0",
    card: "#181818",
  },
  {
    name: "Nonprofit",
    desc: "Approachable & honest",
    accent: "#4ade80",
    bg: "#ffffff",
    text: "#1f2937",
    card: "#f9fafb",
  },
  {
    name: "Real Estate",
    desc: "Luxury & polished",
    accent: "#d4a852",
    bg: "#0d0d0d",
    text: "#f5f5f0",
    card: "#181818",
  },
];

// ── Font pairings ────────────────────────────────────────────────────────

const FONT_PAIRINGS = [
  { name: "Modern Minimal", heading: "Inter", body: "Inter", vibe: "Clean & professional" },
  { name: "Editorial", heading: "Playfair Display", body: "Lato", vibe: "Elegant & refined" },
  { name: "Tech Forward", heading: "Space Grotesk", body: "DM Sans", vibe: "Geometric & crisp" },
  { name: "Creative", heading: "Syne", body: "Outfit", vibe: "Bold & artistic" },
  { name: "Classic Serif", heading: "Cormorant Garamond", body: "Lato", vibe: "Timeless & warm" },
  { name: "Display Bold", heading: "Bebas Neue", body: "Nunito", vibe: "Impactful & friendly" },
  { name: "Vintage", heading: "Fraunces", body: "IBM Plex Sans", vibe: "Retro & trustworthy" },
  { name: "Clean Sans", heading: "Raleway", body: "Source Sans 3", vibe: "Light & airy" },
  { name: "Authoritative", heading: "Oswald", body: "DM Sans", vibe: "Strong & decisive" },
  { name: "Scholarly", heading: "DM Serif Display", body: "Inter", vibe: "Smart & composed" },
];

// ── Animation presets ────────────────────────────────────────────────────

const ANIMATION_PRESETS = [
  { id: "none", label: "None", desc: "No animations", pro: false },
  { id: "subtle", label: "Subtle", desc: "Gentle fades & slides", pro: false },
  { id: "bold", label: "Bold", desc: "Dramatic entrances", pro: false },
  { id: "playful", label: "Playful", desc: "Bouncy & delightful", pro: false },
  { id: "cinematic", label: "Cinematic", desc: "Blur-in reveals", pro: true },
  { id: "stagger", label: "Stagger", desc: "Cascading card entries", pro: true },
] as const;

// ── Device sizes ─────────────────────────────────────────────────────────

const DEVICE_SIZES = {
  desktop: { w: "100%", label: "Desktop" },
  tablet: { w: 768, label: "Tablet" },
  mobile: { w: 375, label: "Mobile" },
} as const;

type DeviceMode = keyof typeof DEVICE_SIZES;
type ToolbarPanel = "presets" | "colors" | "fonts" | "layout" | "motion" | "style" | "sections" | "advanced" | null;

// ── Undo/Redo stack ──────────────────────────────────────────────────────

function useUndoRedo(initial: ThemeConfig) {
  const [stack, setStack] = useState<ThemeConfig[]>([initial]);
  const [pointer, setPointer] = useState(0);

  const current = stack[pointer];

  const push = useCallback(
    (next: ThemeConfig) => {
      setStack((s) => {
        const trimmed = s.slice(0, pointer + 1);
        return [...trimmed, next];
      });
      setPointer((p) => p + 1);
    },
    [pointer]
  );

  const undo = useCallback(() => {
    setPointer((p) => Math.max(0, p - 1));
  }, []);

  const redo = useCallback(() => {
    setPointer((p) => Math.min(stack.length - 1, p + 1));
  }, [stack.length]);

  const canUndo = pointer > 0;
  const canRedo = pointer < stack.length - 1;

  const reset = useCallback((config: ThemeConfig) => {
    setStack([config]);
    setPointer(0);
  }, []);

  return { current, push, undo, redo, canUndo, canRedo, reset, pointer };
}

// ── Sub-components ────────────────────────────────────────────────────────

function ColorDot({
  color,
  active,
  onClick,
  size = "md",
}: {
  color: string;
  active?: boolean;
  onClick: () => void;
  size?: "sm" | "md";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border-2 transition-all hover:scale-110",
        active ? "border-primary ring-2 ring-primary/30 scale-110" : "border-transparent",
        size === "sm" ? "h-6 w-6" : "h-8 w-8"
      )}
      style={{ backgroundColor: color }}
      aria-label={`Select color ${color}`}
    />
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="relative h-8 w-8 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-white/20"
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
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-white/60 leading-none mb-0.5">{label}</p>
        <input
          type="text"
          value={value.toUpperCase()}
          onChange={(e) => {
            const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
          }}
          className="w-full bg-transparent font-mono text-xs text-white outline-none"
        />
      </div>
    </div>
  );
}

function ToggleOption({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex rounded-lg bg-white/10 p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all",
            value === opt.value
              ? "bg-white/20 text-white shadow-sm"
              : "text-white/60 hover:text-white"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Panel components ──────────────────────────────────────────────────────

function PresetsPanel({
  theme,
  onSelect,
}: {
  theme: ThemeConfig;
  onSelect: (config: ThemeConfig) => void;
}) {
  const [category, setCategory] = useState<string>("all");

  const filtered = THEME_PRESETS.filter(
    (p) => category === "all" || getPresetCategory(p).includes(category)
  );

  return (
    <div className="space-y-3">
      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {PRESET_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all",
              category === cat.id
                ? "bg-white text-black"
                : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Horizontal preset carousel */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
        {filtered.map((preset) => {
          const bg =
            preset.config.bgType === "gradient"
              ? `linear-gradient(${preset.config.bgAngle}deg, ${preset.config.bgPrimary}, ${preset.config.bgSecondary})`
              : preset.config.bgPrimary;
          const isActive =
            theme.bgPrimary === preset.config.bgPrimary &&
            theme.accentColor === preset.config.accentColor &&
            theme.headingFont === preset.config.headingFont;

          return (
            <button
              key={preset.id}
              onClick={() => onSelect(preset.config)}
              className={cn(
                "group relative shrink-0 snap-center overflow-hidden rounded-xl border-2 transition-all w-32",
                isActive
                  ? "border-white shadow-lg shadow-white/20 scale-105"
                  : "border-white/10 hover:border-white/40 hover:scale-[1.02]"
              )}
            >
              {/* Mini preview */}
              <div className="relative h-20" style={{ background: bg }}>
                <div className="flex h-full flex-col items-center justify-center gap-1">
                  <span
                    className="text-base font-bold leading-none"
                    style={{
                      color: preset.config.textColor,
                      fontFamily: `'${preset.config.headingFont}', sans-serif`,
                    }}
                  >
                    Aa
                  </span>
                  <div className="flex gap-1">
                    <div className="h-1.5 w-8 rounded-full" style={{ backgroundColor: preset.config.accentColor }} />
                    <div className="h-1.5 w-4 rounded-full" style={{ backgroundColor: preset.config.subtextColor }} />
                  </div>
                  <div className="flex gap-0.5 mt-0.5">
                    <div className="h-3 w-5 rounded-sm" style={{ backgroundColor: preset.config.cardBg, border: `1px solid ${preset.config.cardBorder}` }} />
                    <div className="h-3 w-5 rounded-sm" style={{ backgroundColor: preset.config.cardBg, border: `1px solid ${preset.config.cardBorder}` }} />
                  </div>
                </div>
                {isActive && (
                  <div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white">
                    <Check className="h-2.5 w-2.5 text-black" />
                  </div>
                )}
              </div>
              <div className="px-2 py-1.5" style={{ backgroundColor: preset.config.cardBg }}>
                <p className="truncate text-[10px] font-semibold" style={{ color: preset.config.textColor }}>
                  {preset.name}
                </p>
                <p className="truncate text-[8px]" style={{ color: preset.config.subtextColor }}>
                  {preset.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ColorsPanel({
  theme,
  update,
}: {
  theme: ThemeConfig;
  update: (p: Partial<ThemeConfig>) => void;
}) {
  const [tab, setTab] = useState<"swatches" | "custom" | "ai">("swatches");
  const [editing, setEditing] = useState<keyof ThemeConfig>("accentColor");

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex rounded-lg bg-white/10 p-0.5 gap-0.5">
        {([
          { id: "swatches", label: "Swatches", icon: Palette },
          { id: "custom", label: "Custom", icon: Sparkles },
          { id: "ai", label: "AI Palettes", icon: Wand2 },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all",
              tab === t.id ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
            )}
          >
            <t.icon className="h-3 w-3" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "swatches" && (
        <div className="space-y-3">
          {/* Which color are we picking for? */}
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {([
              { key: "accentColor", label: "Accent" },
              { key: "bgPrimary", label: "Background" },
              { key: "textColor", label: "Text" },
              { key: "cardBg", label: "Card" },
            ] as const).map((item) => (
              <button
                key={item.key}
                onClick={() => setEditing(item.key)}
                className={cn(
                  "flex items-center gap-1.5 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all",
                  editing === item.key ? "bg-white/20 text-white" : "text-white/50 hover:text-white"
                )}
              >
                <div className="h-3 w-3 rounded-full border border-white/30" style={{ backgroundColor: theme[item.key] as string }} />
                {item.label}
              </button>
            ))}
          </div>
          {/* Swatch grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {COLOR_SWATCHES.map((color) => (
              <ColorDot
                key={color}
                color={color}
                size="sm"
                active={theme[editing] === color}
                onClick={() => update({ [editing]: color })}
              />
            ))}
          </div>
        </div>
      )}

      {tab === "custom" && (
        <div className="grid grid-cols-2 gap-3">
          <ColorInput label="Accent" value={theme.accentColor} onChange={(c) => update({ accentColor: c })} />
          <ColorInput label="Background" value={theme.bgPrimary} onChange={(c) => update({ bgPrimary: c })} />
          <ColorInput label="Text" value={theme.textColor} onChange={(c) => update({ textColor: c })} />
          <ColorInput label="Subtext" value={theme.subtextColor} onChange={(c) => update({ subtextColor: c })} />
          <ColorInput label="Card BG" value={theme.cardBg} onChange={(c) => update({ cardBg: c })} />
          <ColorInput label="Card Border" value={theme.cardBorder} onChange={(c) => update({ cardBorder: c })} />
          {theme.bgType === "gradient" && (
            <>
              <ColorInput label="Gradient End" value={theme.bgSecondary} onChange={(c) => update({ bgSecondary: c })} />
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-[10px] text-white/60 mb-0.5">Angle</p>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={theme.bgAngle}
                    onChange={(e) => update({ bgAngle: Number(e.target.value) })}
                    className="w-full accent-white"
                    title="Gradient angle"
                  />
                </div>
                <span className="text-xs text-white/80 font-mono">{theme.bgAngle}°</span>
              </div>
            </>
          )}
          <div className="col-span-2">
            <p className="text-[10px] text-white/60 mb-1.5">Background Type</p>
            <ToggleOption
              options={[
                { label: "Solid", value: "solid" },
                { label: "Gradient", value: "gradient" },
                { label: "Pattern", value: "pattern" },
              ]}
              value={theme.bgType}
              onChange={(v) => update({ bgType: v as BgType })}
            />
          </div>
          {theme.bgType === "pattern" && (
            <div className="col-span-2">
              <p className="text-[10px] text-white/60 mb-1.5">Pattern</p>
              <ToggleOption
                options={[
                  { label: "Dots", value: "dots" },
                  { label: "Grid", value: "grid" },
                  { label: "Lines", value: "lines" },
                  { label: "Cross", value: "cross" },
                  { label: "Waves", value: "waves" },
                  { label: "Hex", value: "hexagons" },
                ]}
                value={theme.patternType === "none" ? "dots" : theme.patternType}
                onChange={(v) => update({ patternType: v as PatternType })}
              />
            </div>
          )}
          {theme.bgType === "gradient" && (
            <div className="col-span-2">
              <p className="text-[10px] text-white/60 mb-1.5">Gradient Type</p>
              <ToggleOption
                options={[
                  { label: "Linear", value: "linear" },
                  { label: "Radial", value: "radial" },
                  { label: "Conic", value: "conic" },
                ]}
                value={theme.bgGradientType ?? "linear"}
                onChange={(v) => update({ bgGradientType: v as GradientType })}
              />
            </div>
          )}
          <div className="col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-white/60">Grain Overlay</p>
              <button
                onClick={() => update({ bgGrainOverlay: !theme.bgGrainOverlay })}
                className={cn(
                  "relative h-5 w-9 rounded-full transition-colors",
                  theme.bgGrainOverlay ? "bg-white/30" : "bg-white/10"
                )}
              >
                <div className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                  theme.bgGrainOverlay ? "translate-x-4" : "translate-x-0.5"
                )} />
              </button>
            </div>
            {theme.bgGrainOverlay && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="range"
                  min={10}
                  max={80}
                  value={theme.bgGrainOpacity ?? 40}
                  onChange={(e) => update({ bgGrainOpacity: Number(e.target.value) })}
                  className="flex-1 accent-white"
                  title="Grain opacity"
                />
                <span className="text-[10px] text-white/60 font-mono w-8">{theme.bgGrainOpacity ?? 40}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "ai" && (
        <div className="grid grid-cols-2 gap-2">
          {AI_PALETTES.map((palette) => (
            <button
              key={palette.name}
              onClick={() =>
                update({
                  accentColor: palette.accent,
                  bgPrimary: palette.bg,
                  textColor: palette.text,
                  cardBg: palette.card,
                  bgType: "solid",
                })
              }
              className="group rounded-lg border border-white/10 p-2 text-left transition-all hover:border-white/30 hover:bg-white/5"
            >
              <div className="flex gap-1 mb-1.5">
                {[palette.bg, palette.accent, palette.text, palette.card].map((c, i) => (
                  <div key={i} className="h-4 w-4 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                ))}
              </div>
              <p className="text-[11px] font-semibold text-white">{palette.name}</p>
              <p className="text-[9px] text-white/50">{palette.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* Dark Mode */}
      <Separator className="bg-white/10" />
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {theme.darkMode?.enabled ? <Moon className="h-3.5 w-3.5 text-white/60" /> : <Sun className="h-3.5 w-3.5 text-white/60" />}
            <p className="text-[10px] text-white/60 uppercase tracking-wider">Dark Mode Toggle</p>
          </div>
          <button
            onClick={() => {
              const current = theme.darkMode ?? { enabled: false, defaultMode: "light" as const, darkPalette: { bgPrimary: "#0f172a", bgSecondary: "#1e293b", textColor: "#f1f5f9", subtextColor: "#94a3b8", cardBg: "#1e293b", cardBorder: "#334155", accentColor: theme.accentColor } };
              update({ darkMode: { ...current, enabled: !current.enabled } });
            }}
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              theme.darkMode?.enabled ? "bg-white/30" : "bg-white/10"
            )}
          >
            <div className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
              theme.darkMode?.enabled ? "translate-x-4" : "translate-x-0.5"
            )} />
          </button>
        </div>
        {theme.darkMode?.enabled && (
          <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] text-white/50 mb-2">Visitors can toggle between light and dark</p>
            <div className="grid grid-cols-2 gap-2">
              <ColorInput
                label="Dark BG"
                value={theme.darkMode.darkPalette?.bgPrimary ?? "#0f172a"}
                onChange={(c) => update({ darkMode: { ...theme.darkMode!, darkPalette: { ...theme.darkMode!.darkPalette!, bgPrimary: c } } })}
              />
              <ColorInput
                label="Dark Text"
                value={theme.darkMode.darkPalette?.textColor ?? "#f1f5f9"}
                onChange={(c) => update({ darkMode: { ...theme.darkMode!, darkPalette: { ...theme.darkMode!.darkPalette!, textColor: c } } })}
              />
              <ColorInput
                label="Dark Card"
                value={theme.darkMode.darkPalette?.cardBg ?? "#1e293b"}
                onChange={(c) => update({ darkMode: { ...theme.darkMode!, darkPalette: { ...theme.darkMode!.darkPalette!, cardBg: c } } })}
              />
              <ColorInput
                label="Dark Accent"
                value={theme.darkMode.darkPalette?.accentColor ?? theme.accentColor}
                onChange={(c) => update({ darkMode: { ...theme.darkMode!, darkPalette: { ...theme.darkMode!.darkPalette!, accentColor: c } } })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FontsPanel({
  theme,
  update,
}: {
  theme: ThemeConfig;
  update: (p: Partial<ThemeConfig>) => void;
}) {
  const [mode, setMode] = useState<"pairings" | "advanced">("pairings");

  return (
    <div className="space-y-3">
      <div className="flex rounded-lg bg-white/10 p-0.5 gap-0.5">
        <button
          onClick={() => setMode("pairings")}
          className={cn(
            "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all",
            mode === "pairings" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
          )}
        >
          Pairings
        </button>
        <button
          onClick={() => setMode("advanced")}
          className={cn(
            "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all",
            mode === "advanced" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
          )}
        >
          Advanced
        </button>
      </div>

      {mode === "pairings" ? (
        <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-none">
          {FONT_PAIRINGS.map((pair) => {
            const isActive = theme.headingFont === pair.heading && theme.bodyFont === pair.body;
            return (
              <button
                key={pair.name}
                onClick={() => update({ headingFont: pair.heading, bodyFont: pair.body })}
                className={cn(
                  "w-full rounded-lg border p-2.5 text-left transition-all",
                  isActive
                    ? "border-white/40 bg-white/15"
                    : "border-white/10 hover:border-white/25 hover:bg-white/5"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-white">{pair.name}</span>
                  {isActive && <Check className="h-3 w-3 text-white" />}
                </div>
                <p
                  className="text-lg font-bold text-white/90 leading-tight"
                  style={{ fontFamily: `'${pair.heading}', sans-serif` }}
                >
                  Hello World
                </p>
                <p
                  className="text-xs text-white/60 mt-0.5"
                  style={{ fontFamily: `'${pair.body}', sans-serif` }}
                >
                  {pair.vibe} — {pair.heading} + {pair.body}
                </p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label className="text-[10px] text-white/60 uppercase tracking-wider">Heading Font</Label>
            <select
              value={theme.headingFont}
              onChange={(e) => update({ headingFont: e.target.value })}
              title="Heading font"
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none"
            >
              {HEADING_FONTS.map((f) => (
                <option key={f.value} value={f.value} className="bg-gray-900 text-white">
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-[10px] text-white/60 uppercase tracking-wider">Body Font</Label>
            <select
              value={theme.bodyFont}
              onChange={(e) => update({ bodyFont: e.target.value })}
              title="Body font"
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none"
            >
              {BODY_FONTS.map((f) => (
                <option key={f.value} value={f.value} className="bg-gray-900 text-white">
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p
              className="text-lg font-bold text-white/90"
              style={{ fontFamily: `'${theme.headingFont}', sans-serif` }}
            >
              Portfolio Preview
            </p>
            <p
              className="text-xs text-white/60 mt-1"
              style={{ fontFamily: `'${theme.bodyFont}', sans-serif` }}
            >
              This is how your body text will look on your portfolio page.
            </p>
          </div>
        </div>
      )}

      {/* Font Scale */}
      <Separator className="bg-white/10" />
      <div>
        <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1.5">Font Scale</p>
        <ToggleOption
          options={[
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
            { label: "Large", value: "large" },
          ]}
          value={theme.fontScale ?? "medium"}
          onChange={(v) => update({ fontScale: v as FontScale })}
        />
      </div>
    </div>
  );
}
function LayoutPanel({
  theme,
  update,
}: {
  theme: ThemeConfig;
  update: (p: Partial<ThemeConfig>) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Hero Layout */}
      <div>
        <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1.5">Hero Layout</p>
        <div className="grid grid-cols-2 gap-1.5 max-h-60 overflow-y-auto scrollbar-none">
          {HERO_LAYOUTS.map((layout) => {
            const active = (theme.heroLayout ?? "centered") === layout.id;
            return (
              <button
                key={layout.id}
                onClick={() => update({ heroLayout: layout.id })}
                className={cn(
                  "rounded-lg border p-2.5 text-left transition-all",
                  active
                    ? "border-white/40 bg-white/15 ring-1 ring-white/20"
                    : "border-white/10 hover:border-white/25 hover:bg-white/5"
                )}
              >
                {/* Mini layout illustration */}
                <div className={cn(
                  "mb-1.5 flex gap-1",
                  layout.id === "centered" || layout.id === "stacked" || layout.id === "magazine" ? "flex-col items-center" :
                  layout.id === "floating" ? "flex-row-reverse items-center" :
                  "flex-col items-start"
                )}>
                  {(layout.id === "split" || layout.id === "floating") ? (
                    <>
                      <div className="h-6 w-6 rounded bg-white/20" />
                      <div className="flex flex-col gap-0.5">
                        <div className="h-1 w-8 rounded-full bg-white/40" />
                        <div className="h-1 w-6 rounded-full bg-white/20" />
                      </div>
                    </>
                  ) : layout.id === "magazine" ? (
                    <>
                      <div className="h-2 w-16 rounded-full bg-white/40" />
                      <div className="h-0.5 w-8 rounded-full bg-white/15" />
                    </>
                  ) : layout.id === "minimal" ? (
                    <div className="h-1 w-10 rounded-full bg-white/30" />
                  ) : layout.id === "card" ? (
                    <div className="rounded border border-white/20 p-1.5">
                      <div className="h-1 w-8 rounded-full bg-white/40" />
                      <div className="mt-0.5 h-0.5 w-6 rounded-full bg-white/20" />
                    </div>
                  ) : (
                    <>
                      <div className="h-1 w-8 rounded-full bg-white/40" />
                      <div className="h-1 w-12 rounded-full bg-white/20" />
                      <div className="h-1 w-6 rounded-full bg-white/20" />
                    </>
                  )}
                </div>
                <p className="text-[10px] font-semibold text-white leading-tight">{layout.name}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Card Style */}
      <div>
        <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1.5">Card Template</p>
        <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto scrollbar-none">
          {CARD_TEMPLATES.map((card) => {
            const active = (theme.cardStyle ?? "default") === card.id;
            return (
              <button
                key={card.id}
                onClick={() => update({ cardStyle: card.id })}
                className={cn(
                  "rounded-lg border p-2 text-left transition-all",
                  active
                    ? "border-white/40 bg-white/15 ring-1 ring-white/20"
                    : "border-white/10 hover:border-white/25 hover:bg-white/5"
                )}
              >
                <p className="text-[10px] font-semibold text-white">{card.name}</p>
                <p className="text-[8px] text-white/40 leading-snug">{card.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Container Width */}
      <div>
        <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1.5">Content Width</p>
        <ToggleOption
          options={[
            { label: "Narrow", value: "narrow" },
            { label: "Default", value: "default" },
            { label: "Wide", value: "wide" },
          ]}
          value={theme.containerWidth}
          onChange={(v) => update({ containerWidth: v as ContainerWidth })}
        />
      </div>

      {/* Section Spacing */}
      <div>
        <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1.5">Section Spacing</p>
        <ToggleOption
          options={[
            { label: "Compact", value: "compact" },
            { label: "Comfortable", value: "comfortable" },
            { label: "Spacious", value: "spacious" },
          ]}
          value={theme.sectionSpacing ?? "comfortable"}
          onChange={(v) => update({ sectionSpacing: v as SectionSpacing })}
        />
      </div>
    </div>
  );
}

function MotionPanel({
  theme,
  update,
}: {
  theme: ThemeConfig;
  update: (p: Partial<ThemeConfig>) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Animation Style */}
      <div>
        <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1.5">Animation Style</p>
        <div className="grid grid-cols-2 gap-1.5">
          {ANIMATION_PRESETS.map((anim) => {
            const active = (theme.animationStyle ?? "subtle") === anim.id;
            return (
              <button
                key={anim.id}
                title={`${anim.label} animation style`}
                onClick={() => update({ animationStyle: anim.id as AnimationStyle })}
                className={cn(
                  "rounded-lg border p-2 text-left transition-all",
                  active
                    ? "border-white/40 bg-white/10 ring-1 ring-white/20"
                    : "border-white/10 hover:border-white/25 hover:bg-white/5",
                )}
              >
                <div className="flex items-center gap-1">
                  <p className="text-[11px] font-semibold text-white">{anim.label}</p>
                  {anim.pro && (
                    <Crown className="h-2.5 w-2.5 text-amber-400" />
                  )}
                </div>
                <p className="text-[9px] text-white/50">{anim.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hover Effects */}
      <div>
        <p className="text-[10px] text-white/60 uppercase tracking-wider mb-0.5">Card Hover Effect</p>
        <p className="text-[9px] text-white/30 mb-1.5">Hover over any card in the preview to see</p>
        <div className="flex gap-1.5 flex-wrap">
          {([
            { value: "none", label: "None" },
            { value: "lift", label: "Lift" },
            { value: "glow", label: "Glow" },
            { value: "tilt", label: "Tilt" },
            { value: "scale", label: "Scale" },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ hoverEffects: opt.value })}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all border",
                (theme.hoverEffects ?? "none") === opt.value
                  ? "border-white/40 bg-white/20 text-white"
                  : "border-white/10 text-white/60 hover:text-white hover:border-white/25"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Page Transition */}
      <div>
        <p className="text-[10px] text-white/60 uppercase tracking-wider mb-0.5">Page Transition</p>
        <p className="text-[9px] text-white/30 mb-1.5">Animates content when switching nav sections</p>
        <ToggleOption
          options={[
            { label: "None", value: "none" },
            { label: "Fade", value: "fade" },
            { label: "Slide", value: "slide" },
            { label: "Morph", value: "morph" },
          ]}
          value={theme.pageTransition ?? "none"}
          onChange={(v) => update({ pageTransition: v as PageTransition })}
        />
      </div>

      {/* Parallax */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-white/60 uppercase tracking-wider">Parallax Scrolling</p>
          <p className="text-[9px] text-white/40">Hero depth effect on scroll</p>
        </div>
        <button
          onClick={() => update({ parallaxEnabled: !theme.parallaxEnabled })}
          className={cn(
            "relative h-5 w-9 rounded-full transition-colors",
            theme.parallaxEnabled ? "bg-white/30" : "bg-white/10"
          )}
        >
          <div className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
            theme.parallaxEnabled ? "translate-x-4" : "translate-x-0.5"
          )} />
        </button>
      </div>
    </div>
  );
}

function StylePanel({
  theme,
  update,
}: {
  theme: ThemeConfig;
  update: (p: Partial<ThemeConfig>) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Nav Style */}
      <div>
        <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1.5">Nav Variant</p>
        <div className="flex gap-1.5 flex-wrap">
          {([
            { value: "default", label: "Default" },
            { value: "minimal", label: "Minimal" },
            { value: "pills", label: "Pills" },
            { value: "underline", label: "Underline" },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                const current = theme.navStyle ?? { variant: "default" as NavVariant, position: "left" as NavPosition, width: "default" as const, showLabels: true, iconStyle: "default" as NavIconStyle };
                update({ navStyle: { ...current, variant: opt.value } });
              }}
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-all border",
                (theme.navStyle?.variant ?? "default") === opt.value
                  ? "border-white/40 bg-white/20 text-white"
                  : "border-white/10 text-white/60 hover:text-white hover:border-white/25"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Nav Position */}
        <div>
          <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1.5">Nav Position</p>
          <ToggleOption
            options={[
              { label: "Left", value: "left" },
              { label: "Right", value: "right" },
            ]}
            value={theme.navStyle?.position ?? "left"}
            onChange={(v) => {
              const current = theme.navStyle ?? { variant: "default" as NavVariant, position: "left" as NavPosition, width: "default" as const, showLabels: true, iconStyle: "default" as NavIconStyle };
              update({ navStyle: { ...current, position: v as NavPosition } });
            }}
          />
        </div>
        {/* Nav Width */}
        <div>
          <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1.5">Nav Width</p>
          <ToggleOption
            options={[
              { label: "Slim", value: "narrow" },
              { label: "Default", value: "default" },
              { label: "Wide", value: "wide" },
            ]}
            value={theme.navStyle?.width ?? "default"}
            onChange={(v) => {
              const current = theme.navStyle ?? { variant: "default" as NavVariant, position: "left" as NavPosition, width: "default" as const, showLabels: true, iconStyle: "default" as NavIconStyle };
              update({ navStyle: { ...current, width: v as "narrow" | "default" | "wide" } });
            }}
          />
        </div>
      </div>

      {/* Nav Labels Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-white/60 uppercase tracking-wider">Show Nav Labels</p>
        <button
          onClick={() => {
            const current = theme.navStyle ?? { variant: "default" as NavVariant, position: "left" as NavPosition, width: "default" as const, showLabels: true, iconStyle: "default" as NavIconStyle };
            update({ navStyle: { ...current, showLabels: !current.showLabels } });
          }}
          className={cn(
            "relative h-5 w-9 rounded-full transition-colors",
            (theme.navStyle?.showLabels ?? true) ? "bg-white/30" : "bg-white/10"
          )}
        >
          <div className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
            (theme.navStyle?.showLabels ?? true) ? "translate-x-4" : "translate-x-0.5"
          )} />
        </button>
      </div>

      <Separator className="bg-white/10" />

      {/* Button Style */}
      <div>
        <p className="text-[10px] text-white/60 uppercase tracking-wider mb-0.5">Button Style</p>
        <p className="text-[9px] text-white/30 mb-1.5">Affects action buttons in home &amp; portfolio sections</p>
        <div className="flex gap-1.5 flex-wrap">
          {([
            { value: "default", label: "Default" },
            { value: "rounded", label: "Rounded" },
            { value: "pill", label: "Pill" },
            { value: "outline", label: "Outline" },
            { value: "ghost", label: "Ghost" },
            { value: "glow", label: "Glow" },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ buttonStyle: opt.value })}
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-all border",
                (theme.buttonStyle ?? "default") === opt.value
                  ? "border-white/40 bg-white/20 text-white"
                  : "border-white/10 text-white/60 hover:text-white hover:border-white/25"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Social Icon Style */}
      <div>
        <p className="text-[10px] text-white/60 uppercase tracking-wider mb-0.5">Social Icons</p>
        <p className="text-[9px] text-white/30 mb-1.5">Styles social links in the home hero section</p>
        <div className="flex gap-1.5 flex-wrap">
          {([
            { value: "default", label: "Default" },
            { value: "rounded", label: "Rounded" },
            { value: "square", label: "Square" },
            { value: "outline", label: "Outline" },
            { value: "pill", label: "Pill" },
            { value: "glow", label: "Glow" },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ socialIconStyle: opt.value })}
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-all border",
                (theme.socialIconStyle ?? "default") === opt.value
                  ? "border-white/40 bg-white/20 text-white"
                  : "border-white/10 text-white/60 hover:text-white hover:border-white/25"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image Filter */}
      <div>
        <p className="text-[10px] text-white/60 uppercase tracking-wider mb-0.5">Image Filter</p>
        <p className="text-[9px] text-white/30 mb-1.5">Applied to profile photo &amp; portfolio images</p>
        <div className="flex gap-1.5 flex-wrap">
          {([
            { value: "none", label: "None" },
            { value: "grayscale", label: "Grayscale" },
            { value: "sepia", label: "Sepia" },
            { value: "contrast", label: "Contrast" },
            { value: "saturate", label: "Saturate" },
            { value: "brightness", label: "Bright" },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ imageFilter: opt.value })}
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-all border",
                (theme.imageFilter ?? "none") === opt.value
                  ? "border-white/40 bg-white/20 text-white"
                  : "border-white/10 text-white/60 hover:text-white hover:border-white/25"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Splash Screen */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-white/60 uppercase tracking-wider">Splash Screen</p>
          <button
            onClick={() => {
              const current = theme.splashScreen ?? { enabled: false, style: "fade" as const, duration: 2000, bgColor: "#000000", textColor: "#ffffff" };
              update({ splashScreen: { ...current, enabled: !current.enabled } });
            }}
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              theme.splashScreen?.enabled ? "bg-white/30" : "bg-white/10"
            )}
          >
            <div className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
              theme.splashScreen?.enabled ? "translate-x-4" : "translate-x-0.5"
            )} />
          </button>
        </div>
        {theme.splashScreen?.enabled && (
          <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
            <div>
              <p className="text-[10px] text-white/60 mb-1.5">Style</p>
              <ToggleOption
                options={[
                  { label: "Fade", value: "fade" },
                  { label: "Slide", value: "slide-up" },
                  { label: "Zoom", value: "zoom" },
                  { label: "Blur", value: "blur" },
                ]}
                value={theme.splashScreen.style ?? "fade"}
                onChange={(v) => update({ splashScreen: { ...theme.splashScreen!, style: v as SplashStyle } })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ColorInput
                label="Background"
                value={theme.splashScreen.bgColor ?? "#000000"}
                onChange={(c) => update({ splashScreen: { ...theme.splashScreen!, bgColor: c } })}
              />
              <ColorInput
                label="Text"
                value={theme.splashScreen.textColor ?? "#ffffff"}
                onChange={(c) => update({ splashScreen: { ...theme.splashScreen!, textColor: c } })}
              />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-white/60">Duration</p>
              <input
                type="range"
                min={1000}
                max={5000}
                step={500}
                value={theme.splashScreen.duration ?? 2000}
                onChange={(e) => update({ splashScreen: { ...theme.splashScreen!, duration: Number(e.target.value) } })}
                className="flex-1 accent-white"
                title="Splash duration"
              />
              <span className="text-[10px] text-white/60 font-mono">{((theme.splashScreen.duration ?? 2000) / 1000).toFixed(1)}s</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionsPanel({
  theme,
  update,
}: {
  theme: ThemeConfig;
  update: (p: Partial<ThemeConfig>) => void;
}) {
  const items: { key: keyof ThemeConfig; label: string; icon: typeof Eye }[] = [
    { key: "showExperience", label: "Experience", icon: Eye },
    { key: "showEducation", label: "Education", icon: Eye },
    { key: "showDemos", label: "Demos", icon: Eye },
    { key: "showSkills", label: "Skills", icon: Eye },
    { key: "showVolunteering", label: "Volunteering", icon: Eye },
    { key: "showCertificates", label: "Certificates", icon: Eye },
    { key: "showContact", label: "Contact Form", icon: Eye },
  ];

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] text-white/60 uppercase tracking-wider mb-2">Visible Sections</p>
      {items.map(({ key, label }) => {
        const visible = theme[key] !== false;
        return (
          <button
            key={key}
            onClick={() => update({ [key]: !visible })}
            className={cn(
              "flex w-full items-center justify-between rounded-lg border px-3 py-2 transition-all",
              visible
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/5 bg-white/5 text-white/40"
            )}
          >
            <span className="text-xs font-medium">{label}</span>
            {visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
        );
      })}
    </div>
  );
}

function AdvancedPanel({
  theme,
  update,
  isPro,
}: {
  theme: ThemeConfig;
  update: (p: Partial<ThemeConfig>) => void;
  isPro: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] text-white/60 uppercase tracking-wider">Custom CSS</p>
          {!isPro && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-semibold text-amber-400">
              <Crown className="h-2.5 w-2.5" />
              Pro
            </span>
          )}
        </div>
        {isPro ? (
          <Textarea
            value={theme.customCss ?? ""}
            onChange={(e) => update({ customCss: e.target.value })}
            placeholder={`/* Your custom CSS */\nh1 { letter-spacing: -0.04em; }`}
            className="h-32 bg-white/10 border-white/20 font-mono text-xs text-white placeholder:text-white/30 resize-none"
          />
        ) : (
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
            <Crown className="mx-auto h-6 w-6 text-amber-400 mb-2" />
            <p className="text-xs text-white/70">Upgrade to Pro to add custom CSS</p>
            <a
              href="/dashboard/settings"
              className="mt-2 inline-flex items-center gap-1 rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-semibold text-white transition-all hover:shadow-lg hover:shadow-amber-500/20"
            >
              Upgrade
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

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
  const skills = useQuery(
    api.skills.getByUserId,
    profile ? { userId: profile.userId } : "skip"
  );
  const volunteering = useQuery(
    api.volunteering.getByUserId,
    profile ? { userId: profile.userId } : "skip"
  );
  const certificates = useQuery(
    api.certificates.getByUserId,
    profile ? { userId: profile.userId } : "skip"
  );
  const selfPlan = useQuery(api.subscriptions.getSelfPlan);
  const saveThemeMutation = useMutation(api.profiles.saveTheme);

  const isPro = selfPlan ? selfPlan.plan !== "free" || selfPlan.isCreator : false;

  const dbTheme =
    profile
      ? resolveTheme(profile.themeConfig as ThemeConfig | undefined, profile.theme)
      : null;

  const {
    current: resolvedTheme,
    push: pushTheme,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetStack,
    pointer,
  } = useUndoRedo(dbTheme ?? {
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

  // Sync undo stack when DB theme first loads
  const dbSyncedRef = useRef(false);
  useEffect(() => {
    if (dbTheme && !dbSyncedRef.current) {
      dbSyncedRef.current = true;
      resetStack(dbTheme);
    }
  }, [dbTheme, resetStack]);

  const [activePanel, setActivePanel] = useState<ToolbarPanel>("presets");
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDirty = pointer > 0 && savedAt === null;

  const update = useCallback(
    (patch: Partial<ThemeConfig>) => {
      pushTheme({ ...resolvedTheme, ...patch });
      setSavedAt(null);
    },
    [resolvedTheme, pushTheme]
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      // Strip deleted feature fields before saving
      const { sectionDivider, sectionDividerColor, scrollProgress, ...cleanTheme } = resolvedTheme as ThemeConfig & {
        sectionDivider?: unknown;
        sectionDividerColor?: unknown;
        scrollProgress?: unknown;
      };
      void sectionDivider; void sectionDividerColor; void scrollProgress;
      await saveThemeMutation({ themeConfig: cleanTheme });
      setSavedAt(Date.now());
      toast.success("Theme published!");
    } catch {
      toast.error("Failed to save theme");
    } finally {
      setSaving(false);
    }
  };

  // Resizable viewport drag
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      const startX = e.clientX;
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const centerX = containerRect.left + containerRect.width / 2;

      const onMove = (ev: MouseEvent) => {
        if (!isDraggingRef.current) return;
        const dx = ev.clientX - centerX;
        const newW = Math.max(320, Math.min(containerRect.width, Math.abs(dx) * 2));
        setViewportWidth(newW);
        setDevice("desktop"); // custom size
      };
      const onUp = () => {
        isDraggingRef.current = false;
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    []
  );

  // Set viewport width on device change
  useEffect(() => {
    if (device === "desktop") setViewportWidth(null);
    else if (device === "tablet") setViewportWidth(768);
    else if (device === "mobile") setViewportWidth(375);
  }, [device]);

  // Loading state
  if (!profile) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const previewWidth = viewportWidth ?? "100%";

  // Free tools available to all users; pro tools require upgrade
  const FREE_PANELS: Set<ToolbarPanel> = new Set(["presets"]);

  const TOOLS: { id: ToolbarPanel; icon: React.ElementType; label: string; pro?: boolean }[] = [
    { id: "presets", icon: Sparkles, label: "Presets" },
    { id: "colors", icon: Palette, label: "Colors", pro: true },
    { id: "fonts", icon: Type, label: "Fonts", pro: true },
    { id: "layout", icon: LayoutGrid, label: "Layout", pro: true },
    { id: "motion", icon: Zap, label: "Motion", pro: true },
    { id: "style", icon: Paintbrush, label: "Style", pro: true },
    { id: "sections", icon: Layers, label: "Sections", pro: true },
    { id: "advanced", icon: Code2, label: "CSS", pro: true },
  ];

  const isToolLocked = (toolId: ToolbarPanel) => !isPro && !FREE_PANELS.has(toolId);

  /* ── Sidebar inner (shared between desktop and mobile overlay) ─── */
  const sidebarContent = (
    <>
      {/* Tool tabs — horizontal row */}
      <div className="flex border-b border-white/10 px-2 py-2 gap-0.5 shrink-0">
        {TOOLS.map((t) => {
          const locked = isToolLocked(t.id);
          return (
            <button
              key={t.id}
              onClick={() => setActivePanel((prev) => (prev === t.id ? null : t.id))}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 transition-all",
                activePanel === t.id
                  ? locked
                    ? "bg-amber-500/15 text-amber-400"
                    : "bg-white/15 text-white"
                  : locked
                    ? "text-white/30 hover:text-white/50 hover:bg-white/5"
                    : "text-white/50 hover:text-white hover:bg-white/10"
              )}
            >
              <t.icon className="h-4 w-4" />
              <span className="text-[9px] font-medium leading-none">{t.label}</span>
              {locked && (
                <Crown className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 text-amber-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Panel content — scrollable middle area */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-none">
        {activePanel && isToolLocked(activePanel) ? (
          /* Pro upgrade prompt */
          <div className="flex flex-col items-center justify-center text-center py-12 px-4">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
              <Crown className="h-8 w-8 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Unlock {activePanel === "advanced" ? "Custom CSS" : activePanel.charAt(0).toUpperCase() + activePanel.slice(1)}
            </h3>
            <p className="text-sm text-white/50 mb-6 max-w-[240px]">
              {activePanel === "colors" && "Custom color palettes, AI-powered palette generation, gradient types, grain textures, and dark mode toggle."}
              {activePanel === "fonts" && "Premium font pairings, advanced typography controls, font scaling, and access to the full Google Fonts library."}
              {activePanel === "layout" && "10 hero layouts, 10 card templates, section spacing, section dividers, and container width controls."}
              {activePanel === "motion" && "Cinematic animations, hover effects, page transitions, and parallax scrolling."}
              {activePanel === "style" && "Nav customization, button styles, social icon styles, image filters, scroll progress, and splash screens."}
              {activePanel === "sections" && "Toggle visibility of individual portfolio sections for a curated presentation."}
              {activePanel === "advanced" && "Inject custom CSS to fine-tune every pixel of your portfolio design."}
            </p>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-amber-500/25 hover:scale-105"
            >
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </Link>
            <p className="mt-3 text-[11px] text-white/30">Starting at $12/month</p>
          </div>
        ) : (
          <>
            {activePanel === "presets" && (
              <PresetsPanel theme={resolvedTheme} onSelect={(config) => { pushTheme(config); setSavedAt(null); }} />
            )}
            {activePanel === "colors" && (
              <ColorsPanel theme={resolvedTheme} update={update} />
            )}
            {activePanel === "fonts" && (
              <FontsPanel theme={resolvedTheme} update={update} />
            )}
            {activePanel === "layout" && (
              <LayoutPanel theme={resolvedTheme} update={update} />
            )}
            {activePanel === "motion" && (
              <MotionPanel theme={resolvedTheme} update={update} />
            )}
            {activePanel === "style" && (
              <StylePanel theme={resolvedTheme} update={update} />
            )}
            {activePanel === "sections" && (
              <SectionsPanel theme={resolvedTheme} update={update} />
            )}
            {activePanel === "advanced" && (
              <AdvancedPanel theme={resolvedTheme} update={update} isPro={isPro} />
            )}
            {!activePanel && (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Palette className="h-8 w-8 text-white/20 mb-3" />
                <p className="text-sm text-white/40">Select a tool above to start editing</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom bar — undo/redo, devices, view live, publish */}
      <div className="border-t border-white/10 p-3 shrink-0 space-y-2.5">
        {/* Row 1: Undo/Redo + Device switcher */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={cn(
                "rounded-lg p-1.5 transition-all",
                canUndo ? "text-white/70 hover:text-white hover:bg-white/10" : "text-white/20 cursor-not-allowed"
              )}
              aria-label="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={cn(
                "rounded-lg p-1.5 transition-all",
                canRedo ? "text-white/70 hover:text-white hover:bg-white/10" : "text-white/20 cursor-not-allowed"
              )}
              aria-label="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-0.5 rounded-lg bg-white/5 p-0.5">
            {([
              { mode: "desktop" as DeviceMode, icon: Monitor },
              { mode: "tablet" as DeviceMode, icon: Tablet },
              { mode: "mobile" as DeviceMode, icon: Smartphone },
            ]).map((d) => (
              <button
                key={d.mode}
                onClick={() => setDevice(d.mode)}
                className={cn(
                  "rounded-md p-1.5 transition-all",
                  device === d.mode
                    ? "bg-white/15 text-white"
                    : "text-white/40 hover:text-white hover:bg-white/10"
                )}
                aria-label={d.mode}
              >
                <d.icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: View Live + Publish */}
        <div className="flex items-center gap-2">
          {profile?.slug && (
            <a
              href={`/u/${profile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Live
            </a>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className={cn(
              "flex-1 h-9 rounded-lg text-xs font-semibold transition-all",
              isDirty
                ? "bg-linear-to-r from-primary to-violet-500 text-white hover:shadow-lg hover:shadow-primary/30"
                : savedAt
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-white/10 text-white/40"
            )}
          >
            {saving ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
            ) : savedAt && !isDirty ? (
              <>
                <Check className="mr-1 h-3 w-3" />
                Published
              </>
            ) : (
              "Publish"
            )}
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-950" data-tour="theme-presets">
      {/* ── Mobile top bar ──────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-30 flex h-12 items-center justify-between border-b border-white/10 bg-neutral-900/95 backdrop-blur-xl px-3 lg:hidden">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Dashboard</span>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={cn(
              "rounded-lg p-1.5",
              canUndo ? "text-white/70" : "text-white/20"
            )}
            aria-label="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className={cn(
              "h-8 rounded-lg px-3 text-xs font-semibold",
              isDirty
                ? "bg-linear-to-r from-primary to-violet-500 text-white"
                : savedAt
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-white/10 text-white/40"
            )}
          >
            {saving ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
            ) : savedAt && !isDirty ? (
              <Check className="h-3 w-3" />
            ) : (
              "Publish"
            )}
          </Button>
          <button
            onClick={() => setMobileToolsOpen(true)}
            className="rounded-lg p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Open theme tools"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ── Mobile sidebar overlay ─────────────────────────────── */}
      {mobileToolsOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileToolsOpen(false)}
        />
      )}

      {/* ── Sidebar (desktop: static, mobile: slide-in overlay) ─ */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 lg:w-[360px] flex flex-col border-r border-white/10 bg-neutral-900/95 backdrop-blur-xl transition-transform duration-300 ease-out lg:relative lg:translate-x-0 lg:z-auto",
          mobileToolsOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-14 items-center gap-3 px-4 border-b border-white/10 shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-sm font-semibold text-white tracking-tight">Theme Studio</h1>
          <button
            onClick={() => setMobileToolsOpen(false)}
            className="ml-auto rounded-lg p-1.5 text-white/40 hover:text-white hover:bg-white/10 transition-colors lg:hidden"
            aria-label="Close tools"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {sidebarContent}
      </aside>

      {/* ── Preview area ───────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="flex-1 flex items-start justify-center overflow-auto p-4 pt-16 lg:pt-6"
      >
        <div
          className="relative transition-all duration-300 ease-out"
          style={{
            width: previewWidth,
            maxWidth: "100%",
          }}
        >
          {/* Device frame label */}
          {viewportWidth && (
            <div className="mx-auto" style={{ maxWidth: viewportWidth }}>
              <div className="mb-2 flex items-center justify-center gap-2">
                <span className="text-[10px] text-white/40 font-mono">
                  {viewportWidth}px
                </span>
              </div>
            </div>
          )}

          <div
            className={cn(
              "mx-auto overflow-hidden transition-all duration-300 ease-out",
              viewportWidth ? "rounded-2xl border border-white/10 shadow-2xl shadow-black/50" : ""
            )}
            style={{ maxWidth: viewportWidth ?? undefined }}
          >
            <PortfolioRenderer
              profile={profile}
              sections={sections ?? []}
              education={education ?? []}
              demos={demos ?? []}
              skills={skills ?? []}
              volunteering={volunteering ?? []}
              certificates={certificates ?? []}
              themeOverride={resolvedTheme}
              preview
            />
          </div>

          {/* Drag handles (sides) */}
          {viewportWidth && (
            <>
              <div
                className="absolute top-1/2 -translate-y-1/2 -right-4 flex cursor-ew-resize items-center"
                onMouseDown={handleDragStart}
              >
                <div className="flex h-16 w-3 items-center justify-center rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors">
                  <GripVertical className="h-3 w-3 text-white/60" />
                </div>
              </div>
              <div
                className="absolute top-1/2 -translate-y-1/2 -left-4 flex cursor-ew-resize items-center"
                onMouseDown={handleDragStart}
              >
                <div className="flex h-16 w-3 items-center justify-center rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors">
                  <GripVertical className="h-3 w-3 text-white/60" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
