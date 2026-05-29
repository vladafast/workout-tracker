import React from "react";
import { motion } from "framer-motion";
import BicepsProgress from "./BicepsProgress";

/**
 * TierCard — compact dashboard card showing tier, XP, progress
 * Props: tierData (from getTier()), accent, lang, onClick
 */
export default function TierCard({ tierData, accent = { hue: 245, sat: 72 }, lang = "sr", onClick }) {
  if (!tierData) return null;
  const { tier, nextTier, progress, remaining, xp } = tierData;
  const color = tier.color;
  const glow  = tier.glow;

  return (
    <motion.div
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 20 }}
      style={{
        background: tier.bg,
        border: `1px solid ${color}33`,
        borderRadius: 18,
        padding: "16px 18px",
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 0 32px ${glow}`,
      }}
    >
      {/* Ambient glow orb */}
      <div style={{
        position: "absolute", top: -20, right: -20,
        width: 100, height: 100,
        background: `radial-gradient(circle, ${glow}, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Bicep */}
        <BicepsProgress progress={progress} tier={tier} size={72} />

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Tier name + icon */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 18 }}>{tier.icon}</span>
            <span style={{
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: 19, color, lineHeight: 1.1,
              textShadow: `0 0 16px ${glow}`,
            }}>
              {tier.name}
            </span>
          </div>

          {/* XP */}
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 8 }}>
            {xp.toLocaleString()} XP
            {nextTier && (
              <span style={{ color: "var(--text4)" }}>
                {" "}· {remaining} {lang === "sr" ? "do" : "to"} {nextTier.name}
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div style={{
            height: 6, borderRadius: 6,
            background: "var(--surface3)",
            overflow: "hidden",
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 60, damping: 18, delay: 0.3 }}
              style={{
                height: "100%",
                background: `linear-gradient(90deg, ${color}99, ${color})`,
                borderRadius: 6,
                boxShadow: `0 0 8px ${glow}`,
              }}
            />
          </div>

          <div style={{
            display: "flex", justifyContent: "space-between",
            marginTop: 4, fontSize: 10, color: "var(--text4)",
          }}>
            <span>{progress}%</span>
            {nextTier && <span>{nextTier.icon} {nextTier.name}</span>}
          </div>
        </div>

        {/* Arrow hint */}
        {onClick && (
          <i className="ti ti-chevron-right" style={{ color: "var(--text4)", fontSize: 16, flexShrink: 0 }} />
        )}
      </div>
    </motion.div>
  );
}
