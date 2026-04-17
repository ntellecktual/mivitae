import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | mivitae",
  description:
    "Learn how mivitae collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  const lastUpdated = "April 16, 2025";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: {lastUpdated}
      </p>

      <div className="mt-10 space-y-8 text-muted-foreground leading-7">
        <section>
          <h2 className="text-xl font-semibold text-foreground">
            1. Introduction
          </h2>
          <p className="mt-3">
            mivitae (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
            operates the mivitae platform at{" "}
            <strong>mivitae.org</strong>. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you use
            our service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            2. Information We Collect
          </h2>
          <h3 className="mt-4 font-medium text-foreground">
            Account Information
          </h3>
          <p className="mt-2">
            When you create an account, we collect your name, email address, and
            profile photo through our authentication provider (Clerk). We do not
            store your password.
          </p>
          <h3 className="mt-4 font-medium text-foreground">
            Profile &amp; Portfolio Data
          </h3>
          <p className="mt-2">
            You may choose to provide professional information including work
            history, education, skills, project demos, and other portfolio
            content. This data is stored on our servers (Convex) and is
            displayed publicly when you publish your portfolio.
          </p>
          <h3 className="mt-4 font-medium text-foreground">Resume Uploads</h3>
          <p className="mt-2">
            If you upload a resume, the file is stored securely and optionally
            processed by an AI model (Anthropic Claude) to extract structured
            data. Uploaded files are used solely for your portfolio and are not
            shared with third parties beyond the AI processing step.
          </p>
          <h3 className="mt-4 font-medium text-foreground">
            Usage &amp; Analytics Data
          </h3>
          <p className="mt-2">
            We collect anonymized page-view counts and referrer data for your
            portfolio analytics dashboard. We do not use third-party tracking
            cookies or sell your data to advertisers.
          </p>
          <h3 className="mt-4 font-medium text-foreground">
            Payment Information
          </h3>
          <p className="mt-2">
            Payment processing is handled entirely by Stripe. We never store
            your credit card number, CVC, or other sensitive payment details on
            our servers. We retain subscription status, plan type, and Stripe
            customer/subscription IDs.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            3. How We Use Your Information
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              To create and maintain your account and public portfolio
            </li>
            <li>To process payments and manage subscriptions via Stripe</li>
            <li>
              To parse resumes using AI for portfolio auto-population
            </li>
            <li>
              To send transactional emails (welcome, team invites,
              subscription confirmations)
            </li>
            <li>
              To provide analytics on portfolio views and visitor referrers
            </li>
            <li>
              To enforce usage limits based on your subscription plan
            </li>
            <li>
              To detect and prevent fraud, abuse, or security threats
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            4. Third-Party Services
          </h2>
          <p className="mt-3">We use the following third-party services:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong>Clerk</strong> &mdash; Authentication and user management
            </li>
            <li>
              <strong>Convex</strong> &mdash; Backend database and real-time
              data synchronization
            </li>
            <li>
              <strong>Stripe</strong> &mdash; Payment processing and
              subscription management
            </li>
            <li>
              <strong>Anthropic (Claude)</strong> &mdash; AI-powered resume
              parsing
            </li>
            <li>
              <strong>Resend</strong> &mdash; Transactional email delivery
            </li>
          </ul>
          <p className="mt-3">
            Each service has its own privacy policy. We share only the minimum
            data necessary for each service to function.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            5. Data Retention &amp; Deletion
          </h2>
          <p className="mt-3">
            You can export all your data at any time from your account settings.
            You may also delete your account, which permanently removes your
            profile, portfolio content, and associated data from our servers. We
            may retain anonymized, aggregated analytics data after account
            deletion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            6. Cookies
          </h2>
          <p className="mt-3">
            We use essential cookies required for authentication and session
            management. We do not use advertising or tracking cookies. No
            consent banner is required because we do not perform non-essential
            tracking.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            7. Your Rights
          </h2>
          <p className="mt-3">
            Depending on your jurisdiction, you may have the following rights
            under GDPR, CCPA, or similar regulations:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong>Access</strong> &mdash; Request a copy of your personal
              data
            </li>
            <li>
              <strong>Rectification</strong> &mdash; Correct inaccurate data
              via your profile settings
            </li>
            <li>
              <strong>Erasure</strong> &mdash; Delete your account and all
              associated data
            </li>
            <li>
              <strong>Portability</strong> &mdash; Export your data in a
              structured format
            </li>
            <li>
              <strong>Objection</strong> &mdash; Object to data processing
              where applicable
            </li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, use the data export and account
            deletion features in your account settings, or contact us at the
            email below.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            8. Security
          </h2>
          <p className="mt-3">
            We implement industry-standard security measures including
            authentication via Clerk, encrypted data transmission (TLS), input
            validation, rate limiting, and access controls. While no system is
            100% secure, we are committed to protecting your data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            9. Children&apos;s Privacy
          </h2>
          <p className="mt-3">
            Our service is not directed to individuals under the age of 16. We
            do not knowingly collect personal information from children. If you
            believe a child has provided us with personal data, please contact
            us and we will delete it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            10. Changes to This Policy
          </h2>
          <p className="mt-3">
            We may update this Privacy Policy from time to time. We will notify
            registered users of material changes via email. Continued use of
            the service after changes constitutes acceptance of the updated
            policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            11. Contact Us
          </h2>
          <p className="mt-3">
            If you have questions about this Privacy Policy, contact us at:{" "}
            <a
              href="mailto:privacy@mivitae.org"
              className="text-primary hover:underline"
            >
              privacy@mivitae.org
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
