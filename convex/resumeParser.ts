"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";
import mammoth from "mammoth";

// ── Types ──────────────────────────────────────────────────────────────────

interface WorkEntry {
  companyName: string;
  role: string;
  startDate: string;
  endDate?: string | null;
  description: string;
  skills: string[];
  achievements: string[];
}

interface EducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy?: string | null;
  startYear: number;
  endYear?: number | null;
  gpa?: string | null;
  honors?: string | null;
  activities: string[];
}

interface ParsedResume {
  workHistory: WorkEntry[];
  education: EducationEntry[];
  skills: SkillEntry[];
}

interface SkillEntry {
  name: string;
  category: string;           // e.g. "Technical", "Leadership", "Communication", "Design", "Analytics"
  proficiency?: number | null; // 1-5 scale
  yearsOfExperience?: number | null;
}

// ── Action ─────────────────────────────────────────────────────────────────

export const parseResume = internalAction({
  args: {
    resumeId: v.id("resumes"),
    storageId: v.string(),
    userId: v.id("users"),
    fileType: v.optional(v.string()),
    rawText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.resumes.setParseStatus, {
      resumeId: args.resumeId,
      parseStatus: "processing",
    });

    const MAX_RETRIES = 2;
    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        // 1. Get file content — either from rawText arg or from storage
        let arrayBuffer: ArrayBuffer;
        if (args.rawText) {
          arrayBuffer = new TextEncoder().encode(args.rawText).buffer as ArrayBuffer;
        } else {
          const url = await ctx.storage.getUrl(args.storageId);
          if (!url) throw new Error("Storage URL not found");

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 30_000);
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeout);

          arrayBuffer = await response.arrayBuffer();
        }

        // Validate file size (<10MB)
        if (arrayBuffer.byteLength > 10 * 1024 * 1024) {
          throw new Error("File too large (max 10MB)");
        }

        const isDocx = args.fileType === "docx" ||
          args.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          args.fileType === "application/msword" ||
          args.fileType === "doc";
        const isText = args.fileType === "text";

        // 2. Build Claude message content based on file type
        const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
        const client = new Anthropic({ apiKey });

        const sourceLabel = isText ? "pasted text" : isDocx ? "document text" : "attached PDF";
        const promptText = `You are an expert resume parser. Extract structured career data and return ONLY a single valid JSON object — no markdown, no code fences, no commentary, no extra text.

CRITICAL RULES:
- Each job position must appear EXACTLY ONCE. Do NOT duplicate entries even if the same company appears multiple times with different roles — create one entry per unique role+company combination.
- Each educational institution must appear EXACTLY ONCE.
- If a field is unknown, use null — never omit required fields.
- startDate and endDate must be human-readable strings like "Jan 2020" or "March 2018". Use null for endDate if it is the current position.
- startYear and endYear for education must be 4-digit integers (e.g. 2015). Use null if unknown.
- PROFESSIONALISM: Extract and present all content using professional, work-appropriate language only. If the source document contains any profanity or inappropriate language, replace it with neutral professional equivalents in your output.

Return this exact JSON structure:
{
  "workHistory": [
    {
      "companyName": "string",
      "role": "string",
      "startDate": "string (e.g. Jan 2020)",
      "endDate": "string or null (null if current)",
      "description": "2-3 sentence summary of responsibilities",
      "skills": ["array of technical and soft skills used in this role"],
      "achievements": ["quantified accomplishments, max 5 bullets"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string (e.g. Bachelor of Science)",
      "fieldOfStudy": "string or null",
      "startYear": number or null,
      "endYear": number or null,
      "gpa": "string or null",
      "honors": "string or null",
      "activities": ["clubs, sports, organizations"]
    }
  ],
  "skills": [
    {
      "name": "string (e.g. Python, Project Management)",
      "category": "string — one of: Technical, Leadership, Communication, Design, Analytics, Sales & Marketing, Operations, Finance, Engineering, Research",
      "proficiency": number or null (1-5 scale: 1=Beginner, 2=Elementary, 3=Intermediate, 4=Advanced, 5=Expert — infer from context),
      "yearsOfExperience": number or null (estimate from work history date ranges if possible)
    }
  ]
}

SKILLS EXTRACTION RULES:
- Extract ALL distinct skills mentioned across work history, education, and any skills section of the resume.
- Deduplicate — each skill name should appear only once, picking the highest proficiency if mentioned in multiple roles.
- Estimate yearsOfExperience by summing the duration of roles where the skill is mentioned.
- Assign a category from: Technical, Leadership, Communication, Design, Analytics, Sales & Marketing, Operations, Finance, Engineering, Research.
- Return at most 50 skills, prioritizing the most significant ones.`;

        let messageContent: Anthropic.MessageParam["content"];

        if (isText) {
          // Plain text (pasted from LinkedIn, etc.)
          const plainText = new TextDecoder().decode(arrayBuffer);
          messageContent = [
            {
              type: "text",
              text: `${promptText}\n\n--- RESUME TEXT ---\n${plainText.slice(0, 50000)}`,
            },
          ];
        } else if (isDocx) {
          // Extract text from .docx using mammoth
          const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
          const docxText = result.value;
          if (!docxText || docxText.trim().length < 20) {
            throw new Error("Could not extract text from Word document");
          }
          messageContent = [
            {
              type: "text",
              text: `${promptText}\n\n--- RESUME TEXT ---\n${docxText.slice(0, 50000)}`,
            },
          ];
        } else {
          // Send PDF directly to Claude as a document
          const pdfBase64 = Buffer.from(arrayBuffer).toString("base64");
          messageContent = [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: pdfBase64,
              },
            },
            {
              type: "text",
              text: promptText,
            },
          ];
        }

      const message = await client.messages.create({
        model,
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: messageContent,
          },
        ],
      });

      // 3. Parse JSON from Claude's response
      const rawText = message.content[0].type === "text" ? message.content[0].text : "";
      const jsonText = rawText.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
      const parsed: ParsedResume = JSON.parse(jsonText);

      // Deduplicate work entries (guard against AI repeating the same role)
      const seenWork = new Set<string>();
      const uniqueWork = parsed.workHistory.filter((e) => {
        const key = `${e.companyName}|${e.role}`.toLowerCase();
        if (seenWork.has(key)) return false;
        seenWork.add(key);
        return true;
      });

      // Deduplicate education entries
      const seenEdu = new Set<string>();
      const uniqueEducation = parsed.education.filter((e) => {
        const key = `${e.institution}|${e.degree}`.toLowerCase();
        if (seenEdu.has(key)) return false;
        seenEdu.add(key);
        return true;
      });

      // 4. Ensure portfolio exists
      const portfolioId: string = await ctx.runMutation(
        internal.portfolios.ensureDefaultInternal,
        { userId: args.userId }
      );

      // 5. Clear any existing parsed entries first (idempotent re-parse)
      await ctx.runMutation(internal.portfolioSections.deleteAllForPortfolioInternal, {
        portfolioId: portfolioId as never,
      });
      await ctx.runMutation(internal.educationEntries.deleteAllForPortfolioInternal, {
        portfolioId: portfolioId as never,
        userId: args.userId,
      });
      await ctx.runMutation(internal.skills.deleteAllForPortfolioInternal, {
        portfolioId: portfolioId as never,
      });

      // 6. Insert work history
      for (let i = 0; i < uniqueWork.length; i++) {
        const entry = uniqueWork[i];
        await ctx.runMutation(internal.portfolioSections.createInternal, {
          portfolioId: portfolioId as never,
          userId: args.userId,
          companyName: entry.companyName,
          role: entry.role,
          startDate: entry.startDate,
          endDate: entry.endDate ?? undefined,
          description: entry.description,
          skills: entry.skills ?? [],
          achievements: entry.achievements ?? [],
          order: i,
        });
      }

      // 7. Insert education
      for (let i = 0; i < uniqueEducation.length; i++) {
        const entry = uniqueEducation[i];
        await ctx.runMutation(internal.educationEntries.createInternal, {
          userId: args.userId,
          portfolioId: portfolioId as never,
          institution: entry.institution,
          degree: entry.degree,
          fieldOfStudy: entry.fieldOfStudy ?? undefined,
          startYear: entry.startYear ?? 0,
          endYear: entry.endYear ?? undefined,
          gpa: entry.gpa ?? undefined,
          honors: entry.honors ?? undefined,
          activities: entry.activities ?? [],
          order: i,
        });
      }

      // 8. Insert skills
      const uniqueSkills = parsed.skills ?? [];
      const seenSkills = new Set<string>();
      let skillOrder = 0;
      for (const skill of uniqueSkills) {
        const key = skill.name.toLowerCase().trim();
        if (seenSkills.has(key)) continue;
        seenSkills.add(key);
        await ctx.runMutation(internal.skills.createInternal, {
          userId: args.userId,
          portfolioId: portfolioId as never,
          name: skill.name,
          category: skill.category || "Technical",
          proficiency: skill.proficiency ?? undefined,
          yearsOfExperience: skill.yearsOfExperience ?? undefined,
          order: skillOrder++,
        });
      }

      // 9. Mark done
      await ctx.runMutation(internal.resumes.setParseStatus, {
        resumeId: args.resumeId,
        parseStatus: "done",
      });

      return; // Success — exit retry loop
      } catch (err) {
        lastError = err;
        if (attempt < MAX_RETRIES) {
          // Brief backoff before retry (500ms * attempt)
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
          continue;
        }
      }
    }

    // All retries exhausted
    console.error("Resume parse error after retries:", lastError);
    await ctx.runMutation(internal.resumes.setParseStatus, {
      resumeId: args.resumeId,
      parseStatus: "error",
    });
  },
});
