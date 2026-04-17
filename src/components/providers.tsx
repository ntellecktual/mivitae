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
  const upsertSelf = useMutation(api.users.upsertSelf);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    upsertSelf().catch(() => {
      // Not authenticated yet — will retry on next render cycle when auth resolves
      done.current = false;
    });
  }, [upsertSelf]);

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
