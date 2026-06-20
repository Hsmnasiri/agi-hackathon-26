import type {
  Provider,
  ReferralDeliveryOption,
  DeliveryGeneratedForm,
  DeliveryRequiredDocument,
  DeliveryAttachment,
  DeliverySubmissionAction,
  DeliveryMethodType,
} from "@/types";

// ---- Shared form builders ---------------------------------------------------

function ereferralForms(specialty: string): DeliveryGeneratedForm[] {
  return [
    { name: "Referral Letter", type: "referral_letter", format: "PDF", requiresPhysicianReview: true },
    { name: "FHIR ServiceRequest (R4)", type: "fhir_payload", format: "JSON", requiresPhysicianReview: false },
    { name: `${specialty} Referral Form`, type: "specialty_form", format: "portal_fields", requiresPhysicianReview: true },
    { name: "Attachment Bundle", type: "attachment_bundle", format: "PDF", requiresPhysicianReview: false },
  ];
}

function econsultForms(): DeliveryGeneratedForm[] {
  return [
    { name: "Clinical Question Summary", type: "referral_letter", format: "text", requiresPhysicianReview: true },
    { name: "Relevant History Extract", type: "specialty_form", format: "text", requiresPhysicianReview: false },
    { name: "Medication List", type: "specialty_form", format: "PDF", requiresPhysicianReview: false },
    { name: "Patient Instruction Sheet", type: "patient_instruction", format: "PDF", requiresPhysicianReview: false },
  ];
}

function eorderForms(): DeliveryGeneratedForm[] {
  return [
    { name: "Diagnostic Requisition", type: "requisition", format: "PDF", requiresPhysicianReview: true },
    { name: "Clinical Indication Summary", type: "referral_letter", format: "text", requiresPhysicianReview: false },
    { name: "Attachment Bundle", type: "attachment_bundle", format: "PDF", requiresPhysicianReview: false },
  ];
}

function centralIntakeForms(specialty: string): DeliveryGeneratedForm[] {
  return [
    { name: "Central Intake Referral Form", type: "intake_form", format: "PDF", requiresPhysicianReview: true },
    { name: `${specialty} Clinical Summary`, type: "referral_letter", format: "PDF", requiresPhysicianReview: true },
    { name: "Priority / Urgency Justification", type: "specialty_form", format: "text", requiresPhysicianReview: false },
    { name: "Attachment Bundle", type: "attachment_bundle", format: "PDF", requiresPhysicianReview: false },
  ];
}

function communityForms(): DeliveryGeneratedForm[] {
  return [
    { name: "Service Request Form", type: "intake_form", format: "portal_fields", requiresPhysicianReview: false },
    { name: "Consent / Share-Information Confirmation", type: "consent", format: "PDF", requiresPhysicianReview: true },
    { name: "Patient Instruction Sheet", type: "patient_instruction", format: "PDF", requiresPhysicianReview: false },
  ];
}

function hospitalPortalForms(specialty: string): DeliveryGeneratedForm[] {
  return [
    { name: "Portal Referral Fields", type: "specialty_form", format: "portal_fields", requiresPhysicianReview: true },
    { name: "Referral Letter", type: "referral_letter", format: "PDF", requiresPhysicianReview: true },
    { name: `${specialty} Mandatory Attachment Bundle`, type: "attachment_bundle", format: "PDF", requiresPhysicianReview: false },
  ];
}

function faxForms(specialty: string): DeliveryGeneratedForm[] {
  return [
    { name: "Fax Cover Sheet", type: "fax_cover", format: "PDF", requiresPhysicianReview: false },
    { name: "Referral Letter PDF", type: "referral_letter", format: "PDF", requiresPhysicianReview: true },
    { name: `${specialty} Referral Form PDF`, type: "specialty_form", format: "PDF", requiresPhysicianReview: true },
    { name: "Attachment Bundle", type: "attachment_bundle", format: "PDF", requiresPhysicianReview: false },
  ];
}

// ---- Shared action builders -------------------------------------------------

function digitalActions(
  sendEnabled: boolean,
  disabledReason: string | undefined,
  sendLabel: string
): DeliverySubmissionAction[] {
  return [
    { label: sendLabel, actionType: "send_direct", enabled: sendEnabled, disabledReason },
    { label: "Export ready package", actionType: "export_package", enabled: true },
    { label: "Create admin task", actionType: "create_task", enabled: true },
  ];
}

function manualPortalActions(
  sendEnabled: boolean,
  disabledReason: string | undefined
): DeliverySubmissionAction[] {
  return [
    { label: "Open portal (manual entry)", actionType: "open_portal", enabled: true },
    { label: "Export portal package", actionType: "export_package", enabled: sendEnabled, disabledReason },
    { label: "Create admin task", actionType: "create_task", enabled: true },
  ];
}

function faxActions(
  sendEnabled: boolean,
  disabledReason: string | undefined
): DeliverySubmissionAction[] {
  return [
    { label: "Generate fax package", actionType: "generate_fax", enabled: true },
    { label: "Export & send", actionType: "export_package", enabled: sendEnabled, disabledReason },
    { label: "Create admin task", actionType: "create_task", enabled: true },
  ];
}

function communityActions(
  sendEnabled: boolean,
  disabledReason: string | undefined
): DeliverySubmissionAction[] {
  return [
    { label: "Send via Caredove", actionType: "send_direct", enabled: sendEnabled, disabledReason },
    { label: "Export package", actionType: "export_package", enabled: true },
    { label: "Notify patient", actionType: "notify_patient", enabled: true },
    { label: "Create admin task", actionType: "create_task", enabled: true },
  ];
}

// ---- Shared unavailable options (same for all providers) -------------------

function unavailableOption(
  id: string,
  methodType: DeliveryMethodType,
  portalName: string,
  reason: string
): ReferralDeliveryOption {
  return {
    id,
    methodType,
    portalName,
    destinationName: "N/A",
    status: "unavailable",
    recommended: false,
    recommendationReason: reason,
    clinicalFitScore: 0,
    readinessScore: 0,
    estimatedTimeToAcceptedCare: "N/A",
    acceptanceProbability: "unknown",
    riskLevel: "high",
    riskReasons: [reason],
    requiredDocuments: [],
    generatedForms: [],
    attachments: [],
    submissionActions: [],
    audit: { lastVerified: "N/A", dataSource: "unknown", aiConfidence: 0 },
  };
}

// ---- Audit helper ----------------------------------------------------------

function audit(
  daysAgo: number,
  source: "provider_directory" | "clinic_rules" | "user_entered" | "unknown",
  confidence: number
) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    lastVerified: d.toISOString().split("T")[0],
    dataSource: source,
    aiConfidence: confidence,
  };
}

// ---- Main factory ----------------------------------------------------------

export function getDeliveryOptions(
  provider: Provider,
  readinessScore: number,
  _presentDocIds: string[]
): ReferralDeliveryOption[] {
  const ready = readinessScore >= 70;
  const sendDisabled = ready
    ? undefined
    : "Required documents missing — resolve in Readiness step before sending.";

  const sp = provider.specialty;

  if (provider.isEconsult) {
    return buildEconsultProviderOptions(provider, ready, sendDisabled, sp);
  }

  switch (provider.id) {
    case "heart_rhythm_b":
      return buildHeartRhythmOptions(provider, ready, sendDisabled);
    case "general_cardio_a":
      return buildGeneralCardioOptions(provider, ready, sendDisabled);
    case "rapid_chest_pain":
      return buildRapidChestPainOptions(provider, ready, sendDisabled);
    case "ortho_knee_clinic":
      return buildOrthoKneeOptions(provider, ready, sendDisabled);
    case "community_ortho":
      return buildCommunityOrthoOptions(provider, ready, sendDisabled);
    case "derm_in_person":
      return buildDermInPersonOptions(provider, ready, sendDisabled);
    case "gi_functional":
      return buildGIFunctionalOptions(provider, ready, sendDisabled);
    default:
      return buildDefaultOptions(provider, ready, sendDisabled, sp);
  }
}

// ---- Provider-specific builders --------------------------------------------

function buildHeartRhythmOptions(
  provider: Provider,
  ready: boolean,
  sendDisabled: string | undefined
): ReferralDeliveryOption[] {
  const sp = provider.specialty;
  const cardiacDocs: DeliveryRequiredDocument[] = [
    { name: "12-Lead ECG", status: "available", source: "EMR" },
    { name: "Holter Monitor Report", status: ready ? "available" : "missing", source: "external_lab", actionRequired: ready ? undefined : "Order 48-hour Holter before Ocean submission" },
    { name: "Medication List", status: "available", source: "EMR" },
    { name: "Referral Letter", status: "not_applicable", source: "generated" },
  ];
  const cardiacAttachments: DeliveryAttachment[] = [
    { name: "12-Lead ECG PDF", type: "ECG", status: "attached" },
    { name: "Holter Report", type: "lab", status: ready ? "attached" : "missing" },
    { name: "Medication List", type: "medication_list", status: "attached" },
  ];
  return [
    {
      id: `${provider.id}_ocean_ereferral`,
      methodType: "ocean_ereferral",
      portalName: "Ocean eReferral Network",
      destinationName: provider.name,
      status: "connected",
      recommended: false,
      recommendationReason:
        "Destination accepts Ocean eReferrals with full status tracking. Shortest path to accepted care when documents are complete.",
      clinicalFitScore: provider.clinicalFit,
      readinessScore: ready ? 95 : 60,
      estimatedTimeToAcceptedCare: "~6 weeks (adjusted for acceptance risk)",
      acceptanceProbability: "high",
      riskLevel: "low",
      riskReasons: ready ? [] : ["Holter report missing — clinic may delay triage"],
      requiredDocuments: cardiacDocs,
      generatedForms: ereferralForms(sp),
      attachments: cardiacAttachments,
      submissionActions: digitalActions(ready, sendDisabled, "Send through Ocean"),
      audit: audit(provider.availabilityVerifiedDaysAgo, "provider_directory", 92),
    },
    {
      id: `${provider.id}_central_intake`,
      methodType: "central_intake",
      portalName: "Cardiac Central Intake",
      destinationName: `${sp} Regional Intake`,
      status: "available_manual",
      recommended: false,
      recommendationReason:
        "Alternative if Ocean eReferral fails. Central intake routes to the best available EP slot.",
      clinicalFitScore: 88,
      readinessScore: ready ? 85 : 55,
      estimatedTimeToAcceptedCare: "~8 weeks (intake routing delay)",
      acceptanceProbability: "high",
      riskLevel: "low",
      riskReasons: ["Manual submission; no real-time tracking"],
      requiredDocuments: [
        { name: "Central Intake Referral Form", status: "not_applicable", source: "generated" },
        { name: "12-Lead ECG", status: "available", source: "EMR" },
        { name: "Medication List", status: "available", source: "EMR" },
      ],
      generatedForms: centralIntakeForms(sp),
      attachments: [
        { name: "12-Lead ECG PDF", type: "ECG", status: "attached" },
        { name: "Medication List", type: "medication_list", status: "attached" },
      ],
      submissionActions: manualPortalActions(ready, sendDisabled),
      audit: audit(21, "clinic_rules", 75),
    },
    {
      id: `${provider.id}_fax`,
      methodType: "fax",
      portalName: "eFax / Traditional Fax",
      destinationName: provider.name,
      status: "available_manual",
      recommended: false,
      recommendationReason:
        "Fallback if digital options unavailable. Higher rejection risk and no tracking.",
      clinicalFitScore: 80,
      readinessScore: ready ? 70 : 45,
      estimatedTimeToAcceptedCare: "~10 weeks (delay from manual intake)",
      acceptanceProbability: "medium",
      riskLevel: "medium",
      riskReasons: [
        "No confirmation of receipt",
        "Manual intake increases error risk",
        "Status updates not available until clinic calls back",
      ],
      requiredDocuments: cardiacDocs,
      generatedForms: faxForms(sp),
      attachments: cardiacAttachments,
      submissionActions: faxActions(true, undefined),
      audit: audit(0, "unknown", 60),
    },
    unavailableOption(`${provider.id}_secure_message`, "secure_message", "Secure EMR Messaging",
      "Destination clinic does not support secure EMR-to-EMR messaging."),
    unavailableOption(`${provider.id}_self_booking`, "patient_self_booking", "Patient Self-Booking",
      "A physician referral is required for this specialty — patient cannot self-book."),
    unavailableOption(`${provider.id}_econsult`, "ocean_econsult", "Ocean eConsult",
      "eConsult is for specialist advice on whether to refer — a referral has already been decided. Use Ocean eReferral instead."),
  ];
}

function buildGeneralCardioOptions(
  provider: Provider,
  ready: boolean,
  sendDisabled: string | undefined
): ReferralDeliveryOption[] {
  const sp = provider.specialty;
  return [
    {
      id: `${provider.id}_ocean_ereferral`,
      methodType: "ocean_ereferral",
      portalName: "Ocean eReferral Network",
      destinationName: provider.name,
      status: "available_manual",
      recommended: false,
      recommendationReason:
        "Ocean eReferral is available but not connected — you will export and upload the package manually.",
      clinicalFitScore: provider.clinicalFit,
      readinessScore: ready ? 85 : 55,
      estimatedTimeToAcceptedCare: "~8 weeks",
      acceptanceProbability: "medium",
      riskLevel: "medium",
      riskReasons: ["Clinic may redirect arrhythmia cases to an EP clinic after triage, adding delay"],
      requiredDocuments: [
        { name: "12-Lead ECG", status: "available", source: "EMR" },
        { name: "Medication List", status: "available", source: "EMR" },
        { name: "Referral Letter", status: "not_applicable", source: "generated" },
      ],
      generatedForms: ereferralForms(sp),
      attachments: [
        { name: "12-Lead ECG PDF", type: "ECG", status: "attached" },
        { name: "Medication List", type: "medication_list", status: "attached" },
      ],
      submissionActions: manualPortalActions(ready, sendDisabled),
      audit: audit(2, "provider_directory", 78),
    },
    {
      id: `${provider.id}_central_intake`,
      methodType: "central_intake",
      portalName: "Cardiac Central Intake",
      destinationName: `${sp} Regional Intake`,
      status: "available_manual",
      recommended: false,
      recommendationReason: "Central intake can route to the most appropriate cardiologist.",
      clinicalFitScore: 82,
      readinessScore: ready ? 80 : 50,
      estimatedTimeToAcceptedCare: "~9 weeks",
      acceptanceProbability: "high",
      riskLevel: "low",
      riskReasons: [],
      requiredDocuments: [
        { name: "Intake Form", status: "not_applicable", source: "generated" },
        { name: "12-Lead ECG", status: "available", source: "EMR" },
      ],
      generatedForms: centralIntakeForms(sp),
      attachments: [{ name: "12-Lead ECG PDF", type: "ECG", status: "attached" }],
      submissionActions: manualPortalActions(ready, sendDisabled),
      audit: audit(14, "clinic_rules", 72),
    },
    {
      id: `${provider.id}_hospital_portal`,
      methodType: "hospital_portal",
      portalName: "Hospital Referral Portal",
      destinationName: provider.name,
      status: "available_manual",
      recommended: false,
      recommendationReason: "Direct hospital portal submission. Manual entry required.",
      clinicalFitScore: 78,
      readinessScore: ready ? 80 : 50,
      estimatedTimeToAcceptedCare: "~9 weeks",
      acceptanceProbability: "medium",
      riskLevel: "medium",
      riskReasons: ["Manual portal entry; no automatic status tracking"],
      requiredDocuments: [
        { name: "12-Lead ECG", status: "available", source: "EMR" },
        { name: "Medication List", status: "available", source: "EMR" },
      ],
      generatedForms: hospitalPortalForms(sp),
      attachments: [{ name: "12-Lead ECG PDF", type: "ECG", status: "attached" }],
      submissionActions: manualPortalActions(ready, sendDisabled),
      audit: audit(7, "user_entered", 65),
    },
    {
      id: `${provider.id}_fax`,
      methodType: "fax",
      portalName: "eFax / Traditional Fax",
      destinationName: provider.name,
      status: "available_manual",
      recommended: false,
      recommendationReason: "Highest-risk option. Use digital methods above when possible.",
      clinicalFitScore: 70,
      readinessScore: ready ? 65 : 40,
      estimatedTimeToAcceptedCare: "~12 weeks (delay risk high)",
      acceptanceProbability: "medium",
      riskLevel: "high",
      riskReasons: [
        "No receipt confirmation",
        "Clinic may redirect arrhythmia cases — adds 4–6 week delay",
        "No automated status tracking",
      ],
      requiredDocuments: [
        { name: "12-Lead ECG", status: "available", source: "EMR" },
        { name: "Medication List", status: "available", source: "EMR" },
      ],
      generatedForms: faxForms(sp),
      attachments: [{ name: "12-Lead ECG PDF", type: "ECG", status: "attached" }],
      submissionActions: faxActions(true, undefined),
      audit: audit(0, "unknown", 55),
    },
    unavailableOption(`${provider.id}_econsult`, "ocean_econsult", "Ocean eConsult",
      "eConsult is for specialist advice on whether to refer. A referral has already been decided."),
    unavailableOption(`${provider.id}_self_booking`, "patient_self_booking", "Patient Self-Booking",
      "Physician referral required — patient cannot self-book cardiology."),
  ];
}

function buildRapidChestPainOptions(
  provider: Provider,
  ready: boolean,
  sendDisabled: string | undefined
): ReferralDeliveryOption[] {
  const sp = provider.specialty;
  return [
    {
      id: `${provider.id}_hospital_portal`,
      methodType: "hospital_portal",
      portalName: "Rapid Access Referral Portal",
      destinationName: provider.name,
      status: "connected",
      recommended: false,
      recommendationReason:
        "Direct connected portal for rapid access chest pain referrals. Fastest submission pathway for urgent cases.",
      clinicalFitScore: provider.clinicalFit,
      readinessScore: 95,
      estimatedTimeToAcceptedCare: "Same-day to 2 days",
      acceptanceProbability: "high",
      riskLevel: "low",
      riskReasons: [],
      requiredDocuments: [
        { name: "12-Lead ECG", status: "available", source: "EMR" },
        { name: "Urgency Justification", status: "not_applicable", source: "generated" },
      ],
      generatedForms: hospitalPortalForms(sp),
      attachments: [
        { name: "12-Lead ECG PDF", type: "ECG", status: "attached" },
      ],
      submissionActions: digitalActions(ready, sendDisabled, "Submit urgent referral"),
      audit: audit(0, "provider_directory", 98),
    },
    {
      id: `${provider.id}_fax`,
      methodType: "fax",
      portalName: "eFax (Urgent)",
      destinationName: provider.name,
      status: "available_manual",
      recommended: false,
      recommendationReason: "Fallback for urgent referrals only. Call the clinic immediately after faxing.",
      clinicalFitScore: 80,
      readinessScore: 90,
      estimatedTimeToAcceptedCare: "Same-day if called",
      acceptanceProbability: "high",
      riskLevel: "medium",
      riskReasons: ["No digital confirmation", "Must follow up with phone call"],
      requiredDocuments: [
        { name: "12-Lead ECG", status: "available", source: "EMR" },
      ],
      generatedForms: faxForms(sp),
      attachments: [{ name: "12-Lead ECG PDF", type: "ECG", status: "attached" }],
      submissionActions: faxActions(true, undefined),
      audit: audit(0, "unknown", 70),
    },
    unavailableOption(`${provider.id}_ocean_ereferral`, "ocean_ereferral", "Ocean eReferral",
      "Ocean eReferral is for non-urgent referrals. This pathway uses the rapid access portal."),
    unavailableOption(`${provider.id}_self_booking`, "patient_self_booking", "Patient Self-Booking",
      "Urgent referral — patient cannot self-book rapid access."),
  ];
}

function buildOrthoKneeOptions(
  provider: Provider,
  ready: boolean,
  sendDisabled: string | undefined
): ReferralDeliveryOption[] {
  const sp = provider.specialty;
  const orthoReqDocs: DeliveryRequiredDocument[] = [
    { name: "Weight-bearing X-ray (knee)", status: ready ? "available" : "missing", source: "external_lab", actionRequired: ready ? undefined : "Order weight-bearing X-ray before submission" },
    { name: "Physiotherapy Notes", status: ready ? "available" : "missing", source: "physician", actionRequired: ready ? undefined : "Attach documented conservative trial notes" },
    { name: "BMI / Weight", status: "available", source: "EMR" },
    { name: "Referral Letter", status: "not_applicable", source: "generated" },
  ];
  return [
    {
      id: `${provider.id}_central_intake`,
      methodType: "central_intake",
      portalName: "Surgical Waitlist Central Intake",
      destinationName: "Orthopaedic Regional Intake",
      status: "available_manual",
      recommended: false,
      recommendationReason:
        "Central intake triages orthopaedic surgical candidates. Ensures placement on the right waitlist without individual clinic redirect.",
      clinicalFitScore: provider.clinicalFit,
      readinessScore: ready ? 88 : 52,
      estimatedTimeToAcceptedCare: "~10 weeks (after triage)",
      acceptanceProbability: "high",
      riskLevel: "low",
      riskReasons: ready ? [] : ["Incomplete documentation causes triage delay"],
      requiredDocuments: orthoReqDocs,
      generatedForms: centralIntakeForms(sp),
      attachments: [
        { name: "Knee X-ray", type: "imaging", status: ready ? "attached" : "missing" },
        { name: "Physio Notes", type: "consult_note", status: ready ? "attached" : "missing" },
      ],
      submissionActions: manualPortalActions(ready, sendDisabled),
      audit: audit(14, "clinic_rules", 80),
    },
    {
      id: `${provider.id}_hospital_portal`,
      methodType: "hospital_portal",
      portalName: "Hospital Orthopaedic Referral Portal",
      destinationName: provider.name,
      status: "available_manual",
      recommended: false,
      recommendationReason: "Direct portal for this clinic. Manual entry required.",
      clinicalFitScore: 85,
      readinessScore: ready ? 82 : 50,
      estimatedTimeToAcceptedCare: "~10 weeks",
      acceptanceProbability: "high",
      riskLevel: "low",
      riskReasons: ["Transit not accessible — patient will need transport"],
      requiredDocuments: orthoReqDocs,
      generatedForms: hospitalPortalForms(sp),
      attachments: [
        { name: "Knee X-ray", type: "imaging", status: ready ? "attached" : "missing" },
        { name: "Physio Notes", type: "consult_note", status: ready ? "attached" : "missing" },
      ],
      submissionActions: manualPortalActions(ready, sendDisabled),
      audit: audit(5, "user_entered", 70),
    },
    {
      id: `${provider.id}_fax`,
      methodType: "fax",
      portalName: "eFax / Traditional Fax",
      destinationName: provider.name,
      status: "available_manual",
      recommended: false,
      recommendationReason: "Fallback only. Use central intake or hospital portal when possible.",
      clinicalFitScore: 72,
      readinessScore: ready ? 65 : 38,
      estimatedTimeToAcceptedCare: "~14 weeks (manual processing)",
      acceptanceProbability: "medium",
      riskLevel: "high",
      riskReasons: [
        "Availability last verified 14 days ago — may be outdated",
        "No tracking; referral may be lost in intake",
        "Long wait further increased by manual delay",
      ],
      requiredDocuments: orthoReqDocs,
      generatedForms: faxForms(sp),
      attachments: [
        { name: "Knee X-ray", type: "imaging", status: ready ? "attached" : "missing" },
      ],
      submissionActions: faxActions(true, undefined),
      audit: audit(0, "unknown", 50),
    },
    unavailableOption(`${provider.id}_ocean_ereferral`, "ocean_ereferral", "Ocean eReferral",
      "This clinic does not accept Ocean eReferrals. Use central intake or hospital portal."),
    unavailableOption(`${provider.id}_self_booking`, "patient_self_booking", "Patient Self-Booking",
      "Orthopaedic surgical assessment requires a physician referral."),
  ];
}

function buildCommunityOrthoOptions(
  provider: Provider,
  ready: boolean,
  sendDisabled: string | undefined
): ReferralDeliveryOption[] {
  return [
    {
      id: `${provider.id}_community_service`,
      methodType: "community_service",
      portalName: "Caredove Community eRefer",
      destinationName: provider.name,
      status: "connected",
      recommended: false,
      recommendationReason:
        "Connected to Caredove. Fastest pathway for MSK triage. Physio-led assessment determines surgical candidacy before committing to a specialist queue.",
      clinicalFitScore: provider.clinicalFit,
      readinessScore: ready ? 90 : 65,
      estimatedTimeToAcceptedCare: "~4 weeks (MSK triage)",
      acceptanceProbability: "medium",
      riskLevel: "low",
      riskReasons: [],
      requiredDocuments: [
        { name: "Physiotherapy Notes", status: ready ? "available" : "optional", source: "physician" },
        { name: "Service Request Form", status: "not_applicable", source: "generated" },
        { name: "Patient Consent", status: "not_applicable", source: "generated" },
      ],
      generatedForms: communityForms(),
      attachments: [
        { name: "Physio Notes", type: "consult_note", status: ready ? "attached" : "suggested" },
      ],
      submissionActions: communityActions(ready, sendDisabled),
      audit: audit(20, "provider_directory", 82),
    },
    {
      id: `${provider.id}_fax`,
      methodType: "fax",
      portalName: "eFax / Traditional Fax",
      destinationName: provider.name,
      status: "available_manual",
      recommended: false,
      recommendationReason: "Available as fallback. Caredove is preferred for community services.",
      clinicalFitScore: 65,
      readinessScore: ready ? 60 : 38,
      estimatedTimeToAcceptedCare: "~6 weeks (manual)",
      acceptanceProbability: "medium",
      riskLevel: "medium",
      riskReasons: ["No receipt confirmation", "Patient notification must be manual"],
      requiredDocuments: [
        { name: "Physiotherapy Notes", status: ready ? "available" : "missing", source: "physician" },
      ],
      generatedForms: faxForms(provider.specialty),
      attachments: [{ name: "Physio Notes", type: "consult_note", status: ready ? "attached" : "missing" }],
      submissionActions: faxActions(true, undefined),
      audit: audit(0, "unknown", 55),
    },
    unavailableOption(`${provider.id}_ocean_ereferral`, "ocean_ereferral", "Ocean eReferral",
      "Community MSK clinic does not use Ocean eReferral. Use Caredove eRefer."),
    unavailableOption(`${provider.id}_hospital_portal`, "hospital_portal", "Hospital Portal",
      "Community clinic does not use a hospital referral portal."),
    unavailableOption(`${provider.id}_self_booking`, "patient_self_booking", "Patient Self-Booking",
      "Physician referral required for community MSK assessment."),
  ];
}

function buildDermInPersonOptions(
  provider: Provider,
  ready: boolean,
  sendDisabled: string | undefined
): ReferralDeliveryOption[] {
  const sp = provider.specialty;
  return [
    {
      id: `${provider.id}_hospital_portal`,
      methodType: "hospital_portal",
      portalName: "University Dermatology Portal",
      destinationName: provider.name,
      status: "available_manual",
      recommended: false,
      recommendationReason:
        "Direct portal for in-person dermatology. Long routine wait — flag urgency if lesion is suspicious.",
      clinicalFitScore: provider.clinicalFit,
      readinessScore: ready ? 85 : 55,
      estimatedTimeToAcceptedCare: "~16 weeks (routine queue)",
      acceptanceProbability: "medium",
      riskLevel: "medium",
      riskReasons: ["16-week routine queue — consider teledermatology eConsult to fast-track urgent cases"],
      requiredDocuments: [
        { name: "Lesion Photo (dermoscopy preferred)", status: ready ? "available" : "missing", source: "physician", actionRequired: ready ? undefined : "Attach dermoscopic photo before submitting" },
        { name: "Referral Letter", status: "not_applicable", source: "generated" },
      ],
      generatedForms: hospitalPortalForms(sp),
      attachments: [
        { name: "Lesion Photo", type: "imaging", status: ready ? "attached" : "missing" },
      ],
      submissionActions: manualPortalActions(ready, sendDisabled),
      audit: audit(11, "provider_directory", 72),
    },
    {
      id: `${provider.id}_ocean_ereferral`,
      methodType: "ocean_ereferral",
      portalName: "Ocean eReferral Network",
      destinationName: provider.name,
      status: "available_manual",
      recommended: false,
      recommendationReason: "Ocean eReferral available manually — not connected for this destination.",
      clinicalFitScore: 80,
      readinessScore: ready ? 80 : 50,
      estimatedTimeToAcceptedCare: "~16 weeks",
      acceptanceProbability: "medium",
      riskLevel: "medium",
      riskReasons: ["Long wait queue regardless of submission channel"],
      requiredDocuments: [
        { name: "Lesion Photo", status: ready ? "available" : "missing", source: "physician" },
      ],
      generatedForms: ereferralForms(sp),
      attachments: [{ name: "Lesion Photo", type: "imaging", status: ready ? "attached" : "missing" }],
      submissionActions: manualPortalActions(ready, sendDisabled),
      audit: audit(0, "unknown", 60),
    },
    {
      id: `${provider.id}_fax`,
      methodType: "fax",
      portalName: "eFax / Traditional Fax",
      destinationName: provider.name,
      status: "available_manual",
      recommended: false,
      recommendationReason: "Highest-risk option. Long wait queue amplifies fax delay risk.",
      clinicalFitScore: 70,
      readinessScore: ready ? 60 : 35,
      estimatedTimeToAcceptedCare: "~20 weeks (fax + long queue)",
      acceptanceProbability: "medium",
      riskLevel: "high",
      riskReasons: [
        "16-week queue plus manual intake delay",
        "No confirmation of receipt",
        "Photo quality may be lost in fax transmission",
      ],
      requiredDocuments: [
        { name: "Lesion Photo", status: ready ? "available" : "missing", source: "physician" },
      ],
      generatedForms: faxForms(sp),
      attachments: [{ name: "Lesion Photo", type: "imaging", status: ready ? "attached" : "missing" }],
      submissionActions: faxActions(true, undefined),
      audit: audit(0, "unknown", 45),
    },
    unavailableOption(`${provider.id}_econsult`, "ocean_econsult", "Ocean eConsult",
      "eConsult is for specialist advice. Use teledermatology (Teledermatology Lesion Clinic) as the eConsult provider."),
    unavailableOption(`${provider.id}_self_booking`, "patient_self_booking", "Patient Self-Booking",
      "Physician referral required for dermatology."),
  ];
}

function buildGIFunctionalOptions(
  provider: Provider,
  ready: boolean,
  sendDisabled: string | undefined
): ReferralDeliveryOption[] {
  const sp = provider.specialty;
  const labDocs: DeliveryRequiredDocument[] = [
    { name: "CBC", status: ready ? "available" : "missing", source: "external_lab", actionRequired: ready ? undefined : "Order CBC panel before referral submission" },
    { name: "Celiac Screen (TTG-IgA)", status: ready ? "available" : "missing", source: "external_lab" },
    { name: "Alarm Symptom History", status: "available", source: "physician" },
    { name: "Referral Letter", status: "not_applicable", source: "generated" },
  ];
  return [
    {
      id: `${provider.id}_ocean_eorder`,
      methodType: "ocean_eorder",
      portalName: "Ocean eOrder / Diagnostic Request",
      destinationName: "Lab — Functional GI Panel",
      status: "available_manual",
      recommended: false,
      recommendationReason:
        "GI Functional Program triages on labs. Ordering the labs first is often the fastest route to accepted care — the referral may not be needed until results are available.",
      clinicalFitScore: 90,
      readinessScore: 95,
      estimatedTimeToAcceptedCare: "~2 weeks to results + ~13 weeks referral",
      acceptanceProbability: "high",
      riskLevel: "low",
      riskReasons: [],
      requiredDocuments: [
        { name: "Diagnostic Order", status: "not_applicable", source: "generated" },
        { name: "Clinical Indication", status: "available", source: "physician" },
      ],
      generatedForms: eorderForms(),
      attachments: [
        { name: "Lab Requisition", type: "lab", status: "suggested" },
      ],
      submissionActions: [
        { label: "Export diagnostic order", actionType: "export_package", enabled: true },
        { label: "Create admin task", actionType: "create_task", enabled: true },
      ],
      audit: audit(6, "clinic_rules", 88),
    },
    {
      id: `${provider.id}_ocean_ereferral`,
      methodType: "ocean_ereferral",
      portalName: "Ocean eReferral Network",
      destinationName: provider.name,
      status: "available_manual",
      recommended: false,
      recommendationReason:
        "Ocean eReferral available but not connected. Consider ordering labs first to avoid triage delay.",
      clinicalFitScore: provider.clinicalFit,
      readinessScore: ready ? 82 : 48,
      estimatedTimeToAcceptedCare: "~13 weeks (incomplete labs = triage delay)",
      acceptanceProbability: "medium",
      riskLevel: ready ? "low" : "medium",
      riskReasons: ready ? [] : ["Incomplete bloodwork is the top delay reason for this clinic"],
      requiredDocuments: labDocs,
      generatedForms: ereferralForms(sp),
      attachments: [
        { name: "CBC Results", type: "lab", status: ready ? "attached" : "missing" },
        { name: "Celiac Screen", type: "lab", status: ready ? "attached" : "missing" },
      ],
      submissionActions: manualPortalActions(ready, sendDisabled),
      audit: audit(6, "provider_directory", 75),
    },
    {
      id: `${provider.id}_fax`,
      methodType: "fax",
      portalName: "eFax / Traditional Fax",
      destinationName: provider.name,
      status: "available_manual",
      recommended: false,
      recommendationReason: "Fallback only. Incomplete labs will delay triage regardless of channel.",
      clinicalFitScore: 70,
      readinessScore: ready ? 60 : 35,
      estimatedTimeToAcceptedCare: "~16 weeks",
      acceptanceProbability: "medium",
      riskLevel: "high",
      riskReasons: [
        "Incomplete labs are top delay reason — fax won't resolve this",
        "No tracking or receipt confirmation",
      ],
      requiredDocuments: labDocs,
      generatedForms: faxForms(sp),
      attachments: [
        { name: "CBC Results", type: "lab", status: ready ? "attached" : "missing" },
      ],
      submissionActions: faxActions(true, undefined),
      audit: audit(0, "unknown", 52),
    },
    unavailableOption(`${provider.id}_central_intake`, "central_intake", "Central Intake",
      "This specialty does not use centralized intake — refer directly to the clinic."),
    unavailableOption(`${provider.id}_self_booking`, "patient_self_booking", "Patient Self-Booking",
      "Physician referral required for gastroenterology."),
  ];
}

function buildEconsultProviderOptions(
  provider: Provider,
  ready: boolean,
  sendDisabled: string | undefined,
  sp: string
): ReferralDeliveryOption[] {
  const reqDocs: DeliveryRequiredDocument[] = [
    { name: "Clinical Question", status: "not_applicable", source: "generated" },
    { name: "Relevant History", status: "available", source: "EMR" },
    { name: "Key Investigation Results", status: ready ? "available" : "missing", source: "external_lab" },
  ];
  return [
    {
      id: `${provider.id}_ocean_econsult`,
      methodType: "ocean_econsult",
      portalName: "Ocean eConsult",
      destinationName: provider.name,
      status: "connected",
      recommended: false,
      recommendationReason:
        "Connected eConsult channel. Specialist responds in days. Resolves ~64% of cases without a full referral, avoiding unnecessary in-person waits.",
      clinicalFitScore: provider.clinicalFit,
      readinessScore: ready ? 92 : 70,
      estimatedTimeToAcceptedCare: "~3–7 days for specialist response",
      acceptanceProbability: "high",
      riskLevel: "low",
      riskReasons: [],
      requiredDocuments: reqDocs,
      generatedForms: econsultForms(),
      attachments: [
        { name: "Key Investigation Results", type: "lab", status: ready ? "attached" : "suggested" },
      ],
      submissionActions: digitalActions(ready, sendDisabled, "Send eConsult through Ocean"),
      audit: audit(provider.availabilityVerifiedDaysAgo, "provider_directory", 95),
    },
    {
      id: `${provider.id}_ocean_ereferral`,
      methodType: "ocean_ereferral",
      portalName: "Ocean eReferral Network",
      destinationName: provider.name,
      status: "available_manual",
      recommended: false,
      recommendationReason:
        "Use if eConsult response indicates a full referral is needed. Manual Ocean export required.",
      clinicalFitScore: provider.clinicalFit - 5,
      readinessScore: ready ? 80 : 50,
      estimatedTimeToAcceptedCare: "Depends on eConsult outcome",
      acceptanceProbability: "high",
      riskLevel: "low",
      riskReasons: ["Only appropriate if eConsult confirms full referral is needed"],
      requiredDocuments: [
        ...reqDocs,
        { name: "eConsult Response", status: "missing", source: "physician", actionRequired: "Complete eConsult first, then use this option if referral is confirmed" },
      ],
      generatedForms: ereferralForms(sp),
      attachments: [
        { name: "Investigation Results", type: "lab", status: ready ? "attached" : "suggested" },
      ],
      submissionActions: manualPortalActions(ready, sendDisabled),
      audit: audit(provider.availabilityVerifiedDaysAgo, "provider_directory", 80),
    },
    {
      id: `${provider.id}_fax`,
      methodType: "fax",
      portalName: "eFax / Traditional Fax",
      destinationName: provider.name,
      status: "available_manual",
      recommended: false,
      recommendationReason:
        "Ocean eConsult is strongly preferred. Use fax only if Ocean is unavailable.",
      clinicalFitScore: provider.clinicalFit - 15,
      readinessScore: ready ? 65 : 40,
      estimatedTimeToAcceptedCare: "~1–2 weeks (slow if fax queue is long)",
      acceptanceProbability: "medium",
      riskLevel: "medium",
      riskReasons: ["Ocean eConsult is faster and fully tracked — fax should be last resort"],
      requiredDocuments: reqDocs,
      generatedForms: faxForms(sp),
      attachments: [
        { name: "Investigation Results", type: "lab", status: ready ? "attached" : "suggested" },
      ],
      submissionActions: faxActions(true, undefined),
      audit: audit(0, "unknown", 55),
    },
    unavailableOption(`${provider.id}_self_booking`, "patient_self_booking", "Patient Self-Booking",
      "eConsult requires physician initiation — patient cannot self-request."),
    unavailableOption(`${provider.id}_central_intake`, "central_intake", "Central Intake",
      "eConsult does not route through central intake."),
  ];
}

function buildDefaultOptions(
  provider: Provider,
  ready: boolean,
  sendDisabled: string | undefined,
  sp: string
): ReferralDeliveryOption[] {
  return [
    {
      id: `${provider.id}_ocean_ereferral`,
      methodType: "ocean_ereferral",
      portalName: "Ocean eReferral Network",
      destinationName: provider.name,
      status: "available_manual",
      recommended: false,
      recommendationReason: "Ocean eReferral package available for manual upload.",
      clinicalFitScore: provider.clinicalFit,
      readinessScore: ready ? 80 : 50,
      estimatedTimeToAcceptedCare: `~${provider.rawWaitWeeks + 2} weeks`,
      acceptanceProbability: provider.acceptanceProbability,
      riskLevel: "low",
      riskReasons: [],
      requiredDocuments: [
        { name: "Referral Letter", status: "not_applicable", source: "generated" },
      ],
      generatedForms: ereferralForms(sp),
      attachments: [],
      submissionActions: manualPortalActions(ready, sendDisabled),
      audit: audit(provider.availabilityVerifiedDaysAgo, "provider_directory", 70),
    },
    {
      id: `${provider.id}_fax`,
      methodType: "fax",
      portalName: "eFax / Traditional Fax",
      destinationName: provider.name,
      status: "available_manual",
      recommended: false,
      recommendationReason: "Fax available as fallback. Use digital options when possible.",
      clinicalFitScore: provider.clinicalFit - 10,
      readinessScore: ready ? 65 : 40,
      estimatedTimeToAcceptedCare: `~${provider.rawWaitWeeks + 4} weeks`,
      acceptanceProbability: "medium",
      riskLevel: "medium",
      riskReasons: ["No tracking", "Manual intake risk"],
      requiredDocuments: [
        { name: "Referral Letter", status: "not_applicable", source: "generated" },
      ],
      generatedForms: faxForms(sp),
      attachments: [],
      submissionActions: faxActions(true, undefined),
      audit: audit(0, "unknown", 55),
    },
    unavailableOption(`${provider.id}_self_booking`, "patient_self_booking", "Patient Self-Booking",
      "Physician referral required for this specialty."),
  ];
}
