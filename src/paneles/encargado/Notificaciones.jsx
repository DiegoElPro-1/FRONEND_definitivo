import { useState, useRef, useEffect } from "react";

const USUARIOS_SESION = [
  { av: "AL", bg: "#d1f0e0", txt: "#0d6e3f", nombre: "Andrés López",      hora: "Hace 2 min",  nueva: true  },
  { av: "CM", bg: "#d1f0e0", txt: "#0d6e3f", nombre: "Carolina Mejía",     hora: "Hace 5 min",  nueva: true  },
  { av: "JP", bg: "#e8e8e8", txt: "#222",    nombre: "Juan Pablo Ruiz",    hora: "Hace 12 min", nueva: true  },
  { av: "VT", bg: "#e8e8e8", txt: "#222",    nombre: "Valentina Torres",   hora: "Hace 18 min", nueva: false },
  { av: "SR", bg: "#e8e8e8", txt: "#222",    nombre: "Santiago Rodríguez", hora: "Hace 25 min", nueva: false },
  { av: "LD", bg: "#e8e8e8", txt: "#222",    nombre: "Laura Díaz",         hora: "Hace 31 min", nueva: false },
  { av: "MH", bg: "#e8e8e8", txt: "#222",    nombre: "Miguel Hernández",   hora: "Hace 40 min", nueva: false },
  { av: "IS", bg: "#e8e8e8", txt: "#222",    nombre: "Isabella Sánchez",   hora: "Hace 52 min", nueva: false },
  { av: "CF", bg: "#e8e8e8", txt: "#222",    nombre: "Camilo Flores",      hora: "Hace 1 h",    nueva: false },
  { av: "NS", bg: "#e8e8e8", txt: "#222",    nombre: "Natalia Suárez",     hora: "Hace 1 h",    nueva: false },
];

const CITAS_INIT = [
  { av: "AL", bg: "#d1f0e0", txt: "#0d6e3f", nombre: "Andrés",     apellido: "López",     fecha: "hoy a las 10:00 am",    material: "Plástico", estado: "pendiente",  nueva: true  },
  { av: "CM", bg: "#d1f0e0", txt: "#0d6e3f", nombre: "Carolina",   apellido: "Mejía",     fecha: "hoy a las 11:30 am",    material: "Cartón",   estado: "confirmada", nueva: true  },
  { av: "JP", bg: "#e8e8e8", txt: "#222",    nombre: "Juan Pablo", apellido: "Ruiz",      fecha: "hoy a las 2:00 pm",     material: "Vidrio",   estado: "pendiente",  nueva: false },
  { av: "VT", bg: "#e8e8e8", txt: "#222",    nombre: "Valentina",  apellido: "Torres",    fecha: "mañana a las 9:00 am",  material: "Plástico", estado: "confirmada", nueva: false },
  { av: "SR", bg: "#e8e8e8", txt: "#222",    nombre: "Santiago",   apellido: "Rodríguez", fecha: "mañana a las 3:00 pm",  material: "Metal",    estado: "cancelada",  nueva: false },
  { av: "LD", bg: "#e8e8e8", txt: "#222",    nombre: "Laura",      apellido: "Díaz",      fecha: "22 may a las 10:00 am", material: "Cartón",   estado: "pendiente",  nueva: false },
];

const NUEVAS_SESIONES = 3;
const NUEVAS_CITAS    = 2;

const ESTADO_ESTILO = {
  pendiente:  { bg: "#fff8e1", color: "#b45309", label: "Pendiente"  },
  confirmada: { bg: "#d1f0e0", color: "#198754", label: "Confirmada" },
  cancelada:  { bg: "#e8e8e8", color: "#555",    label: "Cancelada"  },
};

const MATERIAL_ICON = {
  Plástico: "bi-cup-straw",
  Cartón:   "bi-box-seam",
  Vidrio:   "bi-gem",
  Metal:    "bi-wrench",
};

// ── Avatar ────────────────────────────────────────────────
function Avatar({ av, bg, txt, size = 34 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, color: txt,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size > 32 ? 11 : 10, fontWeight: 700, flexShrink: 0,
    }}>
      {av}
    </div>
  );
}

// ── Fila de sesión ────────────────────────────────────────
function SesionItem({ u, i, isModal = false }) {
  const esNueva = i < NUEVAS_SESIONES;
  return (
    <div
      className={`d-flex align-items-start gap-2 px-3 py-2 ${esNueva ? "nueva-notif" : ""}`}
      style={{ borderBottom: "1px solid #f0f0f0", background: esNueva ? "#f0faf4" : "#fff" }}
    >
      <Avatar av={u.av} bg={u.bg} txt={u.txt} size={isModal ? 30 : 34} />
      <div className="flex-grow-1">
        <div className="d-flex justify-content-between align-items-center">
          <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{u.nombre}</span>
          <span style={{ fontSize: 11, color: "#888" }}>{u.hora}</span>
        </div>
        <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
          <i className="bi bi-box-arrow-in-right me-1" />
          Inició sesión
        </div>
      </div>
      {esNueva && (
        <div style={{ width: 7, height: 7, background: "#198754", borderRadius: "50%", marginTop: 6, flexShrink: 0 }} />
      )}
    </div>
  );
}

// ── Fila de cita ──────────────────────────────────────────
function CitaItem({ c, i, isModal = false, onCambiarEstado }) {
  const est = ESTADO_ESTILO[c.estado];
  const esNueva = i < NUEVAS_CITAS;
  const icon = MATERIAL_ICON[c.material] || "bi-recycle";
  const ml = isModal ? 42 : 44;

  return (
    <div style={{
      borderBottom: "1px solid #f0f0f0",
      padding: isModal ? "10px 20px" : "10px 16px",
      background: esNueva && !isModal ? "#f0faf4" : "#fff",
    }}>
      {/* Encabezado */}
      <div className="d-flex align-items-center gap-2">
        <Avatar av={c.av} bg={c.bg} txt={c.txt} size={isModal ? 30 : 34} />
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-center">
            <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>
              {c.nombre} {c.apellido}
            </span>
            <span style={{
              fontSize: 10, background: est.bg, color: est.color,
              padding: "2px 8px", borderRadius: 6, fontWeight: 700,
            }}>
              {est.label}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 3, display: "flex", gap: 12 }}>
            <span><i className="bi bi-clock me-1" />{c.fecha}</span>
            <span><i className={`bi ${icon} me-1`} />{c.material}</span>
          </div>
        </div>
      </div>

      {/* Solicitud + acciones (solo pendientes) */}
      {c.estado === "pendiente" && (
        <div style={{
          marginTop: 8,
          marginLeft: ml,
          background: "#f8f8f8",
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          padding: "10px 12px",
        }}>
          <p style={{ fontSize: 12, color: "#111", margin: "0 0 8px 0", lineHeight: 1.5 }}>
            <strong>{c.nombre}</strong> quiere agendar una cita para{" "}
            <strong>{c.fecha}</strong> — material:{" "}
            <span style={{ color: "#198754", fontWeight: 600 }}>{c.material}</span>.
          </p>
          <div className="d-flex gap-2">
            <button
              onClick={() => onCambiarEstado(i, "confirmada")}
              style={{
                fontSize: 11, padding: "4px 12px", borderRadius: 6, cursor: "pointer",
                background: "#d1f0e0", color: "#198754",
                border: "1px solid #198754", fontWeight: 700,
              }}
            >
              <i className="bi bi-check-lg me-1" />Aceptar
            </button>
            <button
              onClick={() => onCambiarEstado(i, "cancelada")}
              style={{
                fontSize: 11, padding: "4px 12px", borderRadius: 6, cursor: "pointer",
                background: "#fff", color: "#111",
                border: "1px solid #111", fontWeight: 700,
              }}
            >
              <i className="bi bi-x-lg me-1" />Rechazar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────
export default function Notificaciones() {
  const [abierto,  setAbierto]  = useState(false);
  const [pestaña,  setPestaña]  = useState("sesiones");
  const [verTodas, setVerTodas] = useState(false);
  const [modal,    setModal]    = useState(false);
  const [citas,    setCitas]    = useState(CITAS_INIT);
  const notifRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setAbierto(false);
        setVerTodas(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const cambiarEstado = (i, nuevoEstado) => {
    setCitas(prev => prev.map((c, idx) => idx === i ? { ...c, estado: nuevoEstado } : c));
  };

  const sesionesVis = verTodas ? USUARIOS_SESION : USUARIOS_SESION.slice(0, 5);
  const citasVis    = verTodas ? citas : citas.slice(0, 4);

  return (
    <>
      <div ref={notifRef} style={{ position: "relative" }}>

        {/* ── Botón campana ── */}
        <button
          onClick={() => { setAbierto(v => !v); setVerTodas(false); }}
          className="btn btn-dark d-flex align-items-center justify-content-center p-0"
          style={{ width: 40, height: 40, borderRadius: 8, position: "relative", border: "2px solid #111" }}
          aria-label="Notificaciones"
        >
          <i className="bi bi-bell-fill" style={{ fontSize: 16 }} />
          <span style={{
            position: "absolute", top: 6, right: 7,
            width: 8, height: 8, background: "#198754",
            borderRadius: "50%", border: "2px solid #fff",
          }} />
        </button>

        {/* ── Panel desplegable ── */}
        {abierto && (
          <div style={{
            position: "absolute", top: 48, right: 0,
            width: 370, background: "#fff",
            border: "1px solid #222", borderRadius: 12,
            boxShadow: "0 6px 24px rgba(0,0,0,0.13)",
            zIndex: 9999, overflow: "hidden",
          }}>

            {/* Cabecera */}
            <div className="d-flex align-items-center justify-content-between px-3 py-2"
              style={{ borderBottom: "1px solid #e0e0e0" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Notificaciones</span>
              <div className="d-flex gap-2">
                <span style={{
                  fontSize: 11, background: "#d1f0e0", color: "#198754",
                  padding: "3px 8px", borderRadius: 8, fontWeight: 600,
                }}>
                  {NUEVAS_SESIONES} sesiones
                </span>
                <span style={{
                  fontSize: 11, background: "#e8e8e8", color: "#222",
                  padding: "3px 8px", borderRadius: 8, fontWeight: 600,
                }}>
                  {NUEVAS_CITAS} citas
                </span>
              </div>
            </div>

            {/* Pestañas */}
            <div className="d-flex" style={{ borderBottom: "1px solid #e0e0e0" }}>
              {[
                { key: "sesiones", label: "Sesiones",        icon: "bi-person-check-fill"   },
                { key: "citas",    label: "Citas agendadas", icon: "bi-calendar-check-fill" },
              ].map(p => (
                <button
                  key={p.key}
                  onClick={() => { setPestaña(p.key); setVerTodas(false); }}
                  style={{
                    flex: 1, border: "none", cursor: "pointer",
                    padding: "10px 0", fontSize: 12, fontWeight: 600,
                    background: pestaña === p.key ? "#fff" : "#f8f8f8",
                    borderBottom: pestaña === p.key ? "2px solid #198754" : "2px solid transparent",
                    color: pestaña === p.key ? "#198754" : "#888",
                    transition: "all .15s",
                  }}
                >
                  <i className={`bi ${p.icon} me-1`} />
                  {p.label}
                </button>
              ))}
            </div>

            {/* Contenido */}
            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              {pestaña === "sesiones" && sesionesVis.map((u, i) => (
                <SesionItem key={i} u={u} i={i} />
              ))}
              {pestaña === "citas" && citasVis.map((c, i) => (
                <CitaItem key={i} c={c} i={i} onCambiarEstado={cambiarEstado} />
              ))}
            </div>

            {/* Footer */}
            <div className="d-flex justify-content-between align-items-center px-3 py-2"
              style={{ borderTop: "1px solid #e0e0e0" }}>
              <button
                onClick={() => setVerTodas(v => !v)}
                style={{
                  background: "none", border: "none",
                  fontSize: 12, color: "#198754", fontWeight: 600, cursor: "pointer",
                }}
              >
                {verTodas ? "← Mostrar menos" : "Ver todas →"}
              </button>
              <button
                onClick={() => { setAbierto(false); setModal(true); }}
                style={{
                  background: "#111", border: "none", color: "#fff",
                  fontSize: 12, fontWeight: 600,
                  padding: "5px 14px", borderRadius: 8, cursor: "pointer",
                }}
              >
                <i className="bi bi-arrows-fullscreen me-1" />
                Ver completo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal vista completa ── */}
      {modal && (
        <div
          onClick={() => setModal(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 99999,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 14,
              width: "90%", maxWidth: 820,
              maxHeight: "85vh", overflow: "hidden",
              display: "flex", flexDirection: "column",
              border: "1px solid #222",
            }}
          >
            {/* Header modal */}
            <div className="d-flex align-items-center justify-content-between px-4 py-3"
              style={{ borderBottom: "1px solid #e0e0e0" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>
                Centro de notificaciones
              </span>
              <button
                onClick={() => setModal(false)}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#555" }}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {/* Dos columnas */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", overflowY: "auto", flex: 1 }}>

              {/* Sesiones */}
              <div style={{ borderRight: "1px solid #e0e0e0" }}>
                <div className="px-3 py-2" style={{ borderBottom: "1px solid #e0e0e0", background: "#f8f8f8" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#198754" }}>
                    <i className="bi bi-person-check-fill me-2" />
                    Sesiones iniciadas
                  </span>
                </div>
                {USUARIOS_SESION.map((u, i) => (
                  <SesionItem key={i} u={u} i={i} isModal />
                ))}
              </div>

              {/* Citas */}
              <div>
                <div className="px-3 py-2" style={{ borderBottom: "1px solid #e0e0e0", background: "#f8f8f8" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>
                    <i className="bi bi-calendar-check-fill me-2" />
                    Citas agendadas
                  </span>
                </div>
                {citas.map((c, i) => (
                  <CitaItem key={i} c={c} i={i} isModal onCambiarEstado={cambiarEstado} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}