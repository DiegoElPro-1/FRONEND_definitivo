import { useState, useEffect, useCallback, useRef } from "react";
import { C, S, Av, StatCard, getIniciales } from "./encargadoTheme";
import {
  getEntregasEncargado,
  getEntregasEncargadoPorUsuario,
  getCanjesEncargado,
  getReportesEncargado,
  getRecompensasEncargado,
  buscarUsuariosEncargado,
  actualizarEstadoEntregaEncargado,
} from "../../services/api";

const MAT_ICON = {
  Plástico: "bi-bag", Cartón: "bi-box-seam", Vidrio: "bi-cup-straw",
  Papel: "bi-file-earmark", Metal: "bi-tools", Electrónico: "bi-cpu",
};

export default function PanelControl() {
  const [entregas, setEntregas]             = useState([]);
  const [alertas, setAlertas]               = useState([]);
  const [usuariosPunto, setUsuariosPunto]   = useState([]);
  const [entregasUsuario, setEntregasUsuario] = useState({});
  const [busqueda, setBusqueda]             = useState("");
  const [usuarioExpandido, setUsuarioExpandido] = useState(null);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [cargandoEntregasUsuario, setCargandoEntregasUsuario] = useState(false);
  const [toast, setToast]                   = useState(null);
  const [kpiData, setKpiData]               = useState({ usuarios: 0, entregasPendientes: 0, canjesHoy: 0, ptsEntregados: 0 });
  const [resumenTurno, setResumenTurno]     = useState({ procesadas: 0, kg: 0, canjes: 0, pts: 0 });
  const [topUsuarios, setTopUsuarios]       = useState([]);
  const searchTimer = useRef(null);

  const showToast = (msg, tipo = "success") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const buscarUsuarios = useCallback(async (q) => {
    setCargandoUsuarios(true);
    try {
      const data = await buscarUsuariosEncargado(q);
      const lista = data.usuarios ?? data ?? [];
      setUsuariosPunto(lista.map(u => ({
        id: u.idUsuario,
        nombre: u.nombre,
        av: getIniciales(u.nombre),
        correo: u.correo,
        pts: u.puntosDisponibles ?? 0,
      })));
    } catch (_) {
      setUsuariosPunto([]);
    }
    setCargandoUsuarios(false);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setBusqueda(val);
    setUsuarioExpandido(null);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      buscarUsuarios(val);
    }, 300);
  };

  const cargarData = useCallback(async () => {
    try {
      const [dataEntregas, dataCanjes, dataReportes, dataRecompensas] = await Promise.all([
        getEntregasEncargado().catch(() => ({ entregas: [] })),
        getCanjesEncargado().catch(() => ({ canjes: [] })),
        getReportesEncargado('Este mes').catch(() => ({})),
        getRecompensasEncargado().catch(() => ({ recompensas: [] })),
      ]);

      const listaEntregas = dataEntregas.entregas ?? dataEntregas ?? [];
      const listaCanjes = dataCanjes.canjes ?? dataCanjes ?? [];
      const listaRecompensas = dataRecompensas.recompensas ?? dataRecompensas ?? [];
      const reporte = dataReportes;

      const pendientes = listaEntregas.filter(e =>
        e.idEstadoEntrega === undefined || e.idEstadoEntrega === null || e.idEstadoEntrega === 1
      );
      setEntregas(pendientes);

      const canjesHoy = listaCanjes.filter(c => {
        if (!c.fechaCanje && !c.fecha) return false;
        const hoy = new Date();
        const fechaC = new Date(c.fechaCanje ?? c.fecha);
        return fechaC.toDateString() === hoy.toDateString();
      }).length;

      const procesadas = listaEntregas.filter(e => e.idEstadoEntrega === 2).length;
      const kgTotal = listaEntregas.reduce((s, e) => s + Number(e.pesoTotal ?? e.peso ?? e.cantidadKg ?? 0), 0);
      const ptsTotal = listaEntregas.reduce((s, e) => s + Number(e.puntosTotales ?? e.puntos ?? e.puntosOtorgados ?? 0), 0);

      setKpiData({
        usuarios: reporte?.kpis?.usuariosActivos ?? 0,
        entregasPendientes: pendientes.length,
        canjesHoy,
        ptsEntregados: reporte?.kpis?.totalPtsEntregados ?? ptsTotal,
      });

      setResumenTurno({
        procesadas,
        kg: Math.round(kgTotal * 10) / 10,
        canjes: reporte?.kpis?.totalCanjes ?? listaCanjes.length,
        pts: reporte?.kpis?.totalPtsEntregados ?? ptsTotal,
      });

      setTopUsuarios((reporte?.rankingUsuarios ?? []).slice(0, 3).map(u => ({
        id: u.nombre,
        nombre: u.nombre,
        av: u.iniciales,
        pts: u.pts,
      })));

      const alertasGen = [];
      for (const r of listaRecompensas) {
        if (r.stock !== undefined && r.stock <= (r.stockMinimo ?? 5)) {
          alertasGen.push({
            id: `stock-${r.idRecompensa}`,
            icon: "bi-exclamation-triangle-fill",
            color: C.rojo,
            msg: `Stock de '${(r.nombre || r.titulo || 'desconocido')}' bajo (${r.stock} unidades)`,
          });
        }
      }
      if (pendientes.length > 0) {
        alertasGen.push({
          id: "pendientes",
          icon: "bi-clock-fill",
          color: "#f9a825",
          msg: `${pendientes.length} entregas sin procesar`,
        });
      }
      setAlertas(alertasGen);

    } catch (_) {
      showToast("Error al cargar datos del panel", "error");
    }
  }, []);

  useEffect(() => { cargarData(); }, [cargarData]);

  const procesarEntrega = async (id) => {
    try {
      await actualizarEstadoEntregaEncargado(id, 2);
      setEntregas(prev => prev.filter(e => e.idEntrega !== id && e.id !== id));
      showToast("Entrega procesada correctamente");
    } catch (_) {
      showToast("Error al procesar la entrega", "error");
    }
  };

  const cerrarAlerta = (id) => setAlertas(prev => prev.filter(a => a.id !== id));

  const expandirUsuario = async (id) => {
    if (usuarioExpandido === id) {
      setUsuarioExpandido(null);
      return;
    }
    setUsuarioExpandido(id);
    if (!entregasUsuario[id]) {
      setCargandoEntregasUsuario(true);
      try {
        const data = await getEntregasEncargadoPorUsuario(id);
        const lista = data.entregas ?? data ?? [];
        setEntregasUsuario(prev => ({ ...prev, [id]: lista }));
      } catch (_) {
        setEntregasUsuario(prev => ({ ...prev, [id]: [] }));
      }
      setCargandoEntregasUsuario(false);
    }
  };

  const getMaterialIcon = (mat) => MAT_ICON[mat] || "bi-recycle";

  return (
    <div style={{ position: "relative" }}>
      {toast && (
        <div className="position-fixed d-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-lg fw-bold"
          style={{ bottom: 24, right: 24, zIndex: 9999, backgroundColor: toast.tipo === "success" ? C.verde : C.rojo, color: "#fff", fontSize: 13, border: `1.5px solid ${C.verdeBorde}` }}>
          <i className={`bi ${toast.tipo === "success" ? "bi-check-circle-fill" : "bi-x-circle-fill"}`} />
          {toast.msg}
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><StatCard icon="bi-people-fill"   label="Usuarios encontrados" valor={usuariosPunto.length}   sub="esta búsqueda" /></div>
        <div className="col-6 col-lg-3"><StatCard icon="bi-box-seam-fill" label="Entregas pendientes"   valor={kpiData.entregasPendientes} sub="sin procesar"    /></div>
        <div className="col-6 col-lg-3"><StatCard icon="bi-gift-fill"     label="Canjes hoy"            valor={kpiData.canjesHoy}        sub="completados"     /></div>
        <div className="col-6 col-lg-3"><StatCard icon="bi-star-fill"     label="Puntos del mes"        valor={kpiData.ptsEntregados}    sub="entregados"      /></div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8 d-flex flex-column gap-4">

          <div className="card" style={S.card}>
            <div className="card-body p-3">
              <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div className="fw-bold text-dark" style={{ fontSize: 15 }}>
                  <i className="bi bi-people-fill me-2" style={{ color: C.verde }} />Buscar usuarios
                </div>
                <div className="input-group" style={{ maxWidth: 240 }}>
                  <span className="input-group-text bg-white" style={{ border: `1.5px solid ${C.verdeBorde}` }}>
                    <i className="bi bi-search text-secondary" />
                  </span>
                  <input type="text" className="form-control" placeholder="Nombre o correo..."
                    value={busqueda} onChange={handleSearchChange}
                    style={{ ...S.input, fontSize: 13 }} />
                </div>
              </div>

              <div className="d-flex flex-column gap-2" style={{ minHeight: 60 }}>
                {cargandoUsuarios ? (
                  <div className="text-center py-3">
                    <span className="spinner-border spinner-border-sm text-success me-2" />
                    <span style={{ fontSize: 12, color: C.grisTexto }}>Buscando...</span>
                  </div>
                ) : !busqueda.trim() ? (
                  <div className="text-center py-4 text-secondary" style={{ fontSize: 13 }}>
                    <i className="bi bi-search d-block mb-1" style={{ fontSize: 24 }} />
                    Escribe un nombre o correo para buscar
                  </div>
                ) : usuariosPunto.length === 0 ? (
                  <div className="text-center py-4 text-secondary" style={{ fontSize: 13 }}>
                    <i className="bi bi-person-x d-block mb-1" style={{ fontSize: 24 }} />
                    Sin resultados para "{busqueda}"
                  </div>
                ) : (
                  usuariosPunto.map(u => {
                    const expandido = usuarioExpandido === u.id;
                    const entregasU = entregasUsuario[u.id] ?? [];
                    return (
                      <div key={u.id} className="rounded-2 bg-white overflow-hidden" style={{ border: `1.5px solid ${expandido ? C.verde : C.verdeBorde}` }}>
                        <div className="d-flex align-items-center gap-3 p-2">
                          <Av text={u.av} size={38} />
                          <div className="flex-grow-1">
                            <div className="fw-bold text-dark" style={{ fontSize: 13 }}>{u.nombre}</div>
                            <div style={{ fontSize: 11, color: C.grisTexto }}>
                              <i className="bi bi-star-fill me-1" style={{ color: C.verde }} />{u.pts} pts
                            </div>
                          </div>
                          <button onClick={() => expandirUsuario(u.id)}
                            className="btn fw-bold d-flex align-items-center gap-1"
                            style={{ fontSize: 11, border: `1.5px solid ${C.verdeBorde}`, backgroundColor: expandido ? C.verdeClaro : "#fff", color: C.verdeOscuro, padding: "4px 12px" }}>
                            <i className={`bi ${expandido ? "bi-chevron-up" : "bi-eye"}`} />
                            {expandido ? "Cerrar" : "Ver más"}
                          </button>
                        </div>

                        {expandido && (
                          <div style={{ borderTop: `1px solid ${C.verdeBorde}`, backgroundColor: C.grisFondo }}>
                            <div className="p-3">
                              <div className="d-flex gap-3 mb-3 flex-wrap">
                                <div className="flex-grow-1 p-2 rounded-2 text-center bg-white" style={{ border: `1px solid ${C.verdeBorde}` }}>
                                  <div className="fw-bold" style={{ fontSize: 18, color: C.verdeOscuro }}>{u.pts}</div>
                                  <div style={{ fontSize: 10, color: C.grisTexto }}>Puntos disponibles</div>
                                </div>
                                <div className="flex-grow-1 p-2 rounded-2 text-center bg-white" style={{ border: `1px solid ${C.verdeBorde}` }}>
                                  <div className="fw-bold" style={{ fontSize: 18, color: C.verdeOscuro }}>{entregasU.length}</div>
                                  <div style={{ fontSize: 10, color: C.grisTexto }}>Últimas entregas</div>
                                </div>
                              </div>

                              {cargandoEntregasUsuario && (
                                <div className="text-center py-2">
                                  <span className="spinner-border spinner-border-sm text-success me-2" />
                                  <span style={{ fontSize: 12, color: C.grisTexto }}>Cargando entregas...</span>
                                </div>
                              )}

                              {!cargandoEntregasUsuario && entregasU.length > 0 && (
                                <>
                                  <div className="fw-bold mb-2" style={{ fontSize: 11, color: C.verdeOscuro }}>
                                    <i className="bi bi-clock-history me-1" />Últimas entregas
                                  </div>
                                  {entregasU.map((e, i) => {
                                    const det = e.detalles?.[0];
                                    const material = det?.material?.nombre ?? e.material ?? "";
                                    const icono = getMaterialIcon(material);
                                    return (
                                      <div key={i} className="d-flex align-items-center gap-2 py-1 px-2 rounded-1 mb-1 bg-white" style={{ border: `1px solid ${C.verdeBorde}` }}>
                                        <i className={`bi ${icono}`} style={{ color: C.verde, fontSize: 12 }} />
                                        <span className="fw-semibold" style={{ fontSize: 12, color: C.negro, flex: 1 }}>{material}</span>
                                        <span style={{ fontSize: 11, color: C.grisTexto }}>{det?.peso ?? e.peso ?? e.cantidadKg ?? 0} kg</span>
                                        <span className="fw-bold" style={{ fontSize: 11, color: C.verde }}>+{det?.puntosGenerados ?? e.puntos ?? e.puntosOtorgados ?? 0} pts</span>
                                        <span style={{ fontSize: 10, color: C.grisTexto }}>{e.fechaRegistro ? new Date(e.fechaRegistro).toLocaleDateString("es-CO") : e.fecha ?? ""}</span>
                                      </div>
                                    );
                                  })}
                                </>
                              )}

                              {!cargandoEntregasUsuario && entregasU.length === 0 && (
                                <div className="text-center py-2 text-secondary" style={{ fontSize: 12 }}>
                                  Sin entregas registradas
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="card" style={S.card}>
            <div className="card-body p-3">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="fw-bold text-dark" style={{ fontSize: 15 }}>
                  <i className="bi bi-box-seam-fill me-2" style={{ color: C.verde }} />Entregas pendientes
                </div>
                {entregas.length > 0 && (
                  <span className="badge fw-bold" style={{ fontSize: 11, backgroundColor: C.rojo, color: "#fff" }}>
                    {entregas.length} sin atender
                  </span>
                )}
              </div>

              {entregas.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-check-circle-fill" style={{ fontSize: 42, color: C.verde }} />
                  <div className="fw-bold text-dark mt-2" style={{ fontSize: 15 }}>¡Todo al día!</div>
                  <div className="text-secondary" style={{ fontSize: 12 }}>No hay entregas pendientes</div>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {entregas.map(e => {
                    const id = e.idEntrega ?? e.id;
                    const det = e.detalles?.[0];
                    const material = det?.material?.nombre ?? e.material ?? "";
                    const pts = e.puntosTotales ?? e.puntos ?? e.puntosOtorgados ?? 0;
                    return (
                      <div key={id} className="rounded-2 bg-white overflow-hidden" style={{ border: `1.5px solid ${C.verdeBorde}` }}>
                        <div className="d-flex align-items-center gap-3 p-2">
                          <Av text={getIniciales(e.usuario?.nombre ?? "")} size={38} />
                          <div className="flex-grow-1">
                            <div className="fw-bold text-dark" style={{ fontSize: 13 }}>{e.usuario?.nombre}</div>
                            <div className="text-secondary" style={{ fontSize: 11 }}>
                              <i className="bi bi-recycle me-1" style={{ color: C.verde }} />
                              {material} · {e.pesoTotal ?? e.peso ?? e.cantidadKg ?? 0} kg · {e.fechaRegistro ? new Date(e.fechaRegistro).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : ""}
                            </div>
                          </div>
                          <button className="btn fw-bold d-flex align-items-center gap-1" style={{ ...S.btnPrimario, fontSize: 11, padding: "5px 12px", whiteSpace: "nowrap" }} onClick={() => procesarEntrega(id)}>
                            <i className="bi bi-check2" /> Procesar
                          </button>
                        </div>
                        {pts > 0 && (
                          <div className="px-3 py-1" style={{ backgroundColor: C.grisFondo, borderTop: `1px solid ${C.verdeBorde}` }}>
                            <span className="badge fw-bold" style={{ backgroundColor: C.verdeClaro, color: C.verdeOscuro, fontSize: 10, border: `1px solid ${C.verdeBorde}` }}>
                              <i className="bi bi-star-fill me-1" />{pts} pts
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4 d-flex flex-column gap-4">

          <div className="card" style={S.card}>
            <div className="card-body p-3">
              <div className="fw-bold text-dark mb-3" style={{ fontSize: 15 }}>
                <i className="bi bi-bell-fill me-2" style={{ color: C.verde }} />Alertas del punto
                {alertas.length > 0 && <span className="badge fw-bold ms-2" style={{ fontSize: 10, backgroundColor: C.verdeClaro, color: C.verdeOscuro, border: `1px solid ${C.verdeBorde}` }}>{alertas.length}</span>}
              </div>
              {alertas.length === 0 ? (
                <div className="text-center py-3 text-secondary" style={{ fontSize: 13 }}>
                  <i className="bi bi-check-circle-fill me-2" style={{ color: C.verde }} />Sin alertas activas
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {alertas.map(a => (
                    <div key={a.id} className="d-flex align-items-start gap-2 p-2 rounded-2 bg-white" style={{ border: `1px solid ${C.verdeBorde}` }}>
                      <i className={`bi ${a.icon} flex-shrink-0 mt-1`} style={{ color: a.color, fontSize: 13 }} />
                      <span className="flex-grow-1 text-dark" style={{ fontSize: 12 }}>{a.msg}</span>
                      <button className="btn p-0 border-0 bg-transparent" onClick={() => cerrarAlerta(a.id)}>
                        <i className="bi bi-x-lg text-secondary" style={{ fontSize: 12 }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card" style={S.card}>
            <div className="card-body p-3">
              <div className="fw-bold text-dark mb-3" style={{ fontSize: 15 }}>
                <i className="bi bi-trophy-fill me-2" style={{ color: C.verde }} />Usuarios más activos
              </div>
              <div className="d-flex flex-column gap-2">
                {topUsuarios.length === 0 ? (
                  <div className="text-center py-3 text-secondary" style={{ fontSize: 13 }}>
                    <i className="bi bi-emoji-neutral d-block mb-1" style={{ fontSize: 24 }} />
                    Busca usuarios para ver el ranking
                  </div>
                ) : (
                  topUsuarios.map((u, i) => (
                    <div key={u.id} className="d-flex align-items-center gap-2 p-2 rounded-2 bg-white" style={{ border: `1px solid ${C.verdeBorde}` }}>
                      <span className="fw-bold d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                        style={{ width: 24, height: 24, fontSize: 11, backgroundColor: i === 0 ? C.verde : C.grisFondo, color: i === 0 ? "#fff" : C.negro, border: `1px solid ${C.verdeBorde}` }}>
                        {i + 1}
                      </span>
                      <Av text={u.av} size={32} />
                      <div className="flex-grow-1">
                        <div className="fw-bold text-dark" style={{ fontSize: 12 }}>{u.nombre}</div>
                        <div className="text-secondary" style={{ fontSize: 10 }}>{u.pts} pts</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="card" style={{ ...S.card, backgroundColor: C.verdeClaro }}>
            <div className="card-body p-3">
              <div className="fw-bold mb-3" style={{ fontSize: 15, color: C.verdeOscuro }}>
                <i className="bi bi-clock-history me-2" />Resumen del turno
              </div>
              <div className="d-flex flex-column gap-2">
                {[
                  { icon: "bi-box-seam-fill", label: "Entregas procesadas", value: resumenTurno.procesadas },
                  { icon: "bi-recycle",        label: "Kg recolectados",     value: `${resumenTurno.kg} kg` },
                  { icon: "bi-gift-fill",      label: "Canjes realizados",   value: resumenTurno.canjes },
                  { icon: "bi-star-fill",      label: "Puntos entregados",   value: resumenTurno.pts },
                ].map((item, i) => (
                  <div key={i} className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <i className={`bi ${item.icon}`} style={{ color: C.verde, fontSize: 13 }} />
                      <span style={{ fontSize: 12, color: C.verdeOscuro }}>{item.label}</span>
                    </div>
                    <span className="fw-bold" style={{ fontSize: 13, color: C.verdeOscuro }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
