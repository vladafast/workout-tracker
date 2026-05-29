import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MOTIVATIONAL } from "../utils/helpers";
import { EXERCISE_DB } from "../utils/exerciseDatabase";
import { hsl, workoutXP } from "../utils/theme";

export default function SaveToast({ workout, onDone, accent = { hue: 245, sat: 72 } }) {
  const { hue, sat } = accent;
  const message  = MOTIVATIONAL["sr"][Math.floor(Math.random() * MOTIVATIONAL["sr"].length)];
  const xpEarned = workout ? workoutXP(workout, EXERCISE_DB) : 0;
  const totalReps = workout
    ? Object.values(workout.exercises).reduce((s, v) => s + (v?.total || 0), 0)
    : 0;

  useEffect(() => {
    if (!workout) return;
    const t = setTimeout(onDone, 3400);
    return () => clearTimeout(t);
  }, [workout]);

  const acL  = hsl(hue, sat, 74);
  const acBg = hsl(hue, sat, 18);
  const acBd = hsl(hue, sat, 62, 0.38);

  return (
    <AnimatePresence>
      {workout && (
        <motion.div
          initial={{ y: 130, opacity: 0, scale: 0.88 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 120, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 24, stiffness: 320 }}
          style={{
            position: "fixed",
            bottom: `calc(var(--nav-h) + var(--safe-bottom) + 12px)`,
            left: 14, right: 14,
            zIndex: 500,
            background: acBg,
            border: `1px solid ${acBd}`,
            borderRadius: "var(--radius-xl)",
            padding: "18px 20px",
            boxShadow: `0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px ${hsl(hue,sat,62,0.08)}, 0 0 40px ${hsl(hue,sat,62,0.2)}`,
            display: "flex", gap: 15, alignItems: "center",
            overflow: "hidden",
          }}
        >
          {/* Check circle */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.08, damping: 14, stiffness: 260 }}
            style={{
              width: 48, height: 48, borderRadius: "50%",
              background: hsl(hue, sat, 60, 0.22),
              border: `2px solid ${acBd}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: acL, flexShrink: 0,
            }}
          >
            <i className="ti ti-check" aria-hidden="true" style={{ fontSize: 24 }} />
          </motion.div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <motion.div
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 }}
              style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: acL, marginBottom: 4 }}
            >
              {message}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{ fontSize: 12, color: hsl(hue, sat, 72, 0.55) }}
            >
              {totalReps} reps ukupno
            </motion.div>
          </div>

          {/* XP badge */}
          <motion.div
            initial={{ scale: 0, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", delay: 0.3, damping: 12, stiffness: 280 }}
            style={{
              background: hsl(hue, sat, 60, 0.2),
              border: `1px solid ${acBd}`,
              borderRadius: "var(--radius-sm)",
              padding: "7px 13px",
              fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800,
              color: acL, whiteSpace: "nowrap",
              boxShadow: `0 0 20px ${hsl(hue,sat,62,0.28)}`,
            }}
          >
            +{xpEarned} XP
          </motion.div>

          {/* Progress drain bar */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 3.4, ease: "linear" }}
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              height: 3, background: acBd,
              borderRadius: "0 0 var(--radius-xl) var(--radius-xl)",
              transformOrigin: "left",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
