// ══════════════════════════════════════════════════════════════
// MuscleRankView — RPG-style muscle stats screen
// Shows all muscles, their rank, XP, and progress
// ══════════════════════════════════════════════════════════════

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MUSCLE_INFO } from "../utils/exerciseDatabase";
import { TIERS } from "../utils/theme";
import {
  getMuscleStats, getAllMuscleStats, getStrongestWeakest, getMuscleTier, MUSCLE_TIERS,
  analyzeWeakPoints, RANK_SVG_COLORS, UNTRAINED_COLOR,
} from "../utils/muscleRankSystem";

// ── Group muscles for display ─────────────────────────────────
const GROUP_ORDER = ["Grudi", "Leđa", "Ramena", "Ruke", "Core", "Noge"];

function groupMuscles(allStats) {
  const groups = {};
  GROUP_ORDER.forEach(g => { groups[g] = []; });

  allStats.forEach(s => {
    const info = MUSCLE_INFO[s.muscleId];
    if (!info) return;
    const g = info.group;
    if (!groups[g]) groups[g] = [];
    groups[g].push(s);
  });

  // Sort within group: trained first (desc XP), then untrained
  Object.keys(groups).forEach(g => {
    groups[g].sort((a, b) => b.xp - a.xp);
  });

  return groups;
}

// ── Rank badge ────────────────────────────────────────────────
function RankBadge({ tier, size = 28 }) {
  const color = RANK_SVG_COLORS[tier.id] || "#8a9ab5";
  return (
    <div style={{
      width: size, height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle at 35% 35%, ${color}ee, ${color}66)`,
      boxShadow: `0 0 8px ${color}66`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.45,
      flexShrink: 0,
    }}>
      {tier.icon}
    </div>
  );
}

// ── Single muscle row ─────────────────────────────────────────
function MuscleRow({ stats, isStrongest, isWeakest, accent }) {
  const [expanded, setExpanded] = useState(false);
  const info    = MUSCLE_INFO[stats.muscleId];
  const color   = RANK_SVG_COLORS[stats.tier?.id] || UNTRAINED_COLOR;
  const trained = stats.xp > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => setExpanded(e => !e)}
      style={{
        background: expanded
          ? `linear-gradient(135deg, ${color}18, ${color}08)`
          : "var(--surface2)",
        border: `1px solid ${expanded ? color + "44" : "var(--border)"}`,
        borderRadius: 12,
        padding: "10px 12px",
        cursor: "pointer",
        transition: "background 0.2s, border-color 0.2s",
      }}
    >
      {/* Row header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {trained
          ? <RankBadge tier={stats.tier} size={30} />
          : (
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "var(--surface3)",
              border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, opacity: 0.4,
            }}>?</div>
          )
        }

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{
              fontWeight: 700, fontSize: 13,
              color: trained ? "var(--text1)" : "var(--text4)",
            }}>
              {info?.sr || stats.muscleId}
            </span>
            {isStrongest && (
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: "0.05em",
                background: "#ffd70022", color: "#ffd700",
                border: "1px solid #ffd70044",
                borderRadius: 4, padding: "1px 5px",
              }}>💪 STRONGEST</span>
            )}
            {isWeakest && (
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: "0.05em",
                background: "#ef444422", color: "#ef4444",
                border: "1px solid #ef444444",
                borderRadius: 4, padding: "1px 5px",
              }}>⚠️ WEAKEST</span>
            )}
          </div>

          {/* Mini progress bar */}
          {trained && (
            <div style={{
              height: 3, borderRadius: 3,
              background: "var(--surface3)",
              overflow: "hidden", marginTop: 4,
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.progress}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 15 }}
                style={{
                  height: "100%",
                  background: `linear-gradient(90deg, ${color}88, ${color})`,
                  borderRadius: 3,
                }}
              />
            </div>
          )}
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {trained ? (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color }}>
                {stats.tier.name}
              </div>
              <div style={{ fontSize: 10, color: "var(--text4)" }}>
                {stats.xp.toLocaleString()} XP
              </div>
            </>
          ) : (
            <div style={{ fontSize: 11, color: "var(--text4)" }}>Netrenirano</div>
          )}
        </div>

        <i
          className={`ti ti-chevron-${expanded ? "up" : "down"}`}
          style={{ fontSize: 13, color: "var(--text4)", flexShrink: 0 }}
        />
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              marginTop: 12, paddingTop: 10,
              borderTop: "1px solid var(--border)",
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}>
              {trained ? (
                <>
                  <StatBox label="Rank" value={`${stats.tier.icon} ${stats.tier.name}`} color={color} />
                  <StatBox label="Ukupni XP" value={stats.xp.toLocaleString()} color={color} />
                  <StatBox label="Progress" value={`${stats.progress}%`} color={color} />
                  <StatBox
                    label={stats.nextTier ? `Do ${stats.nextTier.name}` : "MAX"}
                    value={stats.nextTier ? `${stats.remaining.toLocaleString()} XP` : "🌟"}
                    color={color}
                  />
                  {/* Full progress bar */}
                  <div style={{ gridColumn: "1/-1" }}>
                    <div style={{
                      height: 6, borderRadius: 6,
                      background: "var(--surface3)", overflow: "hidden",
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.progress}%` }}
                        transition={{ type: "spring", stiffness: 40, damping: 15, delay: 0.1 }}
                        style={{
                          height: "100%",
                          background: `linear-gradient(90deg, ${color}77, ${color})`,
                          boxShadow: `0 0 8px ${color}88`,
                          borderRadius: 6,
                        }}
                      />
                    </div>
                    {stats.nextTier && (
                      <div style={{
                        display: "flex", justifyContent: "space-between",
                        fontSize: 10, color: "var(--text4)", marginTop: 3,
                      }}>
                        <span>{stats.tier.icon} {stats.tier.name}</span>
                        <span>{stats.nextTier.icon} {stats.nextTier.name}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{
                  gridColumn: "1/-1", textAlign: "center",
                  color: "var(--text4)", fontSize: 12, padding: "4px 0",
                }}>
                  Treniraj vežbe koje aktiviraju ovaj mišić da bih dodelio XP
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={{
      background: "var(--surface3)",
      borderRadius: 8, padding: "6px 10px",
    }}>
      <div style={{ fontSize: 9, color: "var(--text4)", fontWeight: 600, letterSpacing: "0.06em" }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color, marginTop: 1 }}>{value}</div>
    </div>
  );
}

// ── Weak Point card ───────────────────────────────────────────
function WeakPointCard({ weakPoints }) {
  if (!weakPoints.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.04))",
        border: "1px solid rgba(239,68,68,0.25)",
        borderRadius: 14, padding: "12px 14px", marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
        <span style={{ fontSize: 16 }}>⚠️</span>
        <span style={{ fontWeight: 800, fontSize: 13, color: "#ef4444" }}>
          Weak Points
        </span>
      </div>
      {weakPoints.map(wp => {
        const info = MUSCLE_INFO[wp.muscleId];
        const tier = getMuscleTier(wp.xp).tier;
        return (
          <div key={wp.muscleId} style={{
            display: "flex", alignItems: "center", gap: 8,
            marginBottom: 6, fontSize: 12, color: "var(--text2)",
          }}>
            <span>{tier.icon}</span>
            <span style={{ fontWeight: 600 }}>{info?.sr || wp.muscleId}</span>
            <span style={{ color: "var(--text4)" }}>
              zaostaje {wp.tierGapFromMax} {wp.tierGapFromMax === 1 ? "rank" : "ranka"} za najjačim mišićem
            </span>
          </div>
        );
      })}
    </motion.div>
  );
}

// ── Main MuscleRankView ───────────────────────────────────────
export default function MuscleRankView({ muscleXP = {}, accent }) {
  const [activeGroup, setActiveGroup] = useState("Sve");
  const accentColor = `hsl(${accent.hue}, ${accent.sat}%, 60%)`;

  const allStats = useMemo(() => getAllMuscleStats(muscleXP), [muscleXP]);
  const { strongest, weakest } = useMemo(() => getStrongestWeakest(muscleXP), [muscleXP]);
  const weakPoints = useMemo(() => analyzeWeakPoints(muscleXP), [muscleXP]);
  const grouped    = useMemo(() => groupMuscles(allStats), [allStats]);

  const trainedCount = allStats.filter(s => s.xp > 0).length;

  // Overview stats
  const totalMuscleXP  = allStats.reduce((s, m) => s + m.xp, 0);
  const avgXP          = trainedCount ? Math.round(totalMuscleXP / trainedCount) : 0;
  const avgTier        = getMuscleTier(avgXP).tier;

  const groups = ["Sve", ...GROUP_ORDER];

  const displayStats = activeGroup === "Sve"
    ? allStats
    : (grouped[activeGroup] || []);

  return (
    <div>
      {/* Overview cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        <OverviewCard
          label="Trenirani mišići"
          value={`${trainedCount} / ${Object.keys(MUSCLE_INFO).length}`}
          icon="🎯"
          color={accentColor}
        />
        <OverviewCard
          label="Prosečni rank"
          value={trainedCount ? `${avgTier.icon} ${avgTier.name}` : "—"}
          icon="📊"
          color={trainedCount ? RANK_SVG_COLORS[avgTier.id] : "var(--text4)"}
        />
        {strongest && (
          <OverviewCard
            label="Najjači mišić"
            value={MUSCLE_INFO[strongest.muscleId]?.sr || strongest.muscleId}
            icon="💪"
            color="#ffd700"
            sub={`${getMuscleTier(strongest.xp).tier.icon} ${getMuscleTier(strongest.xp).tier.name}`}
          />
        )}
        {weakest && weakest.muscleId !== strongest?.muscleId && (
          <OverviewCard
            label="Najslabiji"
            value={MUSCLE_INFO[weakest.muscleId]?.sr || weakest.muscleId}
            icon="📍"
            color="#ef4444"
            sub={`${getMuscleTier(weakest.xp).tier.icon} ${getMuscleTier(weakest.xp).tier.name}`}
          />
        )}
      </div>

      {/* Weak points */}
      <WeakPointCard weakPoints={weakPoints} />

      {/* Group filter tabs */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 14,
        overflowX: "auto", paddingBottom: 4,
        scrollbarWidth: "none",
      }}>
        {groups.map(g => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              border: `1px solid ${activeGroup === g ? accentColor : "var(--border)"}`,
              background: activeGroup === g ? `${accentColor}20` : "var(--surface2)",
              color: activeGroup === g ? accentColor : "var(--text3)",
              fontSize: 12, fontWeight: 600,
              cursor: "pointer", whiteSpace: "nowrap",
              transition: "all 0.15s",
              flexShrink: 0,
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Muscle list */}
      {activeGroup === "Sve" ? (
        // Show by groups with headers
        GROUP_ORDER.map(groupName => {
          const groupStats = grouped[groupName] || [];
          if (!groupStats.length) return null;
          const hasAnyTrained = groupStats.some(s => s.xp > 0);

          return (
            <div key={groupName} style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 11, fontWeight: 800,
                color: "var(--text4)", letterSpacing: "0.07em",
                marginBottom: 6, textTransform: "uppercase",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {groupName}
                {hasAnyTrained && (
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    color: accentColor, opacity: 0.8,
                  }}>
                    {groupStats.filter(s => s.xp > 0).length}/{groupStats.length}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {groupStats.map(stats => (
                  <MuscleRow
                    key={stats.muscleId}
                    stats={stats}
                    isStrongest={strongest?.muscleId === stats.muscleId}
                    isWeakest={weakest?.muscleId === stats.muscleId && weakest?.muscleId !== strongest?.muscleId}
                    accent={accent}
                  />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {displayStats.map(stats => (
            <MuscleRow
              key={stats.muscleId}
              stats={stats}
              isStrongest={strongest?.muscleId === stats.muscleId}
              isWeakest={weakest?.muscleId === stats.muscleId && weakest?.muscleId !== strongest?.muscleId}
              accent={accent}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OverviewCard({ label, value, icon, color, sub }) {
  return (
    <div style={{
      background: "var(--surface2)",
      border: "1px solid var(--border)",
      borderRadius: 12, padding: "10px 12px",
    }}>
      <div style={{ fontSize: 9, color: "var(--text4)", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 4 }}>
        {icon} {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, color }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "var(--text4)", marginTop: 2 }}>{sub}</div>
      )}
    </div>
  );
}
