// src/components/Sidebar.jsx  (encargado)
import { useNavigate, useLocation } from "react-router-dom";

function getFoto() {
  return (
    localStorage.getItem("perfilFotoEncargado") ||
    localStorage.getItem("perfilFoto") ||
    ""
  );
}

function getDatosEncargado() {
  try {
    const u = JSON.parse(localStorage.getItem("usuario")) || {};
    const foto = getFoto();
    const initials = u.nombre
      ? u.nombre.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
      : "ML";
    return {
      foto,
      initials,
      nombre: u.nombre || "María López",
      rol:    u.rol    || "Encargado",
    };
  } catch {
    return { foto: "", initials: "ML", nombre: "María López", rol: "Encargado" };
  }
}

// ── rutas que coinciden exactamente con las de PanelEncargado.jsx ──────────
const NAV_ITEMS = [
  { icon: "bi-house-fill",        label: "Dashboard",          path: "/encargado/dashboard"  },
  { icon: "bi-grid-fill",         label: "Panel de control",   path: "/encargado/control"    }, // ← era /panel, ahora /control
  { icon: "bi-box-arrow-in-down", label: "Registrar entrega",  path: "/encargado/registrar"  },
  { icon: "bi-clock-history",     label: "Historial entregas", path: "/encargado/historial"  },
  { icon: "bi-gift-fill",         label: "Canjes",             path: "/encargado/canjes"     },
  { icon: "bi-bar-chart-fill",    label: "Reportes",           path: "/encargado/reportes"   },
];

function NavItem({ icon, label, path }) {
  const navigate = useNavigate();
  const location = useLocation();
  const active   = location.pathname === path;

  return (
    <button
      onClick={() => navigate(path)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        width: "100%", padding: "10px 14px",
        borderRadius: 10, border: "none", cursor: "pointer",
        fontSize: 14, fontWeight: 700, textAlign: "left",
        background: active ? "#ffc107" : "transparent",
        color:      active ? "#000"    : "#fff",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#2d2d2d"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? "#ffc107" : "transparent"; }}
    >
      <i className={`bi ${icon}`} style={{ fontSize: 18 }} />
      {label}
    </button>
  );
}

export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { foto, initials, nombre, rol } = getDatosEncargado();
  const perfilActivo = location.pathname === "/encargado/perfil";

  // ── Logout: limpia sesión y fuerza recarga al login ────────────────────
  const handleLogout = () => {
    sessionStorage.removeItem("user");
    localStorage.removeItem("usuario");
    window.location.replace("/login"); // replace evita que el back regrese al panel
  };

  return (
    <div style={{
      width: 230, minHeight: "100vh",
      background: "#181818",
      display: "flex", flexDirection: "column",
      padding: "16px 10px", boxSizing: "border-box",
      position: "fixed", top: 0, left: 0, zIndex: 100,
    }}>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px 20px" }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: "#ffc107",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22,
        }}>♻️</div>
        <div>
          <div style={{ color: "#fff", fontWeight: 900, fontSize: 13, lineHeight: 1.2 }}>Recycling Points</div>
          <div style={{ color: "#ffc107", fontSize: 11, fontWeight: 700 }}>Panel Encargado</div>
        </div>
      </div>

      {/* Navegación */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV_ITEMS.map(item => (
          <NavItem key={item.path} {...item} />
        ))}
      </nav>

      {/* ── Perfil + Salir ── */}
      <div style={{ borderTop: "1px solid #2d2d2d", paddingTop: 12, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>

        {/* Botón perfil */}
        <button
          onClick={() => navigate("/encargado/perfil")}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", padding: "10px 10px",
            borderRadius: 10, border: "none", cursor: "pointer",
            background: perfilActivo ? "#2d2d2d" : "transparent",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#2d2d2d"; }}
          onMouseLeave={e => { e.currentTarget.style.background = perfilActivo ? "#2d2d2d" : "transparent"; }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "#ffc107", flexShrink: 0, overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 14, color: "#000",
            border: perfilActivo ? "2px solid #ffc107" : "2px solid transparent",
          }}>
            {foto
              ? <img src={foto} alt="perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : initials
            }
          </div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 13, lineHeight: 1.2 }}>{nombre}</div>
            <div style={{ color: "#aaa", fontSize: 11, fontWeight: 600 }}>{rol}</div>
          </div>
          <i className="bi bi-person-gear" style={{ color: "#ffc107", fontSize: 15 }} />
        </button>

        {/* Botón salir */}
        <button
          onClick={handleLogout}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            width: "100%", padding: "9px 0",
            borderRadius: 10,
            border: "1.5px solid #ffc107",
            background: "#ffc107", color: "#000",
            fontWeight: 900, fontSize: 13,
            cursor: "pointer", transition: "background 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#e0a800"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#ffc107"; }}
        >
          <i className="bi bi-box-arrow-right" style={{ fontSize: 16 }} />
          Salir
        </button>

      </div>
    </div>
  );
}