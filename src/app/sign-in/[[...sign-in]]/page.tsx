import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Link
        href="/"
        className="mb-8 text-2xl font-bold tracking-tight transition-colors"
      >
        mi<span className="text-primary">vitae</span>
      </Link>
      <div className="w-full max-w-md animate-fade-in">
        <SignIn
          fallbackRedirectUrl="/dashboard"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}
