import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  getEncargados,
  crearEncargado,
  actualizarEncargado,
  eliminarEncargado,
  getAliados,
} from "../../services/api";

function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 38, height: 21, borderRadius: 12,
        background: checked ? "var(--verde)" : "#ddd",
        cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 3, left: checked ? 18 : 3,
        width: 15, height: 15, borderRadius: "50%", background: "#fff",
        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </div>
  );
}

function ModalDetalle({ user, onClose, onSave, showToast, aliadosList, zonasList, saving, currentUser }) {
  const [form, setForm] = useState(null);
  useEffect(() => { if (user) setForm({ ...user }); }, [user]);
  if (!user || !form) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const handleSave = async () => {
    if (!form.nombre?.trim()) { showToast("El nombre es obligatorio", "error"); return; }
    await onSave(form);
    onClose();
  };
  const esSuperAdmin = currentUser?.esSuperAdmin;
  return (
    <div className="panel-modal-bg" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="panel-modal">
        <div className="panel-modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: "50%", background: "var(--verde-claro)",
              border: "1px solid var(--gris-borde)", display: "flex", alignItems: "center",
              justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", color: "var(--verde)",
            }}>{form.av}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>
                <i className="bi bi-person-badge" style={{ color: "var(--verde)", marginRight: 6 }} />
                Detalle del encargado
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--gris-texto)" }}>Alta: {form.fechaAlta}</div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="panel-modal-body">
          <div className="panel-modal-grid">
            <div>
              <label className="panel-label">Nombre completo</label>
              <input className="panel-input" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
            </div>
            <div>
              <label className="panel-label">Teléfono</label>
              <input className="panel-input" value={form.telefono} onChange={(e) => set("telefono", e.target.value.replace(/\D/g, "").slice(0, 10))} />
            </div>
            <div className="full">
              <label className="panel-label">Correo electrónico</label>
              <input className="panel-input" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div>
              <label className="panel-label">Supermercado (aliado)</label>
              {esSuperAdmin ? (
                <select className="panel-input" value={form.idAliado || ""} onChange={(e) => {
  const id = e.target.value ? Number(e.target.value) : null;
  set("idAliado", id);
  const a = (aliadosList || []).find(x => x.idAliado === id);
  const zonaCompletaEdit = (aa) => aa ? (aa.direccion ? `${aa.zona} - ${aa.direccion}` : (aa.zona || "")) : "";
  if (a) set("zona", zonaCompletaEdit(a));
}}>
                  <option value="">Sin asignar</option>
                  {(aliadosList || []).map((a) => (
                    <option key={a.idAliado} value={a.idAliado}>{a.nombre}</option>
                  ))}
                </select>
              ) : (
                <div className="panel-input" style={{ padding: "8px 12px", background: "#f5f5f5", borderRadius: 6, color: "#666", cursor: "not-allowed" }}>
                  {form.aliado || "Sin supermercado asignado"}
                </div>
              )}
            </div>
            <div>
              <label className="panel-label">Zona</label>
              <input className="panel-input" value={form.zona || ""} onChange={(e) => set("zona", e.target.value)} placeholder="Sin zona" />
            </div>
          </div>
        </div>
        <div className="panel-modal-foot">
          <button className="btn-panel ghost" onClick={onClose}><i className="bi bi-x" /> Cancelar</button>
          <button className="btn-panel primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-check-lg me-1" />}
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TablaEncargados({ lista, onToggle, onVer, onEliminar }) {
  if (lista.length === 0) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "#bbb", fontSize: "0.85rem" }}>
        <i className="bi bi-person-x" style={{ fontSize: "2rem", display: "block", marginBottom: 8 }} />
        Sin encargados registrados
      </div>
    );
  }
  return (
      <table className="panel-table">
      <thead style={{ background: "var(--verde-claro)" }}>
        <tr>
          <th style={{ color: "var(--verde)" }}>Encargado</th>
          <th style={{ color: "var(--verde)" }}>Correo</th>
          <th style={{ color: "var(--verde)" }}>Teléfono</th>
          <th style={{ color: "var(--verde)" }}>Zona</th>
          <th style={{ color: "var(--verde)" }}>Supermercado</th>
          <th style={{ color: "var(--verde)" }}>Estado</th>
          <th style={{ color: "var(--verde)" }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {lista.map((u) => (
          <tr key={u.id}>
            <td>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", background: "var(--verde-claro)",
                  color: "var(--verde)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: "0.72rem", flexShrink: 0, border: "1px solid #c8e6c9",
                }}>{u.av}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.83rem" }}>{u.nombre}</div>
                  <div style={{ fontSize: "0.7rem", color: "#aaa" }}>Alta: {u.fechaAlta}</div>
                </div>
              </div>
            </td>
            <td style={{ fontSize: "0.8rem" }}>{u.email}</td>
            <td style={{ fontSize: "0.8rem" }}>{u.telefono || <span style={{ color: "#ddd" }}>&mdash;</span>}</td>
            <td style={{ fontSize: "0.8rem" }}>{u.zona || <span style={{ color: "#ddd" }}>&mdash;</span>}</td>
            <td style={{ fontSize: "0.8rem" }}>{u.aliado || <span style={{ color: "#ddd" }}>&mdash;</span>}</td>
            <td>
              <span className={`estado-dot ${u.activo ? "activo" : "inactivo"}`}>
                <span className="dot" />
                {u.activo ? "Activo" : "Inactivo"}
              </span>
            </td>
            <td>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn-icon" title="Ver / Editar" onClick={() => onVer(u)}><i className="bi bi-eye" /></button>
                <button className="btn-icon" title={u.activo ? "Desactivar" : "Activar"} onClick={() => onToggle(u.id, u.nombre, u.activo)}>
                  <i className={`bi bi-${u.activo ? "pause" : "play"}`} />
                </button>
                <button className="btn-icon del" title="Eliminar" onClick={() => onEliminar(u.id)}><i className="bi bi-trash" /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const EMPTY_FORM = {
  nombre: "", email: "", telefono: "", cedula: "", zona: "",
  puntoAsignado: "", activo: true, idAliado: "",
};

export default function Encargados({ state, dispatch, showToast, user }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [viewUser, setViewUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aliadosList, setAliadosList] = useState([]);

  useEffect(() => {
    getEncargados()
      .then((data) => {
        const lista = (data.encargados ?? []).map((u) => ({
          id: u.idUsuario,
          nombre: u.nombre || "",
          email: u.correo || "",
          telefono: u.telefono || "",
          zona: u.zona || "",
          puntoAsignado: u.puntoACargo?.nombre || "",
          idPunto: u.puntoACargo?.idPunto || null,
          aliado: u.aliado?.nombre || "",
          idAliado: u.aliado?.idAliado || null,
          activo: u.idEstadoUsuario === 1,
          av: (u.nombre || "").trim().split(" ").slice(0, 2).map((w) => w?.[0]?.toUpperCase() || "").join(""),
          fechaAlta: u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString("es-CO") : "—",
        }));
        dispatch({ type: "SET_ENCARGADOS", payload: lista });
      })
      .catch(() => showToast("No se pudieron cargar los encargados", "error"))
      .finally(() => setLoading(false));
  }, [dispatch, showToast]);

  const zonaCompleta = (a) => {
    if (!a) return "";
    return a.direccion ? `${a.zona} - ${a.direccion}` : (a.zona || "");
  };

  const cargarAliados = () => {
    getAliados().then((data) => {
      setAliadosList(data.aliados ?? []);
    }).catch(() => {});
  };

  useEffect(() => { cargarAliados(); }, []);

  useEffect(() => {
    if (modal) {
      cargarAliados();
      if (user && !user.esSuperAdmin && user.idAliado) {
        setForm((f) => ({ ...f, idAliado: user.idAliado }));
      }
    }
  }, [modal, user]);

  useEffect(() => {
    if (viewUser) { cargarAliados(); }
  }, [viewUser]);

  useEffect(() => {
    if (form.idAliado && aliadosList.length > 0) {
      const a = aliadosList.find(x => x.idAliado === (form.idAliado === "" ? null : Number(form.idAliado)));
      if (a) setForm(f => ({ ...f, zona: zonaCompleta(a) }));
    }
  }, [form.idAliado, aliadosList]);

  const encargados = state?.encargados || [];
  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };
  const cerrarModal = () => { setModal(false); setForm(EMPTY_FORM); setErrors({}); };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    if (!form.email.trim()) {
      e.email = "El correo es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
      e.email = "Correo inválido";
    } else if (encargados.some((u) => u.email === form.email.trim())) {
      e.email = "Este correo ya existe";
    }
    if (!form.telefono.trim()) {
      e.telefono = "El teléfono es obligatorio";
    } else if (!/^\d{10}$/.test(form.telefono.trim())) {
      e.telefono = "El teléfono debe tener exactamente 10 dígitos";
    }
    return e;
  };

  const guardar = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const resp = await crearEncargado({
        nombre: form.nombre.trim(),
        correo: form.email.trim(),
        telefono: form.telefono.trim(),
        cedula: form.cedula.trim() || undefined,
        zona: form.zona,
        idAliado: form.idAliado || undefined,
      });
      const av = form.nombre.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");
      dispatch({
        type: "ADD_ENCARGADO",
        payload: {
          id: resp?.encargado?.idUsuario || Date.now(),
          nombre: form.nombre.trim(), email: form.email.trim(),
          telefono: form.telefono.trim(), zona: form.zona,
          puntoAsignado: "", idPunto: null,
          activo: form.activo, av,
          fechaAlta: new Date().toLocaleDateString("es-CO"),
        },
      });
      showToast("Encargado creado correctamente");
      cerrarModal();
    } catch (err) {
      showToast("Error al crear encargado: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id, nombre, estadoActual) => {
    try {
      await actualizarEncargado(id, { idEstadoUsuario: estadoActual ? 2 : 1 });
      dispatch({ type: "TOGGLE_ENCARGADO", payload: id });
      showToast(estadoActual ? `${nombre} ha sido desactivado` : `${nombre} ha sido activado`, estadoActual ? "error" : "success");
    } catch (err) { showToast("Error al cambiar estado: " + err.message, "error"); }
  };

  const handleSave = async (u) => {
    setSaving(true);
    try {
      await actualizarEncargado(u.id, {
        nombre: u.nombre, telefono: u.telefono, correo: u.email,
        idAliado: u.idAliado || null, zona: u.zona || null,
      });
      const aliadoNombre = u.idAliado
        ? (aliadosList.find((a) => a.idAliado === u.idAliado)?.nombre || "")
        : "";
      dispatch({ type: "UPDATE_ENCARGADO", payload: { ...u, aliado: aliadoNombre } });
      showToast("Cambios guardados correctamente");
    } catch (err) { showToast("Error al actualizar: " + err.message, "error"); }
    finally { setSaving(false); }
  };

  const handleEliminar = async (id) => {
    try {
      await eliminarEncargado(id);
      dispatch({ type: "DEL_ENCARGADO", payload: id });
      showToast("Encargado eliminado", "error");
      if (viewUser?.id === id) setViewUser(null);
    } catch (err) { showToast("Error al eliminar: " + err.message, "error"); }
  };

  const filtered = encargados.filter((u) => {
    const q = search.toLowerCase();
    return (u.nombre || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q) || (u.zona || "").toLowerCase().includes(q);
  });

  const avatarPreview = form.nombre.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("") || "?";

  if (loading) {
    return (
      <motion.div className="panel-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <div className="text-center py-3">
          <LoadingSpinner size="sm" text="Cargando encargados" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="panel-page" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        <div>
          <h4 className="panel-title">
            <i className="bi bi-person-badge" style={{ color: "var(--verde)", marginRight: 8 }} />
            Gestión de encargados
          </h4>
          <span className="panel-subtitle">
            {encargados.length} encargado{encargados.length !== 1 ? "s" : ""} registrado{encargados.length !== 1 ? "s" : ""}
          </span>
        </div>
        {!user?.esSuperAdmin && (
          <button className="btn-panel primary" onClick={() => setModal(true)}>
            <i className="bi bi-person-plus" /> Nuevo encargado
          </button>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="search-box" style={{ maxWidth: 380 }}>
          <i className="bi bi-search" />
          <input placeholder="Buscar por nombre, correo o zona..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%" }} />
        </div>
      </div>

      <div className="panel-table-wrap">
        <TablaEncargados lista={filtered} onToggle={handleToggle} onVer={setViewUser} onEliminar={handleEliminar} />
      </div>

      <ModalDetalle user={viewUser} onClose={() => setViewUser(null)} onSave={handleSave} showToast={showToast} aliadosList={aliadosList} saving={saving} currentUser={user} />

      {modal && (
        <div className="panel-modal-bg" onClick={(ev) => { if (ev.target === ev.currentTarget) cerrarModal(); }}>
          <div className="panel-modal">
            <div className="panel-modal-head">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", background: "var(--verde-claro)",
                  border: "1px solid var(--gris-borde)", display: "flex", alignItems: "center",
                  justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", color: "var(--verde)",
                }}>{avatarPreview}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>
                    <i className="bi bi-person-badge" style={{ color: "var(--verde)", marginRight: 6 }} />
                    Nuevo encargado
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--gris-texto)" }}>Acceso a gestión de entregas</div>
                </div>
              </div>
              <button className="btn-icon" onClick={cerrarModal}><i className="bi bi-x-lg" /></button>
            </div>

            <div className="panel-modal-body">
              <div className="panel-modal-grid">

                <div>
                  <label className="panel-label">Nombre completo *</label>
                  <input className="panel-input" value={form.nombre} onChange={(e) => set("nombre", e.target.value)}
                    placeholder="Ej: Carlos Ruiz" style={errors.nombre ? { borderColor: "var(--rojo)" } : {}} />
                  {errors.nombre && <span style={{ fontSize: "0.72rem", color: "var(--rojo)" }}>{errors.nombre}</span>}
                </div>

                <div>
                  <label className="panel-label">Cédula</label>
                  <input className="panel-input" value={form.cedula}
                    onChange={(e) => set("cedula", e.target.value.replace(/\D/g, ""))}
                    placeholder="Número de cédula" />
                </div>

                <div>
                  <label className="panel-label">Teléfono *</label>
                  <input className="panel-input" value={form.telefono}
                    onChange={(e) => set("telefono", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="3001234567" style={errors.telefono ? { borderColor: "var(--rojo)" } : {}} />
                  {errors.telefono && <span style={{ fontSize: "0.72rem", color: "var(--rojo)" }}>{errors.telefono}</span>}
                </div>

                <div className="full">
                  <label className="panel-label">Correo electrónico *</label>
                  <input type="email" className="panel-input" value={form.email} onChange={(e) => set("email", e.target.value)}
                    placeholder="encargado@ejemplo.com" style={errors.email ? { borderColor: "var(--rojo)" } : {}} />
                  {errors.email && <span style={{ fontSize: "0.72rem", color: "var(--rojo)" }}>{errors.email}</span>}
                </div>

                <div>
                  <label className="panel-label">Zona</label>
                  <input className="panel-input" value={form.zona || ""} onChange={(e) => set("zona", e.target.value)} placeholder="Sin zona" />
                </div>

                <div>
                  <label className="panel-label">Supermercado (aliado)</label>
                  {user && !user.esSuperAdmin ? (
                    <div className="panel-input" style={{ padding: "8px 12px", background: "#f5f5f5", borderRadius: 6, color: "#666", cursor: "not-allowed" }}>
                      {user.aliadoNombre || "Sin supermercado asignado"}
                    </div>
                  ) : (
                    <select className="panel-input" value={form.idAliado}
                      onChange={(e) => {
                        const id = e.target.value ? Number(e.target.value) : "";
                        set("idAliado", id);
                        const a = aliadosList.find(x => x.idAliado === id);
                        if (a) set("zona", zonaCompleta(a));
                      }}>
                      <option value="">Sin asignar</option>
                      {aliadosList.map((a) => (
                        <option key={a.idAliado} value={a.idAliado}>{a.nombre}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="full">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "1px solid var(--gris-borde)", borderRadius: 6 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.83rem" }}>Estado inicial</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--gris-texto)" }}>El encargado podrá operar si está activo</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="panel-badge" style={{ background: form.activo ? "var(--verde-claro)" : "#f5f5f5", color: form.activo ? "var(--verde)" : "#aaa" }}>
                        {form.activo ? "Activo" : "Inactivo"}
                      </span>
                      <Toggle checked={form.activo} onChange={(v) => set("activo", v)} />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="panel-modal-foot">
              <button className="btn-panel ghost" onClick={cerrarModal}><i className="bi bi-x" /> Cancelar</button>
              <button className="btn-panel primary" onClick={guardar} disabled={saving}>
                {saving ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-check-lg me-1" />}
                {saving ? "Creando..." : "Crear encargado"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
