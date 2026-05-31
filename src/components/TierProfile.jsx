import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BicepsProgress from "./BicepsProgress";
import {
  TIERS, getTier, calcXP, ACHIEVEMENTS, TITANIUM_MAX_XP,
  checkAchievements, loadUnlockedAchievements, workoutXP,
} from "../utils/theme";
import { computeStreak } from "../utils/helpers";
import { getExerciseById, EXERCISE_DB, MUSCLE_INFO } from "../utils/exerciseDatabase";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import MuscleDiagram from "./MuscleDiagram";
import MuscleRankView from "./MuscleRankView";
import InteractiveMuscleBody from "./InteractiveMuscleBody";
import {
  loadMuscleXP, RANK_SVG_COLORS, buildRankColorMap,
  getStrongestWeakest, analyzeWeakPoints, getMuscleStats,
} from "../utils/muscleRankSystem";

// ── Achievement categories ─────────────────────────────────
const ACH_CATS = [
  { id: "all",     label: "Sve"       },
  { id: "streak",  label: "🔥 Streak" },
  { id: "reps",    label: "💪 Reps"   },
  { id: "skill",   label: "🤸 Skill"  },
  { id: "tier",    label: "🏆 Tier"   },
];

const achCat = (id) => {
  if (["streak_3","streak_7","streak_14","streak_30","streak_60","streak_100","streak_365"].includes(id)) return "streak";
  if (["reps_100","reps_500","reps_1000","reps_5000","reps_10000","reps_50000","reps_100000","session_100","beast_mode","monster","100_pushups","50_pullups"].includes(id)) return "reps";
  if (["first_muscleup","muscleup_10","first_handstand","free_handstand","handstand_pu","first_lsit","human_flag","planche","front_lever","back_lever","pistol_squat","dragon_flag","nordic_curl","skill_hunter","skill_master","dead_hang_1min"].includes(id)) return "skill";
  if (["silver_tier","gold_tier","platinum_tier","diamond_tier","titanium_tier","titanium_50","titanium_max"].includes(id)) return "tier";
  return "other";
};

// ── Milestone Ring — interactive, with unlock date popup ──
function MilestoneRing({ tier, xp, size = 56, savedData, onSelect }) {
  const unlocked = xp >= tier.threshold;

  // Find when this tier was first reached
  const unlockedDate = React.useMemo(() => {
    if (!unlocked || !savedData?.length) return null;
    // Walk saved data oldest→newest, accumulate XP, find crossing point
    let acc = 0;
    const sorted = [...savedData].sort((a, b) => a.date.localeCompare(b.date));
    for (const w of sorted) {
      const wx = Object.values(w.exercises).reduce((s, v) => s + (v?.total || 0), 0);
      acc += Math.floor(wx * 1.5) + 50; // rough estimate per workout
      if (acc >= tier.threshold) return w.date;
    }
    return null;
  }, [unlocked, savedData, tier.threshold]);

  return (
    <motion.button
      initial={{ scale: 0.75, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileTap={{ scale: 0.88 }}
      onClick={() => onSelect({ tier, unlocked, unlockedDate })}
      style={{
        width: size, height: size,
        borderRadius: "50%",
        background: unlocked
          ? `radial-gradient(circle at 32% 32%, ${tier.color}dd, ${tier.color}66)`
          : "var(--surface-3)",
        border: `2.5px solid ${unlocked ? tier.color : "var(--border2)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.40,
        boxShadow: unlocked ? `0 0 18px ${tier.glow}, 0 0 6px ${tier.color}55` : "none",
        transition: "box-shadow 0.3s, border-color 0.3s",
        flexShrink: 0,
        cursor: "pointer",
        padding: 0,
      }}
    >
      {unlocked ? tier.icon : "🔒"}
    </motion.button>
  );
}

// ── Tier info popup ────────────────────────────────────────
function TierPopup({ info, onClose, lang }) {
  if (!info) return null;
  const { tier, unlocked, unlockedDate } = info;

  const formatDate = (d) => {
    if (!d) return null;
    return new Date(d + "T00:00:00").toLocaleDateString(
      lang === "sr" ? "sr-Latn-RS" : "en-US",
      { day: "numeric", month: "long", year: "numeric" }
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 600,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(6px)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          padding: "0 16px",
        }}
      >
        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: "var(--surface-elevated)",
            border: `1px solid ${unlocked ? tier.color + "44" : "var(--border2)"}`,
            borderRadius: "var(--radius-xl) var(--radius-xl) var(--radius-md) var(--radius-md)",
            padding: "28px 24px calc(28px + var(--safe-bottom))",
            width: "100%", maxWidth: 420,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: unlocked ? `0 0 60px ${tier.glow}` : "var(--shadow-lg)",
          }}
        >
          {/* Subtle bg glow — only unlocked */}
          {unlocked && (
            <div style={{
              position: "absolute", top: -60, left: "50%",
              transform: "translateX(-50%)",
              width: 200, height: 200,
              background: `radial-gradient(circle, ${tier.glow}, transparent 70%)`,
              pointerEvents: "none", opacity: 0.5,
            }} />
          )}

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Big icon */}
            <motion.div
              animate={unlocked ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ fontSize: 56, lineHeight: 1, marginBottom: 12 }}
            >
              {unlocked ? tier.icon : "🔒"}
            </motion.div>

            {/* Tier name */}
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26,
              color: unlocked ? tier.color : "var(--text3)",
              marginBottom: 6,
              textShadow: unlocked ? `0 0 20px ${tier.glow}` : "none",
            }}>
              {tier.name}
            </div>

            {/* XP requirement */}
            <div style={{ fontSize: 12, color: "var(--text4)", marginBottom: 16, fontWeight: 600 }}>
              {tier.threshold.toLocaleString()} XP {lang === "sr" ? "potrebno" : "required"}
            </div>

            {/* Tier desc */}
            <div style={{
              fontSize: 14, color: unlocked ? "var(--text2)" : "var(--text3)",
              marginBottom: 20, lineHeight: 1.5,
              padding: "12px 16px",
              background: unlocked ? `${tier.color}10` : "var(--surface-2)",
              borderRadius: "var(--radius-sm)",
              border: `1px solid ${unlocked ? tier.color + "25" : "var(--border)"}`,
            }}>
              {unlocked ? tier.desc : (
                lang === "sr"
                  ? `Još nisi dostigao ${tier.name}. Nastavi da grindaš.`
                  : `You haven't reached ${tier.name} yet. Keep grinding.`
              )}
            </div>

            {/* Unlock date — if known */}
            {unlocked && unlockedDate && (
              <div style={{
                fontSize: 12, color: "var(--text3)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                marginBottom: 20,
              }}>
                <i className="ti ti-calendar-check" style={{ color: tier.color }} />
                {lang === "sr" ? "Dostignut" : "Reached"}: <span style={{ color: tier.color, fontWeight: 700 }}>{formatDate(unlockedDate)}</span>
              </div>
            )}

            {unlocked && !unlockedDate && (
              <div style={{ fontSize: 11, color: "var(--text4)", marginBottom: 20 }}>
                {lang === "sr" ? "Dostignut (datum nepoznat)" : "Reached (date unknown)"}
              </div>
            )}

            {/* Roman numeral badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--surface-2)", border: "1px solid var(--border2)",
              borderRadius: "var(--radius-full)", padding: "6px 16px",
              marginBottom: 20,
            }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, color: "var(--text3)", letterSpacing: "0.1em" }}>
                RANK {tier.roman}
              </span>
            </div>

            {/* Close */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              style={{
                width: "100%", padding: "13px",
                background: unlocked ? tier.color : "var(--surface-2)",
                color: unlocked ? "#0a0a12" : "var(--text3)",
                border: "none", borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
                cursor: "pointer",
                boxShadow: unlocked ? `0 4px 20px ${tier.glow}` : "none",
              }}
            >
              {lang === "sr" ? "Zatvori" : "Close"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Stat Card ─────────────────────────────────────────────
function StatCard({ icon, val, label, sub, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border2)",
        borderRadius: "var(--radius-md)",
        padding: "15px 14px",
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 5 }}>{icon}</div>
      <div style={{
        fontFamily: "var(--font-display)", fontWeight: 800,
        fontSize: 22, color: color || "var(--text)",
        lineHeight: 1, marginBottom: 4,
      }}>{val}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text2)" }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: "var(--text4)", marginTop: 2 }}>{sub}</div>}
    </motion.div>
  );
}

export default function TierProfile({ savedData, accent = { hue: 245, sat: 72 }, lang = "sr", onBack, onShareOpen, rankUpMuscleIds = [] }) {
  const [achCatFilter, setAchCatFilter] = useState("all");
  const [showLockedAch, setShowLockedAch] = useState(false);
  const [selectedTier, setSelectedTier]   = useState(null);
  const [profileTab, setProfileTab]       = useState("stats"); // "stats" | "muscles"

  // ── Muscle XP data ────────────────────────────────────────
  const muscleXP     = useMemo(() => loadMuscleXP(), [savedData]);
  const rankColorMap = useMemo(() => buildRankColorMap(muscleXP), [muscleXP]);
  const { strongest: strongestMuscle, weakest: weakestMuscle } = useMemo(
    () => getStrongestWeakest(muscleXP), [muscleXP]
  );
  const weakPoints = useMemo(() => analyzeWeakPoints(muscleXP), [muscleXP]);
  const strongestMuscleStats = strongestMuscle ? getMuscleStats(strongestMuscle.muscleId, muscleXP) : null;
  const weakestMuscleStats   = weakestMuscle   ? getMuscleStats(weakestMuscle.muscleId, muscleXP)   : null;

  const xp       = useMemo(() => calcXP(savedData, EXERCISE_DB), [savedData]);
  const tierData = useMemo(() => getTier(xp), [xp]);
  const { tier, nextTier, progress, remaining, isTitaniumMax } = tierData;

  const { current: streak, longest, atRisk } = useMemo(() => computeStreak(savedData), [savedData]);

  const totalReps = useMemo(() =>
    savedData.reduce((s, w) => s + Object.values(w.exercises).reduce((a, v) => a + (v?.total || 0), 0), 0),
    [savedData]);

  const strongest = useMemo(() => {
    const totals = {};
    savedData.forEach(w => {
      Object.entries(w.exercises).forEach(([id, v]) => {
        totals[id] = (totals[id] || 0) + (v?.total || 0);
      });
    });
    const best = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
    if (!best) return null;
    const ex = getExerciseById(best[0]);
    return { id: best[0], reps: best[1], name: ex ? (lang === "sr" ? ex.sr : ex.en) : best[0] };
  }, [savedData, lang]);

  const consistency = useMemo(() => {
    const cutoff = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
    const count  = savedData.filter(w => w.date >= cutoff).length;
    return Math.min(Math.round((count / 30) * 100), 100);
  }, [savedData]);

  // XP history for chart — build from savedData
  const xpHistory = useMemo(() => {
    const byDate = {};
    [...savedData].reverse().forEach(w => {
      const earned = workoutXP(w, EXERCISE_DB);
      byDate[w.date] = (byDate[w.date] || 0) + earned;
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, xp]) => ({ date: date.slice(5), xp }));
  }, [savedData]);

  // Achievements
  const unlockedIds = useMemo(() => checkAchievements(savedData, streak), [savedData, streak]);
  const unlockedSet = new Set(unlockedIds);

  const filteredAch = ACHIEVEMENTS.filter(a => {
    if (achCatFilter !== "all" && achCat(a.id) !== achCatFilter) return false;
    if (!showLockedAch && !unlockedSet.has(a.id)) return false;
    return true;
  });
  const unlockedInFilter = filteredAch.filter(a => unlockedSet.has(a.id));

  const tierColor = tier.color;
  const tierGlow  = tier.glow;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: "0 16px 32px" }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, paddingTop: 6 }}>
        {onBack && (
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onBack}
            className="icon-btn"
          >
            <i className="ti ti-arrow-left" />
          </motion.button>
        )}
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22 }}>
            {lang === "sr" ? "Tier Profil" : "Tier Profile"}
          </div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>
            {xp.toLocaleString()} XP · {savedData.length} {lang === "sr" ? "treninga" : "workouts"}
          </div>
        </div>
      </div>

      {/* ── HERO CARD ── */}
      <div style={{
        background: tier.bg,
        border: `1px solid ${tierColor}33`,
        borderRadius: "var(--radius-xl)",
        padding: "28px 22px 24px",
        textAlign: "center",
        marginBottom: 14,
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 0 60px ${tierGlow}, var(--shadow-card)`,
      }}>
        {/* BG orbs — subtle, reduced opacity */}
        <div style={{ position: "absolute", top: -30, left: -30, width: 120, height: 120, background: `radial-gradient(circle, ${tierGlow}, transparent 70%)`, pointerEvents: "none", opacity: 0.45 }} />
        <div style={{ position: "absolute", bottom: -30, right: -30, width: 120, height: 120, background: `radial-gradient(circle, ${tierGlow}, transparent 70%)`, pointerEvents: "none", opacity: 0.45 }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Big bicep */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <BicepsProgress progress={progress} tier={tier} size={148} />
          </div>

          {/* Tier name */}
          <motion.div
            animate={{ textShadow: [`0 0 20px ${tierGlow}`, `0 0 40px ${tierGlow}`, `0 0 20px ${tierGlow}`] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: 34, color: tierColor, lineHeight: 1, marginBottom: 6,
            }}
          >
            {tier.icon} {tier.name}
          </motion.div>

          <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 20 }}>
            {xp.toLocaleString()} XP
            {isTitaniumMax
              ? <span style={{ color: tierColor }}> · 🌌 TRUE MAX</span>
              : nextTier
                ? <span> · {remaining.toLocaleString()} XP do {nextTier.icon} {nextTier.name}</span>
                : null
            }
          </div>

          {/* Progress bar */}
          <div style={{ height: 8, borderRadius: 8, background: "rgba(0,0,0,0.3)", overflow: "hidden", maxWidth: 280, margin: "0 auto 10px" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 48, damping: 14, delay: 0.25 }}
              style={{
                height: "100%",
                background: `linear-gradient(90deg, ${tierColor}88, ${tierColor})`,
                borderRadius: 8,
                boxShadow: `0 0 14px ${tierGlow}`,
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: `${tierColor}bb`, marginBottom: 18 }}>
            {isTitaniumMax
              ? "🌌 TITANIUM MAX — TRUE ENDGAME"
              : tier.id === "titanium"
                ? `${progress}% do TRUE MAX`
                : `${progress}% do sledećeg`
            }
          </div>

          {/* Tier progression row — scrollable, bigger, clickable */}
          <div
            style={{
              overflowX: "auto",
              overflowY: "visible",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              margin: "0 -22px",
              padding: "8px 22px 12px",
              marginBottom: 8,
            }}
          >
            <div style={{ display: "flex", gap: 12, width: "max-content", minWidth: "100%" }}>
              {TIERS.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0 }}
                >
                  <MilestoneRing
                    tier={t} xp={xp} size={56}
                    savedData={savedData}
                    onSelect={setSelectedTier}
                  />
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    color: xp >= t.threshold ? t.color : "var(--text4)",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    fontFamily: "var(--font-display)",
                  }}>
                    {t.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 10, color: "var(--text4)", marginBottom: 14, textAlign: "center" }}>
            {lang === "sr" ? "← Klikni na tier za detalje →" : "← Tap a tier for details →"}
          </div>

          {/* Share button */}
          {onShareOpen && (
            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ y: -2 }}
              onClick={onShareOpen}
              style={{
                padding: "11px 28px",
                background: tierColor,
                color: "#0a0a12",
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13,
                cursor: "pointer",
                boxShadow: `0 6px 24px ${tierGlow}`,
                display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              <i className="ti ti-share" />
              {lang === "sr" ? "Podeli dostignuće" : "Share achievement"}
            </motion.button>
          )}
        </div>
      </div>

      {/* ── PROFILE TABS ── */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 16,
        background: "var(--surface2)",
        borderRadius: 14, padding: 4,
      }}>
        {[
          { id: "stats",   label: "📊 Stats" },
          { id: "muscles", label: "💪 Muscle Map" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setProfileTab(t.id)}
            style={{
              flex: 1, padding: "8px 0",
              borderRadius: 10, border: "none",
              background: profileTab === t.id ? tierColor : "transparent",
              color: profileTab === t.id ? "#0a0a12" : "var(--text3)",
              fontWeight: 700, fontSize: 13,
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: profileTab === t.id ? `0 2px 12px ${tierGlow}` : "none",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
      {profileTab === "muscles" ? (
        <motion.div
          key="muscles"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* ── INTERACTIVE MUSCLE BODY — primary visual ── */}
          <InteractiveMuscleBody
            muscleXP={muscleXP}
            savedData={savedData}
            accent={accent}
            rankUpMuscleIds={rankUpMuscleIds}
          />

          {/* ── Detailed list below body ── */}
          <div style={{ marginTop: 16 }}>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: 14, marginBottom: 12, color: "var(--text2)",
            }}>
              📋 Detaljna statistika
            </div>
            <MuscleRankView muscleXP={muscleXP} accent={accent} />
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="stats"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
        >

      {/* ── STATS GRID ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <StatCard
          icon="🔥" val={`${streak}d`}
          label={lang === "sr" ? "Trenutni niz" : "Current streak"}
          sub={`${lang === "sr" ? "Rekord" : "Record"}: ${longest}d`}
          color={atRisk ? "#fca5a5" : tierColor}
        />
        <StatCard
          icon="💪" val={totalReps.toLocaleString()}
          label={lang === "sr" ? "Ukupno reps" : "Total reps"}
          sub={`${savedData.length} ${lang === "sr" ? "treninga" : "workouts"}`}
          color={tierColor}
        />
        <StatCard
          icon="🏆"
          val={strongest ? strongest.reps.toLocaleString() : "—"}
          label={lang === "sr" ? "Najjača vežba" : "Strongest move"}
          sub={strongest ? strongest.name : "—"}
          color={tierColor}
        />
        <StatCard
          icon="📈" val={`${consistency}%`}
          label={lang === "sr" ? "Konzistentnost" : "Consistency"}
          sub={lang === "sr" ? "Poslednjih 30d" : "Last 30 days"}
          color={tierColor}
        />
      </div>

      {/* ── MUSCLE HIGHLIGHTS ── */}
      {(strongestMuscleStats || weakPoints.length > 0) && (
        <div style={{
          background: "var(--surface-1)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "14px", marginBottom: 14,
        }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
            💪 Muscle Rank
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: weakPoints.length ? 12 : 0 }}>
            {strongestMuscleStats && (
              <div style={{
                background: "linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,215,0,0.04))",
                border: "1px solid rgba(255,215,0,0.25)",
                borderRadius: 10, padding: "8px 10px",
              }}>
                <div style={{ fontSize: 9, color: "var(--text4)", fontWeight: 700, letterSpacing: "0.06em" }}>
                  💪 NAJJAČI MIŠIĆ
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#ffd700", marginTop: 3 }}>
                  {MUSCLE_INFO[strongestMuscleStats.muscleId]?.sr || strongestMuscleStats.muscleId}
                </div>
                <div style={{ fontSize: 11, color: "var(--text4)" }}>
                  {strongestMuscleStats.tier.icon} {strongestMuscleStats.tier.name}
                </div>
              </div>
            )}
            {weakestMuscleStats && weakestMuscleStats.muscleId !== strongestMuscleStats?.muscleId && (
              <div style={{
                background: "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.04))",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 10, padding: "8px 10px",
              }}>
                <div style={{ fontSize: 9, color: "var(--text4)", fontWeight: 700, letterSpacing: "0.06em" }}>
                  📍 NAJSLABIJI
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#ef4444", marginTop: 3 }}>
                  {MUSCLE_INFO[weakestMuscleStats.muscleId]?.sr || weakestMuscleStats.muscleId}
                </div>
                <div style={{ fontSize: 11, color: "var(--text4)" }}>
                  {weakestMuscleStats.tier.icon} {weakestMuscleStats.tier.name}
                </div>
              </div>
            )}
          </div>

          {/* Weak points */}
          {weakPoints.length > 0 && (
            <div style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 8, padding: "8px 10px",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", marginBottom: 4 }}>
                ⚠️ Weak Points
              </div>
              {weakPoints.slice(0, 2).map(wp => {
                const mInfo = MUSCLE_INFO[wp.muscleId];
                return (
                  <div key={wp.muscleId} style={{ fontSize: 11, color: "var(--text3)", marginBottom: 2 }}>
                    <strong>{mInfo?.sr || wp.muscleId}</strong>
                    {" "}zaostaje {wp.tierGapFromMax} {wp.tierGapFromMax === 1 ? "rank" : "ranka"}
                    {" "}— idi na Muscle Map za preporuke
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── XP HISTORY CHART ── */}
      {xpHistory.length >= 2 && (
        <div style={{
          background: "var(--surface-1)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "16px", marginBottom: 14,
        }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
            ⚡ XP Istorija
          </div>
          <div style={{ fontSize: 11, color: "var(--text4)", marginBottom: 14 }}>
            {lang === "sr" ? "Poslednjih 14 treninga" : "Last 14 workouts"}
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={xpHistory} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={tierColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={tierColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border2)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text4)" tick={{ fontSize: 10 }} />
              <YAxis stroke="var(--text4)" tick={{ fontSize: 10 }} />
              <Tooltip
                content={({ active, payload }) => active && payload?.length ? (
                  <div style={{ background: "var(--surface-elevated)", border: "1px solid var(--border2)", borderRadius: 10, padding: "6px 12px", fontSize: 13 }}>
                    <span style={{ color: tierColor, fontWeight: 700 }}>+{payload[0].value} XP</span>
                  </div>
                ) : null}
              />
              <Area type="monotone" dataKey="xp" stroke={tierColor} strokeWidth={2.5} fill="url(#xpGrad)"
                dot={{ r: 3, fill: tierColor, strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── STREAK MILESTONES ── */}
      <div style={{
        background: "var(--surface-1)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: "16px", marginBottom: 14,
      }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
          🔥 Streak Milestones
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[3, 7, 14, 30, 60, 100, 180, 365].map(m => {
            const reached = longest >= m;
            const active  = streak >= m;
            return (
              <div key={m} style={{
                flex: "0 0 auto",
                padding: "7px 14px",
                borderRadius: "var(--radius-full)",
                background: active ? `${tierColor}22` : reached ? "var(--surface-2)" : "var(--surface-3)",
                border: `1px solid ${active ? tierColor : reached ? "var(--border2)" : "var(--border)"}`,
                fontSize: 12, fontWeight: 700,
                color: active ? tierColor : reached ? "var(--text2)" : "var(--text4)",
                display: "flex", alignItems: "center", gap: 5,
                transition: "all 0.3s",
              }}>
                {active ? "🔥" : reached ? "✓" : "○"} {m}d
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ACHIEVEMENTS ── */}
      <div style={{
        background: "var(--surface-1)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: "16px",
      }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15 }}>
            🏅 {lang === "sr" ? "Dostignuća" : "Achievements"}
            <span style={{ marginLeft: 8, fontSize: 12, color: "var(--text3)", fontWeight: 500 }}>
              {unlockedIds.length}/{ACHIEVEMENTS.length}
            </span>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowLockedAch(v => !v)}
            style={{
              background: showLockedAch ? "var(--accent-dim)" : "var(--surface-2)",
              border: "1px solid var(--border2)",
              borderRadius: "var(--radius-sm)",
              padding: "5px 12px",
              fontSize: 11, fontWeight: 700,
              color: showLockedAch ? "var(--accent-light)" : "var(--text3)",
              cursor: "pointer",
            }}
          >
            {showLockedAch ? "🔓 Sve" : "🔒 Locked"}
          </motion.button>
        </div>

        {/* Category filter */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {ACH_CATS.map(c => (
            <motion.button
              key={c.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => setAchCatFilter(c.id)}
              style={{
                padding: "5px 12px",
                borderRadius: "var(--radius-full)",
                border: `1px solid ${achCatFilter === c.id ? tierColor : "var(--border)"}`,
                background: achCatFilter === c.id ? `${tierColor}18` : "var(--surface-2)",
                color: achCatFilter === c.id ? tierColor : "var(--text3)",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {c.label}
            </motion.button>
          ))}
        </div>

        {/* Achievement grid */}
        {filteredAch.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px", color: "var(--text4)", fontSize: 13 }}>
            {showLockedAch ? "Nema dostignuća u ovoj kategoriji" : "Nema otključanih dostignuća ovde"}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }} className="achievements-grid">
            <AnimatePresence>
              {filteredAch.map((a, i) => {
                const unlocked = unlockedSet.has(a.id);
                return (
                  <motion.div
                    key={a.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: i * 0.025 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "11px 13px",
                      background: unlocked ? "var(--surface-2)" : "var(--surface-3)",
                      borderRadius: "var(--radius-sm)",
                      border: `1px solid ${unlocked ? "var(--border2)" : "var(--border)"}`,
                      opacity: unlocked ? 1 : 0.45,
                      filter: unlocked ? "none" : "grayscale(0.5)",
                      boxShadow: unlocked ? `0 0 10px ${tierGlow}20` : "none",
                    }}
                  >
                    <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>
                      {unlocked ? a.icon : "🔒"}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: unlocked ? "var(--text)" : "var(--text3)", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.name}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text4)", marginTop: 2, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.desc}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Tier popup */}
      <TierPopup info={selectedTier} onClose={() => setSelectedTier(null)} lang={lang} />
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}
