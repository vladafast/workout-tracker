import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { haptic } from "../utils/helpers";
import { getExerciseById, EXERCISE_DB } from "../utils/exerciseDatabase";
import { hsl, EX_LIGHTNESS_ROLES } from "../utils/theme";

export default function PRCelebration({ prs, onDone, accent = { hue: 245, sat: 72 } }) {
  const launched = useRef(false);
  const { hue, sat } = accent;

  useEffect(() => {
    if (!prs.length || launched.current) return;
    launched.current = true;
    haptic([50, 30, 80, 30, 50]);
    import("canvas-confetti").then(({ default: confetti }) => {
      const end = Date.now() + 2500;
      const colors = [hsl(hue,sat,62),hsl(hue,sat,72),hsl(hue,sat,48),hsl(hue,sat,80)];
      const frame = () => {
        confetti({ particleCount: 5, angle: 60,  spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    });
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [prs.length]);

  const acColor = hsl(hue, sat, 62);
  const acLight = hsl(hue, sat, 74);
  const acGlow  = hsl(hue, sat, 62, 0.35);

  return (
    <AnimatePresence>
      {prs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.82)", backdropFilter: "blur(10px)", padding: 24 }}
          onClick={onDone}
        >
          <motion.div
            initial={{ scale: 0.5, y: 60, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: -40, opacity: 0 }}
            transition={{ type: "spring", damping: 16, stiffness: 200 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: `linear-gradient(145deg, ${hsl(hue,sat,12)}, ${hsl(hue,sat,18)})`,
              border: `1px solid ${hsl(hue,sat,62,0.4)}`,
              borderRadius: 24, padding: "32px 28px", textAlign: "center",
              width: "100%", maxWidth: 340,
              boxShadow: `0 0 60px ${acGlow}, 0 24px 60px rgba(0,0,0,0.6)`,
            }}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ fontSize: 52, marginBottom: 8, color: acLight }}
            >
              <i className="ti ti-trophy" aria-hidden="true" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700, color: acColor, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>
              Personal Record
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 20 }}>
              NOVI REKORD!
            </motion.div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {prs.map((pr, i) => {
                const ex    = getExerciseById(pr.id);
                const dbIdx = EXERCISE_DB.findIndex(e => e.id === pr.id);
                const l     = EX_LIGHTNESS_ROLES[(dbIdx >= 0 ? dbIdx : i) % EX_LIGHTNESS_ROLES.length];
                const col   = hsl(hue, sat, l);
                return (
                  <motion.div key={pr.id}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    style={{ background: hsl(hue,sat,l,0.12), border: `1px solid ${hsl(hue,sat,l,0.35)}`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <i className="ti ti-activity" style={{ color: col, fontSize: 18 }} aria-hidden="true" />
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{ex?.sr || pr.id}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="pr-glow" style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: col }}>{pr.now}</div>
                      {pr.prev > 0 && <div style={{ fontSize: 11, color: "var(--text3)" }}>bilo: {pr.prev}</div>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <motion.button whileTap={{ scale: 0.95 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} onClick={onDone}
              style={{ marginTop: 20, width: "100%", padding: "12px", background: acColor, color: "#fff", border: "none", borderRadius: 12, fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 20px ${acGlow}`, letterSpacing: 0.5 }}>
              LET'S GO
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
