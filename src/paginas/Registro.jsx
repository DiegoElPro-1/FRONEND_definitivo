import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { solicitarRegistro, getAliadosPublicos } from "../services/api";
import fondoRegistro from '../components/imagenes/registro_bg.png'

function Registro() {
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [rolSolicitado, setRolSolicitado] = useState("encargado");
  const [idAliado, setIdAliado] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [aliados, setAliados] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAliadosPublicos()
      .then(data => setAliados(data.aliados ?? data ?? []))
      .catch(() => {});
  }, []);

  const validar = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setSuccess("");

    if (nombre.trim() === "") return setError("Nombre requerido");
    if (correo.trim() === "") return setError("Correo requerido");
    if (password.trim() === "") return setError("Contraseña requerida");
    if (confirmar.trim() === "") return setError("Confirmación requerida");
    if (password !== confirmar) return setError("Las contraseñas no coinciden");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres");
    if (!idAliado) return setError("Selecciona un supermercado");

    setLoading(true);

    try {
      await solicitarRegistro({
        nombre,
        cedula: cedula || undefined,
        correo,
        telefono: telefono || undefined,
        password,
        idAliado: parseInt(idAliado),
        rolSolicitado,
        mensaje: mensaje || undefined,
      });

      setSuccess("Solicitud enviada correctamente. Recibirás un correo cuando sea revisada y aprobada.");

      setTimeout(() => navigate("/login"), 4000);

    } catch (err) {
      setError(err.message || "Error al enviar solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">

        <div
          className="col-md-6 p-0 d-none d-md-block"
          style={{
            backgroundImage: `url(${fondoRegistro})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            minHeight: "100vh",
            backgroundColor: "#f0fdf4",
          }}
        />

        <div className="col-12 col-md-6 d-flex justify-content-center align-items-center bg-white">
          <div className="w-100 px-4" style={{ maxWidth: 480 }}>
            <form className="py-4" onSubmit={validar} noValidate>

              <div className="text-center mb-3">
                <h1 className="fw-bold text-dark fs-3 mb-1">
                  Solicitar registro <i className="bi bi-person-plus-fill text-success" />
                </h1>
                <p className="text-success fw-semibold mb-0" style={{ fontSize: 13 }}>
                  Para administradores y encargados
                </p>
              </div>

              {error && (
                <div className="alert alert-danger border border-danger d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: 13 }}>
                  <i className="bi bi-exclamation-circle-fill text-danger" />
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success border border-success d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: 13 }}>
                  <i className="bi bi-check-circle-fill text-success" />
                  {success}
                </div>
              )}

              <div className="row">
                <div className="col-6 mb-2">
                  <label className="form-label fw-semibold text-dark" style={{ fontSize: 13 }}>
                    Nombre completo
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-person text-success" />
                    </span>
                    <input
                      className="form-control"
                      placeholder="Nombre completo"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-6 mb-2">
                  <label className="form-label fw-semibold text-dark" style={{ fontSize: 13 }}>
                    Cédula
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-credit-card text-success" />
                    </span>
                    <input
                      className="form-control"
                      placeholder="Número de cédula"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label fw-semibold text-dark" style={{ fontSize: 13 }}>
                  Teléfono
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-telephone text-success" />
                  </span>
                  <input
                    className="form-control"
                    placeholder="Opcional"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label fw-semibold text-dark" style={{ fontSize: 13 }}>
                  Correo electrónico
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-envelope text-success" />
                  </span>
                  <input
                    className="form-control"
                    placeholder="Correo electrónico"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-6 mb-2">
                  <label className="form-label fw-semibold text-dark" style={{ fontSize: 13 }}>
                    Contraseña
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-lock text-success" />
                    </span>
                    <input
                      className="form-control"
                      placeholder="Crea una contraseña"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-6 mb-2">
                  <label className="form-label fw-semibold text-dark" style={{ fontSize: 13 }}>
                    Confirmar contraseña
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-lock text-success" />
                    </span>
                    <input
                      className="form-control"
                      placeholder="Confirma tu contraseña"
                      type="password"
                      value={confirmar}
                      onChange={(e) => setConfirmar(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label fw-semibold text-dark" style={{ fontSize: 13 }}>
                  Rol solicitado
                </label>
                <div className="d-flex gap-2">
                  {["encargado", "admin"].map((rol) => (
                    <div
                      key={rol}
                      onClick={() => setRolSolicitado(rol)}
                      style={{
                        flex: 1, padding: "12px 16px", borderRadius: 12,
                        border: `2px solid ${rolSolicitado === rol ? "#16a34a" : "#e5e7eb"}`,
                        background: rolSolicitado === rol ? "#f0fdf4" : "#fff",
                        cursor: "pointer", textAlign: "center",
                        transition: "all 0.2s"
                      }}
                    >
                      <i className={`bi ${rol === "encargado" ? "bi-person-badge" : "bi-shield-lock"} text-success d-block`} style={{ fontSize: 24 }}></i>
                      <span className="d-block mt-1 fw-semibold text-dark" style={{ fontSize: 13 }}>
                        {rol === "encargado" ? "Encargado" : "Administrador"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-dark" style={{ fontSize: 13 }}>
                  Supermercado
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-shop text-success" />
                  </span>
                  <select
                    className="form-select"
                    value={idAliado}
                    onChange={(e) => setIdAliado(e.target.value)}
                  >
                    <option value="">Selecciona un supermercado</option>
                    {aliados.map((a) => (
                      <option key={a.idAliado} value={a.idAliado}>
                        {a.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                className="btn text-white rounded-pill px-5 py-2 w-100 fw-semibold"
                onClick={validar}
                disabled={loading || success}
                style={{ border: "none", background: "#127235" }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Registrando...
                  </>
                ) : (
                  <>
                    REGISTRARSE <i className="bi bi-person-plus-fill ms-2"></i>
                  </>
                )}
              </button>

              <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
                <span className="fw-light text-secondary" style={{ fontSize: 13 }}>
                  ¿Ya tienes cuenta?
                </span>
                <a href="/login" className="text-decoration-none fw-bold text-success" style={{ fontSize: 13 }}>
                  Inicia sesión
                </a>
              </div>

              <div className="text-center mt-2">
                <small className="text-muted" style={{ fontSize: 12 }}>
                  ¿Eres un usuario particular?{' '}
                  <a href="/login" className="text-success text-decoration-none fw-bold">
                    Inicia sesión
                  </a> desde la app móvil.
                </small>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registro;
