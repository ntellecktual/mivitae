"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";

// ── Pre-process HTML so the evaluation window captures actual content ────
function prepareContentForGrading(raw: string): string {
  let html = raw;

  // 1. Strip <style> blocks — CSS doesn't demonstrate skill
  html = html.replace(/<style[\s\S]*?<\/style>/gi, "");

  // 2. Strip <script> blocks but extract meaningful comments/logic
  //    Keep a brief note about JS presence so the evaluator knows it's interactive
  const scriptBlocks = html.match(/<script[\s\S]*?<\/script>/gi) ?? [];
  const hasInteractiveJS = scriptBlocks.some(
    (s) =>
      s.includes("fetch(") ||
      s.includes("addEventListener") ||
      s.includes("async ") ||
      s.includes("Promise"),
  );
  html = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  if (hasInteractiveJS) {
    html +=
      "\n[INTERACTIVE: This demo includes JavaScript that fetches live API data, runs simulations, and renders dynamic results in the browser.]";
  }

  // 3. Treat <details> content as visible (expand collapsed sections)
  html = html.replace(/<\/?details[^>]*>/gi, "");
  html = html.replace(/<\/?summary[^>]*>/gi, "");

  // 4. Strip Django/Jinja template tags
  html = html.replace(/\{%[\s\S]*?%\}/g, "");
  html = html.replace(/\{\{[\s\S]*?\}\}/g, "");

  // 5. Strip excessive inline style attributes (keep the tag structure)
  html = html.replace(/ style="[^"]{80,}"/gi, "");

  // 6. Collapse whitespace
  html = html.replace(/\n{3,}/g, "\n\n");
  html = html.replace(/[ \t]{4,}/g, " ");

  return html.trim();
}

// ── Grade a demo and produce a verified skill score ──────────────────────

export const gradeDemo = action({
  args: {
    demoId: v.id("userDemos"),
  },
  handler: async (ctx, args): Promise<{
    overallScore: number;
    dimensions: {
      technicalDepth: number;
      realWorldRelevance: number;
      communicationClarity: number;
      problemSolving: number;
      innovation: number;
    };
    summary: string;
    strengths: string[];
    improvements: string[];
  }> => {
    // Fetch the demo
    const demo = await ctx.runQuery(internal.skillScoringHelpers.getDemo, {
      demoId: args.demoId,
    });
    if (!demo) throw new Error("Demo not found");

    // Fetch user's portfolio context for richer grading
    const portfolio = await ctx.runQuery(
      internal.skillScoringHelpers.getUserPortfolioContext,
      { userId: demo.userId },
    );

    const client = new Anthropic();

    // Pre-process: strip CSS/scripts/template tags so the content window
    // captures actual demo substance instead of styling boilerplate
    const rawContent = demo.htmlContent ?? demo.content;
    const cleanedContent = prepareContentForGrading(rawContent);

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `You are a senior professional evaluator assessing an interactive portfolio demo for skill verification. The demo could be from ANY profession — engineering, healthcare, education, sales, marketing, finance, operations, legal, construction, or any other field. Evaluate based on the actual profession demonstrated.

DEMO TITLE: ${demo.title}
DEMO DESCRIPTION: ${demo.description}
DEMO TAGS: ${(demo.tags ?? []).join(", ")}
DEMO CONTENT (cleaned HTML, up to 12000 chars):
${cleanedContent.slice(0, 12000)}

${portfolio ? `PORTFOLIO CONTEXT: This person works as ${portfolio.role} with skills in ${portfolio.skills}.` : ""}

EVALUATION GUIDELINES:
- CSS styling has been stripped. Focus entirely on the substantive content.
- Content from collapsible sections (<details>) has been expanded and is included above.
- If the content notes "[INTERACTIVE: ...]", the demo includes live JavaScript functionality — give credit for interactivity even though the JS code was stripped.
- Look for ACTUAL demo content: code examples, data tables, technical implementations, formulas, quantitative results, metrics, methodology descriptions, and domain-specific artifacts.
- Code blocks (<pre>, <code>) with real implementation code (not pseudocode) indicate strong technical depth.
- Quantitative results (accuracy metrics, benchmarks, performance numbers) with specific values indicate strong problem solving.
- Multiple sections covering different aspects of a topic indicate strong communication clarity.
- Novel techniques, unique approaches, or creative combinations of methods indicate strong innovation.
- Do NOT penalize demos for being HTML-based — evaluate the professional substance within the HTML.

Score this demo on 5 dimensions (0-100 each):
1. Professional Depth — Does the demo demonstrate real domain knowledge, not just surface-level work? Look for: real code implementations, specific technical details, domain-specific terminology used correctly, quantitative metrics.
2. Real-World Relevance — Would this skill/demo matter in an actual job in this profession? Look for: industry-standard tools/frameworks, production-ready patterns, real data sources.
3. Communication Clarity — Is the demo well-organized, clear, and easy to understand? Look for: logical section flow, clear headings, visual hierarchy, explanatory text alongside technical content.
4. Problem Solving — Does the demo demonstrate solving a real problem with a clear approach? Look for: defined problem statement, methodology, quantitative results/benchmarks, validation.
5. Innovation — Does the demo show creative or novel thinking beyond boilerplate? Look for: unique approaches, creative visualizations, combining multiple techniques, going beyond tutorials.

Respond in EXACTLY this JSON format (no markdown, no wrapping):
{
  "technicalDepth": <number>,
  "realWorldRelevance": <number>,
  "communicationClarity": <number>,
  "problemSolving": <number>,
  "innovation": <number>,
  "overallScore": <number 0-100, weighted average>,
  "summary": "<one paragraph assessment, max 200 words>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
}

PROFESSIONALISM: Use exclusively professional, work-appropriate language. If any provided input contains profanity or inappropriate language, ignore it and use neutral professional equivalents.`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse skill score response");

    const parsed = JSON.parse(jsonMatch[0]);

    const result = {
      overallScore: Math.round(
        Math.max(0, Math.min(100, parsed.overallScore ?? 0)),
      ),
      dimensions: {
        technicalDepth: Math.round(
          Math.max(0, Math.min(100, parsed.technicalDepth ?? 0)),
        ),
        realWorldRelevance: Math.round(
          Math.max(0, Math.min(100, parsed.realWorldRelevance ?? 0)),
        ),
        communicationClarity: Math.round(
          Math.max(0, Math.min(100, parsed.communicationClarity ?? 0)),
        ),
        problemSolving: Math.round(
          Math.max(0, Math.min(100, parsed.problemSolving ?? 0)),
        ),
        innovation: Math.round(
          Math.max(0, Math.min(100, parsed.innovation ?? 0)),
        ),
      },
      summary: String(parsed.summary ?? "").slice(0, 1000),
      strengths: (parsed.strengths ?? []).slice(0, 3).map(String),
      improvements: (parsed.improvements ?? []).slice(0, 3).map(String),
    };

    // Store the score
    await ctx.runMutation(internal.skillScoringHelpers.storeScore, {
      demoId: args.demoId,
      userId: demo.userId,
      ...result,
    });

    return result;
  },
});
