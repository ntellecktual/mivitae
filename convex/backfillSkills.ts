"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Backfill skills for existing users who already have parsed portfolios
 * but no skills extracted yet.
 *
 * Run via Convex dashboard: npx convex run backfillSkills:backfillAllUsers
 */
export const backfillAllUsers = internalAction({
  args: {},
  handler: async (ctx) => {
    // Get all portfolios
    const portfolios = await ctx.runQuery(internal.backfillSkillsHelpers.getAllPortfolios);
    let processed = 0;
    let skipped = 0;

    for (const portfolio of portfolios) {
      // Check if user already has skills
      const existingSkills = await ctx.runQuery(
        internal.backfillSkillsHelpers.getSkillCount,
        { portfolioId: portfolio._id }
      );

      if (existingSkills > 0) {
        skipped++;
        continue;
      }

      // Get work history sections for this portfolio
      const sections = await ctx.runQuery(
        internal.backfillSkillsHelpers.getPortfolioSections,
        { portfolioId: portfolio._id }
      );

      if (sections.length === 0) {
        skipped++;
        continue;
      }

      // Build a summary of the work history for Claude to extract skills from
      const workSummary = sections.map((s: { companyName: string; role: string; startDate: string; endDate?: string; description: string; skills: string[]; }) =>
        `${s.role} at ${s.companyName} (${s.startDate} - ${s.endDate || "Present"}): ${s.description}\nSkills: ${s.skills.join(", ")}`
      ).join("\n\n");

      try {
        const skills = await extractSkillsFromWorkHistory(workSummary);

        // Insert skills
        let order = 0;
        const seen = new Set<string>();
        for (const skill of skills) {
          const key = skill.name.toLowerCase().trim();
          if (seen.has(key)) continue;
          seen.add(key);
          await ctx.runMutation(internal.skills.createInternal, {
            userId: portfolio.userId,
            portfolioId: portfolio._id,
            name: skill.name,
            category: skill.category || "Technical",
            proficiency: skill.proficiency ?? undefined,
            yearsOfExperience: skill.yearsOfExperience ?? undefined,
            order: order++,
          });
        }

        processed++;
        console.log(`Backfilled ${order} skills for portfolio ${portfolio._id}`);
      } catch (err) {
        console.error(`Failed to backfill portfolio ${portfolio._id}:`, err);
      }
    }

    console.log(`Backfill complete: ${processed} processed, ${skipped} skipped`);
  },
});

// ── Skills extraction via Claude ─────────────────────────────────────────

interface ExtractedSkill {
  name: string;
  category: string;
  proficiency?: number | null;
  yearsOfExperience?: number | null;
}

async function extractSkillsFromWorkHistory(workSummary: string): Promise<ExtractedSkill[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

  const message = await client.messages.create({
    model,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Analyze the following work history and extract a comprehensive list of professional skills. Return ONLY a JSON array — no markdown, no code fences, no extra text.

Each skill object:
{
  "name": "string (e.g. Python, Project Management)",
  "category": "one of: Technical, Leadership, Communication, Design, Analytics, Sales & Marketing, Operations, Finance, Engineering, Research",
  "proficiency": number 1-5 (1=Beginner, 5=Expert — infer from context and seniority),
  "yearsOfExperience": number or null (estimate from date ranges)
}

Rules:
- Extract ALL distinct skills mentioned or implied.
- Each skill name appears only once.
- Return at most 50 skills, prioritizing the most significant.
- Estimate proficiency based on role seniority, how central the skill is, and duration.

--- WORK HISTORY ---
${workSummary.slice(0, 30000)}`,
      },
    ],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";
  let jsonText = rawText.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();

  // Handle truncated JSON — try to recover partial array
  try {
    return JSON.parse(jsonText) as ExtractedSkill[];
  } catch {
    // Attempt to close truncated array: find last complete object
    const lastBrace = jsonText.lastIndexOf("}");
    if (lastBrace > 0) {
      jsonText = jsonText.slice(0, lastBrace + 1) + "]";
      if (!jsonText.trimStart().startsWith("[")) {
        jsonText = "[" + jsonText;
      }
      try {
        return JSON.parse(jsonText) as ExtractedSkill[];
      } catch {
        // fall through
      }
    }
    throw new Error("Could not parse skills JSON from Claude response");
  }
}
