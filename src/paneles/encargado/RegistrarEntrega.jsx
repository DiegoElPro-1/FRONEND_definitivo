// src/components/RegistrarEntrega.jsx
import { useState, useEffect, useRef } from "react";
import { buscarUsuariosEncargado, registrarEntregaEncargado } from "../../services/api";

const MATERIALES = [
  { key: "papel",    idMaterial: 2, label: "Papel",    icon: "bi-file-earmark-text", ptsPorKg: 15, color: "#ffc107", colorText: "#000" },
  { key: "carton",   idMaterial: 3, label: "Cartón",   icon: "bi-box-seam",          ptsPorKg: 20, color: "#198754", colorText: "#fff" },
  { key: "vidrio",   idMaterial: 4, label: "Vidrio",   icon: "bi-cup-straw",         ptsPorKg: 25, color: "#000",    colorText: "#ffc107" },
  { key: "plastico", idMaterial: 1, label: "Plástico", icon: "bi-bag",               ptsPorKg: 30, color: "#198754", colorText: "#fff" },
];

const PESOS_INICIAL = { papel: "", carton: "", vidrio: "", plastico: "" };

export default function RegistrarEntrega() {
  const [usuarioBusqueda, setUsuarioBusqueda] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null); // { idUsuario, nombre, correo, puntosDisponibles }
  const [sugerencias, setSugerencias] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  const [pesos,    setPesos]   = useState(PESOS_INICIAL);
  const [enviado,  setEnviado] = useState(false);
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState("");
  const [resumen,  setResumen] = useState(null);

  const debounceRef = useRef(null);
  const wrapperRef  = useRef(null);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setMostrarSugerencias(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Buscar usuarios con debounce
  useEffect(() => {
    if (!usuarioBusqueda.trim() || usuarioSeleccionado) {
      setSugerencias([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setBuscando(true);
      try {
        const data = await buscarUsuariosEncargado(usuarioBusqueda);
        const lista = Array.isArray(data) ? data : (data.usuarios ?? []);
        setSugerencias(lista);
        setMostrarSugerencias(true);
      } catch {
        setSugerencias([]);
      } finally {
        setBuscando(false);
      }
    }, 350);
  }, [usuarioBusqueda, usuarioSeleccionado]);

  const handlePeso = (key, val) => {
    if (val === "" || (/^\d*\.?\d*$/.test(val) && Number(val) >= 0)) {
      setPesos(p => ({ ...p, [key]: val }));
    }
  };

  const seleccionarUsuario = (u) => {
    setUsuarioSeleccionado(u);
    setUsuarioBusqueda(u.nombre);
    setSugerencias([]);
    setMostrarSugerencias(false);
  };

  const limpiarUsuario = () => {
    setUsuarioSeleccionado(null);
    setUsuarioBusqueda("");
    setSugerencias([]);
  };

  const filas = MATERIALES.map(m => {
    const kg  = parseFloat(pesos[m.key]) || 0;
    const pts = Math.round(kg * m.ptsPorKg);
    return { ...m, kg, pts };
  });

  const totalKg  = filas.reduce((a, f) => a + f.kg,  0);
  const totalPts = filas.reduce((a, f) => a + f.pts, 0);
  const hayAlgo  = filas.some(f => f.kg > 0);

  const handleRegistrar = async () => {
    if (!usuarioSeleccionado || !hayAlgo) return;
    setLoading(true);
    setError("");

    try {
      const materialesPayload = filas
        .filter(f => f.kg > 0)
        .map(f => ({
          idMaterial:       f.idMaterial,
          peso:             f.kg,
          puntosGenerados:  f.pts,
        }));

      await registrarEntregaEncargado({
        idUsuario:  usuarioSeleccionado.idUsuario,
        materiales: materialesPayload,
      });

      setResumen({ usuario: usuarioSeleccionado.nombre, filas: filas.filter(f => f.kg > 0), totalKg, totalPts });
      setEnviado(true);
    } catch (e) {
      setError(e.message || "Error al registrar la entrega");
    } finally {
      setLoading(false);
    }
  };

  const handleNuevo = () => {
    setUsuarioBusqueda("");
    setUsuarioSeleccionado(null);
    setPesos(PESOS_INICIAL);
    setEnviado(false);
    setResumen(null);
    setError("");
  };

  // ── Vista de éxito ──────────────────────────────────────────────────────────
  if (enviado && resumen) {
    return (
      <div className="card border border-2 border-dark rounded-3 shadow-sm text-center p-5">
        <div
          className="d-flex align-items-center justify-content-center rounded-circle bg-success border border-2 border-dark mx-auto mb-3"
          style={{ width: 72, height: 72 }}
        >
          <i className="bi bi-check-lg text-white" style={{ fontSize: 36 }} />
        </div>
        <h4 className="fw-black text-dark mb-1">¡Entrega registrada!</h4>
        <p className="text-secondary mb-4" style={{ fontSize: 14 }}>
          La entrega de <strong>{resumen.usuario}</strong> fue guardada correctamente.
        </p>

        <div className="card border border-2 border-dark rounded-3 mb-4 text-start mx-auto" style={{ maxWidth: 420 }}>
          <div className="card-body p-3">
            <div className="fw-bold text-secondary text-uppercase mb-3" style={{ fontSize: 10, letterSpacing: 1 }}>
              Resumen de entrega
            </div>
            {resumen.filas.map(f => (
              <div key={f.key} className="d-flex align-items-center justify-content-between py-2 border-bottom border-light">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-2 border border-dark"
                    style={{ width: 30, height: 30, background: f.color, flexShrink: 0 }}
                  >
                    <i className={`bi ${f.icon}`} style={{ color: f.colorText, fontSize: 13 }} />
                  </div>
                  <span className="fw-semibold text-dark" style={{ fontSize: 13 }}>{f.label}</span>
                </div>
                <div className="text-end">
                  <span className="fw-bold text-dark" style={{ fontSize: 13 }}>{f.kg.toFixed(2)} kg</span>
                  <span className="text-success fw-bold ms-3" style={{ fontSize: 13 }}>+{f.pts} pts</span>
                </div>
              </div>
            ))}
            <div className="d-flex justify-content-between align-items-center pt-2">
              <span className="fw-black text-dark">Total</span>
              <div>
                <span className="fw-black text-dark">{resumen.totalKg.toFixed(2)} kg</span>
                <span className="fw-black text-success ms-3">+{resumen.totalPts} pts</span>
              </div>
            </div>
          </div>
        </div>

        <button onClick={handleNuevo} className="btn btn-warning border border-2 border-dark fw-bold px-4 mx-auto">
          <i className="bi bi-plus-circle-fill me-2" />
          Registrar otra entrega
        </button>
      </div>
    );
  }

  // ── Formulario ──────────────────────────────────────────────────────────────
  return (
    <div className="row g-3 justify-content-center">
      <div className="col-lg-7">
        <div className="card border border-2 border-dark rounded-3 shadow-sm">
          <div className="card-body p-4">

            {/* Header */}
            <div className="d-flex align-items-center gap-2 mb-4">
              <div
                className="d-flex align-items-center justify-content-center rounded-2 bg-warning border border-dark"
                style={{ width: 40, height: 40 }}
              >
                <i className="bi bi-plus-circle-fill text-dark fs-5" />
              </div>
              <div>
                <div className="fw-black text-dark" style={{ fontSize: 16 }}>Nueva entrega</div>
                <div className="text-secondary" style={{ fontSize: 12 }}>Completa los datos del reciclador</div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="alert alert-danger border border-2 border-dark d-flex align-items-center gap-2 mb-3 py-2">
                <i className="bi bi-exclamation-triangle-fill" />
                <span style={{ fontSize: 13 }}>{error}</span>
              </div>
            )}

            {/* Búsqueda usuario */}
            <div className="mb-4" ref={wrapperRef}>
              <label className="fw-bold text-secondary text-uppercase mb-1 d-block" style={{ fontSize: 10, letterSpacing: 1 }}>
                <i className="bi bi-person-fill me-1" />Nombre del usuario
              </label>
              <div className="position-relative">
                <input
                  type="text"
                  className={`form-control border border-2 fw-semibold ${usuarioSeleccionado ? "border-success" : "border-dark"}`}
                  placeholder="Ej: Diego Tamayo"
                  value={usuarioBusqueda}
                  onChange={e => { setUsuarioBusqueda(e.target.value); setUsuarioSeleccionado(null); }}
                  onFocus={() => sugerencias.length > 0 && setMostrarSugerencias(true)}
                  style={{ fontSize: 14, paddingRight: usuarioSeleccionado ? 36 : 14 }}
                  autoComplete="off"
                />
                {/* Botón limpiar */}
                {usuarioSeleccionado && (
                  <button
                    onClick={limpiarUsuario}
                    className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 bg-transparent text-secondary"
                    style={{ fontSize: 16 }}
                    title="Cambiar usuario"
                  >
                    <i className="bi bi-x-circle-fill" />
                  </button>
                )}
                {/* Spinner buscando */}
                {buscando && (
                  <div className="position-absolute top-50 end-0 translate-middle-y me-2">
                    <span className="spinner-border spinner-border-sm text-warning" />
                  </div>
                )}
                {/* Sugerencias */}
                {mostrarSugerencias && sugerencias.length > 0 && !usuarioSeleccionado && (
                  <div
                    className="position-absolute w-100 border border-2 border-dark rounded-3 bg-white shadow-lg"
                    style={{ top: "calc(100% + 4px)", zIndex: 1000, maxHeight: 220, overflowY: "auto" }}
                  >
                    {sugerencias.map(u => (
                      <div
                        key={u.idUsuario}
                        className="d-flex align-items-center gap-3 px-3 py-2 border-bottom border-light"
                        style={{ cursor: "pointer" }}
                        onMouseDown={() => seleccionarUsuario(u)}
                        onMouseEnter={e => e.currentTarget.style.background = "#fff9e6"}
                        onMouseLeave={e => e.currentTarget.style.background = ""}
                      >
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle bg-warning border border-dark fw-black"
                          style={{ width: 34, height: 34, fontSize: 13, flexShrink: 0 }}
                        >
                          {u.nombre?.slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-bold text-dark" style={{ fontSize: 13 }}>{u.nombre}</div>
                          <div className="text-secondary" style={{ fontSize: 11 }}>{u.correo}</div>
                        </div>
                        {u.puntosDisponibles !== undefined && (
                          <div className="ms-auto fw-black text-warning" style={{ fontSize: 13 }}>
                            {u.puntosDisponibles} pts
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {/* Sin resultados */}
                {mostrarSugerencias && !buscando && sugerencias.length === 0 && usuarioBusqueda.trim() && !usuarioSeleccionado && (
                  <div
                    className="position-absolute w-100 border border-2 border-dark rounded-3 bg-white shadow p-3 text-center text-secondary"
                    style={{ top: "calc(100% + 4px)", zIndex: 1000, fontSize: 13 }}
                  >
                    <i className="bi bi-person-x me-1" />No se encontró ningún usuario
                  </div>
                )}
              </div>
              {/* Badge usuario seleccionado */}
              {usuarioSeleccionado && (
                <div className="mt-2 d-inline-flex align-items-center gap-2 px-3 py-1 rounded-2 bg-success border border-dark">
                  <i className="bi bi-check-circle-fill text-white" style={{ fontSize: 12 }} />
                  <span className="fw-bold text-white" style={{ fontSize: 12 }}>{usuarioSeleccionado.nombre}</span>
                </div>
              )}
            </div>

            {/* Materiales */}
            <div className="fw-bold text-secondary text-uppercase mb-2" style={{ fontSize: 10, letterSpacing: 1 }}>
              <i className="bi bi-recycle me-1" />Peso por material (kg)
            </div>

            <div className="d-flex flex-column gap-2 mb-4">
              {MATERIALES.map(m => {
                const kg  = parseFloat(pesos[m.key]) || 0;
                const pts = Math.round(kg * m.ptsPorKg);
                return (
                  <div
                    key={m.key}
                    className="d-flex align-items-center gap-3 p-3 rounded-2 border border-2 border-dark"
                    style={{ background: "#fafafa" }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center rounded-2 border border-dark flex-shrink-0"
                      style={{ width: 42, height: 42, background: m.color }}
                    >
                      <i className={`bi ${m.icon}`} style={{ color: m.colorText, fontSize: 18 }} />
                    </div>
                    <div style={{ minWidth: 90 }}>
                      <div className="fw-black text-dark" style={{ fontSize: 14 }}>{m.label}</div>
                      <div className="text-secondary" style={{ fontSize: 11 }}>{m.ptsPorKg} pts / kg</div>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="0.0"
                      value={pesos[m.key]}
                      onChange={e => handlePeso(m.key, e.target.value)}
                      className="form-control border border-2 border-dark fw-bold text-center"
                      style={{ width: 90, fontSize: 16 }}
                    />
                    <span className="text-secondary fw-semibold" style={{ fontSize: 13 }}>kg</span>
                    <div className="ms-auto text-end">
                      <div className={`fw-black ${pts > 0 ? "text-success" : "text-secondary"}`} style={{ fontSize: 18 }}>
                        +{pts}
                      </div>
                      <div className="text-secondary" style={{ fontSize: 10 }}>puntos</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totales */}
            <div className="card border border-2 border-dark rounded-3 bg-warning mb-4">
              <div className="card-body p-3 d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-bold text-dark text-uppercase" style={{ fontSize: 10, letterSpacing: 1 }}>Total entrega</div>
                  <div className="fw-black text-dark" style={{ fontSize: 22 }}>{totalKg.toFixed(2)} kg</div>
                </div>
                <div className="text-end">
                  <div className="fw-bold text-dark text-uppercase" style={{ fontSize: 10, letterSpacing: 1 }}>Puntos a otorgar</div>
                  <div className="fw-black text-dark" style={{ fontSize: 28 }}>+{totalPts}</div>
                </div>
              </div>
            </div>

            {/* Botón */}
            <button
              onClick={handleRegistrar}
              disabled={!usuarioSeleccionado || !hayAlgo || loading}
              className="btn btn-success border border-2 border-dark fw-black w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              style={{ fontSize: 15 }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" />
                  Registrando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill" />
                  Registrar entrega
                </>
              )}
            </button>

            {(!usuarioSeleccionado || !hayAlgo) && !loading && (
              <div className="text-center text-secondary mt-2" style={{ fontSize: 11 }}>
                <i className="bi bi-info-circle me-1" />
                {!usuarioSeleccionado
                  ? "Busca y selecciona un usuario de la lista"
                  : "Ingresa al menos un material con peso mayor a 0"}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}