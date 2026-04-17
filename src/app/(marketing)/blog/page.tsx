import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — mivitae",
  description: "Tips, updates, and stories from the mivitae team.",
};

const posts = [
  {
    slug: "launch",
    title: "Introducing mivitae — Your AI-Powered Developer Portfolio",
    summary:
      "We built mivitae to help developers showcase their work with zero effort. Upload a resume, let AI create interactive demos, and publish a polished portfolio in minutes.",
    date: "2025-01-15",
    tag: "Announcement",
  },
  {
    slug: "ai-demos",
    title: "How AI-Generated Demos Work",
    summary:
      "Under the hood, mivitae uses Claude to turn your project descriptions into live, interactive code demos. Here's how the pipeline works and how to get the best results.",
    date: "2025-01-20",
    tag: "Product",
  },
  {
    slug: "resume-tips",
    title: "5 Resume Tips That Also Improve Your Portfolio",
    summary:
      "Your resume is the seed for your portfolio. Here are five ways to write a better resume that also produces a more impressive mivitae portfolio.",
    date: "2025-02-01",
    tag: "Tips",
  },
];

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Tips, updates, and stories from the mivitae team.
      </p>

      <div className="mt-12 space-y-10">
        {posts.map((post) => (
          <article key={post.slug} className="group">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <time>{post.date}</time>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {post.tag}
              </span>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight group-hover:text-primary transition-colors">
              {post.title}
            </h2>
            <p className="mt-1 text-muted-foreground leading-relaxed">
              {post.summary}
            </p>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Read more <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}
