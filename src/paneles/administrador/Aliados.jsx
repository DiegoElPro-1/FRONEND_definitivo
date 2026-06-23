import { useState, useEffect } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  Toggle,
  ModalDetalle,
  TablaUsuarios,
}  from "../../components/UserShared";

import MapPicker from "../../components/MapPicker";

import {
  getAliados,
  crearAliado,
  actualizarAliado,
  eliminarAliado,
  getMateriales,
  getMaterialesPorAliado,
  sincronizarMaterialesAliado,
  getZonas,
} from "../../services/api";

const EMPTY_FORM = {
  nombre: "",
  email: "",
  telefono: "",
  nombreEntidad: "",
  rol: "Afiliado",
  zona: "",
  activo: true,
  materiales: [],
  latitud: null,
  longitud: null,
  ubicacionDireccion: "",
  zonaAutodetectada: false,
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

  const [saving, setSaving] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const [todosMateriales, setTodosMateriales] = useState([]);
  const [todosMaterialesEdit, setTodosMaterialesEdit] = useState();
  const [zonasList, setZonasList] = useState([]);

  // =====================================
  // CARGAR MATERIALES PARA EDITAR
  // =====================================
  useEffect(() => {
    if (viewUser && viewUser.rol === "Afiliado") {
      getMateriales().then(data => {
        setTodosMaterialesEdit((data.materiales ?? []).filter(m => m.idEstadoMaterial === 1));
      }).catch(() => setTodosMaterialesEdit([]));
      getMaterialesPorAliado(viewUser.id).then(data => {
        const ids = (data.materiales ?? []).map(m => m.idMaterial);
        setViewUser(prev => prev?.id === viewUser.id ? { ...prev, materialesIds: ids } : prev);
      }).catch(() => {});
    } else {
      setTodosMaterialesEdit(undefined);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewUser?.id]);

  // =====================================
  // CARGAR ALIADOS
  // =====================================
  useEffect(() => {
    getZonas().then((data) => {
      console.log('Zonas cargadas:', data.zonas?.length ?? 0);
      setZonasList(data.zonas ?? []);
    }).catch((err) => {
      console.error('Error cargando zonas:', err);
    });
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

  useEffect(() => {
    if (modal) {
      getMateriales().then((data) => {
        const mats = (data.materiales ?? []).filter((m) => m.idEstadoMaterial === 1);
        setTodosMateriales(mats);
      }).catch(() => {});
    }
  }, [modal]);

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

    if (form.materiales.length === 0) {
      e.materiales = "Debes seleccionar al menos un material";
    }

    if (!form.latitud || !form.longitud) {
      e.ubicacion = "La ubicación en el mapa es obligatoria";
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
    setSaving(true);

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
          ubicacionDireccion: form.ubicacionDireccion || undefined,
          latitud: form.latitud,
          longitud: form.longitud,
          materiales: form.materiales,
        });

      const aliadoId = resp.aliado?.idAliado ?? resp.usuario?.idUsuario;
      if (aliadoId && form.materiales.length > 0) {
        await sincronizarMaterialesAliado(aliadoId, form.materiales);
      }

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

          activo: true,

          av: initials,

          fechaAlta:
            new Date().toLocaleDateString(
              "es-CO"
            ),
        },
      });

      showToast("Supermercado creado correctamente");

      cerrarModal();
    } catch (err) {
      showToast(
        "Error al registrar supermercado: " +
          err.message,
        "error"
      );
    } finally {
      setSaving(false);
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
  const handleSave = async (u) => {
    try {
      await actualizarAliado(u.id, {
        nombre: u.nombre,
        telefono: u.telefono,
        correo: u.email,
      });
      if (Array.isArray(u.materialesIds)) {
        await sincronizarMaterialesAliado(u.id, u.materialesIds);
      }
      dispatch({ type: "UPDATE_ALIADO", payload: u });
      showToast("Cambios guardados correctamente");
    } catch (err) {
      showToast("Error al actualizar: " + err.message, "error");
      throw err;
    }
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

      {loading && (
        <div className="text-center py-3">
          <LoadingSpinner size="sm" text="Cargando supermercados" />
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
        todosMateriales={todosMaterialesEdit}
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
                    disabled={form.zonaAutodetectada}
                    style={form.zonaAutodetectada ? { background: "#f0fdf4", color: "#166534", fontWeight: 600 } : {}}
                  >
                    <option value="">
                      Sin zona
                    </option>

                    {zonasList.map(
                      (z) => (
                        <option
                          key={z.id_zona || z.nombre}
                        >
                          {z.nombre}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* MATERIALES */}
                <div className="full">
                  <label className="panel-label">
                    Materiales que acepta *
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "8px 0" }}>
                    {todosMateriales.map((m) => {
                      const selected = form.materiales.includes(m.idMaterial);
                      return (
                        <div key={m.idMaterial}
                          onClick={() => {
                            const next = selected
                              ? form.materiales.filter((id) => id !== m.idMaterial)
                              : [...form.materiales, m.idMaterial];
                            set("materiales", next);
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
                  {errors.materiales && <span className="text-danger small">{errors.materiales}</span>}
                </div>

                {/* UBICACION */}
                <div className="full">
                  <label className="panel-label">Ubicación en el mapa *</label>
                  <button
                    className="btn btn-outline-success btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => setShowMap(true)}
                    style={{
                      padding: "8px 14px", borderRadius: 6,
                      border: `1.5px solid ${errors.ubicacion ? "var(--rojo)" : form.latitud ? "var(--verde)" : "var(--gris-borde)"}`
                    }}
                  >
                    {form.latitud && form.longitud ? (
                      <>
                        <i className="bi bi-check-circle-fill text-success"></i>
                        Ubicación seleccionada
                        <span className="text-muted small">({form.latitud.toFixed(4)}, {form.longitud.toFixed(4)})</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-geo-alt"></i>
                        Agregar ubicación
                      </>
                    )}
                  </button>
                  {errors.ubicacion && <span className="text-danger small">{errors.ubicacion}</span>}
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
                disabled={saving}
              >
                {saving ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-check-lg me-1" />}
                {saving ? "Registrando..." : "Registrar aliado"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMap && (
        <MapPicker
          onConfirm={async (lat, lng) => {
            const update = { latitud: lat, longitud: lng, ubicacionDireccion: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, zonaAutodetectada: false };
            console.log('MapPicker confirm:', lat, lng, 'zonasList:', zonasList.length);
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=es`,
                { headers: { "User-Agent": "RecyclingPointsAdmin/1.0" } }
              );
              if (!res.ok) {
                console.error('Nominatim HTTP error:', res.status);
                throw new Error(`HTTP ${res.status}`);
              }
              const data = await res.json();
              console.log('Nominatim response:', data);
              const addr = data?.address || {};
              const candidates = [addr.suburb, addr.city_district, addr.neighbourhood, addr.town, addr.municipality, addr.county, addr.state_district, addr.city].filter(Boolean).map(s => s.toLowerCase());
              console.log('Candidates:', candidates);
              const match = zonasList.find(z =>
                candidates.some(c => c.includes(z.nombre.toLowerCase()) || z.nombre.toLowerCase().includes(c))
              );
              console.log('Match found:', match);
              if (match) {
                update.zona = match.nombre;
                update.zonaAutodetectada = true;
              }
            } catch (e) {
              console.error('Nominatim error:', e);
            }
            setForm(f => ({ ...f, ...update }));
            setErrors(e => ({ ...e, ubicacion: "" }));
            if (update.zona) {
              showToast(`Zona detectada: ${update.zona}`, "success");
            } else {
              showToast("No se pudo detectar la zona automáticamente. Selecciona manualmente.", "warning");
            }
            setShowMap(false);
          }}
          onCancel={() => setShowMap(false)}
        />
      )}
    </div>
  );
}