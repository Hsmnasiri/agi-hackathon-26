import type { ClinicalDocument } from "@/types";

/**
 * Catalog of clinical documents the readiness engine reasons about.
 * Patients carry a subset "on file"; pathways declare which are required.
 */
export const DOCUMENTS: Record<string, ClinicalDocument> = {
  ecg: {
    id: "ecg",
    label: "12-lead ECG",
    kind: "imaging",
    weight: 18,
    action: "Attach ECG from chart",
    actionKind: "attach",
  },
  holter: {
    id: "holter",
    label: "48-hour Holter monitor",
    kind: "imaging",
    weight: 22,
    action: "Order Holter monitor",
    actionKind: "order",
  },
  tsh: {
    id: "tsh",
    label: "Recent TSH",
    kind: "lab",
    weight: 12,
    action: "Order TSH panel",
    actionKind: "order",
  },
  med_list: {
    id: "med_list",
    label: "Medication list",
    kind: "med",
    weight: 10,
    action: "Attach medication list",
    actionKind: "attach",
  },
  symptom_hx: {
    id: "symptom_hx",
    label: "Symptom duration & pattern",
    kind: "history",
    weight: 12,
    action: "Document symptom timeline",
    actionKind: "ask",
  },
  syncope_hx: {
    id: "syncope_hx",
    label: "Syncope / red-flag history",
    kind: "history",
    weight: 14,
    action: "Ask syncope / red-flag questions",
    actionKind: "ask",
  },
  xray_knee: {
    id: "xray_knee",
    label: "Weight-bearing knee X-ray",
    kind: "imaging",
    weight: 22,
    action: "Order weight-bearing knee X-ray",
    actionKind: "order",
  },
  physio_notes: {
    id: "physio_notes",
    label: "Physiotherapy trial notes",
    kind: "report",
    weight: 16,
    action: "Attach physiotherapy notes",
    actionKind: "attach",
  },
  bmi: {
    id: "bmi",
    label: "BMI / weight",
    kind: "history",
    weight: 8,
    action: "Document BMI",
    actionKind: "ask",
  },
  lesion_photo: {
    id: "lesion_photo",
    label: "Dermoscopic lesion photo",
    kind: "imaging",
    weight: 26,
    action: "Capture dermoscopic photo",
    actionKind: "attach",
  },
  lesion_hx: {
    id: "lesion_hx",
    label: "Lesion change history",
    kind: "history",
    weight: 16,
    action: "Document lesion change history",
    actionKind: "ask",
  },
  cbc: {
    id: "cbc",
    label: "CBC + ferritin",
    kind: "lab",
    weight: 16,
    action: "Order CBC + ferritin",
    actionKind: "order",
  },
  celiac: {
    id: "celiac",
    label: "Celiac serology",
    kind: "lab",
    weight: 16,
    action: "Order celiac serology",
    actionKind: "order",
  },
  alarm_hx: {
    id: "alarm_hx",
    label: "GI alarm-feature screen",
    kind: "history",
    weight: 14,
    action: "Screen for GI alarm features",
    actionKind: "ask",
  },
};

export function getDocument(id: string): ClinicalDocument {
  const doc = DOCUMENTS[id];
  if (!doc) throw new Error(`Unknown document: ${id}`);
  return doc;
}
