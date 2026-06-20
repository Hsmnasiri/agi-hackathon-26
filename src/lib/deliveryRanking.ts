import type { ReferralDeliveryOption } from "@/types";

/**
 * Ranks delivery options by a composite score that reflects real-world likelihood
 * of resulting in accepted care — not just submission speed.
 * Sets recommended=true on the top result.
 */
export function rankDeliveryOptions(
  options: ReferralDeliveryOption[]
): ReferralDeliveryOption[] {
  const scored = options.map((o) => ({ option: o, score: computeScore(o) }));
  scored.sort((a, b) => b.score - a.score);

  return scored.map(({ option }, i) => ({
    ...option,
    recommended: i === 0 && option.status !== "unavailable",
  }));
}

function computeScore(o: ReferralDeliveryOption): number {
  if (o.status === "unavailable") return -999;

  let score = 0;

  // Integration availability
  if (o.status === "connected") score += 40;
  else if (o.status === "available_manual") score += 15;

  // Acceptance probability
  if (o.acceptanceProbability === "high") score += 20;
  else if (o.acceptanceProbability === "medium") score += 10;

  // Clinical fit & readiness
  score += (o.clinicalFitScore / 100) * 15;
  score += (o.readinessScore / 100) * 15;

  // Risk penalty
  if (o.riskLevel === "high") score -= 20;
  else if (o.riskLevel === "medium") score -= 10;

  // Fax penalty (no tracking, high manual failure rate)
  if (o.methodType === "fax") score -= 10;

  // Missing documents penalty
  const missingCount = o.requiredDocuments.filter((d) => d.status === "missing").length;
  if (missingCount > 0) score -= missingCount * 5;

  return score;
}
