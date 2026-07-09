// Dashboard.jsx
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Chart, registerables } from "chart.js";
import { CHART_DATA } from "../../constants/data";

Chart.register(...registerables);

const BAR_DATA = [
  { label: "1 may", val: 30 },
  { label: "2 may", val: 28 },
  { label: "3 may", val: 33 },
  { label: "4 may", val: 27 },
  { label: "5 may", val: 18.3, hi: true },
  { label: "6 may", val: 32 },
  { label: "7 may", val: 26 },
];

export default function Dashboard({ state }) {
  const totalKg = state.entregas.reduce((a, e) => a + e.peso, 0);
  const barRef = useRef(null);
  const pieRef = useRef(null);
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);

  useEffect(() => {
    if (!barRef.current || !pieRef.current) return;

    if (barChartRef.current) barChartRef.current.destroy();
    barChartRef.current = new Chart(barRef.current, {
      type: "bar",
      data: {
        labels: BAR_DATA.map(d => d.label),
        datasets: [{
          data: BAR_DATA.map(d => d.val),
          backgroundColor: BAR_DATA.map(d => d.hi ? "#ca8a04" : "#c8e6c0"),
          hoverBackgroundColor: BAR_DATA.map(d => d.hi ? "#a16207" : "#a5d6a7"),
          borderRadius: 4,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(255,255,255,0.95)",
            titleColor: "#111",
            bodyColor: "#555",
            borderColor: "#e5e7eb",
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: ctx => {
                const kg = ctx.raw;
                const pts = Math.round(kg * 40);
                return [`${kg} kg`, `+${pts} pts`];
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: "#888", autoSkip: false, maxRotation: 0 },
            border: { display: false }
          },
          y: {
            grid: { color: "rgba(0,0,0,0.06)" },
            ticks: { font: { size: 11 }, color: "#888", stepSize: 15 },
            border: { display: false },
            min: 0,
            max: 75
          }
        }
      }
    });

    const nuevos = state.entregas.filter(e => e.esNuevo).length;
    const recurrentes = state.entregas.length - nuevos;

    if (pieChartRef.current) pieChartRef.current.destroy();
    pieChartRef.current = new Chart(pieRef.current, {
      type: "pie",
      data: {
        labels: ["Nuevos", "Recurrentes"],
        datasets: [{
          data: [nuevos || 39, recurrentes || 61],
          backgroundColor: ["#16a34a", "#ca8a04"],
          hoverBackgroundColor: ["#15803d", "#a16207"],
          borderWidth: 2,
          borderColor: "#fff",
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(255,255,255,0.95)",
            titleColor: "#111",
            bodyColor: "#555",
            borderColor: "#e5e7eb",
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.raw}%`
            }
          }
        },
        layout: { padding: 10 }
      },
      plugins: [{
        id: "pctLabels",
        afterDraw(chart) {
          const { ctx, data } = chart;
          chart.getDatasetMeta(0).data.forEach((arc, i) => {
            const val = data.datasets[0].data[i];
            const angle = (arc.startAngle + arc.endAngle) / 2;
            const r = (arc.innerRadius + arc.outerRadius) / 2 + 10;
            ctx.save();
            ctx.fillStyle = "#fff";
            ctx.font = "500 14px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
              val + "%",
              arc.x + Math.cos(angle) * r,
              arc.y + Math.sin(angle) * r
            );
            ctx.restore();
          });
        }
      }]
    });

    return () => {
      barChartRef.current?.destroy();
      pieChartRef.current?.destroy();
    };
  }, [state]);

  const container = {
    initial: {},
    animate: { transition: { staggerChildren: 0.08 } }
  };
  const item = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div className="row g-3" variants={container} initial="initial" animate="animate">

      {/* ── Métricas principales ── */}
      <motion.div className="col-6 col-md-3" variants={item} whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
        <div className="card shadow-sm border-0 h-100" style={{ borderLeft: "4px solid #16a34a" }}>
          <div className="card-body">
            <div className="text-muted small mb-1">
              <i className="bi bi-people-fill me-1" style={{ color: "#16a34a" }}></i>Total usuarios
            </div>
            <div className="fw-bold fs-3" style={{ color: "#111" }}>
              {(state.usuarios?.length ?? 0).toLocaleString()}
            </div>
            <div className="small mt-1" style={{ color: "#16a34a" }}>
              <i className="bi bi-arrow-up me-1"></i>8% este mes
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="col-6 col-md-3" variants={item} whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
        <div className="card shadow-sm border-0 h-100" style={{ borderLeft: "4px solid #2563eb" }}>
          <div className="card-body">
            <div className="text-muted small mb-1">
              <i className="bi bi-recycle me-1" style={{ color: "#2563eb" }}></i>Total kg reciclados
            </div>
            <div className="fw-bold fs-3" style={{ color: "#111" }}>{totalKg.toFixed(1)} kg</div>
            <div className="small mt-1" style={{ color: "#2563eb" }}>
              <i className="bi bi-arrow-up me-1"></i>12% vs mes anterior
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="col-6 col-md-3" variants={item} whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
        <div className="card shadow-sm border-0 h-100" style={{ borderLeft: "4px solid #ca8a04" }}>
          <div className="card-body">
            <div className="text-muted small mb-1">
              <i className="bi bi-star-fill me-1" style={{ color: "#ca8a04" }}></i>Puntos acumulados
            </div>
            <div className="fw-bold fs-3" style={{ color: "#111" }}>
              {state.pts.toLocaleString()}
            </div>
            <div className="text-muted small mt-1">Total plataforma</div>
          </div>
        </div>
      </motion.div>

      <motion.div className="col-6 col-md-3" variants={item} whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
        <div className="card shadow-sm border-0 h-100" style={{ borderLeft: "4px solid #7c3aed" }}>
          <div className="card-body">
            <div className="text-muted small mb-1">
              <i className="bi bi-box-seam-fill me-1" style={{ color: "#7c3aed" }}></i>Total entregas
            </div>
            <div className="fw-bold fs-3" style={{ color: "#111" }}>{state.entregas.length}</div>
            <div className="small mt-1" style={{ color: "#7c3aed" }}>
              <i className="bi bi-arrow-up me-1"></i>5% este mes
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Gráfica de barras ── */}
      <motion.div className="col-md-6" variants={item} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300 }}>
        <div className="card shadow-sm border-0 h-100" style={{ borderLeft: "4px solid #16a34a" }}>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold text-dark">
                <i className="bi bi-recycle me-1" style={{ color: "#16a34a" }}></i>Resumen de reciclaje
              </span>
              <span className="badge rounded-pill fw-normal" style={{ background: "#f3f4f6", color: "#111", fontSize: 11 }}>
                <i className="bi bi-calendar3 me-1"></i>Este mes
              </span>
            </div>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <div className="text-muted small mb-1">Total reciclado</div>
                <div className="fw-bold fs-3 lh-1" style={{ color: "#111" }}>{totalKg.toFixed(1)} kg</div>
                <div className="small mt-1" style={{ color: "#16a34a" }}>
                  <i className="bi bi-arrow-up me-1"></i>12% vs mes anterior
                </div>
              </div>
              <div className="col-6">
                <div className="text-muted small mb-1">Puntos acumulados</div>
                <div className="fw-bold fs-3 lh-1" style={{ color: "#111" }}>
                  {state.pts.toLocaleString()} <i className="bi bi-star-fill" style={{ color: "#facc15" }}></i>
                </div>
                <div className="text-muted small mt-1">Disponibles</div>
              </div>
            </div>
            <div style={{ position: "relative", height: 160 }}>
              <canvas ref={barRef}></canvas>
            </div>
            <div className="d-flex gap-3 mt-2" style={{ fontSize: 11, color: "#6b7280" }}>
              <span>
                <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#c8e6c0", marginRight: 4 }}></span>
                Día normal
              </span>
              <span>
                <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#ca8a04", marginRight: 4 }}></span>
                Día destacado
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Gráfica de pie ── */}
      <motion.div className="col-md-6" variants={item} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300 }}>
        <div className="card shadow-sm border-0 h-100" style={{ borderLeft: "4px solid #ca8a04" }}>
          <div className="card-body">
            <div className="fw-bold mb-3 text-dark">
              <i className="bi bi-pie-chart-fill me-1" style={{ color: "#ca8a04" }}></i>Usuarios nuevos vs recurrentes
            </div>
            <div style={{ position: "relative", height: 200 }}>
              <canvas ref={pieRef}></canvas>
            </div>
            <div className="d-flex justify-content-center gap-4 mt-3" style={{ fontSize: 12, color: "#6b7280" }}>
              <span>
                <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#16a34a", marginRight: 4 }}></span>
                Nuevos 39%
              </span>
              <span>
                <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#ca8a04", marginRight: 4 }}></span>
                Recurrentes 61%
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Impacto ambiental ── */}
      <motion.div className="col-md-6" variants={item} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300 }}>
        <div className="card shadow-sm border-0 h-100" style={{ borderLeft: "4px solid #16a34a" }}>
          <div className="card-body">
            <div className="fw-bold mb-3 text-dark">
              <i className="bi bi-tree-fill me-1" style={{ color: "#16a34a" }}></i>Impacto ambiental
            </div>
            {[
              ["bi-tree-fill",    "CO₂ evitado",         "320 kg",                   "~42 árboles equiv.", "#16a34a"],
              ["bi-droplet-fill", "Agua ahorrada",       "6,200 L",                  "Este mes",           "#2563eb"],
              ["bi-recycle",      "Residuos reciclados", `${totalKg.toFixed(1)} kg`, "Este mes",           "#7c3aed"],
            ].map(([ic, lb, v, s, color], i) => (
              <div key={i} className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded p-2" style={{ background: "#f0fdf4" }}>
                  <i className={`bi ${ic} fs-4`} style={{ color }}></i>
                </div>
                <div>
                  <div className="text-muted small">{lb}</div>
                  <div className="fw-bold fs-5 lh-sm" style={{ color: "#111" }}>{v}</div>
                  <div className="small" style={{ color }}>{s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Actividad reciente ── */}
      <motion.div className="col-md-6" variants={item} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300 }}>
        <div className="card shadow-sm border-0 h-100" style={{ borderLeft: "4px solid #facc15" }}>
          <div className="card-body">
            <div className="fw-bold mb-3 text-dark">
              <i className="bi bi-bell-fill me-1" style={{ color: "#16a34a" }}></i>Actividad reciente
            </div>
            {state.historial.length === 0 ? (
              <div className="text-center text-muted py-4">
                <i className="bi bi-clock-history fs-2 d-block mb-2"></i>
                <span className="small">Sin actividad reciente</span>
              </div>
            ) : state.historial.slice(0, 5).map(h => (
              <div key={h.id} className="d-flex align-items-start gap-2 py-2 border-bottom">
                <div className="rounded-circle p-1" style={{ background: "#f0fdf4" }}>
                  <i className={`bi ${h.icon}`} style={{ color: "#16a34a" }}></i>
                </div>
                <div className="flex-fill">
                  <div className="fw-bold small">{h.desc}</div>
                  <div className="text-muted" style={{ fontSize: 11 }}>{h.sub}</div>
                </div>
                <div className="text-muted flex-shrink-0 small">{h.tiempo}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
}