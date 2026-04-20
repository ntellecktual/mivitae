"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/lib/convex";
import {
  MapPin, Globe, ExternalLink, Briefcase, GraduationCap,
  Zap, Wrench, Heart, Mail, Home, Menu, X, Award,
  Compass, User, Calendar, Target,
} from "lucide-react";
import {
  type ThemeConfig,
  resolveTheme,
  getBackgroundStyle,
  getCardStyle,
  getContainerMaxWidth,
  getGoogleFontsUrl,
  hexToRgba,
  buildDemoIframeCss,
  getAnimationCss,
} from "@/lib/theme";
import {
  calculateProficiency,
  formatYears,
  computePortfolioStats,
  getDemoGradient,
} from "@/lib/skill-proficiency";

// ── CSS Sanitizer ──────────────────────────────────────────────────────────

function sanitizeCss(css: string): string {
  let s = css;
  s = s.replace(/<\s*\/\s*style\s*>/gi, "");
  s = s.replace(/<\s*script[^>]*>/gi, "");
  s = s.replace(/url\s*\(\s*(['"]?)\s*(javascript|data)\s*:/gi, 'url($1blocked:');
  s = s.replace(/expression\s*\(/gi, "blocked(");
  s = s.replace(/@import\b/gi, "/* blocked-import */");
  s = s.replace(/-moz-binding\s*:/gi, "blocked:");
  s = s.replace(/behavior\s*:/gi, "blocked:");
  return s;
}

// ── Dominant Color Extraction ──────────────────────────────────────────────

function extractDominantColor(imgSrc: string): Promise<[number, number, number]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 10;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve([59, 130, 246]); return; }
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      let rT = 0, gT = 0, bT = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        // skip near-white and near-black pixels for better results
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const brightness = (r + g + b) / 3;
        if (brightness > 20 && brightness < 240) {
          rT += r; gT += g; bT += b; count++;
        }
      }
      if (count === 0) { resolve([59, 130, 246]); return; }
      resolve([Math.round(rT / count), Math.round(gT / count), Math.round(bT / count)]);
    };
    img.onerror = () => resolve([59, 130, 246]);
    img.src = imgSrc;
  });
}

function rgbToGradient(r: number, g: number, b: number): string {
  // Create a rich gradient: saturated version → darker → near-black
  const darken = (v: number, f: number) => Math.round(v * f);
  return `linear-gradient(150deg, rgb(${r},${g},${b}) 0%, rgb(${darken(r, 0.5)},${darken(g, 0.5)},${darken(b, 0.5)}) 55%, rgb(${darken(r, 0.1)},${darken(g, 0.1)},${darken(b, 0.1)}) 100%)`;
}

// ── Prop Types ─────────────────────────────────────────────────────────────

type Profile = {
  _id: string;
  slug: string;
  displayName?: string;
  headline?: string;
  bio?: string;
  location?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  avatarUrl?: string;
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
  imageUrl?: string;
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
  relevantCoursework?: string;
  order: number;
  imageUrl?: string;
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
  imageUrl?: string;
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
  themeOverride?: ThemeConfig;
  preview?: boolean;
}

type ActiveSection = "home" | "portfolio" | "education" | "discover" | "skills" | "volunteering" | "contact";

// ── V3 CSS Generation ──────────────────────────────────────────────────────

function buildPortfolioCss(id: string, theme: ThemeConfig): string {
  const bg = getBackgroundStyle(theme);
  const card = getCardStyle(theme);
  const maxW = getContainerMaxWidth(theme.containerWidth);

  const bgCss = Object.entries(bg)
    .map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${v}`)
    .join("; ");
  const cardCss = Object.entries(card)
    .map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${v}`)
    .join("; ");

  return `
    /* ── V3 Portfolio Theme (scoped to #${id}) ── */
    #${id} {
      display: flex;
      min-height: 100vh;
      color: ${theme.textColor};
      font-family: '${theme.bodyFont}', sans-serif;
      container-type: inline-size;
      container-name: portfolio;
    }

    /* ── Sidebar ─────────────────────────────────────────────── */
    #${id} .pf-sidebar {
      width: 236px;
      flex-shrink: 0;
      background: ${theme.cardBg};
      border-right: 1px solid ${theme.cardBorder};
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      z-index: 40;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      scrollbar-width: thin;
    }
    #${id} .pf-sidebar::-webkit-scrollbar { width: 4px; }
    #${id} .pf-sidebar::-webkit-scrollbar-track { background: transparent; }
    #${id} .pf-sidebar::-webkit-scrollbar-thumb { background: ${hexToRgba(theme.cardBorder, 0.5)}; border-radius: 2px; }

    #${id} .pf-sidebar-profile {
      padding: 28px 20px 20px;
      text-align: center;
      border-bottom: 1px solid ${hexToRgba(theme.cardBorder, 0.5)};
    }

    #${id} .pf-sidebar-avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid ${hexToRgba(theme.accentColor, 0.3)};
      margin: 0 auto 12px;
      display: block;
    }

    #${id} .pf-sidebar-avatar-placeholder {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      margin: 0 auto 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${hexToRgba(theme.accentColor, 0.1)};
      border: 3px solid ${hexToRgba(theme.accentColor, 0.3)};
    }

    #${id} .pf-sidebar-name {
      font-family: '${theme.headingFont}', sans-serif;
      font-size: 1.05rem;
      font-weight: 700;
      color: ${theme.textColor};
      margin: 0;
    }

    #${id} .pf-sidebar-headline {
      font-size: 0.75rem;
      color: ${theme.subtextColor};
      margin-top: 4px;
      line-height: 1.4;
    }

    #${id} .pf-sidebar-nav {
      flex: 1;
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    #${id} .pf-sidebar-label {
      padding: 12px 12px 4px;
      font-size: 0.625rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: ${theme.subtextColor};
    }

    #${id} .pf-nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      border-radius: 8px;
      font-size: 0.8125rem;
      font-weight: 500;
      color: ${theme.subtextColor};
      cursor: pointer;
      background: transparent;
      border: none;
      width: 100%;
      text-align: left;
      font-family: inherit;
      transition: all 0.15s ease;
    }

    #${id} .pf-nav-item:hover {
      background: ${hexToRgba(theme.accentColor, 0.08)};
      color: ${theme.textColor};
    }

    #${id} .pf-nav-item.active {
      background: ${hexToRgba(theme.accentColor, 0.12)};
      color: ${theme.accentColor};
      font-weight: 600;
    }

    #${id} .pf-nav-badge {
      margin-left: auto;
      font-size: 0.65rem;
      font-weight: 600;
      padding: 1px 7px;
      border-radius: 999px;
      background: ${hexToRgba(theme.accentColor, 0.12)};
      color: ${theme.accentColor};
    }

    #${id} .pf-nav-divider {
      height: 1px;
      background: ${hexToRgba(theme.cardBorder, 0.5)};
      margin: 8px 12px;
    }

    #${id} .pf-sidebar-footer {
      padding: 12px 16px;
      border-top: 1px solid ${hexToRgba(theme.cardBorder, 0.5)};
      text-align: center;
      font-size: 0.7rem;
      color: ${theme.subtextColor};
    }
    #${id} .pf-sidebar-footer a {
      color: ${theme.accentColor};
      text-decoration: none;
      font-weight: 600;
    }

    /* ── Content Area ────────────────────────────────────────── */
    #${id} .pf-content {
      flex: 1;
      ${bgCss};
      min-height: 100vh;
      overflow-y: auto;
    }

    #${id} .pf-content-inner {
      max-width: ${maxW};
      margin: 0 auto;
      padding: 28px 24px;
    }

    /* ── Section Headers ─────────────────────────────────────── */
    #${id} .pf-section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.5rem;
      font-weight: 700;
      font-family: '${theme.headingFont}', sans-serif;
      color: ${theme.textColor};
      margin-bottom: 8px;
    }

    #${id} .pf-section-subtitle {
      font-size: 0.875rem;
      color: ${theme.subtextColor};
      margin-bottom: 14px;
    }

    #${id} .pf-divider {
      border-bottom: 1px solid ${hexToRgba(theme.cardBorder, 0.5)};
      margin-bottom: 20px;
    }

    /* ── Cards ────────────────────────────────────────────────── */
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

    /* ── Tags ─────────────────────────────────────────────────── */
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
      background-color: ${hexToRgba(theme.accentColor, 0.25)};
    }

    #${id} .pf-cert-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 500;
      background-color: ${hexToRgba(theme.accentColor, 0.1)};
      color: ${theme.accentColor};
      border: 1px solid ${hexToRgba(theme.accentColor, 0.2)};
      text-decoration: none;
    }
    #${id} a.pf-cert-badge:hover { text-decoration: underline; }

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

    /* ── Stats Grid ──────────────────────────────────────────── */
    #${id} .pf-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 10px;
      margin-bottom: 20px;
    }

    #${id} .pf-stat-card {
      ${cardCss};
      text-align: center;
      padding: 14px 12px;
    }

    #${id} .pf-stat-value {
      font-family: '${theme.headingFont}', sans-serif;
      font-size: 1.5rem;
      font-weight: 800;
      color: ${theme.accentColor};
      line-height: 1;
    }

    #${id} .pf-stat-label {
      font-size: 0.7rem;
      color: ${theme.subtextColor};
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-top: 6px;
      font-weight: 500;
    }

    /* ── Proficiency Bars ────────────────────────────────────── */
    #${id} .pf-prof-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
    }

    #${id} .pf-prof-label {
      width: 140px;
      flex-shrink: 0;
      font-size: 0.8125rem;
      font-weight: 500;
      color: ${theme.textColor};
      text-align: right;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #${id} .pf-prof-bar-bg {
      flex: 1;
      height: 10px;
      border-radius: 5px;
      background: ${hexToRgba(theme.cardBorder, 0.4)};
      overflow: hidden;
    }

    #${id} .pf-prof-bar-fill {
      height: 100%;
      border-radius: 5px;
      background: linear-gradient(90deg, ${theme.accentColor}, ${hexToRgba(theme.accentColor, 0.7)});
      width: 0;
      animation: pf-bar-fill-in 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    #${id} .pf-prof-pct {
      width: 40px;
      flex-shrink: 0;
      font-size: 0.8125rem;
      font-weight: 700;
      color: ${theme.accentColor};
    }

    #${id} .pf-prof-years {
      width: 55px;
      flex-shrink: 0;
      font-size: 0.7rem;
      color: ${theme.subtextColor};
      text-align: right;
    }

    /* ── Category Tabs ───────────────────────────────────────── */

    /* ── Work History Grid ─────────────────────────────────── */
    #${id} .pf-work-grid {
      display: grid;
      gap: 1.1rem;
      grid-template-columns: repeat(3, 1fr);
      max-width: 100%;
    }
    #${id} .pf-work-card--featured {
      grid-column: span 2;
    }

    #${id} .pf-work-card {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      cursor: pointer;
      aspect-ratio: 3/4;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
      transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
    }
    #${id} .pf-work-card--featured {
      aspect-ratio: 16/9;
    }
    #${id} .pf-work-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 28px 70px rgba(0,0,0,0.22), 0 0 0 1px ${hexToRgba(theme.accentColor, 0.2)};
    }
    #${id} .pf-work-card.active {
      box-shadow: 0 0 0 3px ${theme.accentColor}, 0 28px 70px ${hexToRgba(theme.accentColor, 0.25)};
      transform: translateY(-4px) scale(1.01);
    }

    #${id} .pf-work-card-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    #${id} .pf-work-card-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), filter 0.4s;
    }
    #${id} .pf-work-card:hover .pf-work-card-img img {
      transform: scale(1.08);
      filter: brightness(1.05);
    }
    #${id} .pf-work-card-img-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, ${hexToRgba(theme.accentColor, 0.15)}, ${hexToRgba(theme.accentColor, 0.05)});
    }

    #${id} .pf-work-card-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(0deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.06) 100%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 1.6rem 1.5rem;
      transition: background 0.3s ease;
    }
    #${id} .pf-work-card:hover .pf-work-card-overlay {
      background: linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.04) 100%);
    }

    #${id} .pf-work-card-domain {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      width: fit-content;
      font-size: 0.62rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 0.25rem 0.8rem;
      border-radius: 999px;
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: rgba(255,255,255,0.9);
      border: 1px solid rgba(255,255,255,0.12);
      margin-bottom: 0.4rem;
    }
    #${id} .pf-work-card-company {
      color: #fff;
      font-family: '${theme.headingFont}', sans-serif;
      font-weight: 800;
      font-size: 1.35rem;
      text-shadow: 0 2px 12px rgba(0,0,0,0.4);
      line-height: 1.2;
      letter-spacing: -0.015em;
    }
    #${id} .pf-work-card-role {
      color: rgba(255,255,255,0.75);
      font-size: 0.8rem;
      font-weight: 500;
      margin-top: 2px;
      line-height: 1.3;
    }
    #${id} .pf-work-card-arrow {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 0.7rem;
      opacity: 0;
      transform: translate(-4px, 4px);
      transition: opacity 0.3s, transform 0.3s;
    }
    #${id} .pf-work-card:hover .pf-work-card-arrow {
      opacity: 1;
      transform: translate(0, 0);
    }

    /* ── Work Stats (hero badges) ──────────────────────────── */
    #${id} .pf-work-stats {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 24px;
    }
    #${id} .pf-work-stat {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 14px;
      border: 1px solid ${hexToRgba(theme.cardBorder, 0.4)};
      background: ${theme.cardBg};
      box-shadow: 0 2px 8px ${hexToRgba(theme.cardBorder, 0.15)};
      animation: pf-stat-float 3.5s ease-in-out infinite;
    }
    #${id} .pf-work-stat:nth-child(2) { animation-delay: 0.6s; }
    #${id} .pf-work-stat:nth-child(3) { animation-delay: 1.2s; }
    #${id} .pf-work-stat:nth-child(4) { animation-delay: 1.8s; }
    @keyframes pf-stat-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    #${id} .pf-work-stat-value {
      font-family: '${theme.headingFont}', sans-serif;
      font-size: 1.05rem;
      font-weight: 800;
      color: ${theme.accentColor};
    }
    #${id} .pf-work-stat-label {
      font-size: 0.7rem;
      color: ${theme.subtextColor};
      line-height: 1.3;
    }

    /* ── Work Detail Panel ─────────────────────────────────── */
    #${id} .pf-work-detail {
      margin-top: 20px;
      animation: pf-detail-in 0.35s ease both;
    }
    @keyframes pf-detail-in {
      from { opacity: 0; transform: translateY(-12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    #${id} .pf-work-detail-card {
      ${cardCss};
      overflow: hidden;
    }
    #${id} .pf-work-detail-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 18px 24px;
      border-bottom: 1px solid ${hexToRgba(theme.cardBorder, 0.3)};
    }
    #${id} .pf-work-detail-logo {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      object-fit: cover;
      border: 1px solid ${hexToRgba(theme.cardBorder, 0.5)};
      flex-shrink: 0;
    }
    #${id} .pf-work-detail-info {
      flex: 1;
    }
    #${id} .pf-work-detail-info h2 {
      margin: 0;
      font-family: '${theme.headingFont}', sans-serif;
      font-weight: 700;
      font-size: 1.15rem;
      color: ${theme.textColor};
    }
    #${id} .pf-work-detail-info p {
      margin: 2px 0 0;
      font-size: 0.82rem;
      color: ${theme.subtextColor};
    }
    #${id} .pf-work-detail-close {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid ${hexToRgba(theme.cardBorder, 0.3)};
      background: transparent;
      color: ${theme.subtextColor};
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }
    #${id} .pf-work-detail-close:hover {
      background: rgba(239,68,68,0.08);
      border-color: rgba(239,68,68,0.2);
      color: #ef4444;
    }
    #${id} .pf-work-detail-body {
      padding: 20px 24px 24px;
    }
    #${id} .pf-work-detail-section {
      margin-bottom: 18px;
    }
    #${id} .pf-work-detail-section:last-child {
      margin-bottom: 0;
    }
    #${id} .pf-work-detail-section h5 {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      font-weight: 700;
      color: ${theme.accentColor};
      margin: 0 0 8px;
      font-family: '${theme.headingFont}', sans-serif;
    }
    #${id} .pf-work-detail-section p {
      font-size: 0.875rem;
      color: ${theme.subtextColor};
      line-height: 1.65;
      margin: 0;
    }
    #${id} .pf-work-detail-section ul {
      margin: 0;
      padding-left: 0;
      list-style: none;
    }
    #${id} .pf-work-detail-section li {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 0.85rem;
      color: ${theme.subtextColor};
      line-height: 1.6;
      margin-bottom: 6px;
    }

    @container portfolio (max-width: 900px) {
      #${id} .pf-work-grid { grid-template-columns: repeat(2, 1fr); }
      #${id} .pf-work-card--featured { grid-column: span 1; }
      #${id} .pf-work-card--featured { aspect-ratio: 3/4; }
    }
    @media (max-width: 900px) {
      #${id} .pf-work-grid { grid-template-columns: repeat(2, 1fr); }
      #${id} .pf-work-card--featured { grid-column: span 1; }
      #${id} .pf-work-card--featured { aspect-ratio: 3/4; }
    }

    /* ── Education Cards (thenumerix image-card style) ───── */
    #${id} .pf-edu-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.1rem;
      max-width: 100%;
    }
    #${id} .pf-edu-card {
      position: relative;
      overflow: hidden;
      border-radius: 20px;
      cursor: pointer;
      aspect-ratio: 3/4;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
      transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
    }
    #${id} .pf-edu-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 28px 70px rgba(0,0,0,0.22), 0 0 0 1px ${hexToRgba(theme.accentColor, 0.2)};
    }
    #${id} .pf-edu-card.active {
      box-shadow: 0 0 0 3px ${theme.accentColor}, 0 28px 70px ${hexToRgba(theme.accentColor, 0.25)};
      transform: translateY(-4px) scale(1.01);
    }
    #${id} .pf-edu-card-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }
    #${id} .pf-edu-card:hover .pf-edu-card-bg {
      transform: scale(1.06);
    }
    #${id} .pf-edu-card-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(0deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.06) 100%);
      transition: background 0.3s;
    }
    #${id} .pf-edu-card:hover .pf-edu-card-overlay {
      background: linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.04) 100%);
    }
    #${id} .pf-edu-card-logo-wrap {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 38%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }
    #${id} .pf-edu-card-logo {
      width: 108px;
      height: 108px;
      object-fit: contain;
      filter: drop-shadow(0 4px 24px rgba(0,0,0,0.55));
      transition: transform 0.4s ease, filter 0.4s;
    }
    #${id} .pf-edu-card:hover .pf-edu-card-logo {
      transform: scale(1.08);
      filter: drop-shadow(0 8px 32px rgba(0,0,0,0.7)) brightness(1.1);
    }
    #${id} .pf-edu-card-logo-placeholder {
      width: 108px;
      height: 108px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.3;
      color: rgba(255,255,255,0.6);
      filter: drop-shadow(0 4px 24px rgba(0,0,0,0.3));
    }
    #${id} .pf-edu-card-content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1.6rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      z-index: 2;
    }
    #${id} .pf-edu-card-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      width: fit-content;
      font-size: 0.62rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 0.25rem 0.8rem;
      border-radius: 999px;
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: rgba(255,255,255,0.9);
      border: 1px solid rgba(255,255,255,0.12);
    }
    #${id} .pf-edu-card-name {
      color: #fff;
      font-family: '${theme.headingFont}', sans-serif;
      font-weight: 800;
      font-size: 1.35rem;
      text-shadow: 0 2px 12px rgba(0,0,0,0.4);
      line-height: 1.2;
      letter-spacing: -0.015em;
    }
    #${id} .pf-edu-card-degree {
      color: rgba(255,255,255,0.75);
      font-size: 0.8rem;
      font-weight: 500;
      line-height: 1.3;
    }
    #${id} .pf-edu-card-arrow {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 0.7rem;
      opacity: 0;
      transform: translate(-4px, 4px);
      transition: opacity 0.3s, transform 0.3s;
    }
    #${id} .pf-edu-card:hover .pf-edu-card-arrow {
      opacity: 1;
      transform: translate(0, 0);
    }

    /* ── Education Detail Panel ───────────────────────────── */
    #${id} .pf-edu-detail {
      margin-top: 1.5rem;
    }
    #${id} .pf-edu-detail-card {
      ${cardCss};
      overflow: hidden;
      animation: fadeUp 0.4s ease both;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    #${id} .pf-edu-detail-header {
      position: relative;
      display: flex;
      align-items: center;
      gap: 1.2rem;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid ${hexToRgba(theme.cardBorder, 0.3)};
    }
    #${id} .pf-edu-detail-logo {
      width: 56px;
      height: 56px;
      object-fit: contain;
      border-radius: 14px;
      border: 1px solid ${hexToRgba(theme.cardBorder, 0.3)};
      background: ${theme.cardBg};
      padding: 6px;
      flex-shrink: 0;
    }
    #${id} .pf-edu-detail-info h2 {
      font-size: 1.2rem;
      font-weight: 800;
      margin: 0 0 0.2rem;
      color: ${theme.textColor};
      font-family: '${theme.headingFont}', sans-serif;
    }
    #${id} .pf-edu-detail-info p {
      font-size: 0.82rem;
      color: ${theme.subtextColor};
      margin: 0;
    }
    #${id} .pf-edu-detail-close {
      margin-left: auto;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 1px solid ${hexToRgba(theme.cardBorder, 0.3)};
      background: transparent;
      color: ${theme.subtextColor};
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    #${id} .pf-edu-detail-close:hover {
      background: rgba(239,68,68,0.08);
      border-color: rgba(239,68,68,0.2);
      color: #ef4444;
    }
    #${id} .pf-edu-detail-body {
      padding: 1.5rem 2rem 2rem;
    }
    #${id} .pf-edu-detail-body .pf-edu-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 0.25rem 0.8rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      margin-right: 0.4rem;
      margin-bottom: 0.7rem;
      background: ${hexToRgba(theme.accentColor, 0.06)};
      border: 1px solid ${hexToRgba(theme.accentColor, 0.1)};
      color: ${theme.accentColor};
    }

    #${id} .pf-cat-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 24px;
    }

    #${id} .pf-cat-tab {
      padding: 5px 14px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid ${hexToRgba(theme.cardBorder, 0.4)};
      background: transparent;
      color: ${theme.subtextColor};
      font-family: inherit;
      transition: all 0.15s ease;
    }

    #${id} .pf-cat-tab:hover {
      border-color: ${hexToRgba(theme.accentColor, 0.5)};
      color: ${theme.textColor};
    }

    #${id} .pf-cat-tab.active {
      background: ${hexToRgba(theme.accentColor, 0.12)};
      border-color: ${theme.accentColor};
      color: ${theme.accentColor};
      font-weight: 600;
    }

    /* ── Discover Hero ──────────────────────────────────────── */
    #${id} .pf-discover-hero {
      text-align: center;
      padding: 40px 20px 32px;
      margin-bottom: 24px;
      border-radius: 16px;
      background: linear-gradient(135deg, ${hexToRgba(theme.accentColor, 0.06)}, ${hexToRgba(theme.accentColor, 0.02)});
      border: 1px solid ${hexToRgba(theme.cardBorder, 0.2)};
    }
    #${id} .pf-discover-hero h2 {
      margin: 0 0 8px;
      font-family: '${theme.headingFont}', sans-serif;
      font-weight: 700;
      font-size: 1.5rem;
      color: ${theme.textColor};
    }
    #${id} .pf-discover-hero p {
      margin: 0 0 20px;
      color: ${theme.subtextColor};
      font-size: 0.9rem;
    }
    #${id} .pf-discover-search {
      max-width: 400px;
      margin: 0 auto;
    }
    #${id} .pf-discover-input {
      width: 100%;
      padding: 10px 16px;
      border-radius: 999px;
      border: 1px solid ${hexToRgba(theme.cardBorder, 0.5)};
      background: ${theme.cardBg};
      color: ${theme.textColor};
      font-size: 0.875rem;
      font-family: '${theme.bodyFont}', sans-serif;
      outline: none;
      transition: border-color 0.2s ease;
    }
    #${id} .pf-discover-input:focus {
      border-color: ${theme.accentColor};
    }
    #${id} .pf-discover-input::placeholder {
      color: ${theme.subtextColor};
    }

    /* ── Demo Grid ───────────────────────────────────────────── */
    #${id} .pf-demo-grid {
      display: grid;
      gap: 20px;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }

    #${id} .pf-demo-card {
      ${cardCss};
      overflow: hidden;
      cursor: default;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    #${id} .pf-demo-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 32px ${hexToRgba(theme.cardBorder, 0.35)};
    }

    #${id} .pf-demo-banner {
      height: 160px;
      position: relative;
      overflow: hidden;
    }
    #${id} .pf-demo-banner img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    #${id} .pf-demo-banner-gradient {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #${id} .pf-demo-info {
      padding: 16px 20px 20px;
    }

    #${id} .pf-demo-info h3 {
      font-size: 1rem;
      font-weight: 600;
      color: ${theme.textColor};
      font-family: '${theme.headingFont}', sans-serif;
      margin: 0;
    }

    #${id} .pf-demo-info p {
      font-size: 0.8125rem;
      color: ${theme.subtextColor};
      margin-top: 6px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    #${id} .pf-demo-links {
      display: flex;
      gap: 12px;
      margin-top: 12px;
    }

    #${id} .pf-demo-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      color: ${theme.accentColor};
      text-decoration: none;
      background: none;
      border: none;
      cursor: pointer;
      font-family: inherit;
      padding: 0;
    }
    #${id} .pf-demo-link:hover { text-decoration: underline; }

    /* ── Home Hero ────────────────────────────────────────────── */
    #${id} .pf-home-split {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 40px;
      align-items: start;
      margin-bottom: 32px;
    }

    #${id} .pf-home-left {
      min-width: 0;
    }

    #${id} .pf-home-right {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      min-width: 190px;
    }

    #${id} .pf-home-avatar {
      width: 148px;
      height: 148px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid ${theme.accentColor};
      box-shadow: 0 0 0 6px ${hexToRgba(theme.accentColor, 0.15)}, 0 8px 28px rgba(0,0,0,0.18);
      display: block;
    }

    #${id} .pf-home-avatar-placeholder {
      width: 148px;
      height: 148px;
      border-radius: 50%;
      background: ${hexToRgba(theme.accentColor, 0.08)};
      border: 2px dashed ${hexToRgba(theme.accentColor, 0.3)};
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #${id} .pf-home-stats-col {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    #${id} .pf-home-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 20px;
    }

    #${id} .pf-home-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s;
      border: 1.5px solid ${hexToRgba(theme.accentColor, 0.35)};
      color: ${theme.accentColor};
      background: ${hexToRgba(theme.accentColor, 0.08)};
    }
    #${id} .pf-home-action-btn:hover {
      background: ${hexToRgba(theme.accentColor, 0.16)};
      transform: translateY(-1px);
    }

    #${id} .pf-home-hero {
      margin-bottom: 0;
    }

    #${id} .pf-home-welcome {
      font-size: 0.875rem;
      font-weight: 500;
      color: ${theme.subtextColor};
      margin-bottom: 4px;
    }

    #${id} .pf-home-name {
      font-family: '${theme.headingFont}', sans-serif;
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-weight: 800;
      color: ${theme.textColor};
      line-height: 1.15;
      letter-spacing: -0.02em;
    }

    #${id} .pf-home-headline {
      font-size: 1.1rem;
      color: ${theme.accentColor};
      font-weight: 600;
      margin-top: 6px;
    }

    #${id} .pf-home-bio {
      margin-top: 12px;
      font-size: 0.9375rem;
      color: ${theme.subtextColor};
      line-height: 1.65;
      max-width: 640px;
    }

    #${id} .pf-home-meta {
      margin-top: 16px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 14px;
      font-size: 0.8125rem;
      color: ${theme.subtextColor};
    }

    #${id} .pf-home-meta a {
      color: ${theme.accentColor};
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    #${id} .pf-home-meta a:hover { text-decoration: underline; }

    #${id} .pf-home-meta span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    #${id} .pf-skill-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 20px;
    }

    /* ── Section Grid ────────────────────────────────────────── */
    #${id} .pf-grid {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }

    /* ── Inline Section Link ─────────────────────────────────── */
    #${id} .pf-view-all {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 20px;
      font-size: 0.8125rem;
      font-weight: 600;
      color: ${theme.accentColor};
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
      font-family: inherit;
    }
    #${id} .pf-view-all:hover { text-decoration: underline; }

    /* ── Hamburger (mobile) ──────────────────────────────────── */
    #${id} .pf-hamburger {
      display: none;
      position: fixed;
      top: 12px;
      left: 12px;
      z-index: 50;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: 1px solid ${hexToRgba(theme.cardBorder, 0.5)};
      background: ${theme.cardBg};
      color: ${theme.textColor};
      cursor: pointer;
      align-items: center;
      justify-content: center;
    }

    #${id} .pf-sidebar-overlay {
      display: none;
    }

    /* ── Footer ──────────────────────────────────────────────── */
    #${id} .pf-footer {
      padding: 24px;
      text-align: center;
      font-size: 0.7rem;
      color: ${theme.subtextColor};
      border-top: 1px solid ${hexToRgba(theme.cardBorder, 0.3)};
    }
    #${id} .pf-footer a {
      color: ${theme.accentColor};
      text-decoration: none;
      font-weight: 600;
    }

    /* ── Empty ────────────────────────────────────────────────── */
    #${id} .pf-empty {
      padding: 48px 0;
      text-align: center;
      color: ${theme.subtextColor};
    }

    /* ── Accent ───────────────────────────────────────────────── */
    #${id} .pf-accent { color: ${theme.accentColor}; }

    /* ── Home 2-col layout (bars + radar side by side) ──────── */
    #${id} .pf-home-2col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      align-items: start;
      margin-bottom: 28px;
    }

    /* ── Animations ──────────────────────────────────────────── */
    @keyframes pf-bar-fill-in {
      from { width: 0; }
      to { width: var(--bar-w, 0%); }
    }
    @keyframes pf-radar-wrap-in {
      from { opacity: 0; transform: scale(0.55); }
      to { opacity: 1; transform: scale(1); }
    }
    #${id} .pf-radar-wrap {
      animation: pf-radar-wrap-in 0.85s cubic-bezier(0.34, 1.4, 0.64, 1) both;
      transform-origin: center;
      display: flex;
      justify-content: center;
    }
    ${getAnimationCss(id, theme.animationStyle ?? "subtle")}

    /* ── Responsive (container query for preview support) ──── */
    @container portfolio (max-width: 768px) {
      #${id} .pf-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        transform: translateX(-100%);
      }
      #${id} .pf-sidebar.open {
        transform: translateX(0);
      }
      #${id} .pf-sidebar-overlay.open {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 35;
        display: block;
      }
      #${id} .pf-hamburger {
        display: flex;
      }
      #${id} .pf-content-inner {
        padding: 56px 16px 32px;
      }
      #${id} .pf-prof-label { width: 100px; font-size: 0.75rem; }
      #${id} .pf-prof-years { display: none; }
      #${id} .pf-demo-grid { grid-template-columns: 1fr; }
      #${id} .pf-work-grid { grid-template-columns: 1fr; }
      #${id} .pf-edu-grid { grid-template-columns: 1fr; }
      #${id} .pf-stats { grid-template-columns: repeat(2, 1fr); }
      #${id} .pf-home-2col { grid-template-columns: 1fr; gap: 16px; }
      #${id} .pf-home-split { grid-template-columns: 1fr; gap: 24px; }
      #${id} .pf-home-right { flex-direction: row; justify-content: center; gap: 24px; min-width: 0; }
      #${id} .pf-home-avatar, #${id} .pf-home-avatar-placeholder { width: 90px; height: 90px; }
      #${id} .pf-home-stats-col { grid-template-columns: repeat(2, 1fr); }
    }

    /* Fallback for viewport-level mobile */
    @media (max-width: 768px) {
      #${id} .pf-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        transform: translateX(-100%);
      }
      #${id} .pf-sidebar.open {
        transform: translateX(0);
      }
      #${id} .pf-sidebar-overlay.open {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 35;
        display: block;
      }
      #${id} .pf-hamburger {
        display: flex;
      }
      #${id} .pf-content-inner {
        padding: 56px 16px 32px;
      }
      #${id} .pf-prof-label { width: 100px; font-size: 0.75rem; }
      #${id} .pf-prof-years { display: none; }
      #${id} .pf-demo-grid { grid-template-columns: 1fr; }
      #${id} .pf-work-grid { grid-template-columns: 1fr; }
      #${id} .pf-edu-grid { grid-template-columns: 1fr; }
      #${id} .pf-stats { grid-template-columns: repeat(2, 1fr); }
      #${id} .pf-home-2col { grid-template-columns: 1fr; gap: 16px; }
      #${id} .pf-home-split { grid-template-columns: 1fr; gap: 24px; }
      #${id} .pf-home-right { flex-direction: row; justify-content: center; gap: 24px; min-width: 0; }
      #${id} .pf-home-avatar, #${id} .pf-home-avatar-placeholder { width: 90px; height: 90px; }
      #${id} .pf-home-stats-col { grid-template-columns: repeat(2, 1fr); }
    }

    /* ── Print ────────────────────────────────────────────────── */
    @media print {
      #${id} { display: block !important; }
      #${id} .pf-sidebar { display: none !important; }
      #${id} .pf-hamburger { display: none !important; }
      #${id} .pf-content { min-height: 0 !important; background: white !important; background-image: none !important; }
      #${id} .pf-content-inner { padding: 16px !important; }
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
      #${id} .pf-card:hover { transform: none !important; box-shadow: none !important; }
      #${id} .pf-card h3 { color: #111 !important; }
      #${id} .pf-card-sub, #${id} .pf-card-desc, #${id} .pf-card-meta, #${id} .pf-achievements { color: #333 !important; }
      #${id} .pf-tag { background-color: #eee !important; color: #333 !important; border-color: #ccc !important; }
      #${id} .pf-accent { color: #555 !important; }
      #${id} .pf-animate { animation: none !important; }
      #${id} .pf-prof-bar-fill { transition: none !important; }
    }
  `;
}

// ── Main Component ──────────────────────────────────────────────────────────

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

  const validSections: ActiveSection[] = ["home", "portfolio", "education", "discover", "skills", "volunteering", "contact"];
  const [activeSection, setActiveSection] = useState<ActiveSection>(() => {
    if (!preview && typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "") as ActiveSection;
      if (validSections.includes(hash)) return hash;
    }
    return "home";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedDemo, setExpandedDemo] = useState<string | null>(null);
  const [expandedWork, setExpandedWork] = useState<string | null>(null);
  const [expandedEdu, setExpandedEdu] = useState<string | null>(null);
  const [eduColors, setEduColors] = useState<Record<string, string>>({});
  const [selectedDemoTag, setSelectedDemoTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [demoSearch, setDemoSearch] = useState("");

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

  // Extract dominant colors from education images
  const extractEduColors = useCallback(async () => {
    const entries = [...education].filter(e => e.imageUrl);
    if (entries.length === 0) return;
    const colors: Record<string, string> = {};
    await Promise.all(entries.map(async (e) => {
      if (!e.imageUrl) return;
      try {
        const [r, g, b] = await extractDominantColor(e.imageUrl);
        colors[e._id] = rgbToGradient(r, g, b);
      } catch {
        colors[e._id] = rgbToGradient(59, 130, 246);
      }
    }));
    setEduColors(colors);
  }, [education]);

  useEffect(() => { extractEduColors(); }, [extractEduColors]);

  const previewFontUrl = preview ? getGoogleFontsUrl(theme.headingFont, theme.bodyFont) : null;

  // Data preparation
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);
  const sortedEducation = [...education].sort((a, b) => a.order - b.order);
  const publicDemos = demos.filter(d => d.isPublic);
  const sortedSkills = [...skills].sort((a, b) => a.order - b.order);
  const sortedVolunteering = [...volunteering].sort((a, b) => a.order - b.order);
  const sortedCertificates = [...certificates].sort((a, b) => a.order - b.order);

  // Skill proficiency data
  const skillsWithProficiency = sortedSkills.map(s => ({
    ...s,
    pct: calculateProficiency(s.yearsOfExperience, s.proficiency),
    yrsLabel: formatYears(s.yearsOfExperience),
  })).sort((a, b) => b.pct - a.pct);

  const skillCategories = Array.from(new Set(sortedSkills.map(s => s.category)));

  // Demo filtering
  const allDemoTags = Array.from(new Set(publicDemos.flatMap(d => d.tags ?? [])));
  const filteredDemos = publicDemos.filter(d => {
    if (selectedDemoTag && !d.tags?.includes(selectedDemoTag)) return false;
    if (demoSearch) {
      const q = demoSearch.toLowerCase();
      return d.title.toLowerCase().includes(q)
        || d.description?.toLowerCase().includes(q)
        || d.tags?.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  // Portfolio stats
  const stats = computePortfolioStats(
    sortedSkills,
    sortedSections,
    publicDemos.length,
    sortedCertificates.length,
  );

  // Top skills for home section (top 8)
  const topSkills = skillsWithProficiency.slice(0, 8);

  // Featured demos for home (first 3)
  const featuredDemos = publicDemos.slice(0, 3);

  // Section visibility
  const hasPortfolio = theme.showExperience && sortedSections.length > 0;
  const hasEducation = theme.showEducation && (sortedEducation.length > 0 || sortedCertificates.length > 0);
  const hasDemos = theme.showDemos && publicDemos.length > 0;
  const hasSkills = theme.showSkills && sortedSkills.length > 0;
  const hasVolunteering = theme.showVolunteering && sortedVolunteering.length > 0;
  const showContact = (theme as ThemeConfig & { showContact?: boolean }).showContact !== false && !preview;
  const showCertificates = (theme as ThemeConfig & { showCertificates?: boolean }).showCertificates !== false;

  // Navigate helper
  function nav(section: ActiveSection) {
    setActiveSection(section);
    setSidebarOpen(false);
    if (!preview && typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${section}`);
    }
  }

  return (
    <div id={scopeId} data-portfolio>
      {/* Scoped CSS */}
      <style dangerouslySetInnerHTML={{ __html: buildPortfolioCss(scopeId, theme) }} />

      {previewFontUrl && (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link rel="stylesheet" href={previewFontUrl} />
      )}

      {theme.customCss && !preview && (
        <style dangerouslySetInnerHTML={{ __html: sanitizeCss(theme.customCss) }} />
      )}

      {/* Mobile hamburger */}
      <button
        className="pf-hamburger"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle navigation"
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      <div
        className={`pf-sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className={`pf-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Profile card */}
        <div className="pf-sidebar-profile">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="" className="pf-sidebar-avatar" />
          ) : (
            <div className="pf-sidebar-avatar-placeholder">
              <User size={28} style={{ color: theme.accentColor }} />
            </div>
          )}
          <p className="pf-sidebar-name">{profile.displayName || profile.slug}</p>
          {profile.headline && (
            <p className="pf-sidebar-headline">{profile.headline}</p>
          )}
        </div>

        {/* Navigation */}
        <nav className="pf-sidebar-nav">
          <button className={`pf-nav-item ${activeSection === "home" ? "active" : ""}`} onClick={() => nav("home")}>
            <Home size={16} /> Home
          </button>

          <div className="pf-nav-divider" />

          {(hasPortfolio || hasEducation) && (
            <div className="pf-sidebar-label">Profile</div>
          )}
          {hasPortfolio && (
            <button className={`pf-nav-item ${activeSection === "portfolio" ? "active" : ""}`} onClick={() => nav("portfolio")}>
              <Briefcase size={16} /> Portfolio
              <span className="pf-nav-badge">{sortedSections.length}</span>
            </button>
          )}
          {hasEducation && (
            <button className={`pf-nav-item ${activeSection === "education" ? "active" : ""}`} onClick={() => nav("education")}>
              <GraduationCap size={16} /> Education
              <span className="pf-nav-badge">{sortedEducation.length + (showCertificates ? sortedCertificates.length : 0)}</span>
            </button>
          )}

          {hasDemos && (
            <>
              <div className="pf-nav-divider" />
              <div className="pf-sidebar-label">Demos ({publicDemos.length})</div>
              <button className={`pf-nav-item ${activeSection === "discover" ? "active" : ""}`} onClick={() => nav("discover")}>
                <Compass size={16} /> Discover
              </button>
            </>
          )}

          {hasSkills && (
            <>
              <div className="pf-nav-divider" />
              <button className={`pf-nav-item ${activeSection === "skills" ? "active" : ""}`} onClick={() => nav("skills")}>
                <Wrench size={16} /> Skills
                <span className="pf-nav-badge">{sortedSkills.length}</span>
              </button>
            </>
          )}

          {hasVolunteering && (
            <>
              <div className="pf-nav-divider" />
              <button className={`pf-nav-item ${activeSection === "volunteering" ? "active" : ""}`} onClick={() => nav("volunteering")}>
                <Heart size={16} /> Volunteering
              </button>
            </>
          )}

          {showContact && (
            <>
              <div className="pf-nav-divider" />
              <button className={`pf-nav-item ${activeSection === "contact" ? "active" : ""}`} onClick={() => nav("contact")}>
                <Mail size={16} /> Contact
              </button>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="pf-sidebar-footer">
          Built with <a href="https://mivitae.org" target="_blank" rel="noopener noreferrer">mivitae</a>
        </div>
      </aside>

      {/* ── Content Area ─────────────────────────────────────── */}
      <div className="pf-content">
        <div className="pf-content-inner">

          {/* ── HOME ─────────────────────────────────────────── */}
          {activeSection === "home" && (
            <div className="pf-animate">
              {/* Two-column hero */}
              <div className="pf-home-split">
                {/* Left: bio content */}
                <div className="pf-home-left">
                  <div className="pf-home-hero">
                    <p className="pf-home-welcome">Welcome to</p>
                    <h1 className="pf-home-name">
                      {(() => { const raw = profile.displayName || profile.slug; const first = raw.split(" ")[0]; return first.charAt(0).toUpperCase() + first.slice(1); })()}&apos;s Portfolio
                    </h1>
                    {profile.headline && (
                      <p className="pf-home-headline">{profile.headline}</p>
                    )}
                    {profile.bio && (
                      <p className="pf-home-bio">{profile.bio}</p>
                    )}

                    {/* Meta links */}
                    <div className="pf-home-meta">
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
                    </div>

                    {/* Skill chips */}
                    {hasSkills && (
                      <div className="pf-skill-chips">
                        {sortedSkills.slice(0, 12).map(s => (
                          <span key={s._id} className="pf-tag">{s.name}</span>
                        ))}
                        {sortedSkills.length > 12 && (
                          <button className="pf-tag" onClick={() => nav("skills")}>
                            +{sortedSkills.length - 12} more
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick navigation actions */}
                  <div className="pf-home-actions">
                    {hasPortfolio && (
                      <button className="pf-home-action-btn" onClick={() => nav("portfolio")}>
                        <Briefcase style={{ width: 13, height: 13 }} /> Portfolio
                      </button>
                    )}
                    {hasEducation && (
                      <button className="pf-home-action-btn" onClick={() => nav("education")}>
                        <GraduationCap style={{ width: 13, height: 13 }} /> Education
                      </button>
                    )}
                    {hasSkills && (
                      <button className="pf-home-action-btn" onClick={() => nav("skills")}>
                        <Wrench style={{ width: 13, height: 13 }} /> Skills
                      </button>
                    )}
                    {hasDemos && (
                      <button className="pf-home-action-btn" onClick={() => nav("discover")}>
                        <Zap style={{ width: 13, height: 13 }} /> Demos
                      </button>
                    )}
                    {showContact && (
                      <button className="pf-home-action-btn" onClick={() => nav("contact")}>
                        <Mail style={{ width: 13, height: 13 }} /> Contact
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: avatar + stats */}
                <div className="pf-home-right">
                  {profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatarUrl} alt={profile.displayName || profile.slug} className="pf-home-avatar" />
                  ) : (
                    <div className="pf-home-avatar-placeholder">
                      <User style={{ width: 52, height: 52, color: theme.accentColor, opacity: 0.5 }} />
                    </div>
                  )}

                  {(stats.totalTechnologies > 0 || stats.yearsExperience > 0) && (
                    <div className="pf-home-stats-col">
                      {stats.totalTechnologies > 0 && (
                        <div className="pf-stat-card">
                          <div className="pf-stat-value">{stats.totalTechnologies}+</div>
                          <div className="pf-stat-label">Skills</div>
                        </div>
                      )}
                      {stats.yearsExperience > 0 && (
                        <div className="pf-stat-card">
                          <div className="pf-stat-value">{stats.yearsExperience}+</div>
                          <div className="pf-stat-label">Yrs Exp</div>
                        </div>
                      )}
                      {stats.demoCount > 0 && (
                        <div className="pf-stat-card">
                          <div className="pf-stat-value">{stats.demoCount}</div>
                          <div className="pf-stat-label">Demos</div>
                        </div>
                      )}
                      {stats.certCount > 0 && (
                        <div className="pf-stat-card">
                          <div className="pf-stat-value">{stats.certCount}</div>
                          <div className="pf-stat-label">Certs</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Skills + Radar side-by-side */}
              {(topSkills.length > 0 || (hasSkills && skillCategories.length >= 3)) && (
                <div className="pf-home-2col">
                  {/* Left col: Skills Proficiency */}
                  {topSkills.length > 0 && (
                    <section>
                      <div className="pf-section-title" style={{ fontSize: "1.2rem" }}>
                        <Wrench style={{ width: 18, height: 18, flexShrink: 0 }} className="pf-accent" />
                        Skills Proficiency
                      </div>
                      <div className="pf-divider" />
                      {topSkills.map(s => {
                        const dPct = Math.min(99, Math.round(s.pct + (100 - s.pct) * 0.3));
                        return (
                          <div key={s._id} className="pf-prof-row">
                            <span className="pf-prof-label">{s.name}</span>
                            <div className="pf-prof-bar-bg">
                              <div className="pf-prof-bar-fill" style={{ '--bar-w': `${dPct}%` } as React.CSSProperties} />
                            </div>
                            <span className="pf-prof-pct">{dPct}%</span>
                            {s.yrsLabel && <span className="pf-prof-years">{s.yrsLabel}</span>}
                          </div>
                        );
                      })}
                      {sortedSkills.length > 8 && (
                        <button className="pf-view-all" onClick={() => nav("skills")}>
                          View all {sortedSkills.length} skills →
                        </button>
                      )}
                    </section>
                  )}

                  {/* Right col: Radar Chart */}
                  {hasSkills && skillCategories.length >= 3 && (() => {
                    const catData = skillCategories.map(cat => {
                      const catSkills = skillsWithProficiency.filter(s => s.category === cat);
                      const avg = catSkills.reduce((sum, s) => sum + s.pct, 0) / catSkills.length;
                      return { category: cat, avg, count: catSkills.length };
                    }).sort((a, b) => b.avg - a.avg).slice(0, 8);

                    const n = catData.length;
                    if (n < 3) return null;

                    const cx = 150, cy = 150, maxR = 110;
                    const angleStep = (2 * Math.PI) / n;
                    const levels = [20, 40, 60, 80, 100];

                    const getPoint = (i: number, pct: number) => {
                      const angle = (i * angleStep) - Math.PI / 2;
                      const r = (pct / 100) * maxR;
                      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
                    };

                    const dataPoints = catData.map((d, i) => getPoint(i, d.avg));
                    const polygon = dataPoints.map(p => `${p.x},${p.y}`).join(" ");

                    return (
                      <section key="radar">
                        <div className="pf-section-title" style={{ fontSize: "1.2rem" }}>
                          <Target style={{ width: 18, height: 18, flexShrink: 0 }} className="pf-accent" />
                          Skill Matrix
                        </div>
                        <div className="pf-divider" />
                        <div className="pf-radar-wrap">
                          <svg viewBox="0 0 300 300" width="240" height="240" style={{ maxWidth: "100%" }}>
                            {levels.map(lvl => {
                              const pts = Array.from({ length: n }, (_, i) => {
                                const p = getPoint(i, lvl);
                                return `${p.x},${p.y}`;
                              }).join(" ");
                              return (
                                <polygon key={lvl} points={pts} fill="none" stroke={hexToRgba(theme.cardBorder, 0.3)} strokeWidth={1} />
                              );
                            })}
                            {catData.map((_, i) => {
                              const p = getPoint(i, 100);
                              return (
                                <line key={`axis-${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={hexToRgba(theme.cardBorder, 0.2)} strokeWidth={1} />
                              );
                            })}
                            <polygon points={polygon} fill={hexToRgba(theme.accentColor, 0.15)} stroke={theme.accentColor} strokeWidth={2} />
                            {dataPoints.map((p, i) => (
                              <circle key={`dot-${i}`} cx={p.x} cy={p.y} r={4} fill={theme.accentColor} />
                            ))}
                            {catData.map((d, i) => {
                              const labelR = maxR + 22;
                              const angle = (i * angleStep) - Math.PI / 2;
                              const lx = cx + labelR * Math.cos(angle);
                              const ly = cy + labelR * Math.sin(angle);
                              const anchor = Math.abs(Math.cos(angle)) < 0.01 ? "middle" : Math.cos(angle) > 0 ? "start" : "end";
                              return (
                                <text key={`label-${i}`} x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle" fill={theme.subtextColor} fontSize="9" fontFamily={`'${theme.bodyFont}', sans-serif`}>
                                  {d.category}
                                </text>
                              );
                            })}
                          </svg>
                        </div>
                      </section>
                    );
                  })()}
                </div>
              )}

              {/* Featured Demos */}
              {featuredDemos.length > 0 && (
                <section>
                  <div className="pf-section-title" style={{ fontSize: "1.2rem" }}>
                    <Zap style={{ width: 18, height: 18, flexShrink: 0 }} className="pf-accent" />
                    Featured Demos
                  </div>
                  <div className="pf-divider" />
                  <div className="pf-demo-grid">
                    {featuredDemos.map(d => (
                      <div key={d._id} className="pf-demo-card">
                        <div className="pf-demo-banner">
                          {d.bannerUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={d.bannerUrl} alt={d.title} />
                          ) : (
                            <div
                              className="pf-demo-banner-gradient"
                              style={{ background: getDemoGradient(d.title, theme.accentColor) }}
                            >
                              <Zap size={32} style={{ color: "rgba(255,255,255,0.5)" }} />
                            </div>
                          )}
                        </div>
                        <div className="pf-demo-info">
                          <h3>{d.title}</h3>
                          {d.description && <p>{d.description}</p>}
                          {d.tags && d.tags.length > 0 && (
                            <div className="pf-tags" style={{ marginTop: 8 }}>
                              {d.tags.slice(0, 3).map(t => <span key={t} className="pf-tag">{t}</span>)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {publicDemos.length > 3 && (
                    <button className="pf-view-all" onClick={() => nav("discover")}>
                      View all {publicDemos.length} demos →
                    </button>
                  )}
                </section>
              )}

              {/* Empty fallback */}
              {sortedSections.length === 0 && sortedEducation.length === 0 && publicDemos.length === 0 && sortedSkills.length === 0 && (
                <div className="pf-empty">
                  This portfolio is still being built. Check back soon!
                </div>
              )}
            </div>
          )}

          {/* ── PORTFOLIO (Work History) ─────────────────────── */}
          {activeSection === "portfolio" && hasPortfolio && (
            <section className="pf-animate">
              <div className="pf-section-title">
                <Briefcase style={{ width: 22, height: 22, flexShrink: 0 }} className="pf-accent" />
                💼 Work Experience
              </div>
              <p className="pf-section-subtitle">
                {sortedSections.length} position{sortedSections.length !== 1 ? "s" : ""} across my career
              </p>
              <div className="pf-divider" />

              {/* ── Hero Stats ── */}
              {(() => {
                const uniqueCompanies = new Set(sortedSections.map(s => s.companyName)).size;
                const uniqueSkills = new Set(sortedSections.flatMap(s => s.skills)).size;
                const workYears = (() => {
                  if (sortedSections.length === 0) return 0;
                  const years = sortedSections.map(s => {
                    const m = s.startDate.match(/\d{4}/);
                    return m ? parseInt(m[0]) : new Date().getFullYear();
                  });
                  return new Date().getFullYear() - Math.min(...years);
                })();
                return (
                  <div className="pf-work-stats">
                    {workYears > 0 && (
                      <div className="pf-work-stat">
                        <span className="pf-work-stat-value">{workYears}+</span>
                        <span className="pf-work-stat-label">Years<br/>experience</span>
                      </div>
                    )}
                    <div className="pf-work-stat">
                      <span className="pf-work-stat-value">{sortedSections.length}</span>
                      <span className="pf-work-stat-label">Positions<br/>held</span>
                    </div>
                    {uniqueCompanies > 1 && (
                      <div className="pf-work-stat">
                        <span className="pf-work-stat-value">{uniqueCompanies}</span>
                        <span className="pf-work-stat-label">Companies<br/>worked at</span>
                      </div>
                    )}
                    {uniqueSkills > 0 && (
                      <div className="pf-work-stat">
                        <span className="pf-work-stat-value">{uniqueSkills}+</span>
                        <span className="pf-work-stat-label">Technologies<br/>used</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ── Image Card Grid ── */}
              <div className="pf-work-grid">
                {sortedSections.map((s, i) => (
                  <div
                    key={s._id}
                    className={`pf-work-card ${i === 0 && sortedSections.length >= 3 ? "pf-work-card--featured" : ""} ${expandedWork === s._id ? "active" : ""}`}
                    onClick={() => setExpandedWork(expandedWork === s._id ? null : s._id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpandedWork(expandedWork === s._id ? null : s._id); }}}
                  >
                    <div className="pf-work-card-img">
                      {s.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.imageUrl} alt={s.companyName} />
                      ) : (
                        <div className="pf-work-card-img-placeholder">
                          <Briefcase style={{ width: 48, height: 48, opacity: 0.2 }} />
                        </div>
                      )}
                    </div>
                    <div className="pf-work-card-overlay">
                      {s.skills.length > 0 && (
                        <span className="pf-work-card-domain">
                          🏷️ {s.skills.slice(0, 2).join(" · ")}
                        </span>
                      )}
                      <span className="pf-work-card-company">{s.companyName}</span>
                      <span className="pf-work-card-role">{s.role}</span>
                    </div>
                    <div className="pf-work-card-arrow">↗</div>
                  </div>
                ))}
              </div>

              {/* ── Expanded Detail Panel ── */}
              {expandedWork && (() => {
                const s = sortedSections.find(sec => sec._id === expandedWork);
                if (!s) return null;
                const linkedDemos = publicDemos.filter(d => s.demoIds?.includes(d._id));
                return (
                  <div className="pf-work-detail">
                    <div className="pf-work-detail-card">
                      <div className="pf-work-detail-header">
                        {s.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.imageUrl} alt={s.companyName} className="pf-work-detail-logo" />
                        ) : (
                          <div style={{ width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: hexToRgba(theme.accentColor, 0.1), flexShrink: 0 }}>
                            <Briefcase style={{ width: 20, height: 20, opacity: 0.5 }} />
                          </div>
                        )}
                        <div className="pf-work-detail-info">
                          <h2>{s.companyName}</h2>
                          <p>{s.role} · 📅 {s.startDate} — {s.endDate ?? "Present"}</p>
                        </div>
                        <button
                          className="pf-work-detail-close"
                          onClick={(e) => { e.stopPropagation(); setExpandedWork(null); }}
                          aria-label="Close details"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {s.skills.length > 0 && (
                        <div style={{ padding: "12px 24px 0", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {s.skills.slice(0, 5).map(skill => (
                            <span key={skill} className="pf-tag">{skill}</span>
                          ))}
                        </div>
                      )}

                      <div className="pf-work-detail-body">
                        {s.description && (
                          <div className="pf-work-detail-section">
                            <h5>📋 Overview</h5>
                            <p>{s.description}</p>
                          </div>
                        )}

                        {s.achievements.length > 0 && (
                          <div className="pf-work-detail-section">
                            <h5>🎯 Key Achievements</h5>
                            <ul>
                              {s.achievements.map((a, idx) => (
                                <li key={idx}>
                                  <span style={{ flexShrink: 0, fontSize: "0.75rem" }}>✅</span>
                                  {a}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {s.skills.length > 0 && (
                          <div className="pf-work-detail-section">
                            <h5>🛠️ Tech Stack</h5>
                            <div className="pf-tags" style={{ marginTop: 0 }}>
                              {s.skills.map(skill => (
                                <span key={skill} className="pf-tag">{skill}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {linkedDemos.length > 0 && (
                          <div className="pf-work-detail-section">
                            <h5>⚡ Related Demos</h5>
                            <div className="pf-tags" style={{ marginTop: 0 }}>
                              {linkedDemos.map(d => (
                                <span key={d._id} className="pf-demo-tag">
                                  <Zap style={{ width: 10, height: 10 }} /> {d.title}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </section>
          )}

          {/* ── EDUCATION ────────────────────────────────────── */}
          {activeSection === "education" && hasEducation && (
            <section className="pf-animate">
              <div className="pf-section-title">
                <GraduationCap style={{ width: 22, height: 22, flexShrink: 0 }} className="pf-accent" />
                Education
              </div>
              <p className="pf-section-subtitle">Academic background &amp; credentials</p>
              <div className="pf-divider" />

              {sortedEducation.length > 0 && (
                <div className="pf-edu-grid" style={{ marginBottom: sortedCertificates.length > 0 ? 32 : 0 }}>
                  {sortedEducation.map(e => (
                    <div
                      key={e._id}
                      className={`pf-edu-card ${expandedEdu === e._id ? "active" : ""}`}
                      onClick={() => setExpandedEdu(expandedEdu === e._id ? null : e._id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); setExpandedEdu(expandedEdu === e._id ? null : e._id); }}}
                    >
                      <div
                        className="pf-edu-card-bg"
                        style={{
                          background: eduColors[e._id]
                            ?? `linear-gradient(150deg, ${hexToRgba(theme.accentColor, 0.8)} 0%, ${hexToRgba(theme.accentColor, 0.3)} 55%, rgba(0,0,0,0.9) 100%)`,
                        }}
                      />
                      <div className="pf-edu-card-overlay" />
                      <div className="pf-edu-card-logo-wrap">
                        {e.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={e.imageUrl} alt={e.institution} className="pf-edu-card-logo" />
                        ) : (
                          <div className="pf-edu-card-logo-placeholder">
                            <GraduationCap style={{ width: 64, height: 64 }} />
                          </div>
                        )}
                      </div>
                      <div className="pf-edu-card-arrow">→</div>
                      <div className="pf-edu-card-content">
                        {e.degree && <span className="pf-edu-card-badge">🎓 {e.degree}</span>}
                        <span className="pf-edu-card-name">{e.institution}</span>
                        <span className="pf-edu-card-degree">
                          {e.fieldOfStudy ?? e.degree}{e.fieldOfStudy && e.degree && e.fieldOfStudy !== e.degree ? ` · ${e.degree}` : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Education detail panel */}
              {expandedEdu && (() => {
                const e = sortedEducation.find(ed => ed._id === expandedEdu);
                if (!e) return null;
                return (
                  <div className="pf-edu-detail">
                    <div className="pf-edu-detail-card">
                      <div className="pf-edu-detail-header">
                        {e.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={e.imageUrl} alt={e.institution} className="pf-edu-detail-logo" />
                        ) : (
                          <div style={{ width: 56, height: 56, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: hexToRgba(theme.accentColor, 0.1), flexShrink: 0 }}>
                            <GraduationCap style={{ width: 24, height: 24, opacity: 0.5 }} />
                          </div>
                        )}
                        <div className="pf-edu-detail-info">
                          <h2>{e.institution}</h2>
                          <p>{e.fieldOfStudy ?? e.degree} · 📅 {e.startYear} — {e.endYear ?? "Present"}</p>
                        </div>
                        <button
                          className="pf-edu-detail-close"
                          onClick={(ev) => { ev.stopPropagation(); setExpandedEdu(null); }}
                          aria-label="Close"
                        >
                          <X style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                      <div className="pf-edu-detail-body">
                        {e.degree && <span className="pf-edu-badge">🎓 {e.degree}</span>}
                        {e.gpa && <span className="pf-edu-badge">📊 GPA: {e.gpa}</span>}
                        {e.honors && <span className="pf-edu-badge">🏆 {e.honors}</span>}

                        {e.fieldOfStudy && (
                          <div className="pf-work-detail-section">
                            <h5>📋 Field of Study</h5>
                            <p style={{ fontSize: "0.88rem", lineHeight: 1.75, color: theme.subtextColor }}>
                              {e.fieldOfStudy}
                            </p>
                          </div>
                        )}

                        {e.relevantCoursework && (
                          <div className="pf-work-detail-section">
                            <h5>📚 Relevant Coursework</h5>
                            <div className="pf-tags" style={{ marginTop: 0 }}>
                              {e.relevantCoursework.split(/[,;|\n]+/).map(c => c.trim()).filter(Boolean).map((course, idx) => (
                                <span key={idx} className="pf-tag">{course}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {e.activities && e.activities.length > 0 && (
                          <div className="pf-work-detail-section">
                            <h5>🎯 Activities &amp; Involvement</h5>
                            <ul>
                              {e.activities.map((a, idx) => (
                                <li key={idx}>
                                  <span style={{ flexShrink: 0, fontSize: "0.75rem" }}>✅</span>
                                  {a}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Certificates */}
              {showCertificates && sortedCertificates.length > 0 && (
                <>
                  <div className="pf-section-title" style={{ fontSize: "1.2rem", marginTop: 8 }}>
                    <Award style={{ width: 18, height: 18, flexShrink: 0 }} className="pf-accent" />
                    Certifications
                  </div>
                  <div className="pf-divider" />
                  <div className="pf-grid">
                    {sortedCertificates.map(cert => (
                      <div key={cert._id} className="pf-card">
                        <h3>{cert.name}</h3>
                        <p className="pf-card-sub">{cert.issuer}</p>
                        {cert.issueDate && (
                          <p className="pf-card-meta" style={{ marginTop: 4 }}>Issued: {cert.issueDate}</p>
                        )}
                        {cert.expiryDate && (
                          <p className="pf-card-meta" style={{ marginTop: 2 }}>Expires: {cert.expiryDate}</p>
                        )}
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pf-demo-link"
                            style={{ marginTop: 8, display: "inline-flex" }}
                          >
                            <ExternalLink style={{ width: 12, height: 12 }} /> View Credential
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}

          {/* ── DISCOVER (Demos) ─────────────────────────────── */}
          {activeSection === "discover" && hasDemos && (
            <section className="pf-animate">
              {/* Hero banner */}
              <div className="pf-discover-hero">
                <Compass style={{ width: 36, height: 36, marginBottom: 12 }} className="pf-accent" />
                <h2>Discover Demos</h2>
                <p>
                  {publicDemos.length} interactive demo{publicDemos.length !== 1 ? "s" : ""} showcasing real skills
                </p>
                {/* Search bar */}
                <div className="pf-discover-search">
                  <input
                    type="text"
                    placeholder="Search demos..."
                    value={demoSearch}
                    onChange={e => setDemoSearch(e.target.value)}
                    className="pf-discover-input"
                  />
                </div>
              </div>

              {/* Tag filters */}
              {allDemoTags.length > 1 && (
                <div className="pf-cat-tabs" style={{ justifyContent: "center" }}>
                  <button
                    className={`pf-cat-tab ${selectedDemoTag === null ? "active" : ""}`}
                    onClick={() => setSelectedDemoTag(null)}
                  >
                    All ({publicDemos.length})
                  </button>
                  {allDemoTags.map(tag => {
                    const count = publicDemos.filter(d => d.tags?.includes(tag)).length;
                    return (
                      <button
                        key={tag}
                        className={`pf-cat-tab ${selectedDemoTag === tag ? "active" : ""}`}
                        onClick={() => setSelectedDemoTag(selectedDemoTag === tag ? null : tag)}
                      >
                        {tag} ({count})
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Demo grid */}
              <div className="pf-demo-grid">
                {filteredDemos.map(d => (
                  <div key={d._id} className="pf-demo-card">
                    <div className="pf-demo-banner">
                      {d.bannerUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={d.bannerUrl} alt={d.title} />
                      ) : (
                        <div
                          className="pf-demo-banner-gradient"
                          style={{ background: getDemoGradient(d.title, theme.accentColor) }}
                        >
                          <Zap size={32} style={{ color: "rgba(255,255,255,0.5)" }} />
                        </div>
                      )}
                    </div>
                    <div className="pf-demo-info">
                      <h3>{d.title}</h3>
                      {d.description && <p>{d.description}</p>}
                      {d.tags && d.tags.length > 0 && (
                        <div className="pf-tags" style={{ marginTop: 8 }}>
                          {d.tags.map(t => <span key={t} className="pf-tag">{t}</span>)}
                        </div>
                      )}
                      <div className="pf-demo-links">
                        {d.htmlContent && (
                          <button
                            className="pf-demo-link"
                            onClick={() => setExpandedDemo(expandedDemo === d._id ? null : d._id)}
                          >
                            {expandedDemo === d._id ? "Hide Preview" : "Preview →"}
                          </button>
                        )}
                        {d.demoUrl && (
                          <a href={d.demoUrl} target="_blank" rel="noopener noreferrer" className="pf-demo-link">
                            <Globe style={{ width: 12, height: 12 }} /> Live
                          </a>
                        )}
                        {d.githubUrl && (
                          <a href={d.githubUrl} target="_blank" rel="noopener noreferrer" className="pf-demo-link">
                            <ExternalLink style={{ width: 12, height: 12 }} /> Code
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Expanded demo iframe */}
              {expandedDemo && (() => {
                const demo = publicDemos.find(d => d._id === expandedDemo);
                if (!demo?.htmlContent) return null;
                return (
                  <div className="pf-card" style={{ marginTop: 20, overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${hexToRgba(theme.cardBorder, 0.3)}` }}>
                      <h3 style={{ margin: 0, fontFamily: `'${theme.headingFont}', sans-serif`, fontWeight: 600, color: theme.textColor }}>{demo.title}</h3>
                      <button
                        onClick={() => setExpandedDemo(null)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: theme.subtextColor, padding: 4 }}
                        aria-label="Close preview"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <iframe
                      srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${buildDemoIframeCss(theme)}</style><link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet"><script src="https://cdn.jsdelivr.net/npm/chart.js@4"><\/script></head><body>${demo.htmlContent}</body></html>`}
                      sandbox="allow-scripts"
                      title={demo.title}
                      style={{ width: "100%", height: "500px", border: "none", display: "block" }}
                    />
                  </div>
                );
              })()}
            </section>
          )}

          {/* ── SKILLS ───────────────────────────────────────── */}
          {activeSection === "skills" && hasSkills && (
            <section className="pf-animate">
              <div className="pf-section-title">
                <Wrench style={{ width: 22, height: 22, flexShrink: 0 }} className="pf-accent" />
                Skills &amp; Proficiency
              </div>
              <p className="pf-section-subtitle">
                {sortedSkills.length} skill{sortedSkills.length !== 1 ? "s" : ""} across {skillCategories.length} categor{skillCategories.length !== 1 ? "ies" : "y"}
              </p>
              <div className="pf-divider" />

              {/* Category tabs */}
              {skillCategories.length > 1 && (
                <div className="pf-cat-tabs">
                  <button
                    className={`pf-cat-tab ${selectedCategory === null ? "active" : ""}`}
                    onClick={() => setSelectedCategory(null)}
                  >
                    All ({sortedSkills.length})
                  </button>
                  {skillCategories.map(cat => {
                    const count = sortedSkills.filter(s => s.category === cat).length;
                    return (
                      <button
                        key={cat}
                        className={`pf-cat-tab ${selectedCategory === cat ? "active" : ""}`}
                        onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                      >
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Proficiency bars */}
              {(() => {
                const filtered = selectedCategory
                  ? skillsWithProficiency.filter(s => s.category === selectedCategory)
                  : skillsWithProficiency;
                return filtered.map(s => {
                  const dPct = Math.min(99, Math.round(s.pct + (100 - s.pct) * 0.3));
                  return (
                    <div key={s._id} className="pf-prof-row">
                      <span className="pf-prof-label" title={s.name}>{s.name}</span>
                      <div className="pf-prof-bar-bg">
                        <div className="pf-prof-bar-fill" style={{ '--bar-w': `${dPct}%` } as React.CSSProperties} />
                      </div>
                      <span className="pf-prof-pct">{dPct}%</span>
                      {s.yrsLabel && <span className="pf-prof-years">{s.yrsLabel}</span>}
                    </div>
                  );
                });
              })()}
            </section>
          )}

          {/* ── VOLUNTEERING ─────────────────────────────────── */}
          {activeSection === "volunteering" && hasVolunteering && (
            <section className="pf-animate">
              <div className="pf-section-title">
                <Heart style={{ width: 22, height: 22, flexShrink: 0 }} className="pf-accent" />
                Volunteering
              </div>
              <p className="pf-section-subtitle">Community contributions &amp; volunteering work</p>
              <div className="pf-divider" />
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {sortedVolunteering.map(v => (
                  <div key={v._id} className="pf-card" style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                    {v.imageUrl ? (
                      <div style={{ width: 56, height: 56, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={v.imageUrl} alt={v.organization} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ) : (
                      <div style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${hexToRgba(theme.accentColor, 0.1)}` }}>
                        <Heart style={{ width: 24, height: 24, opacity: 0.4 }} />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "4px" }}>
                        <h3>{v.role}</h3>
                        <span className="pf-card-meta">
                          {v.startDate} — {v.endDate ?? "Present"}
                        </span>
                      </div>
                      <p className="pf-card-sub">{v.organization}</p>
                      {v.cause && (
                        <span className="pf-tag" style={{ marginTop: 6, display: "inline-block" }}>{v.cause}</span>
                      )}
                      {v.description && <p className="pf-card-desc">{v.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── CONTACT ──────────────────────────────────────── */}
          {activeSection === "contact" && showContact && (
            <section className="pf-animate">
              <div className="pf-section-title">
                <Mail style={{ width: 22, height: 22, flexShrink: 0 }} className="pf-accent" />
                Get in Touch
              </div>
              <p className="pf-section-subtitle">Interested in working together? Send a message!</p>
              <div className="pf-divider" />
              <ContactForm profileId={profile._id} theme={theme} />
            </section>
          )}

        </div>

        {/* Content footer */}
        <div className="pf-footer">
          Powered by <a href="https://mivitae.org" target="_blank" rel="noopener noreferrer">mivitae</a>
        </div>
      </div>
    </div>
  );
}

// ── Contact Form ────────────────────────────────────────────────────────────

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
