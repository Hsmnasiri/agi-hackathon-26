import type { Pathway } from "@/types";

/**
 * Specialty / subspecialty / service-line catalog.
 * The Pathway Agent's value is picking the *right subspecialty*, not generic
 * "cardiology". Each pathway notes why it beats the generic route.
 */
export const PATHWAYS: Record<string, Pathway> = {
  cardio_ep: {
    id: "cardio_ep",
    specialty: "Cardiology",
    subspecialty: "Electrophysiology (Arrhythmia)",
    serviceLine: "Heart Rhythm Program",
    note: "Palpitations + abnormal ECG point to a rhythm problem. Routing to an arrhythmia/EP clinic avoids a generic-cardiology bounce-back.",
  },
  cardio_general: {
    id: "cardio_general",
    specialty: "Cardiology",
    subspecialty: "General Cardiology",
    serviceLine: "Outpatient Cardiology",
    note: "Broad cardiac workup; may redirect to a subspecialty after triage.",
  },
  cardio_urgent: {
    id: "cardio_urgent",
    specialty: "Cardiology",
    subspecialty: "Rapid Access Chest Pain",
    serviceLine: "Urgent Cardiac Assessment",
    note: "Possible acute coronary syndrome — needs same-day assessment, not an outpatient queue.",
  },
  ortho_knee: {
    id: "ortho_knee",
    specialty: "Orthopaedic Surgery",
    subspecialty: "Knee / Lower Limb",
    serviceLine: "Joint Preservation & Replacement",
    note: "Chronic mechanical knee pain with failed conservative care — the surgical knee clinic, not general ortho intake.",
  },
  derm_lesion: {
    id: "derm_lesion",
    specialty: "Dermatology",
    subspecialty: "Pigmented Lesion / Skin Cancer",
    serviceLine: "Teledermatology & Lesion Clinic",
    note: "A suspicious pigmented lesion can often be triaged by teledermatology in days instead of a months-long in-person wait.",
  },
  gi_general: {
    id: "gi_general",
    specialty: "Gastroenterology",
    subspecialty: "Luminal GI / IBS",
    serviceLine: "Functional GI Program",
    note: "Likely functional GI — basic labs first can avoid an unnecessary referral or speed triage.",
  },
};

export function getPathway(id: string): Pathway {
  const p = PATHWAYS[id];
  if (!p) throw new Error(`Unknown pathway: ${id}`);
  return p;
}
