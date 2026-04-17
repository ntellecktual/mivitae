"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function SignUpForm() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  return (
    <SignUp
      fallbackRedirectUrl="/dashboard/onboarding"
      signInUrl="/sign-in"
      unsafeMetadata={ref ? { referralCode: ref } : undefined}
    />
  );
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Link
        href="/"
        className="mb-8 text-2xl font-bold tracking-tight transition-colors"
      >
        mi<span className="text-primary">vitae</span>
      </Link>
      <div className="w-full max-w-md animate-fade-in">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          }
        >
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  );
}
