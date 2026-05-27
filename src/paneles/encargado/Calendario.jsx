// src/components/Calendario.jsx
import { useState } from "react";

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

function toKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function Calendario({ onSelectDay, selectedDay, entregasPorDia }) {
  const hoy = new Date();
  const [mes, setMes]   = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());

  const primerDia = new Date(anio, mes, 1).getDay();
  const diasMes   = new Date(anio, mes + 1, 0).getDate();
  const celdas    = Array.from({ length: primerDia + diasMes }, (_, i) =>
    i < primerDia ? null : i - primerDia + 1
  );

  const prev = () => { if (mes === 0) { setMes(11); setAnio(a => a - 1); } else setMes(m => m - 1); };
  const next = () => { if (mes === 11) { setMes(0); setAnio(a => a + 1); } else setMes(m => m + 1); };

  return (
    <div className="card border border-2 border-dark rounded-3 h-100 shadow-sm">
      <div className="card-body p-3">

        {/* Header mes */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <button
            onClick={prev}
            className="btn btn-dark btn-sm border border-warning rounded-2 d-flex align-items-center justify-content-center p-0"
            style={{ width: 32, height: 32 }}
          >
            <i className="bi bi-chevron-left text-warning" style={{ fontSize: 12 }} />
          </button>
          <span className="fw-black text-dark" style={{ fontSize: 15 }}>
            {MESES[mes]} {anio}
          </span>
          <button
            onClick={next}
            className="btn btn-dark btn-sm border border-warning rounded-2 d-flex align-items-center justify-content-center p-0"
            style={{ width: 32, height: 32 }}
          >
            <i className="bi bi-chevron-right text-warning" style={{ fontSize: 12 }} />
          </button>
        </div>

        {/* Días semana */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, marginBottom: 1, backgroundColor: "#d1d5db" }}>
          {DIAS_SEMANA.map(d => (
            <div key={d} className="text-center fw-bold text-secondary" style={{ fontSize: 10, padding: "4px 0", backgroundColor: "#fff" }}>{d}</div>
          ))}
        </div>

        {/* Celdas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, backgroundColor: "#d1d5db" }}>
          {celdas.map((d, i) => {
            if (!d) return <div key={i} style={{ backgroundColor: "#f3f4f6", minHeight: 44 }} />;
            const key         = toKey(anio, mes, d);
            const tieneEntregas = !!entregasPorDia[key];
            const esHoy       = d === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear();
            const seleccionado = selectedDay === key;
            const pendientes  = tieneEntregas
              ? entregasPorDia[key].filter(e => e.estado === "Pendiente").length
              : 0;

            let bg = "#fff", textColor = "#374151", fw = 500;
            if (seleccionado) { bg = "#ffc107"; textColor = "#000"; fw = 800; }
            else if (esHoy)   { bg = "#1f2937"; textColor = "#ffc107"; fw = 700; }
            else if (tieneEntregas) { bg = "#dcfce7"; }

            return (
              <div
                key={i}
                onClick={() => tieneEntregas && onSelectDay(key)}
                style={{
                  padding: "8px 2px", textAlign: "center", minHeight: 44,
                  cursor: tieneEntregas ? "pointer" : "default",
                  backgroundColor: bg, transition: "all .15s",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: fw, color: textColor }}>{d}</div>
                {tieneEntregas && pendientes > 0 && (
                  <span
                    className={`badge rounded-pill ${seleccionado ? "bg-dark text-warning" : "bg-success text-white"}`}
                    style={{ fontSize: 8, padding: "1px 5px" }}
                  >
                    {pendientes}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Leyenda */}
        <div className="d-flex flex-wrap gap-3 mt-3">
          {[
            { bg: "#1f2937", border: "none",                label: "Hoy"            },
            { bg: "#dcfce7", border: "1px solid #16a34a",   label: "Con entregas"   },
            { bg: "#ffc107", border: "2px solid #000",      label: "Seleccionado"   },
          ].map(l => (
            <span key={l.label} className="d-flex align-items-center gap-1 text-secondary" style={{ fontSize: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: l.bg, border: l.border, display: "inline-block" }} />
              {l.label}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}