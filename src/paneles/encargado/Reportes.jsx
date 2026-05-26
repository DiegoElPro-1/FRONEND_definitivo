// src/paneles/encargado/Reportes.jsx
import { useState } from "react";
import { C, S, Av } from "./encargadoTheme";

const MATERIALES_MES = [
  { mes: "Ene", kg: 320 }, { mes: "Feb", kg: 480 }, { mes: "Mar", kg: 410 },
  { mes: "Abr", kg: 560 }, { mes: "May", kg: 390 },
];

const CANJES_PERIODO = [
  { recompensa: "Bono Supermercado",    cantidad: 12, pts: 6000 },
  { recompensa: "Crédito Internet",     cantidad: 9,  pts: 2250 },
  { recompensa: "Bono Farmacia",        cantidad: 7,  pts: 2800 },
  { recompensa: "Vale Restaurante",     cantidad: 5,  pts: 3750 },
  { recompensa: "Descuento Transporte", cantidad: 4,  pts: 1200 },
  { recompensa: "Entrada Cine",         cantidad: 2,  pts: 1200 },
];

const USUARIOS_TOP = [
  { nombre: "Laura Pérez",     av: "LP", entregas: 18, pts: 2100, canjes: 3 },
  { nombre: "Elena Santacruz", av: "ES", entregas: 12, pts: 1240, canjes: 2 },
  { nombre: "Carlos Muñoz",    av: "CM", entregas: 9,  pts: 870,  canjes: 1 },
  { nombre: "María Gómez",     av: "MG", entregas: 7,  pts: 630,  canjes: 1 },
  { nombre: "Andrés Torres",   av: "AT", entregas: 5,  pts: 450,  canjes: 0 },
];

const PERIODOS = ["Esta semana", "Este mes", "Este año"];

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.kg));
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
  const maxCanjes = Math.max(...CANJES_PERIODO.map(c => c.cantidad));

  return (
    <div>
      {/* Selector de periodo */}
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

      {/* KPIs */}
      <div className="row g-3 mb-4">
        {[
          { icon: "bi-recycle",     label: "Total kg recolectados", value: "2,160 kg", sub: "este año"     },
          { icon: "bi-star-fill",   label: "Puntos entregados",     value: "18,400",   sub: "acumulados"   },
          { icon: "bi-gift-fill",   label: "Canjes realizados",     value: 39,          sub: "este periodo" },
          { icon: "bi-people-fill", label: "Usuarios activos",      value: 5,           sub: "recicladores" },
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
        {/* Gráfica materiales */}
        <div className="col-lg-6">
          <div className="card h-100" style={S.card}>
            <div className="card-body p-3">
              <div className="fw-bold text-dark mb-1" style={{ fontSize: 15 }}>
                <i className="bi bi-bar-chart-fill me-2" style={{ color: C.verde }} />Materiales recolectados (kg)
              </div>
              <div className="text-secondary mb-3" style={{ fontSize: 11 }}>Últimos 5 meses · barra más oscura = mes actual</div>
              <BarChart data={MATERIALES_MES} />
            </div>
          </div>
        </div>

        {/* Canjes por recompensa */}
        <div className="col-lg-6">
          <div className="card h-100" style={S.card}>
            <div className="card-body p-3">
              <div className="fw-bold text-dark mb-1" style={{ fontSize: 15 }}>
                <i className="bi bi-gift-fill me-2" style={{ color: C.verde }} />Canjes por recompensa
              </div>
              <div className="text-secondary mb-3" style={{ fontSize: 11 }}>Ranking del periodo</div>
              <div className="d-flex flex-column gap-2">
                {CANJES_PERIODO.map((c, i) => (
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
            </div>
          </div>
        </div>

        {/* Tabla usuarios top */}
        <div className="col-lg-7">
          <div className="card" style={S.card}>
            <div className="card-body p-3">
              <div className="fw-bold text-dark mb-3" style={{ fontSize: 15 }}>
                <i className="bi bi-trophy-fill me-2" style={{ color: C.verde }} />Ranking de usuarios recicladores
              </div>
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
                    {USUARIOS_TOP.map((u, i) => (
                      <tr key={i} style={S.tableRow}>
                        <td className="text-center fw-bold">
                          {i === 0 ? <i className="bi bi-trophy-fill" style={{ color: C.verde }} /> : <span className="text-secondary">{i + 1}</span>}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Av text={u.av} size={30} />
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
            </div>
          </div>
        </div>

        {/* Puntos entregados vs canjeados */}
        <div className="col-lg-5">
          <div className="card h-100" style={S.card}>
            <div className="card-body p-3">
              <div className="fw-bold text-dark mb-3" style={{ fontSize: 15 }}>
                <i className="bi bi-arrow-left-right me-2" style={{ color: C.verde }} />Puntos: entregados vs canjeados
              </div>
              <div className="d-flex flex-column gap-3">
                {[
                  { icon: "bi-star-fill",  label: "Entregados",  value: "18,400 pts", pct: 100, color: C.verde        },
                  { icon: "bi-gift-fill",  label: "Canjeados",   value: "11,200 pts", pct: 61,  color: C.verdeOscuro  },
                  { icon: "bi-wallet2",    label: "Disponibles", value: "7,200 pts",  pct: 39,  color: C.verdeMedio   },
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
                  <div className="fw-bold text-dark" style={{ fontSize: 32 }}>61%</div>
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