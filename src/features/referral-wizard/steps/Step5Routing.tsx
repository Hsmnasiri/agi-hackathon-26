import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, Video, Building2, Check, ChevronDown, Trophy } from "lucide-react";
import type { Patient, RankedProvider } from "@/types";
import { getProvidersByIds } from "@/data/providers";
import { computeReadiness } from "@/lib/readiness";
import { rankProviders } from "@/lib/scoring";
import { weeksLabel, daysAgoLabel } from "@/lib/format";
import { useReferralStore } from "@/store/useReferralStore";
import { AIThinking } from "@/components/ai";
import { Badge, Card, ScoreBar, cn } from "@/components/ui";
import { StepHeading, StepNav } from "../parts";

const RANK_LABEL = ["Best clinical fit", "Fastest realistic care", "Highest acceptance"];

export function Step5Routing({ patient }: { patient: Patient }) {
  const nextStep = useReferralStore((s) => s.nextStep);
  const prevStep = useReferralStore((s) => s.prevStep);
  const presentDocIds = useReferralStore((s) => s.presentDocIds);
  const selectedProviderId = useReferralStore((s) => s.selectedProviderId);
  const selectProvider = useReferralStore((s) => s.selectProvider);
  const [ready, setReady] = useState(false);

  const readiness = computeReadiness(patient, presentDocIds).score;
  const ranked = rankProviders(
    getProvidersByIds(patient.candidateProviderIds),
    readiness
  ).slice(0, 3);

  return (
    <div>
      <StepHeading
        eyebrow="Step 5 · Routing Agent"
        title="Ranked destinations — by time-to-accepted-care"
        subtitle="Not the shortest wait — the fastest realistic path to accepted care."
      />

      <AIThinking
        title="Routing Agent working"
        steps={[
          "Querying provider directory",
          "Scoring clinical fit & acceptance",
          "Modelling time-to-accepted-care",
          "Ranking top options",
        ]}
        onDone={() => setReady(true)}
      />

      {ready && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 space-y-3"
        >
          {ranked.map((r, i) => (
            <ProviderCard
              key={r.provider.id}
              ranked={r}
              rank={i}
              selected={selectedProviderId === r.provider.id}
              onSelect={() => selectProvider(r.provider.id)}
            />
          ))}

          <StepNav
            onBack={prevStep}
            onNext={nextStep}
            nextLabel="Draft referral"
            nextDisabled={!selectedProviderId}
          />
        </motion.div>
      )}
    </div>
  );
}

function ProviderCard({
  ranked,
  rank,
  selected,
  onSelect,
}: {
  ranked: RankedProvider;
  rank: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const [showWhy, setShowWhy] = useState(rank === 0);
  const p = ranked.provider;
  const ModalityIcon = p.modality === "virtual" ? Video : Building2;

  return (
    <Card
      className={cn(
        "transition-all",
        selected ? "ring-2 ring-primary-400 shadow-soft" : "ring-sand-200"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {rank === 0 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Trophy className="h-3.5 w-3.5" />
              </span>
            )}
            <h3 className="text-base font-bold text-sand-900">{p.name}</h3>
            {p.isEconsult && <Badge tone="info">eConsult</Badge>}
          </div>
          <div className="mt-0.5 text-xs font-medium text-lavender-600">{RANK_LABEL[rank]}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold text-primary-600">{ranked.score}%</div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-sand-400">
            match score
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric
          icon={<Clock className="h-3.5 w-3.5" />}
          label="Time-to-care"
          value={weeksLabel(ranked.timeToAcceptedCareWeeks)}
          highlight
        />
        <Metric
          icon={<Check className="h-3.5 w-3.5" />}
          label="Acceptance"
          value={p.acceptanceProbability}
        />
        <Metric
          icon={<ModalityIcon className="h-3.5 w-3.5" />}
          label="Modality"
          value={p.modality}
        />
        <Metric
          icon={<MapPin className="h-3.5 w-3.5" />}
          label="Distance"
          value={p.modality === "virtual" ? "remote" : `${p.distanceKm} km`}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {ranked.reasons.slice(0, 3).map((r) => (
          <span
            key={r}
            className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2 py-1 text-[11px] font-medium text-primary-700"
          >
            ✓ {r}
          </span>
        ))}
        {ranked.warnings.map((w) => (
          <span
            key={w}
            className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700"
          >
            ⚠ {w}
          </span>
        ))}
      </div>

      <button
        onClick={() => setShowWhy((v) => !v)}
        className="mt-3 flex items-center gap-1 text-xs font-semibold text-lavender-600 hover:text-lavender-700"
      >
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showWhy && "rotate-180")} />
        Why this clinic? (score breakdown)
      </button>

      {showWhy && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-2 space-y-2 overflow-hidden rounded-xl bg-sand-50 p-3"
        >
          {ranked.factors.map((f) => (
            <div key={f.key}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-sand-700">{f.label}</span>
                <span className="text-sand-400">
                  {Math.round(f.raw)} × {Math.round(f.weight * 100)}% ={" "}
                  <span className="font-semibold text-sand-600">
                    {Math.round(f.contribution)}
                  </span>
                </span>
              </div>
              <ScoreBar value={f.raw} tone="lavender" className="mt-1 h-1.5" />
              <p className="mt-0.5 text-[11px] text-sand-400">{f.reason}</p>
            </div>
          ))}
          <p className="pt-1 text-[11px] text-sand-400">
            Availability last verified {daysAgoLabel(p.availabilityVerifiedDaysAgo)}.
          </p>
        </motion.div>
      )}

      <div className="mt-4">
        <button
          onClick={onSelect}
          className={cn(
            "w-full rounded-xl py-2.5 text-sm font-semibold transition-colors",
            selected
              ? "bg-primary-500 text-white"
              : "bg-primary-50 text-primary-700 ring-1 ring-primary-200 hover:bg-primary-100"
          )}
        >
          {selected ? (
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4" /> Selected
            </span>
          ) : (
            "Select this destination"
          )}
        </button>
      </div>
    </Card>
  );
}

function Metric({
  icon,
  label,
  value,
  highlight,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg px-2.5 py-2 ring-1",
        highlight ? "bg-lavender-50 ring-lavender-100" : "bg-white ring-sand-200"
      )}
    >
      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-sand-400">
        {icon} {label}
      </div>
      <div
        className={cn(
          "mt-0.5 text-sm font-bold capitalize",
          highlight ? "text-lavender-700" : "text-sand-800"
        )}
      >
        {value}
      </div>
    </div>
  );
}
