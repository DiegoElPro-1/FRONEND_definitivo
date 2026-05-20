// src/components/VistaDashboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import StatCard         from "./StatCard";
import Calendario       from "./Calendario";
import ListaUsuariosDia from "./ListaUsuariosDia";
import DetalleEntrega   from "./DetalleEntrega";
import Av               from "./Av";

// ── Datos ────────────────────────────────────────────────────────────────────
const ENTREGAS_INICIALES = {
  "2026-05-05": [
    { id: 1, nombre: "Diego Tamayo",     av: "DT", materiales: ["Cartón","Vidrio"],          peso: 4.2, pts: 130, estado: "Pendiente" },
    { id: 2, nombre: "Carlos Jaramillo", av: "CJ", materiales: ["Plástico (PET)"],           peso: 2.1, pts: 63,  estado: "Pendiente" },
    { id: 3, nombre: "Elena Santacruz",  av: "ES", materiales: ["Papel","Metal"],             peso: 1.8, pts: 78,  estado: "Validada"  },
  ],
  "2026-05-08": [
    { id: 4, nombre: "Luisa Perdomo",    av: "LP", materiales: ["Aluminio"],                 peso: 0.9, pts: 36,  estado: "Pendiente" },
    { id: 5, nombre: "Andrés Torres",    av: "AT", materiales: ["Cartón","Plástico (PET)"],  peso: 3.5, pts: 95,  estado: "Pendiente" },
  ],
  "2026-05-11": [
    { id: 6, nombre: "Diego Tamayo",     av: "DT", materiales: ["Vidrio"],                   peso: 2.0, pts: 50,  estado: "Pendiente" },
    { id: 7, nombre: "Sofía Muñoz",      av: "SM", materiales: ["Papel"],                    peso: 1.2, pts: 18,  estado: "Pendiente" },
    { id: 8, nombre: "Carlos Jaramillo", av: "CJ", materiales: ["Electrónicos"],             peso: 0.5, pts: 30,  estado: "Rechazada" },
  ],
  "2026-05-14": [
    { id: 9,  nombre: "Elena Santacruz", av: "ES", materiales: ["Cartón","Vidrio","Papel"],  peso: 5.1, pts: 148, estado: "Pendiente" },
    { id: 10, nombre: "Luisa Perdomo",   av: "LP", materiales: ["Plástico (PET)"],           peso: 2.8, pts: 84,  estado: "Pendiente" },
  ],
  "2026-05-19": [
    { id: 11, nombre: "Andrés Torres",   av: "AT", materiales: ["Metal","Aluminio"],         peso: 3.3, pts: 118, estado: "Pendiente" },
  ],
  "2026-05-22": [
    { id: 12, nombre: "Sofía Muñoz",     av: "SM", materiales: ["Cartón"],                   peso: 2.5, pts: 50,  estado: "Pendiente" },
    { id: 13, nombre: "Diego Tamayo",    av: "DT", materiales: ["Plástico (PET)","Papel"],   peso: 3.0, pts: 75,  estado: "Pendiente" },
  ],
};

const BAR_DATA = [
  { dia: "Lun", kg: 12.4 }, { dia: "Mar", kg: 8.1 },  { dia: "Mié", kg: 15.3 },
  { dia: "Jue", kg: 6.7 },  { dia: "Vie", kg: 18.2 }, { dia: "Sáb", kg: 22.5 }, { dia: "Dom", kg: 4.3 },
];

const PIE_DATA = [
  { name: "Plástico", value: 40, color: "#198754" },
  { name: "Cartón",   value: 25, color: "#ffc107" },
  { name: "Vidrio",   value: 20, color: "#000000" },
  { name: "Otros",    value: 15, color: "#6c757d" },
];

const TOP_RECICLADORES = [
  { pos: 1, nombre: "Diego Tamayo",     av: "DT", entregas: 30, bg: "#ffc107", color: "#000" },
  { pos: 2, nombre: "Carlos Jaramillo", av: "CJ", entregas: 15, bg: "#198754", color: "#fff" },
  { pos: 3, nombre: "Elena Santacruz",  av: "ES", entregas: 9,  bg: "#000",    color: "#ffc107" },
];

const ENCARGADO = { nombre: "María López", punto: "Punto Verde Centro", av: "ML" };

// ── Componente ───────────────────────────────────────────────────────────────
export default function VistaDashboard() {
  const navigate = useNavigate();

  const [selectedDay,  setSelectedDay]  = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [entregas,     setEntregas]     = useState(ENTREGAS_INICIALES);

  const handleValidar = () => {
    setEntregas(prev => {
      const copia = { ...prev };
      copia[selectedDay] = copia[selectedDay].map(e =>
        e.id === selectedUser.id ? { ...e, estado: "Validada" } : e
      );
      return copia;
    });
    setSelectedUser(u => ({ ...u, estado: "Validada" }));
  };

  const handleRechazar = () => {
    setEntregas(prev => {
      const copia = { ...prev };
      copia[selectedDay] = copia[selectedDay].map(e =>
        e.id === selectedUser.id ? { ...e, estado: "Rechazada" } : e
      );
      return copia;
    });
    setSelectedUser(u => ({ ...u, estado: "Rechazada" }));
  };

  return (
    <div>

      {/* ── Tarjeta de bienvenida con acceso al perfil ── */}
      <div
        className="card border border-2 border-dark rounded-3 shadow-sm mb-4 px-4 py-3 d-flex flex-row align-items-center justify-content-between"
        style={{ background: "#fff" }}
      >
        <div className="d-flex align-items-center gap-3">
          <Av text={ENCARGADO.av} size={52} bg="#ffc107" color="#000" />
          <div>
            <div className="fw-black text-dark" style={{ fontSize: 17 }}>
              Bienvenido, {ENCARGADO.nombre} 👋
            </div>
            <div className="text-secondary fw-semibold" style={{ fontSize: 12 }}>
              {ENCARGADO.punto} · Encargado de punto
            </div>
          </div>
        </div>
        <button
          className="btn btn-dark fw-bold d-flex align-items-center gap-2"
          style={{ fontSize: 13 }}
          onClick={() => navigate("/encargado/perfil")}
        >
          <i className="bi bi-person-circle" />
          Mi perfil
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <StatCard icon="bi-recycle"     label="Kg reciclados al mes"    value="1,284" sub="↑15.2% vs mes anterior"   variant="success" />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard icon="bi-star-fill"   label="Puntos emitidos"         value="24.5k" sub="Acumulado actual"          variant="warning" />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard icon="bi-people-fill" label="Nuevos usuarios"         value="142"   sub="825 nuevos este mes"       variant="dark"    />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard icon="bi-patch-check" label="Tasa de validación"      value="98.2%" sub="Alta · Entregas aceptadas" variant="light"   />
        </div>
      </div>

      {/* Calendario + panel derecho */}
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <Calendario
            onSelectDay={d => { setSelectedDay(d); setSelectedUser(null); }}
            selectedDay={selectedDay}
            entregasPorDia={entregas}
          />
        </div>
        <div className="col-md-6">
          {!selectedDay && (
            <div className="card border border-2 border-dark rounded-3 h-100 d-flex align-items-center justify-content-center text-center p-5 shadow-sm">
              <i className="bi bi-calendar2-event text-secondary" style={{ fontSize: 44 }} />
              <div className="fw-bold text-secondary mt-2" style={{ fontSize: 14 }}>
                Selecciona un día en el calendario
              </div>
              <div className="text-secondary" style={{ fontSize: 12 }}>
                Los días marcados tienen entregas pendientes
              </div>
            </div>
          )}
          {selectedDay && !selectedUser && (
            <ListaUsuariosDia
              dia={selectedDay}
              entregas={entregas[selectedDay] || []}
              onSelect={setSelectedUser}
            />
          )}
          {selectedDay && selectedUser && (
            <DetalleEntrega
              entrega={selectedUser}
              onBack={() => setSelectedUser(null)}
              onValidar={handleValidar}
              onRechazar={handleRechazar}
            />
          )}
        </div>
      </div>

      {/* Gráficas */}
      <div className="row g-3 mb-3">
        <div className="col-lg-8">
          <div className="card border border-2 border-dark rounded-3 shadow-sm">
            <div className="card-body p-3">
              <div className="fw-black text-dark mb-3" style={{ fontSize: 14 }}>
                <i className="bi bi-bar-chart-fill text-success me-2" />
                Tendencia de reciclaje (kg) — últimos 7 días
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={BAR_DATA}>
                  <XAxis dataKey="dia" axisLine={false} tickLine={false} style={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} style={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "2px solid #000", boxShadow: "none" }}
                    cursor={{ fill: "#ffc10730" }}
                  />
                  <Bar dataKey="kg" fill="#198754" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border border-2 border-dark rounded-3 shadow-sm h-100">
            <div className="card-body p-3">
              <div className="fw-black text-dark mb-3" style={{ fontSize: 14 }}>
                <i className="bi bi-pie-chart-fill text-warning me-2" />
                Distribución por material
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={42} outerRadius={70} dataKey="value">
                    {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} stroke="#000" strokeWidth={1} />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} style={{ fontSize: 11 }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Top recicladores */}
      <div className="card border border-2 border-dark rounded-3 shadow-sm">
        <div className="card-body p-3">
          <div className="fw-black text-dark mb-3" style={{ fontSize: 14 }}>
            <i className="bi bi-trophy-fill text-warning me-2" />
            Top recicladores del mes
          </div>
          {TOP_RECICLADORES.map((r, idx) => (
            <div
              key={r.pos}
              className={`d-flex align-items-center gap-3 py-2 ${idx < TOP_RECICLADORES.length - 1 ? "border-bottom border-dark" : ""}`}
            >
              <span className="fw-black" style={{ width: 28, fontSize: 18, color: r.color === "#000" ? "#ffc107" : r.color }}>
                #{r.pos}
              </span>
              <Av text={r.av} size={38} bg={r.bg} color={r.color} />
              <div className="flex-grow-1">
                <div className="fw-bold text-dark" style={{ fontSize: 13 }}>{r.nombre}</div>
                <div className="text-secondary" style={{ fontSize: 11 }}>{r.entregas} entregas este mes</div>
              </div>
              <div
                className="rounded-pill border border-dark overflow-hidden"
                style={{ width: 110, height: 8, background: "#e9ecef" }}
              >
                <div
                  style={{
                    width: `${(r.entregas / 30) * 100}%`,
                    background: r.bg,
                    height: "100%",
                    borderRadius: "inherit",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}