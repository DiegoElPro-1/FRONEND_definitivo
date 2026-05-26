import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registrarse } from "../services/api";
import fondoReciclaje from '../components/imagenes/fondo_reciclaje.png'
import Swal from "sweetalert2";

function Registro() {
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [terminos, setTerminos] = useState(false);
  const [origen, setOrigen] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validar = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");

    if (nombre.trim() === "") return setError("Nombre requerido");
    if (usuario.trim() === "") return setError("Usuario requerido");
    if (correo.trim() === "") return setError("Correo requerido");
    if (password.trim() === "") return setError("Contraseña requerida");
    if (confirmar.trim() === "") return setError("Confirmación requerida");
    if (password !== confirmar) return setError("Las contraseñas no coinciden");

    try {
      await registrarse({
        nombre,
        usuario,
        correo,
        password
      });

      Swal.fire({
        title: "Selecciona un rol",
        html: `
          <div class="form-check text-start mb-2">
            <input 
              class="form-check-input" 
              type="checkbox" 
              id="admin"
            >
            <label class="form-check-label" for="admin">
              Admin
            </label>
          </div>

          <div class="form-check text-start">
            <input 
              class="form-check-input" 
              type="checkbox" 
              id="encargado"
            >
            <label class="form-check-label" for="encargado">
              Encargado
            </label>
          </div>
        `,
        confirmButtonText: "Aceptar"
      });

      navigate("/");

    } catch (err) {
      setError(err.message || "Error al registrar usuario");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">

        {/* LADO IZQUIERDO */}
        <div className="col-md-6 bg-light d-flex justify-content-center align-items-center p-5">
          <img
            src={fondoReciclaje}
            alt="EcoRecicla"
            className="img-fluid"
          />
        </div>

        {/* LADO DERECHO */}
        <div className="col-md-6 d-flex justify-content-center align-items-center">

          <div className="w-100 p-4">

            <ul className="bg-white text-dark p-3 rounded list-unstyled">

              <div className="text-center mb-2">
              </div>

              <h1 className="text-center text-dark">Crear cuenta</h1>

              <h2 className="text-center fw-light text-success fs-5">
                Es rápido y fácil
              </h2>

              <br />

              {error && (
                <div className="alert alert-danger py-2 text-center">
                  {error}
                </div>
              )}

              {/* NOMBRE Y USUARIO */}
              <div className="d-flex justify-content-center gap-2">

                <li className="mb-2 w-50">
                  <label className="form-label text-dark">
                    Nombre completo
                  </label>

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
                  <label className="form-label text-dark">
                    Nombre de usuario
                  </label>

                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-at"></i>
                    </span>

                    <input
                      className="form-control"
                      placeholder="Elige tu nombre de usuario"
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                    />
                  </div>
                </li>

              </div>

              {/* CORREO */}
              <li className="mb-2">

                <label className="form-label text-dark">
                  Correo electrónico
                </label>

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

              {/* CONTRASEÑAS */}
              <div className="d-flex justify-content-center gap-2">

                <li className="mb-2 w-50">

                  <label className="form-label text-dark">
                    Contraseña
                  </label>

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

                  <label className="form-label text-dark">
                    Confirmar contraseña
                  </label>

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

              {/* TERMINOS */}
              <li className="mb-2">

                <input
                  className="form-check-input me-2"
                  type="checkbox"
                  checked={terminos}
                  onChange={(e) => setTerminos(e.target.checked)}
                />

                <span className="text-dark">
                  Acepto los términos y condiciones y la política de privacidad
                </span>

              </li>

            </ul>

            <div className="d-flex flex-column align-items-center">

              <button
                className="btn btn-warning text-white rounded-pill px-5 py-2 w-50"
                onClick={validar}
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>

                    Creando...
                  </>
                ) : (
                  <>
                    CREAR CUENTA
                    <i className="bi bi-leaf-fill ms-2 text-white"></i>
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

          </div>
        </div>
      </div>
    </div>
  );
}

export default Registro;