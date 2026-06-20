/**
 * Core domain types for Referral GPS.
 * The whole demo runs on dummy data shaped by these types.
 */

export type Role = "physician" | "admin" | "patient";

/* ----------------------------------------------------------------------------
 * Patient + clinical context
 * ------------------------------------------------------------------------- */

export interface VitalSign {
  label: string;
  value: string;
  flag?: "normal" | "abnormal" | "critical";
}

export interface PatientConstraint {
  label: string;
  detail: string;
  icon?: "transit" | "language" | "mobility" | "work" | "virtual";
}

/** Suggested non-referral alternative (eConsult, order tests first, etc.). */
export interface AlternativePathway {
  kind: "econsult" | "order-tests" | "community-program" | "family-follow-up";
  title: string;
  detail: string;
  expectedResponse: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: "F" | "M" | "X";
  mrn: string;
  avatarHue: number; // 0-360 for a soft generated avatar
  reason: string; // one-line presenting complaint
  visitSummary: string; // short visit transcript / note
  vitals: VitalSign[];
  constraints: PatientConstraint[];
  /** Document ids (see data/documents.ts) the patient already has on file. */
  onFileDocIds: string[];

  /* ---- AI pipeline outcome (precomputed dummy "model output") ---- */
  intent: ReferralIntent;
  /** When red flags exist the wizard routes to the urgent branch. */
  redFlags: string[];
  recommendedPathwayId: string; // -> data/pathways.ts
  /** Document requirements specific to this patient's recommended pathway. */
  requiredDocIds: string[];
  /** Provider ids eligible for routing (subset of data/providers.ts). */
  candidateProviderIds: string[];
  /** Optional non-referral alternative the AI surfaces. */
  alternative?: AlternativePathway;
}

export interface ReferralIntent {
  detected: boolean;
  confidence: number; // 0-100
  specialty: string;
  reasons: string[];
  /** Headline the model "says" when a referral is detected. */
  headline: string;
}

/* ----------------------------------------------------------------------------
 * Pathways (specialty / subspecialty / service line)
 * ------------------------------------------------------------------------- */

export interface Pathway {
  id: string;
  specialty: string;
  subspecialty: string;
  serviceLine: string;
  note: string; // why this subspecialty over generic
}

/* ----------------------------------------------------------------------------
 * Documents + readiness
 * ------------------------------------------------------------------------- */

export type DocStatus = "present" | "missing";

export interface ClinicalDocument {
  id: string;
  label: string;
  kind: "lab" | "imaging" | "report" | "history" | "med" | "form";
  /** weight toward readiness (sums across required docs). */
  weight: number;
  /** A one-click action label when missing, e.g. "Order Holter monitor". */
  action: string;
  actionKind: "order" | "ask" | "attach";
}

export interface ReadinessItem {
  doc: ClinicalDocument;
  status: DocStatus;
}

export interface Readiness {
  score: number; // 0-100
  items: ReadinessItem[];
  /** Why a destination clinic might delay/reject — the differentiator. */
  likelyDelayReason: string;
}

/* ----------------------------------------------------------------------------
 * Providers + routing / match scoring
 * ------------------------------------------------------------------------- */

export type AcceptanceProbability = "high" | "medium" | "low";
export type Modality = "in-person" | "virtual" | "hybrid";

export interface Provider {
  id: string;
  name: string;
  specialty: string;
  subspecialty?: string;
  /** Pathway ids this provider serves. */
  servesPathwayIds: string[];
  /** 0-100 raw clinical fit for the matched pathway. */
  clinicalFit: number;
  acceptanceProbability: AcceptanceProbability;
  /** Raw triage wait in weeks (before readiness/rejection adjustment). */
  rawWaitWeeks: number;
  modality: Modality;
  distanceKm: number;
  transitAccessible: boolean;
  languages: string[];
  requiredDocIds: string[];
  /** Days since availability was last verified (freshness signal). */
  availabilityVerifiedDaysAgo: number;
  /** Free-text risk/heads-up shown on the card. */
  note?: string;
  isEconsult?: boolean;
}

export interface MatchFactor {
  key:
    | "clinicalFit"
    | "acceptanceProbability"
    | "timeToAcceptedCare"
    | "patientFeasibility"
    | "referralReadiness"
    | "continuity";
  label: string;
  weight: number; // 0-1
  raw: number; // 0-100 normalized factor value
  contribution: number; // weight * raw
  reason: string; // human-readable "why"
}

export interface RankedProvider {
  provider: Provider;
  score: number; // 0-100 weighted total
  factors: MatchFactor[];
  /** Time-to-accepted-care in weeks (wait adjusted by risk + readiness). */
  timeToAcceptedCareWeeks: number;
  reasons: string[]; // ✓ bullets
  warnings: string[]; // ⚠ bullets
}

/* ----------------------------------------------------------------------------
 * Referral lifecycle (closed-loop tracker)
 * ------------------------------------------------------------------------- */

export type ReferralStatus =
  | "draft"
  | "sent"
  | "received"
  | "accepted"
  | "needs-info"
  | "rejected"
  | "scheduled"
  | "no-response";

export interface AuditEntry {
  at: string; // ISO timestamp
  actor: "ai" | "physician" | "admin" | "clinic" | "patient";
  message: string;
}

export interface GapTask {
  id: string;
  label: string;
  detail: string;
  actionKind: "order" | "ask" | "attach";
  resolved: boolean;
}

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  pathwayId: string;
  specialtyLabel: string;
  providerId: string;
  providerName: string;
  status: ReferralStatus;
  readinessAtSend: number;
  matchScore: number;
  timeToAcceptedCareWeeks: number;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  /** Days waiting (for no-response escalation visuals). */
  daysWaiting: number;
  gapTasks: GapTask[];
  audit: AuditEntry[];
  /** When status is rejected, the suggested next-best provider id. */
  rejectionReason?: string;
  nextBestProviderId?: string;
  /** Patient-facing prep instructions (shown in PatientPage). */
  patientPrep?: string[];
}

/* ----------------------------------------------------------------------------
 * Impact stats (dashboard)
 * ------------------------------------------------------------------------- */

export interface ImpactStat {
  id: string;
  label: string;
  value: string;
  sub: string;
  trend?: "up" | "down";
  source?: string;
}

export interface FunnelStage {
  stage: string;
  baseline: number; // % surviving without Referral GPS
  withGps: number; // % surviving with Referral GPS
}

/* ----------------------------------------------------------------------------
 * Referral delivery options (Send Method & Portal Selection step)
 * ------------------------------------------------------------------------- */

export type DeliveryMethodType =
  | "ocean_ereferral"
  | "ocean_econsult"
  | "ocean_eorder"
  | "central_intake"
  | "community_service"
  | "hospital_portal"
  | "fax"
  | "secure_message"
  | "patient_self_booking";

export type IntegrationStatus = "connected" | "available_manual" | "unavailable" | "unknown";
export type AcceptanceProbabilityStr = "low" | "medium" | "high" | "unknown";
export type DocumentStatus = "available" | "missing" | "optional" | "not_applicable";
export type AttachmentStatus = "attached" | "missing" | "suggested";
export type GeneratedFormType =
  | "referral_letter"
  | "specialty_form"
  | "intake_form"
  | "fax_cover"
  | "fhir_payload"
  | "patient_instruction"
  | "requisition"
  | "consent"
  | "attachment_bundle";
export type SubmissionActionType =
  | "send_direct"
  | "export_package"
  | "open_portal"
  | "generate_fax"
  | "create_task"
  | "notify_patient";

export interface DeliveryRequiredDocument {
  name: string;
  status: DocumentStatus;
  source: "EMR" | "patient" | "physician" | "external_lab" | "generated";
  actionRequired?: string;
}

export interface DeliveryGeneratedForm {
  name: string;
  type: GeneratedFormType;
  format: "PDF" | "JSON" | "HTML" | "text" | "portal_fields";
  requiresPhysicianReview: boolean;
}

export interface DeliveryAttachment {
  name: string;
  type:
    | "lab"
    | "imaging"
    | "ECG"
    | "medication_list"
    | "consult_note"
    | "discharge_summary"
    | "questionnaire"
    | "other";
  status: AttachmentStatus;
}

export interface DeliverySubmissionAction {
  label: string;
  actionType: SubmissionActionType;
  enabled: boolean;
  disabledReason?: string;
}

export interface ReferralDeliveryOption {
  id: string;
  methodType: DeliveryMethodType;
  portalName: string;
  destinationName: string;
  status: IntegrationStatus;
  /** Set by rankDeliveryOptions() — true for the top-scored option. */
  recommended: boolean;
  recommendationReason: string;
  clinicalFitScore: number;
  readinessScore: number;
  estimatedTimeToAcceptedCare: string;
  acceptanceProbability: AcceptanceProbabilityStr;
  riskLevel: "low" | "medium" | "high";
  riskReasons: string[];
  requiredDocuments: DeliveryRequiredDocument[];
  generatedForms: DeliveryGeneratedForm[];
  attachments: DeliveryAttachment[];
  submissionActions: DeliverySubmissionAction[];
  audit: {
    lastVerified: string;
    dataSource: "provider_directory" | "clinic_rules" | "user_entered" | "unknown";
    aiConfidence: number;
  };
}
