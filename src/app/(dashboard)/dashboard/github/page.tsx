"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  GitBranch,
  Star,
  ArrowRight,
  Check,
  Loader2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type GitHubRepo = {
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  topics: string[];
  updatedAt: string;
};

export default function GitHubImportPage() {
  const profile = useQuery(api.profiles.getSelf);
  const demos = useQuery(api.demos.getSelfDemos);
  const fetchRepos = useAction(api.github.fetchPublicRepos);
  const createDemo = useMutation(api.demos.createSelf);

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<Set<string>>(new Set());
  const [imported, setImported] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [manualUsername, setManualUsername] = useState("");

  // Parse GitHub username from profile URL
  const parseGitHubUsername = (url: string): string | null => {
    try {
      const parsed = new URL(url);
      if (
        parsed.hostname === "github.com" ||
        parsed.hostname === "www.github.com"
      ) {
        const parts = parsed.pathname.split("/").filter(Boolean);
        return parts[0] || null;
      }
    } catch {
      // Not a valid URL, treat as username
      if (/^[a-zA-Z0-9_-]+$/.test(url.trim())) {
        return url.trim();
      }
    }
    return null;
  };

  const githubUsername = profile?.githubUrl
    ? parseGitHubUsername(profile.githubUrl)
    : null;

  // Check which repos are already imported
  const existingGithubUrls = new Set(
    (demos ?? [])
      .map((d) => d.githubUrl)
      .filter((u): u is string => !!u)
  );

  const handleFetchRepos = async (username?: string) => {
    const uname = username || githubUsername;
    if (!uname) return;

    setLoading(true);
    setError(null);
    try {
      const result = await fetchRepos({ username: uname });
      setRepos(result);
      if (result.length === 0) {
        setError("No public repositories found for this user.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch repositories"
      );
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImportRepo = async (repo: GitHubRepo) => {
    setImporting((prev) => new Set(prev).add(repo.fullName));
    try {
      const content = [
        `# ${repo.name}`,
        "",
        repo.description || "A GitHub repository.",
        "",
        `**Language:** ${repo.language || "Not specified"}`,
        repo.stars > 0 ? `**Stars:** ${repo.stars}` : "",
        repo.topics.length > 0
          ? `**Topics:** ${repo.topics.join(", ")}`
          : "",
        "",
        `[View on GitHub](${repo.url})`,
      ]
        .filter(Boolean)
        .join("\n");

      await createDemo({
        title: repo.name,
        description: repo.description || `GitHub project: ${repo.name}`,
        content,
        tags: [
          repo.language || "Code",
          ...repo.topics.slice(0, 4),
        ].filter(Boolean),
        githubUrl: repo.url,
        demoUrl: repo.url,
        status: "live",
      });

      setImported((prev) => new Set(prev).add(repo.fullName));
      toast.success(`Imported "${repo.name}" as a demo`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to import repository"
      );
    } finally {
      setImporting((prev) => {
        const next = new Set(prev);
        next.delete(repo.fullName);
        return next;
      });
    }
  };

  const isAlreadyImported = (repo: GitHubRepo) =>
    existingGithubUrls.has(repo.url) || imported.has(repo.fullName);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">GitHub Import</h1>
        <p className="text-muted-foreground">
          Import your GitHub repositories as portfolio demos
        </p>
      </div>

      {/* Source selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Connect GitHub
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {githubUsername ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">
                GitHub username from your profile:{" "}
                <span className="font-medium text-foreground">
                  {githubUsername}
                </span>
              </p>
              <Button onClick={() => handleFetchRepos()} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Fetch Repos
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                No GitHub URL in your{" "}
                <Link
                  href="/dashboard/profile"
                  className="text-primary underline"
                >
                  profile
                </Link>
                . Enter a username manually:
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="GitHub username"
                  value={manualUsername}
                  onChange={(e) => setManualUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && manualUsername.trim()) {
                      handleFetchRepos(manualUsername.trim());
                    }
                  }}
                />
                <Button
                  onClick={() => handleFetchRepos(manualUsername.trim())}
                  disabled={loading || !manualUsername.trim()}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  Fetch
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Repository list */}
      {repos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Repositories ({repos.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Non-fork repos, sorted by recent activity
            </p>
          </div>

          {repos.map((repo) => {
            const alreadyImported = isAlreadyImported(repo);
            const isImporting = importing.has(repo.fullName);

            return (
              <Card key={repo.fullName} className="transition-colors">
                <CardContent className="flex items-start justify-between gap-4 pt-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        {repo.name}
                      </a>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      {repo.stars > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3" />
                          {repo.stars}
                        </span>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {repo.language && (
                        <Badge variant="secondary" className="text-xs">
                          {repo.language}
                        </Badge>
                      )}
                      {repo.topics.slice(0, 5).map((t) => (
                        <Badge
                          key={t}
                          variant="outline"
                          className="text-xs"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={alreadyImported ? "ghost" : "default"}
                    disabled={alreadyImported || isImporting}
                    onClick={() => handleImportRepo(repo)}
                  >
                    {isImporting ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : alreadyImported ? (
                      <Check className="mr-1 h-3 w-3" />
                    ) : null}
                    {alreadyImported
                      ? "Imported"
                      : isImporting
                        ? "Importing…"
                        : "Import"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
