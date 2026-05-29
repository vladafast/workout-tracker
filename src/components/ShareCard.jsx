import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BicepsProgress from "./BicepsProgress";
import { hsl } from "../utils/theme";

// ── Confetti burst ─────────────────────────────────────────
function Confetti({ color }) {
  const pieces = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.cos((i / 18) * Math.PI * 2) * (40 + Math.random() * 40),
    y: Math.sin((i / 18) * Math.PI * 2) * (40 + Math.random() * 40) - 20,
    r: Math.random() * 5 + 3,
    rot: Math.random() * 360,
  }));
  return (
    <div style={{ position: "absolute", top: "38%", left: "50%", pointerEvents: "none", zIndex: 0 }}>
      {pieces.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 1, rotate: p.rot }}
          transition={{ duration: 1.2, delay: 0.15 + Math.random() * 0.3, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: p.r, height: p.r * 1.6,
            borderRadius: 2,
            background: color,
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
}

// ── Share card types ───────────────────────────────────────
const CARD_TYPES = [
  { id: "tier",        icon: "🏆", label: "Tier Upgrade"  },
  { id: "workout",     icon: "💪", label: "Workout"       },
  { id: "streak",      icon: "🔥", label: "Streak"        },
  { id: "achievement", icon: "🏅", label: "Achievement"   },
];

export default function ShareCard({
  tierData, streak, totalReps, accent = { hue: 245, sat: 72 },
  lang = "sr", onClose,
  // optional extras for other card types
  lastWorkout = null, latestAchievement = null,
}) {
  const [activeType, setActiveType] = useState("tier");
  const [copied, setCopied]         = useState(false);

  if (!tierData) return null;
  const { tier, xp } = tierData;
  const { hue, sat } = accent;

  const acL = hsl(hue, sat, 72);

  // ── Content per card type ──────────────────────────────
  const cardContent = {
    tier: {
      headline: lang === "sr" ? `${tier.icon} ${tier.name} Tier!` : `${tier.icon} ${tier.name} Tier!`,
      body: lang === "sr"
        ? `Dostigao sam ${tier.name} u FitPulse! 💪\n${xp.toLocaleString()} XP zaradjen.\n${totalReps.toLocaleString()} reps ukupno.`
        : `Just hit ${tier.name} tier in FitPulse! 💪\n${xp.toLocaleString()} XP earned.\n${totalReps.toLocaleString()} total reps.`,
      color:  tier.color,
      glow:   tier.glow,
      bg:     tier.bg,
      visual: <BicepsProgress progress={tierData.progress} tier={tier} size={100} />,
      stats:  [
        { label: "XP", val: xp.toLocaleString() },
        { label: "Reps", val: totalReps.toLocaleString() },
        { label: "Streak", val: `${streak}🔥` },
      ],
    },
    workout: {
      headline: lang === "sr" ? "Trening završen 💪" : "Workout done 💪",
      body: lang === "sr"
        ? `${totalReps.toLocaleString()} ukupno reps. ${streak} dana niza.\n#FitPulse #Calisthenics`
        : `${totalReps.toLocaleString()} total reps. ${streak} day streak.\n#FitPulse #Calisthenics`,
      color:  acL,
      glow:   hsl(hue, sat, 62, 0.35),
      bg:     `linear-gradient(135deg, ${hsl(hue,sat,60,0.12)}, transparent)`,
      visual: <span style={{ fontSize: 64 }}>💪</span>,
      stats:  [
        { label: "Reps",    val: totalReps.toLocaleString() },
        { label: "Streak",  val: `${streak}d` },
        { label: "Tier",    val: `${tier.icon} ${tier.name}` },
      ],
    },
    streak: {
      headline: lang === "sr" ? `${streak} Dana Niza! 🔥` : `${streak} Day Streak! 🔥`,
      body: lang === "sr"
        ? `${streak} dana konzistentnog treninga u FitPulse!\n${tier.icon} ${tier.name} tier.\n#Consistency #Calisthenics`
        : `${streak} days of consistent training in FitPulse!\n${tier.icon} ${tier.name} tier.\n#Consistency #Calisthenics`,
      color:  streak >= 30 ? "#ffd700" : streak >= 7 ? "#f97316" : "#ef4444",
      glow:   streak >= 30 ? "rgba(255,215,0,0.4)" : "rgba(249,115,22,0.4)",
      bg:     "linear-gradient(135deg, rgba(249,115,22,0.12), transparent)",
      visual: <span style={{ fontSize: 72, filter: "drop-shadow(0 0 20px rgba(249,115,22,0.6))" }}>🔥</span>,
      stats:  [
        { label: "Streak",  val: `${streak}d` },
        { label: "Tier",    val: `${tier.icon} ${tier.name}` },
        { label: "Reps",    val: totalReps.toLocaleString() },
      ],
    },
    achievement: {
      headline: latestAchievement
        ? `${latestAchievement.icon} ${latestAchievement.name}`
        : (lang === "sr" ? "Dostignuće otključano!" : "Achievement unlocked!"),
      body: latestAchievement
        ? `${latestAchievement.desc}\n${tier.icon} ${tier.name} · FitPulse\n#Achievement #Calisthenics`
        : `#FitPulse #Achievement`,
      color:  "#a855f7",
      glow:   "rgba(168,85,247,0.4)",
      bg:     "linear-gradient(135deg, rgba(168,85,247,0.12), transparent)",
      visual: <span style={{ fontSize: 72 }}>{latestAchievement?.icon || "🏅"}</span>,
      stats:  [
        { label: "Tier",    val: `${tier.icon} ${tier.name}` },
        { label: "Streak",  val: `${streak}d` },
        { label: "Reps",    val: totalReps.toLocaleString() },
      ],
    },
  };

  const card = cardContent[activeType];

  const handleShare = async () => {
    const text = `${card.headline}\n\n${card.body}\n\n#FitPulse`;
    if (navigator.share) {
      try { await navigator.share({ text, title: "FitPulse" }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.88)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
          backdropFilter: "blur(8px)",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.78, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.82, opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 360,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* Card type selector */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
            {CARD_TYPES.map(t => (
              <motion.button
                key={t.id}
                whileTap={{ scale: 0.88 }}
                onClick={() => setActiveType(t.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full)",
                  border: `1px solid ${activeType === t.id ? card.color : "rgba(255,255,255,0.15)"}`,
                  background: activeType === t.id ? `${card.color}22` : "rgba(255,255,255,0.06)",
                  color: activeType === t.id ? card.color : "rgba(255,255,255,0.5)",
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {t.icon} {t.label}
              </motion.button>
            ))}
          </div>

          {/* Main share card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeType}
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              style={{
                background: "var(--surface-1)",
                border: `1px solid ${card.color}44`,
                borderRadius: "var(--radius-xl)",
                padding: "32px 24px 28px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                boxShadow: `0 0 80px ${card.glow}, var(--shadow-lg)`,
              }}
            >
              {/* BG */}
              <div style={{ position: "absolute", inset: 0, background: card.bg, opacity: 0.7, pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: `radial-gradient(circle, ${card.glow}, transparent 65%)`, pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -60, left: -60, width: 180, height: 180, background: `radial-gradient(circle, ${card.glow}, transparent 65%)`, pointerEvents: "none" }} />

              <Confetti color={card.color} />

              <div style={{ position: "relative", zIndex: 1 }}>
                {/* Visual */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                  {card.visual}
                </div>

                {/* Headline */}
                <motion.div
                  key={activeType + "_h"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    fontFamily: "var(--font-display)", fontWeight: 800,
                    fontSize: 24, color: card.color, lineHeight: 1.15, marginBottom: 10,
                    textShadow: `0 0 24px ${card.glow}`,
                  }}
                >
                  {card.headline}
                </motion.div>

                {/* Stats row */}
                <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 18 }}>
                  {card.stats.map((s, i) => (
                    <div key={i} style={{
                      background: `${card.color}14`,
                      border: `1px solid ${card.color}30`,
                      borderRadius: "var(--radius-sm)",
                      padding: "7px 14px",
                      textAlign: "center",
                    }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: card.color }}>{s.val}</div>
                      <div style={{ fontSize: 9, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* FitPulse branding */}
                <div style={{ fontSize: 11, color: "var(--text4)", fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: "0.1em" }}>
                  FITPULSE · KALISTENIK
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              style={{
                flex: 1, padding: "14px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: "var(--radius-md)",
                color: "rgba(255,255,255,0.6)",
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
                cursor: "pointer",
              }}
            >
              Zatvori
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              style={{
                flex: 2, padding: "14px",
                background: `linear-gradient(135deg, ${card.color}cc, ${card.color})`,
                border: "none",
                borderRadius: "var(--radius-md)",
                color: "#0a0a12",
                fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15,
                cursor: "pointer",
                boxShadow: `0 6px 24px ${card.glow}`,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <i className={`ti ${copied ? "ti-check" : "ti-share"}`} />
              {copied
                ? (lang === "sr" ? "Kopirano!" : "Copied!")
                : (lang === "sr" ? "Podeli" : "Share")
              }
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
