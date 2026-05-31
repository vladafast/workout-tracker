export const MOTIVATIONAL = {
  sr: [
    "🔥 Zver si danas!",
    "⚡ Zaključan. Nema izgovora.",
    "💎 Konzistentnost je kralj.",
    "🚀 Jedan korak bliže.",
    "🦾 Pojavio si se. To je sve.",
    "🏆 Šampioni ovako treniraju.",
    "💪 Svaki rep se računa.",
    "⚡ Jači nego juče.",
    "🔱 Titan način razmišljanja.",
    "🌊 Nema oslonce. Samo napred.",
  ],
  en: [
    "🔥 Beasted it today!",
    "⚡ Locked in. No excuses.",
    "💎 Consistency is king.",
    "🚀 One step closer.",
    "🦾 You showed up. That's everything.",
    "🏆 Champions train like this.",
    "💪 Every rep counts.",
    "⚡ Stronger than yesterday.",
    "🔱 Titan mindset.",
    "🌊 No days off. Keep pushing.",
  ],
};

// ── Helpers ────────────────────────────────────────────────
export const parseNums = (text) =>
  (text || "").split(/[,\s]+/).map(Number).filter((n) => !isNaN(n) && n > 0);

export const calcTotal = (text) => parseNums(text).reduce((a, b) => a + b, 0);
export const calcAvg = (text) => {
  const nums = parseNums(text);
  if (!nums.length) return 0;
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
};

// ── Local date helper (avoids UTC offset bugs) ─────────────
export const localDateStr = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
export const todayStr = () => localDateStr();

export const formatDate = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("sr-Latn-RS", { weekday: "short", day: "numeric", month: "short" });
};

// ── Data persistence ───────────────────────────────────────
export const loadData = () => {
  try { return JSON.parse(localStorage.getItem("fitpulse_data") || "[]"); } catch { return []; }
};
export const saveData = (data) => {
  try { localStorage.setItem("fitpulse_data", JSON.stringify(data)); } catch {}
};

export const loadLang = () => {
  try { return localStorage.getItem("fitpulse_lang") || "sr"; } catch { return "sr"; }
};
export const saveLang = (l) => {
  try { localStorage.setItem("fitpulse_lang", l); } catch {}
};

// ── STREAK SYSTEM (FAZA 1) ─────────────────────────────────
export const computeStreak = (savedData) => {
  if (!savedData.length) return { current: 0, longest: 0, atRisk: false, comebackBonus: false };

  const workoutDays = new Set(savedData.map((w) => w.date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let runCount = 0;
  let missedInRow = 0;
  let d = new Date(today);

  for (let i = 0; i < 365; i++) {
    const key = localDateStr(d);
    if (workoutDays.has(key)) {
      runCount++;
      missedInRow = 0;
    } else {
      missedInRow++;
      if (missedInRow > 1) break;
    }
    d.setDate(d.getDate() - 1);
  }

  const current = runCount;

  // Longest streak — allows the same 1-day gap protection as the current streak counter
  const allDays = [...workoutDays].sort();
  let run = allDays.length > 0 ? 1 : 0;
  let longest = run;
  for (let i = 1; i < allDays.length; i++) {
    const prev = new Date(allDays[i - 1]);
    const curr = new Date(allDays[i]);
    const diff = (curr - prev) / 86400000;
    if (diff <= 2) { run++; longest = Math.max(longest, run); }
    else run = 1;
  }

  const todayKey = localDateStr(today);
  const yest = new Date(today);
  yest.setDate(yest.getDate() - 1);
  const yestKey = localDateStr(yest);
  const atRisk = current > 0 && !workoutDays.has(todayKey) && workoutDays.has(yestKey);

  // Comeback bonus: broke a streak of 3+ but trained today after missing yesterday
  const comebackBonus = (() => {
    if (!workoutDays.has(todayKey)) return false;
    const prev2 = new Date(today); prev2.setDate(today.getDate() - 2);
    return !workoutDays.has(yestKey) && workoutDays.has(localDateStr(prev2));
  })();

  return { current, longest, atRisk, comebackBonus };
};

// ── Streak milestones ──────────────────────────────────────
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 180, 365];

export const getStreakMilestone = (streak) => {
  return STREAK_MILESTONES.find(m => streak === m) || null;
};


// ── XP History tracking ────────────────────────────────────
export const loadXPHistory = () => {
  try { return JSON.parse(localStorage.getItem("fitpulse_xp_history") || "[]"); } catch { return []; }
};
export const saveXPHistory = (history) => {
  try { localStorage.setItem("fitpulse_xp_history", JSON.stringify(history.slice(-60))); } catch {}
};
export const appendXPHistory = (xpGained) => {
  const history = loadXPHistory();
  const today = todayStr();
  const last = history[history.length - 1];
  if (last && last.date === today) {
    last.xp += xpGained;
    history[history.length - 1] = last;
  } else {
    history.push({ date: today, xp: xpGained });
  }
  saveXPHistory(history);
  return history;
};

// ── Calendar ───────────────────────────────────────────────
export const getDaysInMonth = (year, month) => {
  const days = [];
  const firstDay = new Date(year, month, 1).getDay();
  const startPad = (firstDay + 6) % 7;
  for (let i = 0; i < startPad; i++) days.push(null);
  const total = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= total; d++) {
    days.push(localDateStr(new Date(year, month, d)));
  }
  return days;
};

// ── PR Detection ───────────────────────────────────────────
export const detectNewPRs = (newWorkout, savedData) => {
  const newPRs = [];
  Object.entries(newWorkout.exercises).forEach(([id, val]) => {
    const prevBest = savedData.reduce((best, w) => Math.max(best, w.exercises[id]?.total || 0), 0);
    if (val.total > prevBest) newPRs.push({ id, prev: prevBest, now: val.total });
  });
  return newPRs;
};

// ── Goals ──────────────────────────────────────────────────
export const loadGoals = () => {
  try { return JSON.parse(localStorage.getItem("fitpulse_goals") || "{}"); } catch { return {}; }
};
export const saveGoals = (g) => {
  try { localStorage.setItem("fitpulse_goals", JSON.stringify(g)); } catch {}
};

// ── Settings ───────────────────────────────────────────────
export const loadSettings = () => {
  try { return JSON.parse(localStorage.getItem("fitpulse_settings") || "{}"); } catch { return {}; }
};
export const saveSettings = (s) => {
  try { localStorage.setItem("fitpulse_settings", JSON.stringify(s)); } catch {}
};

// ── Recent exercises ───────────────────────────────────────
export const loadRecentExercises = () => {
  try { return JSON.parse(localStorage.getItem("fitpulse_recent") || "[]"); } catch { return []; }
};
export const saveRecentExercises = (ids) => {
  try { localStorage.setItem("fitpulse_recent", JSON.stringify(ids.slice(0, 10))); } catch {}
};

// ── Vibration ──────────────────────────────────────────────
export const haptic = (pattern = [10]) => {
  try {
    const hapticsOn = JSON.parse(localStorage.getItem("fitpulse_haptics") ?? "true");
    if (hapticsOn) navigator.vibrate?.(pattern);
  } catch {}
};
