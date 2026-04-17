import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile — mivitae",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
