import type { FunnelStage, ImpactStat } from "@/types";

/**
 * Impact figures for the dashboard. The headline tiles use real published
 * research; the funnel/series are illustrative projections for the demo.
 * Sources are surfaced in the UI for credibility.
 */
export const IMPACT_STATS: ImpactStat[] = [
  {
    id: "leakage",
    label: "Referrals that never close the loop",
    value: "38%",
    sub: "Industry baseline — most stall between office and scheduler",
    trend: "down",
    source: "MedCity News, 2025",
  },
  {
    id: "received",
    label: "Referral notes actually received by specialists",
    value: "34%",
    sub: "PCPs send them 69% of the time — the gap is the problem",
    trend: "down",
    source: "Referral communication studies",
  },
  {
    id: "confirmation",
    label: "Physicians who never learn if the patient was seen",
    value: "25–50%",
    sub: "No closed-loop confirmation today",
    trend: "down",
    source: "Patient leakage research",
  },
  {
    id: "cost",
    label: "Annual cost of broken referrals (US)",
    value: "$150B",
    sub: "Lost revenue, repeat work, and avoidable harm",
    source: "HealthLeaders, 2025",
  },
];

/** "With Referral GPS" projections for the platform's own KPIs. */
export const PLATFORM_KPIS: ImpactStat[] = [
  {
    id: "ttac",
    label: "Median time-to-accepted-care",
    value: "−41%",
    sub: "Routing on realistic time, not raw wait",
    trend: "up",
  },
  {
    id: "first_pass",
    label: "First-pass acceptance rate",
    value: "+34 pts",
    sub: "Readiness scoring before send",
    trend: "up",
  },
  {
    id: "rework",
    label: "Avoided redirect / rework",
    value: "−52%",
    sub: "Right subspecialty the first time",
    trend: "up",
  },
  {
    id: "econsult",
    label: "Referrals avoided via eConsult",
    value: "64%",
    sub: "Unnecessary in-person visits prevented",
    trend: "up",
    source: "Champlain eConsult program",
  },
];

/** Referral survival through the pipeline, baseline vs Referral GPS. */
export const FUNNEL: FunnelStage[] = [
  { stage: "Sent", baseline: 100, withGps: 100 },
  { stage: "Received", baseline: 72, withGps: 98 },
  { stage: "Accepted", baseline: 58, withGps: 91 },
  { stage: "Scheduled", baseline: 49, withGps: 86 },
  { stage: "Seen", baseline: 41, withGps: 82 },
];

/** Wait vs realistic time-to-accepted-care by route (weeks). */
export const TIME_TO_CARE = [
  { route: "Generic referral", rawWait: 11.3, realistic: 14.8 },
  { route: "Subspecialty match", rawWait: 5.0, realistic: 5.4 },
  { route: "eConsult first", rawWait: 0.7, realistic: 0.7 },
];

/** Referral volume by specialty (last 30 days) — for a small bar/composition. */
export const VOLUME_BY_SPECIALTY = [
  { specialty: "Cardiology", referrals: 142 },
  { specialty: "Orthopaedics", referrals: 118 },
  { specialty: "Dermatology", referrals: 96 },
  { specialty: "Gastro", referrals: 74 },
  { specialty: "Neurology", referrals: 51 },
];
