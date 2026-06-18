// src/components/catalogos/CrudCatalogo.jsx
// Componente base reutilizable para todos los catálogos CRUD
import { useState, useEffect } from "react";
/**
 * Props:
 * - titulo: string — nombre del catálogo (ej: "Roles")
 * - icono: string — clase Bootstrap Icon (ej: "bi-key-fill")
 * - campos: Array<{ key, label, type?, required?, placeholder? }>
 * - datos: Array<object> — lista inicial de registros
 * - onGuardar?: fn(item) — callback opcional al guardar
 * - onEliminar?: fn(id) — callback opcional al eliminar
 */
export default function CrudCatalogo({
  titulo,
  icono,
  campos = [],
  datos: datosIniciales = [],
  idKey = "id",
  onGuardar,
  onEliminar,
  showToast,
}) {
  const campoVacio = () =>
    campos.reduce((acc, c) => ({ ...acc, [c.key]: "" }), {});

  const [datos, setDatos]           = useState(datosIniciales);
  useEffect(() => {
  setDatos(datosIniciales);
}, [datosIniciales]);
  const [form, setForm]             = useState(campoVacio());
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [busqueda, setBusqueda]     = useState("");
  const [error, setError]           = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null); // id a eliminar

  // ── Filtro búsqueda ──────────────────────────────────────────────────────
  const datosFiltrados = datos.filter(d =>
    campos.some(c =>
      String(d[c.key] ?? "").toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  // ── Validación ───────────────────────────────────────────────────────────
  const validar = () => {
    for (const c of campos) {
      if (c.required !== false && !String(form[c.key] ?? "").trim()) {
        setError(`El campo "${c.label}" es obligatorio.`);
        return false;
      }
    }
    setError("");
    return true;
  };

  // ── Guardar (crear o editar) ─────────────────────────────────────────────
const guardar = async () => {
  if (!validar()) return;
  try {
    if (editandoId !== null) {
      await onGuardar?.({ ...form, [idKey]: editandoId });
      showToast?.(`${titulo.replace(/s$/, "")} actualizado correctamente`);
    } else {
      await onGuardar?.(form);
      showToast?.(`${titulo.replace(/s$/, "")} creado correctamente`);
    }
    cancelar();
  } catch (err) {
    showToast?.(err.message || "Error al guardar", "error");
  }
};

  // ── Editar ───────────────────────────────────────────────────────────────
  const editar = item => {
    setForm(campos.reduce((acc, c) => ({ ...acc, [c.key]: item[c.key] ?? "" }), {}));
    setEditandoId(item[idKey]);
    setMostrarForm(true);
    setError("");
  };

  // ── Eliminar ─────────────────────────────────────────────────────────────
  const eliminar = async id => {
    try {
      await onEliminar?.(id);
      showToast?.("Registro eliminado correctamente");
    } catch (err) {
      showToast?.(err.message || "Error al eliminar", "error");
    }
    setConfirmDelete(null);
  };

  // ── Cancelar ─────────────────────────────────────────────────────────────
  const cancelar = () => {
    setForm(campoVacio());
    setEditandoId(null);
    setMostrarForm(false);
    setError("");
  };

  return (
    <div className="p-4">

      {/* ── Encabezado ── */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <i className={`bi ${icono} text-success fs-4`} />
          <h4 className="mb-0 fw-bold">{titulo}</h4>
          <span className="badge bg-success-subtle text-success ms-1">
            {datos.length} registros
          </span>
        </div>
        {!mostrarForm && (
          <button
            className="btn btn-success btn-sm rounded-3 fw-semibold"
            onClick={() => { setMostrarForm(true); setError(""); }}
          >
            <i className="bi bi-plus-lg me-1" />
            Nuevo {titulo.replace(/s$/, "")}
          </button>
        )}
      </div>

      {/* ── Formulario ── */}
      {mostrarForm && (
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <h6 className="fw-bold mb-3">
              <i className={`bi ${editandoId ? "bi-pencil-fill" : "bi-plus-circle-fill"} me-2 text-success`} />
              {editandoId ? `Editar ${titulo.replace(/s$/, "")}` : `Nuevo ${titulo.replace(/s$/, "")}`}
            </h6>

            {error && (
              <div className="alert alert-danger py-2 small rounded-3">
                <i className="bi bi-exclamation-triangle-fill me-1" />
                {error}
              </div>
            )}

            <div className="row g-3">
              {campos.map(c => (
                <div key={c.key} className={c.fullWidth ? "col-12" : "col-md-6"}>
                  <label className="form-label fw-semibold small text-secondary">
                    {c.label}
                    {c.required !== false && <span className="text-danger ms-1">*</span>}
                  </label>
                  {c.type === "textarea" ? (
                    <textarea
                      className="form-control form-control-sm rounded-3"
                      placeholder={c.placeholder ?? `Ingresa ${c.label.toLowerCase()}`}
                      value={form[c.key]}
                      onChange={e => setForm(f => ({ ...f, [c.key]: e.target.value }))}
                      rows={3}
                    />
                  ) : c.type === "select" ? (
                    <select
                      className="form-select form-select-sm rounded-3"
                      value={form[c.key]}
                      onChange={e => setForm(f => ({ ...f, [c.key]: e.target.value }))}
                    >
                      <option value="">Selecciona...</option>
                      {c.opciones?.map(op => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={c.type ?? "text"}
                      className="form-control form-control-sm rounded-3"
                      placeholder={c.placeholder ?? `Ingresa ${c.label.toLowerCase()}`}
                      value={form[c.key]}
                      onChange={e => setForm(f => ({ ...f, [c.key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-success btn-sm rounded-3 fw-semibold px-4" onClick={guardar}>
                <i className="bi bi-floppy-fill me-1" />
                {editandoId ? "Guardar cambios" : "Crear"}
              </button>
              <button className="btn btn-outline-secondary btn-sm rounded-3" onClick={cancelar}>
                <i className="bi bi-x-lg me-1" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Búsqueda ── */}
      <div className="mb-3">
        <div className="input-group input-group-sm" style={{ maxWidth: 320 }}>
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder={`Buscar en ${titulo.toLowerCase()}...`}
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button className="btn btn-outline-secondary" onClick={() => setBusqueda("")}>
              <i className="bi bi-x" />
            </button>
          )}
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4 text-muted fw-semibold small">#</th>
                {campos.map(c => (
                  <th key={c.key} className="text-muted fw-semibold small">{c.label}</th>
                ))}
                <th className="text-muted fw-semibold small text-end pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {datosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={campos.length + 2} className="text-center py-5 text-muted">
                    <i className={`bi ${icono} fs-2 d-block mb-2 opacity-25`} />
                    {busqueda ? "No se encontraron resultados." : "No hay registros aún."}
                  </td>
                </tr>
              ) : (
                datosFiltrados.map((item, idx) => (
                  <tr key={item[idKey]?? item.nombre}>
                    <td className="ps-4 text-muted small">{idx + 1}</td>
                    {campos.map(c => (
                      <td key={c.key} className="small fw-semibold">{item[c.key] ?? "—"}</td>
                    ))}
                    <td className="text-end pe-4">
                      <div className="d-flex gap-2 justify-content-end">
                        <button
                          className="btn btn-outline-success btn-sm rounded-3"
                          onClick={() => editar(item)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil-fill" />
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm rounded-3"
                          onClick={() => setConfirmDelete(item[idKey])}
                          title="Eliminar"
                        >
                          <i className="bi bi-trash-fill" />
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

      {/* ── Modal confirmación eliminar ── */}
      {confirmDelete !== null && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.4)", zIndex: 1050 }}
        >
          <div className="card border-0 shadow-lg rounded-4 p-4" style={{ maxWidth: 360, width: "90%" }}>
            <div className="text-center mb-3">
              <i className="bi bi-exclamation-triangle-fill text-danger fs-1" />
            </div>
            <h6 className="fw-bold text-center mb-2">¿Eliminar registro?</h6>
            <p className="text-muted small text-center mb-4">
              Esta acción no se puede deshacer.
            </p>
            <div className="d-flex gap-2">
              <button
                className="btn btn-danger rounded-3 fw-semibold flex-fill"
                onClick={() => eliminar(confirmDelete)}
              >
                Sí, eliminar
              </button>
              <button
                className="btn btn-outline-secondary rounded-3 flex-fill"
                onClick={() => setConfirmDelete(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}