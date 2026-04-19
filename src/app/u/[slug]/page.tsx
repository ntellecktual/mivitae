import type { Metadata } from "next";
import Script from "next/script";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/convex";
import PortfolioContent from "./portfolio-content";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const profile = await convex.query(api.profiles.getBySlug, { slug });

    if (!profile || !profile.isPublic) {
      return { title: "Portfolio Not Found — mivitae" };
    }

    const title = profile.displayName
      ? `${profile.displayName}${profile.headline ? ` — ${profile.headline}` : ""} — mivitae`
      : profile.headline
      ? `${profile.headline} — mivitae`
      : `${slug} — mivitae`;
    const description =
      profile.bio || `View ${profile.displayName ?? slug}'s professional portfolio on mivitae.`;

    return {
      title,
      description,
      ...(profile.avatarUrl && {
        icons: {
          icon: profile.avatarUrl,
          apple: profile.avatarUrl,
        },
      }),
      openGraph: {
        title,
        description,
        type: "profile",
        url: `/u/${slug}`,
        siteName: "mivitae",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch {
    return { title: "Portfolio — mivitae" };
  }
}

export default async function PublicPortfolioPage({ params }: Props) {
  const { slug } = await params;

  // JSON-LD structured data (fetched server-side for SEO crawlers)
  let jsonLd: Record<string, unknown> | null = null;
  try {
    const profile = await convex.query(api.profiles.getBySlug, { slug });

    jsonLd =
      profile && profile.isPublic
        ? {
            "@context": "https://schema.org",
            "@type": "Person",
            name: profile.displayName || profile.headline || slug,
            ...(profile.headline && { jobTitle: profile.headline }),
            ...(profile.bio && { description: profile.bio }),
            ...(profile.location && {
              address: { "@type": "PostalAddress", addressLocality: profile.location },
            }),
            ...(profile.websiteUrl && { url: profile.websiteUrl }),
            ...(profile.linkedinUrl && {
              sameAs: [
                profile.linkedinUrl,
                ...(profile.githubUrl ? [profile.githubUrl] : []),
              ],
            }),
          }
        : null;
  } catch {
    // Convex unavailable — render page without JSON-LD
  }

  return (
    <>
      {jsonLd && (
        <Script
          id="portfolio-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <PortfolioContent slug={slug} />
    </>
  );
}
