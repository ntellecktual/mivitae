import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | mivitae",
  description:
    "Read the terms and conditions for using mivitae.",
};

export default function TermsPage() {
  const lastUpdated = "April 16, 2025";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: {lastUpdated}
      </p>

      <div className="mt-10 space-y-8 text-muted-foreground leading-7">
        <section>
          <h2 className="text-xl font-semibold text-foreground">
            1. Acceptance of Terms
          </h2>
          <p className="mt-3">
            By accessing or using mivitae (&quot;the Service&quot;), you agree
            to be bound by these Terms of Service. If you do not agree, do not
            use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            2. Description of Service
          </h2>
          <p className="mt-3">
            mivitae is a professional portfolio platform that allows users to
            create, manage, and share digital portfolios. Features include
            AI-powered resume parsing, portfolio publishing, team management,
            analytics, and interactive project demos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            3. Accounts &amp; Registration
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              You must provide accurate and complete information when creating
              an account.
            </li>
            <li>
              You are responsible for safeguarding your account credentials and
              for all activity under your account.
            </li>
            <li>
              You must be at least 16 years old to use the Service.
            </li>
            <li>
              One person may not maintain more than one free account.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            4. Acceptable Use
          </h2>
          <p className="mt-3">You agree not to:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              Upload content that is unlawful, defamatory, harassing, or
              infringing on intellectual property rights
            </li>
            <li>
              Impersonate another person or entity, or falsely represent your
              professional credentials
            </li>
            <li>
              Attempt to gain unauthorized access to our systems or other
              users&apos; accounts
            </li>
            <li>
              Use automated tools to scrape, crawl, or extract data from the
              Service without permission
            </li>
            <li>
              Interfere with or disrupt the integrity of the Service
            </li>
            <li>
              Use the Service for spam, phishing, or distributing malware
            </li>
            <li>
              Circumvent usage limits or plan restrictions
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            5. User Content
          </h2>
          <p className="mt-3">
            You retain ownership of all content you upload or create on
            mivitae, including portfolio text, images, resume files, and project
            demos (&quot;User Content&quot;).
          </p>
          <p className="mt-3">
            By publishing User Content, you grant mivitae a non-exclusive,
            worldwide, royalty-free license to display, distribute, and cache
            your content solely for the purpose of providing and promoting the
            Service. This license ends when you delete the content or your
            account.
          </p>
          <p className="mt-3">
            You represent that you have the right to publish all User Content
            and that it does not violate any third party&apos;s rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            6. Subscription Plans &amp; Billing
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              mivitae offers Free, Pro ($12/month), and Team ($49/month) plans.
              Pricing is subject to change with 30 days&apos; notice.
            </li>
            <li>
              Paid subscriptions are billed monthly through Stripe. You
              authorize us to charge your payment method on a recurring basis.
            </li>
            <li>
              Free plans include a 30-day trial of Pro features. After the
              trial, your account reverts to Free plan limits.
            </li>
            <li>
              You may cancel your subscription at any time. Cancellation takes
              effect at the end of the current billing period. No partial
              refunds are issued.
            </li>
            <li>
              We reserve the right to downgrade accounts that violate these
              Terms.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            7. AI-Powered Features
          </h2>
          <p className="mt-3">
            mivitae uses third-party AI models (Anthropic Claude) to parse
            resumes and extract structured data. By using this feature:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              You consent to your resume file being sent to Anthropic for
              processing.
            </li>
            <li>
              AI-generated content may contain errors. You are responsible for
              reviewing and correcting all parsed data before publishing.
            </li>
            <li>
              AI features are subject to usage limits based on your
              subscription plan.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            8. Referral Program
          </h2>
          <p className="mt-3">
            mivitae offers a referral program that rewards users for inviting
            others. Referral credits are applied as account credits toward
            subscription fees. We reserve the right to modify or terminate the
            referral program at any time and to revoke credits obtained through
            fraud or abuse.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            9. Intellectual Property
          </h2>
          <p className="mt-3">
            The mivitae name, logo, design, and codebase are the property of
            mivitae and are protected by intellectual property laws. You may not
            copy, modify, or distribute any part of the Service without prior
            written consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            10. Termination
          </h2>
          <p className="mt-3">
            We may suspend or terminate your account at our discretion if you
            violate these Terms. Upon termination, your right to use the
            Service ceases immediately. You may export your data before account
            deletion using the data export feature in account settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            11. Disclaimer of Warranties
          </h2>
          <p className="mt-3">
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
            AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR
            IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
            NON-INFRINGEMENT.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            12. Limitation of Liability
          </h2>
          <p className="mt-3">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, MIVITAE SHALL NOT BE LIABLE
            FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
            DAMAGES, OR ANY LOSS OF PROFITS OR REVENUE, WHETHER INCURRED
            DIRECTLY OR INDIRECTLY. OUR TOTAL LIABILITY SHALL NOT EXCEED THE
            AMOUNT PAID BY YOU IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            13. Indemnification
          </h2>
          <p className="mt-3">
            You agree to indemnify and hold harmless mivitae, its officers,
            directors, and employees from any claims, damages, or expenses
            arising from your use of the Service or violation of these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            14. Governing Law
          </h2>
          <p className="mt-3">
            These Terms are governed by and construed in accordance with the
            laws of the United States. Any disputes arising under these Terms
            shall be resolved in the courts of competent jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            15. Changes to Terms
          </h2>
          <p className="mt-3">
            We may update these Terms from time to time. Material changes will
            be communicated via email or a prominent notice on the Service.
            Continued use of the Service after changes constitutes acceptance of
            the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            16. Contact
          </h2>
          <p className="mt-3">
            Questions about these Terms? Contact us at:{" "}
            <a
              href="mailto:legal@mivitae.org"
              className="text-primary hover:underline"
            >
              legal@mivitae.org
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
