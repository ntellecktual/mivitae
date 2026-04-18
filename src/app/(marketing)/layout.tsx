"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth, useClerk } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const badge = document.getElementById("trial-badge");
      if (badge) {
        setScrolled(badge.getBoundingClientRect().bottom <= 0);
      } else {
        setScrolled(window.scrollY > 80);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-30 transition-all duration-500 ${
          scrolled
            ? "border-b border-border/20 bg-background/40 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div
          className="flex h-16 items-center justify-between transition-all duration-500"
          style={{
            maxWidth: scrolled ? "9999px" : "72rem",
            marginLeft: scrolled ? "0" : "auto",
            marginRight: scrolled ? "0" : "auto",
            paddingLeft: scrolled ? "1.5rem" : "1rem",
            paddingRight: scrolled ? "1.5rem" : "1rem",
          }}
        >
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
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ redirectUrl: "/" })}
                  className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
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
