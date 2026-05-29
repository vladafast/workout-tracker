import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { computeStreak } from "../utils/helpers";
import { hsl } from "../utils/theme";

/**
 * WeeklyRecap — compact weekly summary card
 * Props: savedData, accent, lang
 */
export default function WeeklyRecap({ savedData, accent = { hue: 245, sat: 72 }, lang = "sr" }) {
  const { hue, sat } = accent;
  const acL  = hsl(hue, sat, 68);
  const acBg = hsl(hue, sat, 60, 0.08);
  const acBd = hsl(hue, sat, 60, 0.2);

  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const thisWeek = useMemo(() => {
    return savedData.filter(w => new Date(w.date + "T00:00:00") >= monday);
  }, [savedData]);

  const totalReps = thisWeek.reduce((s, w) =>
    s + Object.values(w.exercises).reduce((a, v) => a + (v?.total || 0), 0), 0
  );

  const { current: streak } = useMemo(() => computeStreak(savedData), [savedData]);

  // Per-day counts for this week (Mon-Sun)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = d.toISOString().split("T")[0];
    const count = savedData.filter(w => w.date === key).length;
    const isToday = key === new Date().toISOString().split("T")[0];
    return { label: ["Mo","Tu","We","Th","Fr","Sa","Su"][i], active: count > 0, isToday };
  });

  const strongestDay = useMemo(() => {
    if (!thisWeek.length) return null;
    const byDay = {};
    thisWeek.forEach(w => {
      const reps = Object.values(w.exercises).reduce((a, v) => a + (v?.total || 0), 0);
      byDay[w.date] = (byDay[w.date] || 0) + reps;
    });
    const best = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0];
    if (!best) return null;
    const d = new Date(best[0] + "T00:00:00");
    const dayNames = { sr: ["Ned","Pon","Uto","Sre","Čet","Pet","Sub"], en: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] };
    return `${dayNames[lang][d.getDay()]} (${best[1]} reps)`;
  }, [thisWeek, lang]);

  const consistency = Math.round((thisWeek.length / 7) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: acBg,
        border: `1px solid ${acBd}`,
        borderRadius: 18,
        padding: "16px 18px",
        marginBottom: 12,
      }}
    >
      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: acL }}>
          📊 {lang === "sr" ? "Nedeljni Recap" : "Weekly Recap"}
        </span>
        <span style={{ fontSize: 11, color: "var(--text4)" }}>
          {lang === "sr" ? "Ova sedmica" : "This week"}
        </span>
      </div>

      {/* Day dots */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 14 }}>
        {weekDays.map(d => (
          <div key={d.label} style={{ textAlign: "center" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: d.active ? acL : (d.isToday ? acBd : "var(--surface3)"),
              border: `2px solid ${d.isToday ? acL : "transparent"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14,
              boxShadow: d.active ? `0 0 10px ${hsl(hue, sat, 60, 0.4)}` : "none",
            }}>
              {d.active ? "✓" : "·"}
            </div>
            <div style={{ fontSize: 9, color: d.isToday ? acL : "var(--text4)", marginTop: 3, fontWeight: d.isToday ? 700 : 400 }}>
              {d.label}
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[
          { label: lang === "sr" ? "Treninzi" : "Workouts", val: thisWeek.length, icon: "💪" },
          { label: lang === "sr" ? "Ukupno reps" : "Total reps", val: totalReps.toLocaleString(), icon: "🏋️" },
          { label: lang === "sr" ? "Niz" : "Streak", val: `${streak}🔥`, icon: "" },
          { label: lang === "sr" ? "Konzistentnost" : "Consistency", val: `${consistency}%`, icon: "📈" },
        ].map(s => (
          <div key={s.label} style={{
            background: "var(--surface2)",
            borderRadius: 12, padding: "10px 12px",
          }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: acL }}>
              {s.icon} {s.val}
            </div>
            <div style={{ fontSize: 10, color: "var(--text4)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {strongestDay && (
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--text3)", textAlign: "center" }}>
          🏆 {lang === "sr" ? "Najjači dan" : "Strongest day"}: <span style={{ color: acL, fontWeight: 700 }}>{strongestDay}</span>
        </div>
      )}
    </motion.div>
  );
}
