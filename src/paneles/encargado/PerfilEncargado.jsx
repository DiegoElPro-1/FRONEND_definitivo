// src/paneles/encargado/PerfilEncargado.jsx
import { useState, useEffect } from "react";
import { C, S } from "./encargadoTheme";
import { getPerfil, actualizarPerfil } from "../../services/api";

function cargarDeStorage() {
  try {
    const u = JSON.parse(localStorage.getItem("usuario") || "{}");
    const rol = typeof u.rol === "string" ? u.rol : "Encargado";
    return {
      nombre: u.nombre || "",
      email: u.correo || "",
      telefono: u.telefono || "",
      punto: u.puntoACargo?.nombre || "",
      aliadoNombre: u.aliado || u.aliadoNombre || "",
      rol,
      fechaAlta: u.fechaRegistro || "",
      foto: localStorage.getItem("perfilFotoEncargado") || localStorage.getItem("perfilFoto") || u.imagen || "",
    };
  } catch { return {}; }
}

export default function PerfilEncargado() {
  const [editMode, setEditMode] = useState(false);
  const [toast,    setToast]    = useState(null);
  const [form,     setForm]     = useState(cargarDeStorage);
  const [saved,    setSaved]    = useState(cargarDeStorage);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getPerfil();
        const u = data?.usuario || data || {};
        const foto = localStorage.getItem("perfilFotoEncargado") || localStorage.getItem("perfilFoto") || u?.imagen || "";
        const perfil = {
          nombre: u?.nombre || "",
          email: u?.correo || "",
          telefono: u?.telefono || "",
          punto: u?.puntoACargo?.nombre || "",
          aliadoNombre: u?.aliado || u?.aliadoNombre || "",
          rol: u?.rol || "Encargado",
          fechaAlta: u?.fechaRegistro || "",
          foto,
        };
        setSaved(perfil); setForm(perfil);
      } catch (e) {
        console.warn("API perfil no disponible, usando datos locales:", e.message);
      }
    })();
  }, []);

  const guardar = async () => {
    if (!form.nombre.trim()) { showToast("El nombre es obligatorio", "error"); return; }
    try {
      await actualizarPerfil({
        nombre: form.nombre,
        telefono: form.telefono,
        imagen: form.foto || null,
      });
      setSaved({ ...form }); setEditMode(false);
      showToast("Perfil actualizado correctamente");
    } catch { showToast("Error actualizando perfil", "error"); }
  };

  const cancelar = () => { setForm({ ...saved }); setEditMode(false); };

  const handleFoto = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const url = URL.createObjectURL(file);
    setSaved(p => ({ ...p, foto: url })); setForm(p => ({ ...p, foto: url }));
    localStorage.setItem("perfilFotoEncargado", url); localStorage.setItem("perfilFoto", url);
  };

  return (
    <div className="row g-3 m-0 w-100">
      {toast && (
        <div className="col-12 p-0">
          <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-2 mb-0" style={{ ...(toast.type === "error" ? S.alertaError : { backgroundColor: C.verdeClaro, border: `1px solid ${C.verdeMedio}`, color: C.verdeOscuro }), fontSize: 13 }}>
            <i className={`bi ${toast.type === "error" ? "bi-x-circle" : "bi-check-circle"}`} />{toast.msg}
          </div>
        </div>
      )}

      {/* Columna izquierda */}
      <div className="col-md-4 ps-0">
        <div className="card shadow-sm" style={S.card}>
          <div className="card-body text-center">
            <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 overflow-hidden"
              style={{ width: 96, height: 96, cursor: "pointer", backgroundColor: C.verdeClaro, border: `3px solid ${C.verde}` }}
              onClick={() => document.getElementById("inputFotoEnc").click()} title="Cambiar foto">
              <input type="file" accept="image/*" id="inputFotoEnc" style={{ display: "none" }} onChange={handleFoto} />
              {saved.foto
                ? <img src={saved.foto} alt="perfil" className="w-100 h-100 object-fit-cover" />
                : <span className="fw-bold" style={{ fontSize: 32, color: C.verdeOscuro }}>
                    {saved.nombre ? saved.nombre.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "?"}
                  </span>}
            </div>
            <div className="fw-bold fs-5 text-dark mb-1">{saved.nombre || "Sin nombre"}</div>
            <div className="text-muted small mb-2">{saved.email || "Sin correo"}</div>
            <span className="badge fw-bold mb-3" style={{ fontSize: 11, backgroundColor: C.verdeClaro, color: C.verdeOscuro, border: `1px solid ${C.verdeMedio}` }}>
              <i className="bi bi-person-badge me-1" />{saved.rol || "Encargado"}
            </span>
            <ul className="list-group list-group-flush text-start mb-4">
              {[
                ["bi-building",       "Supermercado",  saved.aliadoNombre || "No asignado"],
                ["bi-telephone-fill", "Teléfono",      saved.telefono  || "No registrado"],
                ["bi-shop",           "Punto",         saved.punto     || "No registrado"],
                ["bi-calendar-check", "Miembro desde", saved.fechaAlta || "No registrado"],
              ].map(([ic, lb, val]) => (
                <li key={lb} className="list-group-item px-0 border-0 small d-flex gap-2 align-items-center">
                  <i className={`bi ${ic}`} style={{ color: C.verde }} />
                  <span className="text-muted">{lb}:</span>
                  <span className="fw-semibold text-dark">{val}</span>
                </li>
              ))}
            </ul>
            <button className="btn w-100 fw-bold" style={editMode ? S.btnSecundario : S.btnPrimario}
              onClick={() => editMode ? cancelar() : setEditMode(true)}>
              <i className={`bi ${editMode ? "bi-x-lg" : "bi-pencil"} me-1`} />
              {editMode ? "Cancelar" : "Editar perfil"}
            </button>
          </div>
        </div>
      </div>

      {/* Columna derecha */}
      <div className="col-md-8 pe-0 d-flex flex-column gap-3">
        <div className="card shadow-sm" style={S.card}>
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="fw-bold text-dark">
                <i className={`bi ${editMode ? "bi-pencil-square" : "bi-clipboard-check"} me-1`} style={{ color: C.verde }} />
                {editMode ? "Editar información" : "Información personal"}
              </div>
              {editMode && (
                <button className="btn btn-sm fw-bold" style={S.btnPrimario} onClick={guardar}>
                  <i className="bi bi-floppy me-1" />Guardar cambios
                </button>
              )}
            </div>
            {editMode ? (
              <div className="row g-3">
                {[["nombre","Nombre completo","text"],["email","Correo electrónico","email"],["telefono","Teléfono","text"]].map(([key, label, type]) => (
                  <div key={key} className="col-md-6">
                    <label className="form-label fw-bold small text-muted">{label}</label>
                    <input type={type} value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="form-control form-control-sm" style={S.input} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="row g-3">
                  {[
                    ["Nombre completo", saved.nombre || "No registrado"],
                    ["Correo",          saved.email  || "No registrado"],
                    ["Teléfono",        saved.telefono || "No registrado"],
                    ["Supermercado",    saved.aliadoNombre || "No asignado"],
                    ["Punto de recolección", saved.punto || "No registrado"],
                    ["Rol",             saved.rol    || "No registrado"],
                  ].map(([lb, val]) => (
                  <div key={lb} className="col-md-6">
                    <div className="rounded-3 p-3" style={{ backgroundColor: C.grisFondo, border: `1px solid ${C.verdeBorde}` }}>
                      <div className="text-muted small mb-1">{lb}</div>
                      <div className="fw-bold small">
                        {lb === "Rol"
                          ? <span className="badge fw-bold" style={{ backgroundColor: C.verdeClaro, color: C.verdeOscuro, border: `1px solid ${C.verdeMedio}` }}>{val}</span>
                          : val}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}