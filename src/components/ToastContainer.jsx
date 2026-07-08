import { useEffect, useState } from "react";

const ICONS = {
  success: "bi-check-circle-fill",
  error:   "bi-x-circle-fill",
  warning: "bi-exclamation-triangle-fill",
  info:    "bi-info-circle-fill",
};

const COLORS = {
  success: { bg: "#e8f5e9", border: "#a5d6a7", text: "#1b5e20", icon: "#2e7d32" },
  error:   { bg: "#ffebee", border: "#ef9a9a", text: "#b71c1c", icon: "#c62828" },
  warning: { bg: "#fff8e1", border: "#ffe082", text: "#795548", icon: "#f57f17" },
  info:    { bg: "#e3f2fd", border: "#90caf9", text: "#0d47a1", icon: "#1565c0" },
};

function Toast({ msg, type, onDone }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setExiting(true), 2800);
    const r = setTimeout(() => onDone(), 3200);
    return () => { clearTimeout(t); clearTimeout(r); };
  }, [onDone]);

  const c = COLORS[type] || COLORS.success;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 16px",
      borderRadius: 10,
      backgroundColor: c.bg,
      border: `1.5px solid ${c.border}`,
      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      fontSize: 13,
      fontWeight: 600,
      color: c.text,
      minWidth: 240,
      maxWidth: 360,
      animation: exiting
        ? "rec-toast-out 0.35s ease-in forwards"
        : "rec-toast-in 0.35s ease-out",
      pointerEvents: "auto",
    }}>
      <i className={`bi ${ICONS[type] || ICONS.success}`} style={{ fontSize: 18, color: c.icon, flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={() => onDone()} style={{
        background: "none", border: "none", cursor: "pointer",
        fontSize: 16, color: c.text, opacity: 0.5, padding: 0, lineHeight: 1,
      }}><i className="bi bi-x" /></button>
    </div>
  );
}

export default function ToastContainer({ toasts, remove }) {
  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      pointerEvents: "none",
    }}>
      {toasts.map(t => (
        <Toast key={t.id} msg={t.msg} type={t.type} onDone={() => remove(t.id)} />
      ))}
    </div>
  );
}
