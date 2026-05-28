import { useState, useEffect } from "react";
import { C, S, Av, BadgeCanje, getIniciales, getPtsUsuario, getPtsRecompensa, capitalizar } from "./encargadoTheme";
import { buscarUsuariosEncargado, getEntregasEncargadoPorUsuario, getRecompensasEncargado, getCanjesEncargado, registrarCanjeEncargado, actualizarEstadoCanjeEncargado } from "../../services/api";

const MATERIAL_ICON = {
  Papel:    { icon: "bi-file-earmark",  bg: "#fff3cd",   color: "#856404"      },
  Cartón:   { icon: "bi-box-seam",      bg: C.verdeClaro, color: C.verdeOscuro },
  Vidrio:   { icon: "bi-cup-straw",     bg: "#e3f2fd",   color: "#1565c0"      },
  Plástico: { icon: "bi-bag",           bg: "#f3e5f5",   color: "#6a1b9a"      },
};

export default function Canjes() {
  const [tab,           setTab]           = useState("canjear");
  const [busqueda,      setBusqueda]      = useState("");
  const [usuarioSel,    setUsuarioSel]    = useState(null);
  const [recompSel,     setRecompSel]     = useState(null);
  const [comprobante,   setComprobante]   = useState(null);
  const [mostrarDrop,   setMostrarDrop]   = useState(false);

  const [usuarios,      setUsuarios]      = useState([]);
  const [entregas,      setEntregas]      = useState([]);
  const [recompensas,   setRecompensas]   = useState([]);
  const [historial,     setHistorial]     = useState([]);
  const [cargando,      setCargando]      = useState({});
  const [error,         setError]         = useState(null);

  useEffect(() => {
    cargarRecompensas();
    cargarHistorial();
  }, []);

  useEffect(() => {
    if (busqueda.trim().length > 0) {
      const t = setTimeout(() => cargarUsuarios(busqueda), 300);
      return () => clearTimeout(t);
    }
    setUsuarios([]);
  }, [busqueda]);

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

  const cargarUsuarios = async (q) => {
    setCargando((p) => ({ ...p, usuarios: true }));
    try {
      const data = await buscarUsuariosEncargado(q);
      setUsuarios(data.usuarios ?? []);
    } catch (err) {
      setUsuarios([]);
      setError(err.message);
      setTimeout(() => setError(null), 4000);
    } finally {
      setCargando((p) => ({ ...p, usuarios: false }));
    }
  };

  const cargarEntregas = async (id) => {
    setCargando((p) => ({ ...p, entregas: true }));
    try {
      const data = await getEntregasEncargadoPorUsuario(id);
      setEntregas(data.entregas ?? []);
    } catch {
      setEntregas([]);
    } finally {
      setCargando((p) => ({ ...p, entregas: false }));
    }
  };

  const usuariosFiltrados = busqueda.trim().length > 0 && !usuarioSel ? usuarios : [];

  const seleccionarUsuario = (u) => {
    setUsuarioSel(u);
    setBusqueda(u.nombre);
    setMostrarDrop(false);
    setRecompSel(null);
  };

  const limpiar = () => {
    setBusqueda(""); setUsuarioSel(null);
    setRecompSel(null); setMostrarDrop(false);
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
      }));
    }
    return [{
      id: `e${e.idEntrega}`,
      material: "Material",
      kg: e.pesoTotal ?? 0,
      puntos: e.puntosTotales ?? 0,
      fecha,
    }];
  });

  const ptsEntregas = entregasFlat.reduce((a, e) => a + e.puntos, 0);
  const ptsUsuario  = usuarioSel ? getPtsUsuario(usuarioSel) : 0;
  const recompensasDisponibles = recompensas.filter((r) => !usuarioSel || ptsUsuario >= getPtsRecompensa(r));
  const recompensasNoDisponibles = recompensas.filter((r) => usuarioSel && ptsUsuario < getPtsRecompensa(r));

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
    } catch (err) {
      setError(err.message);
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
                  <i className="bi bi-person" style={{ color: C.verde }} />Buscar usuario
                </div>
                <div className="fw-semibold mb-3" style={{ fontSize: 12, color: C.grisTexto }}>Escribe el nombre del reciclador</div>

                <div className="position-relative">
                  <div className="input-group">
                    <span className="input-group-text bg-white" style={{ border: `1.5px solid ${C.verdeBorde}` }}>
                      <i className="bi bi-search text-secondary" />
                    </span>
                    <input type="text" className="form-control" placeholder="Ej: Diego Ramírez"
                      value={busqueda}
                      style={{ ...S.input, fontSize: 13 }}
                      onChange={(e) => { setBusqueda(e.target.value); setUsuarioSel(null); setMostrarDrop(true); }}
                    />
                    {busqueda && (
                      <button className="btn btn-outline-secondary" style={{ border: `1.5px solid ${C.verdeBorde}` }} onClick={limpiar}>
                        <i className="bi bi-x-lg" />
                      </button>
                    )}
                  </div>

                  {mostrarDrop && usuariosFiltrados.length > 0 && (
                    <div className="position-absolute w-100 bg-white rounded-3 shadow mt-1" style={{ zIndex: 99, border: `1.5px solid ${C.verdeBorde}` }}>
                      {usuariosFiltrados.map((u) => (
                        <button key={u.idUsuario}
                          className="btn w-100 d-flex align-items-center gap-3 px-3 py-2 text-start border-0 rounded-0"
                          onClick={() => seleccionarUsuario(u)} style={{ fontSize: 13 }}
                          onMouseEnter={(e) => e.currentTarget.style.background = C.verdeClaro}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                          <Av text={getIniciales(u.nombre)} size={34} />
                          <div>
                            <div className="fw-bold" style={{ color: C.negro }}>{u.nombre}</div>
                            <div style={{ fontSize: 11, color: C.grisTexto }}>
                              <i className="bi bi-star-fill me-1" style={{ color: C.verde }} />
                              {u.puntosDisponibles} puntos disponibles
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {mostrarDrop && busqueda.trim().length > 0 && usuariosFiltrados.length === 0 && !cargando.usuarios && (
                    <div className="position-absolute w-100 bg-white rounded-3 shadow mt-1 px-3 py-2"
                      style={{ zIndex: 99, border: `1.5px solid ${C.verdeBorde}`, fontSize: 13, color: C.grisTexto }}>
                      Sin resultados para "{busqueda}"
                    </div>
                  )}

                  {mostrarDrop && cargando.usuarios && (
                    <div className="position-absolute w-100 bg-white rounded-3 shadow mt-1 px-3 py-2 text-center"
                      style={{ zIndex: 99, border: `1.5px solid ${C.verdeBorde}`, fontSize: 13, color: C.grisTexto }}>
                      <div className="spinner-border spinner-border-sm me-2" role="status" />Buscando...
                    </div>
                  )}
                </div>

                {usuarioSel && (
                  <div className="mt-3 p-3 rounded-3 d-flex align-items-center gap-3" style={S.chipUsuario}>
                    <Av text={getIniciales(usuarioSel.nombre)} size={44} />
                    <div className="flex-grow-1">
                      <div className="fw-bold" style={{ fontSize: 14, color: C.negro }}>{usuarioSel.nombre}</div>
                      <div style={{ fontSize: 12, color: C.grisTexto }}>Usuario reciclador</div>
                    </div>
                    <div className="text-center">
                      <div className="fw-bold lh-1" style={{ fontSize: 22, color: C.verdeOscuro }}>{ptsUsuario}</div>
                      <div style={{ fontSize: 10, color: C.grisTexto }}>PUNTOS</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {usuarioSel && entregasFlat.length > 0 && (
              <div className="card mb-3" style={S.card}>
                <div className="card-body p-3">
                  <div className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize: 14, color: C.negro }}>
                    <i className="bi bi-recycle" style={{ color: C.verde }} />
                    Entregas de {usuarioSel.nombre.split(" ")[0]}
                  </div>
                  {entregasFlat.map((e) => {
                    const m = MATERIAL_ICON[e.material] ?? { icon: "bi-recycle", bg: C.verdeClaro, color: C.verdeOscuro };
                    return (
                      <div key={e.id} className="d-flex align-items-center gap-3 py-2"
                        style={{ borderBottom: `1px solid ${C.verdeClaro}` }}>
                        <div className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                          style={{ width: 36, height: 36, backgroundColor: m.bg, color: m.color }}>
                          <i className={`bi ${m.icon}`} style={{ fontSize: 16 }} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-bold" style={{ fontSize: 13, color: C.negro }}>{e.material}</div>
                          <div style={{ fontSize: 11, color: C.grisTexto }}>{e.fecha} · {e.kg} kg</div>
                        </div>
                        <span style={S.badgePuntos}>+{e.puntos} pts</span>
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
                  <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: C.verde }} />
                  <span style={{ fontSize: 13, color: C.grisTexto }}>Cargando entregas...</span>
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
                    <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: C.verde }} />
                    <span style={{ fontSize: 13, color: C.grisTexto }}>Cargando recompensas...</span>
                  </div>
                ) : !usuarioSel && (
                  <div className="row g-2 mt-2">
                    {recompensas.map((r) => (
                      <div className="col-6" key={r.idRecompensa}>
                        <div className="p-3 rounded-2 d-flex flex-column gap-1"
                          style={{ border: `1.5px solid ${C.verdeBorde}`, backgroundColor: C.grisFondo }}>
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-gift" style={{ color: C.verdeMedio, fontSize: 15 }} />
                            <span className="fw-bold" style={{ fontSize: 12, color: C.negro }}>{r.nombre}</span>
                          </div>
                          <div className="d-flex align-items-center justify-content-between mt-1">
                            <span style={S.badgePuntos}><i className="bi bi-star me-1" />{r.puntosRequeridos} pts</span>
                            <span style={{ fontSize: 10, color: C.grisTexto }}>Stock: {r.stock ?? "∞"}</span>
                          </div>
                          {r.aliado && <div style={{ fontSize: 10, color: C.grisTexto }}><i className="bi bi-shop me-1" />{r.aliado}</div>}
                        </div>
                      </div>
                    ))}
                    {recompensas.length === 0 && (
                      <div className="text-center py-3" style={{ fontSize: 13, color: C.grisTexto }}>
                        <i className="bi bi-inbox d-block mb-1" style={{ fontSize: 22 }} />No hay recompensas disponibles
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
                        <div className="row g-2">
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
                </div>

                <div className="d-grid">
                  <button onClick={handleCanjear}
                    disabled={!usuarioSel || !recompSel || ptsUsuario < (recompSel ? getPtsRecompensa(recompSel) : 0)}
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
                <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: C.verde }} />
                <span style={{ fontSize: 13, color: C.grisTexto }}>Cargando historial...</span>
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
