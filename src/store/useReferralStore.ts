import { create } from "zustand";
import type {
  AuditEntry,
  Referral,
  ReferralStatus,
  RankedProvider,
  Role,
} from "@/types";
import { getPatient } from "@/data/patients";
import { getPathway } from "@/data/pathways";
import { getProvider } from "@/data/providers";
import { SEED_REFERRALS } from "@/data/referrals";
import { computeReadiness, initialPresentDocs } from "@/lib/readiness";

export type WizardStep =
  | "intent"
  | "safety"
  | "pathway"
  | "readiness"
  | "routing"
  | "draft"
  | "sent";

export const WIZARD_ORDER: WizardStep[] = [
  "intent",
  "safety",
  "pathway",
  "readiness",
  "routing",
  "draft",
  "sent",
];

interface ReferralState {
  role: Role;
  /** Master demo toggle: stream AI output token-by-token. */
  streaming: boolean;

  /* ---- active wizard ---- */
  activePatientId: string | null;
  step: WizardStep;
  pathwayId: string | null;
  presentDocIds: string[];
  selectedProviderId: string | null;
  lastSentReferralId: string | null;

  /* ---- closed loop ---- */
  referrals: Referral[];

  /* ---- actions ---- */
  setRole: (role: Role) => void;
  toggleStreaming: () => void;

  startReferral: (patientId: string) => void;
  closeReferral: () => void;
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  setPathway: (pathwayId: string) => void;
  addDocument: (docId: string) => void;
  removeDocument: (docId: string) => void;
  selectProvider: (providerId: string) => void;

  sendReferral: (ranked: RankedProvider) => string;
  resolveGapTask: (referralId: string, taskId: string) => void;
  rerouteReferral: (referralId: string) => void;
  advanceReferral: (referralId: string, status: ReferralStatus, note: string) => void;
}

function auditNow(actor: AuditEntry["actor"], message: string): AuditEntry {
  return { at: new Date().toISOString(), actor, message };
}

export const useReferralStore = create<ReferralState>((set, get) => ({
  role: "physician",
  streaming: true,

  activePatientId: null,
  step: "intent",
  pathwayId: null,
  presentDocIds: [],
  selectedProviderId: null,
  lastSentReferralId: null,

  referrals: SEED_REFERRALS,

  setRole: (role) => set({ role }),
  toggleStreaming: () => set((s) => ({ streaming: !s.streaming })),

  startReferral: (patientId) => {
    const patient = getPatient(patientId);
    set({
      activePatientId: patientId,
      step: "intent",
      pathwayId: patient.recommendedPathwayId,
      presentDocIds: initialPresentDocs(patient),
      selectedProviderId: null,
      lastSentReferralId: null,
    });
  },

  closeReferral: () =>
    set({
      activePatientId: null,
      step: "intent",
      pathwayId: null,
      presentDocIds: [],
      selectedProviderId: null,
    }),

  goToStep: (step) => set({ step }),
  nextStep: () =>
    set((s) => {
      const i = WIZARD_ORDER.indexOf(s.step);
      return { step: WIZARD_ORDER[Math.min(i + 1, WIZARD_ORDER.length - 1)] };
    }),
  prevStep: () =>
    set((s) => {
      const i = WIZARD_ORDER.indexOf(s.step);
      return { step: WIZARD_ORDER[Math.max(i - 1, 0)] };
    }),

  setPathway: (pathwayId) => set({ pathwayId }),

  addDocument: (docId) =>
    set((s) =>
      s.presentDocIds.includes(docId)
        ? s
        : { presentDocIds: [...s.presentDocIds, docId] }
    ),
  removeDocument: (docId) =>
    set((s) => ({ presentDocIds: s.presentDocIds.filter((d) => d !== docId) })),

  selectProvider: (providerId) => set({ selectedProviderId: providerId }),

  sendReferral: (ranked) => {
    const { activePatientId, pathwayId, presentDocIds } = get();
    if (!activePatientId || !pathwayId) return "";
    const patient = getPatient(activePatientId);
    const pathway = getPathway(pathwayId);
    const readiness = computeReadiness(patient, presentDocIds).score;
    const id = `REF-${Math.floor(2100 + Math.random() * 800)}`;
    const ts = new Date().toISOString();

    const referral: Referral = {
      id,
      patientId: patient.id,
      patientName: patient.name,
      pathwayId: pathway.id,
      specialtyLabel: `${pathway.specialty} · ${pathway.subspecialty}`,
      providerId: ranked.provider.id,
      providerName: ranked.provider.name,
      status: "sent",
      readinessAtSend: readiness,
      matchScore: ranked.score,
      timeToAcceptedCareWeeks: ranked.timeToAcceptedCareWeeks,
      createdAt: ts,
      updatedAt: ts,
      daysWaiting: 0,
      gapTasks: [],
      audit: [
        auditNow("ai", `Routed to ${ranked.provider.name} (match ${ranked.score}%).`),
        auditNow("physician", "Referral reviewed, signed and sent."),
      ],
      patientPrep: [
        "You'll receive an appointment confirmation by text and email.",
        "Bring a photo ID and your medication list.",
        "We'll let you know if the clinic needs anything else.",
      ],
    };

    set((s) => ({
      referrals: [referral, ...s.referrals],
      lastSentReferralId: id,
      selectedProviderId: ranked.provider.id,
      step: "sent",
    }));
    return id;
  },

  resolveGapTask: (referralId, taskId) =>
    set((s) => ({
      referrals: s.referrals.map((r) => {
        if (r.id !== referralId) return r;
        const gapTasks = r.gapTasks.map((t) =>
          t.id === taskId ? { ...t, resolved: true } : t
        );
        const allResolved = gapTasks.every((t) => t.resolved);
        return {
          ...r,
          gapTasks,
          status: allResolved ? "accepted" : r.status,
          updatedAt: new Date().toISOString(),
          audit: [
            ...r.audit,
            auditNow(
              "admin",
              allResolved
                ? "All gaps resolved — resubmitted; clinic accepted."
                : `Resolved gap: ${r.gapTasks.find((t) => t.id === taskId)?.label}.`
            ),
          ],
        };
      }),
    })),

  rerouteReferral: (referralId) =>
    set((s) => ({
      referrals: s.referrals.map((r) => {
        if (r.id !== referralId || !r.nextBestProviderId) return r;
        const next = getProvider(r.nextBestProviderId);
        return {
          ...r,
          providerId: next.id,
          providerName: next.name,
          status: "sent",
          rejectionReason: undefined,
          nextBestProviderId: undefined,
          updatedAt: new Date().toISOString(),
          audit: [
            ...r.audit,
            auditNow("physician", `Re-routed to next-best option: ${next.name}.`),
          ],
        };
      }),
    })),

  advanceReferral: (referralId, status, note) =>
    set((s) => ({
      referrals: s.referrals.map((r) =>
        r.id === referralId
          ? {
              ...r,
              status,
              updatedAt: new Date().toISOString(),
              audit: [...r.audit, auditNow("clinic", note)],
            }
          : r
      ),
    })),
}));
