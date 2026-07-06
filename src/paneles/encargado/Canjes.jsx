import { useState, useEffect } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { C, S, Av, BadgeCanje, getIniciales, getPtsUsuario, getPtsRecompensa, capitalizar } from "./encargadoTheme";
import { buscarUsuariosEncargado, getEntregasEncargadoPorUsuario, getRecompensasEncargado, getCanjesEncargado, registrarCanjeEncargado, actualizarEstadoCanjeEncargado } from "../../services/api";

function getRewardStatus(r) {
  const hoy = new Date(new Date().toDateString());
  const inicio = r.fechaInicio ? new Date(r.fechaInicio + "T00:00:00") : null;
  const fin = r.fechaFin ? new Date(r.fechaFin + "T00:00:00") : null;
  if (r.idEstadoRecompensa === 2) return "inactiva";
  if (inicio && inicio > hoy) return "proximamente";
  if (fin && fin < hoy) return "vencida";
  return "activa";
}

function getDiasRestantes(fecha) {
  if (!fecha) return null;
  const hoy = new Date(new Date().toDateString());
  const ven = new Date(new Date(fecha).toDateString());
  return Math.ceil((ven - hoy) / (1000 * 60 * 60 * 24));
}

function StatusBadge({ r }) {
  const status = getRewardStatus(r);
  if (status === "activa" && r.fechaFin) {
    const d = getDiasRestantes(r.fechaFin);
    if (d !== null && d <= 7) {
      return <span className="badge rounded-pill fw-semibold" style={{ fontSize: 9, backgroundColor: "#fef3c7", color: "#92400e" }}><i className="bi bi-clock me-1" />Vence en {d} día{d !== 1 ? "s" : ""}</span>;
    }
  }
  if (status === "proximamente") {
    return <span className="badge rounded-pill fw-semibold" style={{ fontSize: 9, backgroundColor: "#dbeafe", color: "#1e40af" }}><i className="bi bi-calendar me-1" />Desde {new Date(r.fechaInicio).toLocaleDateString("es-CO")}</span>;
  }
  if (status === "vencida") {
    return <span className="badge rounded-pill fw-semibold" style={{ fontSize: 9, backgroundColor: "#fecaca", color: "#991b1b" }}><i className="bi bi-x-circle me-1" />Vencida</span>;
  }
  if (status === "inactiva") {
    return <span className="badge rounded-pill fw-semibold" style={{ fontSize: 9, backgroundColor: "#e5e7eb", color: "#6b7280" }}><i className="bi bi-pause-circle me-1" />Inactiva</span>;
  }
  return null;
}

function PuntosExpirationBadge({ fechaVencimiento, showEmpty = false }) {
  const d = getDiasRestantes(fechaVencimiento);
  if (d === null) {
    if (!showEmpty) return null;
    return <span className="badge rounded-pill fw-semibold" style={{ fontSize: 9, backgroundColor: "#e5e7eb", color: "#6b7280" }}><i className="bi bi-dash-circle me-1" />Sin vencimiento</span>;
  }
  if (d <= 0) {
    return <span className="badge rounded-pill fw-semibold" style={{ fontSize: 9, backgroundColor: "#fecaca", color: "#991b1b" }}><i className="bi bi-x-circle me-1" />Vencidos</span>;
  }
  if (d <= 7) {
    return <span className="badge rounded-pill fw-semibold" style={{ fontSize: 9, backgroundColor: "#fef3c7", color: "#92400e" }}><i className="bi bi-clock me-1" />Vencen en {d} día{d !== 1 ? "s" : ""}</span>;
  }
  return <span className="badge rounded-pill fw-semibold" style={{ fontSize: 9, backgroundColor: "#d1fae5", color: "#065f46" }}><i className="bi bi-check-circle me-1" />Vencen en {d} día{d !== 1 ? "s" : ""}</span>;
}

const MATERIAL_ICON = {
  Papel:    { icon: "bi-file-earmark",  bg: "#fff3cd",   color: "#856404"      },
  Cartón:   { icon: "bi-box-seam",      bg: C.verdeClaro, color: C.verdeOscuro },
  Vidrio:   { icon: "bi-cup-straw",     bg: "#e3f2fd",   color: "#1565c0"      },
  Plástico: { icon: "bi-bag",           bg: "#f3e5f5",   color: "#6a1b9a"      },
};

export default function Canjes({ showToast }) {
  const [tab,           setTab]           = useState("canjear");
  const [cedula,        setCedula]        = useState("");
  const [usuarioSel,    setUsuarioSel]    = useState(null);
  const [recompSel,     setRecompSel]     = useState(null);
  const [comprobante,   setComprobante]   = useState(null);
  const [buscandoUser,  setBuscandoUser]  = useState(false);
  const [noEncontrado,  setNoEncontrado]  = useState(false);
  const [listaUsuarios, setListaUsuarios] = useState([]);

  const [entregas,      setEntregas]      = useState([]);
  const [recompensas,   setRecompensas]   = useState([]);
  const [historial,     setHistorial]     = useState([]);
  const [cargando,      setCargando]      = useState({});
  const [error,         setError]         = useState(null);

  useEffect(() => {
    cargarRecompensas();
    cargarHistorial();
    buscarPorCedula('');
  }, []);

  useEffect(() => {
    setNoEncontrado(false);
    setUsuarioSel(null);
    const t = setTimeout(() => buscarPorCedula(cedula.trim()), 400);
    return () => clearTimeout(t);
  }, [cedula]);

  useEffect(() => {
    if (usuarioSel) {
      cargarEntregas(usuarioSel.idUsuario);
    } else {
      setEntregas([]);
    }
  }, [usuarioSel]);

  const cargarRecompensas = async () => {
    setCargando((p) => ({ ...p, recompensas: true }));
    try {
      const data = await getRecompensasEncargado();
      setRecompensas(data.recompensas ?? []);
    } catch {
      setRecompensas([]);
    } finally {
      setCargando((p) => ({ ...p, recompensas: false }));
    }
  };

  const cargarHistorial = async () => {
    setCargando((p) => ({ ...p, historial: true }));
    try {
      const data = await getCanjesEncargado();
      setHistorial(data.canjes ?? []);
    } catch {
      setHistorial([]);
    } finally {
      setCargando((p) => ({ ...p, historial: false }));
    }
  };

  const buscarPorCedula = async (c) => {
    setBuscandoUser(true);
    setNoEncontrado(false);
    try {
      const data = await buscarUsuariosEncargado(c);
      const usuarios = data.usuarios ?? [];
      setListaUsuarios(usuarios);
      if (usuarios.length === 1) {
        setUsuarioSel(usuarios[0]);
        setRecompSel(null);
        setListaUsuarios([]);
      } else if (usuarios.length > 1) {
        setUsuarioSel(null);
      } else {
        setUsuarioSel(null);
        setNoEncontrado(true);
      }
    } catch {
      setUsuarioSel(null);
      setNoEncontrado(true);
    } finally {
      setBuscandoUser(false);
    }
  };

  const cargarEntregas = async (id) => {
    setCargando((p) => ({ ...p, entregas: true }));
    try {
      const data = await getEntregasEncargadoPorUsuario(id);
      const lista = Array.isArray(data) ? data : (data.entregas ?? []);
      setEntregas(lista);
    } catch {
      setEntregas([]);
    } finally {
      setCargando((p) => ({ ...p, entregas: false }));
    }
  };

  const limpiar = () => {
    setCedula(""); setUsuarioSel(null);
    setRecompSel(null); setNoEncontrado(false); setListaUsuarios([]);
  };

  const getFvp = (obj) => {
    if (!obj) return null;
    return obj.fechaVencimientoPuntos ?? obj.fecha_vencimiento_puntos ?? obj.fechaVencimiento ?? obj.fecha_vencimiento ?? null;
  };

  const entregasFlat = entregas.flatMap((e) => {
    const fecha = e.fechaEntrega?.split("T")[0] ?? "";
    if (e.detalles && e.detalles.length > 0) {
      return e.detalles.map((d) => ({
        id: `e${e.idEntrega}-d${d.idDetalle ?? d.id}`,
        material: d.material?.nombre ?? "Material",
        kg: d.peso ?? 0,
        puntos: d.puntosGenerados ?? 0,
        fecha,
        fechaVencimientoPuntos: getFvp(d) ?? getFvp(e),
      }));
    }
    return [{
      id: `e${e.idEntrega}`,
      material: "Material",
      kg: e.pesoTotal ?? 0,
      puntos: e.puntosTotales ?? 0,
      fecha,
      fechaVencimientoPuntos: getFvp(e),
    }];
  });

  const ptsEntregas = entregasFlat.reduce((a, e) => a + e.puntos, 0);
  const ptsUsuario  = usuarioSel ? getPtsUsuario(usuarioSel) : 0;

  const recompensasActivas    = recompensas.filter(r => getRewardStatus(r) === "activa");
  const recompensasProximas   = recompensas.filter(r => getRewardStatus(r) === "proximamente");
  const recompensasVencidas   = recompensas.filter(r => getRewardStatus(r) === "vencida");
  const recompensasInactivas  = recompensas.filter(r => getRewardStatus(r) === "inactiva");

  const recompensasDisponibles    = recompensasActivas.filter((r) => (!usuarioSel || ptsUsuario >= getPtsRecompensa(r)) && (r.stock === null || r.stock > 0));
  const recompensasNoDisponibles  = recompensasActivas.filter((r) => usuarioSel && ptsUsuario < getPtsRecompensa(r) && (r.stock === null || r.stock > 0));
  const recompensasAgotadas       = recompensasActivas.filter((r) => r.stock !== null && r.stock <= 0);

  const puntosExpirando = entregasFlat.filter(e => e.fechaVencimientoPuntos && getDiasRestantes(e.fechaVencimientoPuntos) !== null && getDiasRestantes(e.fechaVencimientoPuntos) <= 7 && getDiasRestantes(e.fechaVencimientoPuntos) >= 0);
  const puntosVencidos = entregasFlat.filter(e => e.fechaVencimientoPuntos && getDiasRestantes(e.fechaVencimientoPuntos) !== null && getDiasRestantes(e.fechaVencimientoPuntos) < 0);

  const handleCanjear = async () => {
    if (!usuarioSel || !recompSel) return;
    try {
      const data = await registrarCanjeEncargado({
        idUsuario: usuarioSel.idUsuario,
        idRecompensa: recompSel.idRecompensa,
      });
      setComprobante({
        usuario: usuarioSel.nombre,
        recompensa: recompSel.nombre,
        pts: recompSel.puntosRequeridos,
        fecha: new Date().toISOString().split("T")[0],
        codigo: data.canje?.codigoCanje ?? "",
      });
      limpiar();
      cargarHistorial();
      showToast?.(`${recompSel.nombre} canjeado por ${usuarioSel.nombre}`);
    } catch (err) {
      setError(err.message);
      showToast?.(err.message, "error");
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleCambiarEstado = async (id, estadoActual) => {
    const nuevoId = estadoActual === "Canjeado" ? 2 : 1;
    try {
      await actualizarEstadoCanjeEncargado(id, nuevoId);
      cargarHistorial();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 4000);
    }
  };

  return (
    <div>
      {error && (
        <div className="alert alert-danger py-2 mb-3" style={{ fontSize: 13 }}>
          <i className="bi bi-exclamation-circle me-2" />{error}
        </div>
      )}

      <div className="d-flex gap-2 mb-4">
        {[
          { key: "canjear",   icon: "bi-gift",         label: "Gestión de canjes"   },
          { key: "historial", icon: "bi-clock-history", label: "Historial de canjes" },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="btn fw-bold d-flex align-items-center gap-2"
            style={tab === t.key ? S.tabActivo : S.tabInactivo}>
            <i className={`bi ${t.icon}`} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "canjear" && (
        <div className="row g-4">
          <div className="col-lg-7">

            <div className="card mb-3" style={S.card}>
              <div className="card-body p-3">
                <div className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ fontSize: 14, color: C.negro }}>
                  <i className="bi bi-person" style={{ color: C.verde }} />Verificar identidad
                </div>
                <div className="fw-semibold mb-3" style={{ fontSize: 12, color: C.grisTexto }}>Solicita el documento de identidad al reciclador</div>

                <div className="position-relative">
                  <div className="input-group">
                    <span className="input-group-text bg-white" style={{ border: `1.5px solid ${C.verdeBorde}` }}>
                      <i className="bi bi-credit-card text-secondary" />
                    </span>
                    <input type="text" className="form-control" placeholder="Nombre o cédula"
                      value={cedula}
                      style={{ ...S.input, fontSize: 13 }}
                      onChange={(e) => { setCedula(e.target.value); }}
                      inputMode="numeric"
                    />
                    {cedula && (
                      <button className="btn btn-outline-secondary" style={{ border: `1.5px solid ${C.verdeBorde}` }} onClick={limpiar}>
                        <i className="bi bi-x-lg" />
                      </button>
                    )}
                  </div>

                  {buscandoUser && (
                    <div className="mt-1 d-flex justify-content-center px-3 py-2">
                      <LoadingSpinner size="sm" text="Buscando" />
                    </div>
                  )}

                  {noEncontrado && !buscandoUser && cedula.trim().length >= 1 && (
                    <div className="mt-1 px-3 py-2 rounded-2"
                      style={{ fontSize: 13, color: "#991b1b", backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
                      <i className="bi bi-exclamation-circle me-2" />No se encontró ningún usuario
                    </div>
                  )}

                  {listaUsuarios.length > 0 && (
                    <div className="mt-1 rounded-2" style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #e5e7eb" }}>
                      {listaUsuarios.map((u) => (
                        <div key={u.idUsuario}
                          className="d-flex align-items-center gap-2 px-3 py-2"
                          style={{ cursor: "pointer", fontSize: 13, borderBottom: "1px solid #f3f4f6" }}
                          onClick={() => { setUsuarioSel(u); setRecompSel(null); setListaUsuarios([]); }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}
                        >
                          <Av text={getIniciales(u.nombre)} size={32} />
                          <div>
                            <div className="fw-semibold" style={{ color: C.negro }}>{u.nombre}</div>
                            <div style={{ fontSize: 11, color: C.grisTexto }}>{u.correo}</div>
                          </div>
                          <div className="ms-auto fw-bold" style={{ fontSize: 13, color: C.verdeOscuro }}>{u.puntosDisponibles} pts</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {usuarioSel && (
                  <div className="mt-3 p-3 rounded-3 d-flex align-items-center gap-3" style={S.chipUsuario}>
                    <Av text={getIniciales(usuarioSel.nombre)} size={44} />
                    <div className="flex-grow-1">
                      <div className="fw-bold" style={{ fontSize: 14, color: C.negro }}>{usuarioSel.nombre}</div>
                      <div style={{ fontSize: 12, color: C.grisTexto }}>Usuario reciclador</div>
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        {puntosExpirando.length > 0 && (
                          <span className="badge rounded-pill fw-semibold" style={{ fontSize: 9, backgroundColor: "#fef3c7", color: "#92400e" }}>
                            <i className="bi bi-clock me-1" />{puntosExpirando.reduce((a, e) => a + e.puntos, 0)} pts por vencer
                          </span>
                        )}
                        {puntosVencidos.length > 0 && (
                          <span className="badge rounded-pill fw-semibold" style={{ fontSize: 9, backgroundColor: "#fecaca", color: "#991b1b" }}>
                            <i className="bi bi-x-circle me-1" />{puntosVencidos.reduce((a, e) => a + e.puntos, 0)} pts vencidos
                          </span>
                        )}
                        {puntosExpirando.length === 0 && puntosVencidos.length === 0 && (
                          <span className="badge rounded-pill fw-semibold" style={{ fontSize: 9, backgroundColor: "#d1fae5", color: "#065f46" }}>
                            <i className="bi bi-check-circle me-1" />Puntos sin vencimiento
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="fw-bold lh-1" style={{ fontSize: 22, color: C.verdeOscuro }}>{ptsUsuario}</div>
                      <div style={{ fontSize: 10, color: C.grisTexto }}>PUNTOS</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {usuarioSel && (puntosExpirando.length > 0 || puntosVencidos.length > 0) && (
              <div className={`card mb-3 border-2 ${puntosVencidos.length > 0 ? "border-danger" : "border-warning"}`} style={{ backgroundColor: puntosVencidos.length > 0 ? "#fef2f2" : "#fffbeb" }}>
                <div className="card-body p-3 d-flex align-items-center gap-2">
                  <i className={`bi ${puntosVencidos.length > 0 ? "bi-exclamation-triangle-fill text-danger" : "bi-clock-fill text-warning"}`} style={{ fontSize: 20 }} />
                  <div>
                    <div className="fw-bold" style={{ fontSize: 12, color: C.negro }}>
                      {puntosVencidos.length > 0
                        ? `${puntosVencidos.reduce((a, e) => a + e.puntos, 0)} pts vencidos — Se recomienda regularizar`
                        : `${puntosExpirando.reduce((a, e) => a + e.puntos, 0)} pts próximos a vencer`}
                    </div>
                    <div style={{ fontSize: 11, color: C.grisTexto }}>
                      {puntosVencidos.length > 0
                        ? `${puntosVencidos.length} entrega${puntosVencidos.length !== 1 ? "s" : ""} con puntos vencidos`
                        : `${puntosExpirando.length} entrega${puntosExpirando.length !== 1 ? "s" : ""} con puntos por expirar pronto`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {usuarioSel && entregasFlat.length > 0 && (
              <div className="card mb-3" style={S.card}>
                <div className="card-body p-3">
                  <div className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize: 14, color: C.negro }}>
                    <i className="bi bi-recycle" style={{ color: C.verde }} />
                    Entregas de {usuarioSel.nombre.split(" ")[0]}
                  </div>
                  {entregasFlat.map((e) => {
                    const m = MATERIAL_ICON[e.material] ?? { icon: "bi-recycle", bg: C.verdeClaro, color: C.verdeOscuro };
                    const diasRest = e.fechaVencimientoPuntos ? getDiasRestantes(e.fechaVencimientoPuntos) : null;
                    const ptsVencidos = diasRest !== null && diasRest <= 0;
                    return (
                      <div key={e.id} className="d-flex align-items-center gap-3 py-2"
                        style={{
                          borderBottom: `1px solid ${C.verdeClaro}`,
                          opacity: ptsVencidos ? 0.45 : 1,
                          filter: ptsVencidos ? "grayscale(1)" : "none",
                        }}>
                        <div className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                          style={{ width: 36, height: 36, backgroundColor: m.bg, color: m.color }}>
                          <i className={`bi ${m.icon}`} style={{ fontSize: 16 }} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-bold" style={{ fontSize: 13, color: ptsVencidos ? C.grisTexto : C.negro }}>{e.material}{ptsVencidos && <span className="ms-2" style={{ fontSize: 10, color: "#991b1b" }}><i className="bi bi-x-circle me-1" />Vencido</span>}</div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span style={{ fontSize: 11, color: C.grisTexto }}>{e.fecha} · {e.kg} kg</span>
                            <PuntosExpirationBadge fechaVencimiento={e.fechaVencimientoPuntos} showEmpty />
                          </div>
                        </div>
                        <span style={{ ...S.badgePuntos, ...(ptsVencidos ? { backgroundColor: "#f3f4f6", color: "#9ca3af", border: "1px solid #d1d5db" } : {}) }}>{ptsVencidos ? "" : "+"}{e.puntos} pts</span>
                      </div>
                    );
                  })}
                  <div className="d-flex align-items-center justify-content-between mt-3 p-2 rounded-2"
                    style={S.cajaTotalVerde}>
                    <span className="fw-bold" style={{ fontSize: 13, color: C.negro }}>Total acumulado</span>
                    <span className="fw-bold" style={{ fontSize: 16, color: C.verdeOscuro }}>
                      <i className="bi bi-star-fill me-1" />{ptsEntregas} pts
                    </span>
                  </div>
                </div>
              </div>
            )}

            {usuarioSel && entregasFlat.length === 0 && !cargando.entregas && (
              <div className="card mb-3" style={S.card}>
                <div className="card-body p-3">
                  <div className="text-center py-3" style={{ fontSize: 13, color: C.grisTexto }}>
                    <i className="bi bi-inbox d-block mb-1" style={{ fontSize: 22 }} />Sin entregas registradas
                  </div>
                </div>
              </div>
            )}

            {usuarioSel && cargando.entregas && (
              <div className="card mb-3" style={S.card}>
                <div className="card-body p-3 text-center py-3">
                  <LoadingSpinner size="sm" text="Cargando entregas" />
                </div>
              </div>
            )}

            <div className="card" style={S.card}>
              <div className="card-body p-3">
                <div className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ fontSize: 14, color: C.negro }}>
                  <i className="bi bi-gift" style={{ color: C.verde }} />Recompensas disponibles
                  {usuarioSel && <span style={{ fontSize: 11, color: C.grisTexto, fontWeight: 400 }}>— según los puntos de {usuarioSel.nombre.split(" ")[0]}</span>}
                </div>

                {cargando.recompensas ? (
                  <div className="text-center py-4">
                    <LoadingSpinner size="sm" text="Cargando recompensas" />
                  </div>
                ) : !usuarioSel && (
                  <div className="row g-2 mt-2">
                    {[...recompensasActivas, ...recompensasProximas, ...recompensasVencidas, ...recompensasInactivas].map((r) => {
                      const st = getRewardStatus(r);
                      const agotado = r.stock !== null && r.stock <= 0;
                      const disabled = st === "vencida" || st === "inactiva" || agotado;
                      return (
                        <div className="col-6" key={r.idRecompensa}>
                          <div className="p-3 rounded-2 d-flex flex-column gap-1"
                            style={{
                              border: disabled ? `1.5px solid ${C.grisBorde}` : `1.5px solid ${C.verdeBorde}`,
                              backgroundColor: disabled ? "#f9fafb" : (st === "proximamente" ? "#f0fdf4" : C.grisFondo),
                              opacity: disabled ? 0.45 : 1,
                            }}>
                            <div className="d-flex align-items-center gap-2">
                              <i className={`bi ${disabled ? "bi-archive" : "bi-gift"}`} style={{ color: disabled ? C.grisBorde : (st === "proximamente" ? "#fbbf24" : C.verdeMedio), fontSize: 15 }} />
                              <span className="fw-bold" style={{ fontSize: 12, color: disabled ? C.grisTexto : C.negro }}>{r.nombre}</span>
                            </div>
                            <div className="d-flex align-items-center justify-content-between mt-1">
                              <span style={{
                                ...S.badgePuntos,
                                ...(disabled ? { backgroundColor: "#f3f4f6", color: "#9ca3af", border: "1px solid #d1d5db" } : {}),
                              }}>
                                <i className="bi bi-star me-1" />{r.puntosRequeridos} pts
                              </span>
                              <span style={{ fontSize: 10, color: C.grisTexto }}>
                                {agotado ? <span className="text-danger fw-bold">Agotado</span> : `Stock: ${r.stock ?? "∞"}`}
                              </span>
                            </div>
                            {r.aliado && <div style={{ fontSize: 10, color: C.grisTexto }}><i className="bi bi-shop me-1" />{r.aliado}</div>}
                            <div className="mt-1"><StatusBadge r={r} /></div>
                          </div>
                        </div>
                      );
                    })}
                    {recompensasActivas.length === 0 && recompensasProximas.length === 0 && recompensasVencidas.length === 0 && recompensasInactivas.length === 0 && (
                      <div className="text-center py-3" style={{ fontSize: 13, color: C.grisTexto }}>
                        <i className="bi bi-inbox d-block mb-1" style={{ fontSize: 22 }}>No hay recompensas disponibles</i>
                      </div>
                    )}
                  </div>
                )}

                {usuarioSel && (
                  <>
                    {recompensasDisponibles.length === 0 && recompensasNoDisponibles.length === 0 && (
                      <div className="text-center py-3 mt-2" style={{ fontSize: 13, color: C.grisTexto }}>
                        <i className="bi bi-inbox d-block mb-1" style={{ fontSize: 22 }} />No hay recompensas disponibles
                      </div>
                    )}

                    {recompensasDisponibles.length > 0 && (
                      <>
                        <div className="fw-bold mb-2 mt-2 d-flex align-items-center gap-1" style={{ fontSize: 11, color: C.verde }}>
                          <i className="bi bi-check-circle-fill" />Puede canjear ({recompensasDisponibles.length})
                        </div>
                        <div className="row g-2 mb-3">
                          {recompensasDisponibles.map((r) => {
                            const activa = recompSel?.idRecompensa === r.idRecompensa;
                            const st = getRewardStatus(r);
                            return (
                              <div className="col-6" key={r.idRecompensa}>
                                <button type="button" onClick={() => setRecompSel(activa ? null : r)}
                                  className="btn w-100 h-100 d-flex flex-column align-items-start p-3 rounded-2 text-start"
                                  style={{
                                    border: activa ? `2px solid ${C.verde}` : `1.5px solid ${C.verdeBorde}`,
                                    backgroundColor: activa ? C.verdeClaro : C.blanco,
                                  }}>
                                  <div className="d-flex align-items-center gap-2 mb-1 w-100">
                                    <i className="bi bi-gift" style={{ fontSize: 15, color: activa ? C.verdeOscuro : C.verdeMedio }} />
                                    <span className="fw-bold" style={{ fontSize: 12, color: C.negro }}>{r.nombre}</span>
                                    {activa && <i className="bi bi-check-circle-fill ms-auto" style={{ color: C.verde }} />}
                                  </div>
                                  <div className="d-flex align-items-center justify-content-between w-100 mt-1">
                                    <span style={S.badgePuntos}><i className="bi bi-star me-1" />{r.puntosRequeridos} pts</span>
                                    <span style={{ fontSize: 10, color: C.grisTexto }}>Stock: {r.stock ?? "∞"}</span>
                                  </div>
                                  {r.aliado && <div style={{ fontSize: 10, color: C.grisTexto, marginTop: 4 }}>
                                    <i className="bi bi-shop me-1" />{r.aliado}
                                  </div>}
                                  <div className="mt-1"><StatusBadge r={r} /></div>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {recompensasNoDisponibles.length > 0 && (
                      <>
                        <div className="fw-bold mb-2 d-flex align-items-center gap-1" style={{ fontSize: 11, color: C.grisTexto }}>
                          <i className="bi bi-lock-fill" />Sin puntos suficientes ({recompensasNoDisponibles.length})
                        </div>
                        <div className="row g-2 mb-3">
                          {recompensasNoDisponibles.map((r) => (
                            <div className="col-6" key={r.idRecompensa}>
                              <div className="p-3 rounded-2 d-flex flex-column gap-1"
                                style={{ border: `1.5px solid ${C.grisBorde}`, backgroundColor: C.grisFondo, opacity: 0.6 }}>
                                <div className="d-flex align-items-center gap-2">
                                  <i className="bi bi-lock" style={{ color: C.grisBorde, fontSize: 13 }} />
                                  <span className="fw-bold" style={{ fontSize: 12, color: C.grisTexto }}>{r.nombre}</span>
                                </div>
                                <div className="d-flex align-items-center justify-content-between mt-1">
                                  <span style={{ ...S.badgePuntos, backgroundColor: C.grisFondo, color: C.grisTexto, border: `1px solid ${C.grisBorde}` }}>
                                    <i className="bi bi-star me-1" />{r.puntosRequeridos} pts
                                  </span>
                                  <span style={{ fontSize: 10, color: C.grisTexto }}>
                                    Faltan {r.puntosRequeridos - ptsUsuario} pts
                                  </span>
                                </div>
                                {r.aliado && <div style={{ fontSize: 10, color: C.grisTexto }}><i className="bi bi-shop me-1" />{r.aliado}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {recompensasAgotadas.length > 0 && (
                      <>
                        <div className="fw-bold mb-2 d-flex align-items-center gap-1" style={{ fontSize: 11, color: C.rojo }}>
                          <i className="bi bi-x-circle-fill" />Agotadas ({recompensasAgotadas.length})
                        </div>
                        <div className="row g-2 mb-3">
                          {recompensasAgotadas.map((r) => (
                            <div className="col-6" key={r.idRecompensa}>
                              <div className="p-3 rounded-2 d-flex flex-column gap-1"
                                style={{ border: `1.5px solid ${C.grisBorde}`, backgroundColor: "#fef2f2", opacity: 0.6 }}>
                                <div className="d-flex align-items-center gap-2">
                                  <i className="bi bi-archive" style={{ color: C.grisBorde, fontSize: 13 }} />
                                  <span className="fw-bold" style={{ fontSize: 12, color: C.grisTexto }}>{r.nombre}</span>
                                </div>
                                <div className="d-flex align-items-center justify-content-between mt-1">
                                  <span style={{ ...S.badgePuntos, backgroundColor: "#fef2f2", color: C.rojo, border: `1px solid #fecaca` }}>
                                    <i className="bi bi-star me-1" />{r.puntosRequeridos} pts
                                  </span>
                                  <span className="text-danger fw-bold" style={{ fontSize: 10 }}>Agotado</span>
                                </div>
                                {r.aliado && <div style={{ fontSize: 10, color: C.grisTexto }}><i className="bi bi-shop me-1" />{r.aliado}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {recompensasProximas.length > 0 && (
                      <>
                        <div className="fw-bold mb-2 d-flex align-items-center gap-1" style={{ fontSize: 11, color: "#1e40af" }}>
                          <i className="bi bi-calendar-event-fill" />Próximamente ({recompensasProximas.length})
                        </div>
                        <div className="row g-2 mb-3">
                          {recompensasProximas.map((r) => (
                            <div className="col-6" key={r.idRecompensa}>
                              <div className="p-3 rounded-2 d-flex flex-column gap-1"
                                style={{ border: `1.5px solid ${C.grisBorde}`, backgroundColor: "#f0fdf4", opacity: 0.7 }}>
                                <div className="d-flex align-items-center gap-2">
                                  <i className="bi bi-calendar" style={{ color: "#fbbf24", fontSize: 13 }} />
                                  <span className="fw-bold" style={{ fontSize: 12, color: C.negro }}>{r.nombre}</span>
                                </div>
                                <div className="d-flex align-items-center justify-content-between mt-1">
                                  <span style={{ ...S.badgePuntos, backgroundColor: "#dbeafe", color: "#1e40af", border: `1px solid #93c5fd` }}>
                                    <i className="bi bi-star me-1" />{r.puntosRequeridos} pts
                                  </span>
                                  <span style={{ fontSize: 10, color: C.grisTexto }}>Stock: {r.stock ?? "∞"}</span>
                                </div>
                                {r.aliado && <div style={{ fontSize: 10, color: C.grisTexto }}><i className="bi bi-shop me-1" />{r.aliado}</div>}
                                <div className="mt-1"><StatusBadge r={r} /></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {[...recompensasVencidas, ...recompensasInactivas].length > 0 && (
                      <>
                        <div className="fw-bold mb-2 d-flex align-items-center gap-1" style={{ fontSize: 11, color: C.grisTexto }}>
                          <i className="bi bi-archive-fill" />No disponibles ({recompensasVencidas.length + recompensasInactivas.length})
                        </div>
                        <div className="row g-2">
                          {[...recompensasVencidas, ...recompensasInactivas].map((r) => (
                            <div className="col-6" key={r.idRecompensa}>
                              <div className="p-3 rounded-2 d-flex flex-column gap-1"
                                style={{ border: `1.5px solid ${C.grisBorde}`, backgroundColor: "#f9fafb", opacity: 0.5 }}>
                                <div className="d-flex align-items-center gap-2">
                                  <i className="bi bi-archive" style={{ color: C.grisBorde, fontSize: 13 }} />
                                  <span className="fw-bold" style={{ fontSize: 12, color: C.grisTexto }}>{r.nombre}</span>
                                </div>
                                <div className="d-flex align-items-center justify-content-between mt-1">
                                  <span style={{ ...S.badgePuntos, backgroundColor: "#f3f4f6", color: "#9ca3af", border: `1px solid #d1d5db` }}>
                                    <i className="bi bi-star me-1" />{r.puntosRequeridos} pts
                                  </span>
                                  <span style={{ fontSize: 10, color: C.grisTexto }}>Stock: {r.stock ?? "∞"}</span>
                                </div>
                                {r.aliado && <div style={{ fontSize: 10, color: C.grisTexto }}><i className="bi bi-shop me-1" />{r.aliado}</div>}
                                <div className="mt-1"><StatusBadge r={r} /></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card" style={{ ...S.card, position: "sticky", top: 20 }}>
              <div className="card-body p-3">
                <div className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize: 14, color: C.negro }}>
                  <i className="bi bi-receipt" style={{ color: C.verde }} />Resumen del canje
                </div>

                <div className="mb-2">
                  <div className="fw-bold text-uppercase mb-1" style={{ fontSize: 10, letterSpacing: 1, color: C.grisTexto }}>Usuario</div>
                  <div className="p-2 rounded-2 d-flex align-items-center gap-2"
                    style={{ minHeight: 44, border: `1.5px solid ${C.verdeBorde}`, backgroundColor: C.grisFondo }}>
                    {usuarioSel
                      ? <><Av text={getIniciales(usuarioSel.nombre)} size={28} /><span className="fw-bold" style={{ fontSize: 13, color: C.negro }}>{usuarioSel.nombre}</span></>
                      : <span style={{ fontSize: 12, color: C.grisTexto }}>Sin usuario seleccionado</span>}
                  </div>
                </div>

                <div className="mb-2">
                  <div className="fw-bold text-uppercase mb-1" style={{ fontSize: 10, letterSpacing: 1, color: C.grisTexto }}>Recompensa</div>
                  <div className="p-2 rounded-2 d-flex align-items-center gap-2"
                    style={{ minHeight: 44, border: `1.5px solid ${C.verdeBorde}`, backgroundColor: C.grisFondo }}>
                    {recompSel
                      ? <span className="fw-bold" style={{ fontSize: 13, color: C.negro }}>{recompSel.nombre}</span>
                      : <span style={{ fontSize: 12, color: C.grisTexto }}>Sin recompensa seleccionada</span>}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="fw-bold text-uppercase mb-1" style={{ fontSize: 10, letterSpacing: 1, color: C.grisTexto }}>Puntos</div>
                  <div className="row g-2">
                    <div className="col-6">
                      <div className="p-2 rounded-2 text-center" style={S.statBox}>
                        <div className="fw-bold" style={{ fontSize: 20, color: C.verdeOscuro }}>{usuarioSel ? ptsUsuario : "—"}</div>
                        <div style={{ fontSize: 10, color: C.grisTexto }}>Disponibles</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-2 rounded-2 text-center" style={recompSel ? S.statBoxActivo : S.statBox}>
                        <div className="fw-bold" style={{ fontSize: 20, color: C.verdeOscuro }}>{recompSel ? `- ${getPtsRecompensa(recompSel)}` : "—"}</div>
                        <div style={{ fontSize: 10, color: C.grisTexto }}>A descontar</div>
                      </div>
                    </div>
                  </div>

                  {usuarioSel && recompSel && (() => {
                    const pR = getPtsRecompensa(recompSel);
                    const alcanza = ptsUsuario >= pR;
                    return (
                      <div className="mt-2 p-2 rounded-2 text-center fw-bold"
                        style={{ fontSize: 13, border: `1.5px solid ${alcanza ? C.verdeMedio : C.rojoBorde}`, backgroundColor: alcanza ? C.verdeClaro : C.rojoclaro, color: alcanza ? C.verdeOscuro : C.rojo }}>
                        {alcanza
                          ? <><i className="bi bi-check-circle me-1" />{ptsUsuario - pR} pts restantes</>
                          : <><i className="bi bi-exclamation-circle me-1" />Puntos insuficientes</>}
                      </div>
                    );
                  })()}

                  {usuarioSel && (puntosExpirando.length > 0 || puntosVencidos.length > 0) && (
                    <div className="mt-2 d-flex flex-column gap-1">
                      {puntosExpirando.length > 0 && (
                        <div className="p-1 rounded-2 d-flex align-items-center gap-1" style={{ fontSize: 11, backgroundColor: "#fffbeb", border: "1px solid #fde68a", color: "#92400e" }}>
                          <i className="bi bi-clock-fill" style={{ fontSize: 12 }} />
                          <span className="fw-semibold">{puntosExpirando.reduce((a, e) => a + e.puntos, 0)} pts</span>
                          <span>por vencer en ≤7 días</span>
                        </div>
                      )}
                      {puntosVencidos.length > 0 && (
                        <div className="p-1 rounded-2 d-flex align-items-center gap-1" style={{ fontSize: 11, backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" }}>
                          <i className="bi bi-x-circle-fill" style={{ fontSize: 12 }} />
                          <span className="fw-semibold">{puntosVencidos.reduce((a, e) => a + e.puntos, 0)} pts</span>
                          <span>vencidos</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="d-grid">
                  <button onClick={handleCanjear}
                    disabled={!usuarioSel || !recompSel || ptsUsuario < (recompSel ? getPtsRecompensa(recompSel) : 0) || (recompSel?.stock !== null && recompSel?.stock <= 0)}
                    className="btn fw-bold py-2 d-flex align-items-center justify-content-center gap-2"
                    style={S.btnPrimario}>
                    <i className="bi bi-gift" /> Canjear recompensa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "historial" && (
        <div className="card" style={S.card}>
          <div className="card-body p-3">
            <div className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize: 14, color: C.negro }}>
              <i className="bi bi-clock-history" style={{ color: C.verde }} />Historial de canjes
            </div>

            {cargando.historial ? (
              <div className="text-center py-5">
                <LoadingSpinner size="sm" text="Cargando historial" />
              </div>
            ) : historial.length === 0 ? (
              <div className="text-center py-5" style={{ fontSize: 13, color: C.grisTexto }}>
                <i className="bi bi-inbox d-block mb-2" style={{ fontSize: 30 }} />No hay canjes registrados
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0" style={{ fontSize: 13, borderColor: C.verdeClaro }}>
                  <thead style={S.tableHead}>
                    <tr>
                      {["Usuario","Recompensa","Puntos","Código","Fecha","Estado","Acción"].map((h) => (
                        <th key={h} className="fw-bold px-3 py-2" style={S.tableHeadTh}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((h) => {
                      const hId    = h.idCanje ?? h.id;
                      const estado = capitalizar(h.estadoCanje?.nombre ?? "Pendiente");
                      return (
                        <tr key={hId} style={S.tableRow}>
                          <td className="px-3 py-2 fw-bold" style={{ color: C.negro }}>{h.usuario}</td>
                          <td className="px-3 py-2">{h.recompensa}</td>
                          <td className="px-3 py-2 text-center"><span style={S.badgePuntos}><i className="bi bi-star me-1" />{h.puntosUsados}</span></td>
                          <td className="px-3 py-2">
                            <span style={S.badgeCodigo}><i className="bi bi-upc me-1" />{h.codigoCanje}</span>
                          </td>
                          <td className="px-3 py-2" style={{ color: C.grisTexto }}>{h.fechaCanje?.split("T")[0]}</td>
                          <td className="px-3 py-2 text-center"><BadgeCanje estado={estado} /></td>
                          <td className="px-3 py-2 text-center">
                            <button onClick={() => handleCambiarEstado(hId, estado)}
                              className="btn btn-sm fw-bold"
                              style={{ fontSize: 11, border: `1.5px solid ${C.verdeBorde}`, borderRadius: 6,
                                backgroundColor: estado === "Canjeado" ? C.blanco : C.verdeClaro, color: C.verdeOscuro }}>
                              <i className={`bi ${estado === "Canjeado" ? "bi-arrow-counterclockwise" : "bi-check-circle"}`} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {comprobante && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={S.modalOverlay} onClick={() => setComprobante(null)}>
          <div className="bg-white rounded-3 p-4 text-center shadow"
            style={{ maxWidth: 320, width: "90%", border: `1.5px solid ${C.verdeBorde}` }}
            onClick={(e) => e.stopPropagation()}>
            <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: 60, height: 60, backgroundColor: C.verdeClaro, border: `2px solid ${C.verdeMedio}` }}>
              <i className="bi bi-check-lg" style={{ fontSize: 28, color: C.verdeOscuro }} />
            </div>
            <div className="fw-bold mb-1" style={{ fontSize: 17, color: C.negro }}>¡Canje exitoso!</div>
            <div className="mb-3" style={{ fontSize: 12, color: C.grisTexto }}>Comprobante generado</div>
            <div className="rounded-2 p-3 mb-3" style={{ backgroundColor: C.verdeClaro, border: `1.5px solid ${C.verdeMedio}` }}>
              <div className="fw-bold" style={{ fontSize: 11, color: C.verde }}>CÓDIGO</div>
              <div className="fw-bold" style={{ fontSize: 24, letterSpacing: 3, color: C.verdeOscuro }}>{comprobante.codigo}</div>
            </div>
            <div className="text-start rounded-2 p-3 mb-3" style={{ fontSize: 13, border: `1.5px solid ${C.verdeBorde}` }}>
              {[["Usuario", comprobante.usuario], ["Recompensa", comprobante.recompensa], ["Fecha", comprobante.fecha]].map(([l, v]) => (
                <div key={l} className="d-flex justify-content-between mb-1">
                  <span style={{ color: C.grisTexto }}>{l}</span>
                  <span className="fw-bold" style={{ color: C.negro }}>{v}</span>
                </div>
              ))}
              <div className="d-flex justify-content-between">
                <span style={{ color: C.grisTexto }}>Puntos usados</span>
                <span className="fw-bold" style={{ color: C.rojo }}>-{comprobante.pts} pts</span>
              </div>
            </div>
            <button className="btn fw-bold w-100" style={S.btnPrimario} onClick={() => setComprobante(null)}>
              <i className="bi bi-check2 me-2" />Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
