import type { Patient } from "@/types";

/**
 * Five rich scenarios. Each produces a different pathway / readiness / routing
 * outcome so the demo feels dynamic and replayable.
 */
export const PATIENTS: Patient[] = [
  /* 1 — the worked example from the spec */
  {
    id: "sarah_chen",
    name: "Sarah Chen",
    age: 54,
    sex: "F",
    mrn: "MRN-48213",
    avatarHue: 168,
    reason: "Palpitations for 3 months, worse on exertion",
    visitSummary:
      "54F with 3 months of intermittent palpitations, now worsening with exertion. ECG in chart shows frequent PVCs. No chest pain at rest. Worried about her father's history of arrhythmia.",
    vitals: [
      { label: "BP", value: "128/82" },
      { label: "HR", value: "94 irregular", flag: "abnormal" },
      { label: "ECG", value: "Frequent PVCs", flag: "abnormal" },
      { label: "SpO₂", value: "98%" },
    ],
    constraints: [
      { label: "Transit", detail: "No car — relies on transit", icon: "transit" },
      { label: "Work", detail: "Prefers virtual or after-hours", icon: "work" },
    ],
    onFileDocIds: ["ecg", "med_list", "symptom_hx"],
    intent: {
      detected: true,
      confidence: 92,
      specialty: "Cardiology",
      headline: "Cardiology referral may be appropriate.",
      reasons: [
        "Palpitations for 3 months",
        "Abnormal ECG in chart (frequent PVCs)",
        "Symptoms worsening with exertion",
      ],
    },
    redFlags: [],
    recommendedPathwayId: "cardio_ep",
    requiredDocIds: ["ecg", "holter", "tsh", "med_list", "symptom_hx", "syncope_hx"],
    candidateProviderIds: [
      "heart_rhythm_b",
      "general_cardio_a",
      "virtual_cardio_econsult",
    ],
  },

  /* 2 — red-flag urgent branch */
  {
    id: "marcus_webb",
    name: "Marcus Webb",
    age: 47,
    sex: "M",
    mrn: "MRN-77190",
    avatarHue: 8,
    reason: "Chest pressure at rest with diaphoresis",
    visitSummary:
      "47M with 40 minutes of central chest pressure at rest, radiating to left arm, with sweating and nausea. Diabetic, smoker. ECG shows new ST changes. This is a potential acute coronary syndrome.",
    vitals: [
      { label: "BP", value: "158/96", flag: "abnormal" },
      { label: "HR", value: "102", flag: "abnormal" },
      { label: "ECG", value: "New ST changes", flag: "critical" },
      { label: "SpO₂", value: "94%", flag: "abnormal" },
    ],
    constraints: [{ label: "Mobility", detail: "Came in with spouse", icon: "mobility" }],
    onFileDocIds: ["ecg", "med_list"],
    intent: {
      detected: true,
      confidence: 98,
      specialty: "Cardiology",
      headline: "Urgent cardiac pathway indicated — do not queue as routine.",
      reasons: [
        "Chest pressure at rest with diaphoresis",
        "New ST changes on ECG",
        "Diabetic smoker — high cardiac risk",
      ],
    },
    redFlags: [
      "Rest chest pain with radiation + diaphoresis",
      "New ST-segment changes on ECG",
      "Hypoxia (SpO₂ 94%)",
    ],
    recommendedPathwayId: "cardio_urgent",
    requiredDocIds: ["ecg"],
    candidateProviderIds: ["rapid_chest_pain"],
  },

  /* 3 — orthopaedics, eConsult-first */
  {
    id: "priya_patel",
    name: "Priya Patel",
    age: 38,
    sex: "F",
    mrn: "MRN-30654",
    avatarHue: 286,
    reason: "Chronic right knee pain, failed 8 weeks physio",
    visitSummary:
      "38F with 7 months of mechanical right knee pain, locking and giving-way. Completed an 8-week physiotherapy trial with partial benefit. No acute injury. Wants to know if she needs surgery.",
    vitals: [
      { label: "BMI", value: "29" },
      { label: "Knee ROM", value: "Reduced", flag: "abnormal" },
      { label: "Effusion", value: "Mild", flag: "abnormal" },
    ],
    constraints: [
      { label: "Mobility", detail: "Limited stairs / standing", icon: "mobility" },
      { label: "Language", detail: "Prefers Hindi", icon: "language" },
    ],
    onFileDocIds: ["physio_notes", "bmi"],
    intent: {
      detected: true,
      confidence: 81,
      specialty: "Orthopaedic Surgery",
      headline: "Orthopaedic referral candidate — confirm surgical need first.",
      reasons: [
        "Chronic mechanical knee pain (7 months)",
        "Failed 8-week physiotherapy trial",
        "Mechanical symptoms: locking + giving-way",
      ],
    },
    redFlags: [],
    recommendedPathwayId: "ortho_knee",
    requiredDocIds: ["xray_knee", "physio_notes", "bmi"],
    candidateProviderIds: ["ortho_knee_clinic", "ortho_econsult", "community_ortho"],
    alternative: {
      kind: "econsult",
      title: "Orthopaedic eConsult first",
      detail:
        "Confirm whether she's a surgical candidate before committing to a 9-week in-person queue.",
      expectedResponse: "~4 days",
    },
  },

  /* 4 — dermatology, possibly no full referral */
  {
    id: "james_oconnor",
    name: "James O'Connor",
    age: 61,
    sex: "M",
    mrn: "MRN-91002",
    avatarHue: 32,
    reason: "Changing pigmented lesion on back",
    visitSummary:
      "61M reports a pigmented lesion on his back that his wife says has darkened and grown over 4 months. Irregular border. No bleeding. Fair skin, prior sun exposure. Needs lesion assessment.",
    vitals: [
      { label: "Lesion", value: "8mm irregular", flag: "abnormal" },
      { label: "Border", value: "Asymmetric", flag: "abnormal" },
    ],
    constraints: [{ label: "Virtual", detail: "Comfortable with photos/video", icon: "virtual" }],
    onFileDocIds: ["lesion_hx"],
    intent: {
      detected: true,
      confidence: 76,
      specialty: "Dermatology",
      headline: "Dermatology pathway — teledermatology can triage in days.",
      reasons: [
        "Pigmented lesion changing over 4 months",
        "Irregular, asymmetric border",
        "Fair skin with significant sun exposure",
      ],
    },
    redFlags: [],
    recommendedPathwayId: "derm_lesion",
    requiredDocIds: ["lesion_photo", "lesion_hx"],
    candidateProviderIds: ["telederm_lesion", "derm_in_person"],
    alternative: {
      kind: "econsult",
      title: "Teledermatology photo triage",
      detail:
        "A dermoscopic photo can be triaged in days — fast-tracking a true melanoma or avoiding an unnecessary 16-week visit.",
      expectedResponse: "~3 days",
    },
  },

  /* 5 — GI, order tests first */
  {
    id: "aisha_rahman",
    name: "Aisha Rahman",
    age: 29,
    sex: "F",
    mrn: "MRN-55438",
    avatarHue: 210,
    reason: "Bloating, cramping, altered bowel habit (6 months)",
    visitSummary:
      "29F with 6 months of bloating, cramping and alternating bowel habit. No weight loss, no bleeding, no nocturnal symptoms. Symptoms tied to stress and certain foods. Likely IBS.",
    vitals: [
      { label: "Weight", value: "Stable" },
      { label: "Abdomen", value: "Soft, non-tender" },
    ],
    constraints: [
      { label: "Language", detail: "Prefers Urdu", icon: "language" },
      { label: "Work", detail: "Shift worker", icon: "work" },
    ],
    onFileDocIds: ["alarm_hx"],
    intent: {
      detected: false,
      confidence: 58,
      specialty: "Gastroenterology",
      headline: "Referral may not be needed yet — basic workup first.",
      reasons: [
        "No alarm features (no bleeding, weight loss, or nocturnal symptoms)",
        "Pattern consistent with IBS",
        "Bloodwork not yet done",
      ],
    },
    redFlags: [],
    recommendedPathwayId: "gi_general",
    requiredDocIds: ["cbc", "celiac", "alarm_hx"],
    candidateProviderIds: ["gi_functional", "gi_econsult"],
    alternative: {
      kind: "order-tests",
      title: "Order baseline labs before referral",
      detail:
        "CBC, ferritin and celiac serology first. If normal with no alarm features, a GI eConsult can manage as IBS without a full referral.",
      expectedResponse: "Labs in ~2 days",
    },
  },
];

export function getPatient(id: string): Patient {
  const p = PATIENTS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown patient: ${id}`);
  return p;
}
