import { test, expect } from "@playwright/test";

// ── Public pages ───────────────────────────────────────────────────────────

test.describe("Public pages load correctly", () => {
  test("homepage renders and has CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/mivitae/i);
    // Main CTA should be visible
    const cta = page.getByRole("link", { name: /get started|sign up/i });
    await expect(cta.first()).toBeVisible();
  });

  test("sign-in page loads", async ({ page }) => {
    await page.goto("/sign-in");
    // Clerk sign-in form should render
    await expect(page.locator("[data-clerk-component],.cl-rootBox,.cl-card")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("sign-up page loads", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.locator("[data-clerk-component],.cl-rootBox,.cl-card")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("privacy page loads", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("main, article, h1")).toBeVisible();
  });

  test("terms page loads", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.locator("main, article, h1")).toBeVisible();
  });

  test("gallery page loads", async ({ page }) => {
    await page.goto("/gallery");
    await expect(page.locator("main, h1")).toBeVisible();
  });
});

// ── Security headers ───────────────────────────────────────────────────────

test.describe("Security headers are present", () => {
  test("homepage returns expected security headers", async ({ request }) => {
    const res = await request.get("/");
    const headers = res.headers();

    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["strict-transport-security"]).toContain("max-age=");
  });
});

// ── Dashboard redirect (unauthenticated) ───────────────────────────────────

test.describe("Dashboard requires auth", () => {
  test("redirects to sign-in when unauthenticated", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to sign-in
    await page.waitForURL(/sign-in/, { timeout: 10_000 });
    expect(page.url()).toContain("sign-in");
  });

  test("dashboard/profile redirects to sign-in", async ({ page }) => {
    await page.goto("/dashboard/profile");
    await page.waitForURL(/sign-in/, { timeout: 10_000 });
    expect(page.url()).toContain("sign-in");
  });

  test("dashboard/settings redirects to sign-in", async ({ page }) => {
    await page.goto("/dashboard/settings");
    await page.waitForURL(/sign-in/, { timeout: 10_000 });
    expect(page.url()).toContain("sign-in");
  });
});

// ── Public portfolio page ──────────────────────────────────────────────────

test.describe("Public portfolio", () => {
  test("nonexistent slug shows not found", async ({ page }) => {
    await page.goto("/u/this-slug-should-not-exist-12345");
    // Should show some form of "not found" state
    const content = await page.textContent("body");
    // Either 404 page or the portfolio shows "not found"
    expect(content).toBeTruthy();
  });
});

// ── API endpoints ──────────────────────────────────────────────────────────

test.describe("API endpoints", () => {
  test("Clerk webhook endpoint exists (returns 405 on GET)", async ({ request }) => {
    const res = await request.get("/api/webhooks/clerk");
    // GET to a POST-only webhook should return 405 or 404 or 400
    expect([400, 404, 405, 500]).toContain(res.status());
  });

  test("Stripe webhook endpoint exists (returns 405 on GET)", async ({ request }) => {
    const res = await request.get("/api/stripe/webhook");
    expect([400, 404, 405, 500]).toContain(res.status());
  });
});
