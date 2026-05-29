import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem("pwa_dismissed") === "1"
  );

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!dismissed) setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [dismissed]);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShow(false);
  };

  const dismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem("pwa_dismissed", "1");
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          style={{
            position: "fixed",
            bottom: `calc(80px + var(--safe-bottom) + 8px)`,
            left: 16,
            right: 16,
            zIndex: 600,
            background: "linear-gradient(135deg, #1e1b4b, #1a1a2e)",
            border: "1px solid rgba(99,102,241,0.4)",
            borderRadius: 20,
            padding: "16px 18px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)",
            display: "flex",
            gap: 14,
            alignItems: "center",
          }}
        >
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "linear-gradient(135deg, var(--indigo), #a855f7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            flexShrink: 0,
          }}>
            💪
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 14,
              color: "#e0e7ff",
              marginBottom: 2,
            }}>
              Instaliraj FitPulse
            </div>
            <div style={{ fontSize: 12, color: "rgba(165,180,252,0.6)" }}>
              Dodaj na početni ekran za brži pristup
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={install}
              style={{
                padding: "7px 14px",
                background: "var(--indigo)",
                border: "none",
                borderRadius: 10,
                color: "#fff",
                fontFamily: "var(--font-display)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Instaliraj
            </motion.button>
            <button
              onClick={dismiss}
              style={{
                padding: "5px 10px",
                background: "transparent",
                border: "none",
                color: "rgba(165,180,252,0.5)",
                fontSize: 11,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              Ne sad
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
