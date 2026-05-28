// src/components/RegistrarEntrega.jsx
import { useState, useEffect, useRef } from "react";
import { C, S } from "./encargadoTheme";
import { buscarUsuariosEncargado, registrarEntregaEncargado } from "../../services/api";

const MATERIALES = [
  { key: "papel",    idMaterial: 2, label: "Papel",    icon: "bi-file-earmark-text", ptsPorKg: 15, color: C.verde,       colorText: "#fff"        },
  { key: "carton",   idMaterial: 3, label: "Cartón",   icon: "bi-box-seam",          ptsPorKg: 20, color: C.verdeOscuro, colorText: "#fff"        },
  { key: "vidrio",   idMaterial: 4, label: "Vidrio",   icon: "bi-cup-straw",         ptsPorKg: 25, color: C.negro,       colorText: C.verde       },
  { key: "plastico", idMaterial: 1, label: "Plástico", icon: "bi-bag",               ptsPorKg: 30, color: C.verdeMedio,  colorText: C.verdeOscuro },
];

const ESTADOS_MATERIAL = [
  { id: 1, label: "Bueno",   icon: "bi-check-circle-fill", bg: C.verde,       text: "#fff",          descBg: C.verdeClaro  },
  { id: 2, label: "Regular", icon: "bi-dash-circle-fill",  bg: "#f9a825",     text: C.negro,         descBg: "#fff8e1"     },
  { id: 3, label: "Malo",    icon: "bi-x-circle-fill",     bg: C.negro,       text: C.verde,         descBg: C.grisFondo   },
];

const ESTADO_DESC = {
  1: "Material en buen estado, apto para reciclaje",
  2: "Material con algunas imperfecciones menores",
  3: "Material dañado o contaminado, requiere revisión",
};

const PRIORIDADES = [
  { key: "alta",   label: "Alta",   bg: C.rojo,       text: "#fff"    },
  { key: "normal", label: "Normal", bg: C.verdeClaro, text: C.negro   },
  { key: "baja",   label: "Baja",   bg: C.verde,      text: "#fff"    },
];

const PESOS_INICIAL   = { papel: "", carton: "", vidrio: "", plastico: "" };
const FORM_EXTRA_INIT = { prioridad: "normal", estadoMaterial: null, observacion: "" };

export default function RegistrarEntrega() {
  const [usuarioBusqueda,     setUsuarioBusqueda]     = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [sugerencias,         setSugerencias]         = useState([]);
  const [buscando,            setBuscando]            = useState(false);
  const [mostrarSugerencias,  setMostrarSugerencias]  = useState(false);
  const [pesos,     setPesos]     = useState(PESOS_INICIAL);
  const [formExtra, setFormExtra] = useState(FORM_EXTRA_INIT);
  const [enviado,   setEnviado]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [resumen,   setResumen]   = useState(null);
  const debounceRef = useRef(null);
  const wrapperRef  = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setMostrarSugerencias(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!usuarioBusqueda.trim() || usuarioSeleccionado) { setSugerencias([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setBuscando(true);
      try {
        const data = await buscarUsuariosEncargado(usuarioBusqueda);
        const lista = Array.isArray(data) ? data : (data.usuarios ?? []);
        setSugerencias(lista); setMostrarSugerencias(true);
      } catch { setSugerencias([]); }
      finally  { setBuscando(false); }
    }, 350);
  }, [usuarioBusqueda, usuarioSeleccionado]);

  const handlePeso = (key, val) => {
    if (val === "" || (/^\d*\.?\d*$/.test(val) && Number(val) >= 0)) setPesos(p => ({ ...p, [key]: val }));
  };

  const seleccionarUsuario = (u) => { setUsuarioSeleccionado(u); setUsuarioBusqueda(u.nombre); setSugerencias([]); setMostrarSugerencias(false); };
  const limpiarUsuario     = ()  => { setUsuarioSeleccionado(null); setUsuarioBusqueda(""); setSugerencias([]); };
  const setExtra = (campo, valor) => setFormExtra(prev => ({ ...prev, [campo]: valor }));

  const filas    = MATERIALES.map(m => { const kg = parseFloat(pesos[m.key]) || 0; return { ...m, kg, pts: Math.round(kg * m.ptsPorKg) }; });
  const totalKg  = filas.reduce((a, f) => a + f.kg,  0);
  const totalPts = filas.reduce((a, f) => a + f.pts, 0);
  const hayAlgo  = filas.some(f => f.kg > 0);
  const estadoSel = ESTADOS_MATERIAL.find(e => e.id === formExtra.estadoMaterial);
  const prioSel   = PRIORIDADES.find(p => p.key === formExtra.prioridad);

  const handleRegistrar = async () => {
    if (!usuarioSeleccionado || !hayAlgo) return;
    setLoading(true); setError("");
    try {
      const materialesPayload = filas.filter(f => f.kg > 0).map(f => ({ idMaterial: f.idMaterial, peso: f.kg, puntosGenerados: f.pts }));
      const data = await registrarEntregaEncargado({ idUsuario: usuarioSeleccionado.idUsuario, materiales: materialesPayload, prioridad: formExtra.prioridad, estadoMaterial: formExtra.estadoMaterial, observacion: formExtra.observacion });
      setResumen({ idEntrega: data?.idEntrega, usuario: usuarioSeleccionado.nombre, filas: filas.filter(f => f.kg > 0), totalKg, totalPts, prioridad: prioSel, estadoMaterial: estadoSel, observacion: formExtra.observacion });
      setEnviado(true);
    } catch (e) { setError(e.message || "Error al registrar la entrega"); }
    finally { setLoading(false); }
  };

  const handleNuevo = () => {
    setUsuarioBusqueda(""); setUsuarioSeleccionado(null);
    setPesos(PESOS_INICIAL); setFormExtra(FORM_EXTRA_INIT);
    setEnviado(false); setResumen(null); setError("");
  };

  // Vista éxito
  if (enviado && resumen) {
    const codigoEntrega = `ENT-${resumen.idEntrega}`;
    return (
      <div className="card text-center p-5" style={S.card}>
        <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3" style={{ width: 72, height: 72, backgroundColor: C.verde }}>
          <i className="bi bi-check-lg text-white" style={{ fontSize: 36 }} />
        </div>
        <h4 className="fw-bold text-dark mb-1">¡Entrega registrada!</h4>
        <p className="text-secondary mb-4" style={{ fontSize: 14 }}>La entrega de <strong>{resumen.usuario}</strong> fue guardada correctamente.</p>
        <div className="d-flex align-items-center justify-content-center gap-4 mb-4 flex-wrap">
          <div className="rounded-2 p-3 text-center" style={{ backgroundColor: C.verdeClaro, border: `1.5px solid ${C.verdeMedio}`, minWidth: 180 }}>
            <div className="fw-bold mb-1" style={{ fontSize: 11, color: C.verde, letterSpacing: 1 }}>CÓDIGO DE ENTREGA</div>
            <div className="fw-bold" style={{ fontSize: 22, letterSpacing: 3, color: C.verdeOscuro }}>{codigoEntrega}</div>
          </div>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${codigoEntrega}`}
            alt="QR de entrega" style={{ borderRadius: 8, border: `1.5px solid ${C.verdeBorde}` }} />
        </div>
        <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
          {resumen.prioridad && (
            <span className="badge fw-bold px-3 py-2" style={{ backgroundColor: resumen.prioridad.bg, color: resumen.prioridad.text, fontSize: 12, border: `1.5px solid ${C.verdeBorde}` }}>
              <i className="bi bi-flag-fill me-1" />Prioridad {resumen.prioridad.label}
            </span>
          )}
          {resumen.estadoMaterial && (
            <span className="badge fw-bold px-3 py-2" style={{ backgroundColor: resumen.estadoMaterial.bg, color: resumen.estadoMaterial.text, fontSize: 12, border: `1.5px solid ${C.verdeBorde}` }}>
              <i className={`bi ${resumen.estadoMaterial.icon} me-1`} />Estado: {resumen.estadoMaterial.label}
            </span>
          )}
        </div>
        <div className="card mb-4 text-start mx-auto" style={{ maxWidth: 440, ...S.card }}>
          <div className="card-body p-3">
            <div className="fw-bold text-secondary text-uppercase mb-3" style={{ fontSize: 10, letterSpacing: 1 }}>Resumen de entrega</div>
            {resumen.filas.map(f => (
              <div key={f.key} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <div className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0" style={{ width: 30, height: 30, backgroundColor: f.color, border: `1px solid ${C.verdeBorde}` }}>
                    <i className={`bi ${f.icon}`} style={{ color: f.colorText, fontSize: 13 }} />
                  </div>
                  <span className="fw-semibold text-dark" style={{ fontSize: 13 }}>{f.label}</span>
                </div>
                <div className="text-end">
                  <span className="fw-bold text-dark" style={{ fontSize: 13 }}>{f.kg.toFixed(2)} kg</span>
                  <span className="fw-bold ms-3" style={{ fontSize: 13, color: C.verde }}>+{f.pts} pts</span>
                </div>
              </div>
            ))}
            <div className="d-flex justify-content-between align-items-center pt-2">
              <span className="fw-bold text-dark">Total</span>
              <div>
                <span className="fw-bold text-dark">{resumen.totalKg.toFixed(2)} kg</span>
                <span className="fw-bold ms-3" style={{ color: C.verde }}>+{resumen.totalPts} pts</span>
              </div>
            </div>
            {resumen.observacion && (
              <div className="mt-3 pt-2 border-top">
                <div className="fw-bold text-secondary text-uppercase" style={{ fontSize: 10, letterSpacing: 1 }}>Observación</div>
                <div className="text-dark fst-italic mt-1" style={{ fontSize: 12 }}>
                  <i className="bi bi-chat-left-text-fill me-1" style={{ color: C.verde }} />{resumen.observacion}
                </div>
              </div>
            )}
          </div>
        </div>
        <button onClick={handleNuevo} className="btn fw-bold px-4 mx-auto d-flex align-items-center gap-2" style={S.btnPrimario}>
          <i className="bi bi-plus-circle-fill" />Registrar otra entrega
        </button>
      </div>
    );
  }

  // Formulario principal
  return (
    <div className="row g-3 justify-content-center">
      <div className="col-lg-8">
        <div className="card" style={S.card}>
          <div className="card-body p-4">
            <div className="d-flex align-items-center gap-2 mb-4">
              <div className="d-flex align-items-center justify-content-center rounded-2" style={{ width: 40, height: 40, backgroundColor: C.verde }}>
                <i className="bi bi-plus-circle-fill text-white fs-5" />
              </div>
              <div>
                <div className="fw-bold text-dark" style={{ fontSize: 16 }}>Nueva entrega</div>
                <div className="text-secondary" style={{ fontSize: 12 }}>Completa los datos del reciclador</div>
              </div>
            </div>

            {error && (
              <div className="d-flex align-items-center gap-2 rounded-2 mb-3 px-3 py-2" style={S.alertaError}>
                <i className="bi bi-exclamation-triangle-fill" /><span>{error}</span>
              </div>
            )}

            {/* Usuario + Prioridad */}
            <div className="row g-3 mb-3">
              <div className="col-md-6" ref={wrapperRef}>
                <label className="fw-bold text-dark text-uppercase mb-1 d-block" style={{ fontSize: 10, letterSpacing: 1 }}>
                  <i className="bi bi-person-fill me-1" style={{ color: C.verde }} />Usuario reciclador *
                </label>
                <div className="position-relative">
                  <input type="text" className="form-control fw-semibold" style={{ ...S.input, fontSize: 14, borderColor: usuarioSeleccionado ? C.verde : C.verdeBorde, paddingRight: usuarioSeleccionado ? 36 : 14 }}
                    placeholder="Ej: Diego Tamayo" value={usuarioBusqueda}
                    onChange={e => { setUsuarioBusqueda(e.target.value); setUsuarioSeleccionado(null); }}
                    onFocus={() => sugerencias.length > 0 && setMostrarSugerencias(true)} autoComplete="off" />
                  {usuarioSeleccionado && (
                    <button onClick={limpiarUsuario} className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 bg-transparent text-secondary" style={{ fontSize: 16 }}>
                      <i className="bi bi-x-circle-fill" />
                    </button>
                  )}
                  {buscando && <div className="position-absolute top-50 end-0 translate-middle-y me-2"><span className="spinner-border spinner-border-sm" style={{ color: C.verde }} /></div>}
                  {mostrarSugerencias && sugerencias.length > 0 && !usuarioSeleccionado && (
                    <div className="position-absolute w-100 bg-white rounded-3 shadow-lg" style={{ top: "calc(100% + 4px)", zIndex: 1000, maxHeight: 220, overflowY: "auto", border: `1.5px solid ${C.verdeBorde}` }}>
                      {sugerencias.map(u => (
                        <div key={u.idUsuario} className="d-flex align-items-center gap-3 px-3 py-2 border-bottom" style={{ cursor: "pointer" }}
                          onMouseDown={() => seleccionarUsuario(u)}
                          onMouseEnter={e => e.currentTarget.style.background = C.verdeClaro}
                          onMouseLeave={e => e.currentTarget.style.background = ""}>
                          <div className="d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0"
                            style={{ width: 34, height: 34, fontSize: 13, backgroundColor: C.verdeClaro, color: C.verdeOscuro, border: `1px solid ${C.verdeMedio}` }}>
                            {u.nombre?.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold text-dark" style={{ fontSize: 13 }}>{u.nombre}</div>
                            <div className="text-secondary" style={{ fontSize: 11 }}>{u.correo}</div>
                          </div>
                          {u.puntosDisponibles !== undefined && (
                            <div className="ms-auto fw-bold" style={{ fontSize: 13, color: C.verde }}>{u.puntosDisponibles} pts</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {mostrarSugerencias && !buscando && sugerencias.length === 0 && usuarioBusqueda.trim() && !usuarioSeleccionado && (
                    <div className="position-absolute w-100 rounded-3 bg-white shadow p-3 text-center text-secondary" style={{ top: "calc(100% + 4px)", zIndex: 1000, fontSize: 13, border: `1.5px solid ${C.verdeBorde}` }}>
                      <i className="bi bi-person-x me-1" />No se encontró ningún usuario
                    </div>
                  )}
                </div>
                {usuarioSeleccionado && (
                  <div className="mt-2 d-inline-flex align-items-center gap-2 px-3 py-1 rounded-2" style={{ backgroundColor: C.verde }}>
                    <i className="bi bi-check-circle-fill text-white" style={{ fontSize: 12 }} />
                    <span className="fw-bold text-white" style={{ fontSize: 12 }}>{usuarioSeleccionado.nombre}</span>
                    {usuarioSeleccionado.puntosDisponibles !== undefined && (
                      <span className="text-white opacity-75" style={{ fontSize: 11 }}>· {usuarioSeleccionado.puntosDisponibles} pts</span>
                    )}
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <label className="fw-bold text-dark text-uppercase mb-1 d-block" style={{ fontSize: 10, letterSpacing: 1 }}>
                  <i className="bi bi-flag-fill me-1" style={{ color: C.verde }} />Urgencia / Prioridad
                </label>
                <div className="d-flex gap-2">
                  {PRIORIDADES.map(p => (
                    <button key={p.key} type="button" onClick={() => setExtra("prioridad", p.key)}
                      className="btn flex-grow-1 fw-bold" style={{ fontSize: 13, border: `1.5px solid ${C.verdeBorde}`, backgroundColor: formExtra.prioridad === p.key ? p.bg : "#fff", color: formExtra.prioridad === p.key ? p.text : C.negro }}>
                      <i className="bi bi-circle-fill me-1" style={{ fontSize: 8 }} />{p.label}
                    </button>
                  ))}
                </div>
                {prioSel && (
                  <div className="mt-2">
                    <span className="badge fw-bold px-2 py-1" style={{ backgroundColor: prioSel.bg, color: prioSel.text, fontSize: 11, border: `1px solid ${C.verdeBorde}` }}>
                      <i className="bi bi-flag-fill me-1" />{prioSel.label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Estado del material */}
            <div className="mb-3">
              <label className="fw-bold text-dark text-uppercase mb-2 d-block" style={{ fontSize: 10, letterSpacing: 1 }}>
                <i className="bi bi-clipboard2-check-fill me-1" style={{ color: C.verde }} />Estado del material
                <span className="text-secondary fw-normal ms-1" style={{ fontSize: 10 }}>(opcional)</span>
              </label>
              <div className="d-flex gap-2 flex-wrap">
                {ESTADOS_MATERIAL.map(est => (
                  <button key={est.id} type="button" onClick={() => setExtra("estadoMaterial", formExtra.estadoMaterial === est.id ? null : est.id)}
                    className="btn fw-bold d-flex align-items-center gap-2 flex-grow-1" style={{ fontSize: 13, border: `1.5px solid ${C.verdeBorde}`, backgroundColor: formExtra.estadoMaterial === est.id ? est.bg : "#fff", color: formExtra.estadoMaterial === est.id ? est.text : C.negro }}>
                    <i className={`bi ${est.icon}`} style={{ fontSize: 14 }} />{est.label}
                  </button>
                ))}
              </div>
              {estadoSel && (
                <div className="mt-2 px-3 py-1 rounded-2 d-flex align-items-center gap-2" style={{ backgroundColor: estadoSel.descBg, fontSize: 12, border: `1px solid ${C.verdeBorde}` }}>
                  <i className={`bi ${estadoSel.icon}`} style={{ color: estadoSel.bg }} />
                  <span className="text-dark">{ESTADO_DESC[estadoSel.id]}</span>
                </div>
              )}
            </div>

            {/* Peso por material */}
            <div className="fw-bold text-dark text-uppercase mb-2" style={{ fontSize: 10, letterSpacing: 1 }}>
              <i className="bi bi-recycle me-1" style={{ color: C.verde }} />Peso por material (kg)
            </div>
            <div className="d-flex flex-column gap-2 mb-3">
              {MATERIALES.map(m => {
                const kg  = parseFloat(pesos[m.key]) || 0;
                const pts = Math.round(kg * m.ptsPorKg);
                return (
                  <div key={m.key} className="d-flex align-items-center gap-3 p-3 rounded-2" style={{ backgroundColor: kg > 0 ? C.verdeClaro : C.grisFondo, border: `1.5px solid ${C.verdeBorde}` }}>
                    <div className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0" style={{ width: 42, height: 42, backgroundColor: m.color, border: `1px solid ${C.verdeBorde}` }}>
                      <i className={`bi ${m.icon}`} style={{ color: m.colorText, fontSize: 18 }} />
                    </div>
                    <div style={{ minWidth: 90 }}>
                      <div className="fw-bold text-dark" style={{ fontSize: 14 }}>{m.label}</div>
                      <div className="text-secondary" style={{ fontSize: 11 }}>{m.ptsPorKg} pts / kg</div>
                    </div>
                    <input type="number" min="0" step="0.1" placeholder="0.0" value={pesos[m.key]} onChange={e => handlePeso(m.key, e.target.value)}
                      className="form-control fw-bold text-center" style={{ ...S.input, width: 90, fontSize: 16 }} />
                    <span className="text-secondary fw-semibold" style={{ fontSize: 13 }}>kg</span>
                    <div className="ms-auto text-end">
                      <div className="fw-bold" style={{ fontSize: 18, color: pts > 0 ? C.verde : "#adb5bd" }}>+{pts}</div>
                      <div className="text-secondary" style={{ fontSize: 10 }}>puntos</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Observación */}
            <div className="mb-4">
              <label className="fw-bold text-dark text-uppercase mb-1 d-block" style={{ fontSize: 10, letterSpacing: 1 }}>
                <i className="bi bi-chat-left-text-fill me-1" style={{ color: C.verde }} />Observación
                <span className="text-secondary fw-normal ms-1" style={{ fontSize: 10 }}>(opcional)</span>
              </label>
              <textarea className="form-control" style={{ ...S.input, fontSize: 13, resize: "none" }} rows={2}
                placeholder="Ej: Material en mal estado, requiere revisión..." value={formExtra.observacion} onChange={e => setExtra("observacion", e.target.value)} />
            </div>

            {/* Totales */}
            <div className="rounded-3 mb-4 p-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: C.verdeClaro, border: `1.5px solid ${C.verdeMedio}` }}>
              <div>
                <div className="fw-bold text-dark text-uppercase" style={{ fontSize: 10, letterSpacing: 1 }}>Total entrega</div>
                <div className="fw-bold text-dark" style={{ fontSize: 22 }}>{totalKg.toFixed(2)} kg</div>
              </div>
              <div className="d-flex flex-column align-items-center gap-1">
                {prioSel && <span className="badge fw-bold" style={{ backgroundColor: prioSel.bg, color: prioSel.text, fontSize: 10, border: `1px solid ${C.verdeBorde}` }}><i className="bi bi-flag-fill me-1" />{prioSel.label}</span>}
                {estadoSel && <span className="badge fw-bold" style={{ backgroundColor: estadoSel.bg, color: estadoSel.text, fontSize: 10, border: `1px solid ${C.verdeBorde}` }}><i className={`bi ${estadoSel.icon} me-1`} />{estadoSel.label}</span>}
              </div>
              <div className="text-end">
                <div className="fw-bold text-dark text-uppercase" style={{ fontSize: 10, letterSpacing: 1 }}>Puntos a otorgar</div>
                <div className="fw-bold text-dark" style={{ fontSize: 28 }}>+{totalPts}</div>
              </div>
            </div>

            {/* Botón registrar */}
            <button onClick={handleRegistrar} disabled={!usuarioSeleccionado || !hayAlgo || loading}
              className="btn fw-bold w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              style={{ ...S.btnPrimario, fontSize: 15, backgroundColor: !usuarioSeleccionado || !hayAlgo ? "#adb5bd" : C.verde }}>
              {loading ? <><span className="spinner-border spinner-border-sm" />Registrando...</> : <><i className="bi bi-check-circle-fill" />Registrar entrega</>}
            </button>
            {(!usuarioSeleccionado || !hayAlgo) && !loading && (
              <div className="text-center text-secondary mt-2" style={{ fontSize: 11 }}>
                <i className="bi bi-info-circle me-1" />
                {!usuarioSeleccionado ? "Busca y selecciona un usuario de la lista" : "Ingresa al menos un material con peso mayor a 0"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}