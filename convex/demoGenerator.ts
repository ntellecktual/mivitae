"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";

// ── Cache key: normalize role + top-3 skills (sorted) + audience ──────────
function buildCacheKey(role: string, skills: string[], audience: string): string {
  const normalizedRole = role.trim().toLowerCase().replace(/\s+/g, " ");
  const topSkills = [...skills]
    .map((s) => s.trim().toLowerCase())
    .sort()
    .slice(0, 3)
    .join(",");
  const normalizedAudience = audience.trim().toLowerCase();
  return `${normalizedRole}||${topSkills}||${normalizedAudience}`;
}

// ── Public action: generate a demo from questionnaire answers ──────────────

export const generateDemo = action({
  args: {
    role: v.string(),
    company: v.string(),
    skills: v.array(v.string()),
    accomplishment: v.string(),
    impact: v.string(),
    audience: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{
    html: string;
    title: string;
    description: string;
    tags: string[];
    fromCache: boolean;
  }> => {
    // ── Check cache first ───────────────────────────────────────────────
    const cacheKey = buildCacheKey(args.role, args.skills, args.audience);
    const cached = await ctx.runQuery(internal.demoCacheHelpers.getCacheEntry, { cacheKey });
    if (cached) {
      await ctx.runMutation(internal.demoCacheHelpers.incrementCacheHit, { id: cached._id });
      return {
        html: cached.html,
        title: cached.title,
        description: cached.description,
        tags: cached.tags,
        fromCache: true,
      };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
    const client = new Anthropic({ apiKey });

    // ── Step 1: Haiku plans the demo structure (fast, cheap) ───────────
    const planModel = "claude-3-5-haiku-20241022";

    const planText = await client.messages
      .stream({
        model: planModel,
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: `You are a portfolio demo planner. Given a professional's work context, plan an interactive HTML demo that visually showcases their expertise.

CONTEXT:
- Role: ${args.role}
- Company: ${args.company}
- Key Skills: ${args.skills.join(", ")}
- Main Accomplishment: ${args.accomplishment}
- Measurable Impact: ${args.impact}
- Target Audience: ${args.audience}
${args.category ? `- Category: ${args.category}` : ""}

Plan a single-page interactive demo. Return ONLY valid JSON — no markdown, no code fences:
{
  "title": "short compelling demo title (3-6 words)",
  "description": "one sentence describing what this demo shows",
  "demoType": "dashboard | workflow | visualization | interactive | comparison | timeline",
  "sections": [
    {
      "name": "section name",
      "type": "hero-kpi | chart | process-flow | metrics-grid | log-output | card-grid | comparison-table | timeline",
      "content": "brief description of what this section shows with specific numbers/data from the context"
    }
  ],
  "colorTheme": "blue-violet | emerald-teal | amber-orange | rose-red | slate-neutral",
  "keyMetrics": ["metric 1 with number", "metric 2 with number", "metric 3", "metric 4"],
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "interactiveElements": ["what the user can click/hover/interact with"]
}

RULES:
- Use REAL numbers from the accomplishment and impact fields — do not invent data
- Plan 4-6 sections maximum
- Make it look like a professional portfolio piece, not a tutorial
- The demo should tell a story about this person's work, written in 3rd person
- PROFESSIONALISM: Use exclusively professional, work-appropriate language. If any provided input contains profanity, slurs, or inappropriate terms, substitute neutral professional equivalents and proceed normally.`,
          },
        ],
      })
      .finalText();

    let plan: {
      title: string;
      description: string;
      demoType: string;
      sections: Array<{ name: string; type: string; content: string }>;
      colorTheme: string;
      keyMetrics: string[];
      tags: string[];
      interactiveElements: string[];
    };

    try {
      plan = JSON.parse(planText);
    } catch {
      // If Sonnet wraps in code fences, strip them
      const cleaned = planText
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      plan = JSON.parse(cleaned);
    }

    // ── Step 2: Sonnet builds the full HTML/CSS/JS ─────────────────────
    const buildModel = "claude-sonnet-4-20250514";

    const buildText = await client.messages
      .stream({
        model: buildModel,
        max_tokens: 8000,
        messages: [
          {
            role: "user",
          content: `You are an elite frontend engineer building a portfolio demo. Generate a SINGLE self-contained HTML page (inline CSS + JS) that looks like a premium, polished interactive demo.

PLAN:
${JSON.stringify(plan, null, 2)}

CONTEXT:
- Role: ${args.role} at ${args.company}
- Skills: ${args.skills.join(", ")}
- Accomplishment: ${args.accomplishment}
- Impact: ${args.impact}

DESIGN REQUIREMENTS:
1. The page will be embedded in an iframe. It must be a complete <body> fragment (no <html>, <head>, or <body> tags — just the inner content with <style> and <script> at the top/bottom).
2. Use CSS custom properties that inherit from the parent theme:
   - var(--demo-bg) for background
   - var(--demo-text) for text color
   - var(--demo-subtext) for muted text
   - var(--demo-accent) for primary accent
   - var(--demo-card-bg) for card backgrounds
   - var(--demo-card-border) for card borders
   - var(--demo-heading-font) for headings
   - var(--demo-body-font) for body text
   - var(--demo-surface) for subtle surface color
   - var(--demo-border) for general borders
   - var(--demo-shadow) for box shadows
   - var(--demo-shadow-lg) for elevated shadows
   - var(--demo-radius) for border radius
   These will be provided by the parent. Use them as defaults with fallbacks, e.g. var(--demo-accent, #8b5cf6).
3. DESIGN STYLE — emulate this premium aesthetic:
   - Glassmorphism cards: backdrop-filter:blur(12px), semi-transparent backgrounds
   - Gradient accents on headings and KPI values (-webkit-background-clip:text)
   - Subtle animations: fadeUp on load, float on KPI cards, pulse on active elements
   - Professional typography: font-weight 700-800 for headings, tight letter-spacing
   - Rounded corners (14-20px on cards), layered shadows
   - Color-coded tags/badges with pill styling
   - Grid layouts for metrics, cards, process flows
   - Monospace log/code sections with dark backgrounds when showing technical output
4. INTERACTIVITY:
   - Elements should respond to hover (translateY, shadow changes)
   - Include at least one interactive element (tabs, clickable cards, animated progress)
   - Animations should be smooth with CSS transitions + keyframes
   - Charts can use simple CSS (no Chart.js needed) — bar charts, progress rings via SVG
5. CONTENT:
   - Use the REAL data from the accomplishment and impact
   - Write in third person (e.g. "Led the migration..." not "I led...")
   - Include specific numbers, percentages, and metrics
   - Structure should tell a story from problem → solution → impact
6. Must render perfectly at 100% width in an iframe

Return ONLY the raw HTML fragment — no markdown code fences, no explanation, no \`\`\`html wrapper. Start directly with <style> and end with </script> or the last HTML element.

IMPORTANT: The output MUST be under 500KB. Keep CSS concise. Avoid data URIs for images — use emoji or Font Awesome icons (already loaded via CDN in the parent).
PROFESSIONALISM: Write exclusively professional, work-appropriate content. If any input contains profanity or inappropriate language, ignore it and use neutral professional equivalents throughout.`,
          },
        ],
      })
      .finalText();

    const html = buildText
      .replace(/^```html\s*/i, "")
      .replace(/```\s*$/g, "")
      .trim();

    // ── Store to cache (fire and forget — don't block the response) ────
    const result = {
      html,
      title: plan.title,
      description: plan.description,
      tags: plan.tags ?? [],
    };
    await ctx.runMutation(internal.demoCacheHelpers.storeCacheEntry, {
      cacheKey,
      ...result,
    });

    return { ...result, fromCache: false };
  },
});
