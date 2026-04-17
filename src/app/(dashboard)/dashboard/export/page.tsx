"use client";

import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download,
  Loader2,
  Briefcase,
  GraduationCap,
  Wrench,
  Heart,
  Globe,
  FileText as LinkedinIcon2,
  GitBranch,
  Mail,
  MapPin,
} from "lucide-react";

export default function ExportPage() {
  const profile = useQuery(api.profiles.getSelf);
  const sections = useQuery(api.portfolioSections.getSelfSections);
  const education = useQuery(api.educationEntries.getSelfEntries);
  const skills = useQuery(api.skills.getSelfSkills);
  const volunteering = useQuery(api.volunteering.getSelfEntries);

  const isLoading =
    profile === undefined ||
    sections === undefined ||
    education === undefined ||
    skills === undefined ||
    volunteering === undefined;

  const sortedSections = [...(sections ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const sortedEducation = [...(education ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const sortedSkills = [...(skills ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const sortedVolunteering = [...(volunteering ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  // Group skills by category
  const skillsByCategory = sortedSkills.reduce<Record<string, typeof sortedSkills>>(
    (acc, s) => {
      const cat = s.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(s);
      return acc;
    },
    {}
  );

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Create a profile first to export your resume.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          /* Hide everything except the resume */
          body > *:not(#resume-print) {
            display: none !important;
          }
          nav,
          aside,
          header,
          footer,
          [data-sidebar],
          .no-print {
            display: none !important;
          }
          #resume-print {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            margin: 0;
            padding: 0.5in;
            font-size: 11pt;
            line-height: 1.4;
            color: #000 !important;
            background: #fff !important;
          }
          #resume-print * {
            color: #000 !important;
            border-color: #ccc !important;
          }
          #resume-print h1 {
            font-size: 18pt;
          }
          #resume-print h2 {
            font-size: 13pt;
            border-bottom: 1px solid #000;
            padding-bottom: 2pt;
            margin-bottom: 6pt;
          }
          #resume-print h3 {
            font-size: 11pt;
          }
          @page {
            margin: 0.5in;
            size: letter;
          }
        }
      `}</style>

      {/* Dashboard controls (hidden in print) */}
      <div className="no-print mx-auto max-w-3xl space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Export Resume
            </h1>
            <p className="text-muted-foreground">
              Preview and download your resume as PDF
            </p>
          </div>
          <Button onClick={handlePrint}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Click &quot;Download PDF&quot; to open print dialog. Select &quot;Save as
          PDF&quot; as the destination.
        </p>
      </div>

      {/* Printable resume */}
      <div
        id="resume-print"
        className="mx-auto max-w-3xl space-y-5 p-6 print:max-w-none"
      >
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">
            {profile.headline || profile.slug}
          </h1>
          {profile.bio && (
            <p className="text-sm text-muted-foreground print:text-black">
              {profile.bio}
            </p>
          )}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground print:text-black">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {profile.location}
              </span>
            )}
            {profile.websiteUrl && (
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {profile.websiteUrl}
              </span>
            )}
            {profile.linkedinUrl && (
              <span className="flex items-center gap-1">
                <LinkedinIcon2 className="h-3 w-3" />
                {profile.linkedinUrl}
              </span>
            )}
            {profile.githubUrl && (
              <span className="flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                {profile.githubUrl}
              </span>
            )}
          </div>
        </div>

        <hr className="border-border" />

        {/* Work Experience */}
        {sortedSections.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Briefcase className="h-4 w-4 no-print" />
              Work Experience
            </h2>
            <div className="space-y-4">
              {sortedSections.map((s) => (
                <div key={s._id} className="space-y-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{s.role}</h3>
                      <p className="text-sm text-muted-foreground print:text-black">
                        {s.companyName}
                      </p>
                    </div>
                    <p className="whitespace-nowrap text-xs text-muted-foreground print:text-black">
                      {s.startDate}
                      {s.endDate ? ` – ${s.endDate}` : " – Present"}
                    </p>
                  </div>
                  {s.description && (
                    <p className="text-sm">{s.description}</p>
                  )}
                  {s.achievements && s.achievements.length > 0 && (
                    <ul className="ml-4 list-disc space-y-0.5 text-sm">
                      {s.achievements.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  )}
                  {s.skills && s.skills.length > 0 && (
                    <p className="text-xs text-muted-foreground print:text-black">
                      <span className="font-medium">Skills:</span>{" "}
                      {s.skills.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {sortedEducation.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <GraduationCap className="h-4 w-4 no-print" />
              Education
            </h2>
            <div className="space-y-3">
              {sortedEducation.map((e) => (
                <div key={e._id} className="space-y-0.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {e.degree}
                        {e.fieldOfStudy ? ` in ${e.fieldOfStudy}` : ""}
                      </h3>
                      <p className="text-sm text-muted-foreground print:text-black">
                        {e.institution}
                      </p>
                    </div>
                    <p className="whitespace-nowrap text-xs text-muted-foreground print:text-black">
                      {e.startYear}
                      {e.endYear ? ` – ${e.endYear}` : " – Present"}
                    </p>
                  </div>
                  {(e.gpa || e.honors) && (
                    <p className="text-xs text-muted-foreground print:text-black">
                      {e.gpa && `GPA: ${e.gpa}`}
                      {e.gpa && e.honors && " · "}
                      {e.honors && `Honors: ${e.honors}`}
                    </p>
                  )}
                  {e.relevantCoursework && (
                    <p className="text-xs">
                      <span className="font-medium">Coursework:</span>{" "}
                      {e.relevantCoursework}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {sortedSkills.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Wrench className="h-4 w-4 no-print" />
              Skills
            </h2>
            <div className="space-y-2">
              {Object.entries(skillsByCategory).map(([cat, catSkills]) => (
                <div key={cat}>
                  <p className="text-sm">
                    <span className="font-medium">{cat}:</span>{" "}
                    {catSkills.map((s) => s.name).join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Volunteering */}
        {sortedVolunteering.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Heart className="h-4 w-4 no-print" />
              Volunteering
            </h2>
            <div className="space-y-3">
              {sortedVolunteering.map((v) => (
                <div key={v._id} className="space-y-0.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{v.role}</h3>
                      <p className="text-sm text-muted-foreground print:text-black">
                        {v.organization}
                        {v.cause ? ` · ${v.cause}` : ""}
                      </p>
                    </div>
                    <p className="whitespace-nowrap text-xs text-muted-foreground print:text-black">
                      {v.startDate}
                      {v.endDate ? ` – ${v.endDate}` : " – Present"}
                    </p>
                  </div>
                  {v.description && (
                    <p className="text-sm">{v.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
