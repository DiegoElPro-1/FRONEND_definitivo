// src/components/VistaDashboard.jsx
import { useState, useRef } from "react";
import Av from "./Av";

const MATERIALES = [
  { idMaterial: 1, nombre: "Plástico", descripcion: "Botellas y envases plásticos", puntosPorKg: 30, icon: "bi-droplet-fill",     bg: "#d1e7dd", color: "#0f5132" },
  { idMaterial: 2, nombre: "Papel",    descripcion: "Papel y periódico",             puntosPorKg: 15, icon: "bi-file-earmark-fill", bg: "#fff3cd", color: "#856404" },
  { idMaterial: 3, nombre: "Cartón",   descripcion: "Cajas y cartón corrugado",      puntosPorKg: 20, icon: "bi-box-fill",          bg: "#e2e3e5", color: "#41464b" },
  { idMaterial: 4, nombre: "Vidrio",   descripcion: "Botellas y frascos de vidrio",  puntosPorKg: 25, icon: "bi-cup-fill",          bg: "#212529", color: "#ffc107" },
];

const CITAS_INICIALES = {
  "2026-05-05": [
    { id: 1, nombre: "Diego Tamayo",     av: "DT", materiales: [1, 3], estado: "Aceptada",  nota: "", foto: null },
    { id: 2, nombre: "Carlos Jaramillo", av: "CJ", materiales: [1],    estado: "Pendiente", nota: "", foto: null },
    { id: 3, nombre: "Elena Santacruz",  av: "ES", materiales: [2, 4], estado: "Rechazada", nota: "Día completo", foto: null },
  ],
  "2026-05-14": [
    { id: 4, nombre: "Luisa Perdomo",    av: "LP", materiales: [4],    estado: "Pendiente", nota: "", foto: null },
    { id: 5, nombre: "Andrés Torres",    av: "AT", materiales: [3, 1], estado: "Aceptada",  nota: "", foto: null },
  ],
  "2026-05-22": [
    { id: 6, nombre: "Sofía Muñoz",      av: "SM", materiales: [2],    estado: "Pendiente", nota: "", foto: null },
    { id: 7, nombre: "Diego Tamayo",     av: "DT", materiales: [1, 2], estado: "Pendiente", nota: "", foto: null },
  ],
};

const ENCARGADO = { nombre: "María López", punto: "Punto Verde Centro", av: "ML" };
const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function BadgeEstado({ estado }) {
  const map = {
    Pendiente: { bg: "#fff3cd", color: "#856404", border: "#ffc107", icon: "bi-clock-fill" },
    Aceptada:  { bg: "#d1e7dd", color: "#0f5132", border: "#198754", icon: "bi-check-circle-fill" },
    Rechazada: { bg: "#f8d7da", color: "#842029", border: "#dc3545", icon: "bi-x-circle-fill" },
  };
  const s = map[estado] || map.Pendiente;
  return (
    <span className="fw-bold rounded-pill px-2 py-0 d-inline-flex align-items-center gap-1"
      style={{ fontSize: 10, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <i className={`bi ${s.icon}`} style={{ fontSize: 9 }} />
      {estado}
    </span>
  );
}

function ChipMaterial({ nombre }) {
  const mat = MATERIALES.find(m => m.nombre === nombre);
  if (!mat) return null;
  return (
    <span className="rounded-pill px-2 fw-bold me-1 d-inline-flex align-items-center gap-1"
      style={{ fontSize: 10, background: mat.bg, color: mat.color, display: "inline-flex", marginBottom: 2 }}>
      <i className={`bi ${mat.icon}`} style={{ fontSize: 9 }} />
      {nombre}
    </span>
  );
}

export default function VistaDashboard() {
  const today = new Date();
  const [year, setYear]               = useState(today.getFullYear());
  const [month, setMonth]             = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [citas, setCitas]             = useState(CITAS_INICIALES);
  const [panel, setPanel]             = useState("lista");
  const [tabActivo, setTabActivo]     = useState("Pendiente");
  const [citaActiva, setCitaActiva]   = useState(null);
  const [notaRechazo, setNotaRechazo] = useState("");
  const [fotoPreview, setFotoPreview] = useState(null); // foto ampliada
  const inputFotoRef = useRef(null);

  const toKey = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const primerDia = new Date(year, month, 1).getDay();
  const diasEnMes = new Date(year, month + 1, 0).getDate();
  const celdas = [];
  for (let i = 0; i < primerDia; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  const citasPorDia = (d) => { const k = toKey(year, month, d); return citas[k] || []; };
  const pendientesDia = (d) => citasPorDia(d).filter(c => c.estado === "Pendiente").length;
  const totalDia = (d) => citasPorDia(d).length;
  const esHoy = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const prevMes = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); setSelectedDay(null); setPanel("lista"); setCitaActiva(null); };
  const nextMes = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); setSelectedDay(null); setPanel("lista"); setCitaActiva(null); };

  const selectDia = (d) => { setSelectedDay(d); setPanel("lista"); setCitaActiva(null); setNotaRechazo(""); setTabActivo("Pendiente"); };

  const keyActivo   = selectedDay ? toKey(year, month, selectedDay) : null;
  const citasDelDia = keyActivo ? (citas[keyActivo] || []) : [];
  const citasFiltradas = citasDelDia.filter(c => c.estado === tabActivo);

  const conteoTab = (tab) => citasDelDia.filter(c => c.estado === tab).length;

  const handleAceptar = () => {
    setCitas(prev => {
      const copia = { ...prev };
      copia[keyActivo] = copia[keyActivo].map(c => c.id === citaActiva.id ? { ...c, estado: "Aceptada", nota: "" } : c);
      return copia;
    });
    setCitaActiva(c => ({ ...c, estado: "Aceptada" }));
  };

  const handleRechazar = () => {
    setCitas(prev => {
      const copia = { ...prev };
      copia[keyActivo] = copia[keyActivo].map(c => c.id === citaActiva.id ? { ...c, estado: "Rechazada", nota: notaRechazo } : c);
      return copia;
    });
    setCitaActiva(c => ({ ...c, estado: "Rechazada", nota: notaRechazo }));
    setPanel("detalle");
    setNotaRechazo("");
  };

  // Subida de foto simulada (usuario sube, encargado ve)
  const handleFotoUpload = (e, citaId) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCitas(prev => {
      const copia = { ...prev };
      copia[keyActivo] = copia[keyActivo].map(c => c.id === citaId ? { ...c, foto: url } : c);
      return copia;
    });
    if (citaActiva?.id === citaId) setCitaActiva(c => ({ ...c, foto: url }));
  };

  const nombreMateriales = (ids) => ids.map(id => MATERIALES.find(m => m.idMaterial === id)?.nombre).filter(Boolean);

  const totalPendientes = Object.values(citas).flat().filter(c => c.estado === "Pendiente").length;

  const TABS = [
    { key: "Pendiente", icon: "bi-clock-fill",        color: "#856404", bg: "#fff3cd", border: "#ffc107" },
    { key: "Aceptada",  icon: "bi-check-circle-fill", color: "#0f5132", bg: "#d1e7dd", border: "#198754" },
    { key: "Rechazada", icon: "bi-x-circle-fill",     color: "#842029", bg: "#f8d7da", border: "#dc3545" },
  ];

  return (
    <div>

      {/* Modal foto ampliada */}
      {fotoPreview && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.85)", zIndex: 9999 }}
          onClick={() => setFotoPreview(null)}
        >
          <div className="position-relative">
            <img src={fotoPreview} alt="Vista previa" className="rounded-3 border border-3 border-warning"
              style={{ maxWidth: "80vw", maxHeight: "80vh", objectFit: "contain" }} />
            <button className="btn btn-dark position-absolute top-0 end-0 m-2 border border-warning"
              style={{ fontSize: 13 }} onClick={() => setFotoPreview(null)}>
              <i className="bi bi-x-lg text-warning" />
            </button>
          </div>
        </div>
      )}

      {/* Bienvenida */}
      <div className="card border border-2 border-dark rounded-3 shadow-sm mb-4 px-4 py-3 d-flex flex-row align-items-center justify-content-between" style={{ background: "#fff" }}>
        <div className="d-flex align-items-center gap-3">
          <Av text={ENCARGADO.av} size={52} bg="#ffc107" color="#000" />
          <div>
            <div className="fw-black text-dark" style={{ fontSize: 17 }}>Bienvenido, {ENCARGADO.nombre} 👋</div>
            <div className="text-secondary fw-semibold" style={{ fontSize: 12 }}>{ENCARGADO.punto} · Encargado de punto</div>
          </div>
        </div>
        <span className="badge border border-2 border-dark text-dark fw-bold px-3 py-2 d-flex align-items-center gap-2" style={{ background: "#ffc107", fontSize: 12 }}>
          <i className="bi bi-calendar-check" />
          {totalPendientes} citas pendientes
        </span>
      </div>

      {/* Calendario + Panel */}
      <div className="row g-3">

        {/* ── Calendario ── */}
        <div className="col-md-6">
          <div className="card border border-2 border-dark rounded-3 shadow-sm" style={{ background: "#fff" }}>
            <div className="card-body p-3">

              {/* Header mes */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <button className="btn btn-dark btn-sm fw-bold d-flex align-items-center justify-content-center border border-warning"
                  style={{ width: 32, height: 32, padding: 0 }} onClick={prevMes}>
                  <i className="bi bi-chevron-left text-warning" />
                </button>
                <div className="fw-black text-dark" style={{ fontSize: 15 }}>{MESES[month]} {year}</div>
                <button className="btn btn-dark btn-sm fw-bold d-flex align-items-center justify-content-center border border-warning"
                  style={{ width: 32, height: 32, padding: 0 }} onClick={nextMes}>
                  <i className="bi bi-chevron-right text-warning" />
                </button>
              </div>

              {/* Días semana */}
              <div className="d-grid mb-2" style={{ gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
                {DIAS_SEMANA.map(d => (
                  <div key={d} className="text-center fw-black text-secondary" style={{ fontSize: 10 }}>{d}</div>
                ))}
              </div>

              {/* Celdas */}
              <div className="d-grid" style={{ gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
                {celdas.map((d, i) => {
                  if (!d) return <div key={`e-${i}`} />;
                  const cnt  = totalDia(d);
                  const pend = pendientesDia(d);
                  const sel  = selectedDay === d;
                  const hoy  = esHoy(d);

                  return (
                    <button key={d} onClick={() => selectDia(d)}
                      className="border-0 rounded-2 d-flex flex-column align-items-center justify-content-center position-relative fw-bold"
                      style={{
                        aspectRatio: "1", fontSize: 12, cursor: "pointer",
                        background: sel ? "#212529" : hoy ? "#ffc107" : cnt > 0 ? "#f8f9fa" : "transparent",
                        color: sel ? "#ffc107" : hoy ? "#000" : "#212529",
                        border: sel ? "2px solid #ffc107" : hoy ? "2px solid #ffc107" : cnt > 0 ? "1.5px solid #dee2e6" : "none",
                        transition: "all 0.15s",
                      }}
                    >
                      {d}
                      {cnt > 0 && (
                        <span className="position-absolute rounded-circle d-flex align-items-center justify-content-center fw-black"
                          style={{ width: 14, height: 14, top: 1, right: 1, fontSize: 8,
                            background: pend > 0 ? "#ffc107" : "#198754", color: "#000" }}>
                          {cnt}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Leyenda */}
              <div className="d-flex flex-wrap gap-3 mt-3 pt-2 border-top border-dark">
                {[
                  { bg: "#ffc107", border: "1px solid #000",    label: "Hoy"            },
                  { bg: "#f8f9fa", border: "1px solid #dee2e6", label: "Con citas"      },
                  { bg: "#212529", border: "2px solid #ffc107", label: "Seleccionado"   },
                  { bg: "#ffc107", border: "none",              label: "Pendientes",  dot: true },
                  { bg: "#198754", border: "none",              label: "Gestionadas", dot: true },
                ].map(l => (
                  <span key={l.label} className="d-flex align-items-center gap-1 text-secondary fw-semibold" style={{ fontSize: 10 }}>
                    <span style={{ width: l.dot ? 8 : 10, height: l.dot ? 8 : 10, borderRadius: l.dot ? "50%" : 3,
                      background: l.bg, border: l.border, display: "inline-block", flexShrink: 0 }} />
                    {l.label}
                  </span>
                ))}
              </div>

              {/* Mini resumen del mes */}
              <div className="d-flex gap-2 mt-3">
                {TABS.map(t => {
                  const total = Object.values(citas).flat().filter(c => c.estado === t.key).length;
                  return (
                    <div key={t.key} className="flex-grow-1 rounded-3 border border-2 border-dark p-2 text-center"
                      style={{ background: t.bg }}>
                      <i className={`bi ${t.icon} d-block mb-1`} style={{ color: t.color, fontSize: 16 }} />
                      <div className="fw-black" style={{ fontSize: 18, color: t.color }}>{total}</div>
                      <div className="fw-bold" style={{ fontSize: 9, color: t.color }}>{t.key}s</div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>

        {/* ── Panel derecho ── */}
        <div className="col-md-6">

          {/* Sin día seleccionado */}
          {!selectedDay && (
            <div className="card border border-2 border-dark rounded-3 h-100 d-flex align-items-center justify-content-center text-center p-5 shadow-sm" style={{ background: "#fff" }}>
              <i className="bi bi-calendar2-event text-secondary" style={{ fontSize: 48 }} />
              <div className="fw-black text-dark mt-3" style={{ fontSize: 15 }}>Selecciona un día</div>
              <div className="text-secondary fw-semibold mt-1" style={{ fontSize: 12 }}>
                Los días marcados tienen citas agendadas
              </div>
              <div className="d-flex gap-2 mt-4">
                {TABS.map(t => (
                  <div key={t.key} className="rounded-3 border border-dark px-3 py-2 text-center" style={{ background: t.bg }}>
                    <i className={`bi ${t.icon}`} style={{ color: t.color, fontSize: 14 }} />
                    <div className="fw-black" style={{ fontSize: 11, color: t.color, marginTop: 2 }}>{t.key}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de citas con tabs */}
          {selectedDay && panel === "lista" && (
            <div className="card border border-2 border-dark rounded-3 shadow-sm" style={{ background: "#fff" }}>
              <div className="card-body p-3">

                {/* Encabezado día */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="fw-black text-dark d-flex align-items-center gap-2" style={{ fontSize: 14 }}>
                    <i className="bi bi-calendar-event text-warning" />
                    {selectedDay} de {MESES[month]} {year}
                  </div>
                  <span className="badge bg-dark text-warning fw-bold border border-warning" style={{ fontSize: 10 }}>
                    {citasDelDia.length} cita{citasDelDia.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Tabs */}
                <div className="d-flex gap-2 mb-3">
                  {TABS.map(t => {
                    const cnt = conteoTab(t.key);
                    const activo = tabActivo === t.key;
                    return (
                      <button key={t.key} onClick={() => setTabActivo(t.key)}
                        className="flex-grow-1 border border-2 rounded-3 fw-bold d-flex flex-column align-items-center py-2"
                        style={{
                          fontSize: 11, cursor: "pointer",
                          background: activo ? t.bg : "#f8f9fa",
                          borderColor: activo ? t.border : "#dee2e6",
                          color: activo ? t.color : "#6c757d",
                          transition: "all 0.15s",
                        }}>
                        <i className={`bi ${t.icon} mb-1`} style={{ fontSize: 16, color: activo ? t.color : "#adb5bd" }} />
                        <span className="fw-black" style={{ fontSize: 15 }}>{cnt}</span>
                        <span style={{ fontSize: 9 }}>{t.key}{cnt !== 1 ? "s" : ""}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Lista filtrada */}
                {citasFiltradas.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-calendar-x text-secondary" style={{ fontSize: 32 }} />
                    <div className="fw-bold text-secondary mt-2" style={{ fontSize: 13 }}>
                      Sin citas {tabActivo.toLowerCase()}s este día
                    </div>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2" style={{ maxHeight: 340, overflowY: "auto" }}>
                    {citasFiltradas.map(cita => (
                      <button key={cita.id}
                        onClick={() => { setCitaActiva(cita); setPanel("detalle"); }}
                        className="border border-2 border-dark rounded-3 p-2 text-start w-100 d-flex align-items-center gap-3"
                        style={{ background: "#fff", cursor: "pointer", transition: "background 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#f8f9fa"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
                      >
                        <Av text={cita.av} size={40}
                          bg={cita.estado === "Aceptada" ? "#198754" : cita.estado === "Rechazada" ? "#dc3545" : "#ffc107"}
                          color={cita.estado === "Rechazada" ? "#fff" : "#000"} />
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="fw-black text-dark" style={{ fontSize: 13 }}>{cita.nombre}</div>
                          <div className="mt-1 d-flex flex-wrap gap-1">
                            {nombreMateriales(cita.materiales).map(n => <ChipMaterial key={n} nombre={n} />)}
                          </div>
                          {cita.foto && (
                            <div className="mt-1 d-flex align-items-center gap-1 text-success" style={{ fontSize: 10 }}>
                              <i className="bi bi-image-fill" />
                              <span className="fw-bold">Foto adjunta</span>
                            </div>
                          )}
                        </div>
                        <div className="d-flex flex-column align-items-end gap-1">
                          <BadgeEstado estado={cita.estado} />
                          <i className="bi bi-chevron-right text-secondary" style={{ fontSize: 11 }} />
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
            <div className="card border border-2 border-dark rounded-3 shadow-sm" style={{ background: "#fff" }}>
              <div className="card-body p-3 d-flex flex-column gap-3">

                {/* Header */}
                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-sm btn-outline-dark fw-bold border-2" style={{ fontSize: 11, padding: "3px 10px" }}
                    onClick={() => { setPanel("lista"); setCitaActiva(null); }}>
                    <i className="bi bi-arrow-left me-1" />Volver
                  </button>
                  <div className="fw-black text-dark" style={{ fontSize: 14 }}>Detalle de cita</div>
                  <div className="ms-auto"><BadgeEstado estado={citaActiva.estado} /></div>
                </div>

                {/* Info usuario */}
                <div className="d-flex align-items-center gap-3 p-3 rounded-3 border border-2 border-dark" style={{ background: "#f8f9fa" }}>
                  <Av text={citaActiva.av} size={50}
                    bg={citaActiva.estado === "Aceptada" ? "#198754" : citaActiva.estado === "Rechazada" ? "#dc3545" : "#ffc107"}
                    color={citaActiva.estado === "Rechazada" ? "#fff" : "#000"} />
                  <div>
                    <div className="fw-black text-dark" style={{ fontSize: 15 }}>{citaActiva.nombre}</div>
                    <div className="text-secondary fw-semibold d-flex align-items-center gap-1" style={{ fontSize: 11 }}>
                      <i className="bi bi-calendar3" />{selectedDay} de {MESES[month]} {year}
                    </div>
                  </div>
                </div>

                {/* Materiales detallados */}
                <div>
                  <div className="fw-black text-dark mb-2 d-flex align-items-center gap-2" style={{ fontSize: 13 }}>
                    <i className="bi bi-recycle text-success" />
                    Materiales a entregar
                  </div>
                  <div className="d-flex flex-column gap-2">
                    {citaActiva.materiales.map(id => {
                      const mat = MATERIALES.find(m => m.idMaterial === id);
                      if (!mat) return null;
                      return (
                        <div key={id} className="d-flex align-items-center gap-3 px-3 py-2 rounded-3 border border-2 border-dark"
                          style={{ background: mat.bg }}>
                          <div className="rounded-circle d-flex align-items-center justify-content-center border border-2 border-dark flex-shrink-0"
                            style={{ width: 36, height: 36, background: "#fff" }}>
                            <i className={`bi ${mat.icon}`} style={{ fontSize: 18, color: mat.color }} />
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-black" style={{ fontSize: 13, color: mat.color }}>{mat.nombre}</div>
                            <div className="fw-semibold" style={{ fontSize: 10, color: mat.color, opacity: 0.8 }}>{mat.descripcion}</div>
                          </div>
                          <span className="badge border border-2 border-dark fw-black d-flex align-items-center gap-1"
                            style={{ background: "#ffc107", color: "#000", fontSize: 11 }}>
                            <i className="bi bi-star-fill" style={{ fontSize: 9 }} />
                            {mat.puntosPorKg} pts/kg
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Foto del material */}
                <div>
                  <div className="fw-black text-dark mb-2 d-flex align-items-center gap-2" style={{ fontSize: 13 }}>
                    <i className="bi bi-camera-fill text-warning" />
                    Foto del material
                    <span className="fw-normal text-secondary" style={{ fontSize: 10 }}>(adjuntada por el usuario)</span>
                  </div>

                  {citaActiva.foto ? (
                    <div className="position-relative rounded-3 overflow-hidden border border-2 border-dark"
                      style={{ cursor: "pointer" }} onClick={() => setFotoPreview(citaActiva.foto)}>
                      <img src={citaActiva.foto} alt="Material"
                        style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
                      <div className="position-absolute bottom-0 start-0 end-0 d-flex align-items-center justify-content-center gap-2 py-2"
                        style={{ background: "rgba(0,0,0,0.6)" }}>
                        <i className="bi bi-zoom-in text-warning" style={{ fontSize: 14 }} />
                        <span className="fw-bold text-white" style={{ fontSize: 11 }}>Ver en grande</span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-3 border border-2 border-dark d-flex flex-column align-items-center justify-content-center py-3"
                      style={{ background: "#f8f9fa", minHeight: 100 }}>
                      <i className="bi bi-image text-secondary" style={{ fontSize: 28 }} />
                      <div className="text-secondary fw-semibold mt-1" style={{ fontSize: 11 }}>Sin foto adjunta</div>
                      {/* Simulación: el encargado puede subir una de prueba */}
                      <input type="file" accept="image/*" ref={inputFotoRef}
                        style={{ display: "none" }}
                        onChange={e => handleFotoUpload(e, citaActiva.id)} />
                      <button className="btn btn-sm btn-outline-dark fw-bold border-2 mt-2 d-flex align-items-center gap-1"
                        style={{ fontSize: 10 }} onClick={() => inputFotoRef.current?.click()}>
                        <i className="bi bi-upload" /> Cargar foto de prueba
                      </button>
                    </div>
                  )}
                </div>

                {/* Nota rechazo si existe */}
                {citaActiva.estado === "Rechazada" && citaActiva.nota && (
                  <div className="rounded-3 border border-2 border-danger p-2 d-flex align-items-start gap-2"
                    style={{ background: "#fff5f5" }}>
                    <i className="bi bi-x-circle-fill text-danger mt-1" style={{ fontSize: 13, flexShrink: 0 }} />
                    <div>
                      <div className="fw-black text-danger" style={{ fontSize: 11 }}>Motivo de rechazo</div>
                      <div className="text-dark" style={{ fontSize: 12 }}>{citaActiva.nota}</div>
                    </div>
                  </div>
                )}

                {/* Acciones */}
                {citaActiva.estado === "Pendiente" && (
                  <div className="d-flex gap-2">
                    <button className="btn fw-black flex-grow-1 border border-2 border-dark d-flex align-items-center justify-content-center gap-2"
                      style={{ background: "#198754", color: "#fff", fontSize: 13 }}
                      onClick={handleAceptar}>
                      <i className="bi bi-check-circle-fill" /> Aceptar cita
                    </button>
                    <button className="btn fw-black flex-grow-1 border border-2 border-dark d-flex align-items-center justify-content-center gap-2"
                      style={{ background: "#fff", color: "#dc3545", fontSize: 13 }}
                      onClick={() => setPanel("rechazar")}>
                      <i className="bi bi-x-circle-fill" /> Rechazar
                    </button>
                  </div>
                )}

                {citaActiva.estado === "Aceptada" && (
                  <div className="rounded-3 border border-2 p-3 text-center d-flex flex-column align-items-center gap-1"
                    style={{ borderColor: "#198754", background: "#d1e7dd" }}>
                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: 24 }} />
                    <div className="fw-black" style={{ fontSize: 13, color: "#0f5132" }}>Cita aceptada</div>
                    <div style={{ fontSize: 11, color: "#0f5132" }}>El usuario ha sido notificado</div>
                  </div>
                )}

                {citaActiva.estado === "Rechazada" && (
                  <div className="rounded-3 border border-2 p-3 text-center d-flex flex-column align-items-center gap-1"
                    style={{ borderColor: "#dc3545", background: "#f8d7da" }}>
                    <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: 24 }} />
                    <div className="fw-black" style={{ fontSize: 13, color: "#842029" }}>Cita rechazada</div>
                    <div style={{ fontSize: 11, color: "#842029" }}>El usuario ha sido notificado</div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Panel rechazar */}
          {selectedDay && panel === "rechazar" && citaActiva && (
            <div className="card border border-2 border-dark rounded-3 shadow-sm" style={{ background: "#fff" }}>
              <div className="card-body p-3 d-flex flex-column gap-3">

                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-sm btn-outline-dark fw-bold border-2" style={{ fontSize: 11, padding: "3px 10px" }}
                    onClick={() => setPanel("detalle")}>
                    <i className="bi bi-arrow-left me-1" />Volver
                  </button>
                  <div className="fw-black text-dark" style={{ fontSize: 14 }}>Rechazar cita</div>
                </div>

                <div className="d-flex align-items-center gap-3 p-3 rounded-3 border border-2 border-danger" style={{ background: "#fff5f5" }}>
                  <Av text={citaActiva.av} size={44} bg="#dc3545" color="#fff" />
                  <div>
                    <div className="fw-black text-dark" style={{ fontSize: 14 }}>{citaActiva.nombre}</div>
                    <div className="text-secondary d-flex align-items-center gap-1" style={{ fontSize: 11 }}>
                      <i className="bi bi-calendar3" />{selectedDay} de {MESES[month]} {year}
                    </div>
                    <div className="mt-1 d-flex flex-wrap gap-1">
                      {nombreMateriales(citaActiva.materiales).map(n => <ChipMaterial key={n} nombre={n} />)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="fw-black text-dark mb-2 d-flex align-items-center gap-1" style={{ fontSize: 13 }}>
                    <i className="bi bi-chat-text text-warning" />
                    Motivo del rechazo
                    <span className="text-secondary fw-normal" style={{ fontSize: 10 }}>(opcional)</span>
                  </label>
                  <textarea className="form-control border border-2 border-dark" rows={3}
                    placeholder="Ej: El día está completo, no hay capacidad disponible..."
                    value={notaRechazo} onChange={e => setNotaRechazo(e.target.value)}
                    style={{ fontSize: 13, resize: "none" }} />
                </div>

                <div className="rounded-3 border border-2 border-warning p-2 d-flex align-items-center gap-2" style={{ background: "#fff3cd" }}>
                  <i className="bi bi-exclamation-triangle-fill text-warning flex-shrink-0" />
                  <span className="fw-bold text-dark" style={{ fontSize: 11 }}>
                    Esta acción notificará al usuario que su cita fue rechazada.
                  </span>
                </div>

                <div className="d-flex gap-2">
                  <button className="btn btn-outline-dark fw-bold flex-grow-1 border-2" style={{ fontSize: 13 }}
                    onClick={() => setPanel("detalle")}>
                    <i className="bi bi-arrow-left me-1" />Cancelar
                  </button>
                  <button className="btn fw-black flex-grow-1 border border-2 border-dark d-flex align-items-center justify-content-center gap-2"
                    style={{ background: "#dc3545", color: "#fff", fontSize: 13 }}
                    onClick={handleRechazar}>
                    <i className="bi bi-x-circle-fill" />Confirmar rechazo
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