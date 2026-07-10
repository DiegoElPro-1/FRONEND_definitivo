// src/paneles/encargado/encargadoTheme.js
// Tema global para todos los componentes del panel encargado
// Colores: blanco, verde, negro — estilo app de reciclaje

// ── COLORES ──────────────────────────────────────────────
export const C = {
  verde:        "#5fa862",
  verdeClaro:   "#f0f8f1",
  verdeMedio:   "#b8e0ba",
  verdeBorde:   "#e2f2e3",
  verdeHover:   "#f5fbf3",
  verdeOscuro:  "#3a7d3e",
  verde2:       "#6da870",
  blanco:       "#ffffff",
  negro:        "#1a1a1a",
  grisTexto:    "#555555",
  grisFondo:    "#fafafa",
  grisBorde:    "#eeeeee",
  rojo:         "#c62828",
  rojoclaro:    "#ffebee",
  rojoBorde:    "#f3c4c4",
  amarillo:     "#ddc06a",
  amarilloClaro:"#fffbd4",
};

// ── ESTILOS BASE ─────────────────────────────────────────
export const S = {
  // Cards
  card: {
    background: "#fff",
    border: `1.5px solid ${C.grisBorde}`,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  cardBody: {
    padding: "16px 20px",
  },

  // Botón primario verde
  btnPrimario: {
    backgroundColor: C.verde,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    padding: "10px 20px",
    cursor: "pointer",
  },

  // Botón secundario borde verde
  btnSecundario: {
    backgroundColor: "#fff",
    color: C.verde,
    border: `1.5px solid ${C.grisBorde}`,
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    padding: "10px 20px",
    cursor: "pointer",
  },

  // Botón peligro
  btnPeligro: {
    backgroundColor: C.rojo,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    padding: "10px 20px",
    cursor: "pointer",
  },

  // Input
  input: {
    border: `1.5px solid ${C.grisBorde}`,
    borderRadius: 8,
    fontSize: 14,
  },

  // Título de sección
  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: C.negro,
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  // Badge puntos
  badgePuntos: {
    fontSize: 12,
    fontWeight: 700,
    backgroundColor: C.verdeClaro,
    color: C.verde,
    border: `1px solid ${C.verdeMedio}`,
    borderRadius: 6,
    padding: "3px 10px",
  },

  // Badge código
  badgeCodigo: {
    fontSize: 12,
    fontWeight: 700,
    backgroundColor: "#f9f9f9",
    border: `1px solid ${C.grisBorde}`,
    borderRadius: 6,
    padding: "3px 10px",
    letterSpacing: 1,
  },

  // Fila de tabla header
  tableHead: {
    backgroundColor: C.verdeClaro,
  },
  tableHeadTh: {
    fontWeight: 700,
    color: C.verdeOscuro,
    fontSize: 14,
  },
  tableRow: {
    borderColor: C.grisBorde,
  },

  // Alerta error
  alertaError: {
    backgroundColor: C.rojoclaro,
    border: `1.5px solid ${C.rojoBorde}`,
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    color: C.rojo,
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  // Caja de total / resumen
  cajaTotalVerde: {
    backgroundColor: C.verdeClaro,
    border: `1px solid ${C.verdeMedio}`,
    borderRadius: 8,
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },

  // Stat box (puntos disponibles / a descontar)
  statBox: {
    border: `1.5px solid ${C.grisBorde}`,
    borderRadius: 8,
    padding: 12,
    textAlign: "center",
    backgroundColor: "#fff",
  },
  statBoxActivo: {
    border: `1.5px solid ${C.verdeMedio}`,
    borderRadius: 8,
    padding: 12,
    textAlign: "center",
    backgroundColor: C.verdeClaro,
  },

  // Chip usuario seleccionado
  chipUsuario: {
    backgroundColor: C.verdeHover,
    border: `1.5px solid ${C.verdeMedio}`,
    borderRadius: 10,
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
  },

  // Modal
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0,
    width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  modalBox: {
    background: "#fff",
    borderRadius: 12,
    padding: 24,
    textAlign: "center",
    maxWidth: 320,
    width: "90%",
    border: `1.5px solid ${C.grisBorde}`,
  },

  // Pestañas
  tabActivo: {
    fontSize: 14,
    border: `1.5px solid ${C.verdeMedio}`,
    borderRadius: 8,
    backgroundColor: C.verdeClaro,
    color: C.verdeOscuro,
    fontWeight: 700,
  },
  tabInactivo: {
    fontSize: 14,
    border: `1.5px solid ${C.grisBorde}`,
    borderRadius: 8,
    backgroundColor: "#fff",
    color: C.grisTexto,
    fontWeight: 700,
  },

  // Sidebar item activo
  sidebarActivo: {
    backgroundColor: C.verde,
    color: "#fff",
    borderRadius: 8,
    fontWeight: 700,
  },
  sidebarInactivo: {
    color: C.negro,
    borderRadius: 8,
  },

  // StatCard (dashboard)
  statCard: {
    background: "#fff",
    border: `1.5px solid ${C.grisBorde}`,
    borderRadius: 12,
    padding: "18px 22px",
  },
  statCardNumero: {
    fontSize: 28,
    fontWeight: 700,
    color: C.negro,
  },
  statCardLabel: {
    fontSize: 14,
    color: C.grisTexto,
  },
  statCardTendencia: {
    fontSize: 13,
    color: C.verde,
    fontWeight: 600,
  },
};

// ── COMPONENTES REUTILIZABLES ─────────────────────────────

// Avatar con iniciales
export function Av({ text, size = 38 }) {
  return (
    <div
      className="d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0"
      style={{
        width: size, height: size,
        backgroundColor: C.verdeClaro,
        color: C.verdeOscuro,
        fontSize: size * 0.38,
        border: `2px solid ${C.verdeMedio}`,
      }}
    >
      {text}
    </div>
  );
}

// Badge de estado de canje
export function BadgeCanje({ estado }) {
  const map = {
    Canjeado:  { bg: C.verdeClaro,    text: C.verdeOscuro, icon: "bi-check-circle-fill" },
    canjeado:  { bg: C.verdeClaro,    text: C.verdeOscuro, icon: "bi-check-circle-fill" },
    Pendiente: { bg: C.amarilloClaro, text: "#795548",      icon: "bi-clock-fill"        },
    pendiente: { bg: C.amarilloClaro, text: "#795548",      icon: "bi-clock-fill"        },
    Vencido:   { bg: C.rojoclaro,     text: C.rojo,        icon: "bi-x-circle-fill"     },
    vencido:   { bg: C.rojoclaro,     text: C.rojo,        icon: "bi-x-circle-fill"     },
  };
  const s = map[estado] || map.Pendiente;
  return (
    <span
      className="badge d-inline-flex align-items-center gap-1 fw-bold"
      style={{ backgroundColor: s.bg, color: s.text, fontSize: 12, border: `1px solid ${s.text}44` }}
    >
      <i className={`bi ${s.icon}`} /> {estado}
    </span>
  );
}

// Badge de estado de cita (aceptada / rechazada / pendiente)
export function BadgeCita({ estado }) {
  const map = {
    Pendiente: { bg: C.amarilloClaro, color: "#795548", border: C.amarillo,  icon: "bi-clock-fill"        },
    Aceptada:  { bg: C.verdeClaro,    color: C.verdeOscuro, border: C.verde, icon: "bi-check-circle-fill" },
    Rechazada: { bg: C.rojoclaro,     color: C.rojo,    border: C.rojo,      icon: "bi-x-circle-fill"     },
  };
  const s = map[estado] || map.Pendiente;
  return (
    <span
      className="fw-bold rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1"
      style={{ fontSize: 11, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      <i className={`bi ${s.icon}`} style={{ fontSize: 10 }} />
      {estado}
    </span>
  );
}

// Badge de estado de entrega
export function BadgeEntrega({ estado }) {
  const map = {
    Completada: { bg: C.verdeClaro,    text: C.verdeOscuro, icon: "bi-check-circle-fill" },
    completada: { bg: C.verdeClaro,    text: C.verdeOscuro, icon: "bi-check-circle-fill" },
    Pendiente:  { bg: C.amarilloClaro, text: "#795548",      icon: "bi-clock-fill"        },
    pendiente:  { bg: C.amarilloClaro, text: "#795548",      icon: "bi-clock-fill"        },
    Rechazada:  { bg: C.rojoclaro,     text: C.rojo,        icon: "bi-x-circle-fill"     },
    rechazada:  { bg: C.rojoclaro,     text: C.rojo,        icon: "bi-x-circle-fill"     },
  };
  const s = map[estado] || map.Pendiente;
  return (
    <span
      className="badge d-inline-flex align-items-center gap-1 fw-bold"
      style={{ backgroundColor: s.bg, color: s.text, fontSize: 12, border: `1px solid ${s.text}44` }}
    >
      <i className={`bi ${s.icon}`} /> {estado}
    </span>
  );
}

// Título de sección con ícono
export function SectionTitle({ icon, children }) {
  return (
    <div className="fw-bold text-dark mb-2" style={S.sectionTitle}>
      <i className={`bi ${icon}`} style={{ color: C.verde }} />
      {children}
    </div>
  );
}

// StatCard para dashboard
export function StatCard({ icon, label, valor, tendencia, colorIcono = C.verde, sub }) {
  return (
    <div style={S.statCard}>
      <div className="d-flex align-items-center gap-2 mb-1">
        <div className="rounded-2 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, backgroundColor: C.verdeClaro }}>
          <i className={`bi ${icon}`} style={{ fontSize: 16, color: colorIcono }} />
        </div>
        <span style={S.statCardLabel}>{label}</span>
      </div>
      <div style={S.statCardNumero}>{valor}</div>
      {tendencia && (
        <div style={S.statCardTendencia} className="mt-1">
          <i className="bi bi-arrow-up me-1" />{tendencia}
        </div>
      )}
      {sub && (
        <div style={{ fontSize: 12, color: C.grisTexto, marginTop: 2 }}>{sub}</div>
      )}
    </div>
  );
}

// Funciones utilitarias
export function getIniciales(nombre = "") {
  return nombre.split(" ").slice(0, 2).map(p => p[0]?.toUpperCase()).join("");
}

export function capitalizar(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function getPtsRecompensa(r) {
  return r?.puntosRequeridos ?? r?.puntosNecesarios ?? r?.pts ?? 0;
}

export function getPtsUsuario(u) {
  return u?.puntosDisponibles ?? u?.puntos ?? u?.pts ?? 0;
}

export function generarCodigo() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return "ECO-" + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}