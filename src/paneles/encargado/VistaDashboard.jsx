// src/components/VistaDashboard.jsx
import { useState } from "react";
import Av from "./Av";

// ── Materiales disponibles ────────────────────────────────────────────────────
const MATERIALES = [
  { idMaterial: 1, nombre: "Plástico",  descripcion: "Botellas y envases plásticos",   puntosPorKg: 30 },
  { idMaterial: 2, nombre: "Papel",     descripcion: "Papel y periódico",               puntosPorKg: 15 },
  { idMaterial: 3, nombre: "Cartón",    descripcion: "Cajas y cartón corrugado",         puntosPorKg: 20 },
  { idMaterial: 4, nombre: "Vidrio",    descripcion: "Botellas y frascos de vidrio",     puntosPorKg: 25 },
];

// ── Datos iniciales de citas ──────────────────────────────────────────────────
const CITAS_INICIALES = {
  "2026-05-05": [
    { id: 1, nombre: "Diego Tamayo",     av: "DT", materiales: [1, 3], estado: "Aceptada",  nota: "" },
    { id: 2, nombre: "Carlos Jaramillo", av: "CJ", materiales: [1],    estado: "Pendiente", nota: "" },
    { id: 3, nombre: "Elena Santacruz",  av: "ES", materiales: [2, 4], estado: "Rechazada", nota: "Día completo" },
  ],
  "2026-05-14": [
    { id: 4, nombre: "Luisa Perdomo",    av: "LP", materiales: [4],    estado: "Pendiente", nota: "" },
    { id: 5, nombre: "Andrés Torres",    av: "AT", materiales: [3, 1], estado: "Aceptada",  nota: "" },
  ],
  "2026-05-22": [
    { id: 6, nombre: "Sofía Muñoz",      av: "SM", materiales: [2],    estado: "Pendiente", nota: "" },
    { id: 7, nombre: "Diego Tamayo",     av: "DT", materiales: [1, 2], estado: "Pendiente", nota: "" },
  ],
};

const ENCARGADO = { nombre: "María López", punto: "Punto Verde Centro", av: "ML" };

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

// ── Badge estado ──────────────────────────────────────────────────────────────
function BadgeEstado({ estado }) {
  const map = {
    Pendiente: { bg: "#fff3cd", color: "#856404", border: "#ffc107" },
    Aceptada:  { bg: "#d1e7dd", color: "#0f5132", border: "#198754" },
    Rechazada: { bg: "#f8d7da", color: "#842029", border: "#dc3545" },
  };
  const s = map[estado] || map.Pendiente;
  return (
    <span
      className="fw-bold rounded-pill px-2 py-0"
      style={{ fontSize: 10, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {estado}
    </span>
  );
}

// ── Material chip ─────────────────────────────────────────────────────────────
function ChipMaterial({ nombre }) {
  const colores = {
    Plástico: { bg: "#d1e7dd", color: "#0f5132" },
    Papel:    { bg: "#fff3cd", color: "#856404" },
    Cartón:   { bg: "#e2e3e5", color: "#41464b" },
    Vidrio:   { bg: "#212529", color: "#ffc107" },
  };
  const c = colores[nombre] || { bg: "#e2e3e5", color: "#41464b" };
  return (
    <span
      className="rounded-pill px-2 fw-bold me-1"
      style={{ fontSize: 10, background: c.bg, color: c.color, display: "inline-block", marginBottom: 2 }}
    >
      {nombre}
    </span>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function VistaDashboard() {
  const today = new Date();

  const [year,        setYear]        = useState(today.getFullYear());
  const [month,       setMonth]       = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [citas,       setCitas]       = useState(CITAS_INICIALES);

  // panel derecho: "lista" | "detalle" | "rechazar"
  const [panel,       setPanel]       = useState("lista");
  const [citaActiva,  setCitaActiva]  = useState(null);
  const [notaRechazo, setNotaRechazo] = useState("");

  // ── Calendario helpers ────────────────────────────────────────────────────
  const primerDia   = new Date(year, month, 1).getDay();
  const diasEnMes   = new Date(year, month + 1, 0).getDate();

  const toKey = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const conteo = (d) => {
    const k = toKey(year, month, d);
    return citas[k]?.length || 0;
  };

  const pendientes = (d) => {
    const k = toKey(year, month, d);
    return citas[k]?.filter(c => c.estado === "Pendiente").length || 0;
  };

  const esHoy = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const prevMes = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null); setPanel("lista"); setCitaActiva(null);
  };

  const nextMes = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null); setPanel("lista"); setCitaActiva(null);
  };

  const selectDia = (d) => {
    setSelectedDay(d);
    setPanel("lista");
    setCitaActiva(null);
    setNotaRechazo("");
  };

  // ── Handlers citas ────────────────────────────────────────────────────────
  const keyActivo = selectedDay ? toKey(year, month, selectedDay) : null;
  const citasDelDia = keyActivo ? (citas[keyActivo] || []) : [];

  const handleAceptar = (cita) => {
    setCitas(prev => {
      const copia = { ...prev };
      copia[keyActivo] = copia[keyActivo].map(c =>
        c.id === cita.id ? { ...c, estado: "Aceptada", nota: "" } : c
      );
      return copia;
    });
    setCitaActiva(c => ({ ...c, estado: "Aceptada" }));
  };

  const handleRechazar = () => {
    setCitas(prev => {
      const copia = { ...prev };
      copia[keyActivo] = copia[keyActivo].map(c =>
        c.id === citaActiva.id ? { ...c, estado: "Rechazada", nota: notaRechazo } : c
      );
      return copia;
    });
    setCitaActiva(c => ({ ...c, estado: "Rechazada", nota: notaRechazo }));
    setPanel("detalle");
    setNotaRechazo("");
  };

  const nombreMateriales = (ids) =>
    ids.map(id => MATERIALES.find(m => m.idMaterial === id)?.nombre).filter(Boolean);

  // ── Render celda calendario ───────────────────────────────────────────────
  const celdas = [];
  for (let i = 0; i < primerDia; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div>

      {/* Bienvenida */}
      <div
        className="card border border-2 border-dark rounded-3 shadow-sm mb-4 px-4 py-3 d-flex flex-row align-items-center justify-content-between"
        style={{ background: "#fff" }}
      >
        <div className="d-flex align-items-center gap-3">
          <Av text={ENCARGADO.av} size={52} bg="#ffc107" color="#000" />
          <div>
            <div className="fw-black text-dark" style={{ fontSize: 17 }}>
              Bienvenido, {ENCARGADO.nombre} 👋
            </div>
            <div className="text-secondary fw-semibold" style={{ fontSize: 12 }}>
              {ENCARGADO.punto} · Encargado de punto
            </div>
          </div>
        </div>
        <div className="d-flex gap-2">
          <span className="badge border border-2 border-dark text-dark fw-bold px-3 py-2" style={{ background: "#ffc107", fontSize: 12 }}>
            <i className="bi bi-calendar-check me-1" />
            {Object.values(citas).flat().filter(c => c.estado === "Pendiente").length} citas pendientes
          </span>
        </div>
      </div>

      {/* Calendario + Panel */}
      <div className="row g-3">

        {/* ── Calendario ── */}
        <div className="col-md-6">
          <div className="card border border-2 border-dark rounded-3 shadow-sm h-100" style={{ background: "#fff" }}>
            <div className="card-body p-3">

              {/* Header mes */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <button
                  className="btn btn-dark btn-sm fw-bold"
                  style={{ width: 32, height: 32, padding: 0, fontSize: 16 }}
                  onClick={prevMes}
                >
                  <i className="bi bi-chevron-left" />
                </button>
                <div className="fw-black text-dark text-center" style={{ fontSize: 15 }}>
                  {MESES[month]} {year}
                </div>
                <button
                  className="btn btn-dark btn-sm fw-bold"
                  style={{ width: 32, height: 32, padding: 0, fontSize: 16 }}
                  onClick={nextMes}
                >
                  <i className="bi bi-chevron-right" />
                </button>
              </div>

              {/* Días semana */}
              <div className="d-grid mb-1" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                {DIAS_SEMANA.map(d => (
                  <div key={d} className="text-center fw-black text-secondary" style={{ fontSize: 10, paddingBottom: 4 }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Celdas */}
              <div className="d-grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
                {celdas.map((d, i) => {
                  if (!d) return <div key={`e-${i}`} />;
                  const cnt  = conteo(d);
                  const pend = pendientes(d);
                  const sel  = selectedDay === d;
                  const hoy  = esHoy(d);

                  return (
                    <button
                      key={d}
                      onClick={() => selectDia(d)}
                      className="border-0 rounded-2 d-flex flex-column align-items-center justify-content-center position-relative fw-bold"
                      style={{
                        aspectRatio: "1",
                        fontSize: 12,
                        cursor: "pointer",
                        background: sel
                          ? "#212529"
                          : hoy
                          ? "#ffc107"
                          : cnt > 0
                          ? "#f8f9fa"
                          : "transparent",
                        color: sel ? "#ffc107" : hoy ? "#000" : "#212529",
                        border: sel
                          ? "2px solid #212529"
                          : hoy
                          ? "2px solid #ffc107"
                          : cnt > 0
                          ? "1.5px solid #dee2e6"
                          : "none",
                        transition: "all 0.15s",
                      }}
                    >
                      {d}
                      {cnt > 0 && (
                        <span
                          className="position-absolute rounded-circle d-flex align-items-center justify-content-center fw-black"
                          style={{
                            width: 14, height: 14,
                            top: 1, right: 1,
                            fontSize: 8,
                            background: pend > 0 ? "#ffc107" : "#198754",
                            color: "#000",
                          }}
                        >
                          {cnt}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Leyenda */}
              <div className="d-flex gap-3 mt-3 pt-2 border-top border-dark">
                <div className="d-flex align-items-center gap-1">
                  <span className="rounded-circle" style={{ width: 10, height: 10, background: "#ffc107", display: "inline-block", border: "1px solid #000" }} />
                  <span style={{ fontSize: 10 }} className="text-secondary fw-semibold">Hoy / Pendiente</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <span className="rounded-circle" style={{ width: 10, height: 10, background: "#198754", display: "inline-block" }} />
                  <span style={{ fontSize: 10 }} className="text-secondary fw-semibold">Todo gestionado</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <span className="rounded-circle" style={{ width: 10, height: 10, background: "#212529", display: "inline-block" }} />
                  <span style={{ fontSize: 10 }} className="text-secondary fw-semibold">Seleccionado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Panel derecho ── */}
        <div className="col-md-6">

          {/* Sin día seleccionado */}
          {!selectedDay && (
            <div className="card border border-2 border-dark rounded-3 h-100 d-flex align-items-center justify-content-center text-center p-5 shadow-sm" style={{ background: "#fff" }}>
              <i className="bi bi-calendar2-event text-secondary" style={{ fontSize: 44 }} />
              <div className="fw-black text-dark mt-3" style={{ fontSize: 15 }}>
                Selecciona un día
              </div>
              <div className="text-secondary fw-semibold mt-1" style={{ fontSize: 12 }}>
                Los días con número amarillo tienen citas pendientes de gestionar
              </div>
            </div>
          )}

          {/* Lista de citas del día */}
          {selectedDay && panel === "lista" && (
            <div className="card border border-2 border-dark rounded-3 shadow-sm h-100" style={{ background: "#fff" }}>
              <div className="card-body p-3 d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="fw-black text-dark" style={{ fontSize: 15 }}>
                    <i className="bi bi-calendar-event me-2 text-warning" />
                    {selectedDay} de {MESES[month]} {year}
                  </div>
                  <span className="badge bg-dark text-warning fw-bold" style={{ fontSize: 11 }}>
                    {citasDelDia.length} cita{citasDelDia.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {citasDelDia.length === 0 ? (
                  <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center py-4">
                    <i className="bi bi-calendar-x text-secondary" style={{ fontSize: 36 }} />
                    <div className="fw-bold text-secondary mt-2" style={{ fontSize: 13 }}>
                      Sin citas este día
                    </div>
                    <div className="text-secondary" style={{ fontSize: 11 }}>
                      Cuando un usuario agende, aparecerá aquí
                    </div>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: 380 }}>
                    {citasDelDia.map((cita, idx) => (
                      <button
                        key={cita.id}
                        onClick={() => { setCitaActiva(cita); setPanel("detalle"); }}
                        className="border border-2 border-dark rounded-3 p-3 text-start d-flex align-items-center gap-3 w-100"
                        style={{
                          background: citaActiva?.id === cita.id ? "#212529" : "#fff",
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={e => { if (citaActiva?.id !== cita.id) e.currentTarget.style.background = "#f8f9fa"; }}
                        onMouseLeave={e => { if (citaActiva?.id !== cita.id) e.currentTarget.style.background = "#fff"; }}
                      >
                        <Av
                          text={cita.av}
                          size={40}
                          bg={cita.estado === "Aceptada" ? "#198754" : cita.estado === "Rechazada" ? "#dc3545" : "#ffc107"}
                          color={cita.estado === "Rechazada" ? "#fff" : "#000"}
                        />
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="fw-black text-dark" style={{ fontSize: 13 }}>{cita.nombre}</div>
                          <div className="mt-1">
                            {nombreMateriales(cita.materiales).map(n => <ChipMaterial key={n} nombre={n} />)}
                          </div>
                        </div>
                        <div className="d-flex flex-column align-items-end gap-1">
                          <BadgeEstado estado={cita.estado} />
                          <i className="bi bi-chevron-right text-secondary" style={{ fontSize: 12 }} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Detalle de cita */}
          {selectedDay && panel === "detalle" && citaActiva && (
            <div className="card border border-2 border-dark rounded-3 shadow-sm h-100" style={{ background: "#fff" }}>
              <div className="card-body p-3 d-flex flex-column">

                {/* Header */}
                <div className="d-flex align-items-center gap-2 mb-3">
                  <button
                    className="btn btn-sm btn-outline-dark fw-bold"
                    style={{ fontSize: 12, padding: "3px 10px" }}
                    onClick={() => { setPanel("lista"); setCitaActiva(null); }}
                  >
                    <i className="bi bi-arrow-left me-1" /> Volver
                  </button>
                  <div className="fw-black text-dark" style={{ fontSize: 14 }}>
                    Detalle de cita
                  </div>
                </div>

                {/* Info usuario */}
                <div className="d-flex align-items-center gap-3 p-3 rounded-3 border border-2 border-dark mb-3" style={{ background: "#f8f9fa" }}>
                  <Av
                    text={citaActiva.av}
                    size={52}
                    bg={citaActiva.estado === "Aceptada" ? "#198754" : citaActiva.estado === "Rechazada" ? "#dc3545" : "#ffc107"}
                    color={citaActiva.estado === "Rechazada" ? "#fff" : "#000"}
                  />
                  <div>
                    <div className="fw-black text-dark" style={{ fontSize: 16 }}>{citaActiva.nombre}</div>
                    <div className="text-secondary fw-semibold" style={{ fontSize: 11 }}>
                      <i className="bi bi-calendar3 me-1" />
                      {selectedDay} de {MESES[month]} {year}
                    </div>
                    <div className="mt-1">
                      <BadgeEstado estado={citaActiva.estado} />
                    </div>
                  </div>
                </div>

                {/* Materiales */}
                <div className="mb-3">
                  <div className="fw-black text-dark mb-2" style={{ fontSize: 13 }}>
                    <i className="bi bi-recycle text-success me-1" />
                    Materiales a entregar
                  </div>
                  <div className="d-flex flex-column gap-2">
                    {citaActiva.materiales.map(id => {
                      const mat = MATERIALES.find(m => m.idMaterial === id);
                      if (!mat) return null;
                      return (
                        <div
                          key={id}
                          className="d-flex align-items-center justify-content-between px-3 py-2 rounded-3 border border-dark"
                          style={{ background: "#fff" }}
                        >
                          <div>
                            <div className="fw-bold text-dark" style={{ fontSize: 13 }}>{mat.nombre}</div>
                            <div className="text-secondary" style={{ fontSize: 11 }}>{mat.descripcion}</div>
                          </div>
                          <span className="badge border border-dark fw-black" style={{ background: "#ffc107", color: "#000", fontSize: 11 }}>
                            <i className="bi bi-star-fill me-1" />
                            {mat.puntosPorKg} pts/kg
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Nota de rechazo si existe */}
                {citaActiva.estado === "Rechazada" && citaActiva.nota && (
                  <div className="rounded-3 border border-danger p-2 mb-3" style={{ background: "#fff5f5" }}>
                    <div className="fw-bold text-danger" style={{ fontSize: 12 }}>
                      <i className="bi bi-x-circle me-1" />
                      Motivo de rechazo
                    </div>
                    <div className="text-dark" style={{ fontSize: 12 }}>{citaActiva.nota}</div>
                  </div>
                )}

                <div className="flex-grow-1" />

                {/* Acciones */}
                {citaActiva.estado === "Pendiente" && (
                  <div className="d-flex gap-2 mt-2">
                    <button
                      className="btn fw-black flex-grow-1 border border-2 border-dark"
                      style={{ background: "#198754", color: "#fff", fontSize: 13 }}
                      onClick={() => handleAceptar(citaActiva)}
                    >
                      <i className="bi bi-check-circle-fill me-2" />
                      Aceptar cita
                    </button>
                    <button
                      className="btn fw-black flex-grow-1 border border-2 border-dark"
                      style={{ background: "#fff", color: "#dc3545", fontSize: 13 }}
                      onClick={() => setPanel("rechazar")}
                    >
                      <i className="bi bi-x-circle-fill me-2" />
                      Rechazar
                    </button>
                  </div>
                )}

                {citaActiva.estado === "Aceptada" && (
                  <div className="rounded-3 border border-2 p-3 text-center" style={{ borderColor: "#198754", background: "#d1e7dd" }}>
                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: 24 }} />
                    <div className="fw-black mt-1" style={{ fontSize: 13, color: "#0f5132" }}>Cita aceptada</div>
                    <div style={{ fontSize: 11, color: "#0f5132" }}>El usuario ha sido notificado</div>
                  </div>
                )}

                {citaActiva.estado === "Rechazada" && (
                  <div className="rounded-3 border border-2 p-3 text-center" style={{ borderColor: "#dc3545", background: "#f8d7da" }}>
                    <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: 24 }} />
                    <div className="fw-black mt-1" style={{ fontSize: 13, color: "#842029" }}>Cita rechazada</div>
                    <div style={{ fontSize: 11, color: "#842029" }}>El usuario ha sido notificado</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Panel rechazar con nota */}
          {selectedDay && panel === "rechazar" && citaActiva && (
            <div className="card border border-2 border-dark rounded-3 shadow-sm h-100" style={{ background: "#fff" }}>
              <div className="card-body p-3 d-flex flex-column">

                <div className="d-flex align-items-center gap-2 mb-3">
                  <button
                    className="btn btn-sm btn-outline-dark fw-bold"
                    style={{ fontSize: 12, padding: "3px 10px" }}
                    onClick={() => setPanel("detalle")}
                  >
                    <i className="bi bi-arrow-left me-1" /> Volver
                  </button>
                  <div className="fw-black text-dark" style={{ fontSize: 14 }}>
                    Rechazar cita
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3 p-3 rounded-3 border border-2 border-danger mb-3" style={{ background: "#fff5f5" }}>
                  <Av text={citaActiva.av} size={44} bg="#dc3545" color="#fff" />
                  <div>
                    <div className="fw-black text-dark" style={{ fontSize: 14 }}>{citaActiva.nombre}</div>
                    <div className="text-secondary" style={{ fontSize: 11 }}>
                      {selectedDay} de {MESES[month]} {year}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="fw-black text-dark mb-2" style={{ fontSize: 13 }}>
                    <i className="bi bi-chat-text me-1 text-warning" />
                    Motivo del rechazo <span className="text-secondary fw-normal">(opcional)</span>
                  </label>
                  <textarea
                    className="form-control border border-2 border-dark"
                    rows={4}
                    placeholder="Ej: El día está completo, no hay capacidad disponible..."
                    value={notaRechazo}
                    onChange={e => setNotaRechazo(e.target.value)}
                    style={{ fontSize: 13, resize: "none" }}
                  />
                </div>

                <div className="rounded-3 border border-2 border-warning p-2 mb-3" style={{ background: "#fff3cd" }}>
                  <div className="fw-bold text-dark" style={{ fontSize: 11 }}>
                    <i className="bi bi-exclamation-triangle-fill text-warning me-1" />
                    Esta acción notificará al usuario que su cita fue rechazada.
                  </div>
                </div>

                <div className="flex-grow-1" />

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-dark fw-bold flex-grow-1"
                    style={{ fontSize: 13 }}
                    onClick={() => setPanel("detalle")}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn fw-black flex-grow-1 border border-2 border-dark"
                    style={{ background: "#dc3545", color: "#fff", fontSize: 13 }}
                    onClick={handleRechazar}
                  >
                    <i className="bi bi-x-circle-fill me-2" />
                    Confirmar rechazo
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}