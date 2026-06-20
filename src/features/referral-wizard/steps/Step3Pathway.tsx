import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import type { Patient } from "@/types";
import { PATHWAYS, getPathway } from "@/data/pathways";
import { useReferralStore } from "@/store/useReferralStore";
import { Badge, Card, cn } from "@/components/ui";
import { StepHeading, StepNav } from "../parts";

export function Step3Pathway({ patient }: { patient: Patient }) {
  const nextStep = useReferralStore((s) => s.nextStep);
  const prevStep = useReferralStore((s) => s.prevStep);
  const pathwayId = useReferralStore((s) => s.pathwayId);
  const setPathway = useReferralStore((s) => s.setPathway);

  const recommended = getPathway(patient.recommendedPathwayId);
  // Selectable pathways = same specialty, excluding urgent variants.
  const options = Object.values(PATHWAYS).filter(
    (p) => p.specialty === recommended.specialty && !p.id.includes("urgent")
  );
  const selected = pathwayId ?? recommended.id;

  return (
    <div>
      <StepHeading
        eyebrow="Step 3 · Pathway Agent"
        title="Select specialty, subspecialty & service line"
        subtitle="Choosing the right subspecialty up front avoids a generic-clinic bounce-back."
      />

      <div className="space-y-3">
        {options.map((p) => {
          const isSelected = p.id === selected;
          const isRecommended = p.id === recommended.id;
          return (
            <motion.button
              key={p.id}
              layout
              onClick={() => setPathway(p.id)}
              className={cn(
                "w-full rounded-2xl p-4 text-left ring-1 transition-all",
                isSelected
                  ? "bg-primary-50 ring-2 ring-primary-400 shadow-soft"
                  : "bg-white ring-sand-200 hover:ring-primary-200"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-sand-900">
                      {p.specialty} → {p.subspecialty}
                    </span>
                    {isRecommended && (
                      <Badge tone="lavender">
                        <Sparkles className="h-3 w-3" /> AI recommended
                      </Badge>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs font-medium text-sand-400">
                    Service line · {p.serviceLine}
                  </div>
                  <p className="mt-2 text-sm text-sand-600">{p.note}</p>
                </div>
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    isSelected ? "bg-primary-500 text-white" : "bg-sand-100 text-transparent"
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <Card className="mt-4 bg-lavender-50/60 ring-lavender-100">
        <p className="text-sm text-sand-600">
          <span className="font-semibold text-lavender-700">Why subspecialty matters: </span>
          generic referrals are a top cause of redirects and rework. Matching the right service line
          first improves acceptance and shortens time-to-accepted-care.
        </p>
      </Card>

      <StepNav onBack={prevStep} onNext={nextStep} nextLabel="Check readiness" />
    </div>
  );
}
