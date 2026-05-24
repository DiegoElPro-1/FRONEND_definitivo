// src/paneles/encargado/PerfilEncargado.jsx
import { useState, useEffect } from "react";
import { getPerfil, actualizarPerfil } from "../../services/api";

const PERFIL_DEFAULT = {
  nombre:    "",
  email:     "",
  telefono:  "",
  ciudad:    "",
  bio:       "",
  punto:     "",
  zona:      "",
  rol:       "",
  fechaAlta: "",
  foto:      "",
};

export default function PerfilEncargado() {
  const [editMode, setEditMode] = useState(false);
  const [toast,    setToast]    = useState(null);
  const [form,     setForm]     = useState(PERFIL_DEFAULT);

  const [saved, setSaved] = useState(() => {
    const fotoEncargado = localStorage.getItem("perfilFotoEncargado");
    const fotoGlobal    = localStorage.getItem("perfilFoto");
    return { ...PERFIL_DEFAULT, foto: fotoEncargado || fotoGlobal || "" };
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const cargar = async () => {
      try {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario?.idUsuario) return;
        const data = await getPerfil(usuario.idUsuario);
        const fotoEncargado = localStorage.getItem("perfilFotoEncargado");
        const fotoGlobal    = localStorage.getItem("perfilFoto");
        const perfil = {
          nombre:    data?.nombre    || "",
          email:     data?.correo    || "",
          telefono:  data?.telefono  || "",
          ciudad:    data?.ciudad    || "",
          bio:       data?.bio       || "",
          punto:     data?.punto     || "",
          zona:      data?.zona      || "",
          rol:       data?.rol       || "Encargado",
          fechaAlta: data?.fechaAlta || "",
          foto:      fotoEncargado || fotoGlobal || data?.foto || "",
        };
        setSaved(perfil);
        setForm(perfil);
      } catch (e) {
        console.log("Error cargando perfil:", e);
      }
    };
    cargar();
  }, []);

  const guardar = async () => {
    if (!form.nombre.trim()) { showToast("El nombre es obligatorio", "error"); return; }
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      await actualizarPerfil(usuario.idUsuario, form);
      setSaved({ ...form });
      setEditMode(false);
      showToast("Perfil actualizado correctamente");
    } catch {
      showToast("Error actualizando perfil", "error");
    }
  };

  const cancelar = () => { setForm({ ...saved }); setEditMode(false); };

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSaved(p => ({ ...p, foto: url }));
    setForm(p =>  ({ ...p, foto: url }));
    localStorage.setItem("perfilFotoEncargado", url);
    localStorage.setItem("perfilFoto", url);
  };

  return (
    <div className="row g-3 m-0 w-100">

      {/* Toast */}
      {toast && (
        <div className="col-12 p-0">
          <div
            className={`alert alert-${toast.type === "error" ? "danger" : "success"} fw-semibold py-2 mb-0`}
            style={{ fontSize: 13 }}
          >
            <i className={`bi ${toast.type === "error" ? "bi-x-circle" : "bi-check-circle"} me-2`} />
            {toast.msg}
          </div>
        </div>
      )}

      {/* ── Columna izquierda ── */}
      <div className="col-md-4 ps-0">
        <div className="card shadow-sm border text-center">
          <div className="card-body">

            {/* Avatar / foto */}
            <div
              className="rounded-circle bg-warning d-flex align-items-center justify-content-center mx-auto mb-3 overflow-hidden"
              style={{ width: 96, height: 96, cursor: "pointer", border: "3px solid #000" }}
              onClick={() => document.getElementById("inputFotoEnc").click()}
              title="Cambiar foto"
            >
              <input type="file" accept="image/*" id="inputFotoEnc" style={{ display: "none" }} onChange={handleFoto} />
              {saved.foto
                ? <img src={saved.foto} alt="perfil" className="w-100 h-100 object-fit-cover" />
                : <span className="fw-black text-dark" style={{ fontSize: 32 }}>
                    {saved.nombre
                      ? saved.nombre.trim().split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase()
                      : "?"}
                  </span>
              }
            </div>

            <div className="fw-black fs-5 text-dark mb-1">{saved.nombre || "Sin nombre"}</div>
            <div className="text-muted small mb-2">{saved.email || "Sin correo"}</div>

            <span className="badge bg-warning text-dark border border-dark fw-bold mb-3" style={{ fontSize: 11 }}>
              <i className="bi bi-person-badge me-1" />
              {saved.rol || "Encargado"}
            </span>

            {saved.bio && (
              <div className="alert alert-warning text-start small mb-3 py-2 border border-dark">
                <i className="bi bi-chat-quote me-1" />{saved.bio}
              </div>
            )}

            <ul className="list-group list-group-flush text-start mb-4">
              {[
                ["bi-geo-alt-fill",   "Ciudad",        saved.ciudad    || "No registrado"],
                ["bi-telephone-fill", "Teléfono",      saved.telefono  || "No registrado"],
                ["bi-shop",           "Punto",         saved.punto     || "No registrado"],
                ["bi-map",            "Zona",          saved.zona      || "No registrado"],
                ["bi-calendar-check", "Miembro desde", saved.fechaAlta || "No registrado"],
              ].map(([ic, lb, val]) => (
                <li key={lb} className="list-group-item px-0 border-0 small d-flex gap-2 align-items-center">
                  <i className={`bi ${ic} text-warning`} />
                  <span className="text-muted">{lb}:</span>
                  <span className="fw-semibold text-dark">{val}</span>
                </li>
              ))}
            </ul>

            <button
              className={`btn w-100 fw-bold border-2 border-dark ${editMode ? "btn-outline-secondary" : "btn-warning text-dark"}`}
              onClick={() => editMode ? cancelar() : setEditMode(true)}
            >
              <i className={`bi ${editMode ? "bi-x-lg" : "bi-pencil"} me-1`} />
              {editMode ? "Cancelar" : "Editar perfil"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Columna derecha ── */}
      <div className="col-md-8 pe-0 d-flex flex-column gap-3">
        <div className="card shadow-sm border">
          <div className="card-body">

            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="fw-bold text-dark">
                <i className={`bi ${editMode ? "bi-pencil-square" : "bi-clipboard-check"} text-warning me-1`} />
                {editMode ? "Editar información" : "Información personal"}
              </div>
              {editMode && (
                <button className="btn btn-warning btn-sm fw-bold border border-dark text-dark" onClick={guardar}>
                  <i className="bi bi-floppy me-1" />Guardar cambios
                </button>
              )}
            </div>

            {editMode ? (
              <div className="row g-3">
                {[
                  ["nombre",   "Nombre completo",    "text"],
                  ["email",    "Correo electrónico", "email"],
                  ["telefono", "Teléfono",           "text"],
                  ["ciudad",   "Ciudad",             "text"],
                ].map(([key, label, type]) => (
                  <div key={key} className="col-md-6">
                    <label className="form-label fw-bold small text-muted">{label}</label>
                    <input
                      type={type}
                      value={form[key] || ""}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="form-control form-control-sm bg-light"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="row g-3">
                {[
                  ["Nombre completo",               saved.nombre   || "No registrado"],
                  ["Correo",                        saved.email    || "No registrado"],
                  ["Teléfono",                      saved.telefono || "No registrado"],
                  ["Ciudad",                        saved.ciudad   || "No registrado"],
                  ["Punto de recoleccion encargado",saved.punto    || "No registrado"],
                  ["Rol",                           saved.rol      || "No registrado"],
                ].map(([lb, val]) => (
                  <div key={lb} className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <div className="text-muted small mb-1">{lb}</div>
                      <div className="fw-bold small">
                        {lb === "Rol"
                          ? <span className="badge bg-warning text-dark border border-dark">{val}</span>
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