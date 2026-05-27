// src/paneles/encargado/VistaDashboard.jsx
import { useState, useEffect } from "react";
import { C, S, Av } from "./encargadoTheme";
import { getReservasEncargado, actualizarEstadoReservaEncargado } from "../../services/api";

function getIniciales(nombre = "") {
  return nombre.split(" ").slice(0, 2).map(p => p[0]?.toUpperCase()).join("");
}

function transformarReservas(reservas) {
  const agrupadas = {};
  for (const r of reservas) {
    const fecha = r.fecha;
    if (!agrupadas[fecha]) agrupadas[fecha] = [];
    agrupadas[fecha].push({
      id: r.idReserva,
      idReserva: r.idReserva,
      idUsuario: r.idUsuario,
      nombre: r.usuario?.nombre || "Sin nombre",
      av: getIniciales(r.usuario?.nombre),
      materiales: [],
      estado: r.estado === "confirmada" ? "Aceptada" : r.estado === "cancelada" ? "Rechazada" : r.estado === "completada" ? "Completada" : "Pendiente",
      nota: r.notas || "",
      foto: null,
      hora: r.hora,
    });
  }
  return agrupadas;
}

const ENCARGADO   = { nombre: "María López", punto: "Punto Verde Centro", av: "ML" };
const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES       = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const TABS = [
  { key: "Pendiente",  icon: "bi-clock-fill",        color: "#856404",     bg: "#fff3cd",    border: "#ffc107" },
  { key: "Aceptada",   icon: "bi-check-circle-fill", color: C.verdeOscuro, bg: C.verdeClaro, border: C.verde   },
  { key: "Completada", icon: "bi-check2-all",        color: "#1b5e20",     bg: "#c8e6c9",    border: "#388e3c" },
  { key: "Rechazada",  icon: "bi-x-circle-fill",     color: "#842029",     bg: "#f8d7da",    border: "#dc3545" },
];

function BadgeEstado({ estado }) {
  const map = {
    Pendiente:  { bg: "#fff3cd",    color: "#856404",     border: "#ffc107",  icon: "bi-clock-fill"        },
    Aceptada:   { bg: C.verdeClaro, color: C.verdeOscuro, border: C.verde,    icon: "bi-check-circle-fill" },
    Completada: { bg: "#c8e6c9",    color: "#1b5e20",     border: "#388e3c",  icon: "bi-check2-all"        },
    Rechazada:  { bg: "#f8d7da",    color: "#842029",     border: "#dc3545",  icon: "bi-x-circle-fill"     },
  };
  const s = map[estado] || map.Pendiente;
  return (
    <span
      className="fw-bold rounded-pill px-2 py-0 d-inline-flex align-items-center gap-1"
      style={{ fontSize: 10, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      <i className={`bi ${s.icon}`} style={{ fontSize: 9 }} />{estado}
    </span>
  );
}

export default function VistaDashboard() {
  const today = new Date();
  const [year, setYear]               = useState(today.getFullYear());
  const [month, setMonth]             = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [citas, setCitas]             = useState({});
  const [panel, setPanel]             = useState("lista");
  const [tabActivo, setTabActivo]     = useState("Pendiente");
  const [citaActiva, setCitaActiva]   = useState(null);
  const [notaRechazo, setNotaRechazo] = useState("");
  const [fotoPreview, setFotoPreview] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getReservasEncargado();
        const agrupadas = transformarReservas(data.reservas || []);
        setCitas(agrupadas);
      } catch (e) {
        setError(e.message || "Error al cargar reservas");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const toKey = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const primerDia = new Date(year, month, 1).getDay();
  const diasEnMes = new Date(year, month + 1, 0).getDate();
  const celdas = [];
  for (let i = 0; i < primerDia; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  const citasPorDia   = (d) => { const k = toKey(year, month, d); return citas[k] || []; };
  const pendientesDia = (d) => citasPorDia(d).filter(c => c.estado === "Pendiente").length;
  const totalDia      = (d) => citasPorDia(d).length;
  const esHoy         = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const prevMes   = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); setSelectedDay(null); setPanel("lista"); setCitaActiva(null); };
  const nextMes   = () => { if (month === 11) { setMonth(0);  setYear(y => y + 1); } else setMonth(m => m + 1); setSelectedDay(null); setPanel("lista"); setCitaActiva(null); };
  const selectDia = (d) => { setSelectedDay(d); setPanel("lista"); setCitaActiva(null); setNotaRechazo(""); setTabActivo("Pendiente"); };

  const keyActivo      = selectedDay ? toKey(year, month, selectedDay) : null;
  const citasDelDia    = keyActivo ? (citas[keyActivo] || []) : [];
  const citasFiltradas = citasDelDia.filter(c => c.estado === tabActivo);
  const conteoTab      = (tab) => citasDelDia.filter(c => c.estado === tab).length;

  const handleAceptar = async () => {
    try {
      await actualizarEstadoReservaEncargado(citaActiva.idReserva, { estado: "confirmada" });
      setCitas(prev => { const copia = { ...prev }; copia[keyActivo] = copia[keyActivo].map(c => c.id === citaActiva.id ? { ...c, estado: "Aceptada", nota: "" } : c); return copia; });
      setCitaActiva(c => ({ ...c, estado: "Aceptada" }));
    } catch (e) { console.error("Error al aceptar:", e); }
  };

  const handleRechazar = async () => {
    try {
      await actualizarEstadoReservaEncargado(citaActiva.idReserva, { estado: "cancelada", notas: notaRechazo || null });
      setCitas(prev => { const copia = { ...prev }; copia[keyActivo] = copia[keyActivo].map(c => c.id === citaActiva.id ? { ...c, estado: "Rechazada", nota: notaRechazo } : c); return copia; });
      setCitaActiva(c => ({ ...c, estado: "Rechazada", nota: notaRechazo }));
      setPanel("detalle"); setNotaRechazo("");
    } catch (e) { console.error("Error al rechazar:", e); }
  };

  const tieneMateriales = (cita) => cita.materiales && cita.materiales.length > 0;
  const totalPendientes  = Object.values(citas).flat().filter(c => c.estado === "Pendiente").length;

  return (
    <div style={{ backgroundColor: C.grisFondo, minHeight: "100vh", padding: 24 }}>

      {/* Loading */}
      {loading && (
        <div className="d-flex align-items-center justify-content-center py-5">
          <div className="spinner-border" style={{ color: C.verde }} role="status" />
          <span className="fw-bold ms-3" style={{ color: C.grisTexto }}>Cargando reservas…</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-2 mb-3" style={S.alertaError}>
          <i className="bi bi-exclamation-triangle-fill" />
          {error}
          <button className="btn btn-sm fw-bold ms-auto" style={{ ...S.btnSecundario, fontSize: 11 }} onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && (
      <>

      {/* Modal foto ampliada */}
      {fotoPreview && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={S.modalOverlay}
          onClick={() => setFotoPreview(null)}
        >
          <div className="position-relative">
            <img src={fotoPreview} alt="Vista previa" className="rounded-3"
              style={{ maxWidth: "80vw", maxHeight: "80vh", objectFit: "contain", border: `3px solid ${C.verde}` }}
            />
            <button className="btn position-absolute top-0 end-0 m-2" style={S.btnSecundario} onClick={() => setFotoPreview(null)}>
              <i className="bi bi-x-lg" />
            </button>
          </div>
        </div>
      )}

      {/* Bienvenida */}
      <div className="card mb-4 px-4 py-3 d-flex flex-row align-items-center justify-content-between" style={S.card}>
        <div className="d-flex align-items-center gap-3">
          <Av text={ENCARGADO.av} size={52} />
          <div>
            <div className="fw-bold" style={{ fontSize: 17, color: C.negro }}>Bienvenido, {ENCARGADO.nombre} 👋</div>
            <div className="fw-semibold" style={{ fontSize: 12, color: C.grisTexto }}>{ENCARGADO.punto} · Encargado de punto</div>
          </div>
        </div>
        <span className="badge fw-bold px-3 py-2 d-flex align-items-center gap-2"
          style={{ backgroundColor: C.verdeClaro, color: C.verdeOscuro, fontSize: 12, border: `1.5px solid ${C.verdeMedio}` }}
        >
          <i className="bi bi-calendar-check" />{totalPendientes} citas pendientes
        </span>
      </div>

      <div className="row g-3">

        {/* ── CALENDARIO ───────────────────────────────────── */}
        <div className="col-md-6">
          <div className="card" style={S.card}>
            <div className="card-body p-3">

              {/* Navegación mes */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <button className="btn btn-sm fw-bold d-flex align-items-center justify-content-center"
                  style={{ ...S.btnPrimario, width: 32, height: 32, padding: 0 }} onClick={prevMes}>
                  <i className="bi bi-chevron-left" />
                </button>
                <div className="fw-bold" style={{ fontSize: 15, color: C.negro }}>{MESES[month]} {year}</div>
                <button className="btn btn-sm fw-bold d-flex align-items-center justify-content-center"
                  style={{ ...S.btnPrimario, width: 32, height: 32, padding: 0 }} onClick={nextMes}>
                  <i className="bi bi-chevron-right" />
                </button>
              </div>

              {/* Días de semana */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, marginBottom: 1, backgroundColor: "#d1d5db" }}>
                {DIAS_SEMANA.map(d => (
                  <div key={d} className="text-center fw-bold" style={{ fontSize: 10, color: C.grisTexto, padding: "4px 0", backgroundColor: "#fff" }}>{d}</div>
                ))}
              </div>

              {/* Celdas */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, backgroundColor: "#d1d5db" }}>
                {celdas.map((d, i) => {
                  if (!d) return <div key={`e-${i}`} style={{ minHeight: 44, backgroundColor: "#f3f4f6" }} />;
                  const cnt  = totalDia(d);
                  const pend = pendientesDia(d);
                  const sel  = selectedDay === d;
                  const hoy  = esHoy(d);
                  return (
                    <button key={d} onClick={() => selectDia(d)}
                      className="border-0 d-flex flex-column align-items-center justify-content-center position-relative fw-bold"
                      style={{
                        minHeight: 44, fontSize: 12, cursor: "pointer",
                        backgroundColor: sel ? C.verde : hoy ? C.verdeClaro : cnt > 0 ? "#f0fdf4" : "#fff",
                        color: sel ? C.blanco : hoy ? C.verdeOscuro : C.negro,
                        transition: "all 0.15s",
                      }}
                    >
                      {d}
                      {cnt > 0 && (
                        <span className="position-absolute rounded-circle d-flex align-items-center justify-content-center fw-bold"
                          style={{ width: 14, height: 14, top: 1, right: 1, fontSize: 8,
                            backgroundColor: pend > 0 ? C.amarillo : C.verdeOscuro, color: C.blanco }}>
                          {cnt}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Leyenda */}
              <div className="d-flex flex-wrap gap-3 mt-3 pt-2" style={{ borderTop: `1px solid ${C.verdeBorde}` }}>
                {[
                  { bg: C.verdeClaro, border: `1px solid ${C.verde}`,      label: "Hoy"          },
                  { bg: "#f0fdf4",   border: "1px solid #16a34a",          label: "Con citas"    },
                  { bg: C.verde,      border: `2px solid ${C.verdeOscuro}`, label: "Seleccionado" },
                ].map(l => (
                  <span key={l.label} className="d-flex align-items-center gap-1 fw-semibold" style={{ fontSize: 10, color: C.grisTexto }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: l.bg, border: l.border, display: "inline-block", flexShrink: 0 }} />
                    {l.label}
                  </span>
                ))}
              </div>

              {/* Stat boxes */}
              <div className="d-flex gap-2 mt-3">
                {TABS.map(t => {
                  const total = Object.values(citas).flat().filter(c => c.estado === t.key).length;
                  return (
                    <div key={t.key} className="flex-grow-1 rounded-3 p-2 text-center"
                      style={{ backgroundColor: t.bg, border: `1.5px solid ${t.border}` }}>
                      <i className={`bi ${t.icon} d-block mb-1`} style={{ color: t.color, fontSize: 16 }} />
                      <div className="fw-bold" style={{ fontSize: 18, color: t.color }}>{total}</div>
                      <div className="fw-bold" style={{ fontSize: 9,  color: t.color }}>{t.key}s</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── PANEL DERECHO ────────────────────────────────── */}
        <div className="col-md-6">

          {/* Sin día seleccionado */}
          {!selectedDay && (
            <div className="card h-100 d-flex align-items-center justify-content-center text-center p-5" style={S.card}>
              <i className="bi bi-calendar2-event" style={{ fontSize: 48, color: C.grisTexto }} />
              <div className="fw-bold mt-3" style={{ fontSize: 15, color: C.negro }}>Selecciona un día</div>
              <div className="fw-semibold mt-1" style={{ fontSize: 12, color: C.grisTexto }}>Los días marcados tienen citas agendadas</div>
              <div className="d-flex gap-2 mt-4">
                {TABS.map(t => (
                  <div key={t.key} className="rounded-3 px-3 py-2 text-center"
                    style={{ backgroundColor: t.bg, border: `1.5px solid ${t.border}` }}>
                    <i className={`bi ${t.icon}`} style={{ color: t.color, fontSize: 14 }} />
                    <div className="fw-bold" style={{ fontSize: 11, color: t.color, marginTop: 2 }}>{t.key}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de citas */}
          {selectedDay && panel === "lista" && (
            <div className="card" style={S.card}>
              <div className="card-body p-3">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="fw-bold d-flex align-items-center gap-2" style={{ fontSize: 14, color: C.negro }}>
                    <i className="bi bi-calendar-event" style={{ color: C.verde }} />
                    {selectedDay} de {MESES[month]} {year}
                  </div>
                  <span className="badge fw-bold"
                    style={{ fontSize: 10, backgroundColor: C.verdeClaro, color: C.verdeOscuro, border: `1px solid ${C.verdeMedio}` }}>
                    {citasDelDia.length} cita{citasDelDia.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Tabs filtro */}
                <div className="d-flex gap-2 mb-3">
                  {TABS.map(t => {
                    const cnt    = conteoTab(t.key);
                    const activo = tabActivo === t.key;
                    return (
                      <button key={t.key} onClick={() => setTabActivo(t.key)}
                        className="flex-grow-1 border rounded-3 fw-bold d-flex flex-column align-items-center py-2"
                        style={{ fontSize: 11, cursor: "pointer",
                          background:  activo ? t.bg     : C.grisFondo,
                          borderColor: activo ? t.border : C.verdeBorde,
                          color:       activo ? t.color  : C.grisTexto,
                          transition: "all 0.15s" }}>
                        <i className={`bi ${t.icon} mb-1`} style={{ fontSize: 16, color: activo ? t.color : C.grisBorde }} />
                        <span className="fw-bold" style={{ fontSize: 15 }}>{cnt}</span>
                        <span style={{ fontSize: 9 }}>{t.key}{cnt !== 1 ? "s" : ""}</span>
                      </button>
                    );
                  })}
                </div>

                {citasFiltradas.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-calendar-x" style={{ fontSize: 32, color: C.grisTexto }} />
                    <div className="fw-bold mt-2" style={{ fontSize: 13, color: C.grisTexto }}>
                      Sin citas {tabActivo.toLowerCase()}s este día
                    </div>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2" style={{ maxHeight: 340, overflowY: "auto" }}>
                    {citasFiltradas.map(cita => (
                      <button key={cita.id}
                        onClick={() => { setCitaActiva(cita); setPanel("detalle"); }}
                        className="border rounded-3 p-2 text-start w-100 d-flex align-items-center gap-3"
                        style={{ cursor: "pointer", transition: "background 0.15s", borderColor: C.verdeBorde, background: C.blanco }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.grisFondo; }}
                        onMouseLeave={e => { e.currentTarget.style.background = C.blanco; }}
                      >
                        <Av text={cita.av} size={40} />
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="fw-bold" style={{ fontSize: 13, color: C.negro }}>{cita.nombre}</div>
                          {tieneMateriales(cita) && (
                            <div className="mt-1 d-flex flex-wrap gap-1">
                              {cita.materiales.map(id => (
                                <span key={id} className="rounded-pill px-2 fw-bold" style={{ fontSize: 10, backgroundColor: C.verdeClaro, color: C.verdeOscuro }}>
                                  Material #{id}
                                </span>
                              ))}
                            </div>
                          )}
                          {cita.foto && (
                            <div className="mt-1 d-flex align-items-center gap-1" style={{ fontSize: 10, color: C.verde }}>
                              <i className="bi bi-image-fill" /><span className="fw-bold">Foto adjunta</span>
                            </div>
                          )}
                        </div>
                        <div className="d-flex flex-column align-items-end gap-1">
                          <BadgeEstado estado={cita.estado} />
                          <i className="bi bi-chevron-right" style={{ fontSize: 11, color: C.grisTexto }} />
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
            <div className="card" style={S.card}>
              <div className="card-body p-3 d-flex flex-column gap-3">

                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-sm fw-bold"
                    style={{ ...S.btnSecundario, fontSize: 11, padding: "3px 10px" }}
                    onClick={() => { setPanel("lista"); setCitaActiva(null); }}>
                    <i className="bi bi-arrow-left me-1" />Volver
                  </button>
                  <div className="fw-bold" style={{ fontSize: 14, color: C.negro }}>Detalle de cita</div>
                  <div className="ms-auto"><BadgeEstado estado={citaActiva.estado} /></div>
                </div>

                <div className="d-flex align-items-center gap-3 p-3 rounded-3"
                  style={{ backgroundColor: C.grisFondo, border: `1.5px solid ${C.verdeBorde}` }}>
                  <Av text={citaActiva.av} size={50} />
                  <div>
                    <div className="fw-bold" style={{ fontSize: 15, color: C.negro }}>{citaActiva.nombre}</div>
                    <div className="fw-semibold d-flex align-items-center gap-1" style={{ fontSize: 11, color: C.grisTexto }}>
                      <i className="bi bi-calendar3" />{selectedDay} de {MESES[month]} {year}
                    </div>
                  </div>
                </div>

                {tieneMateriales(citaActiva) && (
                  <div>
                    <div className="fw-bold mb-2 d-flex align-items-center gap-2" style={{ fontSize: 13, color: C.negro }}>
                      <i className="bi bi-recycle" style={{ color: C.verde }} />Materiales a entregar
                    </div>
                    <div className="d-flex flex-column gap-2">
                      {citaActiva.materiales.map(id => (
                        <div key={id} className="d-flex align-items-center gap-3 px-3 py-2 rounded-3"
                          style={{ backgroundColor: C.verdeClaro, border: `1.5px solid ${C.grisBorde}` }}>
                          <span className="fw-bold" style={{ fontSize: 13, color: C.verdeOscuro }}>Material #{id}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {citaActiva.estado === "Rechazada" && citaActiva.nota && (
                  <div className="rounded-3 p-2 d-flex align-items-start gap-2"
                    style={S.alertaError}>
                    <i className="bi bi-x-circle-fill mt-1" style={{ fontSize: 13, flexShrink: 0, color: C.rojo }} />
                    <div>
                      <div className="fw-bold" style={{ fontSize: 11, color: C.rojo }}>Motivo de rechazo</div>
                      <div style={{ fontSize: 12, color: C.negro }}>{citaActiva.nota}</div>
                    </div>
                  </div>
                )}

                {citaActiva.estado === "Pendiente" && (
                  <div className="d-flex gap-2">
                    <button className="btn fw-bold flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                      style={{ ...S.btnPrimario, fontSize: 13 }} onClick={handleAceptar}>
                      <i className="bi bi-check-circle-fill" /> Aceptar cita
                    </button>
                    <button className="btn fw-bold flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                      style={{ ...S.btnPeligro, fontSize: 13 }} onClick={() => setPanel("rechazar")}>
                      <i className="bi bi-x-circle-fill" /> Rechazar
                    </button>
                  </div>
                )}

                {citaActiva.estado === "Aceptada" && (
                  <div className="rounded-3 p-3 text-center d-flex flex-column align-items-center gap-1"
                    style={{ backgroundColor: C.verdeClaro, border: `1.5px solid ${C.verde}` }}>
                    <i className="bi bi-check-circle-fill" style={{ fontSize: 24, color: C.verde }} />
                    <div className="fw-bold" style={{ fontSize: 13, color: C.verdeOscuro }}>Cita aceptada</div>
                    <div style={{ fontSize: 11, color: C.verdeOscuro }}>El usuario ha sido notificado</div>
                  </div>
                )}

                {citaActiva.estado === "Rechazada" && (
                  <div className="rounded-3 p-3 text-center d-flex flex-column align-items-center gap-1"
                    style={{ backgroundColor: C.rojoclaro, border: `1.5px solid ${C.rojo}` }}>
                    <i className="bi bi-x-circle-fill" style={{ fontSize: 24, color: C.rojo }} />
                    <div className="fw-bold" style={{ fontSize: 13, color: C.rojo }}>Cita rechazada</div>
                    <div style={{ fontSize: 11, color: C.rojo }}>El usuario ha sido notificado</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Panel rechazar */}
          {selectedDay && panel === "rechazar" && citaActiva && (
            <div className="card" style={S.card}>
              <div className="card-body p-3 d-flex flex-column gap-3">
                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-sm fw-bold"
                    style={{ ...S.btnSecundario, fontSize: 11, padding: "3px 10px" }}
                    onClick={() => setPanel("detalle")}>
                    <i className="bi bi-arrow-left me-1" />Volver
                  </button>
                  <div className="fw-bold" style={{ fontSize: 14, color: C.negro }}>Rechazar cita</div>
                </div>

                <div className="d-flex align-items-center gap-3 p-3 rounded-3"
                  style={{ backgroundColor: C.rojoclaro, border: `1.5px solid ${C.rojoBorde}` }}>
                  <Av text={citaActiva.av} size={44} />
                  <div>
                    <div className="fw-bold" style={{ fontSize: 14, color: C.negro }}>{citaActiva.nombre}</div>
                    <div className="d-flex align-items-center gap-1" style={{ fontSize: 11, color: C.grisTexto }}>
                      <i className="bi bi-calendar3" />{selectedDay} de {MESES[month]} {year}
                    </div>
                    {tieneMateriales(citaActiva) && (
                      <div className="mt-1 d-flex flex-wrap gap-1">
                        {citaActiva.materiales.map(id => (
                          <span key={id} className="rounded-pill px-2 fw-bold" style={{ fontSize: 10, backgroundColor: C.verdeClaro, color: C.verdeOscuro }}>Material #{id}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="fw-bold mb-2 d-flex align-items-center gap-1" style={{ fontSize: 13, color: C.negro }}>
                    <i className="bi bi-chat-text" style={{ color: C.verde }} />Motivo del rechazo
                    <span className="fw-normal" style={{ fontSize: 10, color: C.grisTexto }}>(opcional)</span>
                  </label>
                  <textarea className="form-control" rows={3}
                    placeholder="Ej: El día está completo, no hay capacidad disponible..."
                    value={notaRechazo}
                    onChange={e => setNotaRechazo(e.target.value)}
                    style={{ ...S.input, resize: "none" }} />
                </div>

                <div className="rounded-3 p-2 d-flex align-items-center gap-2"
                  style={{ backgroundColor: C.amarilloClaro, border: `1.5px solid ${C.amarillo}` }}>
                  <i className="bi bi-exclamation-triangle-fill" style={{ color: C.amarillo }} />
                  <span className="fw-bold" style={{ fontSize: 11, color: C.negro }}>
                    Esta acción notificará al usuario que su cita fue rechazada.
                  </span>
                </div>

                <div className="d-flex gap-2">
                  <button className="btn fw-bold flex-grow-1"
                    style={{ ...S.btnSecundario, fontSize: 13 }}
                    onClick={() => setPanel("detalle")}>
                    <i className="bi bi-arrow-left me-1" />Cancelar
                  </button>
                  <button className="btn fw-bold flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                    style={{ ...S.btnPeligro, fontSize: 13 }}
                    onClick={handleRechazar}>
                    <i className="bi bi-x-circle-fill" />Confirmar rechazo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
