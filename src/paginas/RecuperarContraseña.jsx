// src/components/Forgotpassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from '../services/api';

const API = `${BASE_URL}/api/auth/recuperar-password`;

async function apiFetch(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error en el servidor");
  return data;
}

function Stepper({ paso }) {
  const pasos = [{ num: 1, label: "Correo" }, { num: 2, label: "Nueva clave" }];
  return (
    <div className="d-flex align-items-center justify-content-center mb-4">
      {pasos.map((p, i) => {
        const done   = p.num < paso;
        const activo = p.num === paso;
        return (
          <div key={p.num} className="d-flex align-items-center">
            <div className="d-flex flex-column align-items-center" style={{ gap: 4 }}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: 34, height: 34, fontSize: 14,
                  background: done || activo ? "#198754" : "#e8e8e8",
                  color:      done || activo ? "#fff"    : "#aaa",
                  border:     activo ? "2px solid #111" : "2px solid transparent",
                }}
              >
                {done ? <i className="bi bi-check-lg" /> : p.num}
              </div>
              <span className="fw-bold" style={{ fontSize: 11, color: activo ? "#198754" : "#aaa" }}>
                {p.label}
              </span>
            </div>
            {i < pasos.length - 1 && (
              <div style={{
                width: 48, height: 2, margin: "0 6px", marginBottom: 18,
                background: done ? "#198754" : "#e0e0e0",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Forgotpassword() {
  const navigate = useNavigate();
  const [paso,    setPaso]    = useState(1);
  const [correo,  setCorreo]  = useState("");
  const [codigo,  setCodigo]  = useState("");
  const [pass1,   setPass1]   = useState("");
  const [pass2,   setPass2]   = useState("");
  const [showP1,  setShowP1]  = useState(false);
  const [showP2,  setShowP2]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [info,    setInfo]    = useState("");

  function reset() { setError(""); setInfo(""); }

  async function handleSolicitar(e) {
    e.preventDefault(); reset();
    if (!correo) return setError("Ingresa tu correo electrónico.");
    setLoading(true);
    try {
      const data = await apiFetch(`${API}/solicitar`, { correo });
      setInfo(data.codigo
        ? `Código enviado. (Desarrollo: ${data.codigo})`
        : "Código enviado a tu correo.");
      setPaso(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRestablecer(e) {
    e.preventDefault(); reset();
    if (!codigo)          return setError("Ingresa el código recibido.");
    if (!pass1)           return setError("Ingresa la nueva contraseña.");
    if (pass1.length < 6) return setError("La contraseña debe tener mínimo 6 caracteres.");
    if (pass1 !== pass2)  return setError("Las contraseñas no coinciden.");
    setLoading(true);
    try {
      const data = await apiFetch(`${API}/restablecer`, { correo, codigo, nuevaPassword: pass1 });
      setInfo(data.mensaje);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "#f5f5f5", padding: 16 }}
    >
      <div
        className="bg-white w-100"
        style={{ maxWidth: 440, borderRadius: 16, padding: "40px 36px 32px", border: "1px solid #222" }}
      >

        {/* Cabecera */}
        <div className="text-center mb-3">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
            style={{ width: 64, height: 64, background: "#198754" }}
          >
            <i className="bi bi-shield-lock-fill text-white" style={{ fontSize: 28 }} />
          </div>
          <h4 className="fw-bold mb-1" style={{ color: "#111" }}>Recuperar contraseña</h4>
          <p className="mb-0" style={{ fontSize: 13, color: "#666" }}>
            Sigue los pasos para restablecer tu acceso
          </p>
        </div>

        <Stepper paso={paso} />

        {/* Alertas */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3"
            style={{ borderRadius: 8, fontSize: 13 }}>
            <i className="bi bi-exclamation-triangle-fill" />{error}
          </div>
        )}
        {info && (
          <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3"
            style={{ borderRadius: 8, fontSize: 13 }}>
            <i className="bi bi-check-circle-fill" />{info}
          </div>
        )}

        {/* ── PASO 1 — Correo ── */}
        {paso === 1 && (
          <form onSubmit={handleSolicitar}>
            <div className="mb-3">
              <label className="form-label fw-bold" style={{ fontSize: 13, color: "#111" }}>
                Correo electrónico
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white" style={{ border: "1.5px solid #222", borderRight: "none" }}>
                  <i className="bi bi-envelope" style={{ color: "#198754" }} />
                </span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="usuario@correo.com"
                  value={correo}
                  onChange={e => setCorreo(e.target.value)}
                  style={{ border: "1.5px solid #222", borderLeft: "none", fontSize: 14 }}
                />
              </div>
              <div className="form-text" style={{ color: "#888" }}>
                Te enviaremos un código de 6 dígitos.
              </div>
            </div>

            <button
              type="submit"
              className="btn w-100 fw-bold text-white"
              disabled={loading}
              style={{ background: "#111", border: "none", borderRadius: 8, padding: "11px", fontSize: 15 }}
            >
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" />Enviando...</>
                : <><i className="bi bi-send me-2" />Enviar código</>}
            </button>
          </form>
        )}

        {/* ── PASO 2 — Código + nueva contraseña ── */}
        {paso === 2 && (
          <form onSubmit={handleRestablecer}>

            {/* Código */}
            <div className="mb-3">
              <label className="form-label fw-bold" style={{ fontSize: 13, color: "#111" }}>
                Código de verificación
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white" style={{ border: "1.5px solid #222", borderRight: "none" }}>
                  <i className="bi bi-key" style={{ color: "#198754" }} />
                </span>
                <input
                  type="text"
                  className="form-control fw-bold text-center"
                  placeholder="_ _ _ _ _ _"
                  maxLength={6}
                  value={codigo}
                  onChange={e => setCodigo(e.target.value.replace(/\D/g, ""))}
                  style={{ border: "1.5px solid #222", borderLeft: "none", fontSize: 22, letterSpacing: 8 }}
                />
              </div>
              <div className="form-text" style={{ color: "#888" }}>
                Código enviado a <strong>{correo}</strong>. Expira en 15 minutos.
              </div>
            </div>

            {/* Nueva contraseña */}
            <div className="mb-3">
              <label className="form-label fw-bold" style={{ fontSize: 13, color: "#111" }}>
                Nueva contraseña
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white" style={{ border: "1.5px solid #222", borderRight: "none" }}>
                  <i className="bi bi-lock" style={{ color: "#198754" }} />
                </span>
                <input
                  type={showP1 ? "text" : "password"}
                  className="form-control"
                  placeholder="Mínimo 6 caracteres"
                  value={pass1}
                  onChange={e => setPass1(e.target.value)}
                  style={{ border: "1.5px solid #222", borderLeft: "none", borderRight: "none", fontSize: 14 }}
                />
                <button
                  type="button"
                  className="input-group-text bg-white"
                  onClick={() => setShowP1(v => !v)}
                  style={{ border: "1.5px solid #222", borderLeft: "none", cursor: "pointer" }}
                >
                  <i className={`bi ${showP1 ? "bi-eye-slash" : "bi-eye"}`} style={{ color: "#198754" }} />
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div className="mb-1">
              <label className="form-label fw-bold" style={{ fontSize: 13, color: "#111" }}>
                Confirmar contraseña
              </label>
              <div className="input-group">
                <span
                  className="input-group-text bg-white"
                  style={{ border: `1.5px solid ${pass2 && pass1 !== pass2 ? "#dc3545" : "#222"}`, borderRight: "none" }}
                >
                  <i className="bi bi-lock-fill" style={{ color: "#198754" }} />
                </span>
                <input
                  type={showP2 ? "text" : "password"}
                  className="form-control"
                  placeholder="Repite la contraseña"
                  value={pass2}
                  onChange={e => setPass2(e.target.value)}
                  style={{
                    border: `1.5px solid ${pass2 && pass1 !== pass2 ? "#dc3545" : "#222"}`,
                    borderLeft: "none", borderRight: "none", fontSize: 14,
                  }}
                />
                <button
                  type="button"
                  className="input-group-text bg-white"
                  onClick={() => setShowP2(v => !v)}
                  style={{
                    border: `1.5px solid ${pass2 && pass1 !== pass2 ? "#dc3545" : "#222"}`,
                    borderLeft: "none", cursor: "pointer",
                  }}
                >
                  <i className={`bi ${showP2 ? "bi-eye-slash" : "bi-eye"}`} style={{ color: "#198754" }} />
                </button>
              </div>
            </div>

            {pass2 && (
              <div className="form-text fw-bold mb-3" style={{ color: pass1 === pass2 ? "#198754" : "#dc3545" }}>
                <i className={`bi ${pass1 === pass2 ? "bi-check-circle" : "bi-x-circle"} me-1`} />
                {pass1 === pass2 ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
              </div>
            )}

            <button
              type="submit"
              className="btn w-100 fw-bold text-white mt-2"
              disabled={loading}
              style={{ background: "#111", border: "none", borderRadius: 8, padding: "11px", fontSize: 15 }}
            >
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                : <><i className="bi bi-shield-check me-2" />Restablecer contraseña</>}
            </button>

            <button
              type="button"
              className="btn btn-link w-100 fw-semibold mt-1"
              style={{ color: "#198754", fontSize: 13 }}
              onClick={() => { reset(); setPaso(1); }}
            >
              <i className="bi bi-arrow-left me-1" />Cambiar correo o reenviar código
            </button>
          </form>
        )}

        <hr style={{ borderColor: "#e0e0e0", margin: "24px 0 16px" }} />

        <div className="text-center">
          <button
            type="button"
            className="btn btn-link fw-semibold"
            style={{ color: "#888", fontSize: 13 }}
            onClick={() => navigate("/")}
          >
            <i className="bi bi-arrow-left me-1" />Volver al inicio de sesión
          </button>
        </div>

      </div>
    </div>
  );
}