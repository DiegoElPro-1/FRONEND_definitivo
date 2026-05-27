// src/paneles/encargado/PanelControl.jsx
import { useState } from "react";
import { C, S, Av, StatCard } from "./encargadoTheme";

const ENTREGAS_INIT = [
  { id: 1, usuario: "Elena Santacruz", av: "ES", material: "Plástico",    kg: 3.2, hora: "08:14", prioridad: "alta"   },
  { id: 2, usuario: "Carlos Muñoz",    av: "CM", material: "Cartón",      kg: 7.5, hora: "08:45", prioridad: "normal" },
  { id: 3, usuario: "Laura Pérez",     av: "LP", material: "Vidrio",      kg: 2.1, hora: "09:02", prioridad: "normal" },
  { id: 4, usuario: "Andrés Torres",   av: "AT", material: "Metal",       kg: 5.0, hora: "09:30", prioridad: "alta"   },
  { id: 5, usuario: "María Gómez",     av: "MG", material: "Electrónico", kg: 1.4, hora: "09:55", prioridad: "baja"   },
];

const ALERTAS_INIT = [
  { id: 1, icon: "bi-exclamation-triangle-fill", color: C.rojo,   msg: "Stock de 'Entrada Cine' bajo (3 unidades)"          },
  { id: 2, icon: "bi-clock-fill",                color: "#f9a825", msg: "4 entregas sin procesar hace más de 30 min"         },
  { id: 3, icon: "bi-gift-fill",                 color: C.verde,  msg: "Laura Pérez tiene 2100 pts sin canjear"             },
  { id: 4, icon: "bi-exclamation-triangle-fill", color: C.rojo,   msg: "Stock de 'Descuento Transporte' bajo (5 unidades)"  },
];

const USUARIOS_ACTIVOS = [
  { id: 1, nombre: "Elena Santacruz", av: "ES", entregas: 4, pts: 1240 },
  { id: 2, nombre: "Laura Pérez",     av: "LP", entregas: 7, pts: 2100 },
  { id: 3, nombre: "Carlos Muñoz",    av: "CM", entregas: 3, pts: 870  },
];

const USUARIOS_PUNTO = [
  { id: 1, nombre: "Elena Santacruz", av: "ES", correo: "elena@mail.com", pts: 1240, entregas: 4 },
  { id: 2, nombre: "Laura Pérez",     av: "LP", correo: "laura@mail.com", pts: 2100, entregas: 7 },
  { id: 3, nombre: "Carlos Muñoz",    av: "CM", correo: "carlos@mail.com", pts: 870,  entregas: 3 },
  { id: 4, nombre: "Andrés Torres",   av: "AT", correo: "andres@mail.com", pts: 430,  entregas: 2 },
  { id: 5, nombre: "María Gómez",     av: "MG", correo: "maria@mail.com", pts: 1560, entregas: 5 },
  { id: 6, nombre: "Sofía Peña",      av: "SP", correo: "sofia@mail.com", pts: 690,  entregas: 3 },
];

const ENTREGAS_USUARIO = {
  1: [{ material: "Plástico", kg: 3.2, pts: 80,  fecha: "2026-05-12" }, { material: "Cartón",   kg: 2.0, pts: 50,  fecha: "2026-05-10" }],
  2: [{ material: "Vidrio",   kg: 2.1, pts: 60,  fecha: "2026-05-13" }, { material: "Papel",    kg: 4.5, pts: 90,  fecha: "2026-05-11" }, { material: "Plástico", kg: 1.8, pts: 45, fecha: "2026-05-08" }],
  3: [{ material: "Cartón",   kg: 7.5, pts: 150, fecha: "2026-05-12" }],
  4: [{ material: "Metal",    kg: 5.0, pts: 120, fecha: "2026-05-11" }, { material: "Vidrio",   kg: 1.2, pts: 30,  fecha: "2026-05-09" }],
  5: [{ material: "Electrónico", kg: 1.4, pts: 70,  fecha: "2026-05-13" }, { material: "Plástico", kg: 3.0, pts: 75,  fecha: "2026-05-10" }],
  6: [{ material: "Papel",    kg: 2.5, pts: 50,  fecha: "2026-05-12" }, { material: "Cartón",   kg: 1.8, pts: 45,  fecha: "2026-05-07" }],
};

const prioColor = {
  alta:   { bg: C.rojo,       text: "#fff",    label: "Alta"   },
  normal: { bg: C.verdeClaro, text: C.negro,   label: "Normal" },
  baja:   { bg: C.verde,      text: "#fff",    label: "Baja"   },
};

const MAT_ICON = {
  Plástico: "bi-bag", Cartón: "bi-box-seam", Vidrio: "bi-cup-straw",
  Papel: "bi-file-earmark", Metal: "bi-tools", Electrónico: "bi-cpu",
};

export default function PanelControl() {
  const [entregas, setEntregas]             = useState(ENTREGAS_INIT);
  const [alertas,  setAlertas]              = useState(ALERTAS_INIT);
  const [busqueda, setBusqueda]             = useState("");
  const [usuarioExpandido, setUsuarioExpandido] = useState(null);
  const [toast, setToast]                   = useState(null);

  const showToast = (msg, tipo = "success") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const procesarEntrega = (id) => {
    setEntregas(prev => prev.filter(e => e.id !== id));
    showToast("Entrega procesada correctamente");
  };

  const cerrarAlerta = (id) => setAlertas(prev => prev.filter(a => a.id !== id));

  const usuariosFiltrados = USUARIOS_PUNTO.filter(u =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ position: "relative" }}>

      {/* Toast */}
      {toast && (
        <div className="position-fixed d-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-lg fw-bold"
          style={{ bottom: 24, right: 24, zIndex: 9999, backgroundColor: toast.tipo === "success" ? C.verde : C.rojo, color: "#fff", fontSize: 13, border: `1.5px solid ${C.verdeBorde}` }}>
          <i className={`bi ${toast.tipo === "success" ? "bi-check-circle-fill" : "bi-x-circle-fill"}`} />
          {toast.msg}
        </div>
      )}

      {/* KPIs */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><StatCard icon="bi-people-fill"   label="Usuarios hoy"        valor={12}             sub="en este punto"  /></div>
        <div className="col-6 col-lg-3"><StatCard icon="bi-box-seam-fill" label="Entregas pendientes" valor={entregas.length} sub="sin procesar"    /></div>
        <div className="col-6 col-lg-3"><StatCard icon="bi-gift-fill"     label="Canjes hoy"          valor={5}              sub="completados"     /></div>
        <div className="col-6 col-lg-3"><StatCard icon="bi-star-fill"     label="Puntos entregados"   valor="3.2k"           sub="esta semana"     /></div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8 d-flex flex-column gap-4">

          {/* Usuarios del punto */}
          <div className="card" style={S.card}>
            <div className="card-body p-3">
              <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div className="fw-bold text-dark" style={{ fontSize: 15 }}>
                  <i className="bi bi-people-fill me-2" style={{ color: C.verde }} />Usuarios del punto
                </div>
                <div className="input-group" style={{ maxWidth: 240 }}>
                  <span className="input-group-text bg-white" style={{ border: `1.5px solid ${C.verdeBorde}` }}>
                    <i className="bi bi-search text-secondary" />
                  </span>
                  <input type="text" className="form-control" placeholder="Buscar usuario..."
                    value={busqueda} onChange={e => { setBusqueda(e.target.value); setUsuarioExpandido(null); }}
                    style={{ ...S.input, fontSize: 13 }} />
                </div>
              </div>

              <div className="d-flex flex-column gap-2">
                {usuariosFiltrados.length === 0 ? (
                  <div className="text-center py-4 text-secondary" style={{ fontSize: 13 }}>
                    <i className="bi bi-person-x d-block mb-1" style={{ fontSize: 24 }} />
                    {busqueda ? `Sin resultados para "${busqueda}"` : "No hay usuarios registrados"}
                  </div>
                ) : (
                  usuariosFiltrados.map(u => {
                    const expandido = usuarioExpandido === u.id;
                    const entregasU = ENTREGAS_USUARIO[u.id] ?? [];
                    return (
                      <div key={u.id} className="rounded-2 bg-white overflow-hidden" style={{ border: `1.5px solid ${expandido ? C.verde : C.verdeBorde}` }}>
                        <div className="d-flex align-items-center gap-3 p-2">
                          <Av text={u.av} size={38} />
                          <div className="flex-grow-1">
                            <div className="fw-bold text-dark" style={{ fontSize: 13 }}>{u.nombre}</div>
                            <div style={{ fontSize: 11, color: C.grisTexto }}>
                              <i className="bi bi-star-fill me-1" style={{ color: C.verde }} />{u.pts} pts · {u.entregas} entregas
                            </div>
                          </div>
                          <button onClick={() => setUsuarioExpandido(expandido ? null : u.id)}
                            className="btn fw-bold d-flex align-items-center gap-1"
                            style={{ fontSize: 11, border: `1.5px solid ${C.verdeBorde}`, backgroundColor: expandido ? C.verdeClaro : "#fff", color: C.verdeOscuro, padding: "4px 12px" }}>
                            <i className={`bi ${expandido ? "bi-chevron-up" : "bi-eye"}`} />
                            {expandido ? "Cerrar" : "Ver más"}
                          </button>
                        </div>

                        {expandido && (
                          <div style={{ borderTop: `1px solid ${C.verdeBorde}`, backgroundColor: C.grisFondo }}>
                            <div className="p-3">
                              <div className="d-flex gap-3 mb-3 flex-wrap">
                                <div className="flex-grow-1 p-2 rounded-2 text-center bg-white" style={{ border: `1px solid ${C.verdeBorde}` }}>
                                  <div className="fw-bold" style={{ fontSize: 18, color: C.verdeOscuro }}>{u.pts}</div>
                                  <div style={{ fontSize: 10, color: C.grisTexto }}>Puntos disponibles</div>
                                </div>
                                <div className="flex-grow-1 p-2 rounded-2 text-center bg-white" style={{ border: `1px solid ${C.verdeBorde}` }}>
                                  <div className="fw-bold" style={{ fontSize: 18, color: C.verdeOscuro }}>{u.entregas}</div>
                                  <div style={{ fontSize: 10, color: C.grisTexto }}>Entregas totales</div>
                                </div>
                                <div className="flex-grow-1 p-2 rounded-2 text-center bg-white" style={{ border: `1px solid ${C.verdeBorde}` }}>
                                  <div className="fw-bold" style={{ fontSize: 18, color: C.verdeOscuro }}>{entregasU.length}</div>
                                  <div style={{ fontSize: 10, color: C.grisTexto }}>Últimas entregas</div>
                                </div>
                              </div>

                              {entregasU.length > 0 && (
                                <>
                                  <div className="fw-bold mb-2" style={{ fontSize: 11, color: C.verdeOscuro }}>
                                    <i className="bi bi-clock-history me-1" />Últimas entregas
                                  </div>
                                  {entregasU.map((e, i) => {
                                    const icono = MAT_ICON[e.material] || "bi-recycle";
                                    return (
                                      <div key={i} className="d-flex align-items-center gap-2 py-1 px-2 rounded-1 mb-1 bg-white" style={{ border: `1px solid ${C.verdeBorde}` }}>
                                        <i className={`bi ${icono}`} style={{ color: C.verde, fontSize: 12 }} />
                                        <span className="fw-semibold" style={{ fontSize: 12, color: C.negro, flex: 1 }}>{e.material}</span>
                                        <span style={{ fontSize: 11, color: C.grisTexto }}>{e.kg} kg</span>
                                        <span className="fw-bold" style={{ fontSize: 11, color: C.verde }}>+{e.pts} pts</span>
                                        <span style={{ fontSize: 10, color: C.grisTexto }}>{e.fecha}</span>
                                      </div>
                                    );
                                  })}
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Lista entregas pendientes */}
          <div className="card" style={S.card}>
            <div className="card-body p-3">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="fw-bold text-dark" style={{ fontSize: 15 }}>
                  <i className="bi bi-box-seam-fill me-2" style={{ color: C.verde }} />Entregas pendientes
                </div>
                {entregas.length > 0 && (
                  <span className="badge fw-bold" style={{ fontSize: 11, backgroundColor: C.rojo, color: "#fff" }}>
                    {entregas.length} sin atender
                  </span>
                )}
              </div>

              {entregas.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-check-circle-fill" style={{ fontSize: 42, color: C.verde }} />
                  <div className="fw-bold text-dark mt-2" style={{ fontSize: 15 }}>¡Todo al día!</div>
                  <div className="text-secondary" style={{ fontSize: 12 }}>No hay entregas pendientes</div>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {entregas.map(e => (
                    <div key={e.id} className="rounded-2 bg-white overflow-hidden" style={{ border: `1.5px solid ${C.verdeBorde}` }}>
                      <div className="d-flex align-items-center gap-3 p-2">
                        <Av text={e.av} size={38} />
                        <div className="flex-grow-1">
                          <div className="fw-bold text-dark" style={{ fontSize: 13 }}>{e.usuario}</div>
                          <div className="text-secondary" style={{ fontSize: 11 }}>
                            <i className="bi bi-recycle me-1" style={{ color: C.verde }} />
                            {e.material} · {e.kg} kg · {e.hora}
                          </div>
                          {e.observacion && <div className="text-secondary fst-italic" style={{ fontSize: 10 }}><i className="bi bi-chat-left-text me-1" />{e.observacion}</div>}
                        </div>
                        <button className="btn fw-bold d-flex align-items-center gap-1" style={{ ...S.btnPrimario, fontSize: 11, padding: "5px 12px", whiteSpace: "nowrap" }} onClick={() => procesarEntrega(e.id)}>
                          <i className="bi bi-check2" /> Procesar
                        </button>
                      </div>
                      <div className="px-3 py-1" style={{ backgroundColor: C.grisFondo, borderTop: `1px solid ${C.verdeBorde}` }}>
                        <span className="badge fw-bold"
                          style={{ backgroundColor: prioColor[e.prioridad].bg, color: prioColor[e.prioridad].text, fontSize: 10, border: `1px solid ${C.verdeBorde}` }}>
                          <i className="bi bi-flag-fill me-1" />{prioColor[e.prioridad].label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="col-lg-4 d-flex flex-column gap-4">

          {/* Alertas */}
          <div className="card" style={S.card}>
            <div className="card-body p-3">
              <div className="fw-bold text-dark mb-3" style={{ fontSize: 15 }}>
                <i className="bi bi-bell-fill me-2" style={{ color: C.verde }} />Alertas del punto
                {alertas.length > 0 && <span className="badge fw-bold ms-2" style={{ fontSize: 10, backgroundColor: C.verdeClaro, color: C.verdeOscuro, border: `1px solid ${C.verdeBorde}` }}>{alertas.length}</span>}
              </div>
              {alertas.length === 0 ? (
                <div className="text-center py-3 text-secondary" style={{ fontSize: 13 }}>
                  <i className="bi bi-check-circle-fill me-2" style={{ color: C.verde }} />Sin alertas activas
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {alertas.map(a => (
                    <div key={a.id} className="d-flex align-items-start gap-2 p-2 rounded-2 bg-white" style={{ border: `1px solid ${C.verdeBorde}` }}>
                      <i className={`bi ${a.icon} flex-shrink-0 mt-1`} style={{ color: a.color, fontSize: 13 }} />
                      <span className="flex-grow-1 text-dark" style={{ fontSize: 12 }}>{a.msg}</span>
                      <button className="btn p-0 border-0 bg-transparent" onClick={() => cerrarAlerta(a.id)}>
                        <i className="bi bi-x-lg text-secondary" style={{ fontSize: 12 }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Usuarios más activos */}
          <div className="card" style={S.card}>
            <div className="card-body p-3">
              <div className="fw-bold text-dark mb-3" style={{ fontSize: 15 }}>
                <i className="bi bi-trophy-fill me-2" style={{ color: C.verde }} />Usuarios más activos
              </div>
              <div className="d-flex flex-column gap-2">
                {USUARIOS_ACTIVOS.map((u, i) => (
                  <div key={u.id} className="d-flex align-items-center gap-2 p-2 rounded-2 bg-white" style={{ border: `1px solid ${C.verdeBorde}` }}>
                    <span className="fw-bold d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                      style={{ width: 24, height: 24, fontSize: 11, backgroundColor: i === 0 ? C.verde : C.grisFondo, color: i === 0 ? "#fff" : C.negro, border: `1px solid ${C.verdeBorde}` }}>
                      {i + 1}
                    </span>
                    <Av text={u.av} size={32} />
                    <div className="flex-grow-1">
                      <div className="fw-bold text-dark" style={{ fontSize: 12 }}>{u.nombre}</div>
                      <div className="text-secondary" style={{ fontSize: 10 }}>{u.entregas} entregas · {u.pts} pts</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen del turno */}
          <div className="card" style={{ ...S.card, backgroundColor: C.verdeClaro }}>
            <div className="card-body p-3">
              <div className="fw-bold mb-3" style={{ fontSize: 15, color: C.verdeOscuro }}>
                <i className="bi bi-clock-history me-2" />Resumen del turno
              </div>
              <div className="d-flex flex-column gap-2">
                {[
                  { icon: "bi-box-seam-fill",  label: "Entregas procesadas", value: 8         },
                  { icon: "bi-recycle",         label: "Kg recolectados",     value: "47.3 kg" },
                  { icon: "bi-gift-fill",       label: "Canjes realizados",   value: 5         },
                  { icon: "bi-star-fill",       label: "Puntos entregados",   value: 620       },
                ].map((item, i) => (
                  <div key={i} className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <i className={`bi ${item.icon}`} style={{ color: C.verde, fontSize: 13 }} />
                      <span style={{ fontSize: 12, color: C.verdeOscuro }}>{item.label}</span>
                    </div>
                    <span className="fw-bold" style={{ fontSize: 13, color: C.verdeOscuro }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
