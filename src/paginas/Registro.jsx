import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { solicitarRegistro, getAliadosPublicos } from "../services/api";
import fondoReciclaje from '../components/imagenes/fondo_reciclaje.png'

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

        <div className="col-md-6 bg-light d-flex justify-content-center align-items-center p-5">
          <img
            src={fondoReciclaje}
            alt="EcoRecicla"
            className="img-fluid"
          />
        </div>

        <div className="col-md-6 d-flex justify-content-center align-items-center">

          <div className="w-100 p-4">

            <ul className="bg-white text-dark p-3 rounded list-unstyled">

              <div className="text-center mb-2">
              </div>

              <h1 className="text-center text-dark">Solicitar registro</h1>

              <h2 className="text-center fw-light text-success fs-5">
                Para administradores y encargados
              </h2>

              <br />

              {error && (
                <div className="alert alert-danger py-2 text-center">{error}</div>
              )}

              {success && (
                <div className="alert alert-success py-2 text-center">{success}</div>
              )}

              <div className="d-flex justify-content-center gap-2">

                <li className="mb-2 w-50">
                  <label className="form-label text-dark">Nombre completo</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      className="form-control"
                      placeholder="Ingresa tu nombre completo"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                    />
                  </div>
                </li>

                <li className="mb-2 w-50">
                  <label className="form-label text-dark">Cédula</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-credit-card"></i>
                    </span>
                    <input
                      className="form-control"
                      placeholder="Número de cédula"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                </li>

              </div>

              <div className="d-flex justify-content-center gap-2">

                <li className="mb-2 w-50">
                  <label className="form-label text-dark">Teléfono</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-telephone"></i>
                    </span>
                    <input
                      className="form-control"
                      placeholder="Opcional"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                    />
                  </div>
                </li>

              </div>

              <li className="mb-2">
                <label className="form-label text-dark">Correo electrónico</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    className="form-control"
                    placeholder="Correo electrónico"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                  />
                </div>
              </li>

              <div className="d-flex justify-content-center gap-2">

                <li className="mb-2 w-50">
                  <label className="form-label text-dark">Contraseña</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      className="form-control"
                      placeholder="Crea una contraseña"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </li>

                <li className="mb-2 w-50">
                  <label className="form-label text-dark">Confirmar contraseña</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      className="form-control"
                      placeholder="Confirma tu contraseña"
                      type="password"
                      value={confirmar}
                      onChange={(e) => setConfirmar(e.target.value)}
                    />
                  </div>
                </li>

              </div>

              <li className="mb-2">
                <label className="form-label text-dark">Rol solicitado</label>
                <div className="d-flex gap-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="rol"
                      id="rolEncargado"
                      value="encargado"
                      checked={rolSolicitado === "encargado"}
                      onChange={(e) => setRolSolicitado(e.target.value)}
                    />
                    <label className="form-check-label text-dark" htmlFor="rolEncargado">
                      <i className="bi bi-person-badge me-1"></i>Encargado
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="rol"
                      id="rolAdmin"
                      value="admin"
                      checked={rolSolicitado === "admin"}
                      onChange={(e) => setRolSolicitado(e.target.value)}
                    />
                    <label className="form-check-label text-dark" htmlFor="rolAdmin">
                      <i className="bi bi-shield-lock me-1"></i>Administrador
                    </label>
                  </div>
                </div>
              </li>

              <li className="mb-2">
                <label className="form-label text-dark">Supermercado</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-shop"></i>
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
              </li>

              <li className="mb-2">
                <label className="form-label text-dark">Mensaje (opcional)</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-chat-text"></i>
                  </span>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Cuéntanos por qué quieres ser {rolSolicitado} de este supermercado..."
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                  />
                </div>
              </li>

            </ul>

            <div className="d-flex flex-column align-items-center">

              <button
                className="btn btn-warning text-white rounded-pill px-5 py-2 w-50"
                onClick={validar}
                disabled={loading || success}
              >

                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Enviando...
                  </>
                ) : (
                  <>
                    ENVIAR SOLICITUD
                    <i className="bi bi-send-fill ms-2 text-white"></i>
                  </>
                )}

              </button>

              <br />

            </div>

            <div className="d-flex justify-content-center align-items-center gap-2">

              <span className="fw-light text-secondary">
                ¿Ya tienes cuenta?
              </span>

              <a
                href="/login"
                className="text-decoration-none fw-bold text-success"
              >
                Inicia sesión
              </a>

            </div>

            <div className="text-center mt-3">
              <small className="text-muted">
                ¿Eres un usuario particular?{' '}
                <a href="/login" className="text-success text-decoration-none fw-bold">
                  Inicia sesión
                </a>
                {' '}desde la app móvil.
              </small>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Registro;
