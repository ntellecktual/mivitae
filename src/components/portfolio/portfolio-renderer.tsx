"use client";

import { useEffect, useId, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { MapPin, Globe, ExternalLink, Briefcase, GraduationCap, Zap, Wrench, Heart, Mail } from "lucide-react";
import {
  type ThemeConfig,
  type AnimationStyle,
  resolveTheme,
  getBackgroundStyle,
  getCardStyle,
  getContainerMaxWidth,
  getGoogleFontsUrl,
  hexToRgba,
  buildDemoIframeCss,
  getAnimationCss,
} from "@/lib/theme";

// ── CSS Sanitizer ──────────────────────────────────────────────────────────
// Strips dangerous patterns from user-supplied custom CSS to prevent XSS.

function sanitizeCss(css: string): string {
  let s = css;
  // Block </style> tag breakout (case-insensitive)
  s = s.replace(/<\s*\/\s*style\s*>/gi, "");
  // Block <script> injection
  s = s.replace(/<\s*script[^>]*>/gi, "");
  // Block javascript: and data: in url()
  s = s.replace(/url\s*\(\s*(['"]?)\s*(javascript|data)\s*:/gi, 'url($1blocked:');
  // Block IE expression()
  s = s.replace(/expression\s*\(/gi, "blocked(");
  // Block @import (data exfiltration / remote CSS injection)
  s = s.replace(/@import\b/gi, "/* blocked-import */");
  // Block -moz-binding (Firefox XBL)
  s = s.replace(/-moz-binding\s*:/gi, "blocked:");
  // Block behavior: (IE HTCs)
  s = s.replace(/behavior\s*:/gi, "blocked:");
  return s;
}

// ── Prop Types (mirror Convex document shapes) ─────────────────────────────

type Profile = {
  _id: string;
  slug: string;
  headline?: string;
  bio?: string;
  location?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  theme?: string;
  themeConfig?: ThemeConfig;
};

type Section = {
  _id: string;
  companyName: string;
  role: string;
  startDate: string;
  endDate?: string;
  description?: string;
  skills: string[];
  achievements: string[];
  order: number;
  demoIds?: string[];
};

type Education = {
  _id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear: number;
  endYear?: number;
  gpa?: string;
  honors?: string;
  activities?: string[];
  order: number;
};

type Demo = {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  htmlContent?: string;
  bannerUrl?: string;
  status?: string;
  tags?: string[];
  demoUrl?: string;
  githubUrl?: string;
  isPublic: boolean;
};

type Skill = {
  _id: string;
  name: string;
  category: string;
  proficiency?: number;
  yearsOfExperience?: number;
  order: number;
};

type VolunteeringEntry = {
  _id: string;
  organization: string;
  role: string;
  cause?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  order: number;
};

type Certificate = {
  _id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  order: number;
};

interface PortfolioRendererProps {
  profile: Profile;
  sections: Section[];
  education: Education[];
  demos: Demo[];
  skills?: Skill[];
  volunteering?: VolunteeringEntry[];
  certificates?: Certificate[];
  /** If provided, overrides the theme stored in profile */
  themeOverride?: ThemeConfig;
  /** Compact/preview mode — strips font injection and external deps */
  preview?: boolean;
}

// ── CSS Generation ──────────────────────────────────────────────────────────

function buildPortfolioCss(id: string, theme: ThemeConfig): string {
  const bg = getBackgroundStyle(theme);
  const card = getCardStyle(theme);
  const maxW = getContainerMaxWidth(theme.containerWidth);
  const isLeft = theme.heroLayout === "left";

  // Convert React CSSProperties to CSS string
  const bgCss = Object.entries(bg)
    .map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${v}`)
    .join("; ");
  const cardCss = Object.entries(card)
    .map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${v}`)
    .join("; ");

  return `
    /* ── Portfolio Theme (scoped to #${id}) ── */
    #${id} {
      ${bgCss};
      color: ${theme.textColor};
      font-family: '${theme.bodyFont}', sans-serif;
      min-height: 100vh;
    }

    #${id} .pf-hero {
      border-bottom: 1px solid ${hexToRgba(theme.cardBorder, 0.3)};
      padding: ${isLeft ? "64px 16px 48px" : "80px 16px"};
    }

    #${id} .pf-hero-inner {
      max-width: ${maxW};
      margin: 0 auto;
      text-align: ${isLeft ? "left" : "center"};
    }

    #${id} .pf-hero h1 {
      font-family: '${theme.headingFont}', sans-serif;
      font-size: clamp(2rem, 5vw, 3.25rem);
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.1;
      color: ${theme.textColor};
      margin: 0;
    }

    #${id} .pf-hero-bio {
      margin-top: 16px;
      font-size: 1.1rem;
      line-height: 1.65;
      color: ${theme.subtextColor};
      max-width: ${isLeft ? "600px" : "580px"};
      ${isLeft ? "" : "margin-left: auto; margin-right: auto;"}
    }

    #${id} .pf-hero-meta {
      margin-top: 24px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: ${isLeft ? "flex-start" : "center"};
      gap: 16px;
      font-size: 0.875rem;
      color: ${theme.subtextColor};
    }

    #${id} .pf-hero-meta a {
      color: ${theme.accentColor};
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    #${id} .pf-hero-meta a:hover { text-decoration: underline; }

    #${id} .pf-hero-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    #${id} .pf-main {
      max-width: ${maxW};
      margin: 0 auto;
      padding: 48px 16px;
      display: flex;
      flex-direction: column;
      gap: 48px;
    }

    #${id} .pf-section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.375rem;
      font-weight: 700;
      font-family: '${theme.headingFont}', sans-serif;
      color: ${theme.textColor};
      margin-bottom: 16px;
    }

    #${id} .pf-divider {
      border-bottom: 1px solid ${hexToRgba(theme.cardBorder, 0.6)};
      margin-bottom: 24px;
    }

    #${id} .pf-card {
      ${cardCss};
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    #${id} .pf-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px ${hexToRgba(theme.cardBorder, 0.3)};
    }

    #${id} .pf-card h3 {
      margin: 0;
      font-family: '${theme.headingFont}', sans-serif;
      color: ${theme.textColor};
      font-size: 1rem;
      font-weight: 600;
    }

    #${id} .pf-card-sub {
      margin: 4px 0 0;
      font-size: 0.875rem;
      color: ${theme.subtextColor};
    }

    #${id} .pf-card-desc {
      margin: 10px 0 0;
      font-size: 0.875rem;
      color: ${theme.subtextColor};
      line-height: 1.6;
    }

    #${id} .pf-card-meta {
      font-size: 0.75rem;
      color: ${theme.subtextColor};
    }

    #${id} .pf-achievements {
      margin: 10px 0 0;
      padding-left: 16px;
      font-size: 0.875rem;
      color: ${theme.subtextColor};
      line-height: 1.7;
    }

    #${id} .pf-tags {
      margin-top: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    #${id} .pf-tag {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 500;
      background-color: ${hexToRgba(theme.accentColor, 0.15)};
      color: ${theme.accentColor};
      border: 1px solid ${hexToRgba(theme.accentColor, 0.3)};
    }

    #${id} button.pf-tag {
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s ease;
    }
    #${id} button.pf-tag:hover {
      background-color: ${hexToRgba(theme.accentColor, 0.1)};
    }

    #${id} .pf-cert-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 500;
      background-color: ${hexToRgba(theme.accentColor, 0.12)};
      color: ${theme.accentColor};
      border: 1px solid ${hexToRgba(theme.accentColor, 0.35)};
      text-decoration: none;
    }
    a.pf-cert-badge:hover { text-decoration: underline; }

    #${id} .pf-skills-scroll {
      margin-top: 8px;
      display: flex;
      flex-wrap: nowrap;
      overflow-x: auto;
      gap: 6px;
      padding-bottom: 6px;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
    }
    #${id} .pf-skills-scroll::-webkit-scrollbar { height: 4px; }
    #${id} .pf-skills-scroll::-webkit-scrollbar-track { background: transparent; }
    #${id} .pf-skills-scroll .pf-tag { flex-shrink: 0; }
    #${id} .pf-skills-scroll::-webkit-scrollbar-thumb { background-color: ${hexToRgba(theme.accentColor, 0.3)}; border-radius: 2px; }

    #${id} .pf-demo-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 500;
      background-color: ${hexToRgba(theme.accentColor, 0.1)};
      color: ${theme.accentColor};
    }

    #${id} .pf-grid {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }

    #${id} .pf-code-preview {
      margin-top: 12px;
      max-height: 120px;
      overflow: hidden;
      border-radius: 8px;
      padding: 12px;
      background-color: ${hexToRgba(theme.textColor, 0.06)};
    }
    #${id} .pf-code-preview pre {
      margin: 0;
      font-size: 0.7rem;
      color: ${theme.subtextColor};
      white-space: pre-wrap;
      font-family: monospace;
    }

    #${id} .pf-empty {
      padding: 48px 0;
      text-align: center;
      color: ${theme.subtextColor};
    }

    #${id} .pf-footer {
      border-top: 1px solid ${hexToRgba(theme.cardBorder, 0.4)};
      padding: 24px 16px;
      text-align: center;
      font-size: 0.75rem;
      color: ${theme.subtextColor};
    }
    #${id} .pf-footer strong {
      font-weight: 600;
      color: ${theme.textColor};
    }

    /* Accent color for icons */
    #${id} .pf-accent { color: ${theme.accentColor}; }

    /* ── Entrance animations (driven by theme.animationStyle) ── */
    ${getAnimationCss(id, theme.animationStyle ?? "subtle")}

    /* ── Print overrides (scoped) ── */
    @media print {
      #${id} {
        min-height: 0 !important;
        background: white !important;
        background-image: none !important;
        color: #111 !important;
      }
      #${id} .pf-hero {
        padding: 16px !important;
        border-bottom: 1px solid #ddd !important;
      }
      #${id} .pf-hero h1 { color: #111 !important; }
      #${id} .pf-hero-bio { color: #444 !important; }
      #${id} .pf-hero-meta { color: #555 !important; }
      #${id} .pf-hero-meta a { color: #333 !important; }

      #${id} .pf-main {
        padding: 16px !important;
        gap: 24px !important;
      }

      #${id} .pf-section-title { color: #111 !important; }
      #${id} .pf-divider { border-color: #ddd !important; }

      #${id} .pf-card {
        background: #f9f9f9 !important;
        border: 1px solid #ddd !important;
        backdrop-filter: none !important;
        box-shadow: none !important;
        transform: none !important;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      #${id} .pf-card:hover {
        transform: none !important;
        box-shadow: none !important;
      }
      #${id} .pf-card h3 { color: #111 !important; }
      #${id} .pf-card-sub,
      #${id} .pf-card-desc,
      #${id} .pf-card-meta,
      #${id} .pf-achievements { color: #333 !important; }

      #${id} .pf-tag {
        background-color: #eee !important;
        color: #333 !important;
        border-color: #ccc !important;
      }
      #${id} .pf-demo-tag {
        background-color: #eee !important;
        color: #333 !important;
      }

      #${id} .pf-accent { color: #555 !important; }
      #${id} .pf-footer { border-color: #ddd !important; color: #555 !important; }
      #${id} .pf-footer strong { color: #111 !important; }

      #${id} .pf-animate { animation: none !important; }

      #${id} .pf-code-preview {
        background-color: #f5f5f5 !important;
      }
      #${id} .pf-code-preview pre { color: #333 !important; }
    }
  `;
}

// ── Component ───────────────────────────────────────────────────────────────

export default function PortfolioRenderer({
  profile,
  sections,
  education,
  demos,
  skills = [],
  volunteering = [],
  certificates = [],
  themeOverride,
  preview = false,
}: PortfolioRendererProps) {
  const theme: ThemeConfig = themeOverride ?? resolveTheme(profile.themeConfig, profile.theme);
  const scopeId = `pf-${useId().replace(/:/g, "")}`;

  // Inject Google Fonts into <head> on the real portfolio page
  useEffect(() => {
    if (preview) return;
    const url = getGoogleFontsUrl(theme.headingFont, theme.bodyFont);
    if (!url) return;
    const existing = document.querySelector(`link[data-mivitae-font]`);
    if (existing) existing.remove();
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.setAttribute("data-mivitae-font", "true");
    document.head.appendChild(link);
    return () => {
      document.querySelector(`link[data-mivitae-font]`)?.remove();
    };
  }, [theme.headingFont, theme.bodyFont, preview]);

  // For preview mode, inject a scoped <style> for font imports
  const previewFontUrl = preview ? getGoogleFontsUrl(theme.headingFont, theme.bodyFont) : null;

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);
  const sortedEducation = [...education].sort((a, b) => a.order - b.order);
  const publicDemos = demos.filter(d => d.isPublic);
  const sortedSkills = [...skills].sort((a, b) => a.order - b.order);
  const sortedVolunteering = [...volunteering].sort((a, b) => a.order - b.order);
  const sortedCertificates = [...certificates].sort((a, b) => a.order - b.order);

  // Demo tag filtering ("collections")
  const [selectedDemoTag, setSelectedDemoTag] = useState<string | null>(null);
  const allDemoTags = Array.from(new Set(publicDemos.flatMap(d => d.tags ?? [])));
  const filteredDemos = selectedDemoTag
    ? publicDemos.filter(d => d.tags?.includes(selectedDemoTag))
    : publicDemos;

  return (
    <div id={scopeId} data-portfolio>
      {/* Scoped theme + print CSS */}
      <style dangerouslySetInnerHTML={{ __html: buildPortfolioCss(scopeId, theme) }} />

      {/* Font injection for preview mode */}
      {previewFontUrl && (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link rel="stylesheet" href={previewFontUrl} />
      )}

      {/* Custom CSS (advanced) — sanitized to prevent XSS */}
      {theme.customCss && !preview && (
        <style dangerouslySetInnerHTML={{ __html: sanitizeCss(theme.customCss) }} />
      )}

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <header className="pf-hero">
        <div className="pf-hero-inner">
          <h1>{profile.headline || profile.slug}</h1>
          {profile.bio && <p className="pf-hero-bio">{profile.bio}</p>}

          {/* Meta links */}
          <div className="pf-hero-meta">
            {profile.location && (
              <span>
                <MapPin style={{ width: 14, height: 14 }} className="pf-accent" />
                {profile.location}
              </span>
            )}
            {profile.websiteUrl && (
              <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer">
                <Globe style={{ width: 14, height: 14 }} />
                {(() => {
                  try {
                    const u = new URL(profile.websiteUrl);
                    return (u.hostname + (u.pathname !== "/" ? u.pathname : "")).replace(/\/$/, "");
                  } catch {
                    return profile.websiteUrl;
                  }
                })()}
              </a>
            )}
            {profile.linkedinUrl && (
              <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink style={{ width: 14, height: 14 }} /> LinkedIn
              </a>
            )}
            {profile.githubUrl && (
              <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink style={{ width: 14, height: 14 }} /> GitHub
              </a>
            )}
            {sortedCertificates.map(cert => (
              cert.credentialUrl ? (
                <a key={cert._id} href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="pf-cert-badge">
                  {cert.name}
                  {cert.issuer ? ` · ${cert.issuer}` : ""}
                </a>
              ) : (
                <span key={cert._id} className="pf-cert-badge">
                  {cert.name}
                  {cert.issuer ? ` · ${cert.issuer}` : ""}
                </span>
              )
            ))}
          </div>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <main className="pf-main">
        {/* Experience */}
        {theme.showExperience && sortedSections.length > 0 && (
          <section className="pf-animate">
            <div className="pf-section-title">
              <Briefcase style={{ width: 20, height: 20, flexShrink: 0 }} className="pf-accent" />
              Experience
            </div>
            <div className="pf-divider" />
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {sortedSections.map((s) => {
                const linkedDemos = publicDemos.filter(
                  d => s.demoIds?.includes(d._id)
                );
                return (
                  <div key={s._id} className="pf-card">
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "4px" }}>
                      <h3>{s.role}</h3>
                      <span className="pf-card-meta">
                        {s.startDate} — {s.endDate ?? "Present"}
                      </span>
                    </div>
                    <p className="pf-card-sub">{s.companyName}</p>
                    {s.description && (
                      <p className="pf-card-desc">{s.description}</p>
                    )}
                    {s.achievements.length > 0 && (
                      <ul className="pf-achievements">
                        {s.achievements.map((a, i) => <li key={i}>{a}</li>)}
                      </ul>
                    )}
                    {s.skills.length > 0 && (
                      <div className="pf-tags">
                        {s.skills.map(skill => (
                          <span key={skill} className="pf-tag">{skill}</span>
                        ))}
                      </div>
                    )}
                    {linkedDemos.length > 0 && (
                      <div className="pf-tags">
                        {linkedDemos.map(d => (
                          <span key={d._id} className="pf-demo-tag">
                            <Zap style={{ width: 10, height: 10 }} />
                            {d.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Education */}
        {theme.showEducation && sortedEducation.length > 0 && (
          <section className="pf-animate">
            <div className="pf-section-title">
              <GraduationCap style={{ width: 20, height: 20, flexShrink: 0 }} className="pf-accent" />
              Education
            </div>
            <div className="pf-divider" />
            <div className="pf-grid">
              {sortedEducation.map(e => (
                <div key={e._id} className="pf-card">
                  <h3>{e.institution}</h3>
                  <p className="pf-card-sub">
                    {e.degree}{e.fieldOfStudy ? ` in ${e.fieldOfStudy}` : ""}
                  </p>
                  <p className="pf-card-meta" style={{ marginTop: "2px" }}>
                    {e.startYear} — {e.endYear ?? "Present"}
                  </p>
                  {e.gpa && (
                    <p className="pf-card-meta" style={{ marginTop: "4px" }}>GPA: {e.gpa}</p>
                  )}
                  {e.honors && (
                    <p className="pf-card-meta" style={{ marginTop: "4px", fontStyle: "italic" }}>{e.honors}</p>
                  )}
                  {e.activities && e.activities.length > 0 && (
                    <p className="pf-card-meta" style={{ marginTop: "8px" }}>
                      {e.activities.join(" · ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Demos */}
        {theme.showDemos && publicDemos.length > 0 && (
          <section className="pf-animate">
            <div className="pf-section-title">
              <Zap style={{ width: 20, height: 20, flexShrink: 0 }} className="pf-accent" />
              Interactive Demos
            </div>
            <div className="pf-divider" />

            {/* Tag filters (collections) */}
            {allDemoTags.length > 1 && (
              <div className="pf-tags" style={{ marginBottom: "20px" }}>
                <button
                  onClick={() => setSelectedDemoTag(null)}
                  className={selectedDemoTag === null ? "pf-tag pf-tag-active" : "pf-tag"}
                  style={{
                    cursor: "pointer",
                    border: `1px solid ${selectedDemoTag === null ? theme.accentColor : hexToRgba(theme.cardBorder, 0.4)}`,
                    background: selectedDemoTag === null ? hexToRgba(theme.accentColor, 0.15) : "transparent",
                    color: selectedDemoTag === null ? theme.accentColor : theme.subtextColor,
                  }}
                >
                  All ({publicDemos.length})
                </button>
                {allDemoTags.map(tag => {
                  const count = publicDemos.filter(d => d.tags?.includes(tag)).length;
                  const isActive = selectedDemoTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedDemoTag(isActive ? null : tag)}
                      className={isActive ? "pf-tag pf-tag-active" : "pf-tag"}
                      style={{
                        cursor: "pointer",
                        border: `1px solid ${isActive ? theme.accentColor : hexToRgba(theme.cardBorder, 0.4)}`,
                        background: isActive ? hexToRgba(theme.accentColor, 0.15) : "transparent",
                        color: isActive ? theme.accentColor : theme.subtextColor,
                      }}
                    >
                      {tag} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {filteredDemos.map(d => (
                <div key={d._id} className="pf-card" style={{ overflow: "hidden" }}>
                  {/* Interactive preview via iframe */}
                  {d.htmlContent && (
                    <div style={{ position: "relative", borderBottom: `1px solid ${hexToRgba(theme.cardBorder, 0.3)}` }}>
                      <iframe
                        srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${buildDemoIframeCss(theme)}</style><link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet"><script src="https://cdn.jsdelivr.net/npm/chart.js@4"><\/script></head><body>${d.htmlContent}</body></html>`}
                        sandbox="allow-scripts"
                        title={d.title}
                        style={{
                          width: "100%",
                          height: "500px",
                          border: "none",
                          display: "block",
                        }}
                      />
                    </div>
                  )}
                  {/* Banner fallback if no htmlContent */}
                  {!d.htmlContent && d.bannerUrl && (
                    <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
                      <img
                        src={d.bannerUrl}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  )}
                  {/* Info */}
                  <div style={{ padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <div>
                        <h3>{d.title}</h3>
                        {d.description && (
                          <p className="pf-card-desc">{d.description}</p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                        {d.demoUrl && (
                          <a
                            href={d.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pf-accent"
                            style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
                          >
                            <Globe style={{ width: 12, height: 12 }} /> Live
                          </a>
                        )}
                        {d.githubUrl && (
                          <a
                            href={d.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pf-accent"
                            style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
                          >
                            <ExternalLink style={{ width: 12, height: 12 }} /> Code
                          </a>
                        )}
                      </div>
                    </div>
                    {/* Tags */}
                    {d.tags && d.tags.length > 0 && (
                      <div className="pf-tags" style={{ marginTop: "12px" }}>
                        {d.tags.map(tag => (
                          <span key={tag} className="pf-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    {/* Plain-text content fallback */}
                    {!d.htmlContent && d.content && (
                      <div className="pf-code-preview">
                        <pre>{d.content}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {sortedSections.length === 0 && sortedEducation.length === 0 && (
          <div className="pf-empty">
            This portfolio is still being built. Check back soon!
          </div>
        )}

        {/* Skills */}
        {theme.showSkills && sortedSkills.length > 0 && (
          <section className="pf-animate">
            <div className="pf-section-title">
              <Wrench style={{ width: 20, height: 20, flexShrink: 0 }} className="pf-accent" />
              Skills
            </div>
            <div className="pf-divider" />
            {(() => {
              const grouped: Record<string, Skill[]> = {};
              for (const skill of sortedSkills) {
                (grouped[skill.category] ??= []).push(skill);
              }
              return Object.entries(grouped).map(([category, categorySkills]) => (
                <div key={category} style={{ marginBottom: "20px" }}>
                  <p style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: theme.subtextColor, marginBottom: "8px" }}>
                    {category}
                  </p>
                  <div className="pf-skills-scroll">
                    {categorySkills.map(skill => (
                      <span key={skill._id} className="pf-tag" title={skill.proficiency ? `Proficiency: ${skill.proficiency}/5` : undefined}>
                        {skill.name}
                        {skill.yearsOfExperience ? ` (${skill.yearsOfExperience}y)` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </section>
        )}

        {/* Volunteering */}
        {theme.showVolunteering && sortedVolunteering.length > 0 && (
          <section className="pf-animate">
            <div className="pf-section-title">
              <Heart style={{ width: 20, height: 20, flexShrink: 0 }} className="pf-accent" />
              Volunteering
            </div>
            <div className="pf-divider" />
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {sortedVolunteering.map(v => (
                <div key={v._id} className="pf-card">
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "4px" }}>
                    <h3>{v.role}</h3>
                    <span className="pf-card-meta">
                      {v.startDate} — {v.endDate ?? "Present"}
                    </span>
                  </div>
                  <p className="pf-card-sub">{v.organization}</p>
                  {v.cause && (
                    <span className="pf-tag" style={{ marginTop: "6px", display: "inline-block" }}>{v.cause}</span>
                  )}
                  {v.description && (
                    <p className="pf-card-desc">{v.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact / Hire Me */}
        {!preview && (
          <section className="pf-animate">
            <div className="pf-section-title">
              <Mail style={{ width: 20, height: 20, flexShrink: 0 }} className="pf-accent" />
              Get in Touch
            </div>
            <div className="pf-divider" />
            <ContactForm profileId={profile._id} theme={theme} />
          </section>
        )}
      </main>

      <footer className="pf-footer">
        Built with{" "}
        <a href="https://mivitae.org" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", verticalAlign: "middle", marginLeft: "4px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-light.png" alt="mivitae" height={18} style={{ height: "18px", width: "auto", display: "block" }} />
        </a>
      </footer>
    </div>
  );
}

// ── Contact Form (inline, scoped to portfolio theme) ────────────────────────

function ContactForm({ profileId, theme }: { profileId: string; theme: ThemeConfig }) {
  const sendMessage = useMutation(api.contactMessages.send);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const senderName = (data.get("name") as string)?.trim();
    const senderEmail = (data.get("email") as string)?.trim();
    const message = (data.get("message") as string)?.trim();

    if (!senderName || !senderEmail || !message) {
      setError("All fields are required.");
      return;
    }

    setSending(true);
    try {
      await sendMessage({
        profileId: profileId as Parameters<typeof sendMessage>[0]["profileId"],
        senderName,
        senderEmail,
        message,
      });
      setSent(true);
      form.reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="pf-card" style={{ textAlign: "center", padding: "32px" }}>
        <p style={{ fontSize: "1.1rem", fontWeight: 600, color: theme.textColor }}>Message sent!</p>
        <p style={{ fontSize: "0.875rem", color: theme.subtextColor, marginTop: "8px" }}>
          Thanks for reaching out. They&apos;ll get back to you soon.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          style={{
            marginTop: "16px",
            padding: "8px 20px",
            borderRadius: "8px",
            border: `1px solid ${hexToRgba(theme.accentColor, 0.4)}`,
            background: "transparent",
            color: theme.accentColor,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Send another
        </button>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: `1px solid ${hexToRgba(theme.cardBorder, 0.5)}`,
    background: hexToRgba(theme.cardBg, 0.6),
    color: theme.textColor,
    fontSize: "0.875rem",
    outline: "none",
  };

  return (
    <form onSubmit={handleSubmit} className="pf-card" style={{ padding: "24px" }}>
      <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label htmlFor="pf-contact-name" style={{ fontSize: "0.75rem", fontWeight: 600, color: theme.subtextColor, display: "block", marginBottom: "4px" }}>
            Your Name
          </label>
          <input id="pf-contact-name" name="name" type="text" required maxLength={100} placeholder="Your name" style={inputStyle} />
        </div>
        <div>
          <label htmlFor="pf-contact-email" style={{ fontSize: "0.75rem", fontWeight: 600, color: theme.subtextColor, display: "block", marginBottom: "4px" }}>
            Email
          </label>
          <input id="pf-contact-email" name="email" type="email" required maxLength={254} placeholder="you@example.com" style={inputStyle} />
        </div>
      </div>
      <div style={{ marginTop: "14px" }}>
        <label htmlFor="pf-contact-message" style={{ fontSize: "0.75rem", fontWeight: 600, color: theme.subtextColor, display: "block", marginBottom: "4px" }}>
          Message
        </label>
        <textarea id="pf-contact-message" name="message" required rows={4} maxLength={5000} placeholder="Write your message..." style={{ ...inputStyle, resize: "vertical" }} />
      </div>
      {error && (
        <p style={{ marginTop: "8px", fontSize: "0.8rem", color: "#ef4444" }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={sending}
        style={{
          marginTop: "16px",
          padding: "10px 28px",
          borderRadius: "8px",
          border: "none",
          background: theme.accentColor,
          color: "#fff",
          fontWeight: 600,
          fontSize: "0.875rem",
          cursor: sending ? "not-allowed" : "pointer",
          opacity: sending ? 0.7 : 1,
        }}
      >
        {sending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
