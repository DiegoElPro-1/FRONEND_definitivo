import { useState, useEffect } from "react";
import { ZONAS } from "../../constants/data";
import {
  Toggle,
  ModalDetalle,
  TablaUsuarios,
}  from "../../components/UserShared";

import {
  getAliados,
  crearAliado,
  actualizarAliado,
  eliminarAliado,
} from "../../services/api";

const EMPTY_FORM = {
  nombre: "",
  email: "",
  telefono: "",
  nombreEntidad: "",
  rol: "Afiliado",
  zona: "",
  activo: true,
};

export default function Aliados({
  state,
  dispatch,
  showToast,
}) {
  const [modal, setModal] = useState(false);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [errors, setErrors] =
    useState({});

  const [search, setSearch] =
    useState("");

  const [viewUser, setViewUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // =====================================
  // CARGAR ALIADOS
  // =====================================
  useEffect(() => {
    getAliados()
      .then((data) => {
        const lista = (
          data.aliados ?? []
        ).map((u) => ({
          id: u.idAliado,

          nombre: u.nombre,

          nombreEntidad:
            u.nombreEntidad ??
            u.entidad ??
            "",

          email: u.correo,

          telefono:
            u.telefono ?? "",

          rol: "Afiliado",

          zona: u.zona ?? "",

          pts: 0,

          activo:
            u.estadoAliado
              ?.idEstadoAliado === 1,

          av: (u.nombre ?? "")
            .trim()
            .split(" ")
            .slice(0, 2)
            .map(
              (w) =>
                w[0]?.toUpperCase() ??
                ""
            )
            .join(""),

          fechaAlta:
            u.fechaRegistro
              ? new Date(
                  u.fechaRegistro
                ).toLocaleDateString(
                  "es-CO"
                )
              : "—",
        }));

        dispatch({
          type: "SET_ALIADOS",
          payload: lista,
        });
      })

      .catch(() => {
        showToast(
          "No se pudieron cargar los supermercados",
          "error"
        );
      })

      .finally(() => {
        setLoading(false);
      });
  }, [dispatch, showToast]);

  // =====================================
  // HELPERS
  // =====================================
  const set = (k, v) => {
    setForm((f) => ({
      ...f,
      [k]: v,
    }));

    setErrors((e) => ({
      ...e,
      [k]: "",
    }));
  };

  const aliados =
    state.aliados || [];

  // =====================================
  // VALIDACIONES
  // =====================================
  const validate = () => {
    const e = {};

    if (!form.nombre.trim()) {
      e.nombre =
        "El nombre del contacto es obligatorio";
    }

    if (
      !form.nombreEntidad.trim()
    ) {
      e.nombreEntidad =
        "El nombre del supermercado es obligatorio";
    }

    if (!form.email.trim()) {
      e.email =
        "El correo es obligatorio";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email
      )
    ) {
      e.email =
        "Correo inválido";
    } else if (
      state.usuarios.some(
        (u) =>
          u.email ===
          form.email.trim()
      )
    ) {
      e.email =
        "Este correo ya existe";
    }

    if (
      form.telefono.trim() &&
      !/^\d{10}$/.test(
        form.telefono.replace(
          /\s/g,
          ""
        )
      )
    ) {
      e.telefono =
        "El teléfono debe tener exactamente 10 dígitos";
    }

    return e;
  };

  // =====================================
  // GUARDAR
  // =====================================
  const guardar = async () => {
    const e = validate();

    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    try {
      const resp =
        await crearAliado({
          nombre:
            form.nombre.trim(),

          nombreEntidad:
            form.nombreEntidad.trim(),

          correo:
            form.email.trim(),

          password:
            "Temporal123!",

          telefono:
            form.telefono.trim() ||
            undefined,

          zona:
            form.zona ||
            undefined,
        });

      const initials =
        form.nombre
          .trim()
          .split(" ")
          .slice(0, 2)
          .map((w) =>
            w[0].toUpperCase()
          )
          .join("");

      dispatch({
        type: "ADD_ALIADO",

        payload: {
          id:
            resp.aliado
              ?.idAliado ??
            resp.usuario
              ?.idUsuario ??
            Date.now(),

          nombre:
            form.nombre.trim(),

          nombreEntidad:
            form.nombreEntidad.trim(),

          email:
            form.email.trim(),

          telefono:
            form.telefono.trim(),

          rol: "Afiliado",

          zona: form.zona,

          pts: 0,

          activo: true,

          av: initials,

          fechaAlta:
            new Date().toLocaleDateString(
              "es-CO"
            ),
        },
      });

      showToast(
        `Supermercado "${form.nombreEntidad.trim()}" registrado`
      );

      cerrarModal();
    } catch (err) {
      showToast(
        "Error al registrar supermercado: " +
          err.message,
        "error"
      );
    }
  };

  // =====================================
  // CERRAR MODAL
  // =====================================
  const cerrarModal = () => {
    setModal(false);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  // =====================================
  // TOGGLE
  // =====================================
  const handleToggle = async (
    id,
    nombre,
    estadoActual
  ) => {
    try {
      await actualizarAliado(id, {
        idEstadoAliado:
          estadoActual ? 2 : 1,
      });

      dispatch({
        type: "TOGGLE_ALIADO",
        payload: id,
      });

      showToast(
        estadoActual
          ? `${nombre} desactivado`
          : `${nombre} activado`,
        estadoActual
          ? "error"
          : "success"
      );
    } catch (err) {
      showToast(
        "Error al cambiar estado: " +
          err.message,
        "error"
      );
    }
  };

  // =====================================
  // SAVE
  // =====================================
  const handleSave = (u) => {
    dispatch({
      type: "UPDATE_USER",
      payload: u,
    });
  };

  // =====================================
  // ELIMINAR
  // =====================================
  const handleEliminar =
    async (id) => {
      try {
        await eliminarAliado(id);

        dispatch({
          type: "DEL_ALIADO",
          payload: id,
        });

        showToast(
          "Supermercado eliminado",
          "error"
        );

        if (
          viewUser?.id === id
        ) {
          setViewUser(null);
        }
      } catch (err) {
        showToast(
          "Error al eliminar: " +
            err.message,
          "error"
        );
      }
    };

  // =====================================
  // FILTRO
  // =====================================
  const filtered =
    aliados.filter((u) => {
      const q =
        search.toLowerCase();

      return (
        u.nombre
          .toLowerCase()
          .includes(q) ||
        u.email
          .toLowerCase()
          .includes(q) ||
        (
          u.nombreEntidad || ""
        )
          .toLowerCase()
          .includes(q) ||
        (u.zona || "")
          .toLowerCase()
          .includes(q)
      );
    });

  // =====================================
  // AVATAR
  // =====================================
  const avatarPreview =
    form.nombre
      .trim()
      .split(" ")
      .slice(0, 2)
      .map(
        (w) =>
          w[0]?.toUpperCase() ||
          ""
      )
      .join("") || "?";

  return (
    <div className="panel-page">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="fw-bold mb-0 text-dark">
            <i className="bi bi-shop me-2 text-success"></i>

            Gestión de supermercados
          </h5>

          <small className="text-muted">
            {aliados.length} supermercado
            {aliados.length !== 1
              ? "s"
              : ""}{" "}
            registrado
            {aliados.length !== 1
              ? "s"
              : ""}
          </small>
        </div>

        <button
          className="btn btn-success btn-sm rounded-3 d-flex align-items-center gap-2"
          onClick={() =>
            setModal(true)
          }
        >
          <i className="bi bi-shop"></i>

          Nuevo supermercado
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="mb-3">
        <div
          className="input-group input-group-sm"
          style={{ maxWidth: 420 }}
        >
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-secondary"></i>
          </span>

          <input
            className="form-control border-start-0"
            placeholder="Buscar por nombre, entidad, correo o zona..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center py-3 text-muted small">
          <div className="spinner-border spinner-border-sm text-success me-2"></div>

          Cargando supermercados...
        </div>
      )}

      {/* TABLA */}
      <div className="card border rounded-3 shadow-none">
        <div className="card-body p-0">
          <TablaUsuarios
            lista={filtered}
            onToggle={
              handleToggle
            }
            onVer={setViewUser}
            onEliminar={
              handleEliminar
            }
          />
        </div>
      </div>

      {/* DETALLE */}
      <ModalDetalle
        user={viewUser}
        onClose={() =>
          setViewUser(null)
        }
        onSave={handleSave}
        showToast={showToast}
      />

      {/* MODAL */}
      {modal && (
        <div
          className="panel-modal-bg"
          onClick={(ev) => {
            if (
              ev.target ===
              ev.currentTarget
            ) {
              cerrarModal();
            }
          }}
        >
          <div className="panel-modal">
            {/* HEADER */}
            <div className="panel-modal-head">
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius:
                      "50%",
                    background:
                      "var(--verde-claro)",
                    border:
                      "1px solid var(--gris-borde)",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    fontWeight: 700,
                    fontSize:
                      "0.85rem",
                    color:
                      "var(--verde)",
                  }}
                >
                  {avatarPreview}
                </div>

                <div>
                  <div
                    style={{
                      fontWeight: 700,
                    }}
                  >
                    <i className="bi bi-shop me-2"></i>

                    Nuevo supermercado
                  </div>

                  <div
                    style={{
                      fontSize:
                        "0.72rem",
                      color:
                        "var(--gris-texto)",
                    }}
                  >
                    Registrar
                    supermercado
                    aliado
                  </div>
                </div>
              </div>

              <button
                className="btn-icon"
                onClick={
                  cerrarModal
                }
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* BODY */}
            <div className="panel-modal-body">
              <div className="panel-modal-grid">
                {/* CONTACTO */}
                <div>
                  <label className="panel-label">
                    Nombre contacto *
                  </label>

                  <input
                    className="panel-input"
                    value={
                      form.nombre
                    }
                    onChange={(e) =>
                      set(
                        "nombre",
                        e.target.value
                      )
                    }
                    placeholder="Ej: Ana García"
                  />

                  {errors.nombre && (
                    <span className="text-danger small">
                      {
                        errors.nombre
                      }
                    </span>
                  )}
                </div>

                {/* ENTIDAD */}
                <div>
                  <label className="panel-label">
                    Supermercado *
                  </label>

                  <input
                    className="panel-input"
                    value={
                      form.nombreEntidad
                    }
                    onChange={(e) =>
                      set(
                        "nombreEntidad",
                        e.target.value
                      )
                    }
                    placeholder="Ej: Éxito"
                  />

                  {errors.nombreEntidad && (
                    <span className="text-danger small">
                      {
                        errors.nombreEntidad
                      }
                    </span>
                  )}
                </div>

                {/* EMAIL */}
                <div>
                  <label className="panel-label">
                    Correo *
                  </label>

                  <input
                    type="email"
                    className="panel-input"
                    value={
                      form.email
                    }
                    onChange={(e) =>
                      set(
                        "email",
                        e.target.value
                      )
                    }
                    placeholder="correo@empresa.com"
                  />

                  {errors.email && (
                    <span className="text-danger small">
                      {
                        errors.email
                      }
                    </span>
                  )}
                </div>

                {/* TELEFONO */}
                <div>
                  <label className="panel-label">
                    Teléfono
                  </label>

                  <input
                    className="panel-input"
                    value={
                      form.telefono
                    }
                    onChange={(e) =>
                      set(
                        "telefono",
                        e.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(
                            0,
                            10
                          )
                      )
                    }
                    placeholder="3001234567"
                  />

                  {errors.telefono && (
                    <span className="text-danger small">
                      {
                        errors.telefono
                      }
                    </span>
                  )}
                </div>

                {/* ZONA */}
                <div>
                  <label className="panel-label">
                    Zona
                  </label>

                  <select
                    className="panel-input"
                    value={
                      form.zona
                    }
                    onChange={(e) =>
                      set(
                        "zona",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Sin zona
                    </option>

                    {ZONAS.map(
                      (z) => (
                        <option
                          key={z}
                        >
                          {z}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* ESTADO */}
                <div className="full">
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                    }}
                  >
                    <span>
                      Estado inicial
                    </span>

                    <Toggle
                      checked={
                        form.activo
                      }
                      onChange={(
                        v
                      ) =>
                        set(
                          "activo",
                          v
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="panel-modal-foot">
              <button
                className="btn-panel ghost"
                onClick={
                  cerrarModal
                }
              >
                Cancelar
              </button>

              <button
                className="btn-panel primary"
                onClick={guardar}
              >
                Registrar aliado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}