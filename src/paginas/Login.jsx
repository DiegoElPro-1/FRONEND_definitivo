import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { iniciarSesion } from "../services/api";
import fondoReciclaje from '../components/imagenes/fondo_reciclaje.png';

function detectarRol(usuario) {
  const idRol = usuario?.id_rol ?? usuario?.idRol ?? usuario?.rol?.id_rol ?? usuario?.rol?.idRol;
  const rolNombre = (usuario?.rol ?? "").toString().toLowerCase();

  if (idRol === 1 || rolNombre === "administrador" || rolNombre === "admin") return "administrador";
  if (idRol === 4 || rolNombre === "encargado") return "encargado";
  return "usuario";
}

export default function Login({ onLogin }) {
  const [correo,     setCorreo]     = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error,      setError]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [showPass,   setShowPass]   = useState(false);
  const [rolDev,     setRolDev]     = useState("");
  const navigate = useNavigate();

  const validar = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (!correo.trim() || !contraseña.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (!correo.includes("@") || !correo.includes(".")) {
      setError("Correo electrónico inválido");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data    = await iniciarSesion(correo.trim(), contraseña);
      const usuario = data.usuario ?? data;

      const rolSeleccionado = rolDev || detectarRol(usuario);

      localStorage.setItem("usuario",  JSON.stringify(usuario));
      sessionStorage.setItem("user",   JSON.stringify({ ...usuario, rolSeleccionado }));

      if (onLogin) onLogin({ ...usuario, rolSeleccionado });

    } catch (err) {
      setError(err.message || "Correo o contraseña incorrectos");
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
            backgroundImage: `url(${fondoReciclaje})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            minHeight: "100vh",
          }}
        />

        <div className="col-12 col-md-6 d-flex justify-content-center align-items-center bg-white">
          <div className="w-100 px-4" style={{ maxWidth: 420 }}>
            <form className="py-5" onSubmit={validar} noValidate>

              <div className="text-center mb-4">
                <h1 className="fw-bold text-dark fs-3 mb-1">
                  ¡Bienvenido de nuevo! <i className="bi bi-leaf-fill text-success" />
                </h1>
                <p className="text-success fw-semibold mb-0" style={{ fontSize: 14 }}>
                  Inicia sesión para continuar reciclando y ganando
                </p>
              </div>

              {error && (
                <div className="alert alert-danger border border-danger d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: 13 }}>
                  <i className="bi bi-exclamation-circle-fill text-danger" />
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-semibold text-dark" style={{ fontSize: 13 }}>
                  Correo electrónico
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-envelope text-success" />
                  </span>
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

              <div className="mb-3">
                <label className="form-label fw-semibold text-dark" style={{ fontSize: 13 }}>
                  Contraseña
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-lock text-success" />
                  </span>
                  <input
                    className="form-control"
                    placeholder="Tu contraseña"
                    type={showPass ? "text" : "password"}
                    value={contraseña}
                    onChange={e => setContraseña(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && validar()}
                    autoComplete="current-password"
                  />
                  <button type="button" className="input-group-text bg-white"
                    style={{ cursor: "pointer" }} onClick={() => setShowPass(s => !s)}>
                    <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"} text-secondary`} />
                  </button>
                </div>
              </div>

              <div className="d-flex justify-content-end mb-4">
                <button type="button"
                  className="btn btn-link p-0 text-success fw-semibold text-decoration-none"
                  style={{ fontSize: 13 }}
                  onClick={() => navigate("/forgot")}>
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-success fw-bold rounded-pill py-2"
                  style={{ fontSize: 15 }} disabled={loading}>
                  {loading
                    ? <><span className="spinner-border spinner-border-sm me-2" />Entrando...</>
                    : <><i className="bi bi-box-arrow-in-right me-2" />INICIAR SESIÓN</>
                  }
                </button>
              </div>

              <div className="text-center" style={{ fontSize: 13 }}>
                <span className="text-secondary">¿No tienes cuenta? </span>
                <button type="button"
                  className="btn btn-link p-0 fw-bold text-success text-decoration-none"
                  style={{ fontSize: 13 }}
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