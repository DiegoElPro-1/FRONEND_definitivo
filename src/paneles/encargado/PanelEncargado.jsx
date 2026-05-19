import { useNavigate, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar           from "./Sidebar";
import VistaDashboard    from "./VistaDashboard";
import RegistrarEntrega  from "./RegistrarEntrega";
import HistorialEntregas from "./HistorialdeEntregas";
import Canjes            from "./Canjes";
import PanelControl      from "./PanelControl";
import Reportes          from "./Reportes";
import Av                from "./Av";
import Notificaciones    from "./Notificaciones";

const ENCARGADO = { nombre: "María López", punto: "Punto Verde Centro", av: "ML" };

const NAV = [
  { key: "dashboard",  path: "dashboard",  icon: "bi-house-door-fill",    label: "Dashboard"          },
  { key: "control",    path: "control",    icon: "bi-grid-fill",           label: "Panel de control"   },
  { key: "registrar",  path: "registrar",  icon: "bi-plus-circle-fill",    label: "Registrar entrega"  },
  { key: "historial",  path: "historial",  icon: "bi-clock-history",       label: "Historial entregas" },
  { key: "canjes",     path: "canjes",     icon: "bi-gift-fill",           label: "Canjes"             },
  { key: "reportes",   path: "reportes",   icon: "bi-bar-chart-line-fill", label: "Reportes"           },
];

export default function PanelEncargado({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeKey    = NAV.find(n => location.pathname.includes(n.path))?.key || "dashboard";
  const tituloActivo = NAV.find(n => n.key === activeKey)?.label || "Dashboard";

  const handleNav = (key) => {
    const item = NAV.find(n => n.key === key);
    if (item) navigate(`/encargado/${item.path}`);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    localStorage.removeItem("usuario");
    if (onLogout) onLogout();
    navigate("/login");
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Segoe UI', sans-serif" }}>
      <Sidebar active={activeKey} onNav={handleNav} encargado={ENCARGADO} onLogout={handleLogout} />

      <main style={{ marginLeft: 230, flex: 1, padding: 28, overflow: "visible" }}>
        <div className="d-flex align-items-center justify-content-between mb-4" style={{ position: "relative", overflow: "visible" }}>
          <div>
            <div className="fw-black text-dark" style={{ fontSize: 22 }}>{tituloActivo}</div>
            <div className="text-secondary fw-semibold" style={{ fontSize: 13 }}>
              {ENCARGADO.punto} · Bienvenido, {ENCARGADO.nombre.split(" ")[0]}
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Notificaciones />
            <Av text={ENCARGADO.av} size={38} bg="#ffc107" color="#000" />
          </div>
        </div>

        <Routes>
          <Route index            element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<VistaDashboard />} />
          <Route path="control"   element={<PanelControl />} />
          <Route path="registrar" element={<RegistrarEntrega />} />
          <Route path="historial" element={<HistorialEntregas />} />
          <Route path="canjes"    element={<Canjes />} />
          <Route path="reportes"  element={<Reportes />} />
          <Route path="*"         element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}