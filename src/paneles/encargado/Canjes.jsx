// src/paneles/encargado/Canjes.jsx
import { useState, useEffect } from "react";
import {
  buscarUsuariosEncargado,
  getCanjesEncargado,
  registrarCanjeEncargado,
  getRecompensas,
} from "../../services/api";

function Av({ text, size = 36, bg = "#ffc107", color = "#000" }) {
  return (
    <div
      className="d-flex align-items-center justify-content-center rounded-circle fw-black flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: bg, color, fontSize: size * 0.36 }}
    >
      {text}
    </div>
  );
}

function BadgeCanje({ estado }) {
  const map = {
    Completado: { bg: "#198754", text: "white", icon: "bi-check-circle-fill" },
    completado: { bg: "#198754", text: "white", icon: "bi-check-circle-fill" },
    Pendiente:  { bg: "#ffc107", text: "#000",  icon: "bi-clock-fill"        },
    pendiente:  { bg: "#ffc107", text: "#000",  icon: "bi-clock-fill"        },
    Cancelado:  { bg: "#dc3545", text: "white", icon: "bi-x-circle-fill"     },
    cancelado:  { bg: "#dc3545", text: "white", icon: "bi-x-circle-fill"     },
  };
  const s = map[estado] || map.Pendiente;
  return (
    <span
      className="badge d-inline-flex align-items-center gap-1 fw-bold"
      style={{ backgroundColor: s.bg, color: s.text, fontSize: 11 }}
    >
      <i className={`bi ${s.icon}`} /> {estado}
    </span>
  );
}

function generarCodigo() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return "ECO-" + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function getIniciales(nombre = "") {
  return nombre.split(" ").slice(0, 2).map(p => p[0]?.toUpperCase()).join("");
}

// ✅ Helper para obtener puntos de recompensa (backend devuelve puntosRequeridos)
function getPtsRecompensa(r) {
  return r?.puntosRequeridos ?? r?.puntosNecesarios ?? r?.pts ?? 0;
}

// ✅ Helper para obtener puntos de usuario (backend devuelve puntosDisponibles)
function getPtsUsuario(u) {
  return u?.puntosDisponibles ?? u?.puntos ?? u?.pts ?? 0;
}

export default function Canjes() {
  const [tab, setTab]               = useState("canjear");
  const [busqueda, setBusqueda]     = useState("");
  const [usuarioSel, setUsuarioSel] = useState(null);
  const [recompSel, setRecompSel]   = useState(null);
  const [comprobante, setComprobante] = useState(null);
  const [errorSaldo, setErrorSaldo]   = useState(false);
  const [errorMsg, setErrorMsg]       = useState("");

  const [recompensas, setRecompensas] = useState([]);
  const [historial,   setHistorial]   = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);

  const [loadingRecomp,    setLoadingRecomp]    = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [loadingCanjear,   setLoadingCanjear]   = useState(false);
  const [loadingBusqueda,  setLoadingBusqueda]  = useState(false);

  useEffect(() => {
    setLoadingRecomp(true);
    getRecompensas()
      .then(data => {
        const lista = Array.isArray(data) ? data : (data.recompensas ?? []);
        setRecompensas(lista);
      })
      .catch(() => setRecompensas([]))
      .finally(() => setLoadingRecomp(false));
  }, []);

  useEffect(() => {
    if (tab !== "historial") return;
    setLoadingHistorial(true);
    getCanjesEncargado()
      .then(data => {
        const lista = Array.isArray(data) ? data : (data.canjes ?? []);
        setHistorial(lista);
      })
      .catch(() => setHistorial([]))
      .finally(() => setLoadingHistorial(false));
  }, [tab]);

  useEffect(() => {
    if (!busqueda.trim() || usuarioSel) {
      setUsuariosFiltrados([]);
      return;
    }
    const timer = setTimeout(() => {
      setLoadingBusqueda(true);
      buscarUsuariosEncargado(busqueda)
        .then(data => {
          const lista = Array.isArray(data) ? data : (data.usuarios ?? []);
          setUsuariosFiltrados(lista);
        })
        .catch(() => setUsuariosFiltrados([]))
        .finally(() => setLoadingBusqueda(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [busqueda, usuarioSel]);

  const seleccionarUsuario = (u) => {
    setUsuarioSel(u);
    setBusqueda(u.nombre);
    setUsuariosFiltrados([]);
    setRecompSel(null);
    setErrorSaldo(false);
    setErrorMsg("");
  };

  const handleCanjear = async () => {
    if (!usuarioSel || !recompSel) return;

    const ptsUsuario = getPtsUsuario(usuarioSel);
    const ptsRecomp  = getPtsRecompensa(recompSel);

    if (ptsUsuario < ptsRecomp) {
      setErrorSaldo(true);
      return;
    }

    setLoadingCanjear(true);
    setErrorMsg("");
    try {
      const resultado = await registrarCanjeEncargado({
        idUsuario:    usuarioSel.idUsuario ?? usuarioSel.id,
        idRecompensa: recompSel.idRecompensa ?? recompSel.id,
      });

      const nuevo = {
        id:         resultado?.idCanje ?? Date.now(),
        usuario:    usuarioSel.nombre,
        recompensa: recompSel.nombre,
        pts:        ptsRecomp,
        fecha:      new Date().toISOString().split("T")[0],
        codigo:     resultado?.canje?.codigoCanje ?? resultado?.codigo ?? generarCodigo(),
        estado:     resultado?.estado ?? "Completado",
      };

      setComprobante(nuevo);
      setUsuarioSel(null);
      setBusqueda("");
      setRecompSel(null);
      setErrorSaldo(false);
    } catch (e) {
      setErrorMsg(e.message || "Error al registrar el canje");
    } finally {
      setLoadingCanjear(false);
    }
  };

  const COLORES = ["#198754","#0d6efd","#dc3545","#d63384","#0dcaf0","#6f42c1","#fd7e14","#20c997"];
  const ICONOS  = ["bi-bag-fill","bi-star-fill","bi-gift-fill","bi-heart-pulse-fill","bi-cup-hot-fill","bi-camera-reels","bi-wifi","bi-bus-front-fill"];

  return (
    <div>
      <div className="d-flex gap-2 mb-4">
        {[
          { key: "canjear",   icon: "bi-gift-fill",     label: "Gestión de canjes"   },
          { key: "historial", icon: "bi-clock-history",  label: "Historial de canjes" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`btn fw-bold d-flex align-items-center gap-2 border-2 ${
              tab === t.key ? "btn-warning border-dark text-dark" : "btn-outline-dark text-dark"
            }`}
            style={{ fontSize: 13 }}
          >
            <i className={`bi ${t.icon}`} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "canjear" && (
        <div className="row g-4">
          <div className="col-lg-7">
            {/* Buscar usuario */}
            <div className="card border border-2 border-dark rounded-3 shadow-sm mb-3">
              <div className="card-body p-3">
                <div className="fw-black text-dark mb-1" style={{ fontSize: 15 }}>
                  <i className="bi bi-person-fill text-warning me-2" />Buscar usuario
                </div>
                <div className="text-secondary mb-3" style={{ fontSize: 12 }}>
                  Escribe el nombre del reciclador
                </div>

                <div className="position-relative">
                  <div className="input-group">
                    <span className="input-group-text border-dark border-2 bg-white">
                      {loadingBusqueda
                        ? <span className="spinner-border spinner-border-sm text-secondary" />
                        : <i className="bi bi-search text-secondary" />}
                    </span>
                    <input
                      type="text"
                      className="form-control border-dark border-2 fw-semibold"
                      placeholder="Ej: Elena Santacruz"
                      value={busqueda}
                      onChange={e => {
                        setBusqueda(e.target.value);
                        setUsuarioSel(null);
                        setErrorSaldo(false);
                        setErrorMsg("");
                      }}
                      style={{ fontSize: 14 }}
                    />
                    {busqueda && (
                      <button
                        className="btn btn-outline-dark border-2"
                        onClick={() => { setBusqueda(""); setUsuarioSel(null); setRecompSel(null); setErrorSaldo(false); setErrorMsg(""); }}
                      >
                        <i className="bi bi-x-lg" />
                      </button>
                    )}
                  </div>

                  {usuariosFiltrados.length > 0 && !usuarioSel && (
                    <div
                      className="position-absolute w-100 bg-white border border-2 border-dark rounded-3 shadow mt-1"
                      style={{ zIndex: 99 }}
                    >
                      {usuariosFiltrados.map(u => {
                        const pts = getPtsUsuario(u);
                        const av  = getIniciales(u.nombre);
                        return (
                          <button
                            key={u.idUsuario ?? u.id}
                            className="btn w-100 d-flex align-items-center gap-3 px-3 py-2 text-start border-0 rounded-0"
                            onClick={() => seleccionarUsuario(u)}
                            style={{ fontSize: 13 }}
                            onMouseEnter={e => e.currentTarget.style.background = "#fff8e1"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            <Av text={av} size={34} bg="#ffc107" color="#000" />
                            <div>
                              <div className="fw-bold text-dark">{u.nombre}</div>
                              <div className="text-secondary" style={{ fontSize: 11 }}>
                                <i className="bi bi-star-fill text-warning me-1" />{pts} puntos disponibles
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {usuarioSel && (
                  <div className="mt-3 p-3 rounded-2 border border-2 border-dark bg-warning d-flex align-items-center gap-3">
                    <Av text={getIniciales(usuarioSel.nombre)} size={44} bg="#000" color="#ffc107" />
                    <div className="flex-grow-1">
                      <div className="fw-black text-dark" style={{ fontSize: 15 }}>{usuarioSel.nombre}</div>
                      <div className="fw-semibold text-dark" style={{ fontSize: 12 }}>Usuario reciclador</div>
                    </div>
                    <div className="text-center">
                      <div className="fw-black text-dark lh-1" style={{ fontSize: 24 }}>
                        {getPtsUsuario(usuarioSel)}
                      </div>
                      <div className="fw-bold text-dark" style={{ fontSize: 10 }}>PUNTOS</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recompensas */}
            <div className="card border border-2 border-dark rounded-3 shadow-sm">
              <div className="card-body p-3">
                <div className="fw-black text-dark mb-3" style={{ fontSize: 15 }}>
                  <i className="bi bi-gift-fill text-warning me-2" />Recompensas disponibles
                </div>

                {loadingRecomp ? (
                  <div className="text-center py-4">
                    <span className="spinner-border text-warning" />
                  </div>
                ) : recompensas.length === 0 ? (
                  <div className="text-center text-secondary py-3" style={{ fontSize: 13 }}>
                    <i className="bi bi-inbox d-block mb-1" style={{ fontSize: 24 }} />
                    No hay recompensas disponibles
                  </div>
                ) : (
                  <div className="row g-2">
                    {recompensas.map((r, idx) => {
                      const activa   = recompSel?.idRecompensa === r.idRecompensa;
                      const ptsR     = getPtsRecompensa(r);
                      const ptsU     = usuarioSel ? getPtsUsuario(usuarioSel) : Infinity;
                      const sinSaldo = usuarioSel && ptsU < ptsR;
                      const color    = r.color ?? COLORES[idx % COLORES.length];
                      const icon     = r.icon  ?? ICONOS[idx % ICONOS.length];
                      const stock    = r.stock ?? r.cantidad ?? "—";
                      return (
                        <div className="col-6" key={r.idRecompensa ?? idx}>
                          <button
                            type="button"
                            onClick={() => { setRecompSel(r); setErrorSaldo(false); setErrorMsg(""); }}
                            disabled={sinSaldo}
                            className={`btn w-100 h-100 d-flex flex-column align-items-start p-3 rounded-2 border-2 fw-bold text-start ${
                              activa ? "bg-warning border-dark text-dark"
                                : sinSaldo ? "btn-outline-secondary opacity-50"
                                : "btn-outline-dark text-dark"
                            }`}
                            style={{ fontSize: 13, minHeight: 90 }}
                          >
                            <div className="d-flex align-items-center gap-2 mb-1 w-100">
                              <div
                                className="d-flex align-items-center justify-content-center rounded-2"
                                style={{ width: 30, height: 30, backgroundColor: color, flexShrink: 0 }}
                              >
                                <i className={`bi ${icon} text-white`} style={{ fontSize: 14 }} />
                              </div>
                              <span style={{ fontSize: 12, lineHeight: 1.2 }}>{r.nombre}</span>
                              {activa && <i className="bi bi-check-circle-fill text-success ms-auto" />}
                            </div>
                            <div className="d-flex align-items-center justify-content-between w-100 mt-1">
                              <span
                                className="badge border border-dark fw-black"
                                style={{ backgroundColor: activa ? "#000" : "#ffc107", color: activa ? "#ffc107" : "#000", fontSize: 11 }}
                              >
                                <i className="bi bi-star-fill me-1" />{ptsR} pts
                              </span>
                              <span className="text-secondary" style={{ fontSize: 10 }}>Stock: {stock}</span>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="col-lg-5">
            <div className="card border border-2 border-dark rounded-3 shadow-sm" style={{ position: "sticky", top: 20 }}>
              <div className="card-body p-3">
                <div className="fw-black text-dark mb-3" style={{ fontSize: 15 }}>
                  <i className="bi bi-receipt-cutoff me-2 text-warning" />Resumen del canje
                </div>

                <div className="mb-2">
                  <div className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: 10, letterSpacing: 1 }}>Usuario</div>
                  <div className="p-2 rounded-2 border border-dark bg-light d-flex align-items-center gap-2" style={{ minHeight: 48 }}>
                    {usuarioSel
                      ? <><Av text={getIniciales(usuarioSel.nombre)} size={30} bg="#ffc107" color="#000" />
                          <span className="fw-bold text-dark" style={{ fontSize: 13 }}>{usuarioSel.nombre}</span></>
                      : <span className="text-secondary" style={{ fontSize: 12 }}>Sin usuario seleccionado</span>}
                  </div>
                </div>

                <div className="mb-2">
                  <div className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: 10, letterSpacing: 1 }}>Recompensa</div>
                  <div className="p-2 rounded-2 border border-dark bg-light d-flex align-items-center gap-2" style={{ minHeight: 48 }}>
                    {recompSel
                      ? <span className="fw-bold text-dark" style={{ fontSize: 13 }}>{recompSel.nombre}</span>
                      : <span className="text-secondary" style={{ fontSize: 12 }}>Sin recompensa seleccionada</span>}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: 10, letterSpacing: 1 }}>Puntos</div>
                  <div className="row g-2">
                    <div className="col-6">
                      <div className="p-2 rounded-2 border border-dark bg-light text-center">
                        <div className="fw-black text-dark" style={{ fontSize: 20 }}>
                          {usuarioSel ? getPtsUsuario(usuarioSel) : "—"}
                        </div>
                        <div className="text-secondary" style={{ fontSize: 10 }}>Disponibles</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className={`p-2 rounded-2 border border-2 border-dark text-center ${recompSel ? "bg-warning" : "bg-light"}`}>
                        <div className="fw-black text-dark" style={{ fontSize: 20 }}>
                          {recompSel ? `- ${getPtsRecompensa(recompSel)}` : "—"}
                        </div>
                        <div className="text-dark" style={{ fontSize: 10 }}>A descontar</div>
                      </div>
                    </div>
                  </div>

                  {usuarioSel && recompSel && (() => {
                    const pU = getPtsUsuario(usuarioSel);
                    const pR = getPtsRecompensa(recompSel);
                    return (
                      <div className={`mt-2 p-2 rounded-2 border border-2 border-dark text-center ${pU >= pR ? "bg-success" : "bg-danger"}`}>
                        <div className="fw-black text-white" style={{ fontSize: 18 }}>
                          {pU - pR} pts restantes
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {errorSaldo && (
                  <div className="alert alert-danger border border-2 border-dark py-2 d-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-exclamation-triangle-fill" />
                    <span style={{ fontSize: 13 }}>Saldo insuficiente para esta recompensa</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="alert alert-danger border border-2 border-dark py-2 d-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-exclamation-triangle-fill" />
                    <span style={{ fontSize: 13 }}>{errorMsg}</span>
                  </div>
                )}

                <div className="d-grid">
                  <button
                    className="btn btn-dark border border-2 border-warning fw-black py-2 d-flex align-items-center justify-content-center gap-2"
                    style={{ fontSize: 14 }}
                    onClick={handleCanjear}
                    disabled={!usuarioSel || !recompSel || loadingCanjear}
                  >
                    {loadingCanjear
                      ? <><span className="spinner-border spinner-border-sm text-warning" /> Procesando...</>
                      : <><i className="bi bi-gift-fill text-warning" /> Canjear recompensa</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historial */}
      {tab === "historial" && (
        <div className="card border border-2 border-dark rounded-3 shadow-sm">
          <div className="card-body p-3">
            <div className="fw-black text-dark mb-3" style={{ fontSize: 15 }}>
              <i className="bi bi-clock-history text-warning me-2" />Historial de canjes
            </div>

            {loadingHistorial ? (
              <div className="text-center py-5">
                <span className="spinner-border text-warning" />
              </div>
            ) : historial.length === 0 ? (
              <div className="text-center text-secondary py-5" style={{ fontSize: 13 }}>
                <i className="bi bi-inbox d-block mb-2" style={{ fontSize: 32 }} />
                No hay canjes registrados
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered border-dark align-middle mb-0" style={{ fontSize: 13 }}>
                  <thead className="bg-dark text-warning">
                    <tr>
                      <th className="fw-black">Usuario</th>
                      <th className="fw-black">Recompensa</th>
                      <th className="fw-black text-center">Puntos</th>
                      <th className="fw-black">Código</th>
                      <th className="fw-black">Fecha</th>
                      <th className="fw-black text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map(h => {
                      const usuario    = h.usuario?.nombre ?? h.usuario ?? "—";
                      const recompensa = h.recompensa?.nombre ?? h.recompensa ?? "—";
                      const pts        = h.puntosUsados ?? h.pts ?? 0;
                      const fecha      = (h.fechaCanje ?? h.createdAt ?? h.fecha ?? "").split("T")[0];
                      const codigo     = h.codigoCanje ?? h.codigo ?? `ECO-${h.idCanje ?? h.id}`;
                      const estado     = h.estadoCanje?.nombre ?? h.estado ?? "Pendiente";

                      return (
                        <tr key={h.idCanje ?? h.id}>
                          <td className="fw-bold">{usuario}</td>
                          <td>{recompensa}</td>
                          <td className="text-center fw-black text-warning">
                            <span className="badge bg-dark border border-warning" style={{ fontSize: 12 }}>
                              <i className="bi bi-star-fill me-1" />{pts}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-light border border-2 border-dark text-dark fw-black" style={{ fontSize: 11, letterSpacing: 1 }}>
                              <i className="bi bi-upc me-1" />{codigo}
                            </span>
                          </td>
                          <td className="text-secondary">{fecha}</td>
                          <td className="text-center"><BadgeCanje estado={estado} /></td>
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

      {/* Modal comprobante */}
      {comprobante && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 999 }}
          onClick={() => setComprobante(null)}
        >
          <div
            className="bg-white border border-3 border-dark rounded-3 shadow-lg p-4 text-center"
            style={{ maxWidth: 340, width: "90%" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: 64, height: 64 }}>
              <i className="bi bi-check-lg text-white" style={{ fontSize: 32 }} />
            </div>
            <div className="fw-black text-dark mb-1" style={{ fontSize: 18 }}>¡Canje exitoso!</div>
            <div className="text-secondary mb-3" style={{ fontSize: 13 }}>Comprobante generado</div>
            <div className="bg-warning border border-2 border-dark rounded-2 p-3 mb-3">
              <div className="fw-bold text-dark" style={{ fontSize: 12 }}>CÓDIGO DE COMPROBANTE</div>
              <div className="fw-black text-dark" style={{ fontSize: 26, letterSpacing: 3 }}>{comprobante.codigo}</div>
            </div>
            <div className="text-start border border-dark rounded-2 p-3 mb-3" style={{ fontSize: 13 }}>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-secondary">Usuario</span>
                <span className="fw-bold">{comprobante.usuario}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-secondary">Recompensa</span>
                <span className="fw-bold">{comprobante.recompensa}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-secondary">Puntos descontados</span>
                <span className="fw-black text-danger">-{comprobante.pts} pts</span>
              </div>
            </div>
            <button
              className="btn btn-dark border border-2 border-warning fw-black w-100"
              onClick={() => setComprobante(null)}
            >
              <i className="bi bi-check2 me-2 text-warning" />Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}