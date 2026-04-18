"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border/20 bg-background/40 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
          <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
            <Image
              src="/logo-light.png"
              alt="mivitae"
              width={120}
              height={36}
              className="block dark:hidden"
              priority
            />
            <Image
              src="/logo-dark.png"
              alt="mivitae"
              width={120}
              height={36}
              className="hidden dark:block"
              priority
            />
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/#features"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground sm:block"
            >
              Features
            </Link>
            <Link
              href="/#for-teams"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground sm:block"
            >
              For Teams
            </Link>
            <Link
              href="/#pricing"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground sm:block"
            >
              Pricing
            </Link>
            <Link
              href="/showcase"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground sm:block"
            >
              Showcase
            </Link>
            <Link
              href="/sign-in"
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
            >
              Get Started
            </Link>
            <ThemeToggle className="ml-1" />
          </nav>
        </div>
      </header>
      <main className="flex-1 animate-fade-in">{children}</main>
      <footer className="border-t border-border/40 py-12">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-light.png"
                alt="mivitae"
                width={90}
                height={28}
                className="block dark:hidden"
              />
              <Image
                src="/logo-dark.png"
                alt="mivitae"
                width={90}
                height={28}
                className="hidden dark:block"
              />
              <span className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()}
              </span>
            </div>
            <nav className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                Terms
              </Link>
              <Link
                href="/changelog"
                className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                Changelog
              </Link>
              <Link
                href="/help"
                className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                Help
              </Link>
              <a
                href="mailto:hello@mivitae.org"
                className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                Contact
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </>
  );
}
