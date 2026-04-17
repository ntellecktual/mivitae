import type { Metadata } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/convex";
import Link from "next/link";
import { Globe, ArrowRight, Users, MapPin, Building2 } from "lucide-react";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type Props = {
  params: Promise<{ slug: string }>;
};

type TeamTheme = { accent: string; bg: string; card: string; hover: string; layout: string; tagline: string; columns: string };

const DEFAULT_THEME: TeamTheme = { accent: "#10b981", bg: "dark", card: "bordered", hover: "lift", layout: "centered", tagline: "", columns: "auto" };

const BG_CONFIG: Record<string, { color: string; isDark: boolean; gradient?: string }> = {
  dark:   { color: "#18181b", isDark: true },
  light:  { color: "#fafafa", isDark: false },
  deep:   { color: "#0a0f1a", isDark: true },
  warm:   { color: "#1a1208", isDark: true },
  slate:  { color: "#1e293b", isDark: true },
  aurora: { color: "#0d1117", isDark: true, gradient: "linear-gradient(135deg, #0d1117 0%, #1a0a2e 40%, #0a1628 100%)" },
};

function parseTheme(raw?: string | null): TeamTheme {
  if (!raw) return DEFAULT_THEME;
  try { return { ...DEFAULT_THEME, ...JSON.parse(raw) }; }
  catch { return DEFAULT_THEME; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await convex.query(api.teams.getPublicTeamPage, { slug });

  if (!data) {
    return { title: "Team Not Found — mivitae" };
  }

  const title = `${data.team.name} — mivitae`;
  const description =
    data.team.description ||
    `View ${data.team.name}'s team portfolio on mivitae.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `/org/${slug}`,
      siteName: "mivitae",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function OrgPage({ params }: Props) {
  const { slug } = await params;
  const data = await convex.query(api.teams.getPublicTeamPage, { slug });

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Team not found</h1>
          <p className="mt-2 text-muted-foreground">
            This org page doesn&apos;t exist or has been removed.
          </p>
          <Link href="/" className="mt-6 inline-flex items-center text-sm text-primary hover:underline">
            Back to mivitae
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const { team, members } = data;
  const theme = parseTheme(team.themeSettings);
  const bg = BG_CONFIG[theme.bg] ?? BG_CONFIG.dark;
  const textBase = bg.isDark ? "#f4f4f5" : "#18181b";
  const textMuted = bg.isDark ? "#a1a1aa" : "#71717a";
  const borderColor = bg.isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  return (
    <div style={{ minHeight: "100vh", background: bg.gradient ?? bg.color, color: textBase }}>
      <style>{`
        * { scrollbar-color: ${theme.accent}55 transparent; }
        *::-webkit-scrollbar-thumb { background-color: ${theme.accent}55; }
        *::-webkit-scrollbar-thumb:hover { background-color: ${theme.accent}; }
        [data-card-hover="glow"]:hover { box-shadow: 0 0 28px ${theme.accent}50, 0 4px 20px ${theme.accent}28; }
        [data-card-hover="lift"]:hover { transform: translateY(-4px) scale(1.015); }
      `}</style>
      {/* Nav bar */}
      <header style={{ borderBottom: `1px solid ${borderColor}` }}>
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold tracking-tight" style={{ color: textBase }}>
            mi<span style={{ color: theme.accent }}>vitae</span>
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: theme.accent, color: "#fff" }}
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16 space-y-16">
        {/* Team Hero */}
        <section className={theme.layout === "left" ? "space-y-4" : "text-center space-y-4"}>
          {team.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={team.logoUrl}
              alt={team.name}
              className={`${theme.layout !== "left" ? "mx-auto " : ""}h-24 w-24 rounded-2xl object-cover`}
              style={{ border: `2px solid ${borderColor}` }}
            />
          ) : (
            <div
              className={`${theme.layout !== "left" ? "mx-auto " : ""}flex h-24 w-24 items-center justify-center rounded-2xl text-3xl font-bold`}
              style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
            >
              {team.name[0].toUpperCase()}
            </div>
          )}

          <h1 className="text-4xl font-bold" style={{ color: textBase }}>{team.name}</h1>

          {theme.tagline && (
            <p className="text-sm font-medium tracking-wide" style={{ color: theme.accent }}>{theme.tagline}</p>
          )}

          {team.description && (
            <p className={`${theme.layout !== "left" ? "mx-auto " : ""}max-w-xl text-lg`} style={{ color: textMuted }}>
              {team.description}
            </p>
          )}

          <div className={`flex flex-wrap items-center ${theme.layout === "left" ? "justify-start" : "justify-center"} gap-4 text-sm`} style={{ color: textMuted }}>
            {team.website && (
              <a
                href={team.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 transition-opacity hover:opacity-80"
              >
                <Globe className="h-4 w-4" />
                {team.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            {(team as any).location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {(team as any).location}
              </span>
            )}
            {(team as any).industry && (
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {(team as any).industry}
              </span>
            )}
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {members.length} member{members.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Social links */}
          {((team as any).twitterUrl || (team as any).linkedinUrl || (team as any).githubUrl) && (
            <div className={`flex items-center ${theme.layout === "left" ? "justify-start" : "justify-center"} gap-3`}>
              {(team as any).twitterUrl && (
                <a href={(team as any).twitterUrl} target="_blank" rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-70" style={{ color: textMuted }}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-label="X / Twitter"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.26 5.632 5.904-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              )}
              {(team as any).linkedinUrl && (
                <a href={(team as any).linkedinUrl} target="_blank" rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-70" style={{ color: textMuted }}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-label="LinkedIn"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              )}
              {(team as any).githubUrl && (
                <a href={(team as any).githubUrl} target="_blank" rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-70" style={{ color: textMuted }}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-label="GitHub"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                </a>
              )}
            </div>
          )}
        </section>

        {/* Members Grid */}
        <section>
          <h2 className="mb-8 text-center text-2xl font-bold" style={{ color: textBase }}>
            Meet the team
          </h2>

          {members.length === 0 ? (
            <p className="text-center" style={{ color: textMuted }}>
              No public portfolios yet.
            </p>
          ) : (
            <div className={theme.columns === "2" ? "grid gap-6 sm:grid-cols-2" : theme.columns === "3" ? "grid gap-6 sm:grid-cols-2 md:grid-cols-3" : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"}>
              {(members as any[]).map((member, i) => (
                <MemberCard
                  key={i}
                  member={member}
                  accent={theme.accent}
                  cardStyle={theme.card}
                  hover={theme.hover}
                  textBase={textBase}
                  textMuted={textMuted}
                  borderColor={borderColor}
                  isDark={bg.isDark}
                />
              ))}
            </div>
          )}
        </section>

        {/* CTA Footer */}
        <section
          className="rounded-2xl p-10 text-center"
          style={{ border: `1px solid ${borderColor}`, backgroundColor: bg.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}
        >
          <p className="text-sm mb-2" style={{ color: textMuted }}>Powered by</p>
          <p className="text-2xl font-bold" style={{ color: textBase }}>
            mi<span style={{ color: theme.accent }}>vitae</span>
          </p>
          <p className="mt-2" style={{ color: textMuted }}>
            Build your own living portfolio in minutes.
          </p>
          <Link
            href="/sign-up"
            className="mt-6 inline-flex items-center rounded-lg px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: theme.accent }}
          >
            Start free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}

function MemberCard({
  member,
  accent,
  cardStyle,
  hover,
  textBase,
  textMuted,
  borderColor,
  isDark,
}: {
  member: { name: string; slug: string; headline?: string; avatarUrl?: string; role: string };
  accent: string;
  cardStyle: string;
  hover: string;
  textBase: string;
  textMuted: string;
  borderColor: string;
  isDark: boolean;
}) {
  const cardBg =
    cardStyle === "filled"
      ? isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"
      : cardStyle === "ghost"
      ? "transparent"
      : isDark ? "rgba(255,255,255,0.03)" : "#fff";

  const cardBorder =
    cardStyle === "ghost" ? "1px solid transparent" : `1px solid ${borderColor}`;

  return (
    <Link
      href={`/u/${member.slug}`}
      className="group rounded-2xl p-6"
      data-card-hover={hover}
      style={{ backgroundColor: cardBg, border: cardBorder, transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
    >
      <div className="flex items-start gap-4">
        {member.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.avatarUrl}
            alt={member.name}
            className="h-14 w-14 rounded-xl object-cover shrink-0"
          />
        ) : (
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-xl font-bold"
            style={{ backgroundColor: `${accent}20`, color: accent }}
          >
            {member.name[0].toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold truncate transition-colors" style={{ color: textBase }}>
            {member.name}
          </p>
          {member.headline && (
            <p className="mt-0.5 text-sm line-clamp-2" style={{ color: textMuted }}>
              {member.headline}
            </p>
          )}
          <p className="mt-2 text-xs capitalize" style={{ color: textMuted }}>
            {member.role === "owner" ? "Team Lead" : member.role}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm font-medium" style={{ color: accent }}>
        View portfolio
        <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
