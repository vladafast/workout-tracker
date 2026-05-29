import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { computeStreak } from "../utils/helpers";
import { hsl } from "../utils/theme";

export default function StreakBanner({ savedData, accent = { hue: 245, sat: 72 } }) {
  const { current, longest, atRisk } = computeStreak(savedData);
  const { hue, sat } = accent;

  if (current === 0 && !atRisk) return null;

  const color  = atRisk ? "hsl(0,72%,65%)" : hsl(hue, sat, 70);
  const bg     = atRisk ? "var(--danger-dim)" : hsl(hue, sat, 60, 0.08);
  const border = atRisk ? "rgba(239,68,68,0.25)" : hsl(hue, sat, 60, 0.22);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 340, damping: 26 }}
        style={{
          marginBottom: 12,
          borderRadius: "var(--radius-md)",
          padding: "13px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: bg,
          border: `1px solid ${border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <motion.span
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontSize: 22, color, lineHeight: 1 }}
          >
            <i className={atRisk ? "ti ti-alert-triangle" : "ti ti-flame"} aria-hidden="true" />
          </motion.span>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color, lineHeight: 1.2 }}>
              {current > 0 ? `${current} dan${current === 1 ? "" : "a"} niza` : "Niz u opasnosti!"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
              {atRisk ? "Treniraj danas ili gubiš niz!" : `Rekord: ${longest} dana 🏆`}
            </div>
          </div>
        </div>
        <div style={{
          fontFamily: "var(--font-display)", fontSize: 30,
          fontWeight: 800, color, lineHeight: 1,
          textShadow: `0 0 16px ${color}60`,
        }}>
          {current}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
