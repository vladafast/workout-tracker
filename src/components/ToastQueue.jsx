import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { EXERCISE_DB } from "../utils/exerciseDatabase";
import { workoutXP, hsl } from "../utils/theme";
import { MOTIVATIONAL, haptic } from "../utils/helpers";

// ══════════════════════════════════════════════════════════════
// TOAST STACK — v3
// Rules:
//   • Multiple toasts can be visible at the same time
//   • Every toast owns its own timer
//   • Swipe left or right to dismiss immediately
//   • Auto-dismiss after `duration` ms (default 3000)
//   • Drain bar is purely visual — synced to duration
// ══════════════════════════════════════════════════════════════

const DEFAULT_DURATION = 3000;
const SWIPE_THRESHOLD  = 75;

// ── Swipeable toast shell ──────────────────────────────────
function SwipeToast({ toast, onDismiss, accent, lang }) {
  const x          = useMotionValue(0);
  const opacity    = useTransform(x, [-150, -SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD, 150], [0, 0.5, 1, 0.5, 0]);
  const rotate     = useTransform(x, [-140, 0, 140], [-5, 0, 5]);
  const controls   = useAnimation();
  const timerRef   = useRef(null);
  const startedAt  = useRef(null);
  const remaining  = useRef(toast.duration || DEFAULT_DURATION);
  const [draining, setDraining] = useState(false);

  // Each visible toast runs its own timer
  useEffect(() => {
    startCountdown();
    return () => clearTimeout(timerRef.current);
  }, []); // eslint-disable-line

  const startCountdown = useCallback(() => {
    startedAt.current = Date.now();
    setDraining(true);
    timerRef.current = setTimeout(() => {
      onDismiss();
    }, remaining.current);
  }, [onDismiss]);

  const pauseCountdown = useCallback(() => {
    if (!startedAt.current) return;
    clearTimeout(timerRef.current);
    remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt.current));
    startedAt.current = null;
    setDraining(false);
  }, []);

  const resumeCountdown = useCallback(() => {
    if (startedAt.current) return; // already running
    startCountdown();
  }, [startCountdown]);

  const handleDragEnd = useCallback((_, info) => {
    const offset   = info.offset.x;
    const velocity = info.velocity.x;
    if (Math.abs(offset) > SWIPE_THRESHOLD || Math.abs(velocity) > 350) {
      const dir = offset > 0 ? 1 : -1;
      controls.start({ x: dir * 380, opacity: 0, transition: { duration: 0.2, ease: "easeOut" } });
      haptic([6]);
      clearTimeout(timerRef.current);
      setTimeout(onDismiss, 160);
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 500, damping: 32 } });
      resumeCountdown();
    }
  }, [onDismiss, controls, resumeCountdown]);

  const dur = toast.duration || DEFAULT_DURATION;

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.12}
      onDragStart={pauseCountdown}
      onDragEnd={handleDragEnd}
      animate={controls}
      style={{ x, opacity, rotate, cursor: "grab", touchAction: "pan-y", position: "relative" }}
      whileDrag={{ cursor: "grabbing" }}
    >
      {/* Swipe arrows — appear when dragging */}
      <motion.div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 14px", pointerEvents: "none", zIndex: 2,
        opacity: useTransform(x, [-50, 0, 50], [0.7, 0, 0.7]),
      }}>
        <span style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>←</span>
        <span style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>→</span>
      </motion.div>

      {/* Card */}
      <div
        onPointerDown={pauseCountdown}
        onPointerUp={resumeCountdown}
        onPointerLeave={resumeCountdown}
        style={{
          background: toast.bg || "var(--surface-elevated)",
          border: `1px solid ${toast.border || "var(--border2)"}`,
          borderRadius: "var(--radius-lg)",
          padding: "13px 16px",
          display: "flex", alignItems: "center", gap: 12,
          position: "relative", overflow: "hidden",
          boxShadow: `var(--shadow-lg)${toast.glow ? `, 0 0 24px ${toast.glow}` : ""}`,
          userSelect: "none", WebkitUserSelect: "none",
          minHeight: 62,
        }}
      >
        <ToastContent toast={toast} accent={accent} lang={lang} />

        {/* Drain bar */}
        <motion.div
            key={`drain-${toast.id}-${draining}`}
            initial={{ scaleX: draining ? (remaining.current / dur) : 0 }}
            animate={{ scaleX: draining ? 0 : (remaining.current / dur) }}
            transition={draining
              ? { duration: remaining.current / 1000, ease: "linear" }
              : { duration: 0 }
            }
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              height: 2.5,
              background: toast.border || "var(--border2)",
              transformOrigin: "left",
              borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
            }}
          />
      </div>
    </motion.div>
  );
}

// ── Toast content router ───────────────────────────────────
function ToastContent({ toast, accent, lang }) {
  switch (toast.type) {
    case "save":            return <SaveContent      toast={toast} accent={accent} lang={lang} />;
    case "achievement":     return <AchievementContent toast={toast} accent={accent} lang={lang} />;
    case "comeback":        return <ComebackContent  toast={toast} accent={accent} lang={lang} />;
    case "streak_milestone":return <StreakContent    toast={toast} accent={accent} lang={lang} />;
    default:                return <GenericContent   toast={toast} />;
  }
}

// ── Content types ──────────────────────────────────────────
function SaveContent({ toast, accent, lang }) {
  const { hue, sat } = accent;
  const acL = hsl(hue, sat, 74);
  return (
    <>
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 14, stiffness: 260 }}
        style={{
          width: 42, height: 42, borderRadius: "50%",
          background: hsl(hue, sat, 60, 0.2),
          border: `2px solid ${hsl(hue, sat, 62, 0.38)}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: acL, flexShrink: 0, fontSize: 20,
        }}
      >
        <i className="ti ti-check" aria-hidden="true" />
      </motion.div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: acL, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {toast.message}
        </div>
        <div style={{ fontSize: 11, color: hsl(hue, sat, 72, 0.5) }}>
          {toast.totalReps} reps · +{toast.xp} XP
        </div>
      </div>
      <motion.div
        initial={{ scale: 0, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", delay: 0.2, damping: 14 }}
        style={{
          background: hsl(hue, sat, 60, 0.18),
          border: `1px solid ${hsl(hue, sat, 62, 0.35)}`,
          borderRadius: "var(--radius-sm)", padding: "4px 11px",
          fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 800,
          color: acL, whiteSpace: "nowrap", flexShrink: 0,
        }}
      >
        +{toast.xp} XP
      </motion.div>
    </>
  );
}

function AchievementContent({ toast, accent, lang }) {
  const { hue, sat } = accent;
  const acL = hsl(hue, sat, 74);
  const { achievement } = toast;
  if (!achievement) return null;
  return (
    <>
      <motion.span
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 11, stiffness: 280 }}
        style={{ fontSize: 30, lineHeight: 1, flexShrink: 0 }}
      >
        {achievement.icon}
      </motion.span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: 10, color: acL, letterSpacing: "0.08em",
          textTransform: "uppercase", marginBottom: 2,
        }}>
          🏅 {lang === "sr" ? "Novo dostignuće" : "Achievement unlocked"}
        </div>
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: 14, color: "var(--text)", marginBottom: 1,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {achievement.name}
        </div>
        <div style={{
          fontSize: 11, color: "var(--text3)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {achievement.desc}
        </div>
      </div>
    </>
  );
}

function ComebackContent({ toast, accent, lang }) {
  const { hue, sat } = accent;
  const acL = hsl(hue, sat, 74);
  return (
    <>
      <motion.span
        animate={{ rotate: [0, -12, 12, 0] }}
        transition={{ duration: 0.45, delay: 0.1 }}
        style={{ fontSize: 30, lineHeight: 1, flexShrink: 0 }}
      >
        💪
      </motion.span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: acL, marginBottom: 2 }}>
          {lang === "sr" ? "Comeback!" : "Welcome back!"}
        </div>
        <div style={{ fontSize: 11, color: "var(--text3)" }}>
          {lang === "sr" ? "Vratio si se. Niz se nastavlja." : "You're back. Keep the streak alive."}
        </div>
      </div>
    </>
  );
}

function StreakContent({ toast, accent, lang }) {
  const { streak } = toast;
  return (
    <>
      <motion.span
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 0.35, delay: 0.1 }}
        style={{ fontSize: 30, lineHeight: 1, flexShrink: 0 }}
      >
        🔥
      </motion.span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "#f97316", marginBottom: 2 }}>
          {streak} {lang === "sr" ? "dana niza!" : "day streak!"}
        </div>
        <div style={{ fontSize: 11, color: "var(--text3)" }}>
          {lang === "sr" ? "Milestone dostignut. Nastavi." : "Milestone reached. Keep going."}
        </div>
      </div>
    </>
  );
}

function GenericContent({ toast }) {
  return (
    <>
      <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>{toast.icon || "💡"}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
          {toast.title}
        </div>
        {toast.body && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{toast.body}</div>}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════
export default function ToastQueue({ toasts, onDismiss, accent, lang }) {
  const visibleToasts = toasts || [];

  return (
    <div style={{
      position: "fixed",
      bottom: `calc(var(--nav-h) + var(--safe-bottom) + 10px)`,
      left: 14, right: 14,
      zIndex: 500,
      pointerEvents: visibleToasts.length ? "auto" : "none",
      display: "flex",
      flexDirection: "column-reverse",
      gap: 10,
    }}>
      <AnimatePresence initial={false}>
        {visibleToasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ y: 72, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -16, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{
              position: "relative",
              zIndex: 500 + index,
            }}
          >
            <SwipeToast
              toast={toast}
              onDismiss={() => onDismiss(toast.id)}
              accent={accent}
              lang={lang}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// FACTORY HELPERS
// ══════════════════════════════════════════════════════════════
let _id = 0;
const nextId = () => `t${++_id}_${Date.now()}`;

export function makeSaveToast(workout, accent, lang = "sr") {
  const { hue, sat } = accent;
  const xp = workoutXP(workout, EXERCISE_DB);
  const totalReps = Object.values(workout.exercises).reduce((s, v) => s + (v?.total || 0), 0);
  const msgs = MOTIVATIONAL[lang] || MOTIVATIONAL.sr;
  return {
    id: nextId(), type: "save",
    xp, totalReps,
    message: msgs[Math.floor(Math.random() * msgs.length)],
    bg:     hsl(hue, sat, 18),
    border: hsl(hue, sat, 62, 0.36),
    glow:   hsl(hue, sat, 62, 0.2),
    duration: 3000,
  };
}

export function makeAchievementToast(achievement, accent) {
  const { hue, sat } = accent;
  return {
    id: nextId(), type: "achievement",
    achievement,
    bg:     "var(--surface-elevated)",
    border: hsl(hue, sat, 62, 0.26),
    glow:   hsl(hue, sat, 62, 0.15),
    duration: 3500,
  };
}

export function makeComebackToast(accent) {
  return {
    id: nextId(), type: "comeback",
    bg: "var(--surface-elevated)", border: "var(--border2)",
    duration: 2800,
  };
}

export function makeStreakMilestoneToast(streak, accent) {
  return {
    id: nextId(), type: "streak_milestone",
    streak,
    bg:     "rgba(249,115,22,0.10)",
    border: "rgba(249,115,22,0.28)",
    glow:   "rgba(249,115,22,0.18)",
    duration: 3000,
  };
}
