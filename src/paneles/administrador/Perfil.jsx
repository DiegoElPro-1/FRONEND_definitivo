import { useState, useEffect } from "react";
import { ADMIN_PROFILE } from "../../constants/data";
import { RolBadge } from "../../components/UserShared";
import { getPerfil, actualizarPerfil } from "../../services/api";

function desdeStorage() {
  try {
    const u = JSON.parse(localStorage.getItem("usuario") || "{}");
    return {
      nombre: u.nombre || "",
      email: u.correo || "",
      telefono: u.telefono || "",
      cedula: u.cedula || "",
      punto: u.puntoACargo?.nombre || "",
      aliadoNombre: u.aliado || u.aliadoNombre || "",
      rol: typeof u.rol === "string" ? u.rol : "",
      fechaAlta: u.fechaRegistro || "",
      foto: localStorage.getItem("perfilFoto") || u.imagen || ADMIN_PROFILE.foto,
    };
  } catch { return { ...ADMIN_PROFILE }; }
}

export default function Perfil({ state, showToast }) {

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(desdeStorage);
  const [saved, setSaved] = useState(desdeStorage);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPerfil();
        const u = data?.usuario || data || {};
        const fotoGuardada = localStorage.getItem("perfilFoto");
        const perfilDB = {
          nombre: u?.nombre || "",
          email: u?.correo || "",
          telefono: u?.telefono || "",
          cedula: u?.cedula || "",
          punto: u?.puntoACargo?.nombre || "",
          aliadoNombre: u?.aliado || u?.aliadoNombre || "",
          rol: u?.rol || "",
          fechaAlta: u?.fechaRegistro || "",
          foto: fotoGuardada || u?.imagen || ADMIN_PROFILE.foto,
        };
        setSaved(perfilDB);
        setForm(perfilDB);
      } catch (error) {
        console.warn("API perfil no disponible, usando datos locales:", error.message);
      }
    })();
  }, []);

  // 🔥 FOTO
  useEffect(() => {

    const handler = (e) => {

      localStorage.setItem("perfilFoto", e.detail);

      setSaved(prev => ({
        ...prev,
        foto: e.detail
      }));
    };

    window.addEventListener("perfilFoto", handler);

    return () => window.removeEventListener("perfilFoto", handler);

  }, []);

  const totalEntregas = state.entregas.length;

  const totalKg = state.entregas.reduce((a, e) => a + e.peso, 0);

  const canjes = state.historial.filter(h => h.icon === "regalo").length;

  //  GUARDAR CAMBIOS EN BD
  const guardar = async () => {

    if (!form.nombre.trim()) {

      showToast("El nombre es obligatorio", "error");

      return;
    }

    try {

      const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

      await actualizarPerfil(form);

      setSaved({ ...form });

      setEditMode(false);

      showToast("Cambios guardados correctamente");

    } catch (error) {

      showToast("Error actualizando perfil", "error");

    }
  };

  const cancelar = () => {

    setForm({ ...saved });

    setEditMode(false);
  };

  return (
    <div className="container-fluid py-2">

      <h4 className="fw-bold mb-4 text-dark">
      </h4>

      <div className="row g-3">

        <div className="col-md-4">

          <div className="card shadow-sm border text-center">

            <div className="card-body">

              <div
                className="rounded-circle bg-success d-flex align-items-center justify-content-center mx-auto mb-3 overflow-hidden position-relative"
                style={{ width: 96, height: 96, cursor: "pointer" }}
              >

                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  id="inputFoto"
                  onChange={(e) => {

                    const file = e.target.files[0];

                    if (!file) return;

                    const url = URL.createObjectURL(file);

                    setSaved(prev => ({
                      ...prev,
                      foto: url
                    }));

                    localStorage.setItem("perfilFoto", url);

                    window.dispatchEvent(
                      new CustomEvent("perfilFoto", { detail: url })
                    );
                  }}
                />

                <img
                  src={saved.foto || "https://via.placeholder.com/150"}
                  alt="perfil"
                  className="w-100 h-100 object-fit-cover"
                  onClick={() => document.getElementById("inputFoto").click()}
                />

              </div>

              <div className="fw-bold fs-4 text-dark mb-1">
                {saved.nombre || "No registrado"}
              </div>

              <div className="text-muted small mb-3">
                {saved.email || "No registrado"}
              </div>

              <div className="mb-3">
                <RolBadge rol={saved.rol || "No registrado"} />
              </div>

              <ul className="list-group list-group-flush text-start mb-4">

                {[
                  ["bi-building", "Supermercado", saved.aliadoNombre || "No asignado"],
                  ["bi-credit-card", "Cédula", saved.cedula || "No registrada"],
                  ["bi-telephone-fill", "Telefono", saved.telefono || "No registrado"],
                  ["bi-shop", "Punto", saved.punto || "No registrado"],
                  ["bi-calendar-check", "Miembro desde", saved.fechaAlta || "No registrado"],
                ].map(([ic, lb, val]) => (

                  <li
                    key={lb}
                    className="list-group-item px-0 border-0 small d-flex gap-2 align-items-center"
                  >

                    <i className={`bi ${ic} text-success`}></i>

                    <span className="text-muted">
                      {lb}:
                    </span>

                    <span className="fw-semibold text-dark">
                      {val}
                    </span>

                  </li>
                ))}

              </ul>

              <button
                className={`btn w-100 fw-bold ${editMode ? "btn-outline-secondary" : "btn-success"}`}
                onClick={() => editMode ? cancelar() : setEditMode(true)}
              >

                <i className={`bi ${editMode ? "bi-x-lg" : "bi-pencil"} me-1`}></i>

                {editMode ? "Cancelar edicion" : "Editar perfil"}

              </button>

            </div>

          </div>

        </div>

        <div className="col-md-8 d-flex flex-column gap-3">

          <div className="card shadow-sm border">

            <div className="card-body">

              <div className="d-flex align-items-center justify-content-between mb-3">

                <div className="fw-bold text-dark">

                  <i className={`bi ${editMode ? "bi-pencil-square" : "bi-clipboard-check"} text-success me-1`}></i>

                  {editMode ? "Editar informacion" : "Informacion personal"}

                </div>

                {editMode && (

                  <button
                    className="btn btn-success btn-sm fw-bold"
                    onClick={guardar}
                  >

                    <i className="bi bi-floppy me-1"></i>

                    Guardar cambios

                  </button>
                )}

              </div>

              {editMode ? (

                <div className="row g-3">

                  {[
                    ["nombre", "Nombre completo", "text"],
                    ["email", "Correo electronico", "email"],
                    ["telefono", "Telefono", "text"],
                  ].map(([key, label, type]) => (

                    <div key={key} className="col-md-6">

                      <label className="form-label fw-bold small text-muted">
                        {label}
                      </label>

                      <input
                        type={type}
                        value={form[key] || ""}
                        onChange={e =>
                          setForm(f => ({
                            ...f,
                            [key]: e.target.value
                          }))
                        }
                        className="form-control form-control-sm bg-light"
                      />

                    </div>
                  ))}

                </div>

              ) : (

                <div className="row g-3">

                  {[
                    ["Nombre completo", saved.nombre || "No registrado"],
                    ["Correo", saved.email || "No registrado"],
                    ["Cédula", saved.cedula || "No registrada"],
                    ["Telefono", saved.telefono || "No registrado"],
                    ["Supermercado", saved.aliadoNombre || "No asignado"],
                    ["Punto asignado", saved.punto || "No registrado"],
                    ["Rol", saved.rol || "No registrado"],
                    ["Miembro desde", saved.fechaAlta || "No registrado"],
                  ].map(([lb, val]) => (

                    <div key={lb} className="col-md-6">

                      <div className="bg-light rounded-3 p-3">

                        <div className="text-muted small mb-1">
                          {lb}
                        </div>

                        <div className="fw-bold small">

                          {lb === "Rol"
                            ? <RolBadge rol={val} />
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

    </div>
  );
}