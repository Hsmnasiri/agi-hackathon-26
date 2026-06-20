import { motion } from "framer-motion";
import { ArrowRight, Stethoscope } from "lucide-react";
import { PATIENTS } from "@/data/patients";
import { getPathway } from "@/data/pathways";
import { useReferralStore } from "@/store/useReferralStore";
import { ReferralWizard } from "@/features/referral-wizard/ReferralWizard";
import { Avatar, Badge, Card, SectionTitle, cn } from "@/components/ui";
import { AIChip, ResponsibleAIBanner } from "@/components/ai";
import { initials } from "@/lib/format";

export default function WorkbenchPage() {
  const activePatientId = useReferralStore((s) => s.activePatientId);
  const startReferral = useReferralStore((s) => s.startReferral);

  if (activePatientId) {
    return <ReferralWizard patientId={activePatientId} />;
  }

  return (
    <div className="space-y-5">
      <ResponsibleAIBanner />

      <div>
        <SectionTitle
          eyebrow="Today's visits"
          title="Pick a patient to evaluate a referral"
          subtitle="The AI has already pre-screened each chart for referral intent."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {PATIENTS.map((patient, i) => {
            const pathway = getPathway(patient.recommendedPathwayId);
            const isUrgent = patient.redFlags.length > 0;
            return (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className={cn(
                    "h-full transition-all hover:shadow-soft-lg",
                    isUrgent && "ring-2 ring-rose-200"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar initials={initials(patient.name)} hue={patient.avatarHue} size={48} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-bold text-sand-900">{patient.name}</h3>
                        {isUrgent && <Badge tone="danger">Urgent</Badge>}
                      </div>
                      <div className="text-xs text-sand-400">
                        {patient.age} · {patient.sex} · {patient.mrn}
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-sand-600">{patient.reason}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <AIChip>Intent {patient.intent.confidence}%</AIChip>
                    <Badge tone={patient.intent.detected ? "primary" : "warning"}>
                      {patient.intent.detected
                        ? `${pathway.specialty} → ${pathway.subspecialty}`
                        : "Referral may not be needed"}
                    </Badge>
                  </div>

                  <button
                    onClick={() => startReferral(patient.id)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                  >
                    <Stethoscope className="h-4 w-4" /> Evaluate referral
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
