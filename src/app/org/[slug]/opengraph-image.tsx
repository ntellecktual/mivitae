import { ImageResponse } from "next/og";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/lib/convex";

export const runtime = "edge";
export const alt = "Team page preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await convex.query(api.teams.getPublicTeamPage, { slug });

  if (!data) {
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

  const { team, members } = data;
  const description = team.description
    ? team.description.length > 120
      ? team.description.slice(0, 117) + "..."
      : team.description
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
          <span style={{ color: "#6d28d9" }}>vitae</span>
        </div>

        {/* Center: team info */}
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
            {team.name}
          </div>
          {description && (
            <div
              style={{
                display: "flex",
                fontSize: 24,
                color: "#a1a1aa",
                lineHeight: 1.4,
              }}
            >
              {description}
            </div>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: 20,
              color: "#71717a",
            }}
          >
            👥 {members.length} member{members.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Bottom: URL */}
        <div
          style={{
            display: "flex",
            fontSize: 20,
            color: "#6d28d9",
          }}
        >
          mivitae.org/org/{slug}
        </div>
      </div>
    ),
    { ...size }
  );
}
