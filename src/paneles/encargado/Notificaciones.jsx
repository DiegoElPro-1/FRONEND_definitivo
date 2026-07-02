import { useState, useRef, useEffect } from "react";
import { C, S, Av } from "./encargadoTheme";
import {
  getNotificacionesEncargado,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
  actualizarEstadoReservaEncargado,
  getReservaDetalleEncargado,
} from "../../services/api";
import { io } from "socket.io-client";

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

export default function Notificaciones({ onNuevaReserva }) {
  const [abierto, setAbierto] = useState(false);
  const [modal, setModal] = useState(false);
  const [notis, setNotis] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [detalleReserva, setDetalleReserva] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const notifRef = useRef(null);

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

  const openDetalleReserva = async (n) => {
    try {
      setCargandoDetalle(true);
      setAbierto(false);
      const data = await getReservaDetalleEncargado(n.idReferencia);
      setDetalleReserva({ ...data.reserva, notificacion: n });
    } catch {
      setToast({ tipo: 'error', mensaje: 'Error al cargar detalle de la reserva' });
    } finally {
      setCargandoDetalle(false);
    }
  };

  useEffect(() => { cargar(); }, []);

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
          reserva:   data.reserva,
        },
        ...prev,
      ]);
      setNoLeidas(prev => prev + 1);
      if (onNuevaReserva && data.reserva) onNuevaReserva(data.reserva);
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAbrir = () => {
    setAbierto(v => !v);
    if (!abierto) cargar();
  };

  const handleLeer = async (id) => {
    try {
      await marcarNotificacionLeida(id);
      setNotis(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleLeerTodas = async () => {
    try {
      await marcarTodasNotificacionesLeidas();
      setNotis(prev => prev.map(n => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch {}
  };

  const handleAceptarReserva = async () => {
    if (!detalleReserva) return;
    try {
      const idReserva = detalleReserva.idReserva ?? detalleReserva.notificacion?.idReferencia;
      await actualizarEstadoReservaEncargado(idReserva, { estado: "confirmada" });
      await marcarNotificacionLeida(detalleReserva.notificacion?.id || detalleReserva.notificacion?.idNotificacion);
      setNotis(prev => prev.map(n => n.id === detalleReserva.notificacion?.id ? { ...n, leida: true } : n));
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error("Error al aceptar reserva:", e);
    } finally {
      setDetalleReserva(null);
    }
  };

  const handleRechazarReserva = async () => {
    if (!detalleReserva) return;
    try {
      const idReserva = detalleReserva.idReserva ?? detalleReserva.notificacion?.idReferencia;
      await actualizarEstadoReservaEncargado(idReserva, {
        estado: "cancelada",
        notas: "Rechazada por el encargado",
      });
      await marcarNotificacionLeida(detalleReserva.notificacion?.id || detalleReserva.notificacion?.idNotificacion);
      setNotis(prev => prev.map(n => n.id === detalleReserva.notificacion?.id ? { ...n, leida: true } : n));
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error("Error al rechazar reserva:", e);
    } finally {
      setDetalleReserva(null);
    }
  };

  const agrupadas = {};
  for (const n of notis) {
    const t = n.tipo || "general";
    if (!agrupadas[t]) agrupadas[t] = [];
    agrupadas[t].push(n);
  }

  return (
    <div ref={notifRef} style={{ position: "relative" }}>

      {/* Botón campana */}
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

      {/* Dropdown */}
      {abierto && (
        <div
          className="position-absolute bg-white rounded-3 shadow-lg overflow-hidden"
          style={{ top: 48, right: 0, width: 380, zIndex: 9999, border: `1.5px solid ${C.grisBorde}` }}
        >
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
                <div key={n.idNotificacion || n.id}
                  onClick={() => { if (esReserva) openDetalleReserva(n); else handleLeer(n.idNotificacion || n.id); }}
                  className="w-100 d-flex align-items-start gap-2 px-3 py-2"
                  style={{ cursor: "pointer", borderBottom: `1px solid ${C.grisBorde}`, backgroundColor: n.leida ? C.blanco : C.verdeClaro, fontSize: 12, color: C.negro }}
                >
                  <i className={`bi ${info.icon} mt-1`} style={{ color: n.leida ? C.grisTexto : info.color, fontSize: 14 }} />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="fw-bold" style={{ fontSize: 12, color: C.negro }}>{n.titulo}</div>
                    <div style={{ fontSize: 11, color: C.grisTexto, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {n.mensaje}
                    </div>
                    <div style={{ fontSize: 10, color: C.grisTexto, marginTop: 2 }}>{tiempoRelativo(n.createdAt)}</div>
                    {esReserva && (
                      <div style={{ fontSize: 10, color: C.verde, marginTop: 3 }}>
                        <i className="bi bi-eye-fill me-1" />Ver detalle de reserva
                      </div>
                    )}
                  </div>
                  {!n.leida && (
                    <span style={{ width: 7, height: 7, backgroundColor: C.verde, borderRadius: "50%", flexShrink: 0, marginTop: 6 }} />
                  )}
                </div>
              );
            })}

            {notis.length > 10 && (
              <div className="text-center py-2" style={{ borderTop: `1px solid ${C.grisBorde}` }}>
                <span style={{ fontSize: 11, color: C.grisTexto }}>y {notis.length - 10} más</span>
              </div>
            )}
          </div>

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

      {/* Modal historial completo */}
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
                      <div key={n.idNotificacion || n.id}
                        onClick={() => { if (n.tipo === "reserva") openDetalleReserva(n); else handleLeer(n.idNotificacion || n.id); }}
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

      {/* Modal detalle reserva */}
      {detalleReserva && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ ...S.modalOverlay, zIndex: 100000 }} onClick={() => setDetalleReserva(null)}>
          <div className="bg-white rounded-3 d-flex flex-column overflow-hidden shadow-lg"
            style={{ width: "90%", maxWidth: 500, maxHeight: "85vh", border: `1.5px solid ${C.grisBorde}` }}
            onClick={e => e.stopPropagation()}>

            <div className="d-flex align-items-center justify-content-between px-4 py-3"
              style={{ borderBottom: `1px solid ${C.grisBorde}`, backgroundColor: C.verdeClaro }}>
              <span className="fw-bold" style={{ fontSize: 16, color: C.verdeOscuro }}>
                <i className="bi bi-calendar-check-fill me-2" />Detalle de reserva
              </span>
              <button onClick={() => setDetalleReserva(null)}
                className="btn p-0 border-0 bg-transparent" style={{ fontSize: 18, color: C.grisTexto }}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div style={{ overflowY: "auto", flex: 1 }} className="p-4">
              {cargandoDetalle ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm" style={{ color: C.verde }} role="status" />
                  <div className="mt-2" style={{ fontSize: 13, color: C.grisTexto }}>Cargando detalle…</div>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3"
                    style={{ backgroundColor: C.grisFondo, border: `1.5px solid ${C.verdeBorde}` }}>
                    <Av text={detalleReserva.usuario?.nombre ? detalleReserva.usuario.nombre.split(" ").slice(0,2).map(p => p[0]?.toUpperCase()).join("") : "?"} size={50} />
                    <div>
                      <div className="fw-bold" style={{ fontSize: 15, color: C.negro }}>{detalleReserva.usuario?.nombre || "Usuario"}</div>
                      <div style={{ fontSize: 11, color: C.grisTexto }}>{detalleReserva.usuario?.correo || ""}</div>
                    </div>
                  </div>

                  <div className="d-flex gap-3" style={{ fontSize: 12, color: C.grisTexto }}>
                    <span className="fw-bold d-flex align-items-center gap-1"><i className="bi bi-calendar3" />{detalleReserva.fecha}</span>
                    <span className="fw-bold d-flex align-items-center gap-1"><i className="bi bi-clock" />{detalleReserva.hora}</span>
                  </div>

                  {detalleReserva.notificacion?.mensaje && (
                    <div className="rounded-3 p-3" style={{ backgroundColor: C.verdeClaro, border: `1.5px solid ${C.verdeBorde}` }}>
                      <div className="fw-bold mb-1" style={{ fontSize: 12, color: C.verdeOscuro }}>Mensaje</div>
                      <div style={{ fontSize: 12, color: C.negro }}>{detalleReserva.notificacion.mensaje}</div>
                    </div>
                  )}

                  {detalleReserva.imagen && (
                    <div>
                      <div className="fw-bold mb-2 d-flex align-items-center gap-2" style={{ fontSize: 13, color: C.negro }}>
                        <i className="bi bi-image-fill" style={{ color: C.verde }} />Foto del material
                      </div>
                      <img src={detalleReserva.imagen} alt="Material"
                        className="rounded-3 w-100"
                        style={{ maxHeight: 200, objectFit: "cover", border: `1.5px solid ${C.verdeBorde}` }} />
                    </div>
                  )}

                  {detalleReserva.aiResultado && (
                    <div className="rounded-3 p-3" style={{ backgroundColor: "#e8f5e9", border: `1.5px solid ${C.verde}` }}>
                      <div className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ fontSize: 13, color: C.verdeOscuro }}>
                        <i className="bi bi-robot" />Análisis IA
                      </div>
                      <div style={{ fontSize: 12, color: C.negro, whiteSpace: "pre-wrap" }}>{detalleReserva.aiResultado}</div>
                    </div>
                  )}

                  {detalleReserva.estado === 'pendiente' && (
                    <div className="d-flex gap-2 mt-2">
                      <button onClick={handleAceptarReserva}
                        className="btn fw-bold flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                        style={{ backgroundColor: C.verde, color: "#fff", fontSize: 13, padding: "10px", borderRadius: 8 }}>
                        <i className="bi bi-check-circle-fill" /> Aceptar reserva
                      </button>
                      <button onClick={handleRechazarReserva}
                        className="btn fw-bold flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                        style={{ backgroundColor: C.rojo, color: "#fff", fontSize: 13, padding: "10px", borderRadius: 8 }}>
                        <i className="bi bi-x-circle-fill" /> Rechazar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
} 