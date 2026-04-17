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
          args.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        const isText = args.fileType === "text";

        // 2. Build Claude message content based on file type
        const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
        const client = new Anthropic({ apiKey });

        const sourceLabel = isText ? "pasted text" : isDocx ? "document text" : "attached PDF";
        const promptText = `You are a resume parser. Extract structured data from the ${sourceLabel} and return ONLY valid JSON — no markdown, no code fences, no commentary.

{
  "workHistory": [
    {
      "companyName": "string",
      "role": "string",
      "startDate": "string (e.g. Jan 2020)",
      "endDate": "string or null (null if current)",
      "description": "string (2-3 sentence summary)",
      "skills": ["technical and soft skills"],
      "achievements": ["quantified accomplishments"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string (e.g. Bachelor of Science)",
      "fieldOfStudy": "string or null",
      "startYear": number,
      "endYear": number or null,
      "gpa": "string or null",
      "honors": "string or null",
      "activities": ["clubs, sports, activities"]
    }
  ]
}`;

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

      // 4. Ensure portfolio exists
      const portfolioId: string = await ctx.runMutation(
        internal.portfolios.ensureDefaultInternal,
        { userId: args.userId }
      );

      // 5. Insert work history
      for (let i = 0; i < parsed.workHistory.length; i++) {
        const entry = parsed.workHistory[i];
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

      // 6. Insert education
      for (let i = 0; i < parsed.education.length; i++) {
        const entry = parsed.education[i];
        await ctx.runMutation(internal.educationEntries.createInternal, {
          userId: args.userId,
          portfolioId: portfolioId as never,
          institution: entry.institution,
          degree: entry.degree,
          fieldOfStudy: entry.fieldOfStudy ?? undefined,
          startYear: entry.startYear,
          endYear: entry.endYear ?? undefined,
          gpa: entry.gpa ?? undefined,
          honors: entry.honors ?? undefined,
          activities: entry.activities ?? [],
          order: i,
        });
      }

      // 7. Mark done
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
