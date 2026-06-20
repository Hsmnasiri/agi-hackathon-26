import { useEffect, useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useAgentSequence, useStreamingText } from "@/lib/aiSimulator";
import { useReferralStore } from "@/store/useReferralStore";
import { cn } from "./ui";

/** Fire `onDone` exactly once, the first time `done` flips true (in an effect,
 *  never during render). */
function useOnDone(done: boolean, onDone?: () => void) {
  const ref = useRef(onDone);
  ref.current = onDone;
  useEffect(() => {
    if (done) ref.current?.();
  }, [done]);
}

/* ----------------------------------------------------------------------------
 * StreamingText — types the text out (token streaming feel)
 * ------------------------------------------------------------------------- */
export function StreamingText({
  text,
  className,
  onDone,
}: {
  text: string;
  className?: string;
  onDone?: () => void;
}) {
  const streaming = useReferralStore((s) => s.streaming);
  const { output, done } = useStreamingText(text, { enabled: streaming });
  useOnDone(done, onDone);
  return (
    <span className={cn(!done && "stream-caret", className)}>{output}</span>
  );
}

/* ----------------------------------------------------------------------------
 * AIThinking — animated "agents running" sequence
 * ------------------------------------------------------------------------- */
export function AIThinking({
  steps,
  onDone,
  title = "AI agents working",
}: {
  steps: string[];
  onDone?: () => void;
  title?: string;
}) {
  const streaming = useReferralStore((s) => s.streaming);
  const { active, done } = useAgentSequence(steps, 600, streaming);
  useOnDone(done, onDone);

  return (
    <div className="rounded-2xl bg-lavender-50 p-4 ring-1 ring-lavender-100">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-lavender-700">
        <Sparkles className="h-4 w-4" /> {title}
      </div>
      <ul className="space-y-2">
        {steps.map((step, i) => {
          const isDone = i < active;
          const isActive = i === active;
          return (
            <li key={step} className="flex items-center gap-2.5 text-sm">
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full",
                  isDone
                    ? "bg-primary-500 text-white"
                    : isActive
                      ? "bg-lavender-200 text-lavender-700"
                      : "bg-sand-200 text-sand-400"
                )}
              >
                {isDone ? (
                  <Check className="h-3 w-3" />
                ) : isActive ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </span>
              <span className={cn(isDone || isActive ? "text-sand-700" : "text-sand-400")}>
                {step}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * ResponsibleAIBanner — always-visible guardrail
 * ------------------------------------------------------------------------- */
export function ResponsibleAIBanner({ compact = false }: { compact?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex items-start gap-2.5 rounded-xl bg-primary-50 px-3.5 py-2.5 text-primary-800 ring-1 ring-primary-200",
        compact ? "text-xs" : "text-sm"
      )}
    >
      <ShieldCheck className={cn("mt-0.5 shrink-0 text-primary-600", compact ? "h-4 w-4" : "h-5 w-5")} />
      <p>
        <span className="font-semibold">Physician review required.</span> Referral GPS
        recommends pathways — it does not diagnose and never sends a referral automatically.
      </p>
    </motion.div>
  );
}

/* ----------------------------------------------------------------------------
 * AIChip — small "AI" tag
 * ------------------------------------------------------------------------- */
export function AIChip({ children }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-lavender-100 px-2 py-0.5 text-[11px] font-semibold text-lavender-700">
      <Sparkles className="h-3 w-3" /> {children ?? "AI"}
    </span>
  );
}
