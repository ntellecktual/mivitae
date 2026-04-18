"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";

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

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `You are a senior technical evaluator assessing an interactive portfolio demo for professional skill verification.

DEMO TITLE: ${demo.title}
DEMO DESCRIPTION: ${demo.description}
DEMO TAGS: ${(demo.tags ?? []).join(", ")}
DEMO HTML/CONTENT (first 6000 chars):
${(demo.htmlContent ?? demo.content).slice(0, 6000)}

${portfolio ? `PORTFOLIO CONTEXT: This person works as ${portfolio.role} with skills in ${portfolio.skills}.` : ""}

Score this demo on 5 dimensions (0-100 each):
1. Technical Depth — Does the demo demonstrate real technical knowledge, not just surface-level work?
2. Real-World Relevance — Would this skill/demo matter in an actual job?
3. Communication Clarity — Is the demo well-organized, clear, and easy to understand for non-experts?
4. Problem Solving — Does the demo demonstrate solving a real problem with a clear approach?
5. Innovation — Does the demo show creative or novel thinking beyond boilerplate?

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
