import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Showcase — mivitae",
  description:
    "Curated collection of verified portfolio demos from professionals proving their skills.",
};

export default function ShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
