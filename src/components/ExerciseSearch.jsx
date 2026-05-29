import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { searchExercises, getExerciseById, EXERCISE_DB, MUSCLE_INFO } from "../utils/exerciseDatabase";
import { hsl, EX_LIGHTNESS_ROLES } from "../utils/theme";
import MuscleDiagram from "./MuscleDiagram";

// ── Icon map (same as App) ─────────────────────────────────
const EX_ICON_MAP = {
  sklekovi_siroki:"ti-trending-up",sklekovi_uski:"ti-arrow-bar-up",sklekovi_dijamant:"ti-diamond",
  sklekovi_archer:"ti-arrows-horizontal",sklekovi_pike:"ti-triangle",sklekovi_decline:"ti-arrow-up-right",
  sklekovi_incline:"ti-arrow-down-right",sklekovi_jednorucan:"ti-hand-stop",zgibovi_siroki:"ti-arrow-up",
  zgibovi_uski:"ti-arrow-narrow-up",chin_ups:"ti-arm-flex",neutral_grip_pullups:"ti-grip-horizontal",
  muscle_up:"ti-rocket",australijski_zgibovi:"ti-trending-down",propadanja:"ti-arrow-bar-down",
  propadanja_stolica:"ti-chair",korean_dips:"ti-arrows-down-up",dead_hang:"ti-anchor",
  scapular_pulls:"ti-arrows-maximize",lsit:"ti-letter-l",tuck_lsit:"ti-box",pistol_squat:"ti-run",
  nordic_curl:"ti-wave-square",glute_bridge:"ti-arch",wall_handstand:"ti-hand-finger",
  freestanding_handstand:"ti-star",handstand_pushups:"ti-arrow-autofit-up",human_flag:"ti-flag",
  planche:"ti-zzz",front_lever:"ti-minus",back_lever:"ti-minus-vertical",dragon_flag:"ti-flame",
  hollow_body:"ti-oval",ab_wheel:"ti-circle",
};
function getExIcon(id) { return EX_ICON_MAP[id] || "ti-activity"; }

// ── Exercise Info Sheet ────────────────────────────────────
function ExerciseInfoSheet({ exercise, lang, onAdd, onClose, accent }) {
  const { hue, sat } = accent;
  const dbIdx = EXERCISE_DB.findIndex(e => e.id === exercise.id);
  const l     = EX_LIGHTNESS_ROLES[(dbIdx >= 0 ? dbIdx : 0) % EX_LIGHTNESS_ROLES.length];
  const color  = hsl(hue, sat, l);
  const colorBg = hsl(hue, sat, l, 0.1);
  const colorBd = hsl(hue, sat, l, 0.3);
  const icon   = getExIcon(exercise.id);
  const name   = lang === "sr" ? exercise.sr : exercise.en;
  const desc   = lang === "sr" ? exercise.desc_sr : exercise.desc_en;

  const muscleName = (id) => MUSCLE_INFO[id]?.[lang] || id;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 800,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-end",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 500, margin: "0 auto",
          background: "var(--surface)", borderRadius: "24px 24px 0 0",
          border: "1px solid var(--border2)", borderBottom: "none",
          maxHeight: "88vh", overflowY: "auto",
          paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border2)" }} />
        </div>

        <div style={{ padding: "12px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: colorBg, border: `1.5px solid ${colorBd}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color, fontSize: 24, flexShrink: 0,
              }}>
                <i className={`ti ${icon}`} aria-hidden="true" />
              </div>
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, margin: 0, color: "var(--text)" }}>{name}</h2>
                {lang === "sr" && exercise.sr !== exercise.en && (
                  <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{exercise.en}</div>
                )}
              </div>
            </div>
            <button onClick={onClose} style={{
              background: "var(--surface2)", border: "1px solid var(--border)",
              borderRadius: 10, color: "var(--text3)", width: 32, height: 32,
              fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <i className="ti ti-x" aria-hidden="true" style={{ fontSize: 16 }} />
            </button>
          </div>

          <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, margin: "12px 0" }}>{desc}</p>
        </div>

        {/* Muscle diagram */}
        <div style={{
          margin: "0 20px 16px",
          background: "var(--surface2)", border: "1px solid var(--border)",
          borderRadius: 16, padding: 16,
        }}>
          <div style={{ fontSize: 12, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
            Aktivirani mišići
          </div>
          <MuscleDiagram primaryMuscles={exercise.muscles.primary} secondaryMuscles={exercise.muscles.secondary} size="small" />
        </div>

        {/* Muscle tags */}
        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
              Primarni mišići
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {exercise.muscles.primary.map(m => (
                <span key={m} style={{ background: colorBg, border: `1px solid ${colorBd}`, borderRadius: 8, padding: "4px 10px", fontSize: 12, color, fontWeight: 500 }}>
                  {muscleName(m)}
                </span>
              ))}
            </div>
          </div>
          {exercise.muscles.secondary.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: hsl(hue, sat, l + 12), fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: hsl(hue, sat, l + 12) }} />
                Sekundarni mišići
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {exercise.muscles.secondary.map(m => (
                  <span key={m} style={{ background: hsl(hue, sat, l + 12, 0.1), border: `1px solid ${hsl(hue, sat, l + 12, 0.3)}`, borderRadius: 8, padding: "4px 10px", fontSize: 12, color: hsl(hue, sat, l + 12), fontWeight: 500 }}>
                    {muscleName(m)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "0 20px" }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onAdd(exercise)}
            style={{
              width: "100%", padding: "16px",
              background: `linear-gradient(135deg, ${hsl(hue, sat, l - 14)}, ${color})`,
              border: "none", borderRadius: 16, color: "#fff",
              fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700,
              cursor: "pointer", boxShadow: `0 4px 20px ${colorBd}`, letterSpacing: 0.3,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            Dodaj vežbu
            <i className="ti ti-plus" aria-hidden="true" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Search Modal ──────────────────────────────────────
export default function ExerciseSearch({ lang = "sr", recentIds = [], onSelect, onClose, accent = { hue: 245, sat: 72 } }) {
  const { hue, sat } = accent;
  const [query,  setQuery]  = useState("");
  const [results, setResults] = useState([]);
  const [infoEx, setInfoEx] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (query.trim().length === 0) {
      if (recentIds.length > 0) {
        import("../utils/exerciseDatabase").then(({ EXERCISE_DB }) => {
          const recent = recentIds.map(id => EXERCISE_DB.find(e => e.id === id)).filter(Boolean).slice(0, 6);
          setResults(recent);
        });
      } else setResults([]);
    } else {
      setResults(searchExercises(query, lang));
    }
  }, [query, lang, recentIds]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: "fixed", inset: 0, zIndex: 700, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />

      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 710,
          background: "var(--surface)", borderRadius: "24px 24px 0 0",
          border: "1px solid var(--border2)", borderBottom: "none",
          maxHeight: "80vh", display: "flex", flexDirection: "column",
          maxWidth: 500, margin: "0 auto",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border2)" }} />
        </div>

        {/* Search input */}
        <div style={{ padding: "0 16px 12px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "var(--surface2)", border: `1px solid ${hsl(hue, sat, 62, 0.25)}`,
            borderRadius: 14, padding: "12px 16px",
          }}>
            <i className="ti ti-search" aria-hidden="true" style={{ fontSize: 18, color: "var(--text3)" }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={lang === "sr" ? "Pretraži vežbu..." : "Search exercise..."}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "var(--text)", fontSize: 16, fontFamily: "var(--font-body)",
              }}
            />
            {query && (
              <button onClick={() => setQuery("")} style={{
                background: "none", border: "none", color: "var(--text3)",
                fontSize: 18, cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center",
              }}>
                <i className="ti ti-x" aria-hidden="true" style={{ fontSize: 16 }} />
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: "0 16px 8px", fontSize: 12, color: "var(--text4)", fontWeight: 600 }}>
          {query.trim() === "" && recentIds.length > 0
            ? (lang === "sr" ? "Nedavne vežbe" : "Recent exercises")
            : query.trim() === ""
            ? (lang === "sr" ? "Ukucaj naziv vežbe..." : "Type an exercise name...")
            : `${results.length} rezultata`}
        </div>

        {/* Results */}
        <div style={{ overflowY: "auto", flex: 1, padding: "0 16px 16px" }}>
          <AnimatePresence mode="popLayout">
            {results.map((ex, i) => {
              const dbIdx = EXERCISE_DB.findIndex(e => e.id === ex.id);
              const l     = EX_LIGHTNESS_ROLES[(dbIdx >= 0 ? dbIdx : i) % EX_LIGHTNESS_ROLES.length];
              const col   = hsl(hue, sat, l);
              const colBg = hsl(hue, sat, l, 0.08);
              const colBd = hsl(hue, sat, l, 0.22);
              const icon  = getExIcon(ex.id);
              const name  = lang === "sr" ? ex.sr : ex.en;
              return (
                <motion.div
                  key={ex.id} layout
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }} transition={{ delay: i * 0.04 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 14, marginBottom: 6,
                    background: "var(--surface2)", border: "1px solid var(--border)",
                    cursor: "pointer",
                  }}
                  onClick={() => setInfoEx(ex)}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 11,
                    background: colBg, border: `1.5px solid ${colBd}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: col, fontSize: 19, flexShrink: 0,
                  }}>
                    <i className={`ti ${icon}`} aria-hidden="true" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{name}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ex.muscles.primary.slice(0, 2).map(m => MUSCLE_INFO[m]?.[lang]).filter(Boolean).join(", ")}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 11, color: col,
                    background: colBg, border: `1px solid ${colBd}`,
                    borderRadius: 8, padding: "3px 8px", fontWeight: 600, whiteSpace: "nowrap",
                  }}>
                    Info ›
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {query.trim().length > 0 && results.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--text4)", fontSize: 14, padding: "24px 0" }}>
              Nema rezultata za "{query}"
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {infoEx && (
          <ExerciseInfoSheet
            exercise={infoEx} lang={lang}
            onAdd={(ex) => { onSelect(ex); setInfoEx(null); }}
            onClose={() => setInfoEx(null)}
            accent={accent}
          />
        )}
      </AnimatePresence>
    </>
  );
}
