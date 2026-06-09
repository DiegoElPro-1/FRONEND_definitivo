import { useState, useEffect } from "react";
import {
  getRecompensas,
  crearRecompensa,
  actualizarRecompensa,
  eliminarRecompensa,
  getAliados,
  getTiposRecompensa,
} from "../../services/api";

const EMPTY_FORM = {
  nombre: "",
  idTipoRecompensa: "",
  idAliado: "",
  descripcion: "",
  puntosRequeridos: "",
  stock: "",
  fechaInicio: "",
  fechaFin: "",
};

export default function Recompensas({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [search, setSearch] = useState("");
  const [aliadosList, setAliadosList] = useState([]);
  const [tiposList, setTiposList] = useState([]);

  const cargar = () => {
    setLoading(true);
    Promise.all([
      getRecompensas(),
      getAliados(),
      getTiposRecompensa(),
    ]).then(([r, a, t]) => {
      setItems(r.recompensas ?? []);
      setAliadosList(a.aliados ?? []);
      setTiposList(t.tipos ?? []);
    }).catch(() => showToast("Error al cargar datos", "error"))
    .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  };

  const abrirNuevo = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModal(true);
  };

  const abrirEditar = (item) => {
    setEditId(item.idRecompensa);
    setForm({
      nombre: item.nombre || "",
      idTipoRecompensa: item.idTipoRecompensa || "",
      idAliado: item.idAliado || "",
      descripcion: item.descripcion || "",
      puntosRequeridos: item.puntosRequeridos || "",
      stock: item.stock ?? "",
      fechaInicio: item.fechaInicio ? item.fechaInicio.slice(0, 10) : "",
      fechaFin: item.fechaFin ? item.fechaFin.slice(0, 10) : "",
    });
    setErrors({});
    setModal(true);
  };

  const cerrarModal = () => {
    setModal(false);
    setForm(EMPTY_FORM);
    setErrors({});
    setEditId(null);
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    if (!form.idTipoRecompensa) e.idTipoRecompensa = "Selecciona un tipo";
    if (!form.puntosRequeridos || form.puntosRequeridos <= 0) e.puntosRequeridos = "Debe ser mayor a 0";
    return e;
  };

  const guardar = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    try {
      const payload = {
        nombre: form.nombre.trim(),
        idTipoRecompensa: Number(form.idTipoRecompensa),
        idAliado: form.idAliado ? Number(form.idAliado) : undefined,
        descripcion: form.descripcion.trim() || undefined,
        puntosRequeridos: Number(form.puntosRequeridos),
        stock: form.stock ? Number(form.stock) : undefined,
        fechaInicio: form.fechaInicio || undefined,
        fechaFin: form.fechaFin || undefined,
      };
      if (editId) {
        await actualizarRecompensa(editId, payload);
        showToast("Recompensa actualizada");
      } else {
        await crearRecompensa(payload);
        showToast("Recompensa creada");
      }
      cerrarModal();
      cargar();
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  };

  const handleEliminar = async () => {
    try {
      await eliminarRecompensa(confirmDel.idRecompensa);
      showToast("Recompensa eliminada");
      setConfirmDel(null);
      cargar();
    } catch (err) {
      showToast("Error al eliminar: " + err.message, "error");
    }
  };

  const getAliadoNombre = (id) => aliadosList.find(a => a.idAliado === id)?.nombre || "—";
  const getTipoNombre = (id) => tiposList.find(t => t.idTipoRecompensa === id)?.nombre || "—";

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    return i.nombre?.toLowerCase().includes(q)
      || getAliadoNombre(i.idAliado).toLowerCase().includes(q);
  });

  return (
    <div className="panel-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="fw-bold mb-0 text-dark">
            <i className="bi bi-gift-fill me-2 text-success"></i>Recompensas
          </h5>
          <small className="text-muted">{items.length} recompensa{items.length !== 1 ? "s" : ""} registrada{items.length !== 1 ? "s" : ""}</small>
        </div>
        <button className="btn btn-success btn-sm rounded-3 d-flex align-items-center gap-2" onClick={abrirNuevo}>
          <i className="bi bi-plus-lg"></i>Nueva recompensa
        </button>
      </div>

      <div className="mb-3">
        <div className="input-group input-group-sm" style={{ maxWidth: 420 }}>
          <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-secondary"></i></span>
          <input className="form-control border-start-0" placeholder="Buscar por nombre o supermercado..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading && (
        <div className="text-center py-3 text-muted small">
          <div className="spinner-border spinner-border-sm text-success me-2"></div>Cargando recompensas...
        </div>
      )}

      <div className="card border rounded-3 shadow-none">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
              <thead className="table-light">
                <tr>
                  {[["bi-gift", "Recompensa"], ["bi-shop", "Supermercado"], ["bi-tag", "Tipo"], ["bi-star", "Puntos"], ["bi-box", "Stock"], ["bi-toggles", "Estado"], ["bi-gear", "Acciones"]].map(([ic, h]) => (
                    <th key={h} className="text-uppercase text-muted fw-semibold border-0" style={{ padding: "10px 16px", fontSize: 11 }}>
                      <i className={`bi ${ic} me-1`}></i>{h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-4 text-muted small">Sin resultados</td></tr>
                ) : filtered.map(r => (
                  <tr key={r.idRecompensa}>
                    <td style={{ padding: "12px 16px" }}>
                      <div className="fw-bold">{r.nombre}</div>
                      {r.descripcion && <div className="text-muted" style={{ fontSize: 11 }}>{r.descripcion}</div>}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12 }}>{getAliadoNombre(r.idAliado)}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12 }}><span className="badge rounded-pill bg-light text-dark fw-semibold">{getTipoNombre(r.idTipoRecompensa)}</span></td>
                    <td className="fw-bold text-success" style={{ padding: "12px 16px" }}><i className="bi bi-star-fill text-warning me-1"></i>{r.puntosRequeridos}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12 }}>{r.stock ?? "∞"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span className={`badge rounded-pill fw-semibold ${r.idEstadoRecompensa === 1 ? "bg-success" : "bg-secondary"}`} style={{ fontSize: 10 }}>
                        <i className={`bi ${r.idEstadoRecompensa === 1 ? "bi-check-circle" : "bi-x-circle"} me-1`}></i>
                        {r.idEstadoRecompensa === 1 ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm rounded-3 fw-semibold d-flex align-items-center gap-1" style={{ fontSize: 11, padding: "4px 10px", background: "#dbeafe", color: "#1e40af", border: "none" }} onClick={() => abrirEditar(r)}>
                          <i className="bi bi-pencil-square"></i>Editar
                        </button>
                        <button className="btn btn-sm rounded-3 d-flex align-items-center justify-content-center"
                          style={{ width: 30, height: 30, fontSize: 13, padding: 0, background: r.idEstadoRecompensa === 1 ? "#fef3c7" : "#d1fae5", color: r.idEstadoRecompensa === 1 ? "#92400e" : "#065f46", border: "none" }}
                          onClick={async () => {
                            try {
                              await actualizarRecompensa(r.idRecompensa, { idEstadoRecompensa: r.idEstadoRecompensa === 1 ? 2 : 1 });
                              showToast(r.idEstadoRecompensa === 1 ? "Recompensa desactivada" : "Recompensa activada");
                              cargar();
                            } catch (err) {
                              showToast("Error: " + err.message, "error");
                            }
                          }}
                          title={r.idEstadoRecompensa === 1 ? "Desactivar" : "Activar"}>
                          <i className={`bi ${r.idEstadoRecompensa === 1 ? "bi-pause-fill" : "bi-play-fill"}`}></i>
                        </button>
                        <button className="btn btn-outline-danger btn-sm rounded-3 d-flex align-items-center justify-content-center" style={{ width: 30, height: 30, fontSize: 13, padding: 0 }} onClick={() => setConfirmDel(r)}>
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL CREAR / EDITAR */}
      {modal && (
        <div className="panel-modal-bg" onClick={ev => { if (ev.target === ev.currentTarget) cerrarModal(); }}>
          <div className="panel-modal">
            <div className="panel-modal-head">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--verde-claro)", border: "1px solid var(--gris-borde)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", color: "var(--verde)" }}>
                  <i className="bi bi-gift-fill"></i>
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}><i className="bi bi-gift-fill me-2 text-success"></i>{editId ? "Editar recompensa" : "Nueva recompensa"}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--gris-texto)" }}>{editId ? "Modifica los datos" : "Crear una nueva recompensa"}</div>
                </div>
              </div>
              <button className="btn-icon" onClick={cerrarModal}><i className="bi bi-x-lg"></i></button>
            </div>
            <div className="panel-modal-body">
              <div className="panel-modal-grid">
                <div className="full">
                  <label className="panel-label">Nombre *</label>
                  <input className="panel-input" value={form.nombre} onChange={e => set("nombre", e.target.value)} placeholder="Ej: Bono de $10.000" />
                  {errors.nombre && <span className="text-danger small">{errors.nombre}</span>}
                </div>
                <div>
                  <label className="panel-label">Tipo *</label>
                  <select className="panel-input" value={form.idTipoRecompensa} onChange={e => set("idTipoRecompensa", e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {tiposList.map(t => <option key={t.idTipoRecompensa} value={t.idTipoRecompensa}>{t.nombre}</option>)}
                  </select>
                  {errors.idTipoRecompensa && <span className="text-danger small">{errors.idTipoRecompensa}</span>}
                </div>
                <div>
                  <label className="panel-label">Supermercado</label>
                  <select className="panel-input" value={form.idAliado} onChange={e => set("idAliado", e.target.value)}>
                    <option value="">Todos los supermercados</option>
                    {aliadosList.map(a => <option key={a.idAliado} value={a.idAliado}>{a.nombre}</option>)}
                  </select>
                </div>
                <div className="full">
                  <label className="panel-label">Descripción</label>
                  <textarea className="panel-input" rows={2} value={form.descripcion} onChange={e => set("descripcion", e.target.value)} placeholder="Describe la recompensa..." style={{ resize: "vertical" }} />
                </div>
                <div>
                  <label className="panel-label">Puntos requeridos *</label>
                  <input type="number" min="1" className="panel-input" value={form.puntosRequeridos} onChange={e => set("puntosRequeridos", e.target.value)} placeholder="Ej: 500" />
                  {errors.puntosRequeridos && <span className="text-danger small">{errors.puntosRequeridos}</span>}
                </div>
                <div>
                  <label className="panel-label">Stock</label>
                  <input type="number" min="0" className="panel-input" value={form.stock} onChange={e => set("stock", e.target.value)} placeholder="Vacío = ilimitado" />
                </div>
                <div>
                  <label className="panel-label">Fecha inicio</label>
                  <input type="date" className="panel-input" value={form.fechaInicio} onChange={e => set("fechaInicio", e.target.value)} />
                </div>
                <div>
                  <label className="panel-label">Fecha fin</label>
                  <input type="date" className="panel-input" value={form.fechaFin} onChange={e => set("fechaFin", e.target.value)} />
                </div>
              </div>
            </div>
            <div className="panel-modal-foot">
              <button className="btn-panel ghost" onClick={cerrarModal}>Cancelar</button>
              <button className="btn-panel primary" onClick={guardar}>
                <i className={`bi ${editId ? "bi-floppy" : "bi-plus-lg"}`}></i>
                {editId ? "Actualizar" : "Crear recompensa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMAR ELIMINAR */}
      {confirmDel && (
        <div className="panel-modal-bg">
          <div className="panel-modal sm">
            <div className="panel-modal-body" style={{ textAlign: "center", padding: "28px 24px" }}>
              <i className="bi bi-trash3" style={{ fontSize: "2rem", color: "var(--rojo)" }}></i>
              <p style={{ fontWeight: 700, fontSize: "0.95rem", marginTop: 12, marginBottom: 6 }}>Eliminar recompensa</p>
              <p style={{ fontSize: "0.82rem", color: "var(--gris-texto)", marginBottom: 20 }}>
                Vas a eliminar <strong>"{confirmDel.nombre}"</strong>. Esta acción no se puede deshacer.
              </p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <button className="btn-panel ghost" onClick={() => setConfirmDel(null)}>Cancelar</button>
                <button className="btn-panel danger" onClick={handleEliminar}><i className="bi bi-trash"></i> Sí, eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
