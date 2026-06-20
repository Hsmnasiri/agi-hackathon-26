import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ShieldCheck, Siren } from "lucide-react";
import type { Patient } from "@/types";
import { getProvider } from "@/data/providers";
import { useReferralStore } from "@/store/useReferralStore";
import { AIThinking } from "@/components/ai";
import { Badge, Button, Card } from "@/components/ui";
import { StepHeading, StepNav, ReasonList } from "../parts";

export function Step2Safety({ patient }: { patient: Patient }) {
  const nextStep = useReferralStore((s) => s.nextStep);
  const prevStep = useReferralStore((s) => s.prevStep);
  const goToStep = useReferralStore((s) => s.goToStep);
  const selectProvider = useReferralStore((s) => s.selectProvider);
  const [ready, setReady] = useState(false);

  const hasRedFlags = patient.redFlags.length > 0;
  const urgentProvider = hasRedFlags ? getProvider(patient.candidateProviderIds[0]) : null;

  return (
    <div>
      <StepHeading
        eyebrow="Step 2 · Safety & Urgency Check"
        title="Screening for red flags"
        subtitle="Before routing, the AI checks for anything that needs an urgent pathway."
      />

      <AIThinking
        title="Safety Agent working"
        steps={[
          "Checking vitals & ECG findings",
          "Screening red-flag symptoms",
          "Estimating acuity",
        ]}
        onDone={() => setReady(true)}
      />

      {ready && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 space-y-4"
        >
          {hasRedFlags ? (
            <Card className="border-l-4 border-l-rose-500 bg-rose-50/50">
              <div className="mb-3 flex items-center gap-2">
                <Siren className="h-5 w-5 text-rose-500" />
                <Badge tone="danger">Red flags detected — urgent pathway</Badge>
              </div>
              <ReasonList reasons={patient.redFlags} tone="warn" />
              <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-rose-200">
                <div className="text-xs font-bold uppercase tracking-wide text-rose-500">
                  Recommended urgent destination
                </div>
                <div className="mt-1 text-base font-bold text-sand-900">
                  {urgentProvider?.name}
                </div>
                <p className="mt-1 text-sm text-sand-600">{urgentProvider?.note}</p>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-100/60 px-3 py-2 text-xs font-semibold text-rose-700">
                <AlertTriangle className="h-4 w-4" /> Physician must review and approve the urgent
                referral.
              </div>
            </Card>
          ) : (
            <Card className="border-l-4 border-l-primary-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary-500" />
                <Badge tone="primary">No red flags — safe for standard routing</Badge>
              </div>
              <p className="mt-2 text-sm text-sand-600">
                No urgent features identified. Continue to choose the best subspecialty pathway.
              </p>
            </Card>
          )}

          {hasRedFlags ? (
            <StepNav onBack={prevStep}>
              <Button
                variant="danger"
                size="lg"
                onClick={() => {
                  if (urgentProvider) selectProvider(urgentProvider.id);
                  goToStep("draft");
                }}
              >
                Review urgent referral
              </Button>
            </StepNav>
          ) : (
            <StepNav onBack={prevStep} onNext={nextStep} nextLabel="Choose pathway" />
          )}
        </motion.div>
      )}
    </div>
  );
}
