import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help Center — mivitae",
  description: "Guides and answers to common questions about mivitae.",
};

const categories = [
  {
    title: "Getting Started",
    articles: [
      {
        q: "How do I create my portfolio?",
        a: "Sign up, upload your resume (PDF or Word), and mivitae's AI will parse it into structured sections. You can then edit, add demos, and publish.",
      },
      {
        q: "What file formats are supported for resume upload?",
        a: "PDF and Word (.docx) files up to 10 MB. You can also paste text from LinkedIn.",
      },
      {
        q: "How do I set my public URL?",
        a: "Go to Dashboard → Profile and set your slug. Your portfolio will be available at mivitae.org/u/your-slug.",
      },
    ],
  },
  {
    title: "AI Demos",
    articles: [
      {
        q: "How do AI-generated demos work?",
        a: "Describe what you want to showcase, and our AI creates a single-file HTML/CSS/JS demo. You can use Simple mode (just a prompt) or Advanced mode (specify tech stack, style, etc).",
      },
      {
        q: "Can I edit a demo after it's generated?",
        a: "Yes — open any demo from your Demos page and click Edit to modify the code or regenerate it with a new prompt.",
      },
      {
        q: "How many demos can I create?",
        a: "Free plan: 3 demos. Pro plan: 25 demos. Team plan: unlimited.",
      },
    ],
  },
  {
    title: "Themes & Customization",
    articles: [
      {
        q: "How do I change my portfolio theme?",
        a: "Go to Dashboard → Theme. Choose from 18 presets or use the full Theme Studio with 8 design panels: colors & gradients, fonts, layouts, motion, styling, sections, and custom CSS.",
      },
      {
        q: "Can I use a custom domain?",
        a: "Custom domains are on our roadmap. Currently, all portfolios are hosted under mivitae.org/u/.",
      },
    ],
  },
  {
    title: "Billing & Plans",
    articles: [
      {
        q: "Is there a free plan?",
        a: "Yes — every account starts with a 30-day free trial of Pro features, then falls back to the Free tier.",
      },
      {
        q: "How do I upgrade or cancel?",
        a: "Go to Dashboard → Settings → Billing. You can upgrade, downgrade, or cancel your subscription anytime.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards via Stripe. We do not store card details on our servers.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Help Center</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Find answers to common questions and learn how to get the most out of
        mivitae.
      </p>

      <div className="mt-12 space-y-12">
        {categories.map((cat) => (
          <section key={cat.title}>
            <h2 className="text-2xl font-semibold tracking-tight">
              {cat.title}
            </h2>
            <div className="mt-4 space-y-6">
              {cat.articles.map((article, i) => (
                <details
                  key={i}
                  className="group rounded-lg border border-border p-4 transition-colors hover:border-primary/40"
                >
                  <summary className="cursor-pointer font-medium leading-relaxed">
                    {article.q}
                  </summary>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {article.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 rounded-xl border border-border bg-muted/30 p-8 text-center">
        <h3 className="text-lg font-semibold">Still need help?</h3>
        <p className="mt-1 text-muted-foreground">
          Reach out to us at{" "}
          <a
            href="mailto:hello@mivitae.org"
            className="text-primary hover:underline"
          >
            hello@mivitae.org
          </a>
        </p>
      </div>
    </div>
  );
}
