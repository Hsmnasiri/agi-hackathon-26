import type { Patient, Readiness, ReadinessItem } from "@/types";
import { getDocument } from "@/data/documents";
import { clamp } from "./format";

/**
 * Readiness = share of the pathway's required-document *weight* that is present.
 * The differentiator vs a plain checklist: we surface *why a destination might
 * delay or reject* the referral, not just what's ticked.
 */
export function computeReadiness(patient: Patient, presentDocIds: string[]): Readiness {
  const present = new Set(presentDocIds);
  const items: ReadinessItem[] = patient.requiredDocIds.map((id) => {
    const doc = getDocument(id);
    return { doc, status: present.has(id) ? "present" : "missing" };
  });

  const totalWeight = items.reduce((s, i) => s + i.doc.weight, 0);
  const presentWeight = items
    .filter((i) => i.status === "present")
    .reduce((s, i) => s + i.doc.weight, 0);

  const score = totalWeight === 0 ? 100 : clamp(Math.round((presentWeight / totalWeight) * 100));

  const firstMissing = items.find((i) => i.status === "missing");
  const likelyDelayReason = firstMissing
    ? delayReasonFor(firstMissing.doc.id)
    : "All triage prerequisites satisfied — low risk of pre-triage delay.";

  return { score, items, likelyDelayReason };
}

function delayReasonFor(docId: string): string {
  const reasons: Record<string, string> = {
    holter: "Destination clinics typically request a Holter before triage.",
    tsh: "Arrhythmia clinics screen thyroid function before booking.",
    xray_knee: "Surgical knee clinics require a weight-bearing X-ray to triage.",
    physio_notes: "Ortho intake requires a documented conservative-care trial.",
    lesion_photo: "Teledermatology triage cannot proceed without a lesion photo.",
    cbc: "GI clinics triage on baseline bloodwork — missing labs park the referral.",
    celiac: "Celiac serology is required before a luminal-GI appointment.",
    syncope_hx: "Red-flag (syncope) history must be documented for risk triage.",
  };
  return (
    reasons[docId] ??
    "A required document is missing — the clinic may park the referral before triage."
  );
}

/** Starting present-doc set for a patient (what's already in the EMR). */
export function initialPresentDocs(patient: Patient): string[] {
  return patient.requiredDocIds.filter((id) => patient.onFileDocIds.includes(id));
}
