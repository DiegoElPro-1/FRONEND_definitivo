import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

const USUARIOS_SUB = [
  { path: "/usuarios",        icon: "bi-recycle",           title: "Usuarios" },
  { path: "/encargados",      icon: "bi-person-badge-fill", title: "Encargados" },
  { path: "/administradores", icon: "bi-shield-lock-fill",  title: "Administradores" },
];

const CATALOGOS = [
  { path: "/catalogos/roles",               icon: "bi-key-fill",          title: "Roles" },
  { path: "/catalogos/estados-puntos",      icon: "bi-geo-alt-fill",      title: "Estados puntos" },
  { path: "/catalogos/estados-materiales",  icon: "bi-recycle",           title: "Estados materiales" },
  { path: "/catalogos/estados-entregas",    icon: "bi-box-seam-fill",     title: "Estados entregas" },
  { path: "/catalogos/estados-aliados",     icon: "bi-handshake-fill",    title: "Estados aliados" },
  { path: "/catalogos/estados-canjes",      icon: "bi-arrow-left-right",  title: "Estados canjes" },
  { path: "/catalogos/estados-usuarios",    icon: "bi-person-check-fill", title: "Estados usuarios" },
  { path: "/catalogos/estados-recompensas", icon: "bi-gift-fill",         title: "Estados recompensas" },
  { path: "/catalogos/tipos-recompensa",    icon: "bi-tag-fill",          title: "Tipos de recompensa" },
];

const NAV = [
  { path: "/dashboard",  icon: "bi-house-fill",     title: "Dashboard" },
  { path: "/materiales", icon: "bi-recycle",        title: "Materiales" },
  { path: "/aliados",    icon: "bi-shop",            title: "Supermercado" },
];

const USUARIOS_PATHS = USUARIOS_SUB.map(u => u.path);

export default function Sidebar({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isCatalogActive  = location.pathname.startsWith("/catalogos");
  const isUsuariosActive = USUARIOS_PATHS.some(p => location.pathname.startsWith(p));

  const [catalogosOpen, setCatalogosOpen] = useState(isCatalogActive);
  const [usuariosOpen,  setUsuariosOpen]  = useState(isUsuariosActive);
  const handleLogout = () => {
  localStorage.clear();

  navigate("/login", { replace: true });

  window.location.reload();
};


  return (
    <div
      className="d-flex flex-column bg-white border-end"
      style={{ width: 235, minHeight: "100vh", flexShrink: 0, borderRight: "2px solid #16a34a" }}
    >
      {/* Logo */}
      <div className="d-flex align-items-center gap-2 px-3 py-3 border-bottom" style={{ borderBottom: "1px solid #e5e7eb" }}>
        <div
          className="rounded-2 d-flex align-items-center justify-content-center text-white flex-shrink-0"
          style={{ width: 36, height: 36, fontSize: 18, background: "#16a34a" }}
        >
          <i className="bi bi-recycle" />
        </div>
        <span className="fw-bold fs-6" style={{ color: "#16a34a" }}>Recycling Points</span>
      </div>

      {/* Nav */}
      <nav className="flex-grow-1 py-2 px-2 d-flex flex-column gap-1 overflow-y-auto">

        {/* Items fijos (Dashboard, Materiales, Supermercado) */}
        {/* Items fijos */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `btn d-flex align-items-center gap-2 text-start px-3 py-2 rounded-2 w-100 text-decoration-none border-0 ${
              isActive ? "fw-semibold" : "btn-light text-secondary"
            }`
          }       
          style={({ isActive }) => isActive ? { background: "#16a34a", color: "#fff", fontSize: 13 } : { fontSize: 13 }}
        >
          <i className="bi bi-house-fill" style={{ fontSize: 15, width: 18 }} />
          <span>Dashboard</span>
        </NavLink>

{/* ── Supermercados ── */}

        {/* ── Recompensas ── */}
        <NavLink
          to="/recompensas"
          className={({ isActive }) =>
            `btn d-flex align-items-center gap-2 text-start px-3 py-2 rounded-2 w-100 text-decoration-none border-0 ${
              isActive ? "fw-semibold" : "btn-light text-secondary"
            }`
          }
          style={({ isActive }) => isActive ? { background: "#16a34a", color: "#fff", fontSize: 13 } : { fontSize: 13 }}
        >
          <i className="bi bi-gift-fill" style={{ fontSize: 15, width: 18 }} />
          <span>Recompensas</span>
        </NavLink>

        {/* ── Supermercados (ítem independiente) ── */}
        <NavLink
          to="/aliados"
          className={({ isActive }) =>
            `btn d-flex align-items-center gap-2 text-start px-3 py-2 rounded-2 w-100 text-decoration-none border-0 ${
              isActive ? "fw-semibold" : "btn-light text-secondary"
            }`
          }
          style={({ isActive }) => isActive ? { background: "#16a34a", color: "#fff", fontSize: 13 } : { fontSize: 13 }}
        >
          <i className="bi bi-shop" style={{ fontSize: 15, width: 18 }} />
          <span>Supermercados</span>
        </NavLink>

        {/* ── Usuarios desplegable ── */}
        <div>
          <button
            className={`btn d-flex align-items-center gap-2 text-start px-3 py-2 rounded-2 w-100 border-0 ${
              isUsuariosActive ? "fw-semibold" : "btn-light text-secondary"
            }`}
            style={isUsuariosActive
              ? { background: "#16a34a", color: "#fff", fontSize: 13 }
              : { fontSize: 13 }}
            onClick={() => setUsuariosOpen(o => !o)}
          >
            <i className="bi bi-people-fill" style={{ fontSize: 15, width: 18 }} />
            <span className="flex-grow-1">Usuarios</span>
            <i className={`bi bi-chevron-${usuariosOpen ? "up" : "down"}`} style={{ fontSize: 11 }} />
          </button>

          {usuariosOpen && (
            <div className="d-flex flex-column gap-1 mt-1 ms-3 ps-2 border-start" style={{ borderColor: "#16a34a" }}>
              {USUARIOS_SUB.map(sub => (
                <NavLink
                  key={sub.path}
                  to={sub.path}
                  className={({ isActive }) =>
                    `btn d-flex align-items-center gap-2 text-start px-3 py-2 rounded-2 w-100 text-decoration-none border-0 ${
                      isActive ? "fw-semibold" : "btn-light text-secondary"
                    }`
                  }
                  style={({ isActive }) =>
                    isActive
                      ? { background: "#16a34a", color: "#fff", fontSize: 12 }
                      : { fontSize: 12 }
                  }
                >
                  <i className={`bi ${sub.icon}`} style={{ fontSize: 13, width: 16 }} />
                  {sub.title}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* ── Catálogos desplegable ── */}
        <div>
          <button
            className={`btn d-flex align-items-center gap-2 text-start px-3 py-2 rounded-2 w-100 border-0 ${
              isCatalogActive ? "fw-semibold" : "btn-light text-secondary"
            }`}
            style={isCatalogActive
              ? { background: "#16a34a", color: "#fff", fontSize: 13 }
              : { fontSize: 13 }}
            onClick={() => setCatalogosOpen(o => !o)}
          >
            <i className="bi bi-journals" style={{ fontSize: 15, width: 18 }} />
            <span className="flex-grow-1">Catálogos</span>
            <i className={`bi bi-chevron-${catalogosOpen ? "up" : "down"}`} style={{ fontSize: 11 }} />
          </button>

          {catalogosOpen && (
            <div className="d-flex flex-column gap-1 mt-1 ms-3 ps-2 border-start" style={{ borderColor: "#16a34a" }}>
              {CATALOGOS.map(sub => (
                <NavLink
                  key={sub.path}
                  to={sub.path}
                  className={({ isActive }) =>
                    `btn d-flex align-items-center gap-2 text-start px-3 py-2 rounded-2 w-100 text-decoration-none border-0 ${
                      isActive ? "fw-semibold" : "btn-light text-secondary"
                    }`
                  }
                  style={({ isActive }) =>
                    isActive
                      ? { background: "#16a34a", color: "#fff", fontSize: 12 }
                      : { fontSize: 12 }
                  }
                >
                  <i className={`bi ${sub.icon}`} style={{ fontSize: 13, width: 16 }} />
                  {sub.title}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Perfil rápido */}
      <div className="px-2 pt-2 border-top">
        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            `btn d-flex align-items-center gap-2 text-start px-3 py-2 rounded-2 w-100 text-decoration-none border-0 ${
              isActive ? "fw-semibold" : "btn-light text-secondary"
            }`
          }
          style={({ isActive }) => ({ fontSize: 13, ...(isActive ? { background: "#16a34a", color: "#fff" } : {}) })}
        >
          <div
            className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
            style={{ width: 28, height: 28, background: "#16a34a", fontSize: 11 }}
          >
            AD
          </div>
          <div className="d-flex flex-column lh-1">
            <span className="fw-semibold" style={{ fontSize: 13, color: "#111111" }}>Administrador</span>
            <span className="text-muted" style={{ fontSize: 11 }}>Ver perfil</span>
          </div>
        </NavLink>
      </div>

      {/* Salir */}
      <div className="px-2 py-2 pb-3">
        <button
          className="btn d-flex align-items-center gap-2 w-100 px-3 py-2 rounded-2 border-0"
          style={{ fontSize: 13, background: "#fff3f3", color: "#dc2626" }}
          onClick={onLogout}
        >
          <i className="bi bi-box-arrow-left" style={{ fontSize: 15 }} />
          Salir
        </button>
      </div>
    </div>
  );
}