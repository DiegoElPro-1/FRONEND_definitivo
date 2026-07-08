import { useNavigate, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar           from "./Sidebar";
import VistaDashboard    from "./VistaDashboard";
import RegistrarEntrega  from "./RegistrarEntrega";
import HistorialEntregas from "./HistorialdeEntregas";
import Canjes            from "./Canjes";
import PanelControl      from "./PanelControl";
import Reportes          from "./Reportes";
import Av                from "./Av";
import PerfilEncargado   from "./PerfilEncargado";
import Notificaciones    from "./Notificaciones";

const u = JSON.parse(localStorage.getItem("usuario") || "{}");
const ENCARGADO = {
  nombre: u.nombre || "Encargado",
  punto: u.puntoACargo?.nombre || "Tu punto",
  av: (u.nombre || "E").trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "EN",
};

const NAV = [
  { key: "dashboard",  path: "dashboard",  label: "Dashboard"          },
  { key: "control",    path: "control",    label: "Panel de control"   },
  { key: "registrar",  path: "registrar",  label: "Registrar entrega"  },
  { key: "historial",  path: "historial",  label: "Historial entregas" },
  { key: "canjes",     path: "canjes",     label: "Canjes"             },
  { key: "reportes",   path: "reportes",   label: "Reportes"           },
  { key: "perfil",     path: "perfil",     label: "Mi perfil"          },
];

export default function PanelEncargado({ user, onLogout, showToast }) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeKey    = NAV.find(n => location.pathname.includes(n.path))?.key || "dashboard";
  const tituloActivo = NAV.find(n => n.key === activeKey)?.label || "Dashboard";

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Segoe UI', sans-serif" }}>
      <Sidebar />

      <main style={{ marginLeft: 230, flex: 1, minWidth: 0, padding: "20px 24px" }}>

        <div className="d-flex align-items-center justify-content-between mb-3">
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
          <Route path="dashboard" element={<VistaDashboard showToast={showToast} />}    />
          <Route path="control"   element={<PanelControl />}      />
          <Route path="registrar" element={<RegistrarEntrega showToast={showToast} />}  />
          <Route path="historial" element={<HistorialEntregas showToast={showToast} />} />
          <Route path="canjes"    element={<Canjes showToast={showToast} />}            />
          <Route path="reportes"  element={<Reportes />}          />
          <Route path="perfil"    element={<PerfilEncargado />}   />
          <Route path="*"         element={<Navigate to="/encargado/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}