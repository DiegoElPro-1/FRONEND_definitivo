import { useState, useRef, useEffect } from "react";
import { C, S } from "./encargadoTheme";
import {
  getNotificacionesEncargado,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
  actualizarEstadoReservaEncargado,
} from "../../services/api";
import { io } from "socket.io-client";

// ─── Utilidad de tiempo relativo ─────────────────────────────────────────────
function tiempoRelativo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const seg = Math.floor(diff / 1000);
  if (seg < 60) return "Ahora";
  const min = Math.floor(seg / 60);
  if (min < 60) return `Hace ${min} min`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  const dias = Math.floor(hrs / 24);
  if (dias < 7) return `Hace ${dias} día${dias > 1 ? "s" : ""}`;
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

// ─── Mapa de íconos por tipo ──────────────────────────────────────────────────
const TIPO_ICON = {
  reserva: { icon: "bi-calendar-check-fill", color: C.verde },
  entrega: { icon: "bi-box-seam-fill",        color: "#f9a825" },
  canje:   { icon: "bi-gift-fill",             color: C.verdeOscuro },
};

const TIPO_LABEL = {
  reserva: "Reservas",
  entrega: "Entregas",
  canje:   "Canjes",
  general: "General",
};

// ─────────────────────────────────────────────────────────────────────────────
export default function Notificaciones() {
  const [abierto, setAbierto]           = useState(false);
  const [modal, setModal]               = useState(false);
  const [notis, setNotis]               = useState([]);
  const [noLeidas, setNoLeidas]         = useState(0);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  // ── NUEVO: notificación de reserva seleccionada para el modal de detalle ──
  const [reservaDetalle, setReservaDetalle] = useState(null);

  const notifRef = useRef(null);

  // ── Cargar notificaciones desde el backend ────────────────────────────────
  const cargar = async () => {
    try {
    setLoading(true);
    setError("");

    const data = await getNotificacionesEncargado();

    console.log("NOTIFICACIONES RECIBIDAS:");
    console.log(data);

    setNotis(data.notificaciones || []);
    setNoLeidas(data.noLeidas || 0);

  } catch (e) {
    setError(e.message || "Error al cargar");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { cargar(); }, []);

  // ── Socket en tiempo real ─────────────────────────────────────────────────
  useEffect(() => {
    const idEncargado = localStorage.getItem("userId");
    if (!idEncargado) return;

    const socket = io("https://backend-rp-arreglado-n8p8.onrender.com", {
      auth: { userId: Number(idEncargado) },
    });

    socket.on("notificacion", (data) => {
      console.log("🔔 Notificación recibida:", data);
      setNotis(prev => [
        {
          id:        data.reserva?.idReserva || Date.now(),
          titulo:    "Nueva reserva",
          mensaje:   `${data.reserva?.nombreUsuario} reservó en ${data.reserva?.nombrePunto}`,
          tipo:      "reserva",
          leida:     false,
          createdAt: new Date().toISOString(),
          // Campos extra de la reserva para el modal de detalle
          reserva:   data.reserva,
        },
        ...prev,
      ]);
      setNoLeidas(prev => prev + 1);
    });

    return () => socket.disconnect();
  }, []);

  // ── Cerrar dropdown al hacer clic afuera ──────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Abrir/cerrar dropdown ─────────────────────────────────────────────────
  const handleAbrir = () => {
    setAbierto(v => !v);
    if (!abierto) cargar();
  };

  // ── Marcar una notificación como leída ────────────────────────────────────
  const handleLeer = async (id) => {
    try {
      await marcarNotificacionLeida(id);
      setNotis(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch {}
  };

  // ── Marcar todas como leídas ──────────────────────────────────────────────
  const handleLeerTodas = async () => {
    try {
      await marcarTodasNotificacionesLeidas();
      setNotis(prev => prev.map(n => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch {}
  };

  // ── NUEVO: al hacer clic en una notificación ──────────────────────────────
  // Si es reserva → abre el modal de detalle
  // Si no          → solo la marca como leída
  const handleClickNotificacion = (n) => {
  console.log(n);

  if (!n.leida) handleLeer(n.id);

  if (n.tipo === "reserva") {
    setAbierto(false);
    setReservaDetalle(n);
  }
};

  // ── NUEVO: aceptar reserva ────────────────────────────────────────────────
  const handleAceptarReserva = async () => {
    if (!reservaDetalle) return;
    try {
      // Ajusta el campo idReferencia / id según lo que devuelva tu backend
      const idReserva = reservaDetalle.reserva?.idReserva ?? reservaDetalle.idReferencia ?? reservaDetalle.id;
      await actualizarEstadoReservaEncargado(idReserva, { estado: "confirmada" });
      await marcarNotificacionLeida(reservaDetalle.id);
      setNotis(prev => prev.map(n => n.id === reservaDetalle.id ? { ...n, leida: true } : n));
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error("Error al aceptar reserva:", e);
    } finally {
      setReservaDetalle(null);
    }
  };

  // ── NUEVO: rechazar reserva ───────────────────────────────────────────────
  const handleRechazarReserva = async () => {
    if (!reservaDetalle) return;
    try {
      const idReserva = reservaDetalle.reserva?.idReserva ?? reservaDetalle.idReferencia ?? reservaDetalle.id;
      await actualizarEstadoReservaEncargado(idReserva, {
        estado: "cancelada",
        notas:  "Rechazada por el encargado",
      });
      await marcarNotificacionLeida(reservaDetalle.id);
      setNotis(prev => prev.map(n => n.id === reservaDetalle.id ? { ...n, leida: true } : n));
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error("Error al rechazar reserva:", e);
    } finally {
      setReservaDetalle(null);
    }
  };

  // ── Agrupar notificaciones por tipo (para el modal completo) ──────────────
  const agrupadas = {};
  for (const n of notis) {
    const t = n.tipo || "general";
    if (!agrupadas[t]) agrupadas[t] = [];
    agrupadas[t].push(n);
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div ref={notifRef} style={{ position: "relative" }}>

      {/* ── Botón campana ─────────────────────────────────────────────────── */}
      <button
        onClick={handleAbrir}
        className="btn d-flex align-items-center justify-content-center p-0 position-relative"
        style={{ width: 40, height: 40, borderRadius: 8, border: `1.5px solid ${C.grisBorde}`, backgroundColor: C.blanco, color: C.negro }}
        aria-label="Notificaciones"
      >
        <i className="bi bi-bell-fill" style={{ fontSize: 16 }} />
        {noLeidas > 0 && (
          <span
            className="position-absolute d-flex align-items-center justify-content-center fw-bold rounded-circle"
            style={{ width: 18, height: 18, top: -4, right: -4, fontSize: 9, backgroundColor: C.rojo, color: "#fff", border: `2px solid ${C.blanco}` }}
          >
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {/* ── Dropdown de notificaciones ────────────────────────────────────── */}
      {abierto && (
        <div
          className="position-absolute bg-white rounded-3 shadow-lg overflow-hidden"
          style={{ top: 48, right: 0, width: 380, zIndex: 9999, border: `1.5px solid ${C.grisBorde}` }}
        >
          {/* Cabecera del dropdown */}
          <div className="d-flex align-items-center justify-content-between px-3 py-2"
            style={{ borderBottom: `1px solid ${C.grisBorde}` }}>
            <span className="fw-bold" style={{ fontSize: 14, color: C.negro }}>Notificaciones</span>
            <div className="d-flex align-items-center gap-2">
              {noLeidas > 0 && (
                <button onClick={handleLeerTodas}
                  className="btn fw-bold p-0 border-0 bg-transparent"
                  style={{ fontSize: 11, color: C.verde }}>
                  <i className="bi bi-check2-all me-1" />Leer todas
                </button>
              )}
              <span className="fw-bold rounded-pill px-2 py-0"
                style={{ fontSize: 10, backgroundColor: C.verdeClaro, color: C.verdeOscuro }}>
                {noLeidas} sin leer
              </span>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {loading && notis.length === 0 && (
              <div className="text-center py-4" style={{ color: C.grisTexto, fontSize: 12 }}>
                <div className="spinner-border spinner-border-sm mb-2" style={{ color: C.verde }} role="status" />
                <div>Cargando…</div>
              </div>
            )}

            {error && (
              <div className="d-flex align-items-center gap-2 px-3 py-2"
                style={{ fontSize: 11, color: C.rojo, backgroundColor: C.rojoclaro }}>
                <i className="bi bi-exclamation-triangle-fill flex-shrink-0" />
                <span className="flex-grow-1">{error}</span>
                <button onClick={cargar}
                  className="btn btn-sm fw-bold p-0 border-0 bg-transparent"
                  style={{ fontSize: 11, color: C.rojo, textDecoration: "underline" }}>
                  Reintentar
                </button>
              </div>
            )}

            {!loading && !error && notis.length === 0 && (
              <div className="text-center py-5">
                <i className="bi bi-bell-slash d-block mb-2" style={{ fontSize: 28, color: C.grisTexto }} />
                <span style={{ fontSize: 13, color: C.grisTexto }}>No hay notificaciones</span>
              </div>
            )}

            {notis.slice(0, 10).map(n => {
              const info = TIPO_ICON[n.tipo] || { icon: "bi-bell-fill", color: C.verde };
              const esReserva = n.tipo === "reserva";
              return (
                <button
                  key={n.id}
                  onClick={() => handleClickNotificacion(n)}
                  className="btn w-100 d-flex align-items-start gap-2 px-3 py-2 border-0 rounded-0 text-start"
                  style={{
                    borderBottom:    `1px solid ${C.grisBorde}`,
                    backgroundColor: n.leida ? C.blanco : C.verdeClaro,
                    fontSize:        12,
                    color:           C.negro,
                  }}
                >
                  <i className={`bi ${info.icon} mt-1`} style={{ color: n.leida ? C.grisTexto : info.color, fontSize: 14 }} />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="fw-bold" style={{ fontSize: 12, color: C.negro }}>{n.titulo}</div>
                    <div style={{ fontSize: 11, color: C.grisTexto, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {n.mensaje}
                    </div>
                    <div style={{ fontSize: 10, color: C.grisTexto, marginTop: 2 }}>{tiempoRelativo(n.createdAt)}</div>
                    {/* Indicador de que tiene detalle */}
                    {esReserva && (
                      <div style={{ fontSize: 10, color: C.verde, marginTop: 3 }}>
                        <i className="bi bi-eye-fill me-1" />Ver detalle de reserva
                      </div>
                    )}
                  </div>
                  {!n.leida && (
                    <span style={{ width: 7, height: 7, backgroundColor: C.verde, borderRadius: "50%", flexShrink: 0, marginTop: 6 }} />
                  )}
                </button>
              );
            })}

            {notis.length > 10 && (
              <div className="text-center py-2" style={{ borderTop: `1px solid ${C.grisBorde}` }}>
                <span style={{ fontSize: 11, color: C.grisTexto }}>y {notis.length - 10} más</span>
              </div>
            )}
          </div>

          {/* Pie del dropdown */}
          <div className="d-flex justify-content-between align-items-center px-3 py-2"
            style={{ borderTop: `1px solid ${C.grisBorde}` }}>
            <button onClick={() => setModal(true)}
              className="btn fw-bold p-0 border-0 bg-transparent"
              style={{ fontSize: 12, color: C.verde }}>
              <i className="bi bi-arrows-fullscreen me-1" />Ver completo
            </button>
          </div>
        </div>
      )}

      {/* ── Modal historial completo ───────────────────────────────────────── */}
      {modal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={S.modalOverlay}
          onClick={() => setModal(false)}
        >
          <div
            className="bg-white rounded-3 d-flex flex-column overflow-hidden shadow-lg"
            style={{ width: "90%", maxWidth: 720, maxHeight: "85vh", border: `1.5px solid ${C.grisBorde}` }}
            onClick={e => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between px-4 py-3"
              style={{ borderBottom: `1px solid ${C.grisBorde}` }}>
              <span className="fw-bold" style={{ fontSize: 16, color: C.negro }}>
                <i className="bi bi-bell-fill me-2" style={{ color: C.verde }} />Centro de notificaciones
              </span>
              <button onClick={() => setModal(false)}
                className="btn p-0 border-0 bg-transparent" style={{ fontSize: 18, color: C.grisTexto }}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div style={{ overflowY: "auto", flex: 1 }}>
              {Object.keys(agrupadas).length === 0 && (
                <div className="text-center py-5">
                  <i className="bi bi-bell-slash d-block mb-2" style={{ fontSize: 36, color: C.grisTexto }} />
                  <span style={{ fontSize: 14, color: C.grisTexto }}>No hay notificaciones</span>
                </div>
              )}

              {Object.entries(agrupadas).map(([tipo, lista]) => (
                <div key={tipo}>
                  <div className="px-4 py-2 fw-bold d-flex align-items-center gap-2"
                    style={{ fontSize: 12, color: C.verdeOscuro, backgroundColor: C.verdeClaro, borderBottom: `1px solid ${C.grisBorde}` }}>
                    <i className={`bi ${(TIPO_ICON[tipo] || TIPO_ICON.reserva).icon}`} />
                    {TIPO_LABEL[tipo] || tipo}
                    <span className="badge fw-bold ms-auto"
                      style={{ fontSize: 10, backgroundColor: C.blanco, color: C.verdeOscuro, border: `1px solid ${C.verde}` }}>
                      {lista.filter(n => !n.leida).length} sin leer
                    </span>
                  </div>

                  {lista.map(n => {
                    const info = TIPO_ICON[n.tipo] || { icon: "bi-bell-fill", color: C.verde };
                    return (
                      <div key={n.id}
                        onClick={() => handleClickNotificacion(n)}
                        className="d-flex align-items-start gap-3 px-4 py-3"
                        style={{ borderBottom: `1px solid ${C.grisBorde}`, backgroundColor: n.leida ? C.blanco : C.verdeClaro, cursor: "pointer" }}
                      >
                        <div className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                          style={{ width: 36, height: 36, backgroundColor: n.leida ? C.grisFondo : C.verdeClaro }}>
                          <i className={`bi ${info.icon}`} style={{ color: n.leida ? C.grisTexto : info.color, fontSize: 16 }} />
                        </div>
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="fw-bold" style={{ fontSize: 13, color: C.negro }}>{n.titulo}</div>
                          <div style={{ fontSize: 12, color: C.grisTexto, marginTop: 2 }}>{n.mensaje}</div>
                          <div style={{ fontSize: 10, color: C.grisTexto, marginTop: 4 }}>{tiempoRelativo(n.createdAt)}</div>
                          {n.tipo === "reserva" && (
                            <div style={{ fontSize: 10, color: C.verde, marginTop: 3 }}>
                              <i className="bi bi-eye-fill me-1" />Ver detalle de reserva
                            </div>
                          )}
                        </div>
                        {!n.leida && (
                          <span style={{ width: 8, height: 8, backgroundColor: C.verde, borderRadius: "50%", flexShrink: 0, marginTop: 8 }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {noLeidas > 0 && (
              <div className="px-4 py-2 text-center" style={{ borderTop: `1px solid ${C.grisBorde}` }}>
                <button onClick={handleLeerTodas}
                  className="btn fw-bold"
                  style={{ ...S.btnPrimario, fontSize: 12, padding: "6px 20px" }}>
                  <i className="bi bi-check2-all me-1" />Marcar todas como leídas
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── NUEVO: Modal de detalle de reserva ────────────────────────────── */}
      {reservaDetalle && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ ...S.modalOverlay, zIndex: 100000 }}
          onClick={() => setReservaDetalle(null)}
        >
          <div
            className="bg-white rounded-3 d-flex flex-column overflow-hidden shadow-lg"
            style={{ width: "90%", maxWidth: 480, maxHeight: "90vh", border: `1.5px solid ${C.grisBorde}` }}
            onClick={e => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="d-flex align-items-center justify-content-between px-4 py-3"
              style={{ borderBottom: `1px solid ${C.grisBorde}`, backgroundColor: C.verdeClaro }}>
              <span className="fw-bold" style={{ fontSize: 15, color: C.verdeOscuro }}>
                <i className="bi bi-calendar-check-fill me-2" />Detalle de reserva
              </span>
              <button onClick={() => setReservaDetalle(null)}
                className="btn p-0 border-0 bg-transparent" style={{ fontSize: 18, color: C.grisTexto }}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {/* Cuerpo */}
            <div style={{ overflowY: "auto", padding: "20px" }} className="d-flex flex-column gap-3">

              {/* Foto de evidencia */}
              <div>
                <div className="fw-bold mb-2" style={{ fontSize: 13, color: C.negro }}>
                  <i className="bi bi-camera-fill me-1" style={{ color: C.verde }} /> Foto de evidencia
                </div>
                <div
                  className="rounded-3 overflow-hidden bg-light d-flex align-items-center justify-content-center"
                  style={{ border: `1px solid ${C.grisBorde}`, height: 220 }}
                >
                  {reservaDetalle.reserva?.urlFoto || reservaDetalle.urlFoto ? (
                    <img
                      src={reservaDetalle.reserva?.urlFoto ?? reservaDetalle.urlFoto}
                      alt="Evidencia del usuario"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div className="text-muted d-flex flex-column align-items-center">
                      <i className="bi bi-image mb-1" style={{ fontSize: 28, color: C.grisTexto }} />
                      <span style={{ fontSize: 11, color: C.grisTexto }}>El usuario no adjuntó imagen</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Datos del usuario y punto */}
              <div className="p-3 rounded-3" style={{ backgroundColor: "#f8f9fa", border: `1px solid ${C.grisBorde}` }}>
                <div className="fw-bold mb-2" style={{ fontSize: 13, color: C.negro }}>
                  <i className="bi bi-person-fill me-1 text-secondary" /> Información de la reserva
                </div>
                <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}>
                  <span style={{ color: C.grisTexto }}>Usuario:</span>
                  <span className="fw-bold" style={{ color: C.negro }}>
                    {reservaDetalle.reserva?.nombreUsuario ?? "—"}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}>
                  <span style={{ color: C.grisTexto }}>Punto de reciclaje:</span>
                  <span className="fw-bold" style={{ color: C.negro }}>
                    {reservaDetalle.reserva?.nombrePunto ?? "—"}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}>
                  <span style={{ color: C.grisTexto }}>Fecha:</span>
                  <span className="fw-bold" style={{ color: C.negro }}>
                    {reservaDetalle.reserva?.fecha
                      ? new Date(reservaDetalle.reserva.fecha).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })
                      : tiempoRelativo(reservaDetalle.createdAt)}
                  </span>
                </div>
                {reservaDetalle.reserva?.material && (
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}>
                    <span style={{ color: C.grisTexto }}>Material:</span>
                    <span className="fw-bold text-capitalize" style={{ color: C.verdeOscuro }}>
                      {reservaDetalle.reserva.material}
                    </span>
                  </div>
                )}
              </div>

              {/* Diagnóstico de la IA (si viene) */}
              {(reservaDetalle.reserva?.iaMaterial || reservaDetalle.iaMaterial) && (
                <div className="p-3 rounded-3" style={{ backgroundColor: "#f0f4ff", border: `1px solid #c7d2fe` }}>
                  <div className="fw-bold mb-2" style={{ fontSize: 13, color: C.negro }}>
                    <i className="bi bi-cpu-fill me-1 text-primary" /> Diagnóstico de la IA
                  </div>
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}>
                    <span style={{ color: C.grisTexto }}>Material identificado:</span>
                    <span className="fw-bold text-capitalize" style={{ color: C.verdeOscuro }}>
                      {reservaDetalle.reserva?.iaMaterial ?? reservaDetalle.iaMaterial}
                    </span>
                  </div>
                  {(reservaDetalle.reserva?.iaConfianza ?? reservaDetalle.iaConfianza) && (
                    <div className="d-flex justify-content-between align-items-center" style={{ fontSize: 12 }}>
                      <span style={{ color: C.grisTexto }}>Confianza:</span>
                      <span className="badge bg-primary" style={{ fontSize: 10 }}>
                        {reservaDetalle.reserva?.iaConfianza ?? reservaDetalle.iaConfianza}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Mensaje opcional del usuario */}
              <div>
                <div className="fw-bold mb-1" style={{ fontSize: 13, color: C.negro }}>
                  <i className="bi bi-chat-left-text-fill me-1 text-secondary" /> Mensaje del usuario
                </div>
                <div className="p-2 rounded-2 bg-white" style={{ border: `1px solid ${C.grisBorde}`, fontSize: 12, color: C.negro, minHeight: 40 }}>
                  {reservaDetalle.reserva?.mensajeUsuario
                    ?? reservaDetalle.reserva?.mensaje
                    ?? reservaDetalle.mensaje
                    ?? <span style={{ color: C.grisTexto, fontStyle: "italic" }}>Sin mensaje adjunto.</span>}
                </div>
              </div>
            </div>

            {/* Botonera */}
            <div className="d-flex gap-2 px-4 py-3 bg-light" style={{ borderTop: `1px solid ${C.grisBorde}` }}>
              <button
                onClick={handleRechazarReserva}
                className="btn btn-danger flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-1"
                style={{ fontSize: 13, padding: "10px" }}
              >
                <i className="bi bi-x-circle-fill" /> Rechazar
              </button>
              <button
                onClick={handleAceptarReserva}
                className="btn flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-1"
                style={{ fontSize: 13, backgroundColor: C.verde, color: "#fff", padding: "10px" }}
              >
                <i className="bi bi-check-circle-fill" /> Aceptar reserva
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}