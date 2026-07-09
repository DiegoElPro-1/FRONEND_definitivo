import { useState, useEffect } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Toggle, ModalDetalle, TablaUsuarios } from "../../components/UserShared";
import {
  getAdmins,
  crearAdmin,
  actualizarAdmin,
  eliminarAdmin,
  getAliados,
} from "../../services/api";

const EMPTY_FORM = {
  nombre: "",
  email: "",
  telefono: "",
  cedula: "",
  rol: "Admin",
  activo: true,
  idAliado: "",
};

export default function Administradores({
  state,
  dispatch,
  showToast,
  user,
}) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [viewUser, setViewUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aliados, setAliados] = useState([]);
  const esSuperAdmin = user?.esSuperAdmin;

  const cargarAliados = () => {
    getAliados().then(data => {
      setAliados(data.aliados ?? []);
    }).catch(() => {});
  };

  const zonaCompleta = (a) => {
    if (!a) return "";
    return a.direccion ? `${a.zona} - ${a.direccion}` : (a.zona || "");
  };

  useEffect(() => {
    getAdmins()
      .then((data) => {
        const lista = (
          data.admins ?? data.administradores ?? []
        ).map((u) => ({
          id: u.idAdmin ?? u.idUsuario,
          nombre: u.nombre,
          email: u.correo,
          telefono: u.telefono ?? "",
          rol: "Admin",
          zona: u.zona || "",
          activo: u.idEstadoUsuario === 1,
          idAliado: u.idAliado,
          av: (u.nombre ?? "")
            .trim()
            .split(" ")
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase() ?? "")
            .join(""),
          fechaAlta: u.fechaRegistro
            ? new Date(u.fechaRegistro).toLocaleDateString("es-CO")
            : "—",
        }));

        dispatch({ type: "SET_ADMINS", payload: lista });
      })
      .catch(() => {
        showToast("No se pudieron cargar los administradores", "error");
      })
      .finally(() => setLoading(false));
    if (esSuperAdmin) cargarAliados();
  }, [dispatch, showToast, esSuperAdmin]);

  useEffect(() => {
    if (modal) {
      cargarAliados();
      if (!esSuperAdmin && user?.idAliado) {
        setForm((f) => ({ ...f, idAliado: user.idAliado }));
      }
    }
  }, [modal, esSuperAdmin, user]);

  useEffect(() => {
    if (form.idAliado && aliados.length > 0) {
      const a = aliados.find(x => x.idAliado === (form.idAliado === "" ? null : Number(form.idAliado)));
      if (a) setForm(f => ({ ...f, zona: zonaCompleta(a) }));
    }
  }, [form.idAliado, aliados]);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const admins = state.usuarios.filter((u) => u.rol === "Admin");

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    if (!form.email.trim()) {
      e.email = "El correo es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Correo inválido";
    } else if (state.usuarios.some((u) => u.email === form.email.trim())) {
      e.email = "Este correo ya existe";
    }
    if (!form.telefono.trim()) {
      e.telefono = "El teléfono es obligatorio";
    } else if (!/^\d{10}$/.test(form.telefono.trim())) {
      e.telefono = "El teléfono debe tener exactamente 10 dígitos";
    }
    if (form.cedula.trim() && form.cedula.trim().length < 5) {
      e.cedula = "La cédula debe tener al menos 5 dígitos";
    }
    if (esSuperAdmin && !form.idAliado) {
      e.idAliado = "Debes seleccionar un supermercado";
    }
    return e;
  };

  const guardar = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);

    try {
      const payload = {
        nombre: form.nombre.trim(),
        correo: form.email.trim(),
        telefono: form.telefono.trim(),
        cedula: form.cedula.trim() || undefined,
        zona: form.zona || null,
      };
      if (form.idAliado) {
        payload.idAliado = Number(form.idAliado);
      }

      const resp = await crearAdmin(payload);

      const initials = form.nombre.trim().split(" ").slice(0, 2).map((w) => w[0].toUpperCase()).join("");

      dispatch({
        type: "ADD_USER",
          payload: {
            id: resp.admin?.idAdmin ?? resp.usuario?.idUsuario ?? Date.now(),
            nombre: form.nombre.trim(),
            email: form.email.trim(),
            telefono: form.telefono.trim(),
            rol: "Admin",
            zona: form.zona || "",
            activo: true,
            av: initials,
            idAliado: form.idAliado ? Number(form.idAliado) : null,
            fechaAlta: new Date().toLocaleDateString("es-CO"),
          },
      });

      showToast("Administrador creado correctamente");
      cerrarModal();
    } catch (err) {
      showToast("Error al crear administrador: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const cerrarModal = () => {
    setModal(false);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleToggle = async (id, nombre, estadoActual) => {
    try {
      await actualizarAdmin(id, { idEstadoUsuario: estadoActual ? 2 : 1 });
      dispatch({ type: "TOGGLE_USER", payload: id });
      showToast(estadoActual ? `${nombre} ha sido desactivado` : `${nombre} ha sido activado`, estadoActual ? "error" : "success");
    } catch (err) {
      showToast("Error al cambiar estado: " + err.message, "error");
    }
  };

  const handleSave = async (u) => {
    try {
      const payload = { nombre: u.nombre, telefono: u.telefono, correo: u.email, zona: u.zona || null };
      if (u.idAliado) {
        payload.idAliado = u.idAliado || null;
      }
      await actualizarAdmin(u.id, payload);
      const z = u.zona || "";
      dispatch({ type: "UPDATE_USER", payload: { ...u, zona: z } });
      showToast("Cambios guardados correctamente");
    } catch (err) {
      showToast("Error al actualizar: " + err.message, "error");
      throw err;
    }
  };

  const handleEliminar = async (id) => {
    if (admins.length <= 1) {
      showToast("Debe existir al menos un administrador", "error");
      return;
    }
    try {
      await eliminarAdmin(id);
      dispatch({ type: "DEL_USER", payload: id });
      showToast("Administrador eliminado", "error");
      if (viewUser?.id === id) setViewUser(null);
    } catch (err) {
      showToast("Error al eliminar: " + err.message, "error");
    }
  };

  const aliadoNombre = (id) => id ? (aliados.find((a) => a.idAliado === id)?.nombre || "") : "";
  const filtered = admins.filter((u) => {
    const q = search.toLowerCase();
    return u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || aliadoNombre(u.idAliado).toLowerCase().includes(q);
  });

  const avatarPreview = form.nombre.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("") || "?";

  return (
    <div className="panel-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        <div>
          <h4 className="panel-title">
            <i className="bi bi-shield-lock" style={{ color: "var(--verde)", marginRight: 8 }}></i>
            Gestión de administradores
          </h4>
          <span className="panel-subtitle">{admins.length} administrador{admins.length !== 1 ? "es" : ""} registrado{admins.length !== 1 ? "s" : ""}</span>
        </div>
        <button className="btn-panel primary" onClick={() => setModal(true)}>
          <i className="bi bi-person-plus"></i> Nuevo administrador
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="search-box" style={{ maxWidth: 380 }}>
          <i className="bi bi-search"></i>
          <input placeholder="Buscar por nombre o correo..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%" }} />
        </div>
      </div>

      {loading && (
        <div className="text-center py-3">
          <LoadingSpinner size="sm" text="Cargando administradores" />
        </div>
      )}

      <div className="panel-table-wrap">
        <TablaUsuarios
          lista={filtered}
          onToggle={handleToggle}
          onVer={setViewUser}
          onEliminar={handleEliminar}
          extraColumns={esSuperAdmin ? [{ icon: "bi-building", label: "Supermercado", render: (u) => u.idAliado ? (aliados.find((a) => a.idAliado === u.idAliado)?.nombre || <span style={{ color: "#ddd" }}>—</span>) : <span style={{ color: "#ddd" }}>—</span> }] : undefined}
        />
      </div>

      <ModalDetalle user={viewUser} onClose={() => setViewUser(null)} onSave={handleSave} showToast={showToast} aliadosList={esSuperAdmin ? aliados : undefined} />

      {modal && (
        <div className="panel-modal-bg" onClick={(ev) => { if (ev.target === ev.currentTarget) cerrarModal(); }}>
          <div className="panel-modal">
            <div className="panel-modal-head">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--verde-claro)", border: "1px solid var(--gris-borde)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", color: "var(--verde)" }}>
                  {avatarPreview}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>
                    <i className="bi bi-shield-lock" style={{ color: "var(--verde)", marginRight: 6 }}></i>
                    Nuevo administrador
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--gris-texto)" }}>
                    {esSuperAdmin ? "Asignado a un supermercado" : "Acceso total al sistema"}
                  </div>
                </div>
              </div>
              <button className="btn-icon" onClick={cerrarModal}><i className="bi bi-x-lg"></i></button>
            </div>

            <div className="panel-modal-body">
              <div className="panel-modal-grid">
                <div>
                  <label className="panel-label">Nombre completo *</label>
                  <input className="panel-input" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Ej: Ana García" style={errors.nombre ? { borderColor: "var(--rojo)" } : {}} />
                  {errors.nombre && <span style={{ fontSize: "0.72rem", color: "var(--rojo)" }}>{errors.nombre}</span>}
                </div>

                <div>
                  <label className="panel-label">Correo electrónico *</label>
                  <input type="email" className="panel-input" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="admin@ejemplo.com" style={errors.email ? { borderColor: "var(--rojo)" } : {}} />
                  {errors.email && <span style={{ fontSize: "0.72rem", color: "var(--rojo)" }}>{errors.email}</span>}
                </div>

                <div>
                  <label className="panel-label">Cédula</label>
                  <input className="panel-input" value={form.cedula} onChange={(e) => set("cedula", e.target.value.replace(/\D/g, "").slice(0, 15))} placeholder="Número de cédula" style={errors.cedula ? { borderColor: "var(--rojo)" } : {}} />
                  {errors.cedula && <span style={{ fontSize: "0.72rem", color: "var(--rojo)" }}>{errors.cedula}</span>}
                </div>

                <div>
                  <label className="panel-label">Teléfono *</label>
                  <input className="panel-input" value={form.telefono} onChange={(e) => set("telefono", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="3001234567" />
                  {errors.telefono && <span style={{ fontSize: "0.72rem", color: "var(--rojo)" }}>{errors.telefono}</span>}
                </div>

                {esSuperAdmin ? (
                  <div>
                    <label className="panel-label">Supermercado *</label>
                    <select className="panel-input" value={form.idAliado} onChange={(e) => {
                      set("idAliado", e.target.value);
                      const a = aliados.find(x => x.idAliado === Number(e.target.value));
                      if (a) set("zona", zonaCompleta(a));
                    }} style={errors.idAliado ? { borderColor: "var(--rojo)" } : {}}>
                      <option value="">Seleccionar supermercado...</option>
                      {aliados.map((a) => (
                        <option key={a.idAliado} value={a.idAliado}>{a.nombre}</option>
                      ))}
                    </select>
                    {errors.idAliado && <span style={{ fontSize: "0.72rem", color: "var(--rojo)" }}>{errors.idAliado}</span>}
                  </div>
                ) : (
                  <div>
                    <label className="panel-label">Supermercado</label>
                    <div className="panel-input" style={{ padding: "8px 12px", background: "#f5f5f5", borderRadius: 6, color: "#666", cursor: "not-allowed" }}>
                      {user?.aliadoNombre || "Sin supermercado asignado"}
                    </div>
                  </div>
                )}

                <div>
                  <label className="panel-label">Zona</label>
                  <input className="panel-input" value={form.zona || ""} onChange={(e) => set("zona", e.target.value)} placeholder="Sin zona" />
                </div>

                <div className="full">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "1px solid var(--gris-borde)", borderRadius: 6 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>Estado inicial</div>
                      <div style={{ fontSize: "0.72rem" }}>El administrador podrá acceder si está activo</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="panel-badge">{form.activo ? "Activo" : "Inactivo"}</span>
                      <Toggle checked={form.activo} onChange={(v) => set("activo", v)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel-modal-foot">
              <button className="btn-panel ghost" onClick={cerrarModal}><i className="bi bi-x"></i> Cancelar</button>
              <button className="btn-panel primary" onClick={guardar} disabled={saving}>
                {saving ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-check-lg me-1" />}
                {saving ? "Creando..." : "Crear administrador"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
