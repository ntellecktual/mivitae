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
        name: "Technical Presentation",
        category: "general",
        description:
          "Slide-style walkthrough of a technical concept, architecture decision, or project retrospective.",
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
    ];

    for (const t of templates) {
      await ctx.db.insert("demoTemplates", t);
    }

    return { seeded: templates.length };
  },
});
