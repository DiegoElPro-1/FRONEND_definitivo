import { useState, useEffect } from "react";
import { ALL_POINTS, ZONAS } from "../../constants/data";
import { getRolCfg, Toggle, rolDesc, ModalDetalle, TablaUsuarios } from "../../components/UserShared";
import { getUsuarios, actualizarUsuario, eliminarUsuario } from "../../services/api";

const EMPTY_FORM = {
  nombre: "", email: "", telefono: "",
  rol: "Usuario", activo: true,
};

export default function Usuarios({ state, dispatch, showToast }) {
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [errors,   setErrors]   = useState({});
  const [search,   setSearch]   = useState("");
  const [viewUser, setViewUser] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getUsuarios()
      .then(data => {
        const lista = (data.usuarios ?? data ?? [])
          .filter(u => (u.idRol ?? u.id_rol) === 3)  // ← solo rol usuario
          .map(u => ({
            id:       u.idUsuario,
            nombre:   u.nombre,
            email:    u.correo,
            telefono: u.telefono ?? "",
            rol:      "Usuario",
            zona:     "",
            pts:      0,
            activo:   u.idEstadoUsuario === 1,
            av:       (u.nombre ?? "").trim().split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join(""),
            fechaAlta: u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString("es-CO") : "—",
          }));
        dispatch({ type: "SET_USUARIOS", payload: lista });
      })
      .catch(() => {
        showToast("No se pudieron cargar los usuarios del servidor", "error");
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); };

  const usuarios = state.usuarios.filter(u => u.rol === "Usuario");

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    if (!form.email.trim())  e.email  = "El correo es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Correo inválido";
    else if (state.usuarios.some(u => u.email === form.email.trim())) e.email = "Este correo ya existe";
    if (!form.telefono.trim())   e.telefono = "El teléfono es obligatorio";
    else if (!/^\d{10}$/.test(form.telefono.trim())) e.telefono = "El teléfono debe tener exactamente 10 dígitos";
    return e;
  };

  const guardar = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    try {
      const { registrarse } = await import("../../services/api");
      const resp = await registrarse({
        nombre:   form.nombre.trim(),
        correo:   form.email.trim(),
        password: "Temporal123!",
        telefono: form.telefono.trim() || undefined,
      });
      const initials = form.nombre.trim().split(" ").slice(0, 2).map(w => w[0].toUpperCase()).join("");
      dispatch({
        type: "ADD_USER",
        payload: {
          id:       resp.usuario?.idUsuario ?? Date.now(),
          nombre:   form.nombre.trim(),
          email:    form.email.trim(),
          telefono: form.telefono.trim(),
          rol:      "Usuario",
          pts:      0,
          activo:   true,
          av:       initials,
          fechaAlta: new Date().toLocaleDateString("es-CO"),
        },
      });
      showToast(`Usuario "${form.nombre.trim()}" registrado`);
      setModal(false); setForm(EMPTY_FORM); setErrors({});
    } catch (err) {
      showToast("Error al registrar: " + err.message, "error");
    }
  };

  const cerrarModal = () => { setModal(false); setForm(EMPTY_FORM); setErrors({}); };

  const handleToggle = async (id, nombre, estadoActual) => {
    try {
      await actualizarUsuario(id, { idEstadoUsuario: estadoActual ? 2 : 1 });
      dispatch({ type: "TOGGLE_USER", payload: id });
      showToast(
        estadoActual ? `${nombre} ha sido desactivado` : `${nombre} ha sido activado`,
        estadoActual ? "error" : "success"
      );
    } catch (err) {
      showToast("Error al cambiar estado: " + err.message, "error");
    }
  };

  const handleSave = (u) => dispatch({ type: "UPDATE_USER", payload: u });

  const handleEliminar = async (id) => {
    try {
      await eliminarUsuario(id);
      dispatch({ type: "DEL_USER", payload: id });
      showToast("Usuario eliminado", "error");
      if (viewUser?.id === id) setViewUser(null);
    } catch (err) {
      showToast("Error al eliminar: " + err.message, "error");
    }
  };

  const filtered = usuarios.filter(u => {
    const q = search.toLowerCase();
    return (
      u.nombre.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.zona || "").toLowerCase().includes(q)
    );
  });

  const avatarPreview = form.nombre.trim().split(" ").slice(0, 2)
    .map(w => w[0]?.toUpperCase() || "").join("") || "?";

  return (
    <div className="panel-page">

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        <div>
          <h4 className="panel-title">
            <i className="bi bi-recycle" style={{ color: "var(--verde)", marginRight: 8 }}></i>
            Gestión de usuarios
          </h4>
          <span className="panel-subtitle">
            {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} registrado{usuarios.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button className="btn-panel primary" onClick={() => setModal(true)}>
          <i className="bi bi-person-plus"></i> Nuevo usuario
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="search-box" style={{ maxWidth: 380 }}>
          <i className="bi bi-search"></i>
          <input
            placeholder="Buscar por nombre, correo o zona..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "12px 0", fontSize: "0.78rem", color: "var(--gris-texto)" }}>
          <span className="spinner-border spinner-border-sm" style={{ color: "var(--verde)", marginRight: 6 }}></span>
          Cargando usuarios del servidor...
        </div>
      )}

      <div className="panel-table-wrap">
        <TablaUsuarios
          lista={filtered}
          onToggle={handleToggle}
          onVer={setViewUser}
          onEliminar={handleEliminar}
        />
      </div>

      <ModalDetalle
        user={viewUser}
        onClose={() => setViewUser(null)}
        onSave={handleSave}
        showToast={showToast}
      />

      {modal && (
        <div
          className="panel-modal-bg"
          onClick={ev => { if (ev.target === ev.currentTarget) cerrarModal(); }}
        >
          <div className="panel-modal">

            <div className="panel-modal-head">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: "var(--verde-claro)", border: "1px solid var(--gris-borde)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: "0.9rem", color: "var(--verde)",
                  flexShrink: 0,
                }}>
                  {avatarPreview}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--negro)" }}>
                    <i className="bi bi-recycle" style={{ color: "var(--verde)", marginRight: 6 }}></i>
                    Nuevo usuario
                  </div>
                </div>
              </div>
              <button className="btn-icon" onClick={cerrarModal}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="panel-modal-body">
              <div className="panel-modal-grid">

                <div>
                  <label className="panel-label">Nombre completo *</label>
                  <input
                    className="panel-input"
                    value={form.nombre}
                    onChange={e => set("nombre", e.target.value)}
                    placeholder="Ej: Carlos Ruiz"
                    style={errors.nombre ? { borderColor: "var(--rojo)" } : {}}
                  />
                  {errors.nombre && (
                    <span style={{ fontSize: "0.72rem", color: "var(--rojo)", marginTop: 2, display: "block" }}>
                      {errors.nombre}
                    </span>
                  )}
                </div>

                <div>
                  <label className="panel-label">Correo electrónico *</label>
                  <input
                    type="email"
                    className="panel-input"
                    value={form.email}
                    onChange={e => set("email", e.target.value)}
                    placeholder="correo@ejemplo.com"
                    style={errors.email ? { borderColor: "var(--rojo)" } : {}}
                  />
                  {errors.email && (
                    <span style={{ fontSize: "0.72rem", color: "var(--rojo)", marginTop: 2, display: "block" }}>
                      {errors.email}
                    </span>
                  )}
                </div>

                <div>
                  <label className="panel-label">Teléfono</label>
                  <input
                    className="panel-input"
                    value={form.telefono}
                    onChange={e => set("telefono", e.target.value)}
                    placeholder="Ej: 300 123 4567"
                  />
                </div>

                <div className="full">
                  <div style={{
                    background: "var(--verde-claro)",
                    border: "1px solid var(--verde)",
                    borderRadius: 6,
                    padding: "8px 12px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "var(--verde)",
                  }}>
                    <i className="bi bi-info-circle" style={{ marginRight: 6 }}></i>
                    {rolDesc["Usuario"]}
                  </div>
                </div>

                <div className="full">
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", borderRadius: 6,
                    background: "#fafafa", border: "1px solid var(--gris-borde)",
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--negro)" }}>Estado inicial</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--gris-texto)" }}>
                        El usuario podrá acceder de inmediato si está activo
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontSize: "0.78rem", fontWeight: 600,
                        color: form.activo ? "var(--verde)" : "var(--gris-texto)",
                      }}>
                        {form.activo ? "Activo" : "Inactivo"}
                      </span>
                      <Toggle checked={form.activo} onChange={v => set("activo", v)} />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="panel-modal-foot">
              <button className="btn-panel ghost" onClick={cerrarModal}>
                <i className="bi bi-x-lg"></i> Cancelar
              </button>
              <button className="btn-panel primary" onClick={guardar}>
                <i className="bi bi-check2-circle"></i> Registrar usuario
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}