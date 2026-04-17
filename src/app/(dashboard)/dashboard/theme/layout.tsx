import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Theme Studio — mivitae",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
