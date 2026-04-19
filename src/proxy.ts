import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/u/(.*)",
  "/api/webhooks/clerk",
  "/api/stripe/webhook",
]);

const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export const proxy = clerkMiddleware(
  async (auth, request) => {
    const { userId } = await auth();

    // Already signed-in users don't need the auth pages
    if (userId && isAuthRoute(request)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  },
  {
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:", "blob:", "https://*.convex.cloud"],
        "connect-src": [
          "'self'",
          "https://*.convex.cloud",
          "wss://*.convex.cloud",
        ],
        "frame-src": ["'self'"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"],
      },
    },
  },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
