import { useState, useRef, useEffect } from "react";

const USUARIOS_SESION = [
  { av: "AL", bg: "#B5D4F4", txt: "#0C447C", nombre: "Andrés López",      hora: "Hace 2 min"  },
  { av: "CM", bg: "#9FE1CB", txt: "#085041", nombre: "Carolina Mejía",     hora: "Hace 5 min"  },
  { av: "JP", bg: "#F5C4B3", txt: "#712B13", nombre: "Juan Pablo Ruiz",    hora: "Hace 12 min" },
  { av: "VT", bg: "#CECBF6", txt: "#3C3489", nombre: "Valentina Torres",   hora: "Hace 18 min" },
  { av: "SR", bg: "#FAC775", txt: "#633806", nombre: "Santiago Rodríguez", hora: "Hace 25 min" },
  { av: "LD", bg: "#C0DD97", txt: "#27500A", nombre: "Laura Díaz",         hora: "Hace 31 min" },
  { av: "MH", bg: "#F4C0D1", txt: "#72243E", nombre: "Miguel Hernández",   hora: "Hace 40 min" },
  { av: "IS", bg: "#D3D1C7", txt: "#444441", nombre: "Isabella Sánchez",   hora: "Hace 52 min" },
  { av: "CF", bg: "#B5D4F4", txt: "#0C447C", nombre: "Camilo Flores",      hora: "Hace 1 h"    },
  { av: "NS", bg: "#9FE1CB", txt: "#085041", nombre: "Natalia Suárez",     hora: "Hace 1 h"    },
];

const CITAS = [
  { av: "AL", bg: "#B5D4F4", txt: "#0C447C", nombre: "Andrés López",      fecha: "Hoy 10:00 am",   material: "Plástico",  estado: "pendiente"  },
  { av: "CM", bg: "#9FE1CB", txt: "#085041", nombre: "Carolina Mejía",     fecha: "Hoy 11:30 am",   material: "Cartón",    estado: "confirmada" },
  { av: "JP", bg: "#F5C4B3", txt: "#712B13", nombre: "Juan Pablo Ruiz",    fecha: "Hoy 2:00 pm",    material: "Vidrio",    estado: "pendiente"  },
  { av: "VT", bg: "#CECBF6", txt: "#3C3489", nombre: "Valentina Torres",   fecha: "Mañana 9:00 am", material: "Plástico",  estado: "confirmada" },
  { av: "SR", bg: "#FAC775", txt: "#633806", nombre: "Santiago Rodríguez", fecha: "Mañana 3:00 pm", material: "Metal",     estado: "cancelada"  },
  { av: "LD", bg: "#C0DD97", txt: "#27500A", nombre: "Laura Díaz",         fecha: "22 May 10:00 am",material: "Cartón",    estado: "pendiente"  },
];

const NUEVAS_SESIONES = 3;
const NUEVAS_CITAS    = 2;

const ESTADO_ESTILO = {
  pendiente:  { bg: "#FFF8E1", color: "#F59E0B", label: "Pendiente"  },
  confirmada: { bg: "#E8F5E9", color: "#22C55E", label: "Confirmada" },
  cancelada:  { bg: "#FEECEC", color: "#E24B4A", label: "Cancelada"  },
};

const MATERIAL_ICON = {
  Plástico: "bi-cup-straw",
  Cartón:   "bi-box-seam",
  Vidrio:   "bi-gem",
  Metal:    "bi-wrench",
};

export default function Notificaciones() {
  const [abierto,   setAbierto]   = useState(false);
  const [pestaña,   setPestaña]   = useState("sesiones");
  const [verTodas,  setVerTodas]  = useState(false);
  const [modal,     setModal]     = useState(false);
  const [citas,     setCitas]     = useState(CITAS);
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

  return (
    <>
      <div ref={notifRef} style={{ position: "relative" }}>

        {/* Botón campana */}
        <button
          onClick={() => { setAbierto(v => !v); setVerTodas(false); }}
          className="btn btn-outline-dark border-2 rounded-2 d-flex align-items-center justify-content-center p-0"
          style={{ width: 38, height: 38, position: "relative" }}
          aria-label="Notificaciones"
        >
          <i className="bi bi-bell-fill text-dark" style={{ fontSize: 16 }} />
          <span style={{
            position: "absolute", top: 5, right: 6,
            width: 8, height: 8, background: "#E24B4A",
            borderRadius: "50%", border: "2px solid #fff"
          }} />
        </button>

        {/* Panel desplegable */}
        {abierto && (
          <div style={{
            position: "absolute", top: 46, right: 0,
            width: 360, background: "#fff",
            border: "0.5px solid #ddd", borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            zIndex: 9999, overflow: "hidden"
          }}>

            {/* Cabecera */}
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: "0.5px solid #eee"
            }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Notificaciones</span>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{
                  fontSize: 11, background: "#E6F1FB", color: "#185FA5",
                  padding: "3px 8px", borderRadius: 8, fontWeight: 500
                }}>
                  {NUEVAS_SESIONES} sesiones
                </span>
                <span style={{
                  fontSize: 11, background: "#FFF8E1", color: "#F59E0B",
                  padding: "3px 8px", borderRadius: 8, fontWeight: 500
                }}>
                  {NUEVAS_CITAS} citas
                </span>
              </div>
            </div>

            {/* Pestañas */}
            <div style={{
              display: "flex",
              borderBottom: "0.5px solid #eee"
            }}>
              {[
                { key: "sesiones", label: "Sesiones",        icon: "bi-person-check-fill" },
                { key: "citas",    label: "Citas agendadas", icon: "bi-calendar-check-fill" },
              ].map(p => (
                <button
                  key={p.key}
                  onClick={() => { setPestaña(p.key); setVerTodas(false); }}
                  style={{
                    flex: 1, padding: "10px 0", border: "none", cursor: "pointer",
                    background: pestaña === p.key ? "#fff" : "#f8f9fa",
                    borderBottom: pestaña === p.key ? "2px solid #185FA5" : "2px solid transparent",
                    color: pestaña === p.key ? "#185FA5" : "#888",
                    fontSize: 12, fontWeight: 600, transition: "all .15s"
                  }}
                >
                  <i className={`bi ${p.icon}`} style={{ marginRight: 5 }} />
                  {p.label}
                </button>
              ))}
            </div>

            {/* Contenido pestaña Sesiones */}
            {pestaña === "sesiones" && (
              <div style={{ maxHeight: 340, overflowY: "auto" }}>
                {(verTodas ? USUARIOS_SESION : USUARIOS_SESION.slice(0, 5)).map((u, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "10px 16px",
                      background: i < NUEVAS_SESIONES ? "#EFF6FF" : "#fff",
                      borderBottom: "0.5px solid #f0f0f0",
                      cursor: "pointer", transition: "background .15s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                    onMouseLeave={e => e.currentTarget.style.background = i < NUEVAS_SESIONES ? "#EFF6FF" : "#fff"}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: u.bg, color: u.txt,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 600, flexShrink: 0
                    }}>
                      {u.av}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{u.nombre}</span>
                        <span style={{ fontSize: 11, color: "#999", marginLeft: 6 }}>{u.hora}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                        <i className="bi bi-box-arrow-in-right" style={{ marginRight: 4 }} />
                        Inició sesión
                      </div>
                    </div>
                    {i < NUEVAS_SESIONES && (
                      <div style={{
                        width: 7, height: 7, background: "#378ADD",
                        borderRadius: "50%", flexShrink: 0, marginTop: 6
                      }} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Contenido pestaña Citas */}
            {pestaña === "citas" && (
              <div style={{ maxHeight: 340, overflowY: "auto" }}>
                {(verTodas ? citas : citas.slice(0, 4)).map((c, i) => {
                  const est = ESTADO_ESTILO[c.estado];
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "10px 16px",
                        borderBottom: "0.5px solid #f0f0f0",
                        background: i < NUEVAS_CITAS ? "#FFFBEA" : "#fff",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: "50%",
                          background: c.bg, color: c.txt,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 600, flexShrink: 0
                        }}>
                          {c.av}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{c.nombre}</span>
                            <span style={{
                              fontSize: 10, background: est.bg, color: est.color,
                              padding: "2px 8px", borderRadius: 6, fontWeight: 600
                            }}>
                              {est.label}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: "#666", marginTop: 3, display: "flex", gap: 12 }}>
                            <span><i className="bi bi-clock" style={{ marginRight: 3 }} />{c.fecha}</span>
                            <span>
                              <i className={`bi ${MATERIAL_ICON[c.material] || "bi-recycle"}`} style={{ marginRight: 3 }} />
                              {c.material}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Acciones rápidas */}
                      {c.estado === "pendiente" && (
                        <div style={{ display: "flex", gap: 6, marginTop: 8, marginLeft: 44 }}>
                          <button
                            onClick={() => cambiarEstado(i, "confirmada")}
                            style={{
                              fontSize: 11, padding: "3px 10px", borderRadius: 6, cursor: "pointer",
                              background: "#E8F5E9", color: "#22C55E",
                              border: "0.5px solid #22C55E", fontWeight: 600
                            }}
                          >
                            <i className="bi bi-check-lg" style={{ marginRight: 3 }} />Confirmar
                          </button>
                          <button
                            onClick={() => cambiarEstado(i, "cancelada")}
                            style={{
                              fontSize: 11, padding: "3px 10px", borderRadius: 6, cursor: "pointer",
                              background: "#FEECEC", color: "#E24B4A",
                              border: "0.5px solid #E24B4A", fontWeight: 600
                            }}
                          >
                            <i className="bi bi-x-lg" style={{ marginRight: 3 }} />Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer */}
            <div style={{
              padding: "10px 16px", textAlign: "center",
              borderTop: "0.5px solid #eee", display: "flex",
              justifyContent: "space-between", alignItems: "center"
            }}>
              <button
                onClick={() => setVerTodas(v => !v)}
                style={{
                  background: "none", border: "none",
                  fontSize: 12, color: "#185FA5",
                  fontWeight: 500, cursor: "pointer"
                }}
              >
                {verTodas ? "← Mostrar menos" : "Ver todas →"}
              </button>
              <button
                onClick={() => { setAbierto(false); setModal(true); }}
                style={{
                  background: "#185FA5", border: "none", color: "#fff",
                  fontSize: 12, fontWeight: 600, padding: "5px 14px",
                  borderRadius: 8, cursor: "pointer"
                }}
              >
                <i className="bi bi-arrows-fullscreen" style={{ marginRight: 5 }} />
                Ver completo
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Modal vista completa */}
      {modal && (
        <div
          onClick={() => setModal(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 99999,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 16,
              width: "90%", maxWidth: 800,
              maxHeight: "85vh", overflow: "hidden",
              display: "flex", flexDirection: "column"
            }}
          >
            {/* Header modal */}
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 24px",
              borderBottom: "0.5px solid #eee"
            }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>Centro de notificaciones</span>
              <button
                onClick={() => setModal(false)}
                style={{
                  background: "none", border: "none",
                  fontSize: 20, cursor: "pointer", color: "#888", lineHeight: 1
                }}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {/* Contenido modal en dos columnas */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 0, overflow: "auto", flex: 1
            }}>

              {/* Columna sesiones */}
              <div style={{ borderRight: "0.5px solid #eee" }}>
                <div style={{
                  padding: "12px 20px",
                  borderBottom: "0.5px solid #eee",
                  background: "#f8f9fa"
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#185FA5" }}>
                    <i className="bi bi-person-check-fill" style={{ marginRight: 6 }} />
                    Sesiones iniciadas
                  </span>
                </div>
                {USUARIOS_SESION.map((u, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 20px",
                    borderBottom: "0.5px solid #f0f0f0",
                    background: i < NUEVAS_SESIONES ? "#EFF6FF" : "#fff"
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: u.bg, color: u.txt,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 600, flexShrink: 0
                    }}>
                      {u.av}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{u.nombre}</div>
                      <div style={{ fontSize: 11, color: "#888" }}>{u.hora}</div>
                    </div>
                    {i < NUEVAS_SESIONES && (
                      <div style={{
                        width: 6, height: 6, background: "#378ADD",
                        borderRadius: "50%"
                      }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Columna citas */}
              <div>
                <div style={{
                  padding: "12px 20px",
                  borderBottom: "0.5px solid #eee",
                  background: "#f8f9fa"
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>
                    <i className="bi bi-calendar-check-fill" style={{ marginRight: 6 }} />
                    Citas agendadas
                  </span>
                </div>
                {citas.map((c, i) => {
                  const est = ESTADO_ESTILO[c.estado];
                  return (
                    <div key={i} style={{
                      padding: "10px 20px",
                      borderBottom: "0.5px solid #f0f0f0",
                      background: i < NUEVAS_CITAS ? "#FFFBEA" : "#fff"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: c.bg, color: c.txt,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 600, flexShrink: 0
                        }}>
                          {c.av}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{c.nombre}</span>
                            <span style={{
                              fontSize: 10, background: est.bg, color: est.color,
                              padding: "2px 8px", borderRadius: 6, fontWeight: 600
                            }}>
                              {est.label}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: "#888", marginTop: 2, display: "flex", gap: 10 }}>
                            <span><i className="bi bi-clock" style={{ marginRight: 3 }} />{c.fecha}</span>
                            <span>
                              <i className={`bi ${MATERIAL_ICON[c.material] || "bi-recycle"}`} style={{ marginRight: 3 }} />
                              {c.material}
                            </span>
                          </div>
                        </div>
                      </div>
                      {c.estado === "pendiente" && (
                        <div style={{ display: "flex", gap: 6, marginTop: 8, marginLeft: 42 }}>
                          <button
                            onClick={() => cambiarEstado(i, "confirmada")}
                            style={{
                              fontSize: 11, padding: "3px 10px", borderRadius: 6, cursor: "pointer",
                              background: "#E8F5E9", color: "#22C55E",
                              border: "0.5px solid #22C55E", fontWeight: 600
                            }}
                          >
                            <i className="bi bi-check-lg" style={{ marginRight: 3 }} />Confirmar
                          </button>
                          <button
                            onClick={() => cambiarEstado(i, "cancelada")}
                            style={{
                              fontSize: 11, padding: "3px 10px", borderRadius: 6, cursor: "pointer",
                              background: "#FEECEC", color: "#E24B4A",
                              border: "0.5px solid #E24B4A", fontWeight: 600
                            }}
                          >
                            <i className="bi bi-x-lg" style={{ marginRight: 3 }} />Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}