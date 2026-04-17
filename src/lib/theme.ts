// ── Theme System ────────────────────────────────────────────────────────────
// Defines the ThemeConfig type, 18 carefully designed presets, font lists,
// and CSS generation helpers. Used by the portfolio renderer + theme editor.

export type BgType = "solid" | "gradient" | "pattern";
export type HeroLayout = "centered" | "left";
export type CardStyle = "default" | "glass" | "bordered" | "flat" | "elevated";
export type PatternType = "dots" | "grid" | "lines" | "none";
export type ContainerWidth = "narrow" | "default" | "wide";

export interface ThemeConfig {
  // Background
  bgType: BgType;
  bgPrimary: string;      // hex - solid color or gradient start
  bgSecondary: string;    // hex - gradient end
  bgAngle: number;        // gradient angle 0-360
  patternType: PatternType;
  patternColor: string;   // hex - pattern line/dot color
  // Colors
  accentColor: string;    // hex - links, icons, tags, timeline dots
  textColor: string;      // hex - main body text
  subtextColor: string;   // hex - muted/secondary text
  cardBg: string;         // hex - card background
  cardBorder: string;     // hex - card border
  // Typography
  headingFont: string;    // CSS font-family name
  bodyFont: string;
  // Layout
  heroLayout: HeroLayout;
  cardStyle: CardStyle;
  containerWidth: ContainerWidth;
  // Content visibility
  showExperience: boolean;
  showEducation: boolean;
  showDemos: boolean;
  showSkills: boolean;
  showVolunteering: boolean;
  // Advanced
  customCss?: string;
}

export const DEFAULT_THEME: ThemeConfig = {
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
};

export const THEME_PRESETS: { id: string; name: string; description: string; config: ThemeConfig }[] = [
  {
    id: "arctic",
    name: "Arctic",
    description: "Clean white, minimal",
    config: DEFAULT_THEME,
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Dark, electric indigo",
    config: {
      bgType: "solid",
      bgPrimary: "#0a0a0f",
      bgSecondary: "#1a1a2e",
      bgAngle: 135,
      patternType: "dots",
      patternColor: "#6366f1",
      accentColor: "#818cf8",
      textColor: "#f1f5f9",
      subtextColor: "#94a3b8",
      cardBg: "#12121a",
      cardBorder: "#1e1e30",
      headingFont: "Syne",
      bodyFont: "DM Sans",
      heroLayout: "centered",
      cardStyle: "elevated",
      containerWidth: "default",
      showExperience: true,
      showEducation: true,
      showDemos: true,
    showSkills: true,
    showVolunteering: true,
    },
  },
  {
    id: "noir",
    name: "Noir",
    description: "Jet black, gold accents",
    config: {
      bgType: "solid",
      bgPrimary: "#0d0d0d",
      bgSecondary: "#1a1a1a",
      bgAngle: 180,
      patternType: "none",
      patternColor: "#d4a852",
      accentColor: "#d4a852",
      textColor: "#f5f5f0",
      subtextColor: "#99998a",
      cardBg: "#181818",
      cardBorder: "#2a2a2a",
      headingFont: "Fraunces",
      bodyFont: "IBM Plex Sans",
      heroLayout: "left",
      cardStyle: "bordered",
      containerWidth: "default",
      showExperience: true,
      showEducation: true,
      showDemos: true,
    showSkills: true,
    showVolunteering: true,
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Deep navy to teal",
    config: {
      bgType: "gradient",
      bgPrimary: "#0c1b4d",
      bgSecondary: "#0e4d63",
      bgAngle: 160,
      patternType: "none",
      patternColor: "#38bdf8",
      accentColor: "#38bdf8",
      textColor: "#e0f2fe",
      subtextColor: "#7dd3fc",
      cardBg: "#0f1f4a",
      cardBorder: "#1e3a5f",
      headingFont: "Space Grotesk",
      bodyFont: "DM Sans",
      heroLayout: "centered",
      cardStyle: "glass",
      containerWidth: "default",
      showExperience: true,
      showEducation: true,
      showDemos: true,
    showSkills: true,
    showVolunteering: true,
    },
  },
  {
    id: "forest",
    name: "Forest",
    description: "Dark green, earthy serif",
    config: {
      bgType: "solid",
      bgPrimary: "#0d1f0d",
      bgSecondary: "#1a3a1a",
      bgAngle: 135,
      patternType: "lines",
      patternColor: "#2d6a2d",
      accentColor: "#4ade80",
      textColor: "#f0fdf4",
      subtextColor: "#86efac",
      cardBg: "#162016",
      cardBorder: "#2d3d2d",
      headingFont: "Cormorant Garamond",
      bodyFont: "Lato",
      heroLayout: "centered",
      cardStyle: "bordered",
      containerWidth: "default",
      showExperience: true,
      showEducation: true,
      showDemos: true,
    showSkills: true,
    showVolunteering: true,
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "Purple-to-blue gradient, glassy",
    config: {
      bgType: "gradient",
      bgPrimary: "#1a0533",
      bgSecondary: "#0d2b4e",
      bgAngle: 145,
      patternType: "dots",
      patternColor: "#c084fc",
      accentColor: "#e879f9",
      textColor: "#f5f3ff",
      subtextColor: "#c4b5fd",
      cardBg: "#1e0a3a",
      cardBorder: "#3b2060",
      headingFont: "Syne",
      bodyFont: "Outfit",
      heroLayout: "centered",
      cardStyle: "glass",
      containerWidth: "wide",
      showExperience: true,
      showEducation: true,
      showDemos: true,
    showSkills: true,
    showVolunteering: true,
    },
  },
  {
    id: "cream",
    name: "Cream",
    description: "Warm off-white, editorial serif",
    config: {
      bgType: "solid",
      bgPrimary: "#faf6f1",
      bgSecondary: "#f0e8da",
      bgAngle: 135,
      patternType: "none",
      patternColor: "#92673a",
      accentColor: "#92673a",
      textColor: "#2c1810",
      subtextColor: "#6b4c35",
      cardBg: "#f4ede4",
      cardBorder: "#d9c4b0",
      headingFont: "Playfair Display",
      bodyFont: "Lato",
      heroLayout: "left",
      cardStyle: "default",
      containerWidth: "narrow",
      showExperience: true,
      showEducation: true,
      showDemos: true,
    showSkills: true,
    showVolunteering: true,
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Fiery gradient, warm tones",
    config: {
      bgType: "gradient",
      bgPrimary: "#7c1d2c",
      bgSecondary: "#c05826",
      bgAngle: 160,
      patternType: "none",
      patternColor: "#fbbf24",
      accentColor: "#fbbf24",
      textColor: "#fff7ed",
      subtextColor: "#fed7aa",
      cardBg: "#7c1d2c",
      cardBorder: "#9a2d3f",
      headingFont: "Raleway",
      bodyFont: "Nunito",
      heroLayout: "centered",
      cardStyle: "glass",
      containerWidth: "default",
      showExperience: true,
      showEducation: true,
      showDemos: true,
    showSkills: true,
    showVolunteering: true,
    },
  },
  {
    id: "slate",
    name: "Slate",
    description: "Technical dark blue, grid pattern",
    config: {
      bgType: "solid",
      bgPrimary: "#0f172a",
      bgSecondary: "#1e293b",
      bgAngle: 135,
      patternType: "grid",
      patternColor: "#334155",
      accentColor: "#38bdf8",
      textColor: "#f8fafc",
      subtextColor: "#94a3b8",
      cardBg: "#1e293b",
      cardBorder: "#334155",
      headingFont: "Oswald",
      bodyFont: "IBM Plex Sans",
      heroLayout: "left",
      cardStyle: "flat",
      containerWidth: "wide",
      showExperience: true,
      showEducation: true,
      showDemos: true,
    showSkills: true,
    showVolunteering: true,
    },
  },
  {
    id: "rose",
    name: "Rose",
    description: "Soft pink gradient, elevated cards",
    config: {
      bgType: "gradient",
      bgPrimary: "#fff0f3",
      bgSecondary: "#ffe4e8",
      bgAngle: 135,
      patternType: "none",
      patternColor: "#f43f5e",
      accentColor: "#f43f5e",
      textColor: "#1c0510",
      subtextColor: "#9f1239",
      cardBg: "#fff5f7",
      cardBorder: "#fecdd3",
      headingFont: "DM Serif Display",
      bodyFont: "Nunito",
      heroLayout: "centered",
      cardStyle: "elevated",
      containerWidth: "narrow",
      showExperience: true,
      showEducation: true,
      showDemos: true,
    showSkills: true,
    showVolunteering: true,
    },
  },
  {
    id: "sage",
    name: "Sage",
    description: "Muted green, organic left-layout",
    config: {
      bgType: "solid",
      bgPrimary: "#f2f5f0",
      bgSecondary: "#e4ede0",
      bgAngle: 135,
      patternType: "dots",
      patternColor: "#6b8f5e",
      accentColor: "#4a7c59",
      textColor: "#1e2d19",
      subtextColor: "#567a4a",
      cardBg: "#e8efe4",
      cardBorder: "#c5d9bf",
      headingFont: "Cormorant Garamond",
      bodyFont: "Source Sans 3",
      heroLayout: "left",
      cardStyle: "default",
      containerWidth: "narrow",
      showExperience: true,
      showEducation: true,
      showDemos: true,
    showSkills: true,
    showVolunteering: true,
    },
  },
  {
    id: "crimson",
    name: "Crimson",
    description: "Dark red, bold display font",
    config: {
      bgType: "solid",
      bgPrimary: "#0d0205",
      bgSecondary: "#1a0510",
      bgAngle: 135,
      patternType: "lines",
      patternColor: "#9f1239",
      accentColor: "#fb7185",
      textColor: "#fff1f2",
      subtextColor: "#fda4af",
      cardBg: "#180510",
      cardBorder: "#4c0519",
      headingFont: "Bebas Neue",
      bodyFont: "Outfit",
      heroLayout: "centered",
      cardStyle: "elevated",
      containerWidth: "default",
      showExperience: true,
      showEducation: true,
      showDemos: true,
    showSkills: true,
    showVolunteering: true,
    },
  },
  {
    id: "ember",
    name: "Ember",
    description: "Smouldering dark with warm orange",
    config: {
      bgType: "solid",
      bgPrimary: "#1a0e08",
      bgSecondary: "#2d1a0f",
      bgAngle: 135,
      patternType: "none",
      patternColor: "#ea580c",
      accentColor: "#fb923c",
      textColor: "#fff7ed",
      subtextColor: "#fdba74",
      cardBg: "#1e1108",
      cardBorder: "#3d2010",
      headingFont: "Oswald",
      bodyFont: "DM Sans",
      heroLayout: "left",
      cardStyle: "elevated",
      containerWidth: "default",
      showExperience: true,
      showEducation: true,
      showDemos: true,
    showSkills: true,
    showVolunteering: true,
    },
  },
  {
    id: "lavender",
    name: "Lavender",
    description: "Soft purple, calming light feel",
    config: {
      bgType: "gradient",
      bgPrimary: "#f5f0ff",
      bgSecondary: "#ede4ff",
      bgAngle: 150,
      patternType: "none",
      patternColor: "#8b5cf6",
      accentColor: "#7c3aed",
      textColor: "#1e0a3e",
      subtextColor: "#6d28d9",
      cardBg: "#f3ecff",
      cardBorder: "#ddd6fe",
      headingFont: "DM Serif Display",
      bodyFont: "Nunito",
      heroLayout: "centered",
      cardStyle: "default",
      containerWidth: "narrow",
      showExperience: true,
      showEducation: true,
      showDemos: true,
    showSkills: true,
    showVolunteering: true,
    },
  },
  {
    id: "copper",
    name: "Copper",
    description: "Warm metallics, dark earth tones",
    config: {
      bgType: "solid",
      bgPrimary: "#1c1210",
      bgSecondary: "#2a1c17",
      bgAngle: 135,
      patternType: "dots",
      patternColor: "#b87333",
      accentColor: "#d4915a",
      textColor: "#fdf2e9",
      subtextColor: "#c9a88c",
      cardBg: "#221812",
      cardBorder: "#3a271e",
      headingFont: "Fraunces",
      bodyFont: "Lato",
      heroLayout: "left",
      cardStyle: "bordered",
      containerWidth: "default",
      showExperience: true,
      showEducation: true,
      showDemos: true,
    showSkills: true,
    showVolunteering: true,
    },
  },
  {
    id: "obsidian",
    name: "Obsidian",
    description: "Deep black, ice-blue luminescence",
    config: {
      bgType: "solid",
      bgPrimary: "#050508",
      bgSecondary: "#0c0c14",
      bgAngle: 180,
      patternType: "grid",
      patternColor: "#1e293b",
      accentColor: "#67e8f9",
      textColor: "#f0f9ff",
      subtextColor: "#7dd3fc",
      cardBg: "#0a0a14",
      cardBorder: "#1e293b",
      headingFont: "Space Grotesk",
      bodyFont: "IBM Plex Sans",
      heroLayout: "centered",
      cardStyle: "glass",
      containerWidth: "default",
      showExperience: true,
      showEducation: true,
      showDemos: true,
    showSkills: true,
    showVolunteering: true,
    },
  },
  {
    id: "dusk",
    name: "Dusk",
    description: "Twilight purple-to-pink gradient",
    config: {
      bgType: "gradient",
      bgPrimary: "#1a0a2e",
      bgSecondary: "#3b0a45",
      bgAngle: 170,
      patternType: "none",
      patternColor: "#f472b6",
      accentColor: "#f472b6",
      textColor: "#fdf2f8",
      subtextColor: "#f9a8d4",
      cardBg: "#200f35",
      cardBorder: "#4a154b",
      headingFont: "Raleway",
      bodyFont: "Outfit",
      heroLayout: "centered",
      cardStyle: "glass",
      containerWidth: "wide",
      showExperience: true,
      showEducation: true,
      showDemos: true,
    showSkills: true,
    showVolunteering: true,
    },
  },
  {
    id: "mint",
    name: "Mint",
    description: "Fresh green-white, clean modern",
    config: {
      bgType: "solid",
      bgPrimary: "#f0fdf4",
      bgSecondary: "#ecfdf5",
      bgAngle: 135,
      patternType: "none",
      patternColor: "#10b981",
      accentColor: "#059669",
      textColor: "#052e16",
      subtextColor: "#166534",
      cardBg: "#ecfdf5",
      cardBorder: "#bbf7d0",
      headingFont: "Space Grotesk",
      bodyFont: "DM Sans",
      heroLayout: "left",
      cardStyle: "flat",
      containerWidth: "default",
      showExperience: true,
      showEducation: true,
      showDemos: true,
    showSkills: true,
    showVolunteering: true,
    },
  },
];

// ── Font lists ────────────────────────────────────────────────────────────

export const HEADING_FONTS = [
  { label: "Inter", value: "Inter", googleSlug: "Inter:wght@400;600;700;800" },
  { label: "Playfair Display", value: "Playfair Display", googleSlug: "Playfair+Display:wght@400;600;700" },
  { label: "Space Grotesk", value: "Space Grotesk", googleSlug: "Space+Grotesk:wght@400;600;700" },
  { label: "DM Serif Display", value: "DM Serif Display", googleSlug: "DM+Serif+Display" },
  { label: "Syne", value: "Syne", googleSlug: "Syne:wght@400;600;700;800" },
  { label: "Fraunces", value: "Fraunces", googleSlug: "Fraunces:wght@400;600;700" },
  { label: "Bebas Neue", value: "Bebas Neue", googleSlug: "Bebas+Neue" },
  { label: "Cormorant Garamond", value: "Cormorant Garamond", googleSlug: "Cormorant+Garamond:wght@400;600;700" },
  { label: "Raleway", value: "Raleway", googleSlug: "Raleway:wght@400;600;700" },
  { label: "Oswald", value: "Oswald", googleSlug: "Oswald:wght@400;600;700" },
] as const;

export const BODY_FONTS = [
  { label: "Inter", value: "Inter", googleSlug: "Inter:wght@400;500;600" },
  { label: "DM Sans", value: "DM Sans", googleSlug: "DM+Sans:wght@400;500;600" },
  { label: "Nunito", value: "Nunito", googleSlug: "Nunito:wght@400;500;600" },
  { label: "Lato", value: "Lato", googleSlug: "Lato:wght@400;700" },
  { label: "IBM Plex Sans", value: "IBM Plex Sans", googleSlug: "IBM+Plex+Sans:wght@400;500;600" },
  { label: "Source Sans 3", value: "Source Sans 3", googleSlug: "Source+Sans+3:wght@400;600" },
  { label: "Outfit", value: "Outfit", googleSlug: "Outfit:wght@400;500;600" },
] as const;

// ── CSS Helpers ───────────────────────────────────────────────────────────

export function getGoogleFontsUrl(headingFont: string, bodyFont: string): string | null {
  const fontsNeeded = new Set<string>();
  const headingData = HEADING_FONTS.find(f => f.value === headingFont);
  if (headingData && headingFont !== "Inter") {
    fontsNeeded.add(`family=${headingData.googleSlug}`);
  }
  const bodyData = BODY_FONTS.find(f => f.value === bodyFont);
  if (bodyData && bodyFont !== "Inter") {
    fontsNeeded.add(`family=${bodyData.googleSlug}`);
  }
  if (fontsNeeded.size === 0) return null;
  return `https://fonts.googleapis.com/css2?${Array.from(fontsNeeded).join("&")}&display=swap`;
}

export function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace("#", "");
  const full = cleaned.length === 3
    ? cleaned.split("").map(c => c + c).join("")
    : cleaned;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function getBackgroundStyle(theme: ThemeConfig): React.CSSProperties {
  const base: React.CSSProperties = {};

  if (theme.bgType === "gradient") {
    base.background = `linear-gradient(${theme.bgAngle}deg, ${theme.bgPrimary}, ${theme.bgSecondary})`;
  } else {
    base.backgroundColor = theme.bgPrimary;
    if (theme.bgType === "pattern" && theme.patternType !== "none") {
      const pattern = getPatternCss(theme.patternType, theme.patternColor);
      base.backgroundImage = pattern;
      base.backgroundSize = getPatternSize(theme.patternType);
    }
  }

  return base;
}

export function getPatternCss(patternType: PatternType, patternColor: string): string {
  switch (patternType) {
    case "dots":
      return `radial-gradient(circle, ${hexToRgba(patternColor, 0.25)} 1px, transparent 1px)`;
    case "grid":
      return `repeating-linear-gradient(0deg, ${hexToRgba(patternColor, 0.15)} 0, ${hexToRgba(patternColor, 0.15)} 1px, transparent 0, transparent 100%), repeating-linear-gradient(90deg, ${hexToRgba(patternColor, 0.15)} 0, ${hexToRgba(patternColor, 0.15)} 1px, transparent 0, transparent 100%)`;
    case "lines":
      return `repeating-linear-gradient(45deg, ${hexToRgba(patternColor, 0.12)} 0, ${hexToRgba(patternColor, 0.12)} 1px, transparent 0, transparent 50%)`;
    default:
      return "none";
  }
}

export function getPatternSize(patternType: PatternType): string {
  switch (patternType) {
    case "dots": return "20px 20px";
    case "grid": return "32px 32px";
    case "lines": return "12px 12px";
    default: return "auto";
  }
}

export function getCardStyle(theme: ThemeConfig): React.CSSProperties {
  const base: React.CSSProperties = {
    borderRadius: "16px",
    padding: "24px",
    transition: "all 0.2s ease",
  };

  switch (theme.cardStyle) {
    case "glass":
      return {
        ...base,
        backgroundColor: hexToRgba(theme.cardBg, 0.25),
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${hexToRgba(theme.cardBorder, 0.3)}`,
        boxShadow: `0 8px 32px ${hexToRgba(theme.textColor, 0.08)}`,
      };
    case "bordered":
      return {
        ...base,
        backgroundColor: "transparent",
        border: `2px solid ${theme.accentColor}`,
        boxShadow: "none",
      };
    case "flat":
      return {
        backgroundColor: "transparent",
        border: "none",
        borderLeft: `3px solid ${theme.accentColor}`,
        borderRadius: "0",
        padding: "16px 0 16px 20px",
      };
    case "elevated":
      return {
        ...base,
        backgroundColor: theme.cardBg,
        border: "none",
        boxShadow: `0 20px 60px ${hexToRgba(theme.textColor, 0.12)}, 0 4px 16px ${hexToRgba(theme.textColor, 0.08)}`,
      };
    default:
      return {
        ...base,
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: "none",
      };
  }
}

export function getContainerMaxWidth(width: ContainerWidth): string {
  switch (width) {
    case "narrow": return "672px";
    case "wide": return "1024px";
    default: return "768px";
  }
}

export function resolveTheme(
  themeConfig: ThemeConfig | undefined | null,
  legacyTheme?: string
): ThemeConfig {
  if (themeConfig) return themeConfig;
  // Migrate legacy string themes
  const legacyMap: Record<string, string> = {
    ocean: "ocean",
    forest: "forest",
    sunset: "sunset",
    midnight: "midnight",
    rose: "rose",
  };
  const presetId = legacyMap[legacyTheme ?? ""];
  if (presetId) {
    const preset = THEME_PRESETS.find(p => p.id === presetId);
    if (preset) return preset.config;
  }
  return DEFAULT_THEME;
}

// ── Demo iframe theme injection ──────────────────────────────────────────
// Generates CSS custom properties + base styles that are injected into
// demo iframe <style> blocks so user-pasted HTML automatically inherits
// the portfolio theme without any manual styling.

export function buildDemoIframeCss(theme: ThemeConfig): string {
  const fontUrl = getGoogleFontsUrl(theme.headingFont, theme.bodyFont);
  const fontImport = fontUrl ? `@import url('${fontUrl}');` : "";

  // Determine if the theme is "dark" (luminance heuristic on bgPrimary)
  const bgHex = theme.bgPrimary.replace("#", "");
  const bgR = parseInt(bgHex.slice(0, 2), 16);
  const bgG = parseInt(bgHex.slice(2, 4), 16);
  const bgB = parseInt(bgHex.slice(4, 6), 16);
  const luminance = (0.299 * bgR + 0.587 * bgG + 0.114 * bgB) / 255;
  const isDark = luminance < 0.45;

  // Background CSS
  let bgCss: string;
  if (theme.bgType === "gradient") {
    bgCss = `background: linear-gradient(${theme.bgAngle}deg, ${theme.bgPrimary}, ${theme.bgSecondary});`;
  } else {
    bgCss = `background-color: ${theme.bgPrimary};`;
  }

  return `${fontImport}
:root {
  --demo-bg: ${theme.bgPrimary};
  --demo-bg-secondary: ${theme.bgSecondary};
  --demo-text: ${theme.textColor};
  --demo-subtext: ${theme.subtextColor};
  --demo-accent: ${theme.accentColor};
  --demo-card-bg: ${theme.cardBg};
  --demo-card-border: ${theme.cardBorder};
  --demo-heading-font: '${theme.headingFont}', system-ui, sans-serif;
  --demo-body-font: '${theme.bodyFont}', system-ui, sans-serif;
  --demo-surface: ${hexToRgba(theme.cardBg, 0.75)};
  --demo-border: ${theme.cardBorder};
  --demo-shadow: 0 4px 24px ${hexToRgba(theme.textColor, 0.07)};
  --demo-shadow-lg: 0 12px 48px ${hexToRgba(theme.textColor, 0.13)};
  --demo-accent-10: ${hexToRgba(theme.accentColor, 0.1)};
  --demo-accent-15: ${hexToRgba(theme.accentColor, 0.15)};
  --demo-accent-30: ${hexToRgba(theme.accentColor, 0.3)};
  --demo-radius: 16px;
  --demo-radius-sm: 10px;
  color-scheme: ${isDark ? "dark" : "light"};
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: var(--demo-body-font);
  ${bgCss}
  color: var(--demo-text);
  overflow-x: hidden;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, h4, h5, h6 {
  font-family: var(--demo-heading-font);
  color: var(--demo-text);
  line-height: 1.2;
}
a { color: var(--demo-accent); }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: ${hexToRgba(theme.textColor, 0.15)}; border-radius: 3px; }
`;
}
