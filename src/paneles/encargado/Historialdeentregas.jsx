// src/paneles/encargado/HistorialdeEntregas.jsx
import { useState, useEffect } from "react";
import Badge from "./Badge";
import Av    from "./Av";
import {
  getEntregasEncargado,
  getEntregaEncargado,
  getMaterialesEncargado,
  actualizarEstadoEntregaEncargado,
} from "../../services/api";

const MAT_ICON = {
  "Plástico (PET)": "bi-bag",
  "Plástico":       "bi-bag",
  "Cartón":         "bi-box-seam",
  "Vidrio":         "bi-cup-straw",
  "Papel":          "bi-file-earmark",
};

const ESTADOS = ["Todos", "Pendiente", "Completada", "Cancelada"];

// Paleta prioridad — amarillo / verde / negro
const PRIO_CONFIG = {
  alta:   { bg: "#212529", text: "#ffc107", label: "Alta"   },
  normal: { bg: "#ffc107", text: "#212529", label: "Normal" },
  baja:   { bg: "#198754", text: "#fff",    label: "Baja"   },
};

// Estado del material — mismo esquema que RegistrarEntrega
const ESTADO_MAT_CONFIG = {
  1: { label: "Bueno",   icon: "bi-check-circle-fill", bg: "#198754", text: "#fff"    },
  2: { label: "Regular", icon: "bi-dash-circle-fill",  bg: "#ffc107", text: "#212529" },
  3: { label: "Malo",    icon: "bi-x-circle-fill",     bg: "#212529", text: "#ffc107" },
};

function BadgePrioridad({ prioridad }) {
  if (!prioridad) return null;
  const cfg = PRIO_CONFIG[prioridad?.toLowerCase()] ?? PRIO_CONFIG.normal;
  return (
    <span
      className="badge border border-dark fw-bold"
      style={{ background: cfg.bg, color: cfg.text, fontSize: 10 }}
    >
      <i className="bi bi-flag-fill me-1" />{cfg.label}
    </span>
  );
}

function BadgeEstadoMat({ estadoMaterial }) {
  if (!estadoMaterial) return null;
  const cfg = ESTADO_MAT_CONFIG[estadoMaterial];
  if (!cfg) return null;
  return (
    <span
      className="badge border border-dark fw-bold"
      style={{ background: cfg.bg, color: cfg.text, fontSize: 10 }}
    >
      <i className={`bi ${cfg.icon} me-1`} />{cfg.label}
    </span>
  );
}

function getIniciales(nombre = "") {
  return nombre.split(" ").slice(0, 2).map(p => p[0]?.toUpperCase()).join("");
}

function capitalizar(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// normalizar ahora incluye prioridad y estadoMaterial sin romper nada previo
function normalizar(e) {
  const nombre   = e.usuario?.nombre   ?? e.nombre   ?? "—";

  const material = e.detalles?.[0]?.material?.nombre
                ?? e.materiales?.[0]?.material?.nombre
                ?? e.material?.nombre
                ?? e.material
                ?? "—";

  const peso     = e.detalles?.[0]?.peso
                ?? e.materiales?.[0]?.peso
                ?? e.peso
                ?? 0;

  const pts      = e.detalles?.[0]?.puntosGenerados
                ?? e.materiales?.[0]?.puntosGenerados
                ?? e.pts
                ?? e.puntos
                ?? 0;

  const fecha    = (e.fechaEntrega ?? e.createdAt ?? e.fecha ?? "").split("T")[0];
  const estado   = capitalizar(e.estadoEntrega?.nombre ?? e.estado ?? "Pendiente");
  const obs      = e.observacion ?? e.obs ?? "";

  // ── campos nuevos (opcionales, no rompen si el backend no los trae) ──
  const prioridad      = e.prioridad ?? null;
  const estadoMaterial = e.estadoMaterial ?? null;

  return {
    id: e.idEntrega ?? e.id,
    nombre,
    av: getIniciales(nombre),
    material,
    peso:     Number(peso),
    pts:      Number(pts),
    fecha,
    estado,
    obs,
    prioridad,
    estadoMaterial,
    _raw: e,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL CORREGIR PUNTOS (sin cambios funcionales)
// ══════════════════════════════════════════════════════════════════════════════
function ModalCorregirPts({ entrega, onGuardar, onCerrar }) {
  const [nuevosPts, setNuevosPts] = useState(entrega.pts);
  const [motivo,    setMotivo]    = useState("");

  const guardar = () => {
    if (!nuevosPts || isNaN(nuevosPts) || Number(nuevosPts) < 0) return;
    onGuardar(entrega.id, Number(nuevosPts));
    onCerrar();
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
      onClick={onCerrar}
    >
      <div
        className="card border border-2 border-dark rounded-3 shadow-lg"
        style={{ width: 380 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="fw-black text-dark" style={{ fontSize: 16 }}>
              <i className="bi bi-arrow-repeat me-2" style={{ color: "#ffc107" }} />Corregir puntos
            </div>
            <button onClick={onCerrar} className="btn btn-sm btn-outline-dark border-2 rounded-2 p-0" style={{ width: 28, height: 28 }}>
              <i className="bi bi-x" />
            </button>
          </div>

          <div className="p-2 rounded-2 border border-dark mb-3 d-flex align-items-center gap-2" style={{ background: "#ffc107" }}>
            <Av text={entrega.av} size={32} bg="#212529" color="#ffc107" />
            <div>
              <div className="fw-bold text-dark" style={{ fontSize: 13 }}>{entrega.nombre}</div>
              <div className="text-dark" style={{ fontSize: 11 }}>{entrega.material} · {entrega.peso} kg</div>
            </div>
          </div>

          <div className="mb-3">
            <label className="fw-bold text-secondary text-uppercase mb-1 d-block" style={{ fontSize: 10, letterSpacing: 1 }}>Puntos actuales</label>
            <div className="fw-black" style={{ fontSize: 28, color: "#ffc107" }}>{entrega.pts} pts</div>
          </div>

          <div className="mb-3">
            <label className="fw-bold text-secondary text-uppercase mb-1 d-block" style={{ fontSize: 10, letterSpacing: 1 }}>Nuevos puntos</label>
            <input
              type="number" min="0"
              className="form-control border-2 border-dark fw-bold"
              style={{ fontSize: 18 }}
              value={nuevosPts}
              onChange={e => setNuevosPts(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="fw-bold text-secondary text-uppercase mb-1 d-block" style={{ fontSize: 10, letterSpacing: 1 }}>Motivo de corrección</label>
            <textarea
              className="form-control border-2 border-dark"
              rows={2}
              placeholder="Ej: Error de pesaje, corrección manual..."
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              style={{ fontSize: 13, resize: "none" }}
            />
          </div>

          <div className="d-flex gap-2">
            <button onClick={onCerrar} className="btn btn-outline-dark border-2 fw-bold flex-fill">Cancelar</button>
            <button
              onClick={guardar}
              className="btn fw-bold flex-fill border border-2 border-dark"
              style={{ background: "#ffc107", color: "#212529" }}
            >
              <i className="bi bi-check-circle-fill me-1" /> Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL EDITAR (sin cambios funcionales)
// ══════════════════════════════════════════════════════════════════════════════
function ModalEditar({ entrega, materiales, onGuardar, onCerrar }) {
  const [peso,     setPeso]     = useState(entrega.peso);
  const [material, setMaterial] = useState(entrega.material);
  const [fecha,    setFecha]    = useState(entrega.fecha);

  const guardar = () => {
    if (!peso || isNaN(peso) || Number(peso) <= 0) return;
    onGuardar(entrega.id, { peso: Number(peso), material, fecha });
    onCerrar();
  };

  const listaMateriales = materiales.length > 0
    ? materiales.map(m => m.nombre ?? m)
    : ["Papel", "Cartón", "Vidrio", "Plástico"];

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
      onClick={onCerrar}
    >
      <div
        className="card border border-2 border-dark rounded-3 shadow-lg"
        style={{ width: 400 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="fw-black text-dark" style={{ fontSize: 16 }}>
              <i className="bi bi-pencil-square me-2" style={{ color: "#198754" }} />Editar entrega
            </div>
            <button onClick={onCerrar} className="btn btn-sm btn-outline-dark border-2 rounded-2 p-0" style={{ width: 28, height: 28 }}>
              <i className="bi bi-x" />
            </button>
          </div>

          <div className="p-2 rounded-2 border border-dark mb-3 d-flex align-items-center gap-2" style={{ background: "#ffc107" }}>
            <Av text={entrega.av} size={32} bg="#212529" color="#ffc107" />
            <div className="fw-bold text-dark" style={{ fontSize: 13 }}>{entrega.nombre}</div>
          </div>

          <div className="mb-3">
            <label className="fw-bold text-secondary text-uppercase mb-1 d-block" style={{ fontSize: 10, letterSpacing: 1 }}>Material</label>
            <select
              className="form-select border-2 border-dark fw-semibold"
              value={material}
              onChange={e => setMaterial(e.target.value)}
              style={{ fontSize: 13 }}
            >
              {listaMateriales.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div className="mb-3">
            <label className="fw-bold text-secondary text-uppercase mb-1 d-block" style={{ fontSize: 10, letterSpacing: 1 }}>Peso (kg)</label>
            <input
              type="number" min="0" step="0.1"
              className="form-control border-2 border-dark fw-bold"
              style={{ fontSize: 16 }}
              value={peso}
              onChange={e => setPeso(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="fw-bold text-secondary text-uppercase mb-1 d-block" style={{ fontSize: 10, letterSpacing: 1 }}>Fecha</label>
            <input
              type="date"
              className="form-control border-2 border-dark fw-semibold"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              style={{ fontSize: 13 }}
            />
          </div>

          <div className="d-flex gap-2">
            <button onClick={onCerrar} className="btn btn-outline-dark border-2 fw-bold flex-fill">Cancelar</button>
            <button
              onClick={guardar}
              className="btn fw-bold flex-fill border border-2 border-dark"
              style={{ background: "#198754", color: "#fff" }}
            >
              <i className="bi bi-check-circle-fill me-1" /> Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DETALLE DE ENTREGA — ahora muestra prioridad y estadoMaterial
// ══════════════════════════════════════════════════════════════════════════════
function DetalleEntrega({ entrega, onVolver, onCambiarEstado, onCorregirPts, onEditar, loadingDetalle }) {
  const siguienteEstado = entrega.estado === "Completada" ? "Pendiente" : "Completada";
  const [obsEdit,     setObsEdit]     = useState(entrega.obs || "");
  const [obsSaved,    setObsSaved]    = useState(entrega.obs || "");
  const [editandoObs, setEditandoObs] = useState(false);

  const prioConf = entrega.prioridad ? PRIO_CONFIG[entrega.prioridad?.toLowerCase()] : null;
  const estMatConf = entrega.estadoMaterial ? ESTADO_MAT_CONFIG[entrega.estadoMaterial] : null;

  if (loadingDetalle) {
    return (
      <div className="text-center py-5">
        <span className="spinner-border" style={{ color: "#ffc107" }} />
        <div className="text-secondary mt-2" style={{ fontSize: 13 }}>Cargando detalle...</div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onVolver}
        className="btn btn-outline-dark border-2 fw-bold mb-4 d-flex align-items-center gap-2"
      >
        <i className="bi bi-arrow-left" /> Volver al historial
      </button>

      <div className="row g-3">

        {/* ── Card info reciclador ── */}
        <div className="col-md-6">
          <div className="card border border-2 border-dark rounded-3 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="fw-bold text-secondary text-uppercase mb-3" style={{ fontSize: 10, letterSpacing: 1 }}>
                Información del reciclador
              </div>
              <div
                className="d-flex align-items-center gap-3 mb-4 p-3 rounded-2 border border-dark"
                style={{ background: "#ffc107" }}
              >
                <Av text={entrega.av} size={52} bg="#212529" color="#ffc107" />
                <div>
                  <div className="fw-black text-dark" style={{ fontSize: 16 }}>{entrega.nombre}</div>
                  <div className="fw-semibold text-dark" style={{ fontSize: 12 }}>Usuario reciclador</div>
                  <div className="mt-1 d-flex flex-wrap gap-1">
                    <Badge estado={entrega.estado} />
                    <BadgePrioridad prioridad={entrega.prioridad} />
                    <BadgeEstadoMat estadoMaterial={entrega.estadoMaterial} />
                  </div>
                </div>
              </div>

              <div className="d-flex flex-column gap-2 mb-3">
                {[
                  ["bi-box-seam",     "Material", entrega.material],
                  ["bi-speedometer2", "Peso",     `${entrega.peso} kg`],
                  ["bi-calendar3",    "Fecha",    entrega.fecha],
                ].map(([icon, label, val]) => (
                  <div
                    key={label}
                    className="d-flex align-items-center gap-2 p-2 rounded-2 border border-dark"
                    style={{ background: "#f8f9fa" }}
                  >
                    <i className={`bi ${icon}`} style={{ fontSize: 15, width: 18, color: "#198754" }} />
                    <span className="text-secondary fw-semibold" style={{ fontSize: 12 }}>{label}:</span>
                    <span className="fw-bold text-dark" style={{ fontSize: 13 }}>{val}</span>
                  </div>
                ))}

                {/* Prioridad como fila de detalle */}
                {prioConf && (
                  <div
                    className="d-flex align-items-center gap-2 p-2 rounded-2 border border-dark"
                    style={{ background: "#f8f9fa" }}
                  >
                    <i className="bi bi-flag-fill" style={{ fontSize: 15, width: 18, color: "#ffc107" }} />
                    <span className="text-secondary fw-semibold" style={{ fontSize: 12 }}>Prioridad:</span>
                    <BadgePrioridad prioridad={entrega.prioridad} />
                  </div>
                )}

                {/* Estado del material como fila de detalle */}
                {estMatConf && (
                  <div
                    className="d-flex align-items-center gap-2 p-2 rounded-2 border border-dark"
                    style={{ background: "#f8f9fa" }}
                  >
                    <i className={`bi ${estMatConf.icon}`} style={{ fontSize: 15, width: 18, color: estMatConf.bg }} />
                    <span className="text-secondary fw-semibold" style={{ fontSize: 12 }}>Estado material:</span>
                    <BadgeEstadoMat estadoMaterial={entrega.estadoMaterial} />
                  </div>
                )}
              </div>

              <button
                onClick={() => onCambiarEstado(entrega.id, siguienteEstado)}
                className="btn fw-bold w-100 d-flex align-items-center justify-content-center gap-2 border border-2 border-dark"
                style={{
                  background: entrega.estado === "Completada" ? "#fff"     : "#198754",
                  color:      entrega.estado === "Completada" ? "#212529"  : "#fff",
                }}
              >
                <i className={`bi ${entrega.estado === "Completada" ? "bi-arrow-counterclockwise" : "bi-check-circle-fill"}`} />
                {entrega.estado === "Completada" ? "Marcar como Pendiente" : "Marcar como Completada"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Card puntos ── */}
        <div className="col-md-6">
          <div className="card border border-2 border-dark rounded-3 shadow-sm h-100">
            <div className="card-body p-4 d-flex flex-column align-items-center justify-content-center text-center">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 border border-dark mb-3"
                style={{ width: 60, height: 60, background: "#198754" }}
              >
                <i className="bi bi-recycle text-white" style={{ fontSize: 28 }} />
              </div>
              <div className="text-secondary fw-semibold mb-1" style={{ fontSize: 13 }}>Puntos otorgados</div>
              <div className="fw-black" style={{ fontSize: 56, color: "#ffc107" }}>{entrega.pts}</div>
              <div className="text-secondary" style={{ fontSize: 12 }}>puntos</div>
              <div className="mt-4 d-flex gap-2 w-100">
                <button
                  onClick={() => onEditar(entrega)}
                  className="btn btn-outline-dark border-2 fw-bold flex-fill btn-sm"
                >
                  <i className="bi bi-pencil me-1" /> Editar
                </button>
                <button
                  onClick={() => onCorregirPts(entrega)}
                  className="btn fw-bold flex-fill btn-sm border border-2 border-dark"
                  style={{ background: "#ffc107", color: "#212529" }}
                >
                  <i className="bi bi-arrow-repeat me-1" /> Corregir pts
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Observaciones ── */}
        <div className="col-12">
          <div className="card border border-2 border-dark rounded-3 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="fw-bold text-secondary text-uppercase" style={{ fontSize: 10, letterSpacing: 1 }}>
                  <i className="bi bi-chat-left-text-fill me-1" style={{ color: "#ffc107" }} />
                  Observaciones
                </div>
                <button
                  onClick={() => setEditandoObs(o => !o)}
                  className="btn btn-sm btn-outline-dark border-2 fw-bold"
                  style={{ fontSize: 11 }}
                >
                  <i className={`bi ${editandoObs ? "bi-x" : "bi-pencil"} me-1`} />
                  {editandoObs ? "Cancelar" : "Editar"}
                </button>
              </div>

              {editandoObs ? (
                <>
                  <textarea
                    className="form-control border-2 border-dark mb-2"
                    rows={3}
                    value={obsEdit}
                    onChange={e => setObsEdit(e.target.value)}
                    placeholder="Escribe una observación..."
                    style={{ fontSize: 13, resize: "none" }}
                  />
                  <button
                    onClick={() => { setObsSaved(obsEdit); setEditandoObs(false); }}
                    className="btn fw-bold btn-sm border border-2 border-dark"
                    style={{ background: "#198754", color: "#fff" }}
                  >
                    <i className="bi bi-floppy me-1" /> Guardar observación
                  </button>
                </>
              ) : (
                <div
                  className="rounded-2 p-3 border border-dark text-secondary fst-italic"
                  style={{ background: "#f8f9fa", fontSize: 14 }}
                >
                  {obsSaved || "Sin observaciones registradas."}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function HistorialdeEntregas() {
  const [entregas,     setEntregas]     = useState([]);
  const [materiales,   setMateriales]   = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [filtroMat,    setFiltroMat]    = useState("Todos");
  const [filtroEst,    setFiltroEst]    = useState("Todos");
  const [filtroPrio,   setFiltroPrio]   = useState("Todos");
  const [busqueda,     setBusqueda]     = useState("");
  const [modalPts,     setModalPts]     = useState(null);
  const [modalEditar,  setModalEditar]  = useState(null);

  const [loading,        setLoading]        = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [error,          setError]          = useState("");

  // ── Fetch — sin cambios ──────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getEntregasEncargado(),
      getMaterialesEncargado(),
    ])
      .then(([dataEntregas, dataMateriales]) => {
        const listaE = Array.isArray(dataEntregas)
          ? dataEntregas
          : (dataEntregas.entregas ?? []);
        const listaM = Array.isArray(dataMateriales)
          ? dataMateriales
          : (dataMateriales.materiales ?? []);
        setEntregas(listaE.map(normalizar));
        setMateriales(listaM);
      })
      .catch(e => setError(e.message || "Error al cargar las entregas"))
      .finally(() => setLoading(false));
  }, []);

  // ── Handlers — sin cambios en lógica de backend ──────────────────────────
  const handleCambiarEstado = async (id, nuevoEstado) => {
    const idEstado = nuevoEstado === "Completada" ? 2 : 1;
    try {
      await actualizarEstadoEntregaEncargado(id, idEstado);
      setEntregas(prev => prev.map(e => e.id === id ? { ...e, estado: nuevoEstado } : e));
      setSeleccionado(prev => prev ? { ...prev, estado: nuevoEstado } : prev);
    } catch (err) {
      alert("Error al actualizar el estado: " + err.message);
    }
  };

  const handleCorregirPts = (id, nuevosPts) => {
    setEntregas(prev => prev.map(e => e.id === id ? { ...e, pts: nuevosPts } : e));
    setSeleccionado(prev => prev ? { ...prev, pts: nuevosPts } : prev);
  };

  const handleEditar = (id, cambios) => {
    setEntregas(prev => prev.map(e => e.id === id ? { ...e, ...cambios } : e));
    setSeleccionado(prev => prev ? { ...prev, ...cambios } : prev);
  };

  const verDetalle = async (e) => {
    setSeleccionado(e);
    setLoadingDetalle(true);
    try {
      const detalle = await getEntregaEncargado(e.id);
      setSeleccionado(normalizar(detalle));
    } catch {
      // Si falla dejamos los datos que ya teníamos
    } finally {
      setLoadingDetalle(false);
    }
  };

  // ── Vista detalle ────────────────────────────────────────────────────────
  if (seleccionado) {
    const entregaActual = entregas.find(e => e.id === seleccionado.id) || seleccionado;
    return (
      <>
        {modalPts && (
          <ModalCorregirPts
            entrega={modalPts}
            onGuardar={handleCorregirPts}
            onCerrar={() => setModalPts(null)}
          />
        )}
        {modalEditar && (
          <ModalEditar
            entrega={modalEditar}
            materiales={materiales}
            onGuardar={handleEditar}
            onCerrar={() => setModalEditar(null)}
          />
        )}
        <DetalleEntrega
          entrega={entregaActual}
          loadingDetalle={loadingDetalle}
          onVolver={() => setSeleccionado(null)}
          onCambiarEstado={handleCambiarEstado}
          onCorregirPts={e => setModalPts(e)}
          onEditar={e => setModalEditar(e)}
        />
      </>
    );
  }

  // ── Opciones de filtro ───────────────────────────────────────────────────
  const materialesUnicos = ["Todos", ...new Set(entregas.map(e => e.material).filter(m => m && m !== "—"))];

  const filtradas = entregas.filter(e => {
    const matchMat  = filtroMat  === "Todos" || e.material === filtroMat;
    const matchEst  = filtroEst  === "Todos" || e.estado   === filtroEst;
    const matchPrio = filtroPrio === "Todos" || (e.prioridad?.toLowerCase() ?? "normal") === filtroPrio;
    const matchBus  = e.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchMat && matchEst && matchPrio && matchBus;
  });

  const totalKg  = filtradas.reduce((a, e) => a + e.peso, 0).toFixed(1);
  const totalPts = filtradas.reduce((a, e) => a + e.pts,  0);

  // ── Vista lista ──────────────────────────────────────────────────────────
  return (
    <>
      {modalPts && (
        <ModalCorregirPts
          entrega={modalPts}
          onGuardar={handleCorregirPts}
          onCerrar={() => setModalPts(null)}
        />
      )}

      <div>
        {error && (
          <div
            className="d-flex align-items-center gap-2 rounded-2 border border-2 border-dark mb-3 px-3 py-2"
            style={{ background: "#212529", color: "#ffc107", fontSize: 13 }}
          >
            <i className="bi bi-exclamation-triangle-fill" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Filtros ── */}
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          {/* Busqueda */}
          <div className="input-group" style={{ maxWidth: 240 }}>
            <span className="input-group-text border-2 border-dark bg-white">
              <i className="bi bi-search text-dark" />
            </span>
            <input
              type="text"
              className="form-control border-2 border-dark fw-semibold"
              placeholder="Buscar reciclador..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ fontSize: 13 }}
            />
          </div>

          {/* Filtro material */}
          <select
            className="form-select border-2 border-dark fw-semibold"
            style={{ maxWidth: 160, fontSize: 13 }}
            value={filtroMat}
            onChange={e => setFiltroMat(e.target.value)}
          >
            {materialesUnicos.map(m => <option key={m}>{m}</option>)}
          </select>

          {/* Filtro estado */}
          <select
            className="form-select border-2 border-dark fw-semibold"
            style={{ maxWidth: 145, fontSize: 13 }}
            value={filtroEst}
            onChange={e => setFiltroEst(e.target.value)}
          >
            {ESTADOS.map(s => <option key={s}>{s}</option>)}
          </select>

          {/* Filtro prioridad — nuevo */}
          <select
            className="form-select border-2 border-dark fw-semibold"
            style={{ maxWidth: 145, fontSize: 13 }}
            value={filtroPrio}
            onChange={e => setFiltroPrio(e.target.value)}
          >
            <option value="Todos">Prioridad</option>
            <option value="alta">Alta</option>
            <option value="normal">Normal</option>
            <option value="baja">Baja</option>
          </select>

          <span className="ms-auto text-secondary fw-semibold" style={{ fontSize: 12 }}>
            {filtradas.length} resultado{filtradas.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── KPIs ── */}
        <div className="row g-2 mb-3">
          <div className="col-4">
            <div className="card border border-2 border-dark rounded-3 text-center py-2 bg-white shadow-sm">
              <div className="fw-black text-dark" style={{ fontSize: 20 }}>{filtradas.length}</div>
              <div className="text-secondary fw-semibold" style={{ fontSize: 11 }}>Entregas</div>
            </div>
          </div>
          <div className="col-4">
            <div className="card border border-2 border-dark rounded-3 text-center py-2 shadow-sm" style={{ background: "#198754" }}>
              <div className="fw-black text-white" style={{ fontSize: 20 }}>{totalKg} kg</div>
              <div className="text-white fw-semibold" style={{ fontSize: 11 }}>Total reciclado</div>
            </div>
          </div>
          <div className="col-4">
            <div className="card border border-2 border-dark rounded-3 text-center py-2 shadow-sm" style={{ background: "#ffc107" }}>
              <div className="fw-black text-dark" style={{ fontSize: 20 }}>{totalPts}</div>
              <div className="text-dark fw-semibold" style={{ fontSize: 11 }}>Puntos otorgados</div>
            </div>
          </div>
        </div>

        {/* ── Tabla ── */}
        <div className="card border border-2 border-dark rounded-3 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
              <thead style={{ background: "#212529" }}>
                <tr>
                  {["Usuario", "Material", "Peso", "Puntos", "Prioridad", "Estado mat.", "Fecha", "Estado", "Acciones"].map(h => (
                    <th
                      key={h}
                      className="fw-bold border-0 px-3 py-2 text-white"
                      style={{ fontSize: 11, letterSpacing: 0.5 }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-5">
                      <span className="spinner-border" style={{ color: "#ffc107" }} />
                      <div className="text-secondary mt-2" style={{ fontSize: 13 }}>Cargando entregas...</div>
                    </td>
                  </tr>
                ) : filtradas.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-secondary py-5 fw-semibold">
                      <i className="bi bi-inbox d-block mb-2" style={{ fontSize: 32 }} />
                      {entregas.length === 0
                        ? "No hay entregas registradas"
                        : "Sin resultados para los filtros aplicados"}
                    </td>
                  </tr>
                ) : (
                  filtradas.map(e => (
                    <tr key={e.id}>
                      {/* Usuario */}
                      <td className="px-3 py-2">
                        <div className="d-flex align-items-center gap-2">
                          <Av text={e.av} size={30} />
                          <span className="fw-bold text-dark">{e.nombre}</span>
                        </div>
                      </td>

                      {/* Material */}
                      <td className="px-3 py-2">
                        <div className="d-flex align-items-center gap-1">
                          <i
                            className={`bi ${MAT_ICON[e.material] || "bi-recycle"}`}
                            style={{ color: "#198754" }}
                          />
                          <span className="fw-semibold text-dark">{e.material}</span>
                        </div>
                      </td>

                      {/* Peso */}
                      <td className="px-3 py-2 fw-bold text-dark">{e.peso} kg</td>

                      {/* Puntos */}
                      <td className="px-3 py-2 fw-black" style={{ color: "#ffc107" }}>{e.pts}</td>

                      {/* Prioridad — nuevo */}
                      <td className="px-3 py-2">
                        {e.prioridad
                          ? <BadgePrioridad prioridad={e.prioridad} />
                          : <span className="text-secondary" style={{ fontSize: 11 }}>—</span>
                        }
                      </td>

                      {/* Estado material — nuevo */}
                      <td className="px-3 py-2">
                        {e.estadoMaterial
                          ? <BadgeEstadoMat estadoMaterial={e.estadoMaterial} />
                          : <span className="text-secondary" style={{ fontSize: 11 }}>—</span>
                        }
                      </td>

                      {/* Fecha */}
                      <td className="px-3 py-2 text-secondary">{e.fecha}</td>

                      {/* Estado entrega */}
                      <td className="px-3 py-2"><Badge estado={e.estado} /></td>

                      {/* Acciones */}
                      <td className="px-3 py-2">
                        <div className="d-flex gap-1">
                          <button
                            onClick={() => verDetalle(e)}
                            className="btn btn-sm fw-bold d-flex align-items-center gap-1 border border-dark"
                            style={{ fontSize: 11, background: "#ffc107", color: "#212529" }}
                          >
                            <i className="bi bi-eye" /> Ver
                          </button>
                          <button
                            onClick={() => handleCambiarEstado(e.id, e.estado === "Completada" ? "Pendiente" : "Completada")}
                            className="btn btn-sm fw-bold d-flex align-items-center gap-1 border border-2 border-dark"
                            style={{
                              fontSize: 11,
                              background: e.estado === "Completada" ? "#fff"     : "#198754",
                              color:      e.estado === "Completada" ? "#212529"  : "#fff",
                            }}
                            title={e.estado === "Completada" ? "Marcar Pendiente" : "Marcar Completada"}
                          >
                            <i className={`bi ${e.estado === "Completada" ? "bi-arrow-counterclockwise" : "bi-check-circle-fill"}`} />
                          </button>
                          <button
                            onClick={() => setModalPts(e)}
                            className="btn btn-sm btn-outline-dark border-2 fw-bold d-flex align-items-center gap-1"
                            style={{ fontSize: 11 }}
                            title="Corregir puntos"
                          >
                            <i className="bi bi-arrow-repeat" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}