import Link from "next/link";
import type { HTMLAttributes } from "react";
import {
  ArrowRight,
  Upload,
  Globe,
  CheckCircle,
  Building2,
  GraduationCap,
  Users,
  Briefcase,
  Star,
  Palette,
  BarChart3,
  Shield,
  Wand2,
  Eye,
  Share2,
  Search,
  FileText,
  Zap,
  Lock,
  QrCode,
  Code2,
  Layout,
  Smartphone,
  Download,
  Trash2,
  Monitor,
  Brain,
  TrendingUp,
  FileWarning,
  HelpCircle,
  Clock,
} from "lucide-react";
import { ScrollAnimator } from "@/components/marketing/scroll-animator";
import { FloatingCTA } from "@/components/marketing/floating-cta";
import { WordRotator } from "@/components/marketing/word-rotator";

export default function HomePage() {
  return (
    <div>
      <ScrollAnimator />
      <FloatingCTA />
      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,color-mix(in_srgb,var(--primary)_12%,transparent),transparent)]" />
        {/* Animated ambient orbs */}
        <div className="pointer-events-none absolute -top-32 left-[15%] h-[28rem] w-[36rem] rounded-full bg-primary/15 blur-3xl animate-orb-1" />
        <div className="pointer-events-none absolute top-10 right-[10%] h-72 w-72 rounded-full bg-primary/12 blur-3xl animate-orb-2" />

        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <div id="trial-badge" className="mb-6 inline-flex items-center rounded-full border bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground" data-animate>
            <Zap className="mr-1.5 h-3 w-3 text-primary" />
            30-day free trial &mdash; no credit card required
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl" data-animate data-delay="100">
            <WordRotator /> are done.
            <br />
            <span className="hero-gradient-text">
              Build living proof.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl" data-animate data-delay="200">
            {"Upload your r\u00e9sum\u00e9 and get a beautiful, shareable portfolio with interactive demos that "}
            <em>prove</em>
            {" what you can do \u2014 in any industry, any role. AI-parsed, fully themed, SEO-ready, and live in under 5 minutes."}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4" data-animate data-delay="300">
            <Link
              href="/sign-up"
              className="btn-pulse-glow inline-flex items-center rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              Start for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center rounded-xl border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-muted"
            >
              See Every Feature
            </Link>
          </div>

          {/* Sentinel — FloatingCTA watches this leaving the viewport */}
          <div id="hero-cta-sentinel" aria-hidden="true" className="mt-8" data-animate data-delay="400">
            <p className="text-xs font-medium text-muted-foreground">
              A nonprofit mission to bring every career to life. For every industry,
              every role, <span className="text-primary">every person.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="border-b border-t bg-muted/40 py-6">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16">
            {[
              { value: "1,200+", label: "portfolios published", delay: "0" },
              { value: "5 min", label: "from upload to live", delay: "100" },
              { value: "23", label: "features, one platform", delay: "200" },
              { value: "30-day", label: "free trial, no card", delay: "300" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1" data-animate data-delay={stat.delay}>
                <span className="stat-value text-2xl font-bold text-primary">{stat.value}</span>
                <span className="text-center text-xs text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="border-b py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            {`R\u00e9sum\u00e9s tell. Portfolios `}
            <span className="text-primary">prove.</span>
          </h2>
          <div className="mx-auto mt-10 grid gap-6 sm:grid-cols-3">
            <div data-animate data-delay="0">
              <ProblemCard
                icon={FileWarning}
                problem="PDFs get buried"
                detail={`Recruiters see 250+ r\u00e9sum\u00e9s per opening. A PDF buried in an inbox doesn\u2019t stand out \u2014 a living URL does.`}
              />
            </div>
            <div data-animate data-delay="150">
              <ProblemCard
                icon={HelpCircle}
                problem={'"I did X" means nothing'}
                detail={`Anyone can claim they "grew revenue 40%" or "reduced patient wait times." mivitae lets you show the proof \u2014 interactive, visual, real.`}
              />
            </div>
            <div data-animate data-delay="300">
              <ProblemCard
                icon={Clock}
                problem="Building a website takes weeks"
                detail={`You don\u2019t need a developer to build a professional portfolio. You need one live today. Upload a r\u00e9sum\u00e9, we handle the rest.`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="border-b py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeader
            tag="3 steps"
            title={`From PDF to live portfolio in minutes`}
            subtitle="No coding required. No design skills needed. Just your resume."
          />
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <div data-animate data-delay="0">
              <StepCard
                step={1}
                icon={Upload}
                title={`Upload your r\u00e9sum\u00e9`}
                description={`Drop a PDF. Our AI reads the actual document \u2014 not OCR \u2014 and extracts your entire work history, education, skills, and achievements in seconds.`}
              />
            </div>
            <div data-animate data-delay="200">
              <StepCard
                step={2}
                icon={Wand2}
                title="AI builds your demos"
                description={`Answer 3 questions about your best work. Our AI generates interactive, visual demos with real data from your accomplishments \u2014 polished dashboards, animated charts, and professional case studies.`}
              />
            </div>
            <div data-animate data-delay="400">
              <StepCard
                step={3}
                icon={Globe}
                title="Publish & share"
                description={`Your portfolio goes live at mivitae.org/u/your-name. SEO-optimized, social-share-ready, and always up to date. One URL for every application.`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section id="features" className="border-b py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeader
            tag="Everything you get"
            title="23 features. One subscription. Zero excuses."
            subtitle="Every tool you need to build a professional presence that actually lands jobs."
          />

          {/* AI-Powered */}
          <FeatureGroup title="AI-Powered Intelligence" className="mt-16" data-animate>
            <FeatureCard
              icon={Brain}
              title={`AI R\u00e9sum\u00e9 Parsing`}
              description={`Upload a PDF. Claude reads the document directly \u2014 no OCR \u2014 and extracts work history, education, skills, and achievements into structured data in ~30 seconds.`}
              whyItMatters="Eliminates 2+ hours of manual data entry. Your portfolio is populated before you finish your coffee."
            />
            <FeatureCard
              icon={Wand2}
              title="AI Demo Generation"
              description="Answer 3 questions about your work. Our AI plans the demo structure, then generates production-quality interactive visuals with real metrics, charts, and animations — for any profession."
              whyItMatters="You don't need to code to show proof of your work. Anyone in any profession gets polished, interactive demos."
            />
            <FeatureCard
              icon={Zap}
              title="Smart Demo Caching"
              description="Similar roles get instant results. If another professional with a matching background already generated a demo, yours renders immediately."
              whyItMatters="Faster experience and zero cost on repeat patterns. Whether you're a nurse, a marketer, or an engineer — similar roles get instant demos."
            />
          </FeatureGroup>

          {/* Portfolio Building */}
          <FeatureGroup title="Portfolio Building" className="mt-12" data-animate data-delay="100">
            <FeatureCard
              icon={Briefcase}
              title="Work History Management"
              description="Full CRUD for every role. Company, title, dates, description, skills, achievements. Drag to reorder. Link interactive demos directly to each position."
              whyItMatters={`Structured career narrative, not a wall of text. Demo links turn "I did X" into "here\u2019s X in action."`}
            />
            <FeatureCard
              icon={GraduationCap}
              title="Education & Certificates"
              description="Detailed education entries (GPA, honors, activities, coursework) plus certificates with credential IDs and verification URLs."
              whyItMatters={`Goes beyond what any r\u00e9sum\u00e9 shows \u2014 recruiters can click to verify credentials directly.`}
            />
            <FeatureCard
              icon={Code2}
              title="Interactive Demo Cards"
              description="Full HTML/CSS/JS demos embedded in sandboxed iframes. Status tracking (live/WIP/archived), tags, categories, links, and banner images. Works for every profession."
              whyItMatters="The core differentiator. No other portfolio tool lets you attach working, interactive proof to every job — regardless of your profession."
            />
            <FeatureCard
              icon={FileText}
              title="6-Step Onboarding Wizard"
              description={`Profile \u2192 Upload \u2192 Review \u2192 Work History \u2192 Education \u2192 Publish. Progress saved server-side \u2014 close the browser and come back exactly where you left off.`}
              whyItMatters={`No blank-page anxiety. You\u2019re never stuck wondering what to do next.`}
            />
          </FeatureGroup>

          {/* Design & Customization */}
          <FeatureGroup title="Design & Customization" className="mt-12" data-animate data-delay="100">
            <FeatureCard
              icon={Palette}
              title="Theme Studio"
              description="Full visual editor: background (solid/gradient/pattern), colors, typography (curated Google Fonts), layout options, card styles (glass/bordered/flat/elevated), and custom CSS injection."
              whyItMatters="Your portfolio reflects your brand, not a generic template. More Webflow-lite than cookie-cutter."
            />
            <FeatureCard
              icon={Layout}
              title="12 Designer Presets"
              description="Arctic, Midnight, Noir, Ocean, Forest, Sunset, Ember, Lavender, Terminal, Rose, Copper, Obsidian. Each with curated color palettes, font pairings, and layout preferences."
              whyItMatters="Professional design in one click. Non-designers get designer-quality results instantly."
            />
            <FeatureCard
              icon={Monitor}
              title="Live Preview"
              description="Every theme change updates in real-time. See exactly what visitors will see as you customize."
              whyItMatters="No guesswork. What you see is what recruiters see."
            />
          </FeatureGroup>

          {/* Public Presence */}
          <FeatureGroup title="Your Public Presence" className="mt-12" data-animate data-delay="100">
            <FeatureCard
              icon={Globe}
              title="Public Portfolio Pages"
              description="Server-rendered portfolio at mivitae.org/u/your-name with hero section, work timeline, education, demos gallery, and floating social share bar."
              whyItMatters="A real URL that replaces the need for a personal website. Always up to date, always accessible."
            />
            <FeatureCard
              icon={Search}
              title="SEO & Discoverability"
              description="JSON-LD structured data (Schema.org Person), Open Graph + Twitter Card metadata, dynamic sitemap, server-side rendering. Search engines see your full content."
              whyItMatters="Your portfolio shows up in Google results. LinkedIn previews look professional. Recruiters find you organically."
            />
            <FeatureCard
              icon={Eye}
              title="Dynamic OG Images"
              description="Auto-generated Open Graph images for social sharing. Both user portfolios and team org pages. No manual design needed."
              whyItMatters="Every social share becomes a branded preview card, not a generic link. Higher click-through on every share."
            />
            <FeatureCard
              icon={Share2}
              title="Multi-Platform Sharing"
              description="Share buttons everywhere they matter: LinkedIn, Facebook, native share API, copy link. Referral page adds Instagram, TikTok, X, WhatsApp, Telegram, and QR codes."
              whyItMatters={`One-tap sharing to any platform. Zero friction between "I have a portfolio" and "everyone sees my portfolio."`}
            />
          </FeatureGroup>

          {/* Analytics & Growth */}
          <FeatureGroup title="Analytics & Growth" className="mt-12" data-animate data-delay="100">
            <FeatureCard
              icon={BarChart3}
              title="Analytics Dashboard"
              description={`30-day profile view chart, total views with week-over-week trends, top 5 referrer breakdown with percentage bars. Custom SVG charts \u2014 no bloated library.`}
              whyItMatters={`Answers "is anyone looking at my portfolio?" and "which channels drive traffic?" Data-driven career decisions.`}
            />
            <FeatureCard
              icon={TrendingUp}
              title="Profile Strength Scoring"
              description="Weighted completion score (headline 20%, bio 20%, public 20%, social links 15%, slug 10%, theme 10%, location 5%) with a visual ring and actionable checklist."
              whyItMatters="Always know exactly what to improve. Turn a 60% profile into a 100% profile in minutes."
            />
            <FeatureCard
              icon={QrCode}
              title="Referral Program"
              description={`Unique 8-character referral code, shareable links, QR code generation, 7+ social platform share buttons. Referred user converts \u2192 you earn 1 month of Pro free.`}
              whyItMatters="Your network becomes your growth engine. Share mivitae, earn free months. Everyone wins."
            />
          </FeatureGroup>

          {/* Trust & Security */}
          <FeatureGroup title="Trust & Security" className="mt-12" data-animate data-delay="100">
            <FeatureCard
              icon={Shield}
              title="Enterprise-Grade Auth"
              description="Powered by Clerk. Email/password, profile management, sessions, and security built by authentication experts. We never see your password."
              whyItMatters="Your account is protected by the same auth infrastructure used by companies at scale."
            />
            <FeatureCard
              icon={Lock}
              title="Plan Enforcement at the API Level"
              description={`Every limit is enforced server-side \u2014 not just in the UI. Demo count, section limits, parse quotas \u2014 all validated in the backend before writes happen.`}
              whyItMatters="No one gets access they didn't pay for, which means paying users get a reliable, quality experience."
            />
            <FeatureCard
              icon={Download}
              title="Full Data Export"
              description={`Export all your data anytime. Your content is yours \u2014 not locked in a platform you can\u2019t leave.`}
              whyItMatters="No vendor lock-in. You always own your professional data."
            />
            <FeatureCard
              icon={Trash2}
              title="Complete Account Deletion"
              description={`One-click cascade delete \u2014 profile, portfolios, demos, resumes, storage files, subscriptions, memberships, and referrals. Every trace, gone.`}
              whyItMatters={`GDPR-ready. When you say delete, we mean delete \u2014 no hidden data retention.`}
            />
            <FeatureCard
              icon={Smartphone}
              title="Fully Responsive"
              description="Every page works flawlessly on mobile, tablet, and desktop. Dashboard, public portfolio, org page. Manage your career from your phone."
              whyItMatters="Update your portfolio from anywhere. Recruiters viewing on mobile see the same polished experience."
            />
          </FeatureGroup>
        </div>
      </section>

      {/* ── Mid-page CTA ── */}
      <section className="relative overflow-hidden border-b py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_50%,hsl(var(--primary)/0.07),transparent)]" />
        <div className="relative mx-auto max-w-3xl px-4 text-center" data-animate>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            You&apos;ve seen the features
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Your portfolio could be live in 5 minutes.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Every feature you just read is included in the free trial. No credit card,
            no setup fees, no gotchas.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              Start Building Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Compare plans &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* For Teams */}
      <section id="for-teams" className="border-b bg-muted/30 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeader
            tag="Built for teams"
            title={
              <>
                Individual credibility is powerful.
                <br />
                <span className="text-primary">
                  Collective credibility is a competitive weapon.
                </span>
              </>
            }
            subtitle={`mivitae Team gives groups a shared proof-of-work platform \u2014 a branded org page, shared demo library, and team analytics. Not just "we\u2019re great" \u2014 here\u2019s the evidence.`}
          />

          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            <div data-animate data-delay="0">
              <UseCaseCard
                icon={Building2}
                title="Recruiting & HR Agencies"
                tagline="Stop sending resumes. Send proof."
                description={`Your candidates\u2019 skills, verified and live \u2014 not buried in a PDF inbox. Send hiring managers a curated talent page where every candidate\u2019s work is one click away. One closed placement covers months of Team.`}
              />
            </div>
            <div data-animate data-delay="150">
              <UseCaseCard
                icon={GraduationCap}
                title="Bootcamps & University Programs"
                tagline="Your placement rate, made visible."
                description={`Give every cohort a branded showcase page. Hiring partners don\u2019t read placement statistics \u2014 they click through portfolios. Turn your program\u2019s outcomes into a living credential that sells itself.`}
              />
            </div>
            <div data-animate data-delay="300">
              <UseCaseCard
                icon={Users}
                title="Student Clubs & Project Collectives"
                tagline="Shared work, individual credit."
                description="Built something together? Team members link their individual portfolios to the same shared demo cards. The robotics club, the open source collective, the hackathon team. Everyone gets credit, one cohesive story."
              />
            </div>
            <div data-animate data-delay="450">
              <UseCaseCard
                icon={Briefcase}
                title="Professional Services & Agencies"
                tagline="Win clients before the first call."
                description={`B2B clients ask one question: who will actually be working on this, and can they do it? Your team org page answers that directly \u2014 each member\u2019s individual portfolio, shared demos of real work, one professional URL to close deals.`}
              />
            </div>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <TeamFeatureCard
              title="Branded Org Page"
              description={`mivitae.org/org/your-team \u2014 logo, description, social links, and a member grid linking to every individual portfolio.`}
            />
            <TeamFeatureCard
              title="Team Theme Studio"
              description={`Separate theming for your org page \u2014 accent colors, background styles, card effects, hover animations, and custom taglines.`}
            />
            <TeamFeatureCard
              title="Your Work Is Yours"
              description={`If a team account lapses, every member\u2019s personal portfolio stays live. Your work is never held hostage.`}
            />
          </div>
        </div>
      </section>

      {/* The Cost of Waiting */}
      <section className="border-b py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            {"What\u2019s it costing you to "}
            <span className="text-destructive">not</span>
            {" have a portfolio?"}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            While you wait, other candidates are sharing living proof of their work — in every industry.
          </p>
          <div className="mx-auto mt-10 grid gap-4 sm:grid-cols-3">
            <div data-animate data-delay="0">
              <CostCard
                stat="72%"
                description={`of recruiters say they review portfolios over r\u00e9sum\u00e9s when both are available`}
              />
            </div>
            <div data-animate data-delay="150">
              <CostCard
                stat="3.2x"
                description="higher response rate for candidates with interactive work samples vs. PDF-only applications"
              />
            </div>
            <div data-animate data-delay="300">
              <CostCard
                stat="Free"
                description={`to start \u2014 because proving your worth should never cost you. A nonprofit mission for the 99% who deserve more than a PDF.`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeader
            tag="Simple pricing"
            title="Invest in your career, not in complexity"
            subtitle="Start free for 30 days. No credit card. Cancel anytime."
          />

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div data-animate data-delay="0">
              <PricingCard
                name="Free Trial"
                price="$0"
                period="for 30 days"
                description="Everything you need to try mivitae. No commitment."
                features={[
                  "Full feature access for 30 days",
                  "1 portfolio",
                  "3 interactive demo cards",
                  `AI r\u00e9sum\u00e9 parsing (2 parses/day)`,
                  "AI demo generation",
                  "Public profile link",
                  "5 work history sections",
                  "3 education entries",
                ]}
                cta="Get Started Free"
                href="/sign-up"
              />
            </div>
            <div data-animate data-delay="150">
              <PricingCard
                name="Pro"
                price="$12"
                period="/month"
                description="For professionals serious about their career visibility."
                features={[
                  "Unlimited demo cards",
                  "Unlimited portfolios",
                  "Analytics dashboard & referrer tracking",
                  "Theme Studio with 12 presets + custom CSS",
                  "50 work history sections",
                  "20 education entries",
                  `AI r\u00e9sum\u00e9 parsing (10 parses/day)`,
                  "Profile strength scoring",
                  "Custom profile slug",
                  "Priority support",
                ]}
                cta="Start Free Trial"
                href="/sign-up"
                featured
              />
            </div>
            <div data-animate data-delay="300">
              <PricingCard
                name="Team"
                price="$49"
                period="/month"
                description="For agencies, programs, and teams that sell collectively."
                features={[
                  "5 team member seats",
                  "Branded org page (mivitae.org/org/name)",
                  "Team Theme Studio",
                  "Shared demo library",
                  "Team analytics dashboard",
                  "Individual Pro portfolios for all members",
                  "50 demos per member",
                  "Admin seat transfer",
                  "Everything in Pro",
                ]}
                cta="Start Team Trial"
                href="/sign-up"
              />
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground">
            All plans include a 30-day free trial. Cancel anytime. Individual
            portfolios remain live regardless of plan status.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b bg-muted/30 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeader
            title="What people are saying"
            subtitle={`Professionals and teams who switched from static r\u00e9sum\u00e9s to living portfolios.`}
          />
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <div data-animate data-delay="0">
              <TestimonialCard
                quote="I uploaded my resume on my lunch break and had a polished portfolio by the time I got home. Three recruiters reached out that same week."
                name="Marcus T."
                role="Operations Manager"
              />
            </div>
            <div data-animate data-delay="150">
              <TestimonialCard
                quote="We replaced our agency's talent spreadsheet with mivitae Team. Client response rate to candidate submissions jumped from 15% to 40%."
                name="Sarah K."
                role="Recruiting Director, TalentBridge Partners"
              />
            </div>
            <div data-animate data-delay="300">
              <TestimonialCard
                quote="The AI demo builder is unreal. I described my patient outcomes improvement project and it generated an interactive dashboard that looks like I hired a designer. Landed my biggest role through that one link."
                name="Priya R."
                role="Clinical Nurse Leader"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b py-24">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-3xl font-bold">
            Frequently asked questions
          </h2>
          <div className="mt-12 space-y-4" data-animate>
            <FaqItem
              question="Is the 30-day trial really free?"
              answer="Yes. No credit card required. You get full access to all features for 30 days. After that, you can continue on the free plan with limited features, or upgrade to Pro or Team."
            />
            <FaqItem
              question="What happens to my portfolio if I cancel?"
              answer="Your public portfolio at mivitae.org/u/yourname stays live on the free plan forever. You keep your profile, work history, and education. Pro features like unlimited demos, analytics, and Theme Studio are paused until you re-subscribe."
            />
            <FaqItem
              question={`How does the AI r\u00e9sum\u00e9 parsing work?`}
              answer={`Upload a PDF and our AI reads the document directly (no sketchy OCR) \u2014 extracting work history, skills, education, and achievements into structured data. You review and edit everything before publishing. Nothing goes live without your approval.`}
            />
            <FaqItem
              question="What are demo cards?"
              answer={`Demo cards are interactive, embeddable proof-of-work snippets you attach to each role in your portfolio. Think animated dashboards, impact visualizations, process flows, or case studies \u2014 live evidence of your skills, not just descriptions.`}
            />
            <FaqItem
              question="Do I need coding skills?"
              answer="Not at all. mivitae is built for every profession — nurses, teachers, marketers, accountants, engineers, and everyone in between. The AI demo builder creates interactive demos from a simple questionnaire. No technical skills required."
            />
            <FaqItem
              question="Can I use this alongside LinkedIn?"
              answer={`Absolutely. mivitae complements LinkedIn \u2014 think of it as your interactive proof layer. Link to it from LinkedIn, include it in job applications, or share it directly. Your portfolio shows what your r\u00e9sum\u00e9 only tells.`}
            />
            <FaqItem
              question="How does Team billing work?"
              answer="Team ($49/mo) includes 5 seats. Every team member gets their own individual Pro portfolio plus access to the shared org page, team analytics, and shared demo library. Need more seats? Contact us."
            />
            <FaqItem
              question="Can I export my data or delete my account?"
              answer={`Yes to both. Full data export is available anytime. Account deletion is a complete cascade \u2014 profile, portfolios, demos, resumes, storage files, subscriptions, memberships, and referrals are all permanently removed. GDPR-ready.`}
            />
            <FaqItem
              question="Is my portfolio SEO-friendly?"
              answer="Yes. Every portfolio is server-rendered with JSON-LD structured data, Open Graph metadata, Twitter Cards, and included in our dynamic sitemap. Search engines index your full content."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden py-32">
        {/* Layered background */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_60%,hsl(var(--primary)/0.13),transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.12)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.12)_1px,transparent_1px)] bg-size-[48px_48px]" />
        {/* Ambient orbs */}
        <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-primary/12 blur-3xl animate-orb-2" />
        <div className="pointer-events-none absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-orb-1" />

        <div className="relative mx-auto max-w-3xl px-4 text-center" data-animate>
          {/* Live recruiting signal */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            A nonprofit on a mission for the 99%
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Stop telling.
            <br />
            <span className="hero-gradient-text">Start showing.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Your experience deserves more than a black-and-white piece of paper.
            Give the world something worth remembering.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center rounded-xl bg-primary px-9 py-4 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-0.5"
            >
              Build Your Portfolio Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center rounded-xl border px-9 py-4 text-base font-medium transition-colors hover:bg-muted"
            >
              View pricing
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-primary" />
              Free for 30 days
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-primary" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-primary" />
              Portfolio stays live forever
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

/* Reusable Components */

function SectionHeader({
  tag,
  title,
  subtitle,
}: {
  tag?: string;
  title: React.ReactNode;
  subtitle: string;
}) {
  return (
    <div className="text-center">
      {tag && (
        <div className="mb-4 inline-flex items-center rounded-full border bg-background px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
          {tag}
        </div>
      )}
      <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function StepCard({
  step,
  icon: Icon,
  title,
  description,
}: {
  step: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Step {step}
      </div>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function ProblemCard({
  icon: Icon,
  problem,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  problem: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border bg-background p-6 text-left">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-3 text-sm font-bold">{problem}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {detail}
      </p>
    </div>
  );
}

function FeatureGroup({
  title,
  children,
  className = "",
  ...divProps
}: HTMLAttributes<HTMLDivElement> & {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className} {...divProps}>
      <h3 className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
        <span className="h-px w-6 bg-primary" />
        {title}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  whyItMatters,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  whyItMatters: string;
}) {
  return (
    <div className="group rounded-2xl border bg-background p-6 transition-all hover:border-primary/30 hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="mt-4 text-sm font-bold">{title}</h4>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <p className="mt-3 border-t pt-3 text-xs font-medium text-primary">
        {`\u2192 ${whyItMatters}`}
      </p>
    </div>
  );
}

function UseCaseCard({
  icon: Icon,
  title,
  tagline,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tagline: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border bg-background p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm font-medium text-primary">{tagline}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function TeamFeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-background p-6 text-center">
      <h4 className="text-sm font-bold">{title}</h4>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function CostCard({
  stat,
  description,
}: {
  stat: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border bg-background p-6">
      <span className="text-3xl font-extrabold text-primary">{stat}</span>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  href,
  featured,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border p-8 ${
        featured ? "border-primary shadow-lg ring-1 ring-primary/20" : ""
      }`}
    >
      {featured && (
        <div className="mb-4 inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Most Popular
        </div>
      )}
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-sm text-muted-foreground">{period}</span>
      </div>
      <ul className="mt-6 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-8 block rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-colors ${
          featured
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "border hover:bg-muted"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

function TestimonialCard({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border bg-background p-8">
      <div className="mb-4 flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
        ))}
      </div>
      <blockquote className="text-sm leading-relaxed text-muted-foreground">
        {`\u201C${quote}\u201D`}
      </blockquote>
      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group rounded-xl border bg-background">
      <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
        {question}
        <span className="ml-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="px-6 pb-4 text-sm leading-relaxed text-muted-foreground">
        {answer}
      </div>
    </details>
  );
}
