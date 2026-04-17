import { ImageResponse } from "next/og";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/convex";

export const runtime = "edge";
export const alt = "Portfolio preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await convex.query(api.profiles.getBySlug, { slug });

  if (!profile || !profile.isPublic) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#0a0a0a",
            color: "#ffffff",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          mivitae
        </div>
      ),
      { ...size }
    );
  }

  const headline = profile.headline || slug;
  const bio = profile.bio
    ? profile.bio.length > 120
      ? profile.bio.slice(0, 117) + "..."
      : profile.bio
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          padding: "60px 80px",
          justifyContent: "space-between",
        }}
      >
        {/* Top: branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 24,
            color: "#a1a1aa",
            fontWeight: 500,
          }}
        >
          mi
          <span style={{ color: "#0d9373" }}>vitae</span>
        </div>

        {/* Center: profile info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.1,
            }}
          >
            {headline}
          </div>
          {bio && (
            <div
              style={{
                display: "flex",
                fontSize: 24,
                color: "#a1a1aa",
                lineHeight: 1.4,
              }}
            >
              {bio}
            </div>
          )}
          {profile.location && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: 20,
                color: "#71717a",
              }}
            >
              📍 {profile.location}
            </div>
          )}
        </div>

        {/* Bottom: URL */}
        <div
          style={{
            display: "flex",
            fontSize: 20,
            color: "#6d28d9",
          }}
        >
          mivitae.org/u/{slug}
        </div>
      </div>
    ),
    { ...size }
  );
}
