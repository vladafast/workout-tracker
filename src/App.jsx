import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell,
} from "recharts";
import {
  parseNums, calcTotal, calcAvg, loadData, saveData, loadLang, saveLang,
  detectNewPRs, computeStreak, todayStr, formatDate, haptic, MOTIVATIONAL,
  loadRecentExercises, saveRecentExercises,
  appendXPHistory,
} from "./utils/helpers";
import { getExerciseById, EXERCISE_DB, MUSCLE_INFO } from "./utils/exerciseDatabase";
import {
  ACCENT_PRESETS, SWATCH_COLORS, EX_LIGHTNESS_ROLES,
  hsl, exColor, applyAccent, loadAccent, saveAccent,
  loadTheme, saveTheme, calcXP, getTierInfo, getTier, workoutXP, applyPRBonus,
  ACHIEVEMENTS, checkAchievements, loadUnlockedAchievements, saveUnlockedAchievements,
} from "./utils/theme";
import StreakBanner   from "./components/StreakBanner";
import PRCelebration  from "./components/PRCelebration";
import ToastQueue, { makeSaveToast, makeAchievementToast, makeComebackToast, makeStreakMilestoneToast } from "./components/ToastQueue";
import CalendarView   from "./components/CalendarView";
import GoalsSystem    from "./components/GoalsSystem";
import RemindersPanel from "./components/RemindersPanel";
import InstallPrompt  from "./components/InstallPrompt";
import ExerciseSearch from "./components/ExerciseSearch";
import TierCard       from "./components/TierCard";
import TierProfile    from "./components/TierProfile";
import ShareCard      from "./components/ShareCard";
import {
  loadMuscleXP, saveMuscleXP, computeMuscleXPGains,
  applyMuscleXPGains, makeMuscleRankUpToast, migrateFromHistory,
  loadMuscleXPVersion, resetMuscleXP, MUSCLE_SYSTEM_VERSION,
} from "./utils/muscleRankSystem";
import WeeklyRecap    from "./components/WeeklyRecap";
import BicepsProgress from "./components/BicepsProgress";
import SessionMode   from "./components/SessionMode";

// ── Tabs ──────────────────────────────────────────────────
const TABS = [
  { id: "log",   label: { sr: "Trening",  en: "Workout"  }, icon: "ti-barbell"  },
  { id: "stats", label: { sr: "Stats",    en: "Stats"    }, icon: "ti-chart-bar"},
  { id: "tier",  label: { sr: "Tier",     en: "Tier"     }, icon: "ti-trophy"   },
  { id: "cal",   label: { sr: "Kalendar", en: "Calendar" }, icon: "ti-calendar" },
  { id: "more",  label: { sr: "Više",     en: "More"     }, icon: "ti-settings" },
];

// ── Exercise icon map ─────────────────────────────────────
const EX_ICONS = {
  sklekovi_siroki:"ti-trending-up",sklekovi_uski:"ti-arrow-bar-up",
  sklekovi_dijamant:"ti-diamond",sklekovi_archer:"ti-arrows-horizontal",
  sklekovi_pike:"ti-triangle",sklekovi_decline:"ti-arrow-up-right",
  sklekovi_incline:"ti-arrow-down-right",sklekovi_jednorucan:"ti-hand-stop",
  zgibovi_siroki:"ti-arrow-up",zgibovi_uski:"ti-arrow-narrow-up",
  chin_ups:"ti-arm-flex",neutral_grip_pullups:"ti-grip-horizontal",
  muscle_up:"ti-rocket",australijski_zgibovi:"ti-trending-down",
  propadanja:"ti-arrow-bar-down",propadanja_stolica:"ti-chair",
  korean_dips:"ti-arrows-down-up",dead_hang:"ti-anchor",
  scapular_pulls:"ti-arrows-maximize",lsit:"ti-letter-l",tuck_lsit:"ti-box",
  pistol_squat:"ti-run",nordic_curl:"ti-wave-square",glute_bridge:"ti-arch",
  wall_handstand:"ti-hand-finger",freestanding_handstand:"ti-star",
  handstand_pushups:"ti-arrow-autofit-up",human_flag:"ti-flag",
  planche:"ti-zzz",front_lever:"ti-minus",back_lever:"ti-minus-vertical",
  dragon_flag:"ti-flame",hollow_body:"ti-oval",ab_wheel:"ti-circle",
};
const getIcon = id => EX_ICONS[id] || "ti-activity";

export const AccentCtx = React.createContext({ hue: 245, sat: 72 });

// ── Motion presets ────────────────────────────────────────
const PAGE_ANIM = {
  initial:   { opacity: 0, y: 18 },
  animate:   { opacity: 1, y: 0  },
  exit:      { opacity: 0, y: -12 },
  transition:{ duration: 0.22, ease: [0.16, 1, 0.3, 1] },
};

const SPRING_STIFF = { type: "spring", stiffness: 380, damping: 28 };

// ── Skeleton ──────────────────────────────────────────────
function Skel({ w = "100%", h = 20, r = 10, mb = 0 }) {
  return (
    <div
      className="skeleton"
      style={{ width: w, height: h, borderRadius: r, marginBottom: mb, flexShrink: 0 }}
    />
  );
}

// ── Custom chart tooltip ──────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--surface-elevated)",
      border: "1px solid var(--border2)",
      borderRadius: "var(--radius-sm)",
      padding: "8px 14px",
      fontSize: 13,
      boxShadow: "var(--shadow-card)",
    }}>
      <p style={{ color: "var(--text3)", marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color, margin: 0 }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ── Empty States ──────────────────────────────────────────
function EmptyState({ icon = "ti-barbell", emoji, text, sub, cta, onCta }) {
  const { hue, sat } = React.useContext(AccentCtx);
  const color = hsl(hue, sat, 68);
  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="empty-state-icon" style={{
        background: hsl(hue, sat, 60, 0.1),
        borderColor: hsl(hue, sat, 60, 0.2),
        color,
      }}>
        {emoji
          ? <span style={{ fontSize: 38 }}>{emoji}</span>
          : <i className={`ti ${icon}`} aria-hidden="true" />
        }
      </div>
      <div className="empty-state-title">{text}</div>
      {sub && <div className="empty-state-sub">{sub}</div>}
      {cta && onCta && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onCta}
          className="btn btn-primary"
          style={{ marginTop: 8, paddingLeft: 28, paddingRight: 28 }}
        >
          {cta}
        </motion.button>
      )}
    </motion.div>
  );
}

// Specific empty states with calisthenics flavor
const EMPTY_WORKOUT = (lang, onCta) => (
  <EmptyState
    emoji="💪"
    text={lang === "sr" ? "Vreme za trening!" : "Time to train!"}
    sub={lang === "sr"
      ? "Dodaj prvu vežbu i počni da gradiš svoje telo."
      : "Add your first exercise and start building your body."}
    cta={lang === "sr" ? "Dodaj vežbu" : "Add exercise"}
    onCta={onCta}
  />
);

const EMPTY_STATS = (lang, onCta) => (
  <EmptyState
    emoji="📈"
    text={lang === "sr" ? "Nema podataka još." : "No data yet."}
    sub={lang === "sr"
      ? "Odradi prvi trening pa ćeš ovde videti svoj napredak."
      : "Complete your first workout to see progress here."}
    cta={lang === "sr" ? "Treniraj" : "Train now"}
    onCta={onCta}
  />
);

const EMPTY_GOALS = (
  <EmptyState
    emoji="🎯"
    text="Nema ciljeva"
    sub="Postavi sebi ciljeve i prati napredak svaki dan."
  />
);

const EMPTY_STREAK = (
  <EmptyState
    emoji="🔥"
    text="Bez streaka"
    sub="Treniraj danas i zapali svoju seriju!"
  />
);

// ── Dashboard Hero ────────────────────────────────────────
function DashboardHero({ savedData, accent, streak, atRisk, onAddWorkout, onTierClick }) {
  const { hue, sat } = accent;
  const xp      = calcXP(savedData, EXERCISE_DB);
  const tierFull = getTier(xp);
  const tier    = { ...getTierInfo(xp), tierObj: tierFull.tier, nextTierObj: tierFull.nextTier };

  const prCount = useMemo(() => {
    const bests = {};
    [...savedData].reverse().forEach(w => {
      Object.entries(w.exercises).forEach(([id, v]) => {
        if (!bests[id] || v.total > bests[id]) bests[id] = v.total;
      });
    });
    return Object.keys(bests).length;
  }, [savedData]);

  const tierObj   = tier.tierObj;
  const tierColor = tierObj?.color || hsl(hue, sat, 68);
  const tierGlow  = tierObj?.glow  || hsl(hue, sat, 60, 0.3);
  const tierBg    = tierObj?.bg    || `linear-gradient(135deg, ${hsl(hue,sat,60,0.1)}, transparent)`;

  // Goal preview
  const goals = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("fitpulse_goals") || "{}"); } catch { return {}; }
  }, [savedData]);
  const goalEntries = Object.entries(goals).slice(0, 1);
  const firstGoal = goalEntries[0];
  let goalProgress = 0, goalName = "", goalTarget = 0;
  if (firstGoal) {
    const [key, target] = firstGoal;
    goalTarget = target;
    const [period, exId] = key.split("_").length > 1
      ? [key.split("_")[0], key.split("_").slice(1).join("_")]
      : ["weekly", key];
    const ex = getExerciseById(exId);
    goalName = ex ? ex.sr : exId;
    const cutoff = period === "daily" ? todayStr()
      : new Date(Date.now() - (period === "weekly" ? 7 : 30) * 86400000).toISOString().split("T")[0];
    const actual = savedData.filter(w => w.date >= cutoff).reduce((s, w) => s + (w.exercises[exId]?.total || 0), 0);
    goalProgress = Math.min(Math.round((actual / target) * 100), 100);
  }

  return (
    <div style={{ padding: "10px 16px 0" }}>
      {/* ── HERO CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={onTierClick}
        whileTap={{ scale: 0.985 }}
        className="shimmer-wrap"
        style={{
          background: "var(--surface-1)",
          border: `1px solid ${tierColor}30`,
          borderRadius: "var(--radius-xl)",
          padding: "18px 20px",
          marginBottom: 10,
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          boxShadow: `0 0 50px ${tierGlow}, var(--shadow-card)`,
        }}
      >
        {/* BG gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: tierBg, opacity: 0.5, pointerEvents: "none",
        }} />
        {/* Glow orb top-right */}
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 200, height: 200,
          background: `radial-gradient(circle, ${tierGlow}, transparent 65%)`,
          pointerEvents: "none",
        }} />
        {/* Subtle grid pattern */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Tier badge + XP row */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 16,
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: `${tierColor}16`,
              border: `1px solid ${tierColor}40`,
              borderRadius: "var(--radius-full)",
              padding: "5px 14px",
            }}>
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: tierColor,
                  boxShadow: `0 0 8px ${tierGlow}`,
                }}
              />
              <span style={{
                fontFamily: "var(--font-display)", fontSize: 11,
                fontWeight: 800, color: tierColor, letterSpacing: "0.08em",
              }}>
                {tier.tierName.toUpperCase()} {tierObj?.icon}
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: 16,
                fontWeight: 800, color: tierColor,
                textShadow: `0 0 14px ${tierGlow}`,
              }}>
                {tier.xp.toLocaleString()} XP
              </div>
              <div style={{ fontSize: 10, color: "var(--text3)" }}>ukupno</div>
            </div>
          </div>

          {/* Bicep + Stats */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <div style={{ flexShrink: 0 }}>
              <BicepsProgress progress={tier.progress} tier={tierObj} size={82} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr 1px 1fr" }}>
                {[
                  { val: savedData.length, lbl: "Treninga" },
                  null,
                  { val: atRisk ? "⚠️" : `${streak}🔥`, lbl: "Streak" },
                  null,
                  { val: prCount, lbl: "PR-ovi" },
                ].map((s, i) =>
                  s === null
                    ? <div key={i} style={{ background: "var(--border)", margin: "4px 0" }} />
                    : <div key={i} style={{ textAlign: "center", padding: "0 6px" }}>
                        <motion.div
                          key={s.val}
                          initial={{ scale: 1.2, color: tierColor }}
                          animate={{ scale: 1, color: "var(--text)" }}
                          transition={{ duration: 0.35 }}
                          style={{
                            fontFamily: "var(--font-display)", fontSize: 22,
                            fontWeight: 800, lineHeight: 1, marginBottom: 4,
                          }}
                        >{s.val}</motion.div>
                        <div style={{
                          fontSize: 9, color: "var(--text3)",
                          textTransform: "uppercase", letterSpacing: "0.1em",
                        }}>{s.lbl}</div>
                      </div>
                )}
              </div>
            </div>
          </div>

          {/* XP progress bar */}
          <div className="progress-track" style={{ height: 6, marginBottom: 6 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${tier.progress}%` }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="progress-fill"
              style={{ background: `linear-gradient(90deg, ${tierColor}66, ${tierColor})` }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text3)" }}>
            <span style={{ color: tierColor, fontWeight: 700 }}>{tier.tierName}</span>
            {tier.isTitaniumMax
              ? <span style={{ color: tierColor }}>🌌 TRUE ENDGAME</span>
              : tier.nextTierObj
                ? <span>još <span style={{ color: tierColor, fontWeight: 700 }}>{tier.remaining} XP</span> do {tier.nextTierObj?.icon} {tier.nextName}</span>
                : <span style={{ color: tierColor }}>MAX TIER 🔱</span>
            }
          </div>
        </div>
      </motion.div>

      {/* Goal preview */}
      {firstGoal && goalName && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.28 }}
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            marginBottom: 4,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <div style={{
                fontSize: 10, color: "var(--text3)",
                fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.08em", marginBottom: 2,
              }}>🎯 Sledeći cilj</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700 }}>{goalName}</div>
            </div>
            <div style={{
              fontFamily: "var(--font-display)", fontSize: 17,
              fontWeight: 800, color: hsl(hue, sat, 68),
            }}>{goalProgress}%</div>
          </div>
          <div className="progress-track" style={{ height: 5 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goalProgress}%` }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="progress-fill"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Settings Tab ──────────────────────────────────────────
function SettingsTab({ accent, isDark, setAccent, setIsDark, lang, setLang, savedData }) {
  const { hue, sat } = accent;
  const acL  = hsl(hue, sat, 72);
  const acBg = hsl(hue, sat, 62, 0.12);
  const acBd = hsl(hue, sat, 62, 0.28);

  const [sound,   setSound]   = useState(() => { try { return JSON.parse(localStorage.getItem("fitpulse_sound") ?? "true"); } catch { return true; } });
  const [haptics, setHaptics] = useState(() => { try { return JSON.parse(localStorage.getItem("fitpulse_haptics") ?? "true"); } catch { return true; } });

  const Toggle = ({ on, onToggle }) => (
    <div
      onClick={onToggle}
      className="toggle-track"
      style={{ background: on ? hsl(hue,sat,55) : "var(--surface-3)", borderColor: on ? hsl(hue,sat,55,0.5) : "var(--border2)" }}
    >
      <motion.div
        className="toggle-thumb"
        animate={{ x: on ? 22 : 3 }}
        transition={SPRING_STIFF}
      />
    </div>
  );

  const SettingRow = ({ icon, title, desc, right }) => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "15px 16px", borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "var(--radius-sm)",
          background: acBg, border: `1px solid ${acBd}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: acL, fontSize: 17, flexShrink: 0,
        }}>
          <i className={`ti ${icon}`} aria-hidden="true" />
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{title}</div>
          {desc && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>{desc}</div>}
        </div>
      </div>
      {right}
    </div>
  );

  const xp   = calcXP(savedData, EXERCISE_DB);
  const tier = getTierInfo(xp);

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Profile card */}
      <div style={{ margin: "12px 16px 0", position: "relative", overflow: "hidden", background: "var(--surface-1)", border: `1px solid ${acBd}`, borderRadius: "var(--radius-lg)", padding: "20px" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 140, height: 140, background: hsl(hue,sat,62,0.15), borderRadius: "50%", filter: "blur(40px)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 54, height: 54, borderRadius: "var(--radius-md)", background: acBg, border: `2px solid ${acBd}`, display: "flex", alignItems: "center", justifyContent: "center", color: acL, fontSize: 26 }}>
            <i className="ti ti-user" aria-hidden="true" />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800 }}>FitPulse</div>
            <div style={{ fontSize: 13, color: acL, fontWeight: 700, marginTop: 2 }}>{tier.tierName} · {tier.xp.toLocaleString()} XP</div>
          </div>
        </div>
      </div>

      {/* IZGLED */}
      <div className="section-label">Izgled</div>
      <div style={{ margin: "0 16px", background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
        {/* Accent */}
        <div style={{ padding: "15px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: acBg, border: `1px solid ${acBd}`, display: "flex", alignItems: "center", justifyContent: "center", color: acL, fontSize: 17 }}>
              <i className="ti ti-palette" aria-hidden="true" />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700 }}>Accent boja</div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>Menja sve boje u app-u</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {ACCENT_PRESETS.map((p, i) => {
              const isOn = accent.hue === p.hue;
              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.82 }}
                  onClick={() => setAccent(p.hue, p.sat)}
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: SWATCH_COLORS[i],
                    border: `2.5px solid ${isOn ? "white" : "transparent"}`,
                    boxShadow: isOn ? `0 0 0 3px ${SWATCH_COLORS[i]}55` : "none",
                    cursor: "pointer",
                    transition: `all var(--dur-normal)`,
                  }}
                  aria-label={p.label}
                />
              );
            })}
          </div>
        </div>
        {/* Tema */}
        <div style={{ padding: "15px 16px", borderBottom: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: acBg, border: `1px solid ${acBd}`, display: "flex", alignItems: "center", justifyContent: "center", color: acL, fontSize: 17 }}>
              <i className={`ti ${isDark ? "ti-moon" : "ti-sun"}`} aria-hidden="true" />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700 }}>Tema</div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>{isDark ? "Dark mode" : "Light mode"}</div>
            </div>
          </div>
          <Toggle on={isDark} onToggle={() => setIsDark(d => !d)} />
        </div>
      </div>

      {/* FEEDBACK */}
      <div className="section-label">Feedback</div>
      <div style={{ margin: "0 16px", background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
        <SettingRow
          icon="ti-volume" title="Zvuk" desc="Dopamine zvuk pri čuvanju"
          right={<Toggle on={sound} onToggle={() => { const v = !sound; setSound(v); localStorage.setItem("fitpulse_sound", v); }} />}
        />
        <div style={{ borderBottom: "none" }}>
          <SettingRow
            icon="ti-wave-sine" title="Haptics" desc="Vibracija pri akcijama"
            right={<Toggle on={haptics} onToggle={() => { const v = !haptics; setHaptics(v); localStorage.setItem("fitpulse_haptics", v); }} />}
          />
        </div>
      </div>

      {/* JEZIK */}
      <div className="section-label">Jezik</div>
      <div style={{ margin: "0 16px", background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[{ code: "sr", label: "🇷🇸 Srpski" }, { code: "en", label: "🇬🇧 English" }].map(l => {
            const isOn = lang === l.code;
            return (
              <motion.button key={l.code} whileTap={{ scale: 0.95 }} onClick={() => setLang(l.code)}
                style={{
                  padding: "14px", borderRadius: "var(--radius-sm)",
                  fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700,
                  cursor: "pointer",
                  border: `1px solid ${isOn ? acBd : "var(--border)"}`,
                  background: isOn ? acBg : "var(--surface-2)",
                  color: isOn ? acL : "var(--text3)",
                  transition: `all var(--dur-normal)`,
                }}>
                {l.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* CILJEVI */}
      <div className="section-label">Ciljevi</div>
      <div style={{ margin: "0 16px" }}>
        <GoalsSystem savedData={savedData} accent={accent} lang={lang} />
      </div>

      {/* PODSETNICI */}
      <div className="section-label">Podsetnici</div>
      <div style={{ margin: "0 16px" }}>
        <RemindersPanel savedData={savedData} accent={accent} />
      </div>

      {/* STATISTIKA */}
      <div className="section-label">Statistika</div>
      <div style={{ margin: "0 16px", background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px 16px" }}>
        {[
          { label: "Ukupno treninga", val: savedData.length },
          { label: "Ukupno XP",       val: xp.toLocaleString() },
          { label: "Tier",            val: tier.tierName },
        ].map((s, i, arr) => (
          <div key={s.label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "9px 0",
            borderBottom: i < arr.length-1 ? "1px solid var(--border)" : "none",
          }}>
            <span style={{ fontSize: 13, color: "var(--text2)" }}>{s.label}</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: acL }}>{s.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Exercise Card ─────────────────────────────────────────
const ExerciseCard = React.memo(({ exId, exName, exIndex, value, onChange, pr, onRemove }) => {
  const { hue, sat } = React.useContext(AccentCtx);
  const l     = EX_LIGHTNESS_ROLES[exIndex % EX_LIGHTNESS_ROLES.length];
  const color = hsl(hue, sat, l);
  const colBg = hsl(hue, sat, l, 0.09);
  const colBd = hsl(hue, sat, l, 0.26);
  const icon  = getIcon(exId);
  const exObj = EXERCISE_DB.find(e => e.id === exId);
  const isHoldEx = exObj?.isHold || false;
  const nums  = parseNums(value);
  const hasData = nums.length > 0;
  const total   = hasData ? calcTotal(value) : 0;
  const isNewPR = hasData && total > pr && pr > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0, scale: 0.95 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      style={{
        background: hasData ? colBg : "var(--surface-1)",
        border: `1px solid ${hasData ? colBd : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "15px 16px",
        marginBottom: 10,
        overflow: "hidden",
        transition: "background 0.2s, border-color 0.2s",
        boxShadow: hasData ? `0 2px 12px ${colBd}` : "none",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "var(--radius-sm)",
            background: colBg, border: `1.5px solid ${colBd}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color, fontSize: 19, flexShrink: 0,
          }}>
            <i className={`ti ${icon}`} aria-hidden="true" />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>{exName}</div>
            {pr > 0 && (
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>
                🏆 PR: <span style={{ color, fontWeight: 700 }}>{pr}</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {hasData && (
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{
                background: "var(--surface-2)", borderRadius: "var(--radius-sm)",
                padding: "7px 11px", textAlign: "center", minWidth: 54,
              }}>
                <div style={{ fontSize: 9, color: "var(--text4)", marginBottom: 2, fontWeight: 700, textTransform: "uppercase" }}>{isHoldEx ? "Sekundi" : "Ukupno"}</div>
                <motion.div
                  key={total}
                  initial={{ scale: 1.25 }}
                  animate={{ scale: 1 }}
                  style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: isNewPR ? hsl(hue,sat,78) : color, lineHeight: 1 }}
                >
                  {total}{isHoldEx ? "s" : ""}{isNewPR && <span style={{ fontSize: 11 }}>★</span>}
                </motion.div>
              </div>
              <div style={{
                background: "var(--surface-2)", borderRadius: "var(--radius-sm)",
                padding: "7px 11px", textAlign: "center", minWidth: 54,
              }}>
                <div style={{ fontSize: 9, color: "var(--text4)", marginBottom: 2, fontWeight: 700, textTransform: "uppercase" }}>Prosek</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--text2)", lineHeight: 1 }}>{calcAvg(value)}</div>
              </div>
            </div>
          )}
          <motion.button
            whileTap={{ scale: 0.82 }}
            onClick={() => onRemove(exId)}
            style={{
              background: "var(--danger-dim)", border: "1px solid rgba(239,68,68,0.18)",
              color: "#f87171", borderRadius: "var(--radius-sm)",
              width: 36, height: 36, fontSize: 14, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <i className="ti ti-x" aria-hidden="true" />
          </motion.button>
        </div>
      </div>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={isHoldEx ? "sek. npr. 30 20 15" : "rep. npr. 15 12 10"}
        inputMode="numeric"
        className="input-field"
        style={{
          borderColor: hasData ? colBd : undefined,
          background: "var(--bg)",
        }}
      />

      {/* Set chips */}
      <AnimatePresence>
        {hasData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              {nums.map((n, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.04, type: "spring", stiffness: 380, damping: 22 }}
                  style={{
                    background: colBg, color,
                    borderRadius: "var(--radius-sm)", padding: "5px 13px",
                    fontSize: 15, fontWeight: 700, fontFamily: "var(--font-display)",
                    border: `1px solid ${colBd}`,
                  }}
                >
                  {n}
                </motion.span>
              ))}
              <span style={{ color: "var(--text3)", fontSize: 12 }}>
                {nums.length} {isHoldEx ? "set" : `serij${nums.length === 1 ? "a" : "e"}`}
                {isHoldEx && <span style={{ color: "var(--text4)", marginLeft: 4 }}>· {total}s</span>}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// ── History Entry ─────────────────────────────────────────
const HistoryEntry = React.memo(({ entry, lang, onDelete }) => {
  const { hue, sat } = React.useContext(AccentCtx);
  const [confirming, setConfirming] = useState(false);
  const exercises = Object.entries(entry.exercises).filter(([, v]) => v?.total > 0);
  const totalReps = exercises.reduce((s, [, v]) => s + (v?.total || 0), 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "14px 16px",
        marginBottom: 10,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>{formatDate(entry.date)}</div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{exercises.length} vežbi · {totalReps} reps</div>
        </div>
        {!confirming
          ? <motion.button whileTap={{ scale: 0.9 }} onClick={() => setConfirming(true)}
              className="btn btn-danger"
              style={{ padding: "6px 14px", fontSize: 12 }}>Obriši</motion.button>
          : <div style={{ display: "flex", gap: 6 }}>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setConfirming(false)}
                style={{ background: "var(--surface-2)", border: "none", color: "var(--text3)", borderRadius: "var(--radius-sm)", padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>Ne</motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => onDelete(entry.id)}
                style={{ background: "var(--danger)", border: "none", color: "#fff", borderRadius: "var(--radius-sm)", padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Briši</motion.button>
            </div>
        }
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {exercises.map(([exId, v], i) => {
          const dbIdx = EXERCISE_DB.findIndex(e => e.id === exId);
          const l = EX_LIGHTNESS_ROLES[(dbIdx >= 0 ? dbIdx : i) % EX_LIGHTNESS_ROLES.length];
          const col = hsl(hue, sat, l);
          return (
            <div key={exId} style={{
              background: hsl(hue,sat,l,0.09), border: `1px solid ${hsl(hue,sat,l,0.22)}`,
              borderRadius: "var(--radius-sm)", padding: "5px 11px",
              fontSize: 13, display: "flex", alignItems: "center", gap: 5,
            }}>
              <i className={`ti ${getIcon(exId)}`} style={{ color: col, fontSize: 13 }} aria-hidden="true" />
              <span style={{ color: col, fontWeight: 700 }}>{v.total}</span>
              <span style={{ color: "var(--text4)", fontSize: 11 }}>rep</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
});

// ── Stats Skeleton ────────────────────────────────────────
function StatsSkel() {
  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
      <Skel h={168} r={16} />
      <div style={{ display: "flex", gap: 8 }}>
        <Skel w={88} h={36} r={22} /><Skel w={104} h={36} r={22} /><Skel w={92} h={36} r={22} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <Skel h={84} r={14} /><Skel h={84} r={14} /><Skel h={84} r={14} />
      </div>
      <Skel h={190} r={16} />
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────
export default function App() {
  const [accent,    setAccentState] = useState(() => loadAccent());
  const [isDark,    setIsDark]      = useState(() => loadTheme() === "dark");
  const [tab,       setTabState]    = useState("log");
  const [date,      setDate]        = useState(todayStr());
  const [lang,      setLangState]   = useState(() => loadLang());

  const [activeExercises, setActiveExercises] = useState([]);
  const [inputs,          setInputs]          = useState({});
  const [showSearch,      setShowSearch]       = useState(false);
  const [savedData,       setSavedData]        = useState(() => loadData());
  const [recentIds,       setRecentIds]        = useState(() => loadRecentExercises());
  const [selectedExId,    setSelectedExId]     = useState(null);
  const [prs,             setPRs]              = useState([]);
  const [statsLoading,    setStatsLoading]     = useState(false);
  const [saveFlash,       setSaveFlash]        = useState(false);
  const [showShareCard,   setShowShareCard]    = useState(false);
  const [prevTierId,      setPrevTierId]       = useState(() => {
    try { return localStorage.getItem("fitpulse_prev_tier") || "bronze"; } catch { return "bronze"; }
  });
  const [newAchievements, setNewAchievements]  = useState([]);
  const [rankUpMuscleIds, setRankUpMuscleIds]  = useState([]);
  const [toastQueue,      setToastQueue]        = useState([]);
  const [sessionMode,    setSessionMode]      = useState(false);
  const [showDraftBanner, setShowDraftBanner]  = useState(false);

  // ── Auto-save draft ───────────────────────────────────────
  const DRAFT_KEY = "fitpulse_current_workout_draft";
  const draftTimerRef = useRef(null);

  const saveDraft = useCallback((exercises, inpts, dt) => {
    // Ne čuvaj potpuno prazne vežbe
    const hasData = exercises.some(e => inpts[e.id]?.trim());
    if (!hasData) {
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      return;
    }
    const draft = { exercises, inputs: inpts, date: dt, savedAt: Date.now() };
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch {}
  }, []);

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
  }, []);

  const loadDraft = useCallback(() => {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); } catch { return null; }
  }, []);

  // Proveri draft pri mount-u
  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.exercises?.length > 0) {
      setShowDraftBanner(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save sa debounce 400ms
  useEffect(() => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      saveDraft(activeExercises, inputs, date);
    }, 400);
    return () => { if (draftTimerRef.current) clearTimeout(draftTimerRef.current); };
  }, [activeExercises, inputs, date, saveDraft]);

  useEffect(() => { saveData(savedData); }, [savedData]);
  useEffect(() => { applyAccent(accent.hue, accent.sat); }, [accent]);
  useEffect(() => {
    document.documentElement.classList.toggle("light", !isDark);
    saveTheme(isDark ? "dark" : "light");
  }, [isDark]);

  // ── Muscle XP migration — version-aware, runs on every system upgrade ──
  // v3: forces full recalc from history with correct DR curve.
  // Any stored version < MUSCLE_SYSTEM_VERSION triggers automatic migration.
  useEffect(() => {
    try {
      const storedVersion = loadMuscleXPVersion();
      const needsMigration = storedVersion < MUSCLE_SYSTEM_VERSION;

      if (needsMigration && savedData.length > 0) {
        // Full recalc: wipe old data, replay history with current DR
        console.info(
          `[MuscleXP] Migrating v${storedVersion} → v${MUSCLE_SYSTEM_VERSION}`,
          `(${savedData.length} workouts)`
        );
        resetMuscleXP();
        const migrated = migrateFromHistory(savedData);
        saveMuscleXP(migrated); // also writes new version key
      } else if (needsMigration && savedData.length === 0) {
        // No history yet — just stamp the version so we don't re-run
        try { localStorage.setItem("fitpulse_muscle_xp_version", String(MUSCLE_SYSTEM_VERSION)); } catch {}
      }
    } catch (e) {
      console.warn("Muscle XP migration error:", e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAccent = useCallback((hue, sat) => {
    setAccentState({ hue, sat }); saveAccent(hue, sat);
  }, []);

  const setLang = useCallback((l) => { setLangState(l); saveLang(l); }, []);

  const pushToast = useCallback((toast) => {
    setToastQueue(prev => [...prev, toast]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToastQueue(prev => prev.filter(t => t.id !== id));
  }, []);



  const setTab = useCallback((id) => {
    if (id === "stats") { setStatsLoading(true); setTimeout(() => setStatsLoading(false), 340); }
    setTabState(id); haptic([5]);
  }, []);

  const getPR = useCallback((exId) =>
    savedData.length ? Math.max(...savedData.map(w => w.exercises[exId]?.total || 0)) : 0,
    [savedData]);

  const addExercise = useCallback((ex) => {
    setActiveExercises(prev => {
      if (prev.find(e => e.id === ex.id)) return prev;
      return [...prev, { id: ex.id, name: lang === "sr" ? ex.sr : ex.en }];
    });
    setInputs(prev => {
      if (prev[ex.id] !== undefined) return prev; // vežba već postoji u sesiji, ne diraj
      return { ...prev, [ex.id]: "" }; // nova vežba — uvek počinje prazna
    });
    setShowDraftBanner(false);
    setShowSearch(false); haptic([10, 5, 10]);
    const updated = [ex.id, ...recentIds.filter(id => id !== ex.id)].slice(0, 10);
    setRecentIds(updated); saveRecentExercises(updated);
  }, [lang, recentIds]);

  const removeExercise = useCallback((exId) => {
    setActiveExercises(prev => prev.filter(e => e.id !== exId));
    setInputs(prev => { const n = { ...prev }; delete n[exId]; return n; });
    haptic([10]);
  }, []);

  const setInput = useCallback((exId, val) => setInputs(prev => ({ ...prev, [exId]: val })), []);

  // ── Smart prefill: get last sets for an exercise ──────────
  const getSmartPrefill = useCallback((exId) => {
    const lastWorkout = savedData.find(w => w.exercises[exId]?.raw);
    if (!lastWorkout) return "";
    return lastWorkout.exercises[exId]?.raw || "";
  }, [savedData]);

  const saveWorkout = (sessionInfo = null) => {
    const anyInput = activeExercises.some(e => inputs[e.id]?.trim());
    if (!anyInput) return null;
    haptic([20, 10, 30]);
    const exercises = {};
    activeExercises.forEach(e => {
      exercises[e.id] = {
        raw: inputs[e.id] || "",
        average: calcAvg(inputs[e.id] || ""),
        total: calcTotal(inputs[e.id] || ""),
        sets: parseNums(inputs[e.id] || "").length,
      };
    });
    const workout = {
      id: Date.now(), date, exercises,
      ...(sessionInfo ? { startTime: sessionInfo.startTime, endTime: sessionInfo.endTime } : {}),
    };
    const newPRs  = detectNewPRs(workout, savedData);
    const nextData = [workout, ...savedData];
    setSavedData(nextData);
    const rawWXP = workoutXP(workout, EXERCISE_DB);
    const finalWXP = applyPRBonus(rawWXP, newPRs.length > 0);
    try { appendXPHistory(finalWXP); } catch {}
    setInputs(Object.fromEntries(activeExercises.map(e => [e.id, ""])));
    clearDraft();
    setSaveFlash(true); setTimeout(() => setSaveFlash(false), 900);
    pushToast(makeSaveToast(workout, accent, lang));
    const streakNow = computeStreak(nextData).current;
    const unlocked = checkAchievements(nextData, streakNow);
    const prevSet = new Set(loadUnlockedAchievements());
    const fresh = unlocked.filter(id => !prevSet.has(id));
    const freshAchievements = [];
    if (fresh.length) {
      saveUnlockedAchievements(unlocked);
      fresh.forEach(id => {
        const a = ACHIEVEMENTS.find(x => x.id === id);
        if (a) { pushToast(makeAchievementToast(a, accent)); freshAchievements.push(a); }
      });
    }
    if (newPRs.length) setTimeout(() => setPRs(newPRs), 600);

    // ── Muscle XP ────────────────────────────────────────────
    let muscleXPGains = {}, sessionRankUps = [];
    try {
      const currentMuscleXP = loadMuscleXP();
      const gains = computeMuscleXPGains(workout);
      muscleXPGains = gains;
      const { newMuscleXP, rankUps } = applyMuscleXPGains(gains, currentMuscleXP);
      sessionRankUps = rankUps;
      saveMuscleXP(newMuscleXP);
      if (rankUps.length) {
        const ids = rankUps.map(ru => ru.muscleId);
        setRankUpMuscleIds(ids);
        setTimeout(() => setRankUpMuscleIds([]), 2500);
        rankUps.forEach((ru, i) => {
          setTimeout(() => {
            pushToast(makeMuscleRankUpToast(ru.muscleId, ru.newRank, accent));
          }, 800 + i * 600);
        });
      }
    } catch (e) {
      console.warn("Muscle XP error:", e);
    }

    // Return summary data for SessionMode
    return { workout, newPRs, newAchievements: freshAchievements, muscleXPGains, rankUps: sessionRankUps };
  };

  const deleteWorkout = useCallback((id) => {
    haptic([10, 5, 10]); setSavedData(prev => prev.filter(w => w.id !== id));
  }, []);

  const allExIds = useMemo(() => {
    const ids = new Set(); savedData.forEach(w => Object.keys(w.exercises).forEach(id => ids.add(id)));
    return [...ids];
  }, [savedData]);

  const getStats = (exId, days) => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
    const filtered = savedData.filter(w => new Date(w.date) >= cutoff && (w.exercises[exId]?.total||0) > 0);
    if (!filtered.length) return { avg: 0, sessions: 0 };
    return {
      avg: (filtered.reduce((s,w) => s + Number(w.exercises[exId]?.total||0), 0) / filtered.length).toFixed(1),
      sessions: filtered.length,
    };
  };

  const getChartData = (exId) =>
    [...savedData].reverse().slice(-12).map(w => ({ date: w.date.slice(5), total: Number(w.exercises[exId]?.total||0) }));

  const getOverviewData = () =>
    allExIds.map((id, i) => {
      const ex = getExerciseById(id); const pr = getPR(id); if (!pr) return null;
      const dbIdx = EXERCISE_DB.findIndex(e => e.id === id);
      return { name: (ex ? (lang==="sr" ? ex.sr : ex.en) : id).slice(0,8), fullName: ex ? (lang==="sr" ? ex.sr : ex.en) : id, pr, id, colorIdx: dbIdx >= 0 ? dbIdx : i };
    }).filter(Boolean);

  const { current: streak, atRisk, longest: longestStreak, comebackBonus } = useMemo(() => computeStreak(savedData), [savedData]);
  const hasAnyInput  = activeExercises.some(e => inputs[e.id]?.trim());
  const statsExId    = selectedExId || allExIds[0] || null;
  const statsEx      = statsExId ? getExerciseById(statsExId) : null;
  const statsExIdx   = statsExId ? Math.max(0, EXERCISE_DB.findIndex(e => e.id === statsExId)) : 0;

  const { hue, sat }  = accent;
  const acL    = hsl(hue, sat, 72);
  const acD    = hsl(hue, sat, 42);
  const acBd   = hsl(hue, sat, 62, 0.28);
  const acGlow = hsl(hue, sat, 62, 0.38);
  const statsColor = hsl(hue, sat, EX_LIGHTNESS_ROLES[statsExIdx % EX_LIGHTNESS_ROLES.length]);

  const currentXP   = useMemo(() => calcXP(savedData, EXERCISE_DB), [savedData]);
  const tierData    = useMemo(() => getTier(currentXP), [currentXP]);
  const totalRepsAll = useMemo(() =>
    savedData.reduce((s, w) => s + Object.values(w.exercises).reduce((a, v) => a + (v?.total || 0), 0), 0),
    [savedData]);


  // Sync achievement storage on load (no toast flood for historical unlocks)
  const achSyncedRef = React.useRef(false);
  useEffect(() => {
    if (achSyncedRef.current) return;
    achSyncedRef.current = true;
    const unlocked = checkAchievements(savedData, streak);
    if (!loadUnlockedAchievements().length && unlocked.length) {
      saveUnlockedAchievements(unlocked);
    }
  }, []);

  // Streak milestone & comeback bonus toasts
  const prevStreakRef = React.useRef(streak);
  const comebackToastedRef = React.useRef(false);
  useEffect(() => {
    const prev = prevStreakRef.current;
    prevStreakRef.current = streak;
    if (streak === prev) return;
    const milestones = [3, 7, 14, 30, 60, 100, 180, 365];
    if (milestones.includes(streak)) {
      pushToast(makeStreakMilestoneToast(streak, accent));
    }
  }, [streak, accent, pushToast]);

  useEffect(() => {
    if (!comebackBonus || comebackToastedRef.current) return;
    comebackToastedRef.current = true;
    pushToast(makeComebackToast(accent));
  }, [comebackBonus, accent, pushToast]);

  // Tier upgrade detection
  useEffect(() => {
    const current = tierData.tier.id;
    if (prevTierId && prevTierId !== current) {
      try { localStorage.setItem("fitpulse_prev_tier", current); } catch {}
      setPrevTierId(current);
      setShowShareCard(true);
    }
  }, [tierData.tier.id]);

  return (
    <AccentCtx.Provider value={accent}>
      <div style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "var(--font-body)",
        paddingBottom: "var(--content-pb)",
        overflowX: "hidden",
      }}>

        {/* ── HEADER ── */}
        <div
          className="glass"
          style={{
            padding: "max(52px, calc(env(safe-area-inset-top) + 16px)) 20px 14px",
            borderBottom: "1px solid var(--border)",
            position: "sticky", top: 0, zIndex: 100,
          }}
        >
          <div style={{ maxWidth: 500, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h1 style={{
                fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800,
                letterSpacing: -0.8, margin: 0, color: acL,
              }}>FitPulse</h1>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>
                {lang === "sr" ? "Kalistenic tracker" : "Calisthenics tracker"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {streak > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  style={{
                    background: atRisk ? "var(--danger-dim)" : hsl(hue,sat,62,0.12),
                    border: `1px solid ${atRisk ? "rgba(239,68,68,0.3)" : acBd}`,
                    borderRadius: "var(--radius-sm)",
                    padding: "6px 13px",
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: 13, fontWeight: 700,
                    color: atRisk ? "#fca5a5" : acL,
                  }}
                >
                  <i className="ti ti-flame" aria-hidden="true" />{streak}
                </motion.div>
              )}
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setIsDark(d => !d)}
                className="icon-btn"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border2)" }}
              >
                <i className={`ti ${isDark ? "ti-sun" : "ti-moon"}`} aria-hidden="true" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <AnimatePresence mode="wait">

            {/* ── LOG TAB ── */}
            {tab === "log" && (
              <motion.div key="log" {...PAGE_ANIM}>
                <DashboardHero
                  savedData={savedData} accent={accent}
                  streak={streak} atRisk={atRisk}
                  onAddWorkout={() => { setShowSearch(true); haptic([5]); }}
                  onTierClick={() => setTabState("tier")}
                />

                <div style={{ padding: "10px 16px 8px" }}>
                  <StreakBanner savedData={savedData} accent={accent} />
                  <WeeklyRecap savedData={savedData} accent={accent} lang={lang} />

                  {/* ── Draft banner ── */}
                  {showDraftBanner && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      style={{
                        background: hsl(hue, sat, 60, 0.1),
                        border: `1.5px solid ${acBd}`,
                        borderRadius: "var(--radius-lg)",
                        padding: "14px 16px",
                        marginBottom: 14,
                        display: "flex", flexDirection: "column", gap: 10,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 22 }}>📋</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
                            {lang === "sr" ? "Imaš nedovršen trening. Nastavi?" : "You have an unfinished workout. Continue?"}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
                            {lang === "sr" ? "Sačuvani podaci iz prethodne sesije" : "Data saved from previous session"}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            const draft = loadDraft();
                            if (draft) {
                              setActiveExercises(draft.exercises || []);
                              setInputs(draft.inputs || {});
                              setDate(draft.date || todayStr());
                            }
                            setShowDraftBanner(false);
                          }}
                          style={{
                            flex: 2, padding: "11px",
                            borderRadius: "var(--radius-sm)",
                            background: `linear-gradient(135deg, ${acD}, ${hsl(hue, sat, 64)})`,
                            border: "none", color: "#fff",
                            fontWeight: 700, fontSize: 13, cursor: "pointer",
                          }}
                        >
                          {lang === "sr" ? "Nastavi trening" : "Resume workout"}
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            clearDraft();
                            setShowDraftBanner(false);
                          }}
                          style={{
                            flex: 1, padding: "11px",
                            borderRadius: "var(--radius-sm)",
                            background: "var(--surface-2)",
                            border: "1px solid var(--border)",
                            color: "var(--text3)",
                            fontWeight: 600, fontSize: 13, cursor: "pointer",
                          }}
                        >
                          {lang === "sr" ? "Obriši draft" : "Discard"}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Date picker */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{
                      fontSize: 10, color: "var(--text3)", display: "block",
                      marginBottom: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em",
                    }}>
                      {lang === "sr" ? "Datum treninga" : "Workout date"}
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <AnimatePresence>
                    {activeExercises.map((ex, i) => {
                      const dbIdx = EXERCISE_DB.findIndex(e => e.id === ex.id);
                      return (
                        <ExerciseCard
                          key={ex.id} exId={ex.id} exName={ex.name}
                          exIndex={dbIdx >= 0 ? dbIdx : i}
                          value={inputs[ex.id] || ""}
                          onChange={val => setInput(ex.id, val)}
                          pr={getPR(ex.id)}
                          onRemove={removeExercise}
                        />
                      );
                    })}
                  </AnimatePresence>

                  {/* Empty state if no exercises added */}
                  {activeExercises.length === 0 && (
                    <EmptyState
                      emoji="💪"
                      text={lang === "sr" ? "Bez vežbi" : "No exercises"}
                      sub={lang === "sr" ? "Dodaj vežbu da počneš trening" : "Add an exercise to start training"}
                    />
                  )}

                  {/* Add exercise button */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ y: -2 }}
                    onClick={() => { setShowSearch(true); haptic([5]); }}
                    style={{
                      width: "100%", marginBottom: 12, marginTop: activeExercises.length === 0 ? 8 : 0,
                      padding: "15px",
                      background: "var(--surface-1)",
                      border: `1.5px dashed ${acBd}`,
                      borderRadius: "var(--radius-lg)",
                      color: "var(--text3)",
                      fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600,
                      cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                      transition: "all var(--dur-normal)",
                    }}
                  >
                    <span style={{ color: acL, fontSize: 22, lineHeight: 1, fontWeight: 400 }}>+</span>
                    {lang === "sr" ? "Dodaj vežbu" : "Add exercise"}
                  </motion.button>

                  {/* Buttons row */}
                  <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                    {/* SESSION MODE button */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (activeExercises.length === 0) { setShowSearch(true); return; }
                        setSessionMode(true); haptic([15, 10, 20]);
                      }}
                      style={{
                        flex: 1,
                        padding: "17px",
                        background: hsl(hue, sat, 60, 0.12),
                        border: `1.5px solid ${acBd}`,
                        borderRadius: "var(--radius-lg)",
                        color: acL,
                        fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700,
                        cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        transition: "all var(--dur-normal)",
                      }}
                    >
                      <i className="ti ti-player-play-filled" style={{ fontSize: 16 }} aria-hidden="true" />
                      Session
                    </motion.button>

                    {/* Save button */}
                    <motion.button
                      whileTap={{ scale: hasAnyInput ? 0.97 : 1 }}
                      onClick={() => saveWorkout()}
                      disabled={!hasAnyInput}
                      className={saveFlash ? "glow-save" : ""}
                      style={{
                        flex: 2,
                        padding: "17px",
                        background: hasAnyInput ? `linear-gradient(135deg, ${acD}, ${hsl(hue,sat,64)})` : "var(--surface-2)",
                        border: "none",
                        borderRadius: "var(--radius-lg)",
                        color: hasAnyInput ? "#fff" : "var(--text4)",
                        fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700,
                        cursor: hasAnyInput ? "pointer" : "not-allowed",
                        boxShadow: hasAnyInput ? `0 5px 24px ${acGlow}` : "none",
                        transition: "all var(--dur-normal) var(--ease-out)",
                        letterSpacing: 0.2,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                      }}
                    >
                      {lang === "sr" ? "Sačuvaj" : "Save"}
                      {hasAnyInput && (
                        <motion.i
                          className="ti ti-check"
                          aria-hidden="true"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{ fontSize: 18 }}
                        />
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STATS TAB ── */}
            {tab === "stats" && (
              <motion.div key="stats" {...PAGE_ANIM} style={{ padding: "16px" }}>
                {statsLoading ? <StatsSkel /> : savedData.length === 0
                  ? EMPTY_STATS(lang, () => setTab("log"))
                  : (<>
                    {getOverviewData().length > 0 && (
                      <div style={{ background: "var(--surface-1)", borderRadius: "var(--radius-lg)", padding: 16, marginBottom: 16, border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 4, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em" }}>Personal Records</div>
                        <ResponsiveContainer width="100%" height={160}>
                          <BarChart data={getOverviewData()} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border2)" vertical={false} />
                            <XAxis dataKey="name" stroke="var(--text4)" tick={{ fontSize: 11 }} />
                            <YAxis stroke="var(--text4)" tick={{ fontSize: 10 }} />
                            <Tooltip content={({ active, payload }) => active && payload?.length ? (
                              <div style={{ background: "var(--surface-elevated)", border: "1px solid var(--border2)", borderRadius: "var(--radius-sm)", padding: "8px 14px", fontSize: 13 }}>
                                <p style={{ color: "var(--text3)", margin: "0 0 4px" }}>{payload[0].payload.fullName}</p>
                                <p style={{ color: payload[0].fill, margin: 0, fontWeight: 700 }}>PR: {payload[0].value} reps</p>
                              </div>) : null}
                            />
                            <Bar dataKey="pr" radius={[6, 6, 0, 0]}>
                              {getOverviewData().map(e => <Cell key={e.id} fill={hsl(hue, sat, EX_LIGHTNESS_ROLES[e.colorIdx % EX_LIGHTNESS_ROLES.length])} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Exercise filter pills */}
                    <div className="scroll-x" style={{ marginBottom: 16 }}>
                      {allExIds.map((id, i) => {
                        const ex = getExerciseById(id);
                        const dbIdx = EXERCISE_DB.findIndex(e => e.id === id);
                        const l = EX_LIGHTNESS_ROLES[(dbIdx>=0?dbIdx:i) % EX_LIGHTNESS_ROLES.length];
                        const col = hsl(hue, sat, l);
                        const isSelected = statsExId === id;
                        return (
                          <motion.button
                            key={id}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => setSelectedExId(id)}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 6,
                              padding: "8px 16px",
                              borderRadius: "var(--radius-full)",
                              border: `1px solid ${isSelected ? col : "var(--border)"}`,
                              background: isSelected ? hsl(hue,sat,l,0.14) : "var(--surface-1)",
                              color: isSelected ? col : "var(--text3)",
                              fontSize: 13, fontWeight: 600, cursor: "pointer",
                              whiteSpace: "nowrap", flexShrink: 0,
                              transition: "all var(--dur-normal)",
                            }}
                          >
                            <i className={`ti ${getIcon(id)}`} aria-hidden="true" style={{ fontSize: 14 }} />
                            {ex ? (lang==="sr" ? ex.sr : ex.en) : id}
                          </motion.button>
                        );
                      })}
                    </div>

                    {statsExId && (() => {
                      const w7 = getStats(statsExId, 7);
                      const m  = getStats(statsExId, 30);
                      const pr = getPR(statsExId);
                      const chartData = getChartData(statsExId).filter(d => d.total > 0);
                      const sName = statsEx ? (lang==="sr" ? statsEx.sr : statsEx.en) : statsExId;
                      return (<>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                          {[
                            { label: lang==="sr" ? "7 dana" : "7 days", val: w7.avg, sub: `${w7.sessions} sesija` },
                            { label: lang==="sr" ? "30 dana" : "30 days", val: m.avg, sub: `${m.sessions} sesija` },
                            { label: "PR", val: pr, sub: "reps" },
                          ].map(s => (
                            <div key={s.label} className="stat-chip">
                              <div className="stat-chip-label">{s.label}</div>
                              <div className="stat-chip-value" style={{ color: statsColor }}>{s.val}</div>
                              <div style={{ fontSize: 10, color: "var(--text4)" }}>{s.sub}</div>
                            </div>
                          ))}
                        </div>

                        {chartData.length >= 2 ? (
                          <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 16, marginBottom: 16 }}>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{sName}</div>
                            <div style={{ fontSize: 11, color: "var(--text4)", marginBottom: 14 }}>
                              {lang==="sr" ? `Poslednjih ${chartData.length} treninga` : `Last ${chartData.length} workouts`}
                            </div>
                            <ResponsiveContainer width="100%" height={160}>
                              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor={statsColor} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={statsColor} stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border2)" vertical={false} />
                                <XAxis dataKey="date" stroke="var(--text4)" tick={{ fontSize: 10 }} />
                                <YAxis stroke="var(--text4)" tick={{ fontSize: 10 }} />
                                <Tooltip content={<ChartTooltip />} />
                                <Area type="monotone" dataKey="total" name="Ukupno"
                                  stroke={statsColor} strokeWidth={2.5}
                                  fill="url(#sg)"
                                  dot={{ r: 4, fill: statsColor, strokeWidth: 0 }}
                                  activeDot={{ r: 6, fill: statsColor }}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 28, textAlign: "center", marginBottom: 16 }}>
                            <div style={{ fontSize: 32, marginBottom: 10 }}>📉</div>
                            <div style={{ color: "var(--text3)", fontSize: 14 }}>
                              {lang==="sr" ? "Treba min. 2 sesije za grafikon" : "Need at least 2 sessions for chart"}
                            </div>
                          </div>
                        )}

                        <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
                          {lang==="sr" ? "Istorija" : "History"}
                        </div>
                        <AnimatePresence>
                          {savedData.slice(0, 10).map(entry => (
                            <HistoryEntry key={entry.id} entry={entry} lang={lang} onDelete={deleteWorkout} />
                          ))}
                        </AnimatePresence>
                      </>);
                    })()}
                  </>)
                }
              </motion.div>
            )}

            {/* ── CALENDAR TAB ── */}
            {tab === "cal" && (
              <motion.div key="cal" {...PAGE_ANIM} style={{ paddingTop: 16 }}>
                <CalendarView savedData={savedData} accent={accent} />
              </motion.div>
            )}

            {/* ── TIER TAB ── */}
            {tab === "tier" && (
              <motion.div key="tier" {...PAGE_ANIM} style={{ paddingTop: 8 }}>
                <TierProfile
                  savedData={savedData}
                  accent={accent}
                  lang={lang}
                  onShareOpen={() => setShowShareCard(true)}
                  rankUpMuscleIds={rankUpMuscleIds}
                />
              </motion.div>
            )}

            {/* ── MORE TAB ── */}
            {tab === "more" && (
              <motion.div key="more" {...PAGE_ANIM}>
                <SettingsTab
                  accent={accent} isDark={isDark}
                  setAccent={setAccent} setIsDark={setIsDark}
                  lang={lang} setLang={setLang}
                  savedData={savedData}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ── BOTTOM NAV ── */}
        <div
          className="bottom-nav glass-heavy"
        >
          <div style={{ display: "flex", width: "100%", maxWidth: 500, margin: "0 auto" }}>
            {TABS.map(t => {
              const isActive = tab === t.id;
              return (
                <motion.button
                  key={t.id}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setTab(t.id)}
                  whileTap={{ scale: 0.84 }}
                >
                  <div className="nav-item-icon-wrap">
                    <motion.i
                      className={`ti ${t.icon}`}
                      aria-hidden="true"
                      animate={{ scale: isActive ? 1.15 : 1 }}
                      transition={SPRING_STIFF}
                      style={{ fontSize: 23, lineHeight: 1 }}
                    />
                    {isActive && (
                      <motion.div
                        className="nav-item-dot"
                        layoutId="nav-dot"
                        transition={SPRING_STIFF}
                      />
                    )}
                  </div>
                  <motion.span
                    animate={{ opacity: isActive ? 1 : 0.6 }}
                    style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}
                  >
                    {t.label[lang]}
                  </motion.span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── OVERLAYS ── */}
        <PRCelebration prs={prs} onDone={() => setPRs([])} accent={accent} />
        <InstallPrompt />

        {showShareCard && (
          <ShareCard
            tierData={tierData} streak={streak}
            totalReps={totalRepsAll} accent={accent}
            lang={lang} onClose={() => setShowShareCard(false)}
          />
        )}

        {/* Toast Queue — centralized, swipe-to-dismiss */}
        <ToastQueue
          toasts={toastQueue}
          onDismiss={dismissToast}
          accent={accent}
          lang={lang}
        />

        {/* Exercise search overlay */}
        <AnimatePresence>
          {showSearch && (
            <ExerciseSearch
              lang={lang} recentIds={recentIds}
              onSelect={addExercise}
              onClose={() => setShowSearch(false)}
              accent={accent}
            />
          )}
        </AnimatePresence>

        {/* SESSION MODE */}
        <AnimatePresence>
          {sessionMode && (
            <SessionMode
              exercises={activeExercises}
              inputs={inputs}
              onChange={setInput}
              onRemove={removeExercise}
              getPR={getPR}
              onSave={(sessionInfo) => saveWorkout(sessionInfo)}
              onClose={() => setSessionMode(false)}
              onAddExercise={() => { setShowSearch(true); }}
              accent={accent}
              lang={lang}
              savedData={savedData}
            />
          )}
        </AnimatePresence>
      </div>
    </AccentCtx.Provider>
  );
}
