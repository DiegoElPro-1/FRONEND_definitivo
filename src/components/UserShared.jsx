import { useState, useEffect } from "react";
import { ZONAS, ROLES_CFG } from "../constants/data";
import { getPuntosReciclaje } from "../services/api";

export const rolDesc = {
  "Admin":     "Acceso total al sistema, puede gestionar usuarios y configuración.",
  "Usuario":   "Usuario que registra entregas y acumula puntos de reciclaje.",
  "Afiliado":  "Empresa, supermercado o entidad aliada que ofrece beneficios y recompensas.",
  "Encargado": "Responsable designado por un afiliado para gestionar su punto de recolección.",
};

const ROL_DEFAULTS = {
  "Admin":     { color: "#1e40af", bg: "#dbeafe", icon: "bi-shield-lock-fill" },
  "Usuario":   { color: "#16a34a", bg: "#dcfce7", icon: "bi-recycle" },
  "Afiliado":  { color: "#b45309", bg: "#fef3c7", icon: "bi-shop" },
  "Encargado": { color: "#7c3aed", bg: "#ede9fe", icon: "bi-person-badge-fill" },
};

export function getRolCfg(rol) {
  return ROLES_CFG?.[rol] || ROL_DEFAULTS[rol] || { color: "#6b7280", bg: "#f3f4f6", icon: "bi-person" };
}

// ── Badge de rol ───────────────────────────────────────────────────────────────
export function RolBadge({ rol }) {
  const cfg = getRolCfg(rol);
  return (
    <span
      className="badge rounded-pill d-inline-flex align-items-center gap-1 fw-bold"
      style={{ background: cfg.bg, color: cfg.color, fontSize: 11, padding: "4px 10px" }}
    >
      <i className={`bi ${cfg.icon}`}></i> {rol}
    </span>
  );
}

// ── Toggle switch ──────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange }) {
  return (
    <div className="form-check form-switch mb-0">
      <input
        className="form-check-input"
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ width: 40, height: 22, cursor: "pointer" }}
      />
    </div>
  );
}

// ── Modal editable ─────────────────────────────────────────────────────────────
export function ModalDetalle({ user, onClose, onSave, showToast, todosMateriales }) {
  const [form,   setForm]   = useState(null);
  const [errors, setErrors] = useState({});
  const [materialesSel, setMaterialesSel] = useState([]);
  const [puntosList, setPuntosList] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) { setForm({ ...user }); setMaterialesSel(user.materialesIds || []); setErrors({}); }
  }, [user]);

  useEffect(() => {
    if (user?.rol === "Encargado") {
      getPuntosReciclaje().then(data => setPuntosList(data.puntos ?? [])).catch(() => {});
    }
  }, [user]);

  if (!user || !form) return null;

  const cfg = getRolCfg(user.rol);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  };

  const avatarPreview = (form.nombre || "")
    .trim().split(" ").slice(0, 2)
    .map(w => w[0]?.toUpperCase() || "").join("") || "?";

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    if (!form.email.trim())  e.email  = "El correo es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Correo inválido";
    if (form.pts !== "" && isNaN(Number(form.pts))) e.pts = "Debe ser un número válido";
    if (todosMateriales !== undefined && user.rol === "Afiliado" && materialesSel.length === 0) {
      e.materiales = "Debes seleccionar al menos un material";
    }
    return e;
  };

  const guardar = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const updatedUser = {
      ...form,
      nombre: form.nombre.trim(),
      email:  form.email.trim(),
      pts:    Number(form.pts) || 0,
      av:     form.nombre.trim().split(" ").slice(0, 2).map(w => w[0].toUpperCase()).join(""),
      ...(todosMateriales !== undefined ? { materialesIds: materialesSel } : {}),
    };
    try {
      if (onSave) await onSave(updatedUser);
      onClose();
    } catch {
      // error handled by parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)", zIndex: 9000 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content rounded-4 border-0 shadow-lg">

          {/* Header */}
          <div
            className="modal-header border-0 rounded-top-4 px-4 pt-4 pb-3"
            style={{ background: cfg.bg }}
          >
            <div className="d-flex align-items-center gap-3 w-100">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0 bg-white"
                style={{ width: 56, height: 56, fontSize: 20, color: cfg.color, border: `3px solid ${cfg.color}` }}
              >
                {avatarPreview}
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0" style={{ color: cfg.color }}>
                  <i className={`bi ${cfg.icon} me-2`}></i>Editar {user.rol}
                </h5>
                <div className="small mt-1" style={{ color: cfg.color, opacity: 0.75 }}>
                  Modifica los datos y guarda los cambios
                </div>
              </div>
            </div>
            <button type="button" className="btn-close ms-3" onClick={onClose} />
          </div>

          {/* Body */}
          <div className="modal-body px-4 py-3">

            {/* Información personal */}
            <p className="text-uppercase fw-bold text-muted mb-2" style={{ fontSize: 11, letterSpacing: 1 }}>
              <i className="bi bi-person-lines-fill me-1"></i>Información personal
            </p>
            <div className="row g-3 mb-4">

              {user.rol === "Afiliado" && (
                <div className="col-12">
                  <label className="form-label fw-semibold small text-secondary mb-1">
                    <i className="bi bi-building me-1"></i>Nombre de la entidad / empresa
                  </label>
                  <input
                    className="form-control form-control-sm bg-light rounded-3"
                    value={form.nombreEntidad || ""}
                    onChange={e => set("nombreEntidad", e.target.value)}
                    placeholder="Ej: Supermercado La 14"
                  />
                </div>
              )}

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-secondary mb-1">
                  <i className="bi bi-person me-1"></i>
                  {user.rol === "Afiliado" ? "Nombre del contacto *" : "Nombre completo *"}
                </label>
                <input
                  className={`form-control form-control-sm bg-light rounded-3 ${errors.nombre ? "is-invalid" : ""}`}
                  value={form.nombre}
                  onChange={e => set("nombre", e.target.value)}
                  placeholder="Ej: Carlos Ruiz"
                />
                {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-secondary mb-1">
                  <i className="bi bi-envelope me-1"></i>Correo electrónico *
                </label>
                <input
                  type="email"
                  className={`form-control form-control-sm bg-light rounded-3 ${errors.email ? "is-invalid" : ""}`}
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-secondary mb-1">
                  <i className="bi bi-telephone me-1"></i>Teléfono
                </label>
                <input
                  className="form-control form-control-sm bg-light rounded-3"
                  value={form.telefono || ""}
                  onChange={e => set("telefono", e.target.value)}
                  placeholder="Ej: 300 123 4567"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-secondary mb-1">
                  <i className="bi bi-geo-alt me-1"></i>Zona
                </label>
                <select
                  className="form-select form-select-sm bg-light rounded-3"
                  value={form.zona || ""}
                  onChange={e => set("zona", e.target.value)}
                >
                  <option value="">Sin zona</option>
                  {ZONAS.map(z => <option key={z}>{z}</option>)}
                </select>
              </div>
            </div>

            {/* Asignación y puntos (solo Encargado) */}
            {user.rol === "Encargado" && (
              <>
                <p className="text-uppercase fw-bold text-muted mb-2" style={{ fontSize: 11, letterSpacing: 1 }}>
                  <i className="bi bi-pin-map me-1"></i>Asignación y puntos
                </p>
                <div className="row g-3 mb-4">
                  <div className="col-md-8">
                    <label className="form-label fw-semibold small text-secondary mb-1">
                      <i className="bi bi-geo-fill me-1"></i>Punto asignado
                    </label>
                    <select
                      className="form-select form-select-sm bg-light rounded-3"
                      value={form.puntoAsignado || ""}
                      onChange={e => set("puntoAsignado", e.target.value)}
                    >
                      <option value="">Sin asignar</option>
                      {puntosList.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold small text-secondary mb-1">
                      <i className="bi bi-star-fill text-warning me-1"></i>Puntos acumulados
                    </label>
                    <div className="input-group input-group-sm">
                      <input
                        type="number"
                        min="0"
                        className={`form-control bg-light rounded-start-3 ${errors.pts ? "is-invalid" : ""}`}
                        value={form.pts ?? 0}
                        onChange={e => set("pts", e.target.value)}
                      />
                      <span className="input-group-text rounded-end-3 bg-success-subtle text-success fw-bold border-0">
                        pts
                      </span>
                      {errors.pts && <div className="invalid-feedback">{errors.pts}</div>}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Materiales que acepta (solo Afiliado) */}
            {todosMateriales !== undefined && user.rol === "Afiliado" && (
              <>
                <p className="text-uppercase fw-bold text-muted mb-2" style={{ fontSize: 11, letterSpacing: 1 }}>
                  <i className="bi bi-box-seam me-1"></i>Materiales que acepta *
                </p>
                <div className="d-flex flex-wrap gap-2 mb-4" style={{ padding: "4px 0" }}>
                  {todosMateriales.map((m) => {
                    const selected = materialesSel.includes(m.idMaterial);
                    return (
                      <div key={m.idMaterial}
                        onClick={() => {
                          setMaterialesSel(prev =>
                            selected ? prev.filter(id => id !== m.idMaterial) : [...prev, m.idMaterial]
                          );
                        }}
                        style={{
                          padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
                          border: `1.5px solid ${selected ? "var(--verde)" : "var(--gris-borde)"}`,
                          backgroundColor: selected ? "var(--verde-claro)" : "#fff",
                          color: selected ? "var(--verde)" : "var(--gris-texto)",
                          transition: "all 0.15s",
                        }}>
                        {m.nombre}
                      </div>
                    );
                  })}
                  {todosMateriales.length === 0 && (
                    <span style={{ fontSize: "0.75rem", color: "var(--gris-texto)" }}>
                      No hay materiales disponibles
                    </span>
                  )}
                </div>
                {errors.materiales && (
                  <div className="text-danger small mb-3">
                    <i className="bi bi-exclamation-circle me-1"></i>{errors.materiales}
                  </div>
                )}
              </>
            )}

            {/* Estado */}
            <p className="text-uppercase fw-bold text-muted mb-2" style={{ fontSize: 11, letterSpacing: 1 }}>
              <i className="bi bi-toggles me-1"></i>Estado del registro
            </p>
            <div className={`d-flex align-items-center justify-content-between p-3 rounded-3 border ${form.activo ? "bg-success-subtle" : "bg-light"}`}>
              <div>
                <div className="fw-bold small">Estado actual</div>
                <div className="text-muted" style={{ fontSize: 11 }}>
                  {form.activo
                    ? "Este registro está activo y puede operar normalmente."
                    : "Este registro está inactivo y no puede operar."}
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className={`badge rounded-pill fw-semibold ${form.activo ? "bg-success" : "bg-secondary"}`} style={{ fontSize: 11, minWidth: 66 }}>
                  <i className={`bi ${form.activo ? "bi-check-circle" : "bi-x-circle"} me-1`}></i>
                  {form.activo ? "Activo" : "Inactivo"}
                </span>
                <Toggle checked={form.activo} onChange={v => set("activo", v)} />
              </div>
            </div>

            {/* Info solo lectura */}
            <div className="row g-2 mt-3">
              {[
                ["bi-calendar-event", "Fecha de alta", user.fechaAlta || "—"],
                ["bi-person-badge",   "Rol",           user.rol],
              ].map(([ic, l, v]) => (
                <div key={l} className="col-6">
                  <div className="bg-light rounded-3 p-2 border">
                    <div className="text-muted mb-1" style={{ fontSize: 10 }}>
                      <i className={`bi ${ic} me-1`}></i>{l}
                    </div>
                    <div className="fw-bold small">{v}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Footer */}
          <div className="modal-footer border-0 px-4 pb-4 pt-2 gap-2">
            <button className="btn btn-light border rounded-3 flex-fill" onClick={onClose}>
              <i className="bi bi-x-lg me-1"></i>Cancelar
            </button>
            <button
              className="btn fw-bold rounded-3 flex-fill"
              style={{ background: cfg.color, color: "#fff" }}
              onClick={guardar}
              disabled={saving}
            >
              {saving ? (
                <span className="spinner-border spinner-border-sm me-2" />
              ) : (
                <i className={`bi ${cfg.icon} me-1`}></i>
              )}
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Tabla genérica ─────────────────────────────────────────────────────────────
export function TablaUsuarios({ lista, onToggle, onVer, onEliminar }) {
  if (lista.length === 0) {
    return (
      <div className="card shadow-sm p-0 overflow-hidden">
        <div className="text-center py-5 text-muted">
          <i className="bi bi-person-x fs-2 d-block mb-2 text-secondary"></i>
          <div className="fw-semibold">Sin registros que coincidan</div>
          <div className="small mt-1">Intenta con otro término de búsqueda</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm overflow-hidden p-0">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
          <thead className="table-light">
            <tr>
              {[
                ["bi-person",        "Usuario"],
                ["bi-envelope",      "Email"],
                ["bi-shield",        "Rol"],
                ["bi-geo-alt",       "Zona"],
                ["bi-star",          "Puntos"],
                ["bi-toggles",       "Estado"],
                ["bi-gear",          "Acciones"],
              ].map(([ic, h]) => (
                <th key={h}
                  className="text-uppercase text-muted fw-semibold border-0"
                  style={{ padding: "10px 16px", fontSize: 11 }}
                >
                  <i className={`bi ${ic} me-1`}></i>{h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map(u => {
              const cfg = getRolCfg(u.rol);
              return (
                <tr key={u.id} style={{ opacity: u.activo ? 1 : 0.5, transition: ".2s" }}>

                  {/* Avatar + nombre */}
                  <td style={{ padding: "12px 16px" }}>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                        style={{
                          width: 34, height: 34, fontSize: 11,
                          background: u.activo ? cfg.bg : "#f3f4f6",
                          color:      u.activo ? cfg.color : "#9ca3af",
                          border: `1.5px solid ${u.activo ? cfg.color : "#d1d5db"}`,
                        }}
                      >
                        {u.av}
                      </div>
                      <div>
                        <div className="fw-bold">{u.nombre}</div>
                        {u.fechaAlta && (
                          <div className="text-muted" style={{ fontSize: 10 }}>
                            <i className="bi bi-calendar2 me-1"></i>Alta: {u.fechaAlta}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="text-secondary" style={{ padding: "12px 16px" }}>
                    <i className="bi bi-envelope me-1 text-muted"></i>{u.email}
                  </td>
                  <td style={{ padding: "12px 16px" }}><RolBadge rol={u.rol} /></td>
                  <td className="text-secondary" style={{ padding: "12px 16px", fontSize: 12 }}>
                    <i className="bi bi-geo-alt me-1 text-muted"></i>{u.zona || "—"}
                  </td>
                  <td className="fw-bold text-success" style={{ padding: "12px 16px" }}>
                    <i className="bi bi-star-fill text-warning me-1"></i>
                    {(u.pts || 0).toLocaleString()}
                  </td>

                  {/* Toggle */}
                  <td style={{ padding: "12px 16px" }}>
                    <div className="d-flex align-items-center gap-2">
                      <Toggle checked={u.activo} onChange={() => onToggle(u.id, u.nombre, u.activo)} />
                      <span className={`badge rounded-pill ${u.activo ? "bg-success" : "bg-secondary"}`} style={{ fontSize: 10, minWidth: 58 }}>
                        <i className={`bi ${u.activo ? "bi-check-circle" : "bi-x-circle"} me-1`}></i>
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </td>

                  {/* Acciones */}
                  <td style={{ padding: "12px 16px" }}>
                    <div className="d-flex gap-1">
                      <button
                        title="Editar"
                        className="btn btn-sm rounded-3 fw-semibold d-flex align-items-center gap-1"
                        style={{ fontSize: 11, padding: "4px 10px", background: cfg.bg, color: cfg.color, border: "none" }}
                        onClick={() => onVer(u)}
                      >
                        <i className="bi bi-pencil-square"></i> Editar
                      </button>
                      <button
                        title="Eliminar"
                        className="btn btn-outline-danger btn-sm rounded-3 d-flex align-items-center justify-content-center"
                        style={{ width: 30, height: 30, fontSize: 13, padding: 0 }}
                        onClick={() => onEliminar(u.id)}
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}