"use client";

import { useState, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "@/lib/convex";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import {
  Search,
  Briefcase,
  MapPin,
  Clock,
  ExternalLink,
  Loader2,
  Sparkles,
  Building2,
  DollarSign,
  Globe,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { toast } from "sonner";

/* ── Types (from JSearch API) ───────────────────────────────────────── */

interface JobResult {
  job_id: string;
  employer_name: string;
  employer_logo: string | null;
  employer_website: string | null;
  job_title: string;
  job_apply_link: string;
  job_description: string;
  job_employment_type: string | null;
  job_is_remote: boolean;
  job_city: string | null;
  job_state: string | null;
  job_country: string | null;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string | null;
  job_salary_period: string | null;
  job_posted_at_datetime_utc: string | null;
  job_highlights?: {
    Qualifications?: string[];
    Responsibilities?: string[];
    Benefits?: string[];
  };
}

interface SearchResponse {
  status: string;
  data: JobResult[];
  parameters?: { query: string };
}

/* ── Constants ──────────────────────────────────────────────────────── */

const DATE_OPTIONS = [
  { value: "all", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "3days", label: "Past 3 days" },
  { value: "week", label: "Past week" },
  { value: "month", label: "Past month" },
] as const;

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "FULLTIME", label: "Full-time" },
  { value: "PARTTIME", label: "Part-time" },
  { value: "CONTRACTOR", label: "Contract" },
  { value: "INTERN", label: "Internship" },
] as const;

/* ── Helper ─────────────────────────────────────────────────────────── */

function formatSalary(job: JobResult) {
  if (!job.job_min_salary && !job.job_max_salary) return null;
  const cur = job.job_salary_currency ?? "USD";
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    }).format(n);
  if (job.job_min_salary && job.job_max_salary) {
    return `${fmt(job.job_min_salary)} – ${fmt(job.job_max_salary)}`;
  }
  return fmt(job.job_min_salary ?? job.job_max_salary!);
}

function formatLocation(job: JobResult) {
  const parts = [job.job_city, job.job_state, job.job_country].filter(Boolean);
  return parts.join(", ") || "Location not specified";
}

function timeAgo(isoDate: string | null) {
  if (!isoDate) return null;
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/* ── Job Card ───────────────────────────────────────────────────────── */

function JobCard({
  job,
  onViewDetails,
}: {
  job: JobResult;
  onViewDetails: (job: JobResult) => void;
}) {
  const salary = formatSalary(job);
  return (
    <Card className="group transition-all duration-200 hover:shadow-md hover:border-primary/20">
      <CardContent className="p-5">
        <div className="flex gap-4">
          {/* Employer logo */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
            {job.employer_logo ? (
              <img
                src={job.employer_logo}
                alt={job.employer_name}
                className="h-full w-full object-contain p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : null}
            <Building2
              className={`h-6 w-6 text-muted-foreground ${job.employer_logo ? "hidden" : ""}`}
            />
          </div>

          <div className="min-w-0 flex-1">
            {/* Title + employer */}
            <h3 className="font-semibold leading-snug line-clamp-1 group-hover:text-primary transition-colors">
              {job.job_title}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {job.employer_name}
            </p>

            {/* Meta row */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {formatLocation(job)}
              </span>

              {job.job_is_remote && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-4"
                >
                  <Globe className="h-2.5 w-2.5 mr-0.5" />
                  Remote
                </Badge>
              )}

              {job.job_employment_type && (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {job.job_employment_type.replace("FULLTIME", "Full-time")
                    .replace("PARTTIME", "Part-time")
                    .replace("CONTRACTOR", "Contract")
                    .replace("INTERN", "Internship")}
                </span>
              )}

              {salary && (
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <DollarSign className="h-3 w-3" />
                  {salary}
                </span>
              )}

              {job.job_posted_at_datetime_utc && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo(job.job_posted_at_datetime_utc)}
                </span>
              )}
            </div>

            {/* Description preview */}
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
              {job.job_description?.replace(/<[^>]*>/g, "").slice(0, 200)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2 pt-3 border-t">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7"
            onClick={() => onViewDetails(job)}
          >
            View Details
          </Button>
          <Button
            size="sm"
            className="text-xs h-7 ml-auto"
            asChild
          >
            <a
              href={job.job_apply_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Job Detail Panel ───────────────────────────────────────────────── */

function JobDetailPanel({
  job,
  onClose,
}: {
  job: JobResult;
  onClose: () => void;
}) {
  const salary = formatSalary(job);
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-background border-l shadow-2xl h-full overflow-y-auto animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-4 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
            {job.employer_logo ? (
              <img
                src={job.employer_logo}
                alt={job.employer_name}
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <Building2 className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold leading-snug">{job.job_title}</h2>
            <p className="text-sm text-muted-foreground">{job.employer_name}</p>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Quick info */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              {formatLocation(job)}
            </Badge>
            {job.job_is_remote && (
              <Badge variant="secondary" className="text-xs">
                <Globe className="h-3 w-3 mr-1" />
                Remote
              </Badge>
            )}
            {job.job_employment_type && (
              <Badge variant="secondary" className="text-xs">
                <Briefcase className="h-3 w-3 mr-1" />
                {job.job_employment_type}
              </Badge>
            )}
            {salary && (
              <Badge variant="secondary" className="text-xs font-medium">
                <DollarSign className="h-3 w-3 mr-1" />
                {salary}
              </Badge>
            )}
            {job.job_posted_at_datetime_utc && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {timeAgo(job.job_posted_at_datetime_utc)}
              </Badge>
            )}
          </div>

          {/* Apply button */}
          <Button className="w-full" asChild>
            <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer">
              Apply Now
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>

          {/* Highlights */}
          {job.job_highlights?.Qualifications &&
            job.job_highlights.Qualifications.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Qualifications</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  {job.job_highlights.Qualifications.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

          {job.job_highlights?.Responsibilities &&
            job.job_highlights.Responsibilities.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Responsibilities</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  {job.job_highlights.Responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

          {job.job_highlights?.Benefits &&
            job.job_highlights.Benefits.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Benefits</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  {job.job_highlights.Benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Full description */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Full Description</h3>
            <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {job.job_description?.replace(/<[^>]*>/g, "")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────── */

export default function JobsPage() {
  const searchJobs = useAction(api.jobs.search);
  const smartSearchJobs = useAction(api.jobs.smartSearch);

  const [query, setQuery] = useState("");
  const [datePosted, setDatePosted] = useState<string>("all");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [employmentType, setEmploymentType] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<JobResult | null>(null);
  const [lastQuery, setLastQuery] = useState("");
  const [mode, setMode] = useState<"manual" | "smart">("manual");

  const doSearch = useCallback(
    async (searchPage = 1) => {
      if (!query.trim()) return;
      setLoading(true);
      setMode("manual");
      try {
        const res = await searchJobs({
          query: query.trim(),
          page: searchPage,
          datePosted: datePosted as "all" | "today" | "3days" | "week" | "month",
          remoteOnly,
          employmentType: employmentType || undefined,
        });
        setResults(res);
        setPage(searchPage);
        setLastQuery(query.trim());
      } catch (err) {
        toast.error("Search failed. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [query, datePosted, remoteOnly, employmentType, searchJobs],
  );

  const doSmartSearch = useCallback(
    async (searchPage = 1) => {
      setLoading(true);
      setMode("smart");
      try {
        const res = await smartSearchJobs({
          page: searchPage,
          datePosted: datePosted as "all" | "today" | "3days" | "week" | "month",
          remoteOnly,
        });
        setResults(res);
        setPage(searchPage);
        setLastQuery(res?.parameters?.query ?? "Smart Search");
      } catch (err) {
        toast.error("Smart search failed. Try adding skills to your profile first.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [datePosted, remoteOnly, smartSearchJobs],
  );

  const jobs = results?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Job Search</h1>
        <p className="text-muted-foreground mt-1">
          Find opportunities that match your skills and experience
        </p>
      </div>

      {/* Search bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Job title, company, or keywords..."
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") doSearch();
                }}
              />
            </div>
            <Button onClick={() => doSearch()} disabled={loading || !query.trim()}>
              {loading && mode === "manual" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">Search</span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => doSmartSearch()}
              disabled={loading}
              title="Search using your profile headline and top skills"
            >
              {loading && mode === "smart" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">Smart Match</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-accent" : ""}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters row */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t flex flex-wrap gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Date Posted
                </label>
                <select
                  title="Date Posted"
                  className="block w-36 rounded-md border bg-background px-2 py-1.5 text-sm"
                  value={datePosted}
                  onChange={(e) => setDatePosted(e.target.value)}
                >
                  {DATE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Employment Type
                </label>
                <select
                  title="Employment Type"
                  className="block w-36 rounded-md border bg-background px-2 py-1.5 text-sm"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Remote Only
                </label>
                <button
                  className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                    remoteOnly
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-accent"
                  }`}
                  onClick={() => setRemoteOnly(!remoteOnly)}
                >
                  <Globe className="h-3.5 w-3.5" />
                  {remoteOnly ? "On" : "Off"}
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && !results && (
        <EmptyState
          icon={Briefcase}
          title="Search for jobs"
          description="Enter a job title or keywords above, or use Smart Match to find jobs based on your profile and skills."
          action={
            <Button variant="secondary" onClick={() => doSmartSearch()}>
              <Sparkles className="h-4 w-4 mr-2" />
              Try Smart Match
            </Button>
          }
        />
      )}

      {!loading && results && jobs.length === 0 && (
        <EmptyState
          icon={Search}
          title="No jobs found"
          description="Try different keywords, broaden your filters, or use Smart Match."
        />
      )}

      {!loading && jobs.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {mode === "smart" ? (
                <>
                  Smart results for{" "}
                  <span className="font-medium text-foreground">
                    &ldquo;{lastQuery}&rdquo;
                  </span>
                </>
              ) : (
                <>
                  Results for{" "}
                  <span className="font-medium text-foreground">
                    &ldquo;{lastQuery}&rdquo;
                  </span>
                </>
              )}
            </p>
            <p className="text-xs text-muted-foreground">Page {page}</p>
          </div>

          <div className="grid gap-3">
            {jobs.map((job) => (
              <JobCard
                key={job.job_id}
                job={job}
                onViewDetails={setSelectedJob}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => {
                const prev = page - 1;
                mode === "smart"
                  ? doSmartSearch(prev)
                  : doSearch(prev);
              }}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {page}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={jobs.length < 10}
              onClick={() => {
                const next = page + 1;
                mode === "smart"
                  ? doSmartSearch(next)
                  : doSearch(next);
              }}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </>
      )}

      {/* Detail panel */}
      {selectedJob && (
        <JobDetailPanel job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
