import { useState } from "react";
import { motion } from "framer-motion";
import { Compass, FileText, Lightbulb } from "lucide-react";
import type { Patient } from "@/types";
import { getPathway } from "@/data/pathways";
import { useReferralStore } from "@/store/useReferralStore";
import { AIChip, AIThinking, ResponsibleAIBanner, StreamingText } from "@/components/ai";
import { Badge, Card, SourceChip, cn } from "@/components/ui";
import { StepHeading, StepNav, ReasonList } from "../parts";

export function Step1Intent({ patient }: { patient: Patient }) {
  const nextStep = useReferralStore((s) => s.nextStep);
  const close = useReferralStore((s) => s.closeReferral);
  const [ready, setReady] = useState(false);
  const pathway = getPathway(patient.recommendedPathwayId);
  const intent = patient.intent;

  return (
    <div>
      <StepHeading
        eyebrow="Step 1 · Referral Intent Detection"
        title={
          <span className="flex items-center gap-2">
            Reading the visit <AIChip>Intent Agent</AIChip>
          </span>
        }
        subtitle="The AI captured the visit note, EMR history, labs and patient constraints."
      />

      <AIThinking
        steps={[
          "Parsing visit transcript & note",
          "Cross-referencing EMR history",
          "Scanning labs, imaging & meds",
          "Detecting referral intent",
        ]}
        onDone={() => setReady(true)}
      />

      {ready && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 space-y-4"
        >
          <Card
            className={cn(
              "border-l-4",
              intent.detected ? "border-l-primary-500" : "border-l-amber-400"
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <Badge tone={intent.detected ? "primary" : "warning"}>
                {intent.detected ? "Potential referral detected" : "Referral may not be needed"}
              </Badge>
              <span className="text-xs font-semibold text-sand-400">
                Confidence {intent.confidence}%
              </span>
            </div>

            <p className="text-base font-semibold text-sand-800">
              <StreamingText text={intent.headline} />
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-sand-400">
                  <FileText className="h-3.5 w-3.5" /> Why
                </div>
                <ReasonList reasons={intent.reasons} />
                <div className="mt-3 flex flex-wrap gap-1">
                  <SourceChip>visit note</SourceChip>
                  <SourceChip>ECG · chart</SourceChip>
                  <SourceChip>med list</SourceChip>
                </div>
              </div>

              <div className="rounded-xl bg-lavender-50 p-3.5 ring-1 ring-lavender-100">
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-lavender-500">
                  <Compass className="h-3.5 w-3.5" /> Suggested pathway
                </div>
                <div className="text-sm font-bold text-sand-900">
                  {pathway.specialty} → {pathway.subspecialty}
                </div>
                <p className="mt-1 text-xs text-sand-500">{pathway.note}</p>
              </div>
            </div>
          </Card>

          {patient.alternative && (
            <Card className="bg-amber-50/60 ring-amber-200">
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-600">
                <Lightbulb className="h-3.5 w-3.5" /> Alternative pathway
              </div>
              <div className="text-sm font-bold text-sand-900">{patient.alternative.title}</div>
              <p className="mt-1 text-sm text-sand-600">{patient.alternative.detail}</p>
              <p className="mt-1 text-xs font-semibold text-amber-600">
                Expected response: {patient.alternative.expectedResponse}
              </p>
            </Card>
          )}

          <ResponsibleAIBanner compact />

          <StepNav
            backLabel="Cancel"
            onBack={close}
            onNext={nextStep}
            nextLabel="Evaluate referral"
          />
        </motion.div>
      )}
    </div>
  );
}
