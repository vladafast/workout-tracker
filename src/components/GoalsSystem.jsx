import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadGoals, saveGoals, haptic, todayStr } from "../utils/helpers";
import { EXERCISE_DB, getExerciseById } from "../utils/exerciseDatabase";
import { hsl } from "../utils/theme";

// ── Circle progress ring ───────────────────────────────────
function CircleProgress({ percent, color, size = 64, strokeWidth = 5.5 }) {
  const r    = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(percent / 100, 1));
  const done = percent >= 100;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={done ? "#22c55e" : color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      />
      {done && (
        <motion.circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke="#22c55e"
          strokeWidth={2}
          strokeDasharray="4 6"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </svg>
  );
}

// ── Goal card ──────────────────────────────────────────────
function GoalCard({ goalKey, target, actual, exName, period, color, onEdit, onDelete }) {
  const pct  = Math.min(Math.round((actual / target) * 100), 100);
  const done = pct >= 100;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
      style={{
        background: done ? "rgba(34,197,94,0.08)" : "var(--surface-1)",
        border: `1px solid ${done ? "rgba(34,197,94,0.25)" : "var(--border)"}`,
        borderRadius: "var(--radius-md)",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 10,
      }}
    >
      {/* Circle ring */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <CircleProgress percent={pct} color={color} size={62} />
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: "rotate(90deg)",
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: done ? 13 : 12,
          color: done ? "#22c55e" : color,
        }}>
          {done ? "✓" : `${pct}%`}
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {exName}
        </div>
        <div style={{ fontSize: 11, color: "var(--text3)" }}>
          <span style={{ color: done ? "#22c55e" : color, fontWeight: 700 }}>{actual}</span> / {target} reps
          <span style={{ marginLeft: 8, color: "var(--text4)", fontSize: 10, textTransform: "uppercase", fontWeight: 700 }}>{period}</span>
        </div>
        {/* Inline progress bar */}
        <div style={{ marginTop: 7, height: 3, background: "var(--border2)", borderRadius: 4, overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: [0.16,1,0.3,1], delay: 0.2 }}
            style={{ height: "100%", background: done ? "#22c55e" : color, borderRadius: 4 }}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <motion.button whileTap={{ scale: 0.85 }} onClick={onEdit}
          style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "var(--surface-2)", border: "1px solid var(--border2)", color: "var(--text3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
          <i className="ti ti-pencil" />
        </motion.button>
        <motion.button whileTap={{ scale: 0.85 }} onClick={onDelete}
          style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "var(--danger-dim)", border: "1px solid rgba(239,68,68,0.18)", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
          <i className="ti ti-x" />
        </motion.button>
      </div>
    </motion.div>
  );
}

const PERIOD_LABELS = { daily: "Dnevno", weekly: "Nedeljno", monthly: "Mesečno" };
const PERIOD_DAYS   = { daily: 0, weekly: 7, monthly: 30 };

export default function GoalsSystem({ savedData, accent = { hue: 245, sat: 72 }, lang = "sr" }) {
  const [goals,   setGoals]   = useState(() => loadGoals());
  const [period,  setPeriod]  = useState("weekly");
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [search,  setSearch]  = useState("");
  const [adding,  setAdding]  = useState(false);

  const { hue, sat } = accent;
  const acL  = hsl(hue, sat, 70);
  const acBg = hsl(hue, sat, 62, 0.1);
  const acBd = hsl(hue, sat, 62, 0.25);

  const today    = todayStr();
  const weekAgo  = new Date(Date.now() - 7  * 86400000).toISOString().split("T")[0];
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

  const getActual = (exId) => {
    const cutoff = period === "daily" ? today : period === "weekly" ? weekAgo : monthAgo;
    return savedData.filter(w => w.date >= cutoff).reduce((s, w) => s + (w.exercises[exId]?.total || 0), 0);
  };

  const goalKey = (exId) => `${period}_${exId}`;

  const activeGoals = useMemo(() =>
    Object.entries(goals)
      .filter(([k]) => k.startsWith(period + "_"))
      .map(([k, target]) => {
        const exId = k.slice(period.length + 1);
        const ex   = getExerciseById(exId);
        return { key: k, exId, target, actual: getActual(exId), name: ex ? (lang === "sr" ? ex.sr : ex.en) : exId };
      }),
    [goals, period, savedData, lang]
  );

  const doneCount = activeGoals.filter(g => g.actual >= g.target).length;

  const setGoal = (exId, val) => {
    const n = parseInt(val);
    if (!n || n < 1) return;
    const updated = { ...goals, [goalKey(exId)]: n };
    setGoals(updated);
    saveGoals(updated);
    setEditing(null);
    setAdding(false);
    setSearch("");
    haptic([10]);
  };

  const removeGoal = (key) => {
    const updated = { ...goals };
    delete updated[key];
    setGoals(updated);
    saveGoals(updated);
    haptic([8]);
  };

  // Exercises not yet in goals for this period
  const availableEx = EXERCISE_DB.filter(ex => !goals[goalKey(ex.id)] && (
    search === "" || (lang === "sr" ? ex.sr : ex.en).toLowerCase().includes(search.toLowerCase())
  )).slice(0, 8);

  return (
    <div>
      {/* Period selector */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        {["daily", "weekly", "monthly"].map(p => (
          <motion.button
            key={p}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPeriod(p)}
            style={{
              padding: "11px",
              borderRadius: "var(--radius-sm)",
              fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700,
              cursor: "pointer",
              border: `1px solid ${period === p ? acBd : "var(--border)"}`,
              background: period === p ? acBg : "var(--surface-1)",
              color: period === p ? acL : "var(--text3)",
              transition: "all 0.15s",
            }}
          >
            {PERIOD_LABELS[p]}
          </motion.button>
        ))}
      </div>

      {/* Summary bar */}
      {activeGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: doneCount === activeGoals.length ? "rgba(34,197,94,0.08)" : acBg,
            border: `1px solid ${doneCount === activeGoals.length ? "rgba(34,197,94,0.25)" : acBd}`,
            borderRadius: "var(--radius-sm)",
            padding: "12px 16px",
            marginBottom: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: doneCount === activeGoals.length ? "#22c55e" : acL }}>
              {doneCount === activeGoals.length ? "🎉 Svi ciljevi ispunjeni!" : `${doneCount}/${activeGoals.length} ciljeva`}
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>
              {PERIOD_LABELS[period].toLowerCase()} period
            </div>
          </div>
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22,
            color: doneCount === activeGoals.length ? "#22c55e" : acL,
          }}>
            {activeGoals.length > 0 ? Math.round(activeGoals.reduce((s, g) => s + Math.min(g.actual/g.target,1), 0) / activeGoals.length * 100) : 0}%
          </div>
        </motion.div>
      )}

      {/* Goals list */}
      <AnimatePresence>
        {activeGoals.map((g, i) => (
          <GoalCard
            key={g.key}
            goalKey={g.key}
            target={g.target}
            actual={g.actual}
            exName={g.name}
            period={PERIOD_LABELS[period]}
            color={acL}
            onEdit={() => { setEditing(g.exId); setEditVal(String(g.target)); }}
            onDelete={() => removeGoal(g.key)}
          />
        ))}
      </AnimatePresence>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 500,
              background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
              display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 16px",
            }}
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: "var(--surface-elevated)",
                borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
                padding: "24px 20px calc(24px + var(--safe-bottom))",
                width: "100%", maxWidth: 480,
                border: `1px solid ${acBd}`,
              }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>
                Izmeni cilj — {getExerciseById(editing)?.[lang === "sr" ? "sr" : "en"] || editing}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="number"
                  value={editVal}
                  onChange={e => setEditVal(e.target.value)}
                  placeholder="reps"
                  autoFocus
                  className="input-field"
                  style={{ flex: 1 }}
                />
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setGoal(editing, editVal)}
                  className="btn btn-primary" style={{ padding: "14px 20px", fontSize: 14 }}>
                  Sačuvaj
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add new goal section */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setAdding(v => !v)}
        style={{
          width: "100%", padding: "13px",
          background: adding ? acBg : "var(--surface-1)",
          border: `1.5px dashed ${acBd}`,
          borderRadius: "var(--radius-md)",
          color: "var(--text3)",
          fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          marginTop: activeGoals.length > 0 ? 6 : 0,
        }}
      >
        <span style={{ color: acL, fontSize: 20 }}>{adding ? "×" : "+"}</span>
        {adding ? "Zatvori" : `Dodaj ${PERIOD_LABELS[period].toLowerCase()} cilj`}
      </motion.button>

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", marginTop: 10 }}
          >
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === "sr" ? "Pretraži vežbu..." : "Search exercise..."}
              className="input-field"
              style={{ marginBottom: 10 }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {availableEx.map(ex => {
                const name = lang === "sr" ? ex.sr : ex.en;
                return (
                  <AddGoalRow key={ex.id} ex={ex} name={name} color={acL} acBg={acBg} acBd={acBd}
                    onAdd={(val) => setGoal(ex.id, val)} />
                );
              })}
              {availableEx.length === 0 && search && (
                <div style={{ color: "var(--text4)", fontSize: 13, padding: "12px", textAlign: "center" }}>
                  Nema rezultata
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddGoalRow({ ex, name, color, acBg, acBd, onAdd }) {
  const [val, setVal] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      layout
      style={{
        background: "var(--surface-1)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)", overflow: "hidden",
      }}
    >
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          padding: "12px 14px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 14, color: "var(--text2)", fontWeight: 500 }}>{name}</span>
        <i className={`ti ti-chevron-${open ? "up" : "down"}`} style={{ color: "var(--text4)", fontSize: 14 }} />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 14px 14px", display: "flex", gap: 8 }}>
              <input
                type="number"
                value={val}
                onChange={e => setVal(e.target.value)}
                placeholder="Target reps"
                className="input-field"
                style={{ flex: 1 }}
                autoFocus
              />
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => { if (val) { onAdd(val); setVal(""); setOpen(false); } }}
                style={{
                  padding: "0 18px",
                  background: color, border: "none",
                  borderRadius: "var(--radius-sm)",
                  color: "#0a0a12", fontFamily: "var(--font-display)", fontWeight: 800,
                  fontSize: 14, cursor: "pointer",
                }}
              >
                +
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
