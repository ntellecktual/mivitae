import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Run once via the Convex dashboard (Functions → seedDemoTemplates → Run)
 * or by calling: npx convex run seedDemoTemplates:seed
 */
export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("demoTemplates").take(1);
    if (existing.length > 0) {
      throw new Error("Demo templates already seeded — delete them first to re-seed.");
    }

    const templates = [
      // ── Backend / API ─────────────────────────────────────────────────
      {
        name: "REST API Design",
        category: "backend",
        description:
          "Showcase a well-structured REST API with endpoints, request/response examples, and error handling patterns.",
        defaultContent: JSON.stringify({
          type: "code",
          language: "typescript",
          sections: [
            { title: "Endpoints", content: "" },
            { title: "Request / Response", content: "" },
            { title: "Error Handling", content: "" },
          ],
        }),
        isActive: true,
      },
      {
        name: "GraphQL Schema",
        category: "backend",
        description:
          "Present a GraphQL schema with types, queries, mutations, and resolver highlights.",
        defaultContent: JSON.stringify({
          type: "code",
          language: "graphql",
          sections: [
            { title: "Schema", content: "" },
            { title: "Resolvers", content: "" },
          ],
        }),
        isActive: true,
      },
      {
        name: "Microservices Architecture",
        category: "backend",
        description:
          "Interactive diagram of a microservices system showing service boundaries, communication patterns, and data flow.",
        defaultContent: JSON.stringify({
          type: "architecture",
          sections: [
            { title: "System Overview", content: "" },
            { title: "Service Details", content: "" },
          ],
        }),
        isActive: true,
      },

      // ── Frontend ──────────────────────────────────────────────────────
      {
        name: "React Component Library",
        category: "frontend",
        description:
          "A curated showcase of reusable React components with props, variants, and usage examples.",
        defaultContent: JSON.stringify({
          type: "code",
          language: "tsx",
          sections: [
            { title: "Components", content: "" },
            { title: "Usage", content: "" },
          ],
        }),
        isActive: true,
      },
      {
        name: "Performance Optimization",
        category: "frontend",
        description:
          "Before/after metrics showing Lighthouse scores, bundle size reductions, and rendering improvements.",
        defaultContent: JSON.stringify({
          type: "case-study",
          sections: [
            { title: "Problem", content: "" },
            { title: "Solution", content: "" },
            { title: "Results", content: "" },
          ],
        }),
        isActive: true,
      },
      {
        name: "Responsive Design System",
        category: "frontend",
        description:
          "A design system showcasing tokens, breakpoints, and adaptive layouts across devices.",
        defaultContent: JSON.stringify({
          type: "case-study",
          sections: [
            { title: "Tokens & Variables", content: "" },
            { title: "Layout Patterns", content: "" },
          ],
        }),
        isActive: true,
      },

      // ── Machine Learning ──────────────────────────────────────────────
      {
        name: "ML Pipeline",
        category: "ml",
        description:
          "End-to-end machine learning pipeline from data ingestion through model deployment.",
        defaultContent: JSON.stringify({
          type: "architecture",
          sections: [
            { title: "Pipeline Overview", content: "" },
            { title: "Model Details", content: "" },
            { title: "Metrics", content: "" },
          ],
        }),
        isActive: true,
      },
      {
        name: "Model Training Dashboard",
        category: "ml",
        description:
          "Training curves, hyperparameter comparisons, and evaluation metrics visualization.",
        defaultContent: JSON.stringify({
          type: "chart",
          sections: [
            { title: "Training Metrics", content: "" },
            { title: "Evaluation", content: "" },
          ],
        }),
        isActive: true,
      },

      // ── Data Engineering ──────────────────────────────────────────────
      {
        name: "ETL Pipeline",
        category: "data",
        description:
          "Extract-Transform-Load pipeline diagram with data quality checks and scheduling.",
        defaultContent: JSON.stringify({
          type: "architecture",
          sections: [
            { title: "Pipeline Flow", content: "" },
            { title: "Transformations", content: "" },
          ],
        }),
        isActive: true,
      },
      {
        name: "Data Warehouse Design",
        category: "data",
        description:
          "Star/snowflake schema design with fact and dimension tables, query patterns.",
        defaultContent: JSON.stringify({
          type: "architecture",
          sections: [
            { title: "Schema", content: "" },
            { title: "Query Patterns", content: "" },
          ],
        }),
        isActive: true,
      },

      // ── DevOps ────────────────────────────────────────────────────────
      {
        name: "CI/CD Pipeline",
        category: "devops",
        description:
          "Continuous integration and deployment pipeline with testing stages, deployment strategies, and rollback procedures.",
        defaultContent: JSON.stringify({
          type: "architecture",
          sections: [
            { title: "Pipeline Stages", content: "" },
            { title: "Deployment Strategy", content: "" },
          ],
        }),
        isActive: true,
      },
      {
        name: "Infrastructure as Code",
        category: "devops",
        description:
          "Terraform/Pulumi infrastructure definitions with resource topology and state management.",
        defaultContent: JSON.stringify({
          type: "code",
          language: "hcl",
          sections: [
            { title: "Resources", content: "" },
            { title: "Modules", content: "" },
          ],
        }),
        isActive: true,
      },

      // ── General / Project ─────────────────────────────────────────────
      {
        name: "Project Case Study",
        category: "general",
        description:
          "A structured write-up covering problem, approach, implementation, and outcome of a project.",
        defaultContent: JSON.stringify({
          type: "case-study",
          sections: [
            { title: "Problem", content: "" },
            { title: "Approach", content: "" },
            { title: "Implementation", content: "" },
            { title: "Outcome", content: "" },
          ],
        }),
        isActive: true,
      },
      {
        name: "Professional Presentation",
        category: "general",
        description:
          "Slide-style walkthrough of a concept, strategic decision, or project retrospective.",
        defaultContent: JSON.stringify({
          type: "slideshow",
          sections: [
            { title: "Slide 1", content: "" },
            { title: "Slide 2", content: "" },
            { title: "Slide 3", content: "" },
          ],
        }),
        isActive: true,
      },

      // ── Sales & Business Development ──────────────────────────────────
      {
        name: "Sales Pipeline Dashboard",
        category: "sales",
        description:
          "Interactive pipeline visualization showing deal stages, conversion rates, and revenue impact.",
        defaultContent: JSON.stringify({
          type: "dashboard",
          sections: [
            { title: "Pipeline Overview", content: "" },
            { title: "Conversion Metrics", content: "" },
            { title: "Revenue Impact", content: "" },
          ],
        }),
        isActive: true,
      },
      {
        name: "Account Growth Strategy",
        category: "sales",
        description:
          "Case study showing how key accounts were grown with measurable revenue outcomes.",
        defaultContent: JSON.stringify({
          type: "case-study",
          sections: [
            { title: "Account Context", content: "" },
            { title: "Strategy", content: "" },
            { title: "Results", content: "" },
          ],
        }),
        isActive: true,
      },

      // ── Marketing & Communications ────────────────────────────────────
      {
        name: "Marketing Campaign Results",
        category: "marketing",
        description:
          "Campaign performance dashboard showing reach, engagement, conversions, and ROI.",
        defaultContent: JSON.stringify({
          type: "dashboard",
          sections: [
            { title: "Campaign Overview", content: "" },
            { title: "Channel Performance", content: "" },
            { title: "ROI Analysis", content: "" },
          ],
        }),
        isActive: true,
      },
      {
        name: "Brand Strategy Showcase",
        category: "marketing",
        description:
          "Visual walkthrough of a brand strategy, positioning, and creative direction.",
        defaultContent: JSON.stringify({
          type: "slideshow",
          sections: [
            { title: "Brand Audit", content: "" },
            { title: "Strategy & Positioning", content: "" },
            { title: "Creative Direction", content: "" },
          ],
        }),
        isActive: true,
      },

      // ── Finance & Accounting ──────────────────────────────────────────
      {
        name: "Financial Analysis Dashboard",
        category: "finance",
        description:
          "Interactive financial metrics, variance analysis, and forecasting visualizations.",
        defaultContent: JSON.stringify({
          type: "dashboard",
          sections: [
            { title: "Key Financial Metrics", content: "" },
            { title: "Variance Analysis", content: "" },
            { title: "Forecast", content: "" },
          ],
        }),
        isActive: true,
      },
      {
        name: "Budget Optimization Case Study",
        category: "finance",
        description:
          "Before/after analysis showing cost reductions, savings realized, and process improvements.",
        defaultContent: JSON.stringify({
          type: "case-study",
          sections: [
            { title: "Problem", content: "" },
            { title: "Approach", content: "" },
            { title: "Savings & Impact", content: "" },
          ],
        }),
        isActive: true,
      },

      // ── Operations & Supply Chain ─────────────────────────────────────
      {
        name: "Process Improvement Timeline",
        category: "operations",
        description:
          "Visual timeline of operational improvements with before/after metrics and efficiency gains.",
        defaultContent: JSON.stringify({
          type: "case-study",
          sections: [
            { title: "Initial State", content: "" },
            { title: "Improvements", content: "" },
            { title: "Results", content: "" },
          ],
        }),
        isActive: true,
      },
      {
        name: "Supply Chain Dashboard",
        category: "operations",
        description:
          "Interactive supply chain visualization showing logistics, inventory, and delivery performance.",
        defaultContent: JSON.stringify({
          type: "dashboard",
          sections: [
            { title: "Supply Chain Overview", content: "" },
            { title: "Performance Metrics", content: "" },
          ],
        }),
        isActive: true,
      },

      // ── Human Resources & People ──────────────────────────────────────
      {
        name: "HR Program Impact",
        category: "hr",
        description:
          "Showcase of an HR initiative (onboarding, DEI, retention) with measurable outcomes.",
        defaultContent: JSON.stringify({
          type: "case-study",
          sections: [
            { title: "Program Design", content: "" },
            { title: "Implementation", content: "" },
            { title: "Outcomes", content: "" },
          ],
        }),
        isActive: true,
      },
      {
        name: "Talent Acquisition Dashboard",
        category: "hr",
        description:
          "Recruiting metrics dashboard showing time-to-hire, source effectiveness, and diversity metrics.",
        defaultContent: JSON.stringify({
          type: "dashboard",
          sections: [
            { title: "Hiring Metrics", content: "" },
            { title: "Source Analysis", content: "" },
            { title: "Diversity & Inclusion", content: "" },
          ],
        }),
        isActive: true,
      },

      // ── Project & Product Management ──────────────────────────────────
      {
        name: "Product Launch Case Study",
        category: "pm",
        description:
          "End-to-end product or project launch story from planning to delivery with measurable results.",
        defaultContent: JSON.stringify({
          type: "case-study",
          sections: [
            { title: "Problem & Vision", content: "" },
            { title: "Execution", content: "" },
            { title: "Launch Results", content: "" },
          ],
        }),
        isActive: true,
      },
      {
        name: "Project Delivery Dashboard",
        category: "pm",
        description:
          "Interactive project metrics showing milestones, budget tracking, and team velocity.",
        defaultContent: JSON.stringify({
          type: "dashboard",
          sections: [
            { title: "Project Timeline", content: "" },
            { title: "Budget & Resources", content: "" },
            { title: "Delivery Metrics", content: "" },
          ],
        }),
        isActive: true,
      },

      // ── Healthcare & Life Sciences ────────────────────────────────────
      {
        name: "Patient Outcomes Dashboard",
        category: "healthcare",
        description:
          "Clinical outcomes visualization showing patient care improvements, quality metrics, and safety data.",
        defaultContent: JSON.stringify({
          type: "dashboard",
          sections: [
            { title: "Patient Outcomes", content: "" },
            { title: "Quality Metrics", content: "" },
            { title: "Safety Indicators", content: "" },
          ],
        }),
        isActive: true,
      },
      {
        name: "Clinical Process Improvement",
        category: "healthcare",
        description:
          "Before/after analysis of a clinical workflow, showing efficiency gains and patient satisfaction.",
        defaultContent: JSON.stringify({
          type: "case-study",
          sections: [
            { title: "Initial Workflow", content: "" },
            { title: "Interventions", content: "" },
            { title: "Outcomes & Impact", content: "" },
          ],
        }),
        isActive: true,
      },

      // ── Education & Training ──────────────────────────────────────────
      {
        name: "Curriculum Design Showcase",
        category: "education",
        description:
          "Visual overview of a curriculum, training program, or educational initiative with student outcomes.",
        defaultContent: JSON.stringify({
          type: "slideshow",
          sections: [
            { title: "Program Design", content: "" },
            { title: "Learning Outcomes", content: "" },
            { title: "Student Impact", content: "" },
          ],
        }),
        isActive: true,
      },
      {
        name: "Student Achievement Dashboard",
        category: "education",
        description:
          "Interactive metrics showing student performance, engagement, and program effectiveness.",
        defaultContent: JSON.stringify({
          type: "dashboard",
          sections: [
            { title: "Performance Metrics", content: "" },
            { title: "Engagement Data", content: "" },
            { title: "Program Effectiveness", content: "" },
          ],
        }),
        isActive: true,
      },

      // ── Legal & Compliance ────────────────────────────────────────────
      {
        name: "Compliance Program Overview",
        category: "legal",
        description:
          "Visualization of a compliance or regulatory program showing risk management and audit results.",
        defaultContent: JSON.stringify({
          type: "case-study",
          sections: [
            { title: "Regulatory Landscape", content: "" },
            { title: "Program Implementation", content: "" },
            { title: "Audit Results", content: "" },
          ],
        }),
        isActive: true,
      },

      // ── Customer Success & Support ────────────────────────────────────
      {
        name: "Customer Success Metrics",
        category: "support",
        description:
          "Dashboard showing customer satisfaction, retention, NPS scores, and support resolution metrics.",
        defaultContent: JSON.stringify({
          type: "dashboard",
          sections: [
            { title: "Satisfaction Scores", content: "" },
            { title: "Retention & Churn", content: "" },
            { title: "Support Metrics", content: "" },
          ],
        }),
        isActive: true,
      },

      // ── Design & Creative ─────────────────────────────────────────────
      {
        name: "Design Portfolio Gallery",
        category: "design",
        description:
          "Visual gallery showcasing design work with project context, process, and client outcomes.",
        defaultContent: JSON.stringify({
          type: "case-study",
          sections: [
            { title: "Project Brief", content: "" },
            { title: "Design Process", content: "" },
            { title: "Final Deliverables", content: "" },
          ],
        }),
        isActive: true,
      },
      {
        name: "UX Research Case Study",
        category: "design",
        description:
          "User research findings with methodology, insights, and design recommendations.",
        defaultContent: JSON.stringify({
          type: "case-study",
          sections: [
            { title: "Research Methodology", content: "" },
            { title: "Key Insights", content: "" },
            { title: "Recommendations", content: "" },
          ],
        }),
        isActive: true,
      },

      // ── Construction & Trades ─────────────────────────────────────────
      {
        name: "Project Completion Portfolio",
        category: "construction",
        description:
          "Visual portfolio of completed construction or trade projects with scope, timeline, and budget metrics.",
        defaultContent: JSON.stringify({
          type: "case-study",
          sections: [
            { title: "Project Scope", content: "" },
            { title: "Execution Timeline", content: "" },
            { title: "Budget & Outcomes", content: "" },
          ],
        }),
        isActive: true,
      },

      // ── Retail & E-Commerce ───────────────────────────────────────────
      {
        name: "Store Performance Dashboard",
        category: "retail",
        description:
          "Retail performance metrics including sales growth, conversion rates, and inventory management.",
        defaultContent: JSON.stringify({
          type: "dashboard",
          sections: [
            { title: "Sales Overview", content: "" },
            { title: "Conversion Metrics", content: "" },
            { title: "Inventory Management", content: "" },
          ],
        }),
        isActive: true,
      },

      // ── Nonprofit & Social Impact ─────────────────────────────────────
      {
        name: "Impact Report Dashboard",
        category: "nonprofit",
        description:
          "Interactive visualization of program impact, beneficiary outcomes, and fund allocation.",
        defaultContent: JSON.stringify({
          type: "dashboard",
          sections: [
            { title: "Mission Impact", content: "" },
            { title: "Beneficiary Outcomes", content: "" },
            { title: "Fund Allocation", content: "" },
          ],
        }),
        isActive: true,
      },

      // ── Real Estate & Property ────────────────────────────────────────
      {
        name: "Property Portfolio Showcase",
        category: "realestate",
        description:
          "Visual showcase of managed or sold properties with market analysis and transaction outcomes.",
        defaultContent: JSON.stringify({
          type: "case-study",
          sections: [
            { title: "Portfolio Overview", content: "" },
            { title: "Market Analysis", content: "" },
            { title: "Transaction Results", content: "" },
          ],
        }),
        isActive: true,
      },

      // ── Media & Entertainment ─────────────────────────────────────────
      {
        name: "Content Performance Dashboard",
        category: "media",
        description:
          "Analytics dashboard showing audience reach, engagement metrics, and content performance.",
        defaultContent: JSON.stringify({
          type: "dashboard",
          sections: [
            { title: "Audience Reach", content: "" },
            { title: "Engagement Metrics", content: "" },
            { title: "Content Performance", content: "" },
          ],
        }),
        isActive: true,
      },
    ];

    for (const t of templates) {
      await ctx.db.insert("demoTemplates", t);
    }

    return { seeded: templates.length };
  },
});
