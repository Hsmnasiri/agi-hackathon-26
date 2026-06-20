import type {
  AcceptanceProbability,
  MatchFactor,
  Provider,
  RankedProvider,
} from "@/types";
import { clamp } from "./format";

/**
 * Referral Match Score
 * --------------------
 * The differentiator: we rank on *time-to-accepted-care* (wait adjusted by
 * rejection risk + readiness), not raw wait time. Every factor is exposed so the
 * UI can render a transparent "why" — never a black-box number.
 */
export const SCORE_WEIGHTS = {
  clinicalFit: 0.3,
  acceptanceProbability: 0.25,
  timeToAcceptedCare: 0.2,
  patientFeasibility: 0.1,
  referralReadiness: 0.1,
  continuity: 0.05,
} as const;

const ACCEPTANCE_VALUE: Record<AcceptanceProbability, number> = {
  high: 92,
  medium: 68,
  low: 40,
};

const ACCEPTANCE_DELAY_RISK: Record<AcceptanceProbability, number> = {
  high: 1.05,
  medium: 1.35,
  low: 1.8,
};

/**
 * Time-to-accepted-care = raw triage wait inflated by:
 *  - acceptance risk (low acceptance => more bounce-backs)
 *  - missing readiness (incomplete packages get parked before triage)
 */
export function timeToAcceptedCare(provider: Provider, readiness: number): number {
  const riskMultiplier = ACCEPTANCE_DELAY_RISK[provider.acceptanceProbability];
  // Up to ~3 extra weeks when readiness is poor (real wait, not a queue position).
  const readinessPenaltyWeeks = ((100 - clamp(readiness)) / 100) * 3;
  return provider.rawWaitWeeks * riskMultiplier + readinessPenaltyWeeks;
}

function feasibilityScore(provider: Provider): number {
  let score = 60;
  if (provider.modality === "virtual") score = 95;
  else {
    if (provider.distanceKm <= 5) score += 25;
    else if (provider.distanceKm <= 10) score += 12;
    else score -= 8;
    if (provider.transitAccessible) score += 12;
  }
  return clamp(score);
}

/** Normalize a time-to-care (weeks) into a 0-100 "sooner is better" score. */
function timeScore(weeks: number): number {
  // 0 wk -> 100, ~14 wk -> ~0
  return clamp(100 - (weeks / 14) * 100);
}

function continuityScore(provider: Provider): number {
  // Freshly verified availability + virtual access ~ better continuity proxy.
  const freshness = clamp(100 - provider.availabilityVerifiedDaysAgo * 4);
  const access = provider.transitAccessible ? 80 : 60;
  return clamp(freshness * 0.6 + access * 0.4);
}

export function rankProvider(provider: Provider, readiness: number): RankedProvider {
  const ttac = timeToAcceptedCare(provider, readiness);

  const factors: MatchFactor[] = [
    {
      key: "clinicalFit",
      label: "Clinical fit",
      weight: SCORE_WEIGHTS.clinicalFit,
      raw: provider.clinicalFit,
      contribution: SCORE_WEIGHTS.clinicalFit * provider.clinicalFit,
      reason:
        provider.clinicalFit >= 88
          ? "Best subspecialty match for this condition"
          : provider.clinicalFit >= 78
            ? "Accepts this condition; not the tightest subspecialty match"
            : "Broader clinic — may redirect after triage",
    },
    {
      key: "acceptanceProbability",
      label: "Acceptance probability",
      weight: SCORE_WEIGHTS.acceptanceProbability,
      raw: ACCEPTANCE_VALUE[provider.acceptanceProbability],
      contribution:
        SCORE_WEIGHTS.acceptanceProbability *
        ACCEPTANCE_VALUE[provider.acceptanceProbability],
      reason: `${provider.acceptanceProbability[0].toUpperCase()}${provider.acceptanceProbability.slice(
        1
      )} likelihood of acceptance without bounce-back`,
    },
    {
      key: "timeToAcceptedCare",
      label: "Time-to-accepted-care",
      weight: SCORE_WEIGHTS.timeToAcceptedCare,
      raw: timeScore(ttac),
      contribution: SCORE_WEIGHTS.timeToAcceptedCare * timeScore(ttac),
      reason:
        "Realistic time to *accepted* care (wait adjusted for risk + readiness)",
    },
    {
      key: "patientFeasibility",
      label: "Patient feasibility",
      weight: SCORE_WEIGHTS.patientFeasibility,
      raw: feasibilityScore(provider),
      contribution: SCORE_WEIGHTS.patientFeasibility * feasibilityScore(provider),
      reason:
        provider.modality === "virtual"
          ? "Virtual — no travel required"
          : `${provider.distanceKm} km away${
              provider.transitAccessible ? ", transit-accessible" : ", limited transit"
            }`,
    },
    {
      key: "referralReadiness",
      label: "Referral readiness",
      weight: SCORE_WEIGHTS.referralReadiness,
      raw: clamp(readiness),
      contribution: SCORE_WEIGHTS.referralReadiness * clamp(readiness),
      reason: "Share of this clinic's required documents already satisfied",
    },
    {
      key: "continuity",
      label: "Continuity / preference",
      weight: SCORE_WEIGHTS.continuity,
      raw: continuityScore(provider),
      contribution: SCORE_WEIGHTS.continuity * continuityScore(provider),
      reason: "Availability freshness and ongoing-care fit",
    },
  ];

  const score = Math.round(factors.reduce((sum, f) => sum + f.contribution, 0));

  const reasons: string[] = [];
  const warnings: string[] = [];

  if (provider.clinicalFit >= 88) reasons.push("Best subspecialty match");
  if (provider.acceptanceProbability === "high")
    reasons.push("High acceptance probability");
  if (provider.modality === "virtual") reasons.push("Virtual — patient can attend easily");
  else if (provider.transitAccessible) reasons.push("Reachable by transit");
  if (ttac <= 2) reasons.push("Short realistic time-to-care");

  if (provider.availabilityVerifiedDaysAgo >= 7)
    warnings.push(
      `Availability last verified ${provider.availabilityVerifiedDaysAgo} days ago`
    );
  if (provider.acceptanceProbability === "medium")
    warnings.push("May redirect or request more information");
  if (!provider.transitAccessible && provider.modality !== "virtual")
    warnings.push("Limited transit access");
  if (provider.note) reasons.push(provider.note);

  return {
    provider,
    score,
    factors,
    timeToAcceptedCareWeeks: Math.round(ttac * 10) / 10,
    reasons,
    warnings,
  };
}

export function rankProviders(
  providers: Provider[],
  readiness: number
): RankedProvider[] {
  return providers
    .map((p) => rankProvider(p, readiness))
    .sort((a, b) => b.score - a.score);
}
