import type { MetadataRoute } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/convex";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mivitae.org";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/privacy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/sign-in`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/sign-up`, changeFrequency: "monthly", priority: 0.3 },
  ];

  // Dynamic public portfolio pages
  const profiles = await convex.query(api.profiles.listPublicSlugs, {});
  const portfolioPages: MetadataRoute.Sitemap = profiles.map((p) => ({
    url: `${baseUrl}/u/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic org/team pages
  const teams = await convex.query(api.teams.listPublicSlugs, {});
  const orgPages: MetadataRoute.Sitemap = teams.map((t) => ({
    url: `${baseUrl}/org/${t.slug}`,
    lastModified: new Date(t.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...portfolioPages, ...orgPages];
}
