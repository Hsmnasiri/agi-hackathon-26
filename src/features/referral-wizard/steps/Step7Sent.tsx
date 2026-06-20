import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Radar, RotateCcw, Bell } from "lucide-react";
import type { Patient } from "@/types";
import { useReferralStore } from "@/store/useReferralStore";
import { Button, Card } from "@/components/ui";

export function Step7Sent({ patient }: { patient: Patient }) {
  const navigate = useNavigate();
  const lastSentReferralId = useReferralStore((s) => s.lastSentReferralId);
  const referrals = useReferralStore((s) => s.referrals);
  const close = useReferralStore((s) => s.closeReferral);

  const referral = referrals.find((r) => r.id === lastSentReferralId);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto max-w-xl text-center"
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
        <CheckCircle2 className="h-9 w-9 text-primary-600" />
      </div>
      <h2 className="text-2xl font-extrabold text-sand-900">Referral sent</h2>
      <p className="mt-1 text-sand-500">
        {patient.name}'s referral is now in closed-loop tracking.
      </p>

      {referral && (
        <Card className="mt-6 text-left">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Referral ID" value={referral.id} />
            <Stat label="Destination" value={referral.providerName} />
            <Stat label="Match score" value={`${referral.matchScore}%`} />
            <Stat
              label="Time-to-care"
              value={`${referral.timeToAcceptedCareWeeks} wk`}
            />
          </div>

          <div className="mt-4 rounded-xl bg-lavender-50 p-3.5 ring-1 ring-lavender-100">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-lavender-500">
              <Bell className="h-3.5 w-3.5" /> What happens next
            </div>
            <ul className="space-y-1 text-sm text-sand-600">
              <li>• Destination clinic response is tracked automatically.</li>
              <li>• If the clinic needs more info, a gap-resolution task is created.</li>
              <li>• The patient receives prep instructions and reminders.</li>
            </ul>
          </div>
        </Card>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => {
            close();
            navigate("/tracker");
          }}
        >
          <Radar className="h-4 w-4" /> Open Referral Tracker
        </Button>
        <Button variant="ghost" onClick={close}>
          <RotateCcw className="h-4 w-4" /> New referral
        </Button>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wide text-sand-400">{label}</div>
      <div className="mt-0.5 text-sm font-bold text-sand-800">{value}</div>
    </div>
  );
}
