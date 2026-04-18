import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { CheckCircle2, BarChart3, Globe, Brain } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      {/* ── Left branding panel ────────────────────────────────────── */}
      <div className="relative hidden w-[46%] shrink-0 flex-col overflow-hidden bg-[hsl(160,40%,6%)] lg:flex">
        {/* Ambient orbs */}
        <div className="pointer-events-none absolute -top-24 -left-16 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-orb-1" />
        <div className="pointer-events-none absolute bottom-24 right-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl animate-orb-2" />
        <div className="pointer-events-none absolute top-1/2 left-1/4 h-64 w-64 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-1 flex-col justify-between p-10">
          {/* Logo */}
          <Link href="/" className="inline-flex">
            <Image
              src="/logo-dark.png"
              alt="mivitae"
              width={110}
              height={33}
              priority
            />
          </Link>

          {/* Hero copy */}
          <div className="space-y-8">
            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight text-white">
                Your career,
                <br />
                <span className="text-primary">living proof.</span>
              </h1>
              <p className="max-w-xs text-base leading-relaxed text-white/60">
                Welcome back. Your portfolio is waiting.
              </p>
            </div>

            <ul className="space-y-4">
              {[
                { icon: Globe, text: "Shareable portfolio with a public URL" },
                { icon: BarChart3, text: "Analytics — see who's viewing your work" },
                { icon: Brain, text: "AI-powered skill scores from your demos" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-white/70">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer trust strip */}
          <p className="text-xs text-white/30">
            A nonprofit mission to bring every career to life.
          </p>
        </div>
      </div>

      {/* ── Right form panel ───────────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo visible only on mobile (panel hidden) */}
          <Link href="/" className="flex items-center lg:invisible">
            <Image
              src="/logo-light.png"
              alt="mivitae"
              width={90}
              height={27}
              className="block dark:hidden"
              priority
            />
            <Image
              src="/logo-dark.png"
              alt="mivitae"
              width={90}
              height={27}
              className="hidden dark:block"
              priority
            />
          </Link>
          <ThemeToggle className="ml-auto" />
        </div>

        {/* Centered form */}
        <div className="flex flex-1 items-center justify-center px-4 py-8">
          <div className="w-full max-w-md animate-fade-in">
            <SignIn
              fallbackRedirectUrl="/dashboard"
              signUpUrl="/sign-up"
            />
          </div>
        </div>

        {/* Back to home */}
        <div className="flex justify-center pb-6">
          <Link
            href="/"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to mivitae.org
          </Link>
        </div>
      </div>
    </div>
  );
}
