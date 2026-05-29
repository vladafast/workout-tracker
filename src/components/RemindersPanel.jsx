import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadSettings, saveSettings, haptic, computeStreak } from "../utils/helpers";

export default function RemindersPanel({ savedData }) {
  const [settings, setSettings] = useState(() => loadSettings());
  const [notifStatus, setNotifStatus] = useState("default"); // default | granted | denied
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setNotifStatus(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setNotifStatus(perm);
    haptic([10, 30, 10]);
  };

  const updateSetting = (key, val) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    saveSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    haptic([5]);
  };

  const sendTestNotification = () => {
    if (notifStatus !== "granted") return;
    new Notification("FitPulse 💪", {
      body: "Vreme za trening! Pokreni se danas.",
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
    });
    haptic([20, 10, 20]);
  };

  const { atRisk, current } = computeStreak(savedData);

  return (
    <div style={{ padding: "0 16px 16px" }}>
      {/* Notification permission card */}
      <div style={{
        background: "var(--surface)",
        border: `1px solid ${notifStatus === "granted" ? "rgba(34,197,94,0.3)" : notifStatus === "denied" ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 24 }}>🔔</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Push notifikacije</div>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>
              {notifStatus === "granted" ? "✅ Aktivirane" : notifStatus === "denied" ? "❌ Blokirane u podešavanjima" : "Aktiviraj za podsetnik"}
            </div>
          </div>
        </div>

        {notifStatus !== "granted" && notifStatus !== "denied" && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={requestPermission}
            style={{
              width: "100%",
              padding: "11px",
              background: "var(--indigo)",
              border: "none",
              borderRadius: 12,
              color: "#fff",
              fontFamily: "var(--font-display)",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Aktiviraj notifikacije
          </motion.button>
        )}

        {notifStatus === "granted" && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={sendTestNotification}
            style={{
              width: "100%",
              padding: "10px",
              background: "rgba(34,197,94,0.15)",
              border: "1px solid rgba(34,197,94,0.3)",
              borderRadius: 12,
              color: "#86efac",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            🧪 Test notifikacija
          </motion.button>
        )}
      </div>

      {/* Training time */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 24 }}>⏰</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Vreme treninga</div>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>Dnevni podsetnik</div>
          </div>
        </div>

        <input
          type="time"
          value={settings.reminderTime || "18:00"}
          onChange={(e) => updateSetting("reminderTime", e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: "var(--bg)",
            border: "1px solid var(--border2)",
            borderRadius: 12,
            color: "var(--text)",
            fontSize: 20,
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            outline: "none",
            textAlign: "center",
            letterSpacing: 2,
          }}
        />

        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          {["06:00", "08:00", "12:00", "18:00", "20:00"].map(t => (
            <motion.button
              key={t}
              whileTap={{ scale: 0.9 }}
              onClick={() => updateSetting("reminderTime", t)}
              style={{
                flex: 1,
                padding: "7px 0",
                background: settings.reminderTime === t ? "var(--indigo-dim)" : "var(--surface2)",
                border: `1px solid ${settings.reminderTime === t ? "rgba(99,102,241,0.4)" : "transparent"}`,
                borderRadius: 8,
                color: settings.reminderTime === t ? "var(--indigo-light)" : "var(--text3)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              {t}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Streak warning toggle */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🔥</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Upozorenje za niz</div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>Obavesti kad je niz u opasnosti</div>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => updateSetting("streakWarning", !settings.streakWarning)}
            style={{
              width: 48,
              height: 28,
              borderRadius: 14,
              background: settings.streakWarning ? "var(--indigo)" : "var(--border2)",
              border: "none",
              cursor: "pointer",
              position: "relative",
              transition: "background 0.2s",
            }}
          >
            <motion.div
              animate={{ x: settings.streakWarning ? 20 : 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{
                position: "absolute",
                top: 2,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              }}
            />
          </motion.button>
        </div>
      </div>

      {/* Streak at risk banner */}
      <AnimatePresence>
        {atRisk && current > 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(245,158,11,0.1))",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 28 }}>⚠️</span>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#fca5a5", marginBottom: 4 }}>
                  Niz od {current} dana u opasnosti!
                </div>
                <div style={{ fontSize: 13, color: "rgba(252,165,165,0.7)" }}>
                  Moraš trenirati danas da sačuvaš niz. Sutra je kasno.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* In-app reminder info */}
      <div style={{
        background: "rgba(99,102,241,0.06)",
        border: "1px solid rgba(99,102,241,0.15)",
        borderRadius: 14,
        padding: 14,
      }}>
        <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.6 }}>
          💡 <strong style={{ color: "var(--text2)" }}>Napomena:</strong> Push notifikacije rade dok je browser otvoren. Za pouzdane podsetke, dodaj FitPulse na početni ekran (PWA).
        </div>
      </div>

      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 12,
              textAlign: "center",
              fontSize: 13,
              color: "#86efac",
              fontWeight: 600,
            }}
          >
            ✅ Podešavanja sačuvana
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
