"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient, useMutation } from "convex/react";
import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect, useRef } from "react";
import { api } from "@/lib/convex";
import { Toaster } from "sonner";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

/** Syncs the Clerk session into Convex on first authenticated load. */
function ConvexUserSync() {
  const { isSignedIn } = useAuth();
  const upsertSelf = useMutation(api.users.upsertSelf);
  const done = useRef(false);

  useEffect(() => {
    if (!isSignedIn || done.current) return;
    upsertSelf()
      .then(() => {
        done.current = true;
      })
      .catch(() => {
        // Auth token may not have propagated yet — will retry on next render
      });
  }, [isSignedIn, upsertSelf]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange={false}
    >
      <ClerkProvider>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <ConvexUserSync />
          {children}
          <Toaster richColors position="bottom-right" />
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </ThemeProvider>
  );
}
