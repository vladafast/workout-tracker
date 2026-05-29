import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDaysInMonth, formatDate } from "../utils/helpers";
import { getExerciseById } from "../utils/exerciseDatabase";

const WEEKDAYS = ["Po", "Ut", "Sr", "Če", "Pe", "Su", "Ne"];

export default function CalendarView({ savedData }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  const workoutMap = {};
  savedData.forEach((w) => { workoutMap[w.date] = w; });

  const days = getDaysInMonth(viewYear, viewMonth);
  const todayKey = today.toISOString().split("T")[0];

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleDateString("sr-RS", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectedWorkout = selectedDay && workoutMap[selectedDay];

  // Determine streak days for highlighting
  const workoutDates = new Set(savedData.map(w => w.date));

  return (
    <div style={{ padding: "0 16px 16px" }}>
      {/* Month Navigation */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
      }}>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={prevMonth}
          style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text2)",
            fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        >‹</motion.button>

        <div style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 18,
          color: "var(--text)",
          textTransform: "capitalize",
        }}>
          {monthName}
        </div>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={nextMonth}
          style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text2)",
            fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        >›</motion.button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{
            textAlign: "center",
            fontSize: 11,
            color: "var(--text4)",
            fontWeight: 600,
            padding: "4px 0",
            fontFamily: "var(--font-display)",
          }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {days.map((dateKey, i) => {
          if (!dateKey) return <div key={`pad-${i}`} />;

          const hasWorkout = workoutMap[dateKey];
          const isToday = dateKey === todayKey;
          const isPast = dateKey < todayKey;
          const isMissed = isPast && !hasWorkout;
          const isSelected = selectedDay === dateKey;
          const isFuture = dateKey > todayKey;

          return (
            <motion.button
              key={dateKey}
              whileTap={{ scale: 0.88 }}
              onClick={() => setSelectedDay(isSelected ? null : dateKey)}
              style={{
                aspectRatio: "1",
                borderRadius: 10,
                border: isSelected
                  ? "2px solid var(--indigo)"
                  : isToday
                    ? "2px solid rgba(99,102,241,0.5)"
                    : "1px solid transparent",
                background: hasWorkout
                  ? "linear-gradient(135deg, rgba(34,197,94,0.25), rgba(16,185,129,0.15))"
                  : isMissed
                    ? "rgba(239,68,68,0.08)"
                    : isToday
                      ? "rgba(99,102,241,0.1)"
                      : "var(--surface)",
                color: hasWorkout
                  ? "#86efac"
                  : isMissed
                    ? "#f87171"
                    : isToday
                      ? "var(--indigo-light)"
                      : isFuture
                        ? "var(--text4)"
                        : "var(--text2)",
                fontSize: 13,
                fontWeight: isToday || hasWorkout ? 700 : 400,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                padding: 4,
                fontFamily: "var(--font-body)",
                transition: "background 0.15s",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {parseInt(dateKey.slice(-2))}
              {hasWorkout && (
                <div style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "#22c55e",
                  flexShrink: 0,
                }} />
              )}
              {isMissed && (
                <div style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "rgba(239,68,68,0.5)",
                  flexShrink: 0,
                }} />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 12, justifyContent: "center" }}>
        {[
          { dot: "#22c55e", label: "Trening" },
          { dot: "rgba(239,68,68,0.5)", label: "Propušteno" },
          { dot: "rgba(99,102,241,0.5)", label: "Danas" },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text3)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: l.dot }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Selected day workout detail */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            style={{
              marginTop: 16,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}>
              <div style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 16,
                color: "var(--text)",
              }}>
                {formatDate(selectedDay)}
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text3)",
                  fontSize: 20,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >×</button>
            </div>

            {selectedWorkout ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {Object.entries(selectedWorkout.exercises).filter(([, v]) => v?.total > 0).map(([exId, v]) => {
                  const ex = getExerciseById(exId);
                  const color = ex?.color || "#6366f1";
                  const name = ex?.sr || exId;
                  return (
                    <div key={exId} style={{ background: `${color}15`, border: `1px solid ${color}33`, borderRadius: 10, padding: "8px 12px" }}>
                      <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 2 }}>{name}</div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color }}>{v.total}</div>
                      <div style={{ fontSize: 10, color: "var(--text4)" }}>reps</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                textAlign: "center",
                color: "var(--text3)",
                fontSize: 14,
                padding: "12px 0",
              }}>
                {selectedDay > todayStr() ? "🔮 Budući dan" : "❌ Nema treninga ovog dana"}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}
