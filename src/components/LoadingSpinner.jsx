import { useState, useEffect } from "react";

export default function LoadingSpinner({ overlay = false, text = "Cargando...", size = "md" }) {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 400);
    return () => clearInterval(t);
  }, []);

  const sizeMap = { sm: 24, md: 40, lg: 64 };
  const px = sizeMap[size] || sizeMap.md;
  const borderW = Math.max(2, Math.round(px / 10));

  const spinner = (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{
        width: px, height: px,
        border: `${borderW}px solid #e8f5e9`,
        borderTopColor: "#2e7d32",
        borderRadius: "50%",
        animation: "rec-spin 0.7s linear infinite",
      }} />
      {text && (
        <span style={{
          fontSize: size === "sm" ? 12 : 14,
          fontWeight: 600,
          color: "#555",
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}>
          {text}{dots}
        </span>
      )}
    </div>
  );

  if (!overlay) return spinner;

  return (
    <div style={{
      position: "fixed", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.75)",
      zIndex: 9999,
      backdropFilter: "blur(2px)",
    }}>
      {spinner}
    </div>
  );
}
