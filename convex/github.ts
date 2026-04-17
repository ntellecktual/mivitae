"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  topics?: string[];
  updated_at: string;
  fork: boolean;
}

/**
 * Fetch public repos for a GitHub username.
 * Uses the unauthenticated GitHub API (60 req/hr per IP).
 */
export const fetchPublicRepos = action({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const username = args.username.trim().replace(/[^a-zA-Z0-9_-]/g, "");
    if (!username || username.length > 39) {
      throw new Error("Invalid GitHub username");
    }

    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&type=owner`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "mivitae-app",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) throw new Error("GitHub user not found");
      if (response.status === 403) throw new Error("GitHub rate limit exceeded. Try again later.");
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos = (await response.json()) as GitHubRepo[];

    // Filter out forks, return relevant fields
    return repos
      .filter((r) => !r.fork)
      .map((r) => ({
        name: r.name,
        fullName: r.full_name,
        description: r.description,
        url: r.html_url,
        language: r.language,
        stars: r.stargazers_count,
        topics: r.topics ?? [],
        updatedAt: r.updated_at,
      }));
  },
});
