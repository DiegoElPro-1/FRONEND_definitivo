// Importación de hooks de React
import { useState } from "react";

// Hook para navegar entre rutas
import { useNavigate } from "react-router-dom";

// Función para registrar usuarios desde la API
import { registrarse } from "../services/api";

// Imagen de fondo
import fondoReciclaje from '../components/imagenes/fondo_reciclaje.png'

// Librería para alertas bonitas


// Componente Registro
function Registro() {

  // Estado para guardar el nombre
  const [nombre, setNombre] = useState("");

  // Estado para guardar el usuario
  const [usuario, setUsuario] = useState("");

  // Estado para guardar el correo
  const [correo, setCorreo] = useState("");

  // Estado para guardar la contraseña
  const [password, setPassword] = useState("");

  // Estado para confirmar contraseña
  const [confirmar, setConfirmar] = useState("");

  // Estado para aceptar términos y condiciones
  const [terminos, setTerminos] = useState(false);

  // Estado para guardar origen
  const [origen, setOrigen] = useState("");

  // Estado de carga
  const [loading, setLoading] = useState(false);

  // Estado para errores
  const [error, setError] = useState("");

  // Hook de navegación
  const navigate = useNavigate();

  // Función para validar el formulario
  const validar = async (e) => {

    // Previene recarga del formulario
    if (e && e.preventDefault) e.preventDefault();

    // Limpia errores anteriores
    setError("");

    // Validación de nombre
    if (nombre.trim() === "") return setError("Nombre requerido");

    // Validación de usuario
    if (usuario.trim() === "") return setError("Usuario requerido");

    // Validación de correo
    if (correo.trim() === "") return setError("Correo requerido");

    // Validación de contraseña
    if (password.trim() === "") return setError("Contraseña requerida");

    // Validación de confirmación
    if (confirmar.trim() === "") return setError("Confirmación requerida");

    // Verifica que las contraseñas coincidan
    if (password !== confirmar) return setError("Las contraseñas no coinciden");

    try {

      // Registro del usuario en la API
      await registrarse({
        nombre,
        usuario,
        correo,
        password
      });

      
      

      // Redirección al inicio
      navigate("/");

    } catch (err) {

      // Muestra error si falla el registro
      setError(err.message || "Error al registrar usuario");
    }
  };

  // Retorno del componente
  return (

    // Contenedor principal
    <div className="container-fluid">

      {/* Fila principal */}
      <div className="row min-vh-100">

        {/* LADO IZQUIERDO */}
        <div className="col-md-6 bg-light d-flex justify-content-center align-items-center p-5">

          {/* Imagen de reciclaje */}
          <img
            src={fondoReciclaje}
            alt="EcoRecicla"
            className="img-fluid"
          />
        </div>

        {/* LADO DERECHO */}
        <div className="col-md-6 d-flex justify-content-center align-items-center">

          {/* Contenedor del formulario */}
          <div className="w-100 p-4">

            {/* Lista principal */}
            <ul className="bg-white text-dark p-3 rounded list-unstyled">

              {/* Contenedor vacío */}
              <div className="text-center mb-2">
              </div>

              {/* Título */}
              <h1 className="text-center text-dark">Crear cuenta</h1>

              {/* Subtítulo */}
              <h2 className="text-center fw-light text-success fs-5">
                Es rápido y fácil
              </h2>

              <br />

              {/* Mensaje de error */}
              {error && (
                <div className="alert alert-danger py-2 text-center">
                  {error}
                </div>
              )}

              {/* NOMBRE Y USUARIO */}
              <div className="d-flex justify-content-center gap-2">

                {/* Campo nombre */}
                <li className="mb-2 w-50">

                  <label className="form-label text-dark">
                    Nombre completo
                  </label>

                  <div className="input-group">

                    {/* Icono */}
                    <span className="input-group-text">
                      <i className="bi bi-person"></i>
                    </span>

                    {/* Input nombre */}
                    <input
                      className="form-control"
                      placeholder="Ingresa tu nombre completo"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                    />
                  </div>
                </li>

                {/* Campo usuario */}
                <li className="mb-2 w-50">

                  <label className="form-label text-dark">
                    Nombre de usuario
                  </label>

                  <div className="input-group">

                    {/* Icono */}
                    <span className="input-group-text">
                      <i className="bi bi-at"></i>
                    </span>

                    {/* Input usuario */}
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

                {/* Label correo */}
                <label className="form-label text-dark">
                  Correo electrónico
                </label>

                <div className="input-group">

                  {/* Icono */}
                  <span className="input-group-text">
                    <i className="bi bi-envelope"></i>
                  </span>

                  {/* Input correo */}
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

                {/* Campo contraseña */}
                <li className="mb-2 w-50">

                  <label className="form-label text-dark">
                    Contraseña
                  </label>

                  <div className="input-group">

                    {/* Icono */}
                    <span className="input-group-text">
                      <i className="bi bi-lock"></i>
                    </span>

                    {/* Input contraseña */}
                    <input
                      className="form-control"
                      placeholder="Crea una contraseña"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />

                  </div>
                </li>

                {/* Campo confirmar contraseña */}
                <li className="mb-2 w-50">

                  <label className="form-label text-dark">
                    Confirmar contraseña
                  </label>

                  <div className="input-group">

                    {/* Icono */}
                    <span className="input-group-text">
                      <i className="bi bi-lock"></i>
                    </span>

                    {/* Input confirmar */}
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

                {/* Checkbox términos */}
                <input
                  className="form-check-input me-2"
                  type="checkbox"
                  checked={terminos}
                  onChange={(e) => setTerminos(e.target.checked)}
                />

                {/* Texto términos */}
                <span className="text-dark">
                  Acepto los términos y condiciones y la política de privacidad
                </span>

              </li>

            </ul>

            {/* Contenedor botón */}
            <div className="d-flex flex-column align-items-center">

              {/* Botón crear cuenta */}
              <button
                className="btn btn-warning text-white rounded-pill px-5 py-2 w-50"
                onClick={validar}
                disabled={loading}
              >

                {/* Estado loading */}
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>

                    Creando...
                  </>
                ) : (

                  // Texto normal del botón
                  <>
                    CREAR CUENTA
                    <i className="bi bi-leaf-fill ms-2 text-white"></i>
                  </>
                )}

              </button>

              <br />

            </div>

            {/* Link login */}
            <div className="d-flex justify-content-center align-items-center gap-2">

              {/* Texto */}
              <span className="fw-light text-secondary">
                ¿Ya tienes cuenta?
              </span>

              {/* Enlace login */}
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

// Exportación del componente
export default Registro;