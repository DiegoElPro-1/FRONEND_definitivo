import { useState, useEffect } from "react";
import {
  getMateriales,
  crearMaterial,
  actualizarMaterial,
  eliminarMaterial,
} from "../../services/api";

const ZONAS     = ["Norte", "Sur", "Centro", "Oriente", "Occidente"];
const UNIDADES  = ["kg", "g", "tonelada", "unidad"];
const CATEGORIAS = ["Organico", "Electronico", "Textil"];
const COLORES_CANECA = ["Verde", "Amarillo", "Azul", "Rojo"];

const EMPTY_FORM = {
  nombre: "", categoria: "", descripcion: "",
  pesoMinimo: "", pesoMaximo: "", unidad: "kg",
  zona: "", puntosPorKg: "", activo: true,
};

export default function VistaMateriales() {
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [busqueda, setBusqueda]     = useState("");
  const [filtroZona, setFiltroZona] = useState("todos");
  const [filtroCat, setFiltroCat]   = useState("todos");
  const [showModal, setShowModal]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  useEffect(() => { cargarMateriales(); }, []);

  async function cargarMateriales() {
    setLoading(true);
    try {
      const res = await getMateriales();
      setMateriales(res.materiales ?? []);
    } catch {
      showToastMsg("Error al cargar materiales");
    } finally {
      setLoading(false);
    }
  }

  function abrirNuevo()   { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); }
  function abrirEditar(m) { setEditItem(m);    setForm(mapearForm(m)); setShowModal(true); }

  function mapearForm(m) {
    return {
      nombre: m.nombre || "",
      categoria: m.categoria || "",
      descripcion: m.descripcion || "",
      pesoMinimo: m.pesoMinimo ?? m.peso_minimo ?? "",
      pesoMaximo: m.pesoMaximo ?? m.peso_maximo ?? "",
      unidad: m.unidad || "kg",
      zona: m.zona || "",
      puntosPorKg: m.puntosPorKg ?? m.puntos_por_kg ?? "",
      activo: m.activo ?? true,
    };
  }

  function mapearPayload(form) {
    return {
      nombre: form.nombre,
      categoria: form.categoria,
      descripcion: form.descripcion,
      pesoMinimo: parseFloat(form.pesoMinimo) || 0,
      pesoMaximo: parseFloat(form.pesoMaximo) || 0,
      unidad: form.unidad,
      zona: form.zona,
      puntosPorKg: parseInt(form.puntosPorKg) || 0,
      activo: form.activo,
    };
  }

  async function guardar() {
    if (!form.nombre || !form.categoria || !form.zona || !form.puntosPorKg) {
      showToastMsg("Completa los campos obligatorios"); return;
    }
    setSaving(true);
    const payload = mapearPayload(form);
    try {
      if (editItem) {
        await actualizarMaterial(editItem.idMaterial ?? editItem.id, payload);
        showToastMsg("Material actualizado");
      } else {
        await crearMaterial(payload);
        showToastMsg("Material creado correctamente");
      }
      setShowModal(false);
      cargarMateriales();
    } catch {
      showToastMsg("Error al guardar material");
    } finally {
      setSaving(false);
    }
  }

  async function confirmarEliminar() {
    try {
      await eliminarMaterial(confirmDel.idMaterial ?? confirmDel.id);
      showToastMsg(`"${confirmDel.nombre}" eliminado`);
      setConfirmDel(null);
      cargarMateriales();
    } catch {
      showToastMsg("Error al eliminar material", "error");
    }
  }

  function showToastMsg(msg) { setToast(msg); setTimeout(() => setToast(null), 3000); }
  function setF(key, val)    { setForm(f => ({ ...f, [key]: val })); }

  const filtrados = materiales.filter(m => {
    const matchB = (m.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
                   (m.descripcion || "").toLowerCase().includes(busqueda.toLowerCase());
    const matchZ = filtroZona === "todos" || m.zona === filtroZona;
    const matchC = filtroCat  === "todos" || m.categoria === filtroCat;
    return matchB && matchZ && matchC;
  });

  return (
    <div className="panel-page">

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        <div>
          <h4 className="panel-title">Materiales</h4>
          <span className="panel-subtitle">{materiales.length} materiales registrados</span>
        </div>
        <button className="btn-panel primary" onClick={abrirNuevo}>
          <i className="bi bi-plus-lg"></i> Nuevo material
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {CATEGORIAS.map(cat => {
          const cnt = materiales.filter(m => m.categoria === cat).length;
          if (!cnt) return null;
          return (
            <button
              key={cat}
              className={`chip ${filtroCat === cat ? "active" : ""}`}
              onClick={() => setFiltroCat(filtroCat === cat ? "todos" : cat)}
            >
              {cat}
              <span className="chip-count">{cnt}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input
            placeholder="Buscar material..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <select className="panel-select" style={{ width: "auto" }} value={filtroZona} onChange={e => setFiltroZona(e.target.value)}>
          <option value="todos">Todas las zonas</option>
          {ZONAS.map(z => <option key={z}>{z}</option>)}
        </select>
        <select className="panel-select" style={{ width: "auto" }} value={filtroCat} onChange={e => setFiltroCat(e.target.value)}>
          <option value="todos">Todas las categorías</option>
          {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
        </select>
        <button className="btn-panel ghost" onClick={cargarMateriales}>
          <i className="bi bi-arrow-clockwise"></i> Actualizar
        </button>
      </div>

      <div className="panel-table-wrap">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--verde)", fontSize: "0.82rem", fontWeight: 600 }}>
            <div className="spinner-border spinner-border-sm mb-2"></div>
            <br />Cargando materiales...
          </div>
        ) : (
          <table className="panel-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Material</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Peso mín.</th>
                <th>Peso máx.</th>
                <th>Unidad</th>
                <th>Zona</th>
                <th>Pts/kg</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: "36px 0", color: "#aaa", fontSize: "0.82rem" }}>
                    Sin resultados
                  </td>
                </tr>
              ) : filtrados.map(m => (
                <tr key={m.idMaterial ?? m.id}>
                  <td style={{ color: "#aaa", fontSize: "0.75rem" }}>#{m.idMaterial ?? m.id}</td>
                  <td style={{ fontWeight: 600 }}>{m.nombre}</td>
                  <td>
                    <span
                      className="panel-badge"
                      style={{ background: "var(--verde-claro)", color: "var(--verde)" }}
                    >
                      {m.categoria}
                    </span>
                  </td>
                  <td style={{ color: "var(--gris-texto)", fontSize: "0.78rem" }}>{m.descripcion}</td>
                  <td style={{ fontSize: "0.78rem" }}>{m.pesoMinimo ?? m.peso_minimo} {m.unidad}</td>
                  <td style={{ fontSize: "0.78rem" }}>{m.pesoMaximo ?? m.peso_maximo} {m.unidad}</td>
                  <td style={{ fontSize: "0.78rem" }}>{m.unidad}</td>
                  <td style={{ fontSize: "0.78rem" }}>
                    <i className="bi bi-geo-alt-fill" style={{ color: "var(--verde)", marginRight: 3 }}></i>
                    {m.zona}
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--verde)", fontSize: "0.82rem" }}>
                    <i className="bi bi-star-fill" style={{ color: "var(--mostaza)", marginRight: 3 }}></i>
                    {m.puntosPorKg ?? m.puntos_por_kg}
                  </td>
                  <td>
                    {(m.activo ?? m.idEstadoMaterial === 1)
                      ? <span className="estado-dot activo"><span className="dot"></span>Activo</span>
                      : <span className="estado-dot inactivo"><span className="dot"></span>Inactivo</span>
                    }
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn-icon" onClick={() => abrirEditar(m)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn-icon del" onClick={() => setConfirmDel(m)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div
          className="panel-modal-bg"
          onClick={ev => { if (ev.target === ev.currentTarget) setShowModal(false); }}
        >
          <div className="panel-modal">
            <div className="panel-modal-head">
              <span>
                <i className={`bi ${editItem ? "bi-pencil-square" : "bi-recycle"} me-2`} style={{ color: "var(--verde)" }}></i>
                {editItem ? "Editar material" : "Nuevo material"}
              </span>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="panel-modal-body">
              <div className="panel-modal-grid">

                <div>
                  <label className="panel-label">Nombre del material *</label>
                  <input className="panel-input" placeholder="Ej: Botella PET" value={form.nombre} onChange={e => setF("nombre", e.target.value)} />
                </div>

                <div>
                  <label className="panel-label">Categoría *</label>
                  <select className="panel-select" value={form.categoria} onChange={e => setF("categoria", e.target.value)}>
                    <option value="">Selecciona categoría...</option>
                    {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className="full">
                  <label className="panel-label">Descripción</label>
                  <textarea
                    className="panel-input"
                    rows={2}
                    placeholder="Describe el material..."
                    value={form.descripcion}
                    onChange={e => setF("descripcion", e.target.value)}
                    style={{ resize: "vertical" }}
                  />
                </div>

                <div>
                  <label className="panel-label">Peso mínimo</label>
                  <input type="number" className="panel-input" placeholder="0.1" min="0" step="0.1" value={form.pesoMinimo} onChange={e => setF("pesoMinimo", e.target.value)} />
                </div>

                <div>
                  <label className="panel-label">Peso máximo</label>
                  <input type="number" className="panel-input" placeholder="100" min="0" step="0.1" value={form.pesoMaximo} onChange={e => setF("pesoMaximo", e.target.value)} />
                </div>

                <div>
                  <label className="panel-label">Unidad</label>
                  <select className="panel-select" value={form.unidad} onChange={e => setF("unidad", e.target.value)}>
                    {UNIDADES.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>

                <div>
                  <label className="panel-label">Puntos por kg *</label>
                  <input type="number" className="panel-input" placeholder="30" min="0" value={form.puntosPorKg} onChange={e => setF("puntosPorKg", e.target.value)} />
                </div>

                <div>
                  <label className="panel-label">Zona *</label>
                  <select className="panel-select" value={form.zona} onChange={e => setF("zona", e.target.value)}>
                    <option value="">Selecciona zona...</option>
                    {ZONAS.map(z => <option key={z}>{z}</option>)}
                  </select>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    id="activoMat"
                    checked={form.activo}
                    onChange={e => setF("activo", e.target.checked)}
                    style={{ accentColor: "var(--verde)", width: 15, height: 15 }}
                  />
                  <label htmlFor="activoMat" className="panel-label" style={{ margin: 0 }}>Material activo</label>
                </div>

              </div>
            </div>

            <div className="panel-modal-foot">
              <button className="btn-panel ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-panel primary" disabled={saving} onClick={guardar}>
                <i className={`bi ${editItem ? "bi-floppy" : "bi-recycle"}`}></i>
                {saving ? "Guardando..." : editItem ? "Actualizar" : "Crear material"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDel && (
        <div className="panel-modal-bg">
          <div className="panel-modal sm">
            <div className="panel-modal-body" style={{ textAlign: "center", padding: "28px 24px" }}>
              <i className="bi bi-trash3" style={{ fontSize: "2rem", color: "var(--rojo)" }}></i>
              <p style={{ fontWeight: 700, fontSize: "0.95rem", marginTop: 12, marginBottom: 6 }}>Eliminar material</p>
              <p style={{ fontSize: "0.82rem", color: "var(--gris-texto)", marginBottom: 20 }}>
                Vas a eliminar <strong>"{confirmDel.nombre}"</strong>. Esta acción no se puede deshacer.
              </p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <button className="btn-panel ghost" onClick={() => setConfirmDel(null)}>Cancelar</button>
                <button className="btn-panel danger" onClick={confirmarEliminar}>
                  <i className="bi bi-trash"></i> Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="panel-toast">
          <i className="bi bi-check2-circle"></i>
          {toast}
        </div>
      )}

    </div>
  );
}
