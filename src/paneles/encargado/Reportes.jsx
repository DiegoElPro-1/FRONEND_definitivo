import { useState, useEffect } from "react";
import { C, S, Av } from "./encargadoTheme";
import { getReportesEncargado } from "../../services/api";

const PERIODOS = ["Esta semana", "Este mes", "Este año"];

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.kg), 1);
  return (
    <div className="d-flex align-items-end gap-2 w-100" style={{ height: 140 }}>
      {data.map((d, i) => (
        <div key={i} className="d-flex flex-column align-items-center flex-grow-1 gap-1">
          <span className="fw-bold text-dark" style={{ fontSize: 10 }}>{d.kg}</span>
          <div className="w-100 rounded-top" style={{ height: `${(d.kg / max) * 110}px`, backgroundColor: i === data.length - 1 ? C.verde : C.verdeOscuro, border: `1px solid ${C.verdeBorde}` }} />
          <span className="fw-bold text-secondary" style={{ fontSize: 11 }}>{d.mes}</span>
        </div>
      ))}
    </div>
  );
}

export default function Reportes() {
  const [periodo, setPeriodo] = useState("Este mes");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargar = async (p) => {
    setLoading(true);
    try {
      const res = await getReportesEncargado(p);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar(periodo);
  }, [periodo]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: C.verde }} role="status" />
        <div className="mt-2 text-secondary" style={{ fontSize: 13 }}>Cargando reportes...</div>
      </div>
    );
  }

  const kpis = data?.kpis ?? {};
  const materialesMes = data?.materialesMes ?? [];
  const canjesRecompensa = data?.canjesRecompensa ?? [];
  const ranking = data?.rankingUsuarios ?? [];
  const puntos = data?.puntos ?? { entregados: 0, canjeados: 0, disponibles: 0, tasaCanje: 0 };
  const maxCanjes = Math.max(...canjesRecompensa.map(c => c.cantidad), 1);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div className="text-secondary fw-semibold" style={{ fontSize: 13 }}>
          <i className="bi bi-calendar3 me-2" style={{ color: C.verde }} />
          Mostrando datos de: <span className="fw-bold text-dark">{periodo}</span>
        </div>
        <div className="d-flex gap-2">
          {PERIODOS.map(p => (
            <button key={p} onClick={() => setPeriodo(p)} className="btn fw-bold"
              style={{ fontSize: 12, ...(periodo === p ? S.btnPrimario : S.btnSecundario) }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="row g-3 mb-4">
        {[
          { icon: "bi-recycle",     label: "Total kg recolectados", value: `${(kpis.totalKg ?? 0).toLocaleString()} kg`, sub: "en el periodo" },
          { icon: "bi-star-fill",   label: "Puntos entregados",     value: (kpis.totalPtsEntregados ?? 0).toLocaleString(), sub: "acumulados" },
          { icon: "bi-gift-fill",   label: "Canjes realizados",     value: kpis.totalCanjes ?? 0, sub: "en el periodo" },
          { icon: "bi-people-fill", label: "Usuarios activos",      value: kpis.usuariosActivos ?? 0, sub: "recicladores" },
        ].map((r, i) => (
          <div key={i} className="col-6 col-lg-3">
            <div className="card h-100" style={S.card}>
              <div className="card-body p-3">
                <i className={`bi ${r.icon} d-block mb-2`} style={{ fontSize: 22, color: C.verde }} />
                <div className="fw-bold text-dark lh-1 mb-1" style={{ fontSize: 26 }}>{r.value}</div>
                <div className="fw-bold text-dark" style={{ fontSize: 12 }}>{r.label}</div>
                <div className="text-secondary" style={{ fontSize: 10 }}>{r.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card h-100" style={S.card}>
            <div className="card-body p-3">
              <div className="fw-bold text-dark mb-1" style={{ fontSize: 15 }}>
                <i className="bi bi-bar-chart-fill me-2" style={{ color: C.verde }} />Materiales recolectados (kg)
              </div>
              <div className="text-secondary mb-3" style={{ fontSize: 11 }}>Últimos 5 meses · barra más oscura = mes actual</div>
              {materialesMes.length > 0 ? <BarChart data={materialesMes} /> : (
                <div className="text-center py-4 text-secondary" style={{ fontSize: 13 }}>
                  <i className="bi bi-inbox d-block mb-1" style={{ fontSize: 22 }} />Sin datos
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card h-100" style={S.card}>
            <div className="card-body p-3">
              <div className="fw-bold text-dark mb-1" style={{ fontSize: 15 }}>
                <i className="bi bi-gift-fill me-2" style={{ color: C.verde }} />Canjes por recompensa
              </div>
              <div className="text-secondary mb-3" style={{ fontSize: 11 }}>Ranking del periodo</div>
              {canjesRecompensa.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {canjesRecompensa.map((c, i) => (
                    <div key={i}>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-bold text-dark" style={{ fontSize: 12 }}>{c.recompensa}</span>
                        <span className="fw-bold text-dark" style={{ fontSize: 12 }}>{c.cantidad}</span>
                      </div>
                      <div className="rounded-pill overflow-hidden" style={{ height: 10, backgroundColor: C.grisFondo, border: `1px solid ${C.verdeBorde}` }}>
                        <div className="h-100 rounded-pill" style={{ width: `${(c.cantidad / maxCanjes) * 100}%`, backgroundColor: i === 0 ? C.verde : C.verdeOscuro }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-secondary" style={{ fontSize: 13 }}>
                  <i className="bi bi-inbox d-block mb-1" style={{ fontSize: 22 }} />Sin canjes en este periodo
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card" style={S.card}>
            <div className="card-body p-3">
              <div className="fw-bold text-dark mb-3" style={{ fontSize: 15 }}>
                <i className="bi bi-trophy-fill me-2" style={{ color: C.verde }} />Ranking de usuarios recicladores
              </div>
              {ranking.length > 0 ? (
                <div className="table-responsive">
                  <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
                    <thead style={S.tableHead}>
                      <tr>
                        {["#","Usuario","Entregas","Puntos","Canjes"].map(h => (
                          <th key={h} className={h === "#" ? "text-center" : ""} style={S.tableHeadTh}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ranking.map((u, i) => (
                        <tr key={i} style={S.tableRow}>
                          <td className="text-center fw-bold">
                            {i === 0 ? <i className="bi bi-trophy-fill" style={{ color: C.verde }} /> : <span className="text-secondary">{i + 1}</span>}
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <Av text={u.iniciales} size={30} />
                              <span className="fw-bold text-dark">{u.nombre}</span>
                            </div>
                          </td>
                          <td className="text-center fw-bold text-dark">{u.entregas}</td>
                          <td className="text-center"><span style={S.badgePuntos}><i className="bi bi-star-fill me-1" />{u.pts}</span></td>
                          <td className="text-center fw-bold text-dark">{u.canjes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-secondary" style={{ fontSize: 13 }}>
                  <i className="bi bi-inbox d-block mb-1" style={{ fontSize: 22 }} />Sin datos de usuarios
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card h-100" style={S.card}>
            <div className="card-body p-3">
              <div className="fw-bold text-dark mb-3" style={{ fontSize: 15 }}>
                <i className="bi bi-arrow-left-right me-2" style={{ color: C.verde }} />Puntos: entregados vs canjeados
              </div>
              <div className="d-flex flex-column gap-3">
                {[
                  { icon: "bi-star-fill",  label: "Entregados",  value: `${(puntos.entregados ?? 0).toLocaleString()} pts`, pct: 100, color: C.verde },
                  { icon: "bi-gift-fill",  label: "Canjeados",   value: `${(puntos.canjeados ?? 0).toLocaleString()} pts`, pct: Math.min((puntos.canjeados ?? 0) / Math.max(puntos.entregados || 1, 1) * 100, 100), color: C.verdeOscuro },
                  { icon: "bi-wallet2",    label: "Disponibles", value: `${(puntos.disponibles ?? 0).toLocaleString()} pts`, pct: Math.min((puntos.disponibles ?? 0) / Math.max(puntos.entregados || 1, 1) * 100, 100), color: C.verdeMedio },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-bold text-dark" style={{ fontSize: 13 }}>
                        <i className={`bi ${item.icon} me-1`} style={{ color: item.color }} />{item.label}
                      </span>
                      <span className="fw-bold text-dark" style={{ fontSize: 13 }}>{item.value}</span>
                    </div>
                    <div className="rounded-pill overflow-hidden" style={{ height: 12, backgroundColor: C.grisFondo, border: `1px solid ${C.verdeBorde}` }}>
                      <div className="h-100 rounded-pill" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
                <div className="mt-2 p-3 rounded-2 text-center" style={{ border: `1.5px solid ${C.verdeBorde}` }}>
                  <div className="fw-bold text-dark" style={{ fontSize: 12 }}>Tasa de canje</div>
                  <div className="fw-bold text-dark" style={{ fontSize: 32 }}>{puntos.tasaCanje ?? 0}%</div>
                  <div className="text-secondary" style={{ fontSize: 11 }}>de los puntos entregados fueron canjeados</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
