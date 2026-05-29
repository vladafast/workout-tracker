import React, { useId } from "react";
import { motion } from "framer-motion";

/**
 * BicepsProgress — FAZA 1 POLISH
 * - Tier-specific aura evolution (bigger glow at higher tiers)
 * - Animated gradient with shimmer
 * - Pulse ring effect
 * - Dynamic glow intensity based on progress
 */
export default function BicepsProgress({ progress = 0, tier, size = 100, animated = true }) {
  const p     = Math.max(0, Math.min(100, progress));
  const color = tier?.color || "#6366f1";
  const glow  = tier?.glow  || "rgba(99,102,241,0.4)";
  const uid   = useId().replace(/:/g, "");

  const clipId  = `bpclip_${uid}`;
  const gradId  = `bpgrad_${uid}`;
  const shimId  = `bpshim_${uid}`;
  const glowId  = `bpglow_${uid}`;
  const auraId  = `bpaura_${uid}`;

  const fillY = 64 - (p / 100) * 64;
  const wa = 2.2;
  const wavePath = `M-8,${fillY} Q4,${fillY - wa} 16,${fillY} Q28,${fillY + wa} 40,${fillY} Q52,${fillY - wa} 64,${fillY} Q76,${fillY + wa} 88,${fillY} L88,64 L-8,64 Z`;

  // Tier-based aura intensity
  const tierAura = {
    bronze:   { rings: 1, glowMult: 0.08, pulseAmp: 0.06 },
    silver:   { rings: 1, glowMult: 0.10, pulseAmp: 0.07 },
    gold:     { rings: 2, glowMult: 0.14, pulseAmp: 0.09 },
    platinum: { rings: 2, glowMult: 0.18, pulseAmp: 0.10 },
    diamond:  { rings: 3, glowMult: 0.22, pulseAmp: 0.12 },
    titanium: { rings: 3, glowMult: 0.28, pulseAmp: 0.15 },
  };
  const aura = tierAura[tier?.id] || tierAura.bronze;
  const glowPx = size * (aura.glowMult + (p / 100) * 0.08);

  const BICEP_PATH = "M61.88 45.061c-.073-.799-.143-1.552-.092-2.121c.451-5.027-1.014-9.559-4.236-13.103c-3.655-4.021-9.417-6.422-15.412-6.422c-8.348 0-15.345 4.374-18.718 11.701c-.008.019-.018.038-.025.057c-.775-2.853-1.557-4.833-2.183-6.42c-1.058-2.684-1.626-4.123-1.171-7.279a3.841 3.841 0 0 0 2.207-1.012c.105.007.214.012.324.012c1.135 0 2.119-.43 2.83-1.196l.088.001c1.413 0 2.616-.611 3.417-1.689c1.954-.164 3.304-1.342 3.571-3.157c.36-2.436-.492-9.254-2.333-11.4C29.417 2.18 28.611 2 28.065 2c-3.115 0-7.987.719-12.123 1.788C8.404 5.736 7.226 7.703 7.039 9.2c-.765 6.177-1.899 11.687-2.901 16.549c-1.42 6.888-2.541 12.329-1.999 16.607c.211 1.669.632 3.101 1.038 4.484c.508 1.726 1.031 3.511 1.208 5.952c.243 3.393 3.907 5.339 10.053 5.339c2.409 0 4.866-.314 6.882-.873C23.792 58.442 31.949 62 40.661 62c2.996 0 5.787-.428 8.299-1.272c12.853-4.326 13.43-10.112 12.92-15.667z";

  return (
    <div style={{ position: "relative", width: size, height: size + size * 0.12, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Aura rings — pulse outward */}
      {animated && Array.from({ length: aura.rings }).map((_, ri) => (
        <motion.div
          key={ri}
          animate={{
            scale: [1, 1 + aura.pulseAmp + ri * 0.04, 1],
            opacity: [0.22 - ri * 0.06, 0.08, 0.22 - ri * 0.06],
          }}
          transition={{
            duration: 2.4 + ri * 0.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: ri * 0.5,
          }}
          style={{
            position: "absolute",
            inset: -(ri * 6 + 4),
            borderRadius: "50%",
            background: `radial-gradient(circle, ${glow}, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      ))}

      <svg
        width={size}
        height={size}
        viewBox="0 0 64 70"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible", display: "block" }}
      >
        <defs>
          <clipPath id={clipId}>
            <path d={BICEP_PATH} />
          </clipPath>

          {/* Animated fill gradient */}
          <linearGradient id={gradId} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="1" />
            <stop offset="60%"  stopColor={color} stopOpacity="0.82" />
            <stop offset="100%" stopColor={color} stopOpacity="0.55" />
          </linearGradient>

          {/* Shimmer gradient */}
          <linearGradient id={shimId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="white" stopOpacity="0" />
            <stop offset="45%"  stopColor="white" stopOpacity="0.25" />
            <stop offset="55%"  stopColor="white" stopOpacity="0.22" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          {/* Glow filter */}
          <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Outer glow filter */}
          <filter id={auraId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 1  0 0 0 0.6 0" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ghost (dim background) */}
        <path d={BICEP_PATH} fill={color} opacity="0.10" />

        {/* Animated fill */}
        <g clipPath={`url(#${clipId})`}>
          <motion.rect
            x="-2" width="68"
            initial={{ y: 64, height: 0 }}
            animate={{ y: fillY, height: 64 - fillY + 2 }}
            transition={animated
              ? { type: "spring", stiffness: 48, damping: 14, delay: 0.12 }
              : { duration: 0 }}
            fill={`url(#${gradId})`}
          />

          {/* Wave */}
          {animated && p > 0 && (
            <motion.path
              d={wavePath}
              fill={color}
              fillOpacity="0.30"
              animate={{ x: [0, -16, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* Shimmer sweep */}
          {animated && p > 10 && (
            <motion.rect
              x="-8" y={fillY - 4} width="80" height={64 - fillY + 8}
              fill={`url(#${shimId})`}
              animate={{ x: [-70, 80] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
            />
          )}

          {/* Inner highlight */}
          <ellipse cx="27" cy={fillY + 5} rx="9" ry="3.5" fill="white" opacity="0.15" transform="rotate(-15 27 32)" />
        </g>

        {/* Crisp glowing outline */}
        <g filter={`url(#${glowId})`}>
          <path
            d={BICEP_PATH}
            fill="none"
            stroke={color}
            strokeWidth="1.8"
            strokeLinejoin="round"
            opacity="0.9"
          />
          {/* Muscle detail line */}
          <path
            d="M34.245 53.57c2.677.982 5.586 1.249 8.392.915c2.808-.34 5.556-1.257 7.95-2.803c1.188-.778 2.293-1.714 3.182-2.837c.869-1.127 1.573-2.429 1.736-3.81c-1.728 2.114-3.926 3.278-6.191 4.203c-2.277.9-4.672 1.461-7.086 1.75c-2.416.279-4.855.282-7.271-.093a21.33 21.33 0 0 1-7.174-2.484c1.364 2.402 3.804 4.179 6.462 5.159z"
            fill={color}
            opacity="0.55"
          />
        </g>

        {/* % label */}
        <text
          x="32" y="70"
          textAnchor="middle"
          fontFamily="'Syne', system-ui, sans-serif"
          fontWeight="800"
          fontSize="6.5"
          fill={color}
          opacity="0.80"
        >
          {p}%
        </text>
      </svg>
    </div>
  );
}
