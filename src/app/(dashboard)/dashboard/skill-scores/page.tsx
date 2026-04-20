"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@/lib/convex";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Zap,
  Loader2,
  TrendingUp,
  Star,
  Target,
  Lightbulb,
  MessageSquare,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Id } from "../../../../../convex/_generated/dataModel";

// ── Score ring (SVG) ──────────────────────────────────────────────────

function ScoreRing({
  score,
  size = 80,
  stroke = 6,
}: {
  score: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  const color =
    score >= 80
      ? "text-emerald-500"
      : score >= 60
        ? "text-amber-500"
        : "text-red-400";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-700", color)}
        />
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center text-lg font-bold",
          color,
        )}
      >
        {score}
      </span>
    </div>
  );
}

// ── Dimension bar ─────────────────────────────────────────────────────

function DimensionBar({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  const color =
    score >= 80
      ? "bg-emerald-500/70"
      : score >= 60
        ? "bg-amber-500/70"
        : "bg-red-400/70";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{score}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// ── Score card per demo ───────────────────────────────────────────────

function DemoScoreCard({
  demo,
  score,
  onGrade,
  grading,
}: {
  demo: { _id: Id<"userDemos">; title: string; tags?: string[] };
  score: {
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
    gradedAt: number;
  } | null;
  onGrade: (demoId: Id<"userDemos">) => void;
  grading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="card-hover transition-all">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold">{demo.title}</h3>
            {demo.tags && demo.tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {demo.tags.slice(0, 4).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {score ? (
            <ScoreRing score={score.overallScore} />
          ) : (
            <Button
              size="sm"
              onClick={() => onGrade(demo._id)}
              disabled={grading}
              className="shrink-0"
            >
              {grading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Zap className="mr-1.5 h-3.5 w-3.5" />
              )}
              Grade
            </Button>
          )}
        </div>

        {/* Score details (collapsible) */}
        {score && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-4 flex w-full items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
              {expanded ? "Hide details" : "Show breakdown"}
            </button>

            {expanded && (
              <div className="mt-4 space-y-5">
                {/* Dimension bars */}
                <div className="space-y-3">
                  <DimensionBar
                    label="Professional Depth"
                    score={score.dimensions.technicalDepth}
                  />
                  <DimensionBar
                    label="Real-World Relevance"
                    score={score.dimensions.realWorldRelevance}
                  />
                  <DimensionBar
                    label="Communication"
                    score={score.dimensions.communicationClarity}
                  />
                  <DimensionBar
                    label="Problem Solving"
                    score={score.dimensions.problemSolving}
                  />
                  <DimensionBar
                    label="Innovation"
                    score={score.dimensions.innovation}
                  />
                </div>

                {/* Summary */}
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    Assessment
                  </div>
                  <p className="text-sm leading-relaxed">{score.summary}</p>
                </div>

                {/* Strengths + Improvements */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      <Star className="h-3 w-3" />
                      Strengths
                    </div>
                    <ul className="space-y-1">
                      {score.strengths.map((s, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-600">
                      <Lightbulb className="h-3 w-3" />
                      Improvements
                    </div>
                    <ul className="space-y-1">
                      {score.improvements.map((s, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Re-grade + timestamp */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-[10px] text-muted-foreground">
                    Graded{" "}
                    {new Date(score.gradedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onGrade(demo._id)}
                    disabled={grading}
                    className="text-xs"
                  >
                    {grading ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Zap className="mr-1 h-3 w-3" />
                    )}
                    Re-grade
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────

export default function SkillScoresPage() {
  const demos = useQuery(api.demos.getSelfDemos);
  const scores = useQuery(api.skillScoringHelpers.getSelfScores);
  const gradeDemo = useAction(api.skillScoring.gradeDemo);
  const [gradingId, setGradingId] = useState<Id<"userDemos"> | null>(null);

  const handleGrade = useCallback(
    async (demoId: Id<"userDemos">) => {
      setGradingId(demoId);
      try {
        await gradeDemo({ demoId });
        toast.success("Skill score generated!");
      } catch {
        toast.error("Failed to grade demo. Please try again.");
      } finally {
        setGradingId(null);
      }
    },
    [gradeDemo],
  );

  const loading = demos === undefined || scores === undefined;

  // Map scores by demoId for quick lookup
  const scoreMap = new Map(
    (scores ?? []).map((s) => [s.demoId, s]),
  );

  // Separate graded vs ungraded
  const graded = (demos ?? []).filter((d) => scoreMap.has(d._id));
  const ungraded = (demos ?? []).filter((d) => !scoreMap.has(d._id));

  // Average score
  const avgScore =
    graded.length > 0
      ? Math.round(
          graded.reduce(
            (sum, d) => sum + (scoreMap.get(d._id)?.overallScore ?? 0),
            0,
          ) / graded.length,
        )
      : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Skill Scores</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              AI-verified skill assessment for each demo
            </p>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      {!loading && graded.length > 0 && (
        <div data-tour="scores-summary" className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <ScoreRing score={avgScore!} />
              <div>
                <p className="text-sm font-medium">Average Score</p>
                <p className="text-xs text-muted-foreground">
                  Across {graded.length} demo{graded.length !== 1 ? "s" : ""}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{graded.length}</p>
                <p className="text-sm font-medium">Verified</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ungraded.length}</p>
                <p className="text-sm font-medium">Not yet graded</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Demo list */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      ) : (demos ?? []).length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Zap className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">No demos yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a demo first, then get it verified with a skill score.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Ungraded demos first to encourage grading */}
          {ungraded.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Ready to grade
                </h2>
                <Badge variant="secondary" className="text-[10px]">
                  {ungraded.length}
                </Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {ungraded.map((demo) => (
                  <DemoScoreCard
                    key={demo._id}
                    demo={demo}
                    score={null}
                    onGrade={handleGrade}
                    grading={gradingId === demo._id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Graded demos */}
          {graded.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Verified
                </h2>
                <Badge
                  variant="secondary"
                  className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                >
                  {graded.length}
                </Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {graded.map((demo) => (
                  <DemoScoreCard
                    key={demo._id}
                    demo={demo}
                    score={scoreMap.get(demo._id) ?? null}
                    onGrade={handleGrade}
                    grading={gradingId === demo._id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
