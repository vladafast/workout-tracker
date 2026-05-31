// ══════════════════════════════════════════════════════════════
// FITPULSE — THEME & PROGRESSION SYSTEM v3
// Serious long-term progression. No free XP. No shortcuts.
// ══════════════════════════════════════════════════════════════

export const ACCENT_PRESETS = [
  { id: "indigo", label: "Indigo",      hue: 245, sat: 72 },
  { id: "purple", label: "Purple",      hue: 280, sat: 70 },
  { id: "green",  label: "Zelena",      hue: 142, sat: 65 },
  { id: "orange", label: "Narandžasta", hue: 25,  sat: 80 },
  { id: "red",    label: "Crvena",      hue: 0,   sat: 72 },
  { id: "pink",   label: "Roze",        hue: 330, sat: 70 },
  { id: "yellow", label: "Žuta",        hue: 48,  sat: 78 },
];

export const SWATCH_COLORS = [
  "#6366f1","#a855f7","#22c55e","#f97316","#ef4444","#ec4899","#eab308",
];

export const EX_LIGHTNESS_ROLES = [62,55,48,70,42,58,65,50,45,68,52,60,38,72,46];

export function hsl(h, s, l, a) {
  h = ((h % 360) + 360) % 360;
  return a !== undefined ? `hsla(${h},${s}%,${l}%,${a})` : `hsl(${h},${s}%,${l}%)`;
}

export function exColor(hue, sat, index, alpha) {
  const l = EX_LIGHTNESS_ROLES[index % EX_LIGHTNESS_ROLES.length];
  return alpha !== undefined ? hsl(hue, sat, l, alpha) : hsl(hue, sat, l);
}

export function applyAccent(hue, sat) {
  const root = document.documentElement;
  root.style.setProperty("--accent",       hsl(hue, sat, 60));
  root.style.setProperty("--accent-light", hsl(hue, sat, 72));
  root.style.setProperty("--accent-dark",  hsl(hue, sat, 42));
  root.style.setProperty("--accent-dim",   hsl(hue, sat, 60, 0.15));
  root.style.setProperty("--accent-glow",  hsl(hue, sat, 60, 0.30));
  root.style.setProperty("--accent-h",     String(hue));
  root.style.setProperty("--accent-s",     String(sat) + "%");
}

export function loadAccent() {
  try { const r = localStorage.getItem("fitpulse_accent"); if (r) return JSON.parse(r); } catch {}
  return { hue: 245, sat: 72 };
}
export function saveAccent(hue, sat) {
  try { localStorage.setItem("fitpulse_accent", JSON.stringify({ hue, sat })); } catch {}
}
export function loadTheme() {
  try { return localStorage.getItem("fitpulse_theme") || "dark"; } catch { return "dark"; }
}
export function saveTheme(t) {
  try { localStorage.setItem("fitpulse_theme", t); } catch {}
}

// ══════════════════════════════════════════════════════════════
// RANK SYSTEM — 11 ranks, gradual scaling, no walls
// Long-term identity progression. Months to years.
// ══════════════════════════════════════════════════════════════
export const TIERS = [
  {
    id: "iron",
    name: "Iron",       threshold: 0,
    color: "#8a9ab5",   glow: "rgba(138,154,181,0.35)",
    bg: "linear-gradient(135deg, rgba(138,154,181,0.12), rgba(138,154,181,0.04))",
    icon: "⚙️", roman: "I",
    desc: "Počinjuješ. Svaki rep se računa.",
  },
  {
    id: "bronze",
    name: "Bronze",     threshold: 2_000,
    color: "#cd7f32",   glow: "rgba(205,127,50,0.38)",
    bg: "linear-gradient(135deg, rgba(205,127,50,0.14), rgba(205,127,50,0.04))",
    icon: "🥉", roman: "II",
    desc: "Regularnost. Navika se gradi.",
  },
  {
    id: "silver",
    name: "Silver",     threshold: 8_000,
    color: "#b0bec5",   glow: "rgba(176,190,197,0.40)",
    bg: "linear-gradient(135deg, rgba(176,190,197,0.14), rgba(176,190,197,0.04))",
    icon: "🥈", roman: "III",
    desc: "Ozbiljnost. Vidi se razlika.",
  },
  {
    id: "gold",
    name: "Gold",       threshold: 25_000,
    color: "#ffd700",   glow: "rgba(255,215,0,0.42)",
    bg: "linear-gradient(135deg, rgba(255,215,0,0.13), rgba(255,215,0,0.04))",
    icon: "🥇", roman: "IV",
    desc: "Posvećenost. Pravi atleta.",
  },
  {
    id: "platinum",
    name: "Platinum",   threshold: 70_000,
    color: "#e2e8f0",   glow: "rgba(180,200,220,0.48)",
    bg: "linear-gradient(135deg, rgba(180,200,220,0.16), rgba(120,160,200,0.05))",
    icon: "💠", roman: "V",
    desc: "Elite amateur. Skill movesi su norma.",
  },
  {
    id: "diamond",
    name: "Diamond",    threshold: 175_000,
    color: "#b9f2ff",   glow: "rgba(100,220,255,0.52)",
    bg: "linear-gradient(135deg, rgba(100,220,255,0.16), rgba(80,180,255,0.05))",
    icon: "💎", roman: "VI",
    desc: "Pravi atleta. Ovo se ne vidi svaki dan.",
  },
  {
    id: "obsidian",
    name: "Obsidian",   threshold: 400_000,
    color: "#a78bfa",   glow: "rgba(167,139,250,0.48)",
    bg: "linear-gradient(135deg, rgba(167,139,250,0.14), rgba(124,58,237,0.05))",
    icon: "🔮", roman: "VII",
    desc: "Veteran. Godine u sistemu.",
  },
  {
    id: "titan",
    name: "Titan",      threshold: 800_000,
    color: "#f97316",   glow: "rgba(249,115,22,0.50)",
    bg: "linear-gradient(135deg, rgba(249,115,22,0.14), rgba(234,88,12,0.05))",
    icon: "🔱", roman: "VIII",
    desc: "Legenda. Lokalni vrh.",
  },
  {
    id: "ascended",
    name: "Ascended",   threshold: 1_500_000,
    color: "#f0abfc",   glow: "rgba(240,171,252,0.52)",
    bg: "linear-gradient(135deg, rgba(240,171,252,0.14), rgba(192,38,211,0.05))",
    icon: "👁️", roman: "IX",
    desc: "Globalni vrh. Retko viđeno.",
  },
  {
    id: "eternal",
    name: "Eternal",    threshold: 3_000_000,
    color: "#fde68a",   glow: "rgba(253,230,138,0.55)",
    bg: "linear-gradient(135deg, rgba(253,230,138,0.16), rgba(245,158,11,0.05))",
    icon: "🌟", roman: "X",
    desc: "Mitski. Moguće samo uz godine svakodnevnog grinda.",
  },
  {
    id: "titanium",
    name: "Titanium",   threshold: 5_000_000,
    color: "#e0f2fe",   glow: "rgba(186,230,253,0.60)",
    bg: "linear-gradient(135deg, rgba(186,230,253,0.18), rgba(56,189,248,0.06))",
    icon: "🌌", roman: "XI",
    desc: "True endgame. Ne postoji ništa više.",
  },
];

export const TITANIUM_MAX_XP = 10_000_000; // True endgame ceiling

export function getTier(totalXP) {
  let tier = TIERS[0];
  let nextTier = TIERS[1];

  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (totalXP >= TIERS[i].threshold) {
      tier = TIERS[i];
      nextTier = TIERS[i + 1] || null;
      break;
    }
  }

  if (tier.id === "titanium") {
    const isTitaniumMax = totalXP >= TITANIUM_MAX_XP;
    const progress = isTitaniumMax
      ? 100
      : Math.min(Math.round(((totalXP - tier.threshold) / (TITANIUM_MAX_XP - tier.threshold)) * 100), 100);
    const remaining = isTitaniumMax ? 0 : TITANIUM_MAX_XP - totalXP;
    return { tier, nextTier: null, progress, remaining, xp: totalXP, isTitaniumMax };
  }

  const progress = nextTier
    ? Math.min(Math.round(((totalXP - tier.threshold) / (nextTier.threshold - tier.threshold)) * 100), 100)
    : 100;
  const remaining = nextTier ? nextTier.threshold - totalXP : 0;
  return { tier, nextTier, progress, remaining, xp: totalXP, isTitaniumMax: false };
}

// Legacy compat
export function getTierInfo(xp) {
  const { tier, nextTier, progress, remaining, isTitaniumMax } = getTier(xp);
  return {
    tierName: tier.name, nextName: isTitaniumMax ? "TRUE MAX" : (nextTier?.name || "Titanium MAX"),
    progress, remaining, xp, tierObj: tier, nextTierObj: nextTier, isTitaniumMax,
  };
}

// ══════════════════════════════════════════════════════════════
// XP ENGINE v3
// Performance-based only. No free XP.
// ══════════════════════════════════════════════════════════════

/**
 * Calculate XP for a single exercise entry.
 * @param {string} exId  - exercise ID from EXERCISE_DB
 * @param {number} total - total reps OR total seconds (for holds)
 * @param {object} ex    - exercise object (with xpWeight, isHold)
 */
export function calcExerciseXP(exId, total, ex) {
  if (!ex || !total || total <= 0) return 0;
  const weight = ex.xpWeight || 1;
  return total * weight;
}

/**
 * Diminishing returns on raw XP per workout.
 * Intentionally very forgiving — punishes only extreme spam.
 * Legit heavy training is barely affected.
 */
function applyDiminishing(rawXP) {
  // Thresholds in XP (not reps), so high-weight exercises aren't penalized
  if (rawXP <= 500)  return rawXP;
  if (rawXP <= 1500) return 500 + (rawXP - 500)  * 0.95;
  if (rawXP <= 3000) return 500 + 1000 * 0.95 + (rawXP - 1500) * 0.90;
  return 500 + 1000 * 0.95 + 1500 * 0.90 + (rawXP - 3000) * 0.85;
}

/**
 * Calculate total XP for a workout object.
 * workout.exercises: { [exId]: { total, raw, sets } }
 * Requires EXERCISE_DB to be passed in to avoid circular imports.
 */
export function workoutXP(workout, exerciseDB) {
  if (!workout?.exercises) return 0;

  let db = exerciseDB;
  if (!db) return _legacyWorkoutXP(workout); // exerciseDB must be passed in ESM context

  let rawXP = 0;
  Object.entries(workout.exercises).forEach(([exId, v]) => {
    const total = v?.total || 0;
    if (!total) return;
    const ex = db.find(e => e.id === exId);
    if (ex) {
      rawXP += calcExerciseXP(exId, total, ex);
    } else {
      // Unknown exercise (old data) — assume 1 XP/rep
      rawXP += total * 1.0;
    }
  });

  return Math.round(applyDiminishing(rawXP));
}

// Fallback for old workout data that doesn't match new DB
function _legacyWorkoutXP(workout) {
  const reps = Object.values(workout.exercises).reduce((s, v) => s + (v?.total || 0), 0);
  return Math.round(Math.floor(reps * 1.5) + 50);
}

/**
 * PR Bonus: +5% if workout sets any new PR.
 * Applied after diminishing returns.
 */
export function applyPRBonus(xp, hasPR) {
  if (!hasPR) return xp;
  return Math.round(xp * 1.05);
}

/**
 * Calculate total lifetime XP from all saved workouts.
 */
export function calcXP(savedData, exerciseDB) {
  if (!savedData?.length) return 0;
  let db = exerciseDB;
  if (!db) return 0; // exerciseDB must be passed in ESM context
  return savedData.reduce((sum, w) => sum + workoutXP(w, db), 0);
}

// ══════════════════════════════════════════════════════════════
// ACHIEVEMENTS
// ══════════════════════════════════════════════════════════════

const _reps  = d => d.reduce((s,w) => s + Object.values(w.exercises).reduce((a,v) => a+(v?.total||0),0), 0);
const _wReps = w => Object.values(w.exercises).reduce((a,v) => a+(v?.total||0), 0);

export const ACHIEVEMENTS = [
  // ── Onboarding ───────────────────────────────────────────
  { id: "first_rep",      icon: "🎯", name: "First Rep",        desc: "Unesi prvi trening",                        check: d => d.length >= 1 },
  { id: "workouts_5",     icon: "🌱", name: "Getting Started",  desc: "5 treninga ukupno",                         check: d => d.length >= 5 },
  { id: "workouts_10",    icon: "💪", name: "Consistent",       desc: "10 treninga ukupno",                        check: d => d.length >= 10 },
  { id: "workouts_25",    icon: "🏅", name: "Quarter Century",  desc: "25 treninga ukupno",                        check: d => d.length >= 25 },
  { id: "workouts_50",    icon: "🎖️", name: "Dedicated",       desc: "50 treninga ukupno",                        check: d => d.length >= 50 },
  { id: "workouts_100",   icon: "💎", name: "Centurion",        desc: "100 treninga ukupno",                       check: d => d.length >= 100 },
  { id: "workouts_365",   icon: "📅", name: "Year of Grind",    desc: "365 treninga ukupno",                       check: d => d.length >= 365 },

  // ── Rep milestones ────────────────────────────────────────
  { id: "reps_100",       icon: "💯", name: "Century",          desc: "100 reps ukupno",                           check: d => _reps(d) >= 100 },
  { id: "reps_500",       icon: "⚡", name: "500 Club",         desc: "500 reps ukupno",                           check: d => _reps(d) >= 500 },
  { id: "reps_1000",      icon: "🔥", name: "Thousand",         desc: "1 000 reps ukupno",                         check: d => _reps(d) >= 1000 },
  { id: "reps_5000",      icon: "🦾", name: "Five Thousand",    desc: "5 000 reps ukupno",                         check: d => _reps(d) >= 5000 },
  { id: "reps_10000",     icon: "🤖", name: "Rep Machine",      desc: "10 000 reps ukupno",                        check: d => _reps(d) >= 10000 },
  { id: "reps_50000",     icon: "🧠", name: "Obsessed",         desc: "50 000 reps ukupno",                        check: d => _reps(d) >= 50000 },
  { id: "reps_100000",    icon: "👾", name: "Inhuman",          desc: "100 000 reps ukupno",                       check: d => _reps(d) >= 100000 },

  // ── Session volume ────────────────────────────────────────
  { id: "session_100",    icon: "💥", name: "Solid Session",    desc: "100+ reps u jednom treningu",               check: d => d.some(w => _wReps(w) >= 100) },
  { id: "beast_mode",     icon: "🐉", name: "Beast Mode",       desc: "500+ reps u jednom treningu",               check: d => d.some(w => _wReps(w) >= 500) },
  { id: "monster",        icon: "👹", name: "Monster",          desc: "1 000+ reps u jednom treningu",             check: d => d.some(w => _wReps(w) >= 1000) },

  // ── Streaks ───────────────────────────────────────────────
  { id: "streak_3",       icon: "🌡️", name: "Warming Up",      desc: "3 dana niza",                               check: (_,st) => st >= 3 },
  { id: "streak_7",       icon: "📆", name: "Week Warrior",     desc: "7 dana niza",                               check: (_,st) => st >= 7 },
  { id: "streak_14",      icon: "🔗", name: "Chain Reaction",   desc: "14 dana niza",                              check: (_,st) => st >= 14 },
  { id: "streak_30",      icon: "🏆", name: "Iron Will",        desc: "30 dana niza",                              check: (_,st) => st >= 30 },
  { id: "streak_60",      icon: "⚙️", name: "Machine",         desc: "60 dana niza",                              check: (_,st) => st >= 60 },
  { id: "streak_100",     icon: "👑", name: "Legend",           desc: "100 dana niza",                             check: (_,st) => st >= 100 },
  { id: "streak_365",     icon: "🌍", name: "365",              desc: "365 dana niza — cela godina",               check: (_,st) => st >= 365 },

  // ── Rank milestones ───────────────────────────────────────
  { id: "rank_bronze",    icon: "🥉", name: "Bronze",           desc: "Dostigni Bronze rank",                      check: d => calcXP(d) >= 2_000 },
  { id: "rank_silver",    icon: "🥈", name: "Silver",           desc: "Dostigni Silver rank",                      check: d => calcXP(d) >= 8_000 },
  { id: "rank_gold",      icon: "🥇", name: "Gold",             desc: "Dostigni Gold rank",                        check: d => calcXP(d) >= 25_000 },
  { id: "rank_platinum",  icon: "💠", name: "Platinum",         desc: "Dostigni Platinum rank",                    check: d => calcXP(d) >= 70_000 },
  { id: "rank_diamond",   icon: "💎", name: "Diamond",          desc: "Dostigni Diamond rank",                     check: d => calcXP(d) >= 175_000 },
  { id: "rank_obsidian",  icon: "🔮", name: "Obsidian",         desc: "Dostigni Obsidian rank",                    check: d => calcXP(d) >= 400_000 },
  { id: "rank_titan",     icon: "🔱", name: "Titan",            desc: "Dostigni Titan rank",                       check: d => calcXP(d) >= 800_000 },
  { id: "rank_titanium",  icon: "🌌", name: "Titanium",         desc: "Dostigni Titanium — True Endgame",          check: d => calcXP(d) >= 5_000_000 },

  // ── Skill moves ───────────────────────────────────────────
  { id: "first_muscleup",  icon: "🚀", name: "Muscle-Up",       desc: "Uradi muscle-up",                           check: d => d.some(w=>(w.exercises.muscle_up?.total||0)>0) },
  { id: "muscleup_10",     icon: "🛸", name: "Muscle-Up x10",   desc: "10 muscle-up u jednoj sesiji",              check: d => d.some(w=>(w.exercises.muscle_up?.total||0)>=10) },
  { id: "one_arm_pu",      icon: "☝️", name: "One Arm Pull-Up", desc: "Uradi jednoručni zgib",                     check: d => d.some(w=>(w.exercises.one_arm_pullup?.total||0)>0) },
  { id: "first_handstand", icon: "🤸", name: "Upside Down",     desc: "Uradi handstand",                           check: d => d.some(w=>(w.exercises.wall_handstand?.total||0)>0||(w.exercises.freestanding_handstand?.total||0)>0) },
  { id: "free_handstand",  icon: "🎪", name: "Freestanding",    desc: "Freestanding handstand",                    check: d => d.some(w=>(w.exercises.freestanding_handstand?.total||0)>0) },
  { id: "handstand_pu",    icon: "🔂", name: "HSPU",            desc: "Uradi handstand push-up",                   check: d => d.some(w=>(w.exercises.handstand_pushups?.total||0)>0) },
  { id: "first_lsit",      icon: "📐", name: "L-Sit",           desc: "Uradi L-sit",                               check: d => d.some(w=>(w.exercises.l_sit?.total||0)>0) },
  { id: "human_flag_ach",  icon: "🚩", name: "Human Flag",      desc: "Uradi human flag",                          check: d => d.some(w=>(w.exercises.human_flag?.total||0)>0) },
  { id: "front_lever_ach", icon: "⬆️", name: "Front Lever",    desc: "Uradi front lever",                         check: d => d.some(w=>(w.exercises.front_lever?.total||0)>0) },
  { id: "back_lever_ach",  icon: "⬇️", name: "Back Lever",     desc: "Uradi back lever",                          check: d => d.some(w=>(w.exercises.back_lever?.total||0)>0) },
  { id: "full_planche_ach",icon: "🌌", name: "Full Planche",    desc: "Uradi full planche",                        check: d => d.some(w=>(w.exercises.full_planche?.total||0)>0) },
  { id: "victorian_ach",   icon: "👑", name: "Victorian Hold",  desc: "Uradi Victorian hold",                      check: d => d.some(w=>(w.exercises.victorian_hold?.total||0)>0) },
  { id: "dragon_flag_ach", icon: "🐲", name: "Dragon Flag",     desc: "Uradi dragon flag",                         check: d => d.some(w=>(w.exercises.dragon_flag?.total||0)>0) },
  { id: "pistol_ach",      icon: "🔫", name: "Pistol Squat",    desc: "Uradi pistol čučanj",                       check: d => d.some(w=>(w.exercises.pistol_squat?.total||0)>0) },
  { id: "nordic_ach",      icon: "🧊", name: "Nordic Curl",     desc: "Uradi nordic curl",                         check: d => d.some(w=>(w.exercises.nordic_curl?.total||0)>0) },
  { id: "skill_hunter",    icon: "🎯", name: "Skill Hunter",    desc: "Otključaj 5 različitih skill movesa",       check: d => {
    const skills = ["muscle_up","wall_handstand","freestanding_handstand","handstand_pushups","l_sit","human_flag","front_lever","back_lever","dragon_flag","full_planche","victorian_hold","one_arm_pullup"];
    return skills.filter(s => d.some(w=>(w.exercises[s]?.total||0)>0)).length >= 5;
  }},
  { id: "skill_master",    icon: "🧙", name: "Skill Master",    desc: "Otključaj 8+ skill movesa",                 check: d => {
    const skills = ["muscle_up","wall_handstand","freestanding_handstand","handstand_pushups","l_sit","human_flag","front_lever","back_lever","dragon_flag","full_planche","victorian_hold","one_arm_pullup"];
    return skills.filter(s => d.some(w=>(w.exercises[s]?.total||0)>0)).length >= 8;
  }},

  // ── Volume intensity ──────────────────────────────────────
  { id: "week_7x",         icon: "🗓️", name: "Perfect Week",   desc: "Treniraj svakog dana 7 dana zaredom",       check: d => {
    const days = new Set(d.map(w=>w.date));
    for (let i = 0; i < d.length - 6; i++) {
      const base = new Date(d[i].date+"T00:00:00");
      let full = true;
      for (let j = 0; j < 7; j++) {
        const dt = new Date(base); dt.setDate(base.getDate()+j);
        const pad = n => String(n).padStart(2,"0"); const dtKey = `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`; if (!days.has(dtKey)) { full=false; break; }
      }
      if (full) return true;
    }
    return false;
  }},
  { id: "twice_a_day",     icon: "🔁", name: "Twice a Day",    desc: "Dva treninga isti dan",                     check: d => {
    const cnt = {}; d.forEach(w=>{ cnt[w.date]=(cnt[w.date]||0)+1; });
    return Object.values(cnt).some(v=>v>=2);
  }},
  { id: "100_pushups_day", icon: "🫸", name: "100 Push-Ups",   desc: "100 sklekova u jednoj sesiji",              check: d => d.some(w => {
    const pu = ["push_up","sklekovi_siroki","sklekovi_uski","sklekovi_dijamant","sklekovi_archer","sklekovi_pike","sklekovi_decline","knee_pushup","explosive_pushup","pseudo_planche_pushup"];
    return pu.reduce((s,k)=>s+(w.exercises[k]?.total||0),0) >= 100;
  })},
  { id: "50_pullups_day",  icon: "🏗️", name: "50 Pull-Ups",   desc: "50 zgibova u jednoj sesiji",                check: d => d.some(w => {
    const pu = ["zgibovi_siroki","zgibovi_uski","chin_ups","neutral_grip_pullups","chest_to_bar","archer_pullup","explosive_pullup","lsit_pullup"];
    return pu.reduce((s,k)=>s+(w.exercises[k]?.total||0),0) >= 50;
  })},
  { id: "dead_hang_ach",   icon: "⏱️", name: "Dead Hang",      desc: "Uradi dead hang",                           check: d => d.some(w=>(w.exercises.dead_hang?.total||0)>0) },
];

export function checkAchievements(savedData, streak) {
  const unlocked = [];
  ACHIEVEMENTS.forEach(a => {
    try { if (a.check(savedData, streak)) unlocked.push(a.id); } catch {}
  });
  return unlocked;
}

export function loadUnlockedAchievements() {
  try { return JSON.parse(localStorage.getItem("fitpulse_achievements") || "[]"); } catch { return []; }
}
export function saveUnlockedAchievements(ids) {
  try { localStorage.setItem("fitpulse_achievements", JSON.stringify(ids)); } catch {}
}
