// src/paneles/encargado/HistorialdeEntregas.jsx
import { useState, useEffect } from "react";
import Badge from "./Badge";
import Av    from "./Av";
import {
  getEntregasEncargado,
  getEntregaEncargado,
  getMaterialesEncargado,
} from "../../services/api";

const MAT_ICON = {
  "Plástico (PET)": "bi-bag",
  "Plástico":       "bi-bag",
  "Cartón":         "bi-box-seam",
  "Vidrio":         "bi-cup-straw",
  "Papel":          "bi-file-earmark",
};

const ESTADOS = ["Todos", "Pendiente", "Validada", "Rechazada"];

function getIniciales(nombre = "") {
  return nombre.split(" ").slice(0, 2).map(p => p[0]?.toUpperCase()).join("");
}

// ✅ CORREGIDO: normaliza usando "detalles" (como devuelve el backend)
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

  // ✅ CORREGIDO: el backend devuelve "fechaEntrega", no solo "createdAt"
  const fecha    = (e.fechaEntrega ?? e.createdAt ?? e.fecha ?? "").split("T")[0];

  const estado   = e.estadoEntrega?.nombre ?? e.estado ?? "Pendiente";
  const obs      = e.observacion ?? e.obs ?? "";

  return {
    id:       e.idEntrega ?? e.id,
    nombre,
    av:       getIniciales(nombre),
    material,
    peso:     Number(peso),
    pts:      Number(pts),
    fecha,
    estado,
    obs,
    _raw:     e,
  };
}

// ── Modal corregir puntos ─────────────────────────────────────────────────────
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
              <i className="bi bi-arrow-repeat text-warning me-2" />Corregir puntos
            </div>
            <button onClick={onCerrar} className="btn btn-sm btn-outline-dark border-2 rounded-2 p-0" style={{ width: 28, height: 28 }}>
              <i className="bi bi-x" />
            </button>
          </div>

          <div className="p-2 rounded-2 bg-warning border border-dark mb-3 d-flex align-items-center gap-2">
            <Av text={entrega.av} size={32} bg="#000" color="#ffc107" />
            <div>
              <div className="fw-bold text-dark" style={{ fontSize: 13 }}>{entrega.nombre}</div>
              <div className="text-dark" style={{ fontSize: 11 }}>{entrega.material} · {entrega.peso} kg</div>
            </div>
          </div>

          <div className="mb-3">
            <label className="fw-bold text-secondary text-uppercase mb-1 d-block" style={{ fontSize: 10, letterSpacing: 1 }}>Puntos actuales</label>
            <div className="fw-black text-warning" style={{ fontSize: 28 }}>{entrega.pts} pts</div>
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
            <button onClick={guardar}  className="btn btn-warning border border-2 border-dark fw-bold flex-fill">
              <i className="bi bi-check-circle-fill me-1" /> Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal editar entrega ──────────────────────────────────────────────────────
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
              <i className="bi bi-pencil-square text-success me-2" />Editar entrega
            </div>
            <button onClick={onCerrar} className="btn btn-sm btn-outline-dark border-2 rounded-2 p-0" style={{ width: 28, height: 28 }}>
              <i className="bi bi-x" />
            </button>
          </div>

          <div className="p-2 rounded-2 bg-warning border border-dark mb-3 d-flex align-items-center gap-2">
            <Av text={entrega.av} size={32} bg="#000" color="#ffc107" />
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
            <button onClick={guardar}  className="btn btn-success border border-2 border-dark fw-bold flex-fill">
              <i className="bi bi-check-circle-fill me-1" /> Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Detalle entrega ───────────────────────────────────────────────────────────
function DetalleEntrega({ entrega, onVolver, onCambiarEstado, onCorregirPts, onEditar, loadingDetalle }) {
  const siguienteEstado = entrega.estado === "Validada" ? "Pendiente" : "Validada";
  const [obsEdit,     setObsEdit]     = useState(entrega.obs || "");
  const [obsSaved,    setObsSaved]    = useState(entrega.obs || "");
  const [editandoObs, setEditandoObs] = useState(false);

  if (loadingDetalle) {
    return (
      <div className="text-center py-5">
        <span className="spinner-border text-warning" />
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
        {/* Info reciclador */}
        <div className="col-md-6">
          <div className="card border border-2 border-dark rounded-3 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="fw-bold text-secondary text-uppercase mb-3" style={{ fontSize: 10, letterSpacing: 1 }}>
                Información del reciclador
              </div>
              <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-2 bg-warning border border-dark">
                <Av text={entrega.av} size={52} bg="#000" color="#ffc107" />
                <div>
                  <div className="fw-black text-dark" style={{ fontSize: 16 }}>{entrega.nombre}</div>
                  <div className="fw-semibold text-dark" style={{ fontSize: 12 }}>Usuario reciclador</div>
                  <div className="mt-1"><Badge estado={entrega.estado} /></div>
                </div>
              </div>
              <div className="d-flex flex-column gap-2 mb-3">
                {[
                  ["bi-box-seam",     "Material", entrega.material],
                  ["bi-speedometer2", "Peso",     `${entrega.peso} kg`],
                  ["bi-calendar3",    "Fecha",    entrega.fecha],
                ].map(([icon, label, val]) => (
                  <div key={label} className="d-flex align-items-center gap-2 p-2 rounded-2 bg-light border border-dark">
                    <i className={`bi ${icon} text-success`} style={{ fontSize: 15, width: 18 }} />
                    <span className="text-secondary fw-semibold" style={{ fontSize: 12 }}>{label}:</span>
                    <span className="fw-bold text-dark" style={{ fontSize: 13 }}>{val}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onCambiarEstado(entrega.id, siguienteEstado)}
                className={`btn border-2 border-dark fw-bold w-100 d-flex align-items-center justify-content-center gap-2 ${
                  entrega.estado === "Validada" ? "btn-outline-dark" : "btn-success"
                }`}
              >
                <i className={`bi ${entrega.estado === "Validada" ? "bi-arrow-counterclockwise" : "bi-check-circle-fill"}`} />
                {entrega.estado === "Validada" ? "Marcar como Pendiente" : "Marcar como Validada"}
              </button>
            </div>
          </div>
        </div>

        {/* Puntos */}
        <div className="col-md-6">
          <div className="card border border-2 border-dark rounded-3 shadow-sm h-100">
            <div className="card-body p-4 d-flex flex-column align-items-center justify-content-center text-center">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 bg-success border border-dark mb-3"
                style={{ width: 60, height: 60 }}
              >
                <i className="bi bi-recycle text-white" style={{ fontSize: 28 }} />
              </div>
              <div className="text-secondary fw-semibold mb-1" style={{ fontSize: 13 }}>Puntos otorgados</div>
              <div className="fw-black text-warning" style={{ fontSize: 56 }}>{entrega.pts}</div>
              <div className="text-secondary" style={{ fontSize: 12 }}>puntos</div>
              <div className="mt-4 d-flex gap-2 w-100">
                <button onClick={() => onEditar(entrega)} className="btn btn-outline-dark border-2 fw-bold flex-fill btn-sm">
                  <i className="bi bi-pencil me-1" /> Editar
                </button>
                <button onClick={() => onCorregirPts(entrega)} className="btn btn-warning border border-2 border-dark fw-bold flex-fill btn-sm">
                  <i className="bi bi-arrow-repeat me-1" /> Corregir pts
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div className="col-12">
          <div className="card border border-2 border-dark rounded-3 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="fw-bold text-secondary text-uppercase" style={{ fontSize: 10, letterSpacing: 1 }}>Observaciones</div>
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
                    className="btn btn-success border border-2 border-dark fw-bold btn-sm"
                  >
                    <i className="bi bi-floppy me-1" /> Guardar observación
                  </button>
                </>
              ) : (
                <div className="rounded-2 p-3 bg-light border border-dark text-secondary fst-italic" style={{ fontSize: 14 }}>
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

// ── Componente principal ──────────────────────────────────────────────────────
export default function HistorialdeEntregas() {
  const [entregas,     setEntregas]     = useState([]);
  const [materiales,   setMateriales]   = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [filtroMat,    setFiltroMat]    = useState("Todos");
  const [filtroEst,    setFiltroEst]    = useState("Todos");
  const [busqueda,     setBusqueda]     = useState("");
  const [modalPts,     setModalPts]     = useState(null);
  const [modalEditar,  setModalEditar]  = useState(null);

  const [loading,        setLoading]        = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [error,          setError]          = useState("");

  // ── Cargar entregas ──────────────────────────────────────────────────
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

  // ── Cambiar estado (solo en memoria) ────────────────────────────────
  const handleCambiarEstado = (id, nuevoEstado) => {
    setEntregas(prev => prev.map(e => e.id === id ? { ...e, estado: nuevoEstado } : e));
    setSeleccionado(prev => prev ? { ...prev, estado: nuevoEstado } : prev);
  };

  const handleCorregirPts = (id, nuevosPts) => {
    setEntregas(prev => prev.map(e => e.id === id ? { ...e, pts: nuevosPts } : e));
    setSeleccionado(prev => prev ? { ...prev, pts: nuevosPts } : prev);
  };

  const handleEditar = (id, cambios) => {
    setEntregas(prev => prev.map(e => e.id === id ? { ...e, ...cambios } : e));
    setSeleccionado(prev => prev ? { ...prev, ...cambios } : prev);
  };

  // ── Ver detalle ──────────────────────────────────────────────────────
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

  // ── Vista detalle ────────────────────────────────────────────────────
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

  // ── Lista de materiales únicos para el filtro ────────────────────────
  const materialesUnicos = ["Todos", ...new Set(entregas.map(e => e.material).filter(m => m && m !== "—"))];

  const filtradas = entregas.filter(e => {
    const matchMat = filtroMat === "Todos" || e.material === filtroMat;
    const matchEst = filtroEst === "Todos" || e.estado   === filtroEst;
    const matchBus = e.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchMat && matchEst && matchBus;
  });

  const totalKg  = filtradas.reduce((a, e) => a + e.peso, 0).toFixed(1);
  const totalPts = filtradas.reduce((a, e) => a + e.pts,  0);

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
        {/* Error */}
        {error && (
          <div className="alert alert-danger border border-2 border-dark d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-exclamation-triangle-fill" />
            <span style={{ fontSize: 13 }}>{error}</span>
          </div>
        )}

        {/* Búsqueda y filtros */}
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <div className="input-group" style={{ maxWidth: 260 }}>
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

          <select
            className="form-select border-2 border-dark fw-semibold"
            style={{ maxWidth: 170, fontSize: 13 }}
            value={filtroMat}
            onChange={e => setFiltroMat(e.target.value)}
          >
            {materialesUnicos.map(m => <option key={m}>{m}</option>)}
          </select>

          <select
            className="form-select border-2 border-dark fw-semibold"
            style={{ maxWidth: 150, fontSize: 13 }}
            value={filtroEst}
            onChange={e => setFiltroEst(e.target.value)}
          >
            {ESTADOS.map(s => <option key={s}>{s}</option>)}
          </select>

          <span className="ms-auto text-secondary fw-semibold" style={{ fontSize: 12 }}>
            {filtradas.length} resultado{filtradas.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Resumen rápido */}
        <div className="row g-2 mb-3">
          <div className="col-4">
            <div className="card border border-2 border-dark rounded-3 text-center py-2 bg-white shadow-sm">
              <div className="fw-black text-dark" style={{ fontSize: 20 }}>{filtradas.length}</div>
              <div className="text-secondary fw-semibold" style={{ fontSize: 11 }}>Entregas</div>
            </div>
          </div>
          <div className="col-4">
            <div className="card border border-2 border-dark rounded-3 text-center py-2 bg-success shadow-sm">
              <div className="fw-black text-white" style={{ fontSize: 20 }}>{totalKg} kg</div>
              <div className="text-white fw-semibold" style={{ fontSize: 11 }}>Total reciclado</div>
            </div>
          </div>
          <div className="col-4">
            <div className="card border border-2 border-dark rounded-3 text-center py-2 bg-warning shadow-sm">
              <div className="fw-black text-dark" style={{ fontSize: 20 }}>{totalPts}</div>
              <div className="text-dark fw-semibold" style={{ fontSize: 11 }}>Puntos otorgados</div>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="card border border-2 border-dark rounded-3 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
              <thead className="bg-dark text-white">
                <tr>
                  {["Usuario", "Material", "Peso", "Puntos", "Fecha", "Estado", "Acciones"].map(h => (
                    <th key={h} className="fw-bold border-0 px-3 py-2" style={{ fontSize: 11, letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <span className="spinner-border text-warning" />
                      <div className="text-secondary mt-2" style={{ fontSize: 13 }}>Cargando entregas...</div>
                    </td>
                  </tr>
                ) : filtradas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-secondary py-5 fw-semibold">
                      <i className="bi bi-inbox d-block mb-2" style={{ fontSize: 32 }} />
                      {entregas.length === 0 ? "No hay entregas registradas" : "Sin resultados para los filtros aplicados"}
                    </td>
                  </tr>
                ) : (
                  filtradas.map(e => (
                    <tr key={e.id}>
                      <td className="px-3 py-2">
                        <div className="d-flex align-items-center gap-2">
                          <Av text={e.av} size={30} />
                          <span className="fw-bold text-dark">{e.nombre}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="d-flex align-items-center gap-1">
                          <i className={`bi ${MAT_ICON[e.material] || "bi-recycle"} text-success`} />
                          <span className="fw-semibold text-dark">{e.material}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 fw-bold text-dark">{e.peso} kg</td>
                      <td className="px-3 py-2 fw-black text-warning">{e.pts}</td>
                      <td className="px-3 py-2 text-secondary">{e.fecha}</td>
                      <td className="px-3 py-2"><Badge estado={e.estado} /></td>
                      <td className="px-3 py-2">
                        <div className="d-flex gap-1">
                          <button
                            onClick={() => verDetalle(e)}
                            className="btn btn-sm btn-warning border border-dark fw-bold d-flex align-items-center gap-1"
                            style={{ fontSize: 11 }}
                          >
                            <i className="bi bi-eye" /> Ver
                          </button>
                          <button
                            onClick={() => handleCambiarEstado(e.id, e.estado === "Validada" ? "Pendiente" : "Validada")}
                            className={`btn btn-sm border-2 border-dark fw-bold d-flex align-items-center gap-1 ${
                              e.estado === "Validada" ? "btn-outline-dark" : "btn-success"
                            }`}
                            style={{ fontSize: 11 }}
                            title={e.estado === "Validada" ? "Marcar Pendiente" : "Marcar Validada"}
                          >
                            <i className={`bi ${e.estado === "Validada" ? "bi-arrow-counterclockwise" : "bi-check-circle-fill"}`} />
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