import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { parseNums, calcTotal, calcAvg, haptic, todayStr, MOTIVATIONAL } from "../utils/helpers";
import { hsl, workoutXP, calcXP, getTier, checkAchievements, loadUnlockedAchievements,
         saveUnlockedAchievements, ACHIEVEMENTS, applyPRBonus } from "../utils/theme";
import { EXERCISE_DB, MUSCLE_INFO, getExerciseById } from "../utils/exerciseDatabase";

// ── XP Popup ───────────────────────────────────────────────
function XPPopup({ xp, onDone }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.6 }}
      animate={{ opacity: [0, 1, 1, 0], y: [-10, -36, -56, -72], scale: [0.6, 1.2, 1.1, 0.9] }}
      transition={{ duration: 1.0, ease: "easeOut" }}
      onAnimationComplete={onDone}
      style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        pointerEvents: "none",
        zIndex: 999,
        fontFamily: "var(--font-display)",
        fontSize: 22, fontWeight: 900,
        color: "#ffd700",
        textShadow: "0 0 20px rgba(255,215,0,0.8)",
        whiteSpace: "nowrap",
      }}
    >
      +{xp} XP ⚡
    </motion.div>
  );
}

// ── Set Chip (swipe to delete in session) ─────────────────
function SetChip({ value, index, color, colBg, colBd, onRemove }) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-60, 0], [0, 1]);
  const bgOp = useTransform(x, [-60, -20, 0], [1, 0.5, 0]);

  return (
    <motion.div style={{ position: "relative", display: "inline-block" }}>
      {/* Delete hint bg */}
      <motion.div style={{
        position: "absolute", inset: 0,
        background: "rgba(239,68,68,0.3)", borderRadius: 8,
        opacity: bgOp,
        pointerEvents: "none",
      }} />
      <motion.span
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.x < -50) { haptic([8]); onRemove(index); }
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0, width: 0, marginRight: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
        layout
        style={{
          x,
          touchAction: "pan-y",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          background: colBg, color,
          borderRadius: 8, padding: "6px 14px",
          fontSize: 18, fontWeight: 800,
          fontFamily: "var(--font-display)",
          border: `1.5px solid ${colBd}`,
          cursor: "grab",
          userSelect: "none",
        }}
      >
        {value}
      </motion.span>
    </motion.div>
  );
}

// ── Rest Timer ─────────────────────────────────────────────
function RestTimer({ onClose, accent }) {
  const { hue, sat } = accent;
  const PRESETS = [60, 90, 120, 180];
  const [selected, setSelected] = useState(90);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(90);
  const intervalRef = useRef(null);
  const acL = hsl(hue, sat, 68);

  const start = (secs) => {
    setSelected(secs); setRemaining(secs); setRunning(true); haptic([15]);
  };

  const stop = () => { setRunning(false); clearInterval(intervalRef.current); };
  const reset = () => { stop(); setRemaining(selected); };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            haptic([40, 30, 40, 30, 60]);
            return 0;
          }
          if (r <= 4) haptic([8]);
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const progress = 1 - remaining / selected;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const circumference = 2 * Math.PI * 44;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(5,5,14,0.92)",
        backdropFilter: "blur(20px)",
        zIndex: 800,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 32,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Timer ring */}
      <div style={{ position: "relative", width: 160, height: 160 }}>
        <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="80" cy="80" r="44" fill="none" stroke="var(--surface-3)" strokeWidth="8" />
          <motion.circle
            cx="80" cy="80" r="44"
            fill="none" stroke={acL} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference * (1 - progress) }}
            transition={{ duration: 0.3, ease: "linear" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <motion.div
            key={remaining}
            animate={remaining <= 3 && running ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.4 }}
            style={{
              fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 900,
              color: remaining <= 10 && running ? "#f87171" : "var(--text)",
              lineHeight: 1,
            }}
          >
            {mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : secs}
          </motion.div>
          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>REST</div>
        </div>
      </div>

      {/* Presets */}
      <div style={{ display: "flex", gap: 10 }}>
        {PRESETS.map(p => (
          <motion.button
            key={p}
            whileTap={{ scale: 0.9 }}
            onClick={() => start(p)}
            style={{
              padding: "10px 18px",
              borderRadius: "var(--radius-sm)",
              border: `1.5px solid ${selected === p ? acL : "var(--border2)"}`,
              background: selected === p ? hsl(hue, sat, 60, 0.15) : "var(--surface-2)",
              color: selected === p ? acL : "var(--text3)",
              fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {p < 60 ? `${p}s` : `${p / 60}m${p % 60 ? p % 60 + "s" : ""}`}
          </motion.button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 14 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={reset}
          style={{
            padding: "14px 28px", borderRadius: "var(--radius-md)",
            border: "1px solid var(--border2)", background: "var(--surface-2)",
            color: "var(--text2)", fontFamily: "var(--font-display)",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}>
          Reset
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={() => running ? stop() : start(selected)}
          style={{
            padding: "14px 36px", borderRadius: "var(--radius-md)",
            border: "none",
            background: running
              ? "rgba(239,68,68,0.2)"
              : `linear-gradient(135deg, ${hsl(hue,sat,42)}, ${hsl(hue,sat,62)})`,
            color: "#fff",
            fontFamily: "var(--font-display)",
            fontSize: 15, fontWeight: 800, cursor: "pointer",
            boxShadow: running ? "none" : `0 4px 20px ${hsl(hue,sat,60,0.4)}`,
          }}>
          {running ? "⏸ Pauza" : "▶ Start"}
        </motion.button>
      </div>

      {remaining === 0 && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 900,
            color: acL, textAlign: "center",
          }}
        >
          💪 Vreme za sledeći set!
        </motion.div>
      )}

      <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
        style={{
          padding: "12px 32px", borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)", background: "transparent",
          color: "var(--text3)", fontFamily: "var(--font-display)",
          fontSize: 14, fontWeight: 600, cursor: "pointer",
        }}>
        Zatvori
      </motion.button>
    </motion.div>
  );
}

// ── Session Exercise Card (fullscreen) ────────────────────
function SessionExerciseCard({ ex, value, onChange, pr, onRemove, isActive, onActivate, accent, lang, onRepAdded }) {
  const { hue, sat } = accent;
  const nums = parseNums(value);
  const total = calcTotal(value);
  const hasData = nums.length > 0;
  const isNewPR = hasData && total > pr && pr > 0;
  const exObj = EXERCISE_DB.find(e => e.id === ex.id);
  const isHold = exObj?.isHold || false;
  const [xpPopups, setXpPopups] = useState([]);
  const [comboCount, setComboCount] = useState(0);
  const [lastAddTime, setLastAddTime] = useState(0);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const acL = hsl(hue, sat, 68);
  const acBg = hsl(hue, sat, 60, 0.12);
  const acBd = hsl(hue, sat, 60, 0.28);

  const quickAddReps = [5, 8, 10, 12, 15, 20];

  const addRep = useCallback((reps) => {
    const newVal = value ? `${value} ${reps}` : String(reps);
    onChange(newVal);
    haptic([12, 6, 12]);

    // Combo logic
    const now = Date.now();
    const timeDiff = now - lastAddTime;
    const newCombo = timeDiff < 4000 ? comboCount + 1 : 1;
    setComboCount(newCombo);
    setLastAddTime(now);

    // XP popup
    const xpGain = Math.round(reps * (exObj?.xpWeight || 1));
    const popupId = Date.now();
    setXpPopups(prev => [...prev, { id: popupId, xp: xpGain }]);
    setTimeout(() => setXpPopups(prev => prev.filter(p => p.id !== popupId)), 1200);

    onRepAdded?.(reps, newCombo);
  }, [value, onChange, comboCount, lastAddTime, exObj]);

  const removeLastSet = useCallback(() => {
    if (!nums.length) return;
    const newNums = nums.slice(0, -1);
    onChange(newNums.join(" "));
    haptic([8]);
  }, [nums, onChange]);

  const removeSet = useCallback((index) => {
    const newNums = [...nums];
    newNums.splice(index, 1);
    onChange(newNums.join(" "));
  }, [nums, onChange]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      onClick={onActivate}
      style={{
        background: isActive ? acBg : "var(--surface-1)",
        border: `2px solid ${isActive ? hsl(hue, sat, 60, 0.5) : "var(--border)"}`,
        borderRadius: "var(--radius-xl)",
        padding: isActive ? "20px" : "16px 18px",
        marginBottom: 12,
        overflow: "hidden",
        cursor: isActive ? "default" : "pointer",
        boxShadow: isActive ? `0 0 40px ${hsl(hue, sat, 60, 0.2)}` : "none",
        transition: "all 0.3s ease",
        position: "relative",
      }}
    >
      {/* PR glow */}
      {isNewPR && (
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(ellipse at top, ${hsl(hue,sat,60,0.15)}, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* XP popups */}
      {xpPopups.map(p => (
        <XPPopup key={p.id} xp={p.xp} onDone={() => {}} />
      ))}

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isActive ? 16 : 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17 }}>
            {ex.name}
          </div>
          {isNewPR && (
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                background: hsl(hue, sat, 60, 0.2),
                border: `1px solid ${hsl(hue, sat, 60, 0.4)}`,
                color: acL, borderRadius: 6,
                padding: "2px 8px", fontSize: 10, fontWeight: 800,
                fontFamily: "var(--font-display)", letterSpacing: "0.06em",
              }}
            >
              🏆 PR
            </motion.span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Combo badge */}
          <AnimatePresence>
            {comboCount >= 2 && (
              <motion.div
                key={comboCount}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                style={{
                  background: "linear-gradient(135deg, #f97316, #ef4444)",
                  borderRadius: 8, padding: "3px 8px",
                  fontSize: 11, fontWeight: 900,
                  fontFamily: "var(--font-display)",
                  color: "#fff",
                }}
              >
                x{comboCount} COMBO 🔥
              </motion.div>
            )}
          </AnimatePresence>

          {hasData && (
            <div style={{
              background: "var(--surface-2)", borderRadius: "var(--radius-sm)",
              padding: "6px 12px", textAlign: "center",
            }}>
              <div style={{ fontSize: 8, color: "var(--text4)", fontWeight: 700, textTransform: "uppercase", marginBottom: 1 }}>
                {isHold ? "Sek" : "Total"}
              </div>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 900,
                color: isNewPR ? acL : "var(--text)", lineHeight: 1,
              }}>
                {total}
              </div>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={(e) => { e.stopPropagation(); onRemove(ex.id); }}
            style={{
              background: "var(--danger-dim)", border: "1px solid rgba(239,68,68,0.18)",
              color: "#f87171", borderRadius: "var(--radius-sm)",
              width: 36, height: 36, fontSize: 14, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <i className="ti ti-x" aria-hidden="true" />
          </motion.button>
        </div>
      </div>

      {/* PR bar */}
      {pr > 0 && (
        <div style={{ marginBottom: isActive ? 14 : 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text3)", marginBottom: 4 }}>
            <span>Napredak ka PR-u ({pr})</span>
            <span style={{ color: acL, fontWeight: 700 }}>{Math.min(100, Math.round((total / pr) * 100))}%</span>
          </div>
          <div style={{ height: 3, background: "var(--surface-3)", borderRadius: 4, overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${Math.min(100, (total / pr) * 100)}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{
                height: "100%",
                background: total >= pr
                  ? `linear-gradient(90deg, ${hsl(hue,sat,50)}, ${acL})`
                  : `linear-gradient(90deg, ${hsl(hue,sat,42)}, ${hsl(hue,sat,60)})`,
                borderRadius: 4,
              }}
            />
          </div>
        </div>
      )}

      {/* Set chips */}
      <AnimatePresence>
        {hasData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            style={{ overflow: "hidden", marginBottom: isActive ? 14 : 0 }}
          >
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              {nums.map((n, i) => (
                <SetChip
                  key={i} value={n} index={i}
                  color={acL} colBg={acBg} colBd={acBd}
                  onRemove={removeSet}
                />
              ))}
              {nums.length > 0 && (
                <span style={{ color: "var(--text4)", fontSize: 11, marginLeft: 2 }}>
                  {nums.length} {isHold ? "set" : `serij${nums.length === 1 ? "a" : "e"}`}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active state: quick add buttons + text input */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            {/* Quick add buttons */}
            <div style={{ marginBottom: 12 }}>
              <div style={{
                fontSize: 10, color: "var(--text3)", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8,
              }}>
                Brzo dodaj {isHold ? "sekunde" : "reps"}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {quickAddReps.map(r => (
                  <motion.button
                    key={r}
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => addRep(r)}
                    style={{
                      padding: "12px 18px",
                      borderRadius: "var(--radius-sm)",
                      border: `1.5px solid ${acBd}`,
                      background: acBg,
                      color: acL,
                      fontFamily: "var(--font-display)",
                      fontSize: 18, fontWeight: 900,
                      cursor: "pointer",
                      minWidth: 52,
                      textAlign: "center",
                    }}
                  >
                    {r}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Custom input */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                onClick={e => e.stopPropagation()}
                placeholder={isHold ? "sek. npr. 30 20 15" : "rep. npr. 15 12 10"}
                inputMode="numeric"
                className="input-field"
                style={{ flex: 1, background: "var(--bg)", borderColor: acBd }}
              />
              {nums.length > 0 && (
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={removeLastSet}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border2)",
                    background: "var(--surface-2)",
                    color: "var(--text3)",
                    fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 4,
                    fontFamily: "var(--font-display)", fontWeight: 600,
                  }}
                >
                  <i className="ti ti-backspace" aria-hidden="true" />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Session Summary ────────────────────────────────────────
export function SessionSummary({ workout, savedData, accent, lang, onClose, newPRs = [], newAchievements = [], muscleXPGains = {}, rankUps = [] }) {
  const { hue, sat } = accent;
  const acL = hsl(hue, sat, 68);
  const [confettiPieces, setConfettiPieces] = useState([]);

  const totalReps = Object.values(workout.exercises).reduce((s, v) => s + (v?.total || 0), 0);
  const xpGained = workoutXP(workout, EXERCISE_DB);
  // Determine if any exercise in this workout is a hold (seconds) type
  const hasOnlyHolds = Object.keys(workout.exercises).length > 0 &&
    Object.keys(workout.exercises).every(id => EXERCISE_DB.find(e => e.id === id)?.isHold);
  const hasMixedTypes = !hasOnlyHolds && Object.keys(workout.exercises)
    .some(id => EXERCISE_DB.find(e => e.id === id)?.isHold);
  const xpWithBonus = applyPRBonus(xpGained, newPRs.length > 0);
  const currentXP = calcXP(savedData, EXERCISE_DB);
  const tierInfo = getTier(currentXP);
  const duration = workout.endTime ? Math.round((workout.endTime - workout.startTime) / 60000) : 0;

  // Fire confetti
  useEffect(() => {
    haptic([20, 15, 30, 15, 50]);
    const pieces = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.8,
      color: [
        hsl(hue, sat, 68), hsl(hue, sat, 55),
        "#ffd700", "#f97316", "#a855f7",
      ][i % 5],
      size: 4 + Math.random() * 6,
      duration: 2 + Math.random() * 1.5,
    }));
    setConfettiPieces(pieces);
  }, []);


  return (
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "spring", stiffness: 280, damping: 32 }}
      style={{
        position: "fixed", inset: 0,
        background: "var(--bg)",
        zIndex: 600,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Confetti */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 700, overflow: "hidden" }}>
        {confettiPieces.map(p => (
          <motion.div
            key={p.id}
            initial={{ y: -20, x: `${p.x}vw`, rotate: 0, opacity: 1 }}
            animate={{ y: "110vh", rotate: 720, opacity: [1, 1, 0] }}
            transition={{ duration: p.duration, delay: p.delay, ease: "linear" }}
            style={{
              position: "absolute",
              width: p.size, height: p.size * 1.4,
              background: p.color,
              borderRadius: 2,
            }}
          />
        ))}
      </div>

      {/* Hero XP section */}
      <div style={{
        background: `linear-gradient(180deg, ${hsl(hue,sat,15)} 0%, var(--bg) 100%)`,
        padding: "60px 24px 40px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Glow bg */}
        <div style={{
          position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
          width: 400, height: 400,
          background: `radial-gradient(circle, ${hsl(hue,sat,60,0.3)}, transparent 65%)`,
          pointerEvents: "none",
        }} />

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.1 }}
          style={{ position: "relative", zIndex: 1 }}
        >
          <div style={{ fontSize: 56, marginBottom: 8 }}>🏆</div>
          <div style={{
            fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 900,
            color: "var(--text)", marginBottom: 4,
          }}>
            {lang === "sr" ? "Trening završen!" : "Workout done!"}
          </div>
          <div style={{ fontSize: 14, color: "var(--text3)", marginBottom: 24 }}>
            {MOTIVATIONAL[lang]?.[Math.floor(Math.random() * MOTIVATIONAL[lang].length)]}
          </div>

          {/* Big XP display */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 320 }}
            style={{
              display: "inline-block",
              background: hsl(hue, sat, 60, 0.15),
              border: `2px solid ${hsl(hue, sat, 60, 0.4)}`,
              borderRadius: "var(--radius-xl)",
              padding: "16px 40px",
              boxShadow: `0 0 60px ${hsl(hue,sat,60,0.25)}`,
            }}
          >
            <div style={{ fontSize: 11, color: acL, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>
              XP zarađen
            </div>
            <div style={{
              fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 900,
              color: acL, lineHeight: 1,
              textShadow: `0 0 30px ${hsl(hue,sat,60,0.6)}`,
            }}>
              +{xpWithBonus}
            </div>
            {newPRs.length > 0 && (
              <div style={{ fontSize: 11, color: "#ffd700", marginTop: 4, fontWeight: 700 }}>
                ⚡ +5% PR bonus!
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Stats row */}
      <div style={{ padding: "0 16px 20px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8, marginBottom: 20,
        }}>
          {[
            { val: totalReps, label: hasOnlyHolds ? (lang === "sr" ? "Sekundi" : "Seconds") : hasMixedTypes ? (lang === "sr" ? "Rep/Sek" : "Rep/Sec") : (lang === "sr" ? "Reps" : "Reps"), icon: hasOnlyHolds ? "⏱" : "💪" },
            { val: Object.keys(workout.exercises).length, label: "Vežbi", icon: "🎯" },
            { val: duration > 0 ? `${duration}m` : "—", label: "Trajanje", icon: "⏱" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "14px 10px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 900,
                color: acL, lineHeight: 1, marginBottom: 4,
              }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase" }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tier progress */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: "var(--surface-1)",
            border: `1px solid ${tierInfo.tier.color}30`,
            borderRadius: "var(--radius-lg)",
            padding: "16px",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
                {tierInfo.tier.icon} {tierInfo.tier.name}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: tierInfo.tier.color }}>
                {currentXP.toLocaleString()} XP ukupno
              </div>
            </div>
            {rankUps.length > 0 && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, repeat: 3 }}
                style={{
                  background: "linear-gradient(135deg, #ffd700, #f97316)",
                  borderRadius: 10, padding: "6px 14px",
                  fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 900,
                  color: "#000",
                }}
              >
                🎉 RANK UP!
              </motion.div>
            )}
          </div>
          <div style={{ height: 5, background: "var(--surface-3)", borderRadius: 4, overflow: "hidden" }}>
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${getTier(currentXP - xpWithBonus).progress || 0}%` }}
              transition={{ duration: 0 }}
            >
              <motion.div
                animate={{ width: `${tierInfo.progress || 0}%` }}
                transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                style={{
                  height: 5,
                  background: `linear-gradient(90deg, ${tierInfo.tier.color}88, ${tierInfo.tier.color})`,
                  borderRadius: 4,
                }}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* PRs */}
        {newPRs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              background: hsl(hue, sat, 60, 0.08),
              border: `1px solid ${hsl(hue, sat, 60, 0.3)}`,
              borderRadius: "var(--radius-lg)",
              padding: "16px",
              marginBottom: 16,
            }}
          >
            <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 800, color: acL, marginBottom: 10 }}>
              🏆 Novi rekordi!
            </div>
            {newPRs.map((pr, i) => {
              const ex = getExerciseById(pr.id);
              return (
                <div key={pr.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 0", borderBottom: i < newPRs.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  <span style={{ fontSize: 13, color: "var(--text2)" }}>
                    {ex ? (lang === "sr" ? ex.sr : ex.en) : pr.id}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--text4)" }}>{pr.prev} →</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: acL }}>
                      {pr.now} 🏆
                    </span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* New achievements */}
        {newAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ marginBottom: 16 }}
          >
            <div style={{
              fontSize: 10, color: "var(--text3)", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8,
            }}>
              🏅 Dostignuća
            </div>
            {newAchievements.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.65 + i * 0.1 }}
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px 14px",
                  display: "flex", alignItems: "center", gap: 12,
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 28 }}>{a.icon}</span>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13 }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{a.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Rank ups */}
        {rankUps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            style={{ marginBottom: 16 }}
          >
            {rankUps.map((ru, i) => {
              const info = MUSCLE_INFO[ru.muscleId];
              return (
                <div key={ru.muscleId} style={{
                  background: "linear-gradient(135deg, rgba(249,115,22,0.1), rgba(168,85,247,0.1))",
                  border: "1px solid rgba(249,115,22,0.3)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px 14px",
                  marginBottom: 8,
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span style={{ fontSize: 24 }}>🆙</span>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "#f97316" }}>
                      MUSCLE RANK UP
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text)" }}>
                      {info?.sr || ru.muscleId} → {ru.newRank}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Close CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onClose}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{
            width: "100%", padding: "18px",
            background: `linear-gradient(135deg, ${hsl(hue,sat,42)}, ${hsl(hue,sat,64)})`,
            border: "none", borderRadius: "var(--radius-lg)",
            color: "#fff", fontFamily: "var(--font-display)",
            fontSize: 17, fontWeight: 800, cursor: "pointer",
            boxShadow: `0 6px 28px ${hsl(hue,sat,60,0.4)}`,
            letterSpacing: 0.2,
          }}
        >
          {lang === "sr" ? "Nastavi 💪" : "Continue 💪"}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN SESSION MODE
// ══════════════════════════════════════════════════════════════
export default function SessionMode({
  exercises, inputs, onChange, onRemove, getPR,
  onSave, onClose, onAddExercise,
  accent, lang, savedData,
}) {
  const { hue, sat } = accent;
  const acL = hsl(hue, sat, 68);
  const acD = hsl(hue, sat, 42);
  const acBd = hsl(hue, sat, 62, 0.3);
  const acGlow = hsl(hue, sat, 62, 0.4);

  const [activeEx, setActiveEx] = useState(exercises[0]?.id || null);
  const prevExCountRef = React.useRef(exercises.length);
  useEffect(() => {
    if (exercises.length > prevExCountRef.current) {
      const newest = exercises[exercises.length - 1];
      if (newest) setActiveEx(newest.id);
    }
    prevExCountRef.current = exercises.length;
  }, [exercises.length]);
  const [showTimer, setShowTimer] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [streakPulse, setStreakPulse] = useState(false);

  // Timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatElapsed = () => {
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const hasAnyInput = exercises.some(e => inputs[e.id]?.trim());
  const totalRepsAll = exercises.reduce((s, e) => s + calcTotal(inputs[e.id] || ""), 0);

  const handleRepAdded = useCallback((reps, combo) => {
    if (combo >= 3) {
      setStreakPulse(true);
      setTimeout(() => setStreakPulse(false), 800);
    }
  }, []);

  // Pokušaj izlaska — prikaži confirm ako ima podataka
  const handleCloseRequest = () => {
    if (hasAnyInput) {
      setShowExitConfirm(true);
      haptic([8]);
    } else {
      onClose(false); // nema podataka, sigurno izlazi
    }
  };

  const handleFinish = () => {
    if (!hasAnyInput) return;
    haptic([20, 15, 30]);
    const result = onSave({ startTime, endTime: Date.now() });
    if (result) {
      setSummaryData({ ...result, startTime, endTime: Date.now() });
      setShowSummary(true);
    }
  };

  const handleSummaryClose = () => {
    setShowSummary(false);
    onClose(false); // trening je sačuvan, brisanje je ok
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0,
          background: "var(--bg)",
          zIndex: 400,
          display: "flex", flexDirection: "column",
          overflowX: "hidden",
        }}
      >
        {/* ── SESSION HEADER ── */}
        <div
          className="glass"
          style={{
            padding: "max(52px, calc(env(safe-area-inset-top) + 14px)) 16px 14px",
            borderBottom: "1px solid var(--border)",
            position: "sticky", top: 0, zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Left: close + timer */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleCloseRequest}
                style={{
                  background: "var(--surface-2)", border: "1px solid var(--border2)",
                  color: "var(--text3)", borderRadius: "var(--radius-sm)",
                  width: 38, height: 38, fontSize: 18, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <i className="ti ti-arrow-left" aria-hidden="true" />
              </motion.button>

              {/* Elapsed timer */}
              <motion.div
                animate={streakPulse ? { scale: [1, 1.15, 1], color: ["var(--text)", acL, "var(--text)"] } : {}}
                transition={{ duration: 0.5 }}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border2)",
                  borderRadius: "var(--radius-sm)",
                  padding: "8px 14px",
                  fontFamily: "var(--font-display)",
                  fontSize: 15, fontWeight: 800,
                  color: "var(--text2)",
                  letterSpacing: "0.04em",
                }}
              >
                ⏱ {formatElapsed()}
              </motion.div>
            </div>

            {/* Right: total reps + rest timer */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {totalRepsAll > 0 && (
                <motion.div
                  key={totalRepsAll}
                  animate={{ scale: [1.2, 1] }}
                  transition={{ duration: 0.25 }}
                  style={{
                    background: hsl(hue, sat, 60, 0.12),
                    border: `1px solid ${acBd}`,
                    borderRadius: "var(--radius-sm)",
                    padding: "8px 14px",
                    fontFamily: "var(--font-display)",
                    fontSize: 15, fontWeight: 900, color: acL,
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  💪 {totalRepsAll}
                </motion.div>
              )}

              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => { setShowTimer(true); haptic([10]); }}
                style={{
                  background: "var(--surface-2)", border: "1px solid var(--border2)",
                  color: "var(--text2)", borderRadius: "var(--radius-sm)",
                  width: 38, height: 38, fontSize: 16, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
                title="Rest timer"
              >
                <i className="ti ti-alarm" aria-hidden="true" />
              </motion.button>
            </div>
          </div>

          {/* Session label */}
          <div style={{
            marginTop: 8,
            fontFamily: "var(--font-display)", fontSize: 11,
            color: "var(--text3)", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.12em",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }}
            />
            SESSION MODE • {exercises.length} {lang === "sr" ? "vežbi" : "exercises"}
          </div>
        </div>

        {/* ── SCROLL AREA ── */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "16px 16px",
          paddingBottom: 120,
        }}>
          <AnimatePresence>
            {exercises.map((ex) => (
              <SessionExerciseCard
                key={ex.id}
                ex={ex}
                value={inputs[ex.id] || ""}
                onChange={(val) => onChange(ex.id, val)}
                pr={getPR(ex.id)}
                onRemove={onRemove}
                isActive={activeEx === ex.id}
                onActivate={() => { setActiveEx(ex.id); haptic([6]); }}
                accent={accent}
                lang={lang}
                onRepAdded={handleRepAdded}
              />
            ))}
          </AnimatePresence>

          {/* Add exercise */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onAddExercise}
            style={{
              width: "100%", padding: "16px",
              background: "var(--surface-1)",
              border: `1.5px dashed ${acBd}`,
              borderRadius: "var(--radius-lg)",
              color: "var(--text3)",
              fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <span style={{ color: acL, fontSize: 22, fontWeight: 400 }}>+</span>
            {lang === "sr" ? "Dodaj vežbu" : "Add exercise"}
          </motion.button>
        </div>

        {/* ── FINISH BUTTON (sticky bottom) ── */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          padding: "14px 16px calc(var(--safe-bottom) + 14px)",
          background: "var(--bg)",
          borderTop: "1px solid var(--border)",
          backdropFilter: "blur(20px)",
          zIndex: 20,
        }}>
          <motion.button
            whileTap={{ scale: hasAnyInput ? 0.97 : 1 }}
            onClick={handleFinish}
            disabled={!hasAnyInput}
            style={{
              width: "100%", padding: "18px",
              background: hasAnyInput
                ? `linear-gradient(135deg, ${acD}, ${hsl(hue,sat,64)})`
                : "var(--surface-2)",
              border: "none",
              borderRadius: "var(--radius-lg)",
              color: hasAnyInput ? "#fff" : "var(--text4)",
              fontFamily: "var(--font-display)",
              fontSize: 18, fontWeight: 900,
              cursor: hasAnyInput ? "pointer" : "not-allowed",
              boxShadow: hasAnyInput ? `0 6px 32px ${acGlow}` : "none",
              letterSpacing: 0.3,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "all 0.25s ease",
            }}
          >
            {lang === "sr" ? "Završi trening" : "Finish workout"}
            {hasAnyInput && (
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ fontSize: 20 }}
              >
                🏁
              </motion.span>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Rest Timer overlay */}
      <AnimatePresence>
        {showTimer && (
          <RestTimer onClose={() => setShowTimer(false)} accent={accent} />
        )}
      </AnimatePresence>

      {/* Session Summary overlay */}
      <AnimatePresence>
        {showSummary && summaryData && (
          <SessionSummary
            workout={summaryData.workout}
            savedData={summaryData.updatedSavedData || savedData}
            accent={accent}
            lang={lang}
            onClose={handleSummaryClose}
            newPRs={summaryData.newPRs || []}
            newAchievements={summaryData.newAchievements || []}
            muscleXPGains={summaryData.muscleXPGains || {}}
            rankUps={summaryData.rankUps || []}
          />
        )}
      </AnimatePresence>

      {/* Exit confirm overlay — štiti od slučajnog gubitka podataka */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 900,
              background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
              display: "flex", alignItems: "flex-end", justifyContent: "center",
              padding: "0 16px",
            }}
            onClick={() => setShowExitConfirm(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: "var(--surface-elevated)",
                borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
                padding: "28px 20px calc(28px + var(--safe-bottom))",
                width: "100%", maxWidth: 480,
                border: "1px solid var(--border2)",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 44, marginBottom: 10 }}>⚠️</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                  {lang === "sr" ? "Napustiti trening?" : "Leave workout?"}
                </div>
                <div style={{ fontSize: 13, color: "var(--text3)" }}>
                  {lang === "sr"
                    ? "Uneseni podaci neće biti sačuvani kao trening. Draft ostaje ako se vratiš."
                    : "Your reps won't be saved as a workout. Your draft stays if you come back."}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setShowExitConfirm(false); haptic([5]); }}
                  style={{
                    width: "100%", padding: "16px",
                    background: `linear-gradient(135deg, ${hsl(hue,sat,42)}, ${hsl(hue,sat,64)})`,
                    border: "none", borderRadius: "var(--radius-lg)",
                    color: "#fff", fontFamily: "var(--font-display)",
                    fontSize: 16, fontWeight: 800, cursor: "pointer",
                  }}
                >
                  {lang === "sr" ? "Nastavi trening" : "Keep training"}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setShowExitConfirm(false); onClose(true); haptic([10, 5]); }}
                  style={{
                    width: "100%", padding: "14px",
                    background: "var(--danger-dim)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: "var(--radius-lg)",
                    color: "#f87171", fontFamily: "var(--font-display)",
                    fontSize: 15, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  {lang === "sr" ? "Izađi, sačuvaj draft" : "Exit, keep draft"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
