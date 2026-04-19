/**
 * Skill Proficiency Calculation Utilities
 *
 * Computes display-friendly proficiency percentages from parsed resume data
 * using a logarithmic curve that saturates near 96% at 10+ years.
 */

/**
 * Calculates a proficiency percentage (0-100) from years of experience.
 * Uses a logarithmic curve: f(x) = min(98, 35 + 63 * (1 - e^(-0.3x)))
 *
 * Approximate outputs:
 *   1yr ≈ 51%  |  2yr ≈ 62%  |  3yr ≈ 70%
 *   5yr ≈ 82%  |  7yr ≈ 89%  |  10yr ≈ 94%
 */
export function calculateProficiency(
  yearsOfExperience?: number,
  manualProficiency?: number // 1-5 scale
): number {
  if (yearsOfExperience && yearsOfExperience > 0) {
    const raw = 35 + 63 * (1 - Math.exp(-0.3 * yearsOfExperience));
    return Math.min(98, Math.round(raw));
  }

  if (manualProficiency && manualProficiency >= 1 && manualProficiency <= 5) {
    const map: Record<number, number> = { 1: 30, 2: 50, 3: 65, 4: 80, 5: 92 };
    return map[manualProficiency] ?? 50;
  }

  return 50;
}

/**
 * Formats years of experience for display.
 */
export function formatYears(years?: number): string {
  if (!years || years <= 0) return "";
  if (years >= 10) return "10+ yrs";
  return `${years}+ yr${years > 1 ? "s" : ""}`;
}

/**
 * Computes aggregate portfolio stats for the overview section.
 */
export function computePortfolioStats(
  skills: Array<{ yearsOfExperience?: number }>,
  sections: Array<{ startDate: string; endDate?: string }>,
  demoCount: number,
  certCount: number
) {
  const totalTechnologies = skills.length;

  let yearsExperience = 0;
  if (sections.length > 0) {
    const years = sections
      .map((s) => {
        const parts = s.startDate.split(/[-/]/);
        return parseInt(parts[parts.length - 1]) || parseInt(parts[0]) || 0;
      })
      .filter((y) => y > 1900);
    if (years.length > 0) {
      yearsExperience = new Date().getFullYear() - Math.min(...years);
    }
  }

  const maxSkillYears = Math.max(
    0,
    ...skills.map((s) => s.yearsOfExperience ?? 0)
  );
  yearsExperience = Math.max(yearsExperience, maxSkillYears);

  return { totalTechnologies, yearsExperience, demoCount, certCount };
}

/**
 * Generates a deterministic gradient from a string (demo title).
 */
export function getDemoGradient(title: string, accent: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash + title.charCodeAt(i)) | 0;
  }
  const angle = Math.abs(hash) % 360;
  // Create a secondary color by adjusting opacity
  const r = parseInt(accent.slice(1, 3), 16);
  const g = parseInt(accent.slice(3, 5), 16);
  const b = parseInt(accent.slice(5, 7), 16);
  const secondary = `rgba(${Math.min(255, r + 40)}, ${Math.min(255, g + 20)}, ${Math.min(255, b + 60)}, 0.6)`;
  return `linear-gradient(${angle}deg, ${accent}, ${secondary})`;
}
