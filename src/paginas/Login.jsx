// Importación del hook useState de React
import { useState } from "react";

// Importación del hook para navegación entre rutas
import { useNavigate } from "react-router-dom";

// Función para iniciar sesión desde la API
import { iniciarSesion } from "../services/api";

// Imagen de fondo
import fondoReciclaje from '../components/imagenes/fondo_reciclaje.png';

// Función para detectar el rol del usuario
function detectarRol(usuario) {

  // Obtiene el id del rol desde distintas posibles estructuras
  const idRol = usuario?.id_rol ?? usuario?.idRol ?? usuario?.rol?.id_rol ?? usuario?.rol?.idRol;

  // Obtiene el nombre del rol en minúsculas
  const rolNombre = (usuario?.rol ?? "").toString().toLowerCase();

  // Verifica si es administrador
  if (idRol === 1 || rolNombre === "administrador" || rolNombre === "admin") return "administrador";

  // Verifica si es encargado
  if (idRol === 4 || rolNombre === "encargado") return "encargado";

  // Retorna usuario por defecto
  return "usuario";
}

// Componente Login
export default function Login({ onLogin }) {

  // Estado del correo
  const [correo,     setCorreo]     = useState("");

  // Estado de la contraseña
  const [contraseña, setContraseña] = useState("");

  // Estado para mensajes de error
  const [error,      setError]      = useState("");

  // Estado de carga
  const [loading,    setLoading]    = useState(false);

  // Estado para mostrar u ocultar contraseña
  const [showPass,   setShowPass]   = useState(false);

  // Estado para rol de desarrollo
  const [rolDev,     setRolDev]     = useState("");

  // Hook de navegación
  const navigate = useNavigate();

  // Función de validación del login
  const validar = async (e) => {

    // Previene el comportamiento por defecto del formulario
    if (e?.preventDefault) e.preventDefault();

    // Verifica campos vacíos
    if (!correo.trim() || !contraseña.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }

    // Verifica formato básico del correo
    if (!correo.includes("@") || !correo.includes(".")) {
      setError("Correo electrónico inválido");
      return;
    }

    // Limpia errores
    setError("");

    // Activa loading
    setLoading(true);

    try {

      // Llama la función de inicio de sesión
      const data    = await iniciarSesion(correo.trim(), contraseña);

      // Obtiene el usuario
      const usuario = data.usuario ?? data;

      // Detecta el rol seleccionado
      const rolSeleccionado = rolDev || detectarRol(usuario);

      // Guarda usuario en localStorage
      localStorage.setItem("usuario",  JSON.stringify(usuario));

      // Guarda usuario en sessionStorage
      sessionStorage.setItem("user",   JSON.stringify({ ...usuario, rolSeleccionado }));

      // Ejecuta función onLogin si existe
      if (onLogin) onLogin({ ...usuario, rolSeleccionado });

    } catch (err) {

      // Muestra error de login
      setError(err.message || "Correo o contraseña incorrectos");

    } finally {

      // Desactiva loading
      setLoading(false);
    }
  };

  // Retorno del componente
  return (

    // Contenedor principal
    <div className="container-fluid">

      {/* Fila principal */}
      <div className="row min-vh-100">

        {/* Columna izquierda con imagen */}
        <div
          className="col-md-6 p-0 d-none d-md-block"
          style={{

            // Imagen de fondo
            backgroundImage: `url(${fondoReciclaje})`,

            // Ajuste de imagen
            backgroundSize: "cover",

            // Posición de la imagen
            backgroundPosition: "center",

            // Evita repetición
            backgroundRepeat: "no-repeat",

            // Altura mínima
            minHeight: "100vh",
          }}
        />

        {/* Columna derecha */}
        <div className="col-12 col-md-6 d-flex justify-content-center align-items-center bg-white">

          {/* Contenedor del formulario */}
          <div className="w-100 px-4" style={{ maxWidth: 420 }}>

            {/* Formulario */}
            <form className="py-5" onSubmit={validar} noValidate>

              {/* Encabezado */}
              <div className="text-center mb-4">

                {/* Título */}
                <h1 className="fw-bold text-dark fs-3 mb-1">
                  ¡Bienvenido de nuevo! <i className="bi bi-leaf-fill text-success" />
                </h1>

                {/* Subtítulo */}
                <p className="text-success fw-semibold mb-0" style={{ fontSize: 14 }}>
                  Inicia sesión para continuar reciclando y ganando
                </p>
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="alert alert-danger border border-danger d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: 13 }}>

                  {/* Icono de error */}
                  <i className="bi bi-exclamation-circle-fill text-danger" />

                  {/* Texto error */}
                  {error}
                </div>
              )}

              {/* Campo correo */}
              <div className="mb-3">

                {/* Label correo */}
                <label className="form-label fw-semibold text-dark" style={{ fontSize: 13 }}>
                  Correo electrónico
                </label>

                {/* Grupo input */}
                <div className="input-group">

                  {/* Icono correo */}
                  <span className="input-group-text bg-white">
                    <i className="bi bi-envelope text-success" />
                  </span>

                  {/* Input correo */}
                  <input
                    type="email"
                    className="form-control"
                    placeholder="tucorreo@ejemplo.com"
                    value={correo}
                    onChange={e => setCorreo(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && validar()}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Campo contraseña */}
              <div className="mb-3">

                {/* Label contraseña */}
                <label className="form-label fw-semibold text-dark" style={{ fontSize: 13 }}>
                  Contraseña
                </label>

                {/* Grupo input */}
                <div className="input-group">

                  {/* Icono contraseña */}
                  <span className="input-group-text bg-white">
                    <i className="bi bi-lock text-success" />
                  </span>

                  {/* Input contraseña */}
                  <input
                    className="form-control"
                    placeholder="Tu contraseña"
                    type={showPass ? "text" : "password"}
                    value={contraseña}
                    onChange={e => setContraseña(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && validar()}
                    autoComplete="current-password"
                  />

                  {/* Botón mostrar/ocultar contraseña */}
                  <button type="button" className="input-group-text bg-white"
                    style={{ cursor: "pointer" }} onClick={() => setShowPass(s => !s)}>

                    {/* Icono dinámico */}
                    <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"} text-secondary`} />
                  </button>
                </div>
              </div>

              {/* Botón recuperar contraseña */}
              <div className="d-flex justify-content-end mb-4">

                <button type="button"
                  className="btn btn-link p-0 text-success fw-semibold text-decoration-none"
                  style={{ fontSize: 13 }}

                  // Navega a forgot
                  onClick={() => navigate("/forgot")}>

                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Botón iniciar sesión */}
              <div className="d-grid mb-3">

                <button type="submit" className="btn btn-success fw-bold rounded-pill py-2"
                  style={{ fontSize: 15 }} disabled={loading}>

                  {/* Estado loading */}
                  {loading

                    // Spinner
                    ? <><span className="spinner-border spinner-border-sm me-2" />Entrando...</>

                    // Texto normal
                    : <><i className="bi bi-box-arrow-in-right me-2" />INICIAR SESIÓN</>
                  }
                </button>
              </div>

              {/* Registro */}
              <div className="text-center" style={{ fontSize: 13 }}>

                {/* Texto */}
                <span className="text-secondary">¿No tienes cuenta? </span>

                {/* Botón registro */}
                <button type="button"
                  className="btn btn-link p-0 fw-bold text-success text-decoration-none"
                  style={{ fontSize: 13 }}

                  // Navega a registro
                  onClick={() => navigate("/registro")}>

                  Regístrate aquí
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}