// ── Theme System ────────────────────────────────────────────────────────────
// Defines the ThemeConfig type, 18 carefully designed presets, font lists,
// and CSS generation helpers. Used by the portfolio renderer + theme editor.

export type BgType = "solid" | "gradient" | "pattern";
export type HeroLayout = "centered" | "left" | "split" | "floating" | "banner" | "stacked" | "minimal" | "magazine" | "card" | "diagonal";
export type CardStyle = "default" | "glass" | "bordered" | "flat" | "elevated" | "minimal" | "neon" | "retro" | "shadow-pop" | "outline";
export type PatternType = "dots" | "grid" | "lines" | "cross" | "waves" | "hexagons" | "none";
export type ContainerWidth = "narrow" | "default" | "wide";
export type AnimationStyle = "none" | "subtle" | "bold" | "playful" | "cinematic" | "stagger";
export type GradientType = "linear" | "radial" | "conic";
export type HoverEffect = "none" | "lift" | "glow" | "tilt" | "scale";
export type PageTransition = "none" | "fade" | "slide" | "morph";
export type NavVariant = "default" | "minimal" | "pills" | "underline";
export type NavPosition = "left" | "right";
export type NavIconStyle = "default" | "outline" | "rounded" | "square";
export type ButtonStyle = "default" | "rounded" | "pill" | "outline" | "ghost" | "glow";
export type ImageFilter = "none" | "grayscale" | "sepia" | "saturate" | "contrast" | "brightness";
export type SectionSpacing = "compact" | "comfortable" | "spacious";
export type SocialIconStyle = "default" | "rounded" | "square" | "pill" | "outline" | "glow";
export type SplashStyle = "fade" | "slide-up" | "zoom" | "blur";
export type FontScale = "small" | "medium" | "large";

export interface DarkPalette {
  bgPrimary: string;
  bgSecondary: string;
  textColor: string;
  subtextColor: string;
  cardBg: string;
  cardBorder: string;
  accentColor: string;
}

export interface DarkModeConfig {
  enabled: boolean;
  darkPalette?: DarkPalette;
}

export interface NavStyleConfig {
  variant: NavVariant;
  position: NavPosition;
  width: "narrow" | "default" | "wide";
  showLabels: boolean;
  iconStyle?: NavIconStyle;
}

export interface SplashScreenConfig {
  enabled: boolean;
  style?: SplashStyle;
  duration?: number; // ms
  bgColor?: string;
  textColor?: string;
}

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
  showCertificates?: boolean;
  showContact?: boolean;
  // Animation
  animationStyle?: AnimationStyle;
  // Advanced
  customCss?: string;

  // ── Pro Features ──────────────────────────────────────────
  // Gradient system
  bgGradientType?: GradientType;
  bgGrainOverlay?: boolean;
  bgGrainOpacity?: number; // 0-100

  // Animation & Motion
  hoverEffects?: HoverEffect;
  pageTransition?: PageTransition;
  parallaxEnabled?: boolean;

  // Dark/Light mode
  darkMode?: DarkModeConfig;

  // Navigation styling
  navStyle?: NavStyleConfig;

  // Button styling
  buttonStyle?: ButtonStyle;

  // Image filters
  imageFilter?: ImageFilter;

  // Section spacing
  sectionSpacing?: SectionSpacing;

  // Social icon styles
  socialIconStyle?: SocialIconStyle;

  // Splash screen
  splashScreen?: SplashScreenConfig;

  // Typography scale
  fontScale?: FontScale;
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
    const gradType = theme.bgGradientType ?? "linear";
    switch (gradType) {
      case "radial":
        base.background = `radial-gradient(circle at center, ${theme.bgPrimary}, ${theme.bgSecondary})`;
        break;
      case "conic":
        base.background = `conic-gradient(from ${theme.bgAngle}deg, ${theme.bgPrimary}, ${theme.bgSecondary}, ${theme.bgPrimary})`;
        break;
      default:
        base.background = `linear-gradient(${theme.bgAngle}deg, ${theme.bgPrimary}, ${theme.bgSecondary})`;
    }
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
    case "cross":
      return `repeating-linear-gradient(0deg, ${hexToRgba(patternColor, 0.12)} 0, ${hexToRgba(patternColor, 0.12)} 1px, transparent 0, transparent 100%), repeating-linear-gradient(90deg, ${hexToRgba(patternColor, 0.12)} 0, ${hexToRgba(patternColor, 0.12)} 1px, transparent 0, transparent 100%), repeating-linear-gradient(45deg, ${hexToRgba(patternColor, 0.06)} 0, ${hexToRgba(patternColor, 0.06)} 1px, transparent 0, transparent 100%), repeating-linear-gradient(-45deg, ${hexToRgba(patternColor, 0.06)} 0, ${hexToRgba(patternColor, 0.06)} 1px, transparent 0, transparent 100%)`;
    case "waves":
      return `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q25 0 50 10 T100 10' fill='none' stroke='${encodeURIComponent(hexToRgba(patternColor, 0.15))}' stroke-width='1'/%3E%3C/svg%3E")`;
    case "hexagons":
      return `url("data:image/svg+xml,%3Csvg width='28' height='49' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 0 L28 8.5 L28 24.5 L14 33 L0 24.5 L0 8.5 Z M14 16.5 L28 25 L28 41 L14 49 L0 41 L0 25 Z' fill='none' stroke='${encodeURIComponent(hexToRgba(patternColor, 0.12))}' stroke-width='0.5'/%3E%3C/svg%3E")`;
    default:
      return "none";
  }
}

export function getPatternSize(patternType: PatternType): string {
  switch (patternType) {
    case "dots": return "20px 20px";
    case "grid": return "32px 32px";
    case "lines": return "12px 12px";
    case "cross": return "24px 24px";
    case "waves": return "100px 20px";
    case "hexagons": return "28px 49px";
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
    case "minimal":
      return {
        ...base,
        backgroundColor: "transparent",
        border: "none",
        borderBottom: `1px solid ${hexToRgba(theme.cardBorder, 0.3)}`,
        borderRadius: "0",
        padding: "20px 0",
      };
    case "neon":
      return {
        ...base,
        backgroundColor: hexToRgba(theme.cardBg, 0.4),
        border: `1px solid ${hexToRgba(theme.accentColor, 0.5)}`,
        boxShadow: `0 0 20px ${hexToRgba(theme.accentColor, 0.15)}, 0 0 60px ${hexToRgba(theme.accentColor, 0.05)}, inset 0 0 20px ${hexToRgba(theme.accentColor, 0.05)}`,
      };
    case "retro":
      return {
        ...base,
        backgroundColor: theme.cardBg,
        border: `3px solid ${theme.textColor}`,
        borderRadius: "4px",
        boxShadow: `6px 6px 0 ${theme.textColor}`,
      };
    case "shadow-pop":
      return {
        ...base,
        backgroundColor: theme.cardBg,
        border: `1px solid ${hexToRgba(theme.cardBorder, 0.5)}`,
        boxShadow: `0 25px 80px ${hexToRgba(theme.accentColor, 0.15)}, 0 10px 30px ${hexToRgba(theme.textColor, 0.08)}`,
      };
    case "outline":
      return {
        ...base,
        backgroundColor: "transparent",
        border: `1px solid ${hexToRgba(theme.cardBorder, 0.5)}`,
        borderRadius: "12px",
        boxShadow: "none",
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

// ── Animation CSS by style ─────────────────────────────────────────────────

export function getAnimationCss(id: string, style: AnimationStyle = "subtle"): string {
  if (style === "none") {
    return `#${id} .pf-animate { animation: none; }`;
  }

  const variants: Record<Exclude<AnimationStyle, "none">, string> = {
    subtle: `
      @keyframes pf-fade-up {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      #${id} .pf-animate { animation: pf-fade-up 0.5s ease both; }
      #${id} section:nth-child(1) { animation-delay: 0s; }
      #${id} section:nth-child(2) { animation-delay: 0.08s; }
      #${id} section:nth-child(3) { animation-delay: 0.16s; }
    `,
    bold: `
      @keyframes pf-slide-in {
        from { opacity: 0; transform: translateY(32px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      #${id} .pf-animate { animation: pf-slide-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
      #${id} section:nth-child(1) { animation-delay: 0s; }
      #${id} section:nth-child(2) { animation-delay: 0.12s; }
      #${id} section:nth-child(3) { animation-delay: 0.24s; }
    `,
    playful: `
      @keyframes pf-bounce-in {
        0%   { opacity: 0; transform: translateY(48px) scale(0.9); }
        60%  { opacity: 1; transform: translateY(-8px) scale(1.02); }
        80%  { transform: translateY(4px) scale(0.99); }
        100% { transform: translateY(0) scale(1); }
      }
      #${id} .pf-animate { animation: pf-bounce-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
      #${id} section:nth-child(1) { animation-delay: 0s; }
      #${id} section:nth-child(2) { animation-delay: 0.15s; }
      #${id} section:nth-child(3) { animation-delay: 0.3s; }
    `,
    cinematic: `
      @keyframes pf-cinema-in {
        0%   { opacity: 0; transform: translateY(60px) scale(0.92); filter: blur(8px); }
        60%  { filter: blur(0); }
        100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }
      #${id} .pf-animate { animation: pf-cinema-in 0.9s cubic-bezier(0.16, 1, 0.3, 1) both; }
      #${id} section:nth-child(1) { animation-delay: 0s; }
      #${id} section:nth-child(2) { animation-delay: 0.2s; }
      #${id} section:nth-child(3) { animation-delay: 0.4s; }
      #${id} .pf-card { animation: pf-cinema-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
    `,
    stagger: `
      @keyframes pf-stagger-in {
        from { opacity: 0; transform: translateX(-30px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      #${id} .pf-animate { animation: pf-stagger-in 0.5s ease both; }
      #${id} section:nth-child(1) { animation-delay: 0s; }
      #${id} section:nth-child(2) { animation-delay: 0.1s; }
      #${id} section:nth-child(3) { animation-delay: 0.2s; }
      #${id} .pf-card:nth-child(1) { animation: pf-stagger-in 0.4s ease 0.1s both; }
      #${id} .pf-card:nth-child(2) { animation: pf-stagger-in 0.4s ease 0.2s both; }
      #${id} .pf-card:nth-child(3) { animation: pf-stagger-in 0.4s ease 0.3s both; }
      #${id} .pf-card:nth-child(4) { animation: pf-stagger-in 0.4s ease 0.4s both; }
      #${id} .pf-card:nth-child(5) { animation: pf-stagger-in 0.4s ease 0.5s both; }
      #${id} .pf-card:nth-child(6) { animation: pf-stagger-in 0.4s ease 0.6s both; }
    `,
  };

  return variants[style];
}

// ── Pro Feature CSS Helpers ────────────────────────────────────────────────

export function getGrainOverlayCss(id: string, opacity: number = 40): string {
  return `
    #${id} .pf-content::before {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 1;
      opacity: ${opacity / 100};
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
      background-repeat: repeat;
      background-size: 256px 256px;
    }
  `;
}

export function getHoverEffectsCss(id: string, effect: HoverEffect): string {
  switch (effect) {
    case "lift":
      return `
        #${id} .pf-card:hover { transform: translateY(-8px); box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
      `;
    case "glow":
      return `
        #${id} .pf-card { transition: box-shadow 0.3s ease, transform 0.3s ease; }
        #${id} .pf-card:hover { box-shadow: 0 0 30px rgba(var(--pf-accent-rgb, 99,102,241), 0.25), 0 0 60px rgba(var(--pf-accent-rgb, 99,102,241), 0.1); transform: translateY(-2px); }
      `;
    case "tilt":
      return `
        #${id} .pf-card { transition: transform 0.3s ease; transform-style: preserve-3d; }
        #${id} .pf-card:hover { transform: perspective(1000px) rotateX(-2deg) rotateY(3deg) translateY(-4px); }
      `;
    case "scale":
      return `
        #${id} .pf-card { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        #${id} .pf-card:hover { transform: scale(1.03); }
      `;
    default:
      return "";
  }
}

export function getPageTransitionCss(id: string, transition: PageTransition): string {
  switch (transition) {
    case "fade":
      return `
        @keyframes pf-page-fade { from { opacity: 0; } to { opacity: 1; } }
        #${id} { animation: pf-page-fade 0.6s ease both; }
        #${id} .pf-content-inner section { animation: pf-page-fade 0.4s ease both; }
      `;
    case "slide":
      return `
        @keyframes pf-page-slide { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        #${id} { animation: pf-page-slide 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        #${id} .pf-content-inner section { animation: pf-page-slide 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `;
    case "morph":
      return `
        @keyframes pf-page-morph {
          0% { opacity: 0; transform: scale(0.98); filter: blur(4px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        #${id} { animation: pf-page-morph 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
        #${id} .pf-content-inner section { animation: pf-page-morph 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `;
    default:
      return "";
  }
}

export function getParallaxCss(id: string): string {
  return `
    #${id} .pf-content { perspective: 1px; overflow-y: auto; overflow-x: hidden; }
    #${id} .pf-home-split,
    #${id} .pf-home-hero { transform: translateZ(-0.5px) scale(1.5); transform-origin: center top; }
    #${id} .pf-section-title { transform: translateZ(0); }
  `;
}

export function getButtonStyleCss(id: string, style: ButtonStyle, accentColor: string): string {
  const base = `#${id} .pf-home-action-btn, #${id} a.pf-cert-badge, #${id} .pf-demo-link, #${id} .pf-view-all`;
  switch (style) {
    case "rounded":
      return `${base} { border-radius: 12px; }`;
    case "pill":
      return `${base} { border-radius: 999px; padding-left: 20px; padding-right: 20px; }`;
    case "outline":
      return `${base} { background: transparent !important; border: 2px solid ${accentColor} !important; color: ${accentColor} !important; }
              ${base}:hover { background: ${accentColor} !important; color: white !important; }`;
    case "glow":
      return `${base} { background: ${accentColor} !important; border: none !important; color: white !important; box-shadow: 0 4px 20px ${hexToRgba(accentColor, 0.4)}; }
              ${base}:hover { box-shadow: 0 6px 28px ${hexToRgba(accentColor, 0.6)}; }`;
    case "ghost":
      return `${base} { background: transparent !important; border: none !important; color: ${accentColor} !important; text-decoration: underline; text-underline-offset: 3px; }
              ${base}:hover { text-decoration-thickness: 2px; }`;
    default:
      return "";
  }
}

export function getImageFilterCss(id: string, filter: ImageFilter): string {
  const filterMap: Record<Exclude<ImageFilter, "none">, string> = {
    "grayscale": "grayscale(100%)",
    "sepia": "sepia(80%)",
    "contrast": "contrast(1.3) saturate(1.2)",
    "saturate": "saturate(1.5)",
    "brightness": "brightness(1.15) contrast(1.05)",
  };
  if (filter === "none") return "";
  return `
    #${id} .pf-work-card-img img,
    #${id} .pf-sidebar-avatar,
    #${id} .pf-edu-card-logo { filter: ${filterMap[filter]}; transition: filter 0.3s ease; }
    #${id} .pf-work-card:hover .pf-work-card-img img { filter: ${filterMap[filter]} brightness(1.05); }
  `;
}

export function getSectionSpacingCss(id: string, spacing: SectionSpacing): string {
  const values: Record<SectionSpacing, { section: string; cardGap: string; contentPad: string }> = {
    compact: { section: "24px", cardGap: "12px", contentPad: "16px 16px" },
    comfortable: { section: "40px", cardGap: "18px", contentPad: "28px 24px" },
    spacious: { section: "64px", cardGap: "24px", contentPad: "48px 32px" },
  };
  const v = values[spacing];
  return `
    #${id} section + section { margin-top: ${v.section}; }
    #${id} .pf-work-grid { gap: ${v.cardGap}; }
    #${id} .pf-content-inner { padding: ${v.contentPad}; }
  `;
}

export function getSocialIconStyleCss(id: string, style: SocialIconStyle, accentColor: string): string {
  const base = `#${id} .pf-home-meta a`;
  switch (style) {
    case "rounded":
      return `${base} { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: ${accentColor}; color: white !important; }`;
    case "square":
      return `${base} { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; background: ${accentColor}; color: white !important; }`;
    case "outline":
      return `${base} { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; border: 2px solid ${accentColor}; color: ${accentColor} !important; background: transparent; }`;
    case "pill":
      return `${base} { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 999px; background: ${hexToRgba(accentColor, 0.1)}; color: ${accentColor} !important; font-size: 0.75rem; }`;
    case "glow":
      return `${base} { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 12px; background: ${hexToRgba(accentColor, 0.1)}; color: ${accentColor} !important; box-shadow: 0 4px 12px ${hexToRgba(accentColor, 0.15)}; transition: transform 0.2s, box-shadow 0.2s; }
            ${base}:hover { transform: translateY(-2px); box-shadow: 0 8px 24px ${hexToRgba(accentColor, 0.25)}; }`;
    default:
      return "";
  }
}

export function getSplashScreenCss(config: SplashScreenConfig): string {
  if (!config.enabled) return "";
  const dur = (config.duration ?? 2000) / 1000;
  const bg = config.bgColor ?? "#000000";
  const txt = config.textColor ?? "#ffffff";
  const style = config.style ?? "fade";
  return `
    .pf-splash {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${bg};
      color: ${txt};
      animation: pf-splash-out 0.5s ease ${dur}s forwards;
    }
    .pf-splash-inner {
      text-align: center;
      animation: pf-splash-${style} ${dur * 0.7}s ease both;
    }
    @keyframes pf-splash-out {
      to { opacity: 0; pointer-events: none; visibility: hidden; }
    }
    @keyframes pf-splash-fade {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    @keyframes pf-splash-slide-up {
      0% { opacity: 0; transform: translateY(30px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes pf-splash-zoom {
      0% { opacity: 0; transform: scale(0.7); }
      50% { opacity: 1; transform: scale(1.05); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes pf-splash-blur {
      0% { opacity: 0; filter: blur(20px); transform: scale(1.1); }
      100% { opacity: 1; filter: blur(0); transform: scale(1); }
    }
  `;
}

export function getFontScaleCss(id: string, scale: FontScale): string {
  const multipliers: Record<FontScale, number> = {
    small: 0.875,
    medium: 1,
    large: 1.15,
  };
  const m = multipliers[scale];
  return `
    #${id} .pf-section-title { font-size: ${1.5 * m}rem; }
    #${id} .pf-card h3 { font-size: ${1 * m}rem; }
    #${id} .pf-card-desc,
    #${id} .pf-card-sub { font-size: ${0.875 * m}rem; }
    #${id} .pf-sidebar-name { font-size: ${1.05 * m}rem; }
    #${id} .pf-stat-value { font-size: ${1.5 * m}rem; }
    #${id} .pf-tag { font-size: ${0.75 * m}rem; }
  `;
}

export function getNavStyleCss(id: string, navStyle: NavStyleConfig, theme: ThemeConfig): string {
  let css = "";

  // Nav width
  const widthMap = { narrow: "200px", default: "236px", wide: "280px" };
  css += `#${id} .pf-sidebar { width: ${widthMap[navStyle.width]}; }\n`;

  // Position
  if (navStyle.position === "right") {
    css += `#${id} { flex-direction: row-reverse; }\n`;
    css += `#${id} .pf-sidebar { border-right: none; border-left: 1px solid ${theme.cardBorder}; }\n`;
  }

  // Variant
  switch (navStyle.variant) {
    case "minimal":
      css += `#${id} .pf-sidebar { background: transparent; border-color: transparent; width: 64px !important; }\n`;
      css += `#${id} .pf-sidebar-profile { padding: 16px 8px; }\n`;
      css += `#${id} .pf-sidebar-name, #${id} .pf-sidebar-headline { display: none; }\n`;
      css += `#${id} .pf-nav-text, #${id} .pf-nav-badge { display: none; }\n`;
      css += `#${id} .pf-nav-item { justify-content: center; padding: 12px; gap: 0; }\n`;
      css += `#${id} .pf-sidebar-label { display: none; }\n`;
      css += `#${id} .pf-nav-divider { display: none; }\n`;
      css += `#${id} .pf-sidebar-footer { font-size: 0; }\n`;
      css += `#${id} .pf-sidebar-footer a { font-size: 0; }\n`;
      break;
    case "pills":
      css += `#${id} .pf-nav-item { border-radius: 999px; }\n`;
      css += `#${id} .pf-nav-item.active { background: ${theme.accentColor}; color: white !important; }\n`;
      break;
    case "underline":
      css += `#${id} .pf-nav-item { border-radius: 0; border-left: 3px solid transparent; }\n`;
      css += `#${id} .pf-nav-item.active { border-left-color: ${theme.accentColor}; background: ${hexToRgba(theme.accentColor, 0.08)}; border-radius: 0; }\n`;
      break;
  }

  // Icon style
  if (navStyle.iconStyle === "outline") {
    css += `#${id} .pf-nav-item svg { stroke-width: 1.5; fill: none; }\n`;
  } else if (navStyle.iconStyle === "square") {
    css += `#${id} .pf-nav-item svg { fill: currentColor; stroke: none; }\n`;
  } else if (navStyle.iconStyle === "rounded") {
    css += `#${id} .pf-nav-item svg { stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }\n`;
  }

  // Label visibility
  if (!navStyle.showLabels) {
    css += `#${id} .pf-sidebar-label { display: none; }\n`;
  }

  return css;
}

// ── Card template metadata (for theme studio picker) ──────────────────────

export const CARD_TEMPLATES: { id: CardStyle; name: string; description: string }[] = [
  { id: "default", name: "Classic", description: "Clean card with subtle border" },
  { id: "glass", name: "Glass", description: "Frosted glassmorphism with blur" },
  { id: "bordered", name: "Bordered", description: "Bold accent-colored border" },
  { id: "flat", name: "Flat", description: "Borderless with left accent line" },
  { id: "elevated", name: "Elevated", description: "Floating with deep shadow" },
  { id: "minimal", name: "Minimal", description: "Clean divider-only separation" },
  { id: "neon", name: "Neon", description: "Glowing accent border with halo" },
  { id: "retro", name: "Retro", description: "Bold border with offset shadow" },
  { id: "shadow-pop", name: "Shadow Pop", description: "Dramatic colored shadow" },
  { id: "outline", name: "Outline", description: "Subtle transparent card" },
];

// ── Hero layout metadata ──────────────────────────────────────────────────

export const HERO_LAYOUTS: { id: HeroLayout; name: string; description: string }[] = [
  { id: "centered", name: "Centered", description: "Name and headline centered" },
  { id: "left", name: "Left Aligned", description: "Content pushed to the left" },
  { id: "split", name: "Split", description: "Photo left, info right" },
  { id: "floating", name: "Floating", description: "Info left, photo right" },
  { id: "banner", name: "Banner", description: "Edge-to-edge dramatic hero" },
  { id: "stacked", name: "Stacked", description: "Large photo above, text below" },
  { id: "minimal", name: "Minimal", description: "Just name, nothing else" },
  { id: "magazine", name: "Magazine", description: "Oversized name, small details" },
  { id: "card", name: "Card", description: "Info inside a floating card" },
  { id: "diagonal", name: "Diagonal", description: "Angled split with photo" },
];
