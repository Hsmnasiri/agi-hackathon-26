/**
 * Simulated AI layer — no network, no API key.
 * Provides realistic latency + a token-streaming hook so each "agent" step
 * (intent, pathway, readiness, routing, draft) feels like a live model.
 *
 * Swappable later: replace these with real Claude calls (claude-opus-4-8 /
 * claude-sonnet-4-6) behind the same async signatures.
 */

import { useEffect, useRef, useState } from "react";

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Simulate an async "agent" returning a value after some think-time. */
export async function think<T>(value: T, ms = 900): Promise<T> {
  await sleep(ms);
  return value;
}

export interface StreamOptions {
  /** Characters per tick. */
  chunk?: number;
  /** ms between ticks. */
  speed?: number;
  enabled?: boolean;
}

/**
 * Streams `text` character-by-character to mimic token streaming.
 * Returns the partial text and a `done` flag.
 */
export function useStreamingText(text: string, opts: StreamOptions = {}) {
  const { chunk = 2, speed = 16, enabled = true } = opts;
  const [output, setOutput] = useState(enabled ? "" : text);
  const [done, setDone] = useState(!enabled);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setOutput(text);
      setDone(true);
      return;
    }
    setOutput("");
    setDone(false);
    let i = 0;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      i += chunk;
      setOutput(text.slice(0, i));
      if (i >= text.length) {
        setDone(true);
        return;
      }
      frame.current = window.setTimeout(tick, speed);
    };
    frame.current = window.setTimeout(tick, speed);

    return () => {
      cancelled = true;
      if (frame.current) window.clearTimeout(frame.current);
    };
  }, [text, chunk, speed, enabled]);

  return { output, done };
}

/**
 * Drives a short "thinking" sequence of agent labels with delays.
 * Returns the index of the currently-active step and whether the run is done.
 */
export function useAgentSequence(steps: string[], stepMs = 700, enabled = true) {
  const [active, setActive] = useState(enabled ? 0 : steps.length);
  const [done, setDone] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setActive(steps.length);
      setDone(true);
      return;
    }
    setActive(0);
    setDone(false);
    let cancelled = false;
    const timers: number[] = [];

    steps.forEach((_, idx) => {
      const t = window.setTimeout(() => {
        if (cancelled) return;
        setActive(idx + 1);
        if (idx === steps.length - 1) setDone(true);
      }, stepMs * (idx + 1));
      timers.push(t);
    });

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, stepMs, steps.length]);

  return { active, done };
}
