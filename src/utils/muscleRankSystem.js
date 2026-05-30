// ══════════════════════════════════════════════════════════════
// FITPULSE — MUSCLE RANK SYSTEM v3
// Per-muscle XP tracking, ranking, and analysis
//
// BALANCE PHILOSOPHY:
//   Muscle rank intentionally lags 1-2 tiers behind global rank.
//   This makes muscle rank PRESTIGIOUS. Diamond global with Gold back,
//   Silver chest, Bronze legs — that profile tells a story.
//
//   Global rank = overall player level
//   Muscle rank = per-muscle mastery (much harder to max)
//
// DR CURVE (based on cumulative muscle XP):
//   0–2500 XP      → 100%  fast early progress
//   2500–8000 XP   →  85%  Bronze still achievable
//   8000–20000 XP  →  65%  Silver requires consistency
//   20000–75000 XP →  45%  Gold is a serious grind
//   75000+ XP      →  30%  Obsidian+ = years of training
//
// THRESHOLDS: 2.5x global
//   Bronze=5k, Silver=20k, Gold=62.5k, Platinum=175k, Diamond=437.5k...
//
// MIGRATION: v3 forces full recalc from history with correct DR.
//   Version key: "fitpulse_muscle_xp_version" in localStorage.
// ══════════════════════════════════════════════════════════════

import { TIERS, getTier, calcExerciseXP } from "./theme";
import { EXERCISE_DB, MUSCLE_INFO } from "./exerciseDatabase";

// ── Storage key ───────────────────────────────────────────────
const STORAGE_KEY = "fitpulse_muscle_xp";

// ── MUSCLE TIERS — 2.5x global thresholds ────────────────────
// Global:  0 / 2k / 8k / 25k / 70k / 175k / 400k / 800k / 1.5M / 3M / 5M
// Muscle:  0 / 5k / 20k / 62.5k / 175k / 437k / 1M / 2M / 3.75M / 7.5M / 12.5M
export const MUSCLE_TIERS = [
  { id: "iron",      name: "Iron",      threshold: 0,          color: "#8a9ab5", glow: "rgba(138,154,181,0.35)", icon: "⚙️"  },
  { id: "bronze",    name: "Bronze",    threshold: 5_000,      color: "#cd7f32", glow: "rgba(205,127,50,0.38)",  icon: "🥉"  },
  { id: "silver",    name: "Silver",    threshold: 20_000,     color: "#b0bec5", glow: "rgba(176,190,197,0.40)", icon: "🥈"  },
  { id: "gold",      name: "Gold",      threshold: 62_500,     color: "#ffd700", glow: "rgba(255,215,0,0.42)",   icon: "🥇"  },
  { id: "platinum",  name: "Platinum",  threshold: 175_000,    color: "#e2e8f0", glow: "rgba(180,200,220,0.48)", icon: "💠"  },
  { id: "diamond",   name: "Diamond",   threshold: 437_500,    color: "#b9f2ff", glow: "rgba(100,220,255,0.52)", icon: "💎"  },
  { id: "obsidian",  name: "Obsidian",  threshold: 1_000_000,  color: "#a78bfa", glow: "rgba(167,139,250,0.48)", icon: "🔮"  },
  { id: "titan",     name: "Titan",     threshold: 2_000_000,  color: "#f97316", glow: "rgba(249,115,22,0.50)",  icon: "🔱"  },
  { id: "ascended",  name: "Ascended",  threshold: 3_750_000,  color: "#f0abfc", glow: "rgba(240,171,252,0.52)", icon: "👁️" },
  { id: "eternal",   name: "Eternal",   threshold: 7_500_000,  color: "#fde68a", glow: "rgba(253,230,138,0.55)", icon: "🌟"  },
  { id: "titanium",  name: "Titanium",  threshold: 12_500_000, color: "#e0f2fe", glow: "rgba(224,242,254,0.60)", icon: "🌌"  },
];

// ── Rank colors (aligned with MUSCLE_TIERS) ───────────────────
export const RANK_SVG_COLORS = {
  iron:      "#8a9ab5",
  bronze:    "#cd7f32",
  silver:    "#b0bec5",
  gold:      "#ffd700",
  platinum:  "#e2e8f0",
  diamond:   "#b9f2ff",
  obsidian:  "#a78bfa",
  titan:     "#f97316",
  ascended:  "#f0abfc",
  eternal:   "#fde68a",
  titanium:  "#e0f2fe",
};

// Dim color for untrained muscles
export const UNTRAINED_COLOR = "rgba(255,255,255,0.10)";

// ── XP weight roles ───────────────────────────────────────────
const ROLE_WEIGHT = {
  primary:   1.00,
  secondary: 0.50,
  support:   0.25,
};

// ── Per-session Diminishing Returns (based on cumulative muscle XP) ──
// Applied per workout, based on how much XP a muscle has ALREADY accumulated.
// 5 breakpoints — early progress feels fast, endgame requires years.
export const MUSCLE_DR_BREAKPOINTS = [
  { threshold: 75_000, rate: 0.30 }, // Obsidian+ territory: 30%
  { threshold: 20_000, rate: 0.45 }, // Gold territory: 45%
  { threshold: 8_000,  rate: 0.65 }, // Silver territory: 65%
  { threshold: 2_500,  rate: 0.85 }, // Early Bronze: 85%
  { threshold: 0,      rate: 1.00 }, // Fresh start: 100%
];

export const MUSCLE_SYSTEM_VERSION = 3;
const VERSION_KEY = "fitpulse_muscle_xp_version";

function applyMuscleDR(rawGain, currentCumulativeXP) {
  for (const bp of MUSCLE_DR_BREAKPOINTS) {
    if (currentCumulativeXP >= bp.threshold) {
      return rawGain * bp.rate;
    }
  }
  return rawGain;
}

// ── Muscle tier lookup (uses MUSCLE_TIERS, not global TIERS) ──
export function getMuscleTier(muscleXP) {
  let tier = MUSCLE_TIERS[0];
  let nextTier = MUSCLE_TIERS[1];

  for (let i = MUSCLE_TIERS.length - 1; i >= 0; i--) {
    if (muscleXP >= MUSCLE_TIERS[i].threshold) {
      tier = MUSCLE_TIERS[i];
      nextTier = MUSCLE_TIERS[i + 1] || null;
      break;
    }
  }

  const progress = nextTier
    ? Math.min(Math.round(((muscleXP - tier.threshold) / (nextTier.threshold - tier.threshold)) * 100), 100)
    : 100;
  const remaining = nextTier ? nextTier.threshold - muscleXP : 0;

  return { tier, nextTier, progress, remaining, xp: muscleXP };
}

// ── Compute muscle XP gains from a single workout ─────────────
// NOTE: DR is applied during applyMuscleXPGains, not here.
// This returns raw gains that will be DR-adjusted on application.
export function computeMuscleXPGains(workout) {
  const gains = {};

  Object.entries(workout.exercises).forEach(([exId, v]) => {
    const total = v?.total || 0;
    if (!total) return;
    const ex = EXERCISE_DB.find(e => e.id === exId);
    if (!ex) return;

    const rawXP = calcExerciseXP(exId, total, ex);

    const muscles = ex.muscles || {};
    const primary   = muscles.primary   || [];
    const secondary = muscles.secondary || [];

    primary.forEach(mId => {
      gains[mId] = (gains[mId] || 0) + rawXP * ROLE_WEIGHT.primary;
    });
    secondary.forEach(mId => {
      gains[mId] = (gains[mId] || 0) + rawXP * ROLE_WEIGHT.secondary;
    });
  });

  // Round all values
  Object.keys(gains).forEach(k => { gains[k] = Math.round(gains[k]); });
  return gains;
}

// ── Storage ───────────────────────────────────────────────────
export function loadMuscleXP() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveMuscleXP(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(VERSION_KEY, String(MUSCLE_SYSTEM_VERSION));
  } catch {}
}

// Returns current stored version (0 if never set = needs migration)
export function loadMuscleXPVersion() {
  try {
    return parseInt(localStorage.getItem(VERSION_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

// Force-clear muscle XP so next load triggers fresh migration
export function resetMuscleXP() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERSION_KEY);
  } catch {}
}

/**
 * Apply muscle XP gains to stored data, with per-session DR.
 * DR is based on the muscle's CURRENT cumulative XP (before this session).
 * Returns { newMuscleXP, rankUps: [{ muscleId, oldRank, newRank }] }
 */
export function applyMuscleXPGains(gains, currentMuscleXP) {
  const updated = { ...currentMuscleXP };
  const rankUps = [];

  Object.entries(gains).forEach(([mId, rawXP]) => {
    const currentXP = updated[mId] || 0;
    // Apply DR based on how trained this muscle already is
    const effectiveXP = Math.round(applyMuscleDR(rawXP, currentXP));
    if (effectiveXP <= 0) return;

    const oldRank = getMuscleTier(currentXP).tier;
    const newXP   = currentXP + effectiveXP;
    const newRank = getMuscleTier(newXP).tier;

    updated[mId] = newXP;

    if (newRank.id !== oldRank.id) {
      rankUps.push({ muscleId: mId, oldRank, newRank: newRank.id });
    }
  });

  return { newMuscleXP: updated, rankUps };
}

// ── Per-muscle tier info ──────────────────────────────────────
export function getMuscleStats(muscleId, muscleXP) {
  const xp = muscleXP[muscleId] || 0;
  const tierData = getMuscleTier(xp);
  return {
    muscleId,
    xp,
    tier: tierData.tier,
    nextTier: tierData.nextTier,
    progress: tierData.progress,
    remaining: tierData.remaining,
  };
}

// ── SVG color for a muscle based on its XP ───────────────────
export function getMuscleColor(muscleId, muscleXP) {
  const xp = muscleXP[muscleId] || 0;
  if (xp <= 0) return UNTRAINED_COLOR;
  const tier = getMuscleTier(xp).tier;
  return RANK_SVG_COLORS[tier.id] || UNTRAINED_COLOR;
}

// ── Build SVG color map for MuscleDiagram ────────────────────
export function buildRankColorMap(muscleXP) {
  const MUSCLE_TO_SVG = {
    bicep_long:        ["biceps"],
    bicep_short:       ["biceps"],
    brachialis:        ["biceps"],
    lats:              ["lats"],
    teres_major:       ["lats"],
    teres_minor:       ["lats"],
    trap_upper:        ["traps", "traps-middle"],
    trap_mid:          ["traps", "traps-middle"],
    trap_lower:        ["traps", "traps-middle"],
    pec_major_upper:   ["chest"],
    pec_major_lower:   ["chest"],
    pec_minor:         ["chest"],
    serratus:          ["chest"],
    delt_anterior:     ["front-shoulders"],
    delt_posterior:    ["rear-shoulders"],
    delt_lateral:      ["front-shoulders", "rear-shoulders"],
    tricep_long:       ["triceps"],
    tricep_lateral:    ["triceps"],
    tricep_medial:     ["triceps"],
    rectus_abdominis:  ["abdominals"],
    transversus:       ["abdominals"],
    oblique_int:       ["abdominals"],
    oblique_ext:       ["obliques"],
    glute_max:         ["glutes"],
    glute_med:         ["glutes"],
    glute_min:         ["glutes"],
    rectus_femoris:    ["quads"],
    vastus_lat:        ["quads"],
    vastus_med:        ["quads"],
    vastus_int:        ["quads"],
    bicep_femoris:     ["hamstrings"],
    semitendinosus:    ["hamstrings"],
    semimembranosus:   ["hamstrings"],
    gastrocnemius:     ["calves"],
    soleus:            ["calves"],
    erector_spinae:    ["lowerback"],
    brachioradialis:   ["forearms"],
    rhomboids:         ["traps-middle"],
    infraspinatus:     ["rear-shoulders"],
    iliopsoas:         ["quads"],
  };

  const svgColorMap = {};
  const svgXPMap   = {};

  Object.entries(muscleXP).forEach(([mId, xp]) => {
    const groups = MUSCLE_TO_SVG[mId] || [];
    groups.forEach(gId => {
      if (!svgXPMap[gId] || xp > svgXPMap[gId]) {
        svgXPMap[gId] = xp;
        svgColorMap[gId] = getMuscleColor(mId, muscleXP);
      }
    });
  });

  return svgColorMap;
}

// ── Strongest / Weakest muscle ────────────────────────────────
export function getStrongestWeakest(muscleXP) {
  const trained = Object.entries(muscleXP).filter(([, xp]) => xp > 0);
  if (!trained.length) return { strongest: null, weakest: null };

  trained.sort((a, b) => b[1] - a[1]);
  const strongest = { muscleId: trained[0][0], xp: trained[0][1] };
  const weakest   = { muscleId: trained[trained.length - 1][0], xp: trained[trained.length - 1][1] };

  return { strongest, weakest };
}

// ── Weak Point analysis ───────────────────────────────────────
export function analyzeWeakPoints(muscleXP) {
  const trained = Object.entries(muscleXP).filter(([, xp]) => xp > 0);
  if (trained.length < 2) return [];

  const avgXP = trained.reduce((s, [, xp]) => s + xp, 0) / trained.length;
  const maxXP = Math.max(...trained.map(([, xp]) => xp));

  const maxTierIdx  = MUSCLE_TIERS.findIndex(t => t.id === getMuscleTier(maxXP).tier.id);

  return trained
    .map(([mId, xp]) => {
      const tierIdx = MUSCLE_TIERS.findIndex(t => t.id === getMuscleTier(xp).tier.id);
      const tierGapFromMax = maxTierIdx - tierIdx;
      const xpGapFromAvg  = avgXP - xp;
      return { muscleId: mId, xp, tierIdx, tierGapFromMax, xpGapFromAvg };
    })
    .filter(m => m.tierGapFromMax >= 2 || m.xpGapFromAvg > avgXP * 0.5)
    .sort((a, b) => b.tierGapFromMax - a.tierGapFromMax)
    .slice(0, 3);
}

// ── Migration: recalculate muscle XP from existing history ────
// Full recalc from scratch using current DR curve.
// Called automatically when stored version < MUSCLE_SYSTEM_VERSION.
// Processes workouts in chronological order so DR accumulates correctly.
export function migrateFromHistory(savedData) {
  if (!savedData?.length) return {};

  const cumulativeXP = {};

  [...savedData]
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach(workout => {
      const rawGains = computeMuscleXPGains(workout);
      Object.entries(rawGains).forEach(([mId, rawXP]) => {
        const currentXP = cumulativeXP[mId] || 0;
        const effectiveXP = Math.round(applyMuscleDR(rawXP, currentXP));
        cumulativeXP[mId] = currentXP + effectiveXP;
      });
    });

  return cumulativeXP;
}

// ── Make muscle rank-up toast ─────────────────────────────────
export function makeMuscleRankUpToast(muscleId, newRankId, accent) {
  const muscleName = MUSCLE_INFO[muscleId]?.sr || muscleId;
  const rankObj = MUSCLE_TIERS.find(t => t.id === newRankId) || MUSCLE_TIERS[0];
  const color = RANK_SVG_COLORS[newRankId] || "#b0bec5";
  return {
    id: `muscle-rank-${muscleId}-${Date.now()}-${Math.random()}`,
    type: "muscle_rankup",
    muscleId,
    muscleName,
    newRank: rankObj,
    accent,
    bg:     `linear-gradient(135deg, ${color}18, ${color}08)`,
    border: `${color}44`,
    glow:   `${color}33`,
    duration: 4500,
  };
}

// ── All muscle stats sorted by XP ────────────────────────────
export function getAllMuscleStats(muscleXP) {
  return Object.keys(MUSCLE_INFO)
    .map(mId => getMuscleStats(mId, muscleXP))
    .sort((a, b) => b.xp - a.xp);
}

// ── SVG group → primary muscle IDs (for detail panel) ────────
export const SVG_GROUP_TO_MUSCLES = {
  "chest":           ["pec_major_upper","pec_major_lower","pec_minor","serratus"],
  "biceps":          ["bicep_long","bicep_short","brachialis"],
  "triceps":         ["tricep_long","tricep_lateral","tricep_medial"],
  "lats":            ["lats","teres_major","teres_minor"],
  "traps":           ["trap_upper","trap_mid","trap_lower"],
  "traps-middle":    ["trap_mid","trap_lower","rhomboids"],
  "front-shoulders": ["delt_anterior","delt_lateral"],
  "rear-shoulders":  ["delt_posterior","delt_lateral","infraspinatus"],
  "abdominals":      ["rectus_abdominis","transversus","oblique_int"],
  "obliques":        ["oblique_ext"],
  "quads":           ["rectus_femoris","vastus_lat","vastus_med","vastus_int","iliopsoas"],
  "hamstrings":      ["bicep_femoris","semitendinosus","semimembranosus"],
  "glutes":          ["glute_max","glute_med","glute_min"],
  "calves":          ["gastrocnemius","soleus"],
  "lowerback":       ["erector_spinae"],
  "forearms":        ["brachioradialis"],
};

export const SVG_GROUP_LABELS = {
  "chest":           "Grudi",
  "biceps":          "Bicepsi",
  "triceps":         "Tricepsi",
  "lats":            "Leđa (Lats)",
  "traps":           "Trapezius",
  "traps-middle":    "Trapezius (srednji)",
  "front-shoulders": "Ramena (prednji)",
  "rear-shoulders":  "Ramena (zadnji)",
  "abdominals":      "Trbušnjaci",
  "obliques":        "Oblici",
  "quads":           "Kvadricepsi",
  "hamstrings":      "Zadnja loža",
  "glutes":          "Gluteusi",
  "calves":          "Listovi",
  "lowerback":       "Donja leđa",
  "forearms":        "Podlaktice",
};

// ── Compute per-muscle workout count and last trained date ────
export function getMuscleHistory(muscleId, savedData) {
  if (!savedData?.length) return { workoutCount: 0, lastTrainedAt: null };

  const relevantExIds = EXERCISE_DB
    .filter(ex =>
      (ex.muscles?.primary || []).includes(muscleId) ||
      (ex.muscles?.secondary || []).includes(muscleId)
    )
    .map(ex => ex.id);

  let workoutCount = 0;
  let lastTrainedAt = null;

  [...savedData]
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach(w => {
      const hasThisMuscle = relevantExIds.some(exId => (w.exercises[exId]?.total || 0) > 0);
      if (hasThisMuscle) {
        workoutCount++;
        if (!lastTrainedAt) lastTrainedAt = w.date;
      }
    });

  return { workoutCount, lastTrainedAt };
}

// ── Get aggregated stats for an SVG group ────────────────────
export function getSVGGroupStats(svgGroupId, muscleXP, savedData, strongest, weakest) {
  const muscles = SVG_GROUP_TO_MUSCLES[svgGroupId] || [];
  if (!muscles.length) return null;

  const rep = muscles.reduce((best, mId) => {
    return (muscleXP[mId] || 0) > (muscleXP[best] || 0) ? mId : best;
  }, muscles[0]);

  const xp = muscleXP[rep] || 0;
  const tierData = getMuscleTier(xp);
  const history = getMuscleHistory(rep, savedData);

  const isStrongest = strongest && muscles.includes(strongest.muscleId);
  const isWeakest   = weakest   && muscles.includes(weakest.muscleId);

  return {
    svgGroupId,
    label: SVG_GROUP_LABELS[svgGroupId] || svgGroupId,
    representativeMuscleId: rep,
    allMuscleIds: muscles,
    xp,
    tier: tierData.tier,
    nextTier: tierData.nextTier,
    progress: tierData.progress,
    remaining: tierData.remaining,
    workoutCount: history.workoutCount,
    lastTrainedAt: history.lastTrainedAt,
    isStrongest,
    isWeakest,
    color: xp > 0 ? (RANK_SVG_COLORS[tierData.tier.id] || UNTRAINED_COLOR) : UNTRAINED_COLOR,
  };
}

