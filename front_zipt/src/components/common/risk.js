/* ───────────────────────── Risk system helpers ───────────────────────── */
export const RISK = {
  safe:   { key: "safe",   label: "안전",   color: "var(--safe)",   soft: "var(--safe-soft)",   on: "var(--safe-600)" },
  warn:   { key: "warn",   label: "주의",   color: "var(--warn)",   soft: "var(--warn-soft)",   on: "var(--warn-600)" },
  danger: { key: "danger", label: "위험",   color: "var(--danger)", soft: "var(--danger-soft)", on: "var(--danger-600)" },
};
export function riskFromScore(s) { return s >= 70 ? RISK.safe : s >= 40 ? RISK.warn : RISK.danger; }
