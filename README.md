# Referral GPS

**The intelligence layer before referral intake.** Referral GPS helps primary-care
doctors send the right patient to the right specialist, with the right documents,
through the **fastest realistic pathway** — and then tracks the referral
closed-loop until the patient is actually seen.

> It doesn't just check "is the referral complete?" — it chooses the best
> **pathway and destination before the referral enters the queue**, optimising for
> **time-to-accepted-care** instead of the shortest advertised wait.

This repo is a dynamic, single-page demo (React + TypeScript) running on dummy
data and a **simulated AI layer** — no backend or API key required.

---

## Quick start

```bash
npm install
npm run dev
```

Then open **http://localhost:5173**.

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server (hot reload) |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

---

## What to try in the demo

1. **Impact** — the landing dashboard makes the case: why referrals are
   healthcare's last broken handoff, and what changes when routing happens before
   intake.
2. **Workbench** — pick a patient (start with **Sarah Chen**) and walk the
   7-step referral wizard:
   - Intent detection → safety/urgency → subspecialty pathway → **live readiness
     score** (click "Order Holter" and watch it recompute) → **ranked
     destinations** with a transparent "why this clinic?" breakdown → AI-drafted
     letter → sign & send.
   - Try **Marcus Webb** to see the red-flag **urgent** branch.
3. **Referral Tracker** — the closed loop: accepted, needs-info (resolve gaps),
   rejected (re-route), and no-response (escalate). Simulate clinic responses.
4. **Role switcher** (top bar) — view the app as a **Physician**, **Clinic
   Admin**, or **Patient**. Each role sees a different slice.

Toggle the **AI streaming** animation from the sidebar.

---

## Architecture

See **[ARCHITECTURE.md](ARCHITECTURE.md)** for the agent pipeline, data model,
scoring algorithm, responsible-AI checkpoints, and how to swap the simulated AI
for real Claude calls.

---

## Tech stack

Vite · React 18 · TypeScript · TailwindCSS · framer-motion · zustand · recharts ·
react-router-dom · lucide-react.

> Demo only — all clinical data is fictional. Referral GPS recommends pathways; a
> physician reviews and signs every referral. It does not diagnose.
