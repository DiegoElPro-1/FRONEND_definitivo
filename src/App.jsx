import { useReducer, useCallback, useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import { INITIAL_STATE } from "./constants/data";
import { cerrarSesion, getUsuarios, getAdmins } from "./services/api";

import "./styles/panel.css";

import Login          from "./paginas/Login";
import Registro       from "./paginas/Registro";
import ForgotPassword from "./paginas/RecuperarContraseña";
import LandingPage    from "./paginas/LandingPage";

import Sidebar        from "./components/Sidebar";
import Topbar         from "./components/Topbar";
import ToastContainer from "./components/ToastContainer";

import Dashboard        from "./paneles/administrador/Dashboard";
import Usuarios         from "./paneles/administrador/Usuarios";
import Administradores  from "./paneles/administrador/Administradores";
import Aliados          from "./paneles/administrador/Aliados";
import Encargados       from "./paneles/administrador/Encargados";
import Materiales       from "./paneles/administrador/Materiales";
import Perfil           from "./paneles/administrador/Perfil";

import CatRoles               from "./paneles/administrador/catalogos/CatRoles";
import CatEstadosPuntos       from "./paneles/administrador/catalogos/CatEstadosPuntos";
import CatEstadosAliados      from "./paneles/administrador/catalogos/CatEstadosAliados";
import CatEstadosCanjes       from "./paneles/administrador/catalogos/CatEstadosCanjes";
import CatEstadosUsuarios     from "./paneles/administrador/catalogos/CatEstadosUsuarios";
import CatEstadosRecompensas  from "./paneles/administrador/catalogos/CatEstadosRecompensas";
import CatTiposRecompensa     from "./paneles/administrador/catalogos/CatTiposRecompensa";
import CatEstadosMateriales   from "./paneles/administrador/catalogos/CatEstadosMateriales";
import CatEstadosEntregas     from "./paneles/administrador/catalogos/CatEstadosEntregas";

// ── Panel Encargado ──
import PanelEncargado from "./paneles/encargado/PanelEncargado";
import PerfilEncargado from "./paneles/encargado/PerfilEncargado";

function reducer(state, { type, payload }) {
  switch (type) {
    case "ADD_ENTREGA":    return { ...state, entregas:  [payload, ...state.entregas] };
    case "ADD_HISTORIAL":  return { ...state, historial: [payload, ...state.historial] };
    case "ADD_PTS":        return { ...state, pts: state.pts + payload };
    case "SET_PTS":        return { ...state, pts: payload };
    case "ADD_IA_HIST":    return { ...state, iaHist: [payload, ...state.iaHist] };
    case "SET_IA_RESULT":  return { ...state, iaResult: payload };
    case "SET_USUARIOS":   return { ...state, usuarios: payload };
    case "SET_ADMINS":     return { ...state, usuarios: [...state.usuarios.filter(u => u.rol !== "Admin"), ...payload] };
    case "ADD_USER":       return { ...state, usuarios: [...state.usuarios, payload] };
    case "UPDATE_USER":    return { ...state, usuarios: state.usuarios.map(u => u.id === payload.id ? payload : u) };
    case "TOGGLE_USER":    return { ...state, usuarios: state.usuarios.map(u => u.id === payload ? { ...u, activo: !u.activo } : u) };
    case "DEL_USER":       return { ...state, usuarios: state.usuarios.filter(u => u.id !== payload) };
    case "SET_ALIADOS":    return { ...state, aliados: payload };
    case "ADD_ALIADO":     return { ...state, aliados: [...(state.aliados || []), payload] };
    case "TOGGLE_ALIADO":  return { ...state, aliados: (state.aliados || []).map(u => u.id === payload ? { ...u, activo: !u.activo } : u) };
    case "DEL_ALIADO":     return { ...state, aliados: (state.aliados || []).filter(u => u.id !== payload) };
    case "SET_ENCARGADOS":   return { ...state, encargados: payload };
    case "ADD_ENCARGADO":    return { ...state, encargados: [payload, ...(state.encargados || [])] };
    case "UPDATE_ENCARGADO": return { ...state, encargados: (state.encargados || []).map(u => u.id === payload.id ? payload : u) };
    case "TOGGLE_ENCARGADO": return { ...state, encargados: (state.encargados || []).map(u => u.id === payload ? { ...u, activo: !u.activo } : u) };
    case "DEL_ENCARGADO":    return { ...state, encargados: (state.encargados || []).filter(u => u.id !== payload) };
    default: return state;
  }
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
  }, []);
  const remove = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), []);
  return { toasts, showToast, remove };
}

export default function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [state, dispatch]             = useReducer(reducer, INITIAL_STATE);
  const { toasts, showToast, remove } = useToast();

  // ── Cargar usuarios y admins al iniciar (o recargar) si hay sesión admin ──
  useEffect(() => {
    if (!user || user.rolSeleccionado === "encargado") return;

    // Cargar usuarios normales
    getUsuarios()
      .then(data => {
        const lista = (data.usuarios ?? data ?? []).map(u => ({
          id:       u.idUsuario,
          nombre:   u.nombre,
          email:    u.correo,
          telefono: u.telefono ?? "",
          rol:      "Usuario",
          zona:     "",
          pts:      0,
          activo:   u.idEstadoUsuario === 1,
          av:       (u.nombre ?? "").trim().split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join(""),
          fechaAlta: u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString("es-CO") : "—",
        }));
        dispatch({ type: "SET_USUARIOS", payload: lista });
      })
      .catch(() => {});

    // Cargar admins
    getAdmins()
      .then(data => {
        const lista = (data.admins ?? data.administradores ?? []).map(u => ({
          id:       u.idAdmin ?? u.idUsuario,
          nombre:   u.nombre,
          email:    u.correo,
          telefono: u.telefono ?? "",
          rol:      "Admin",
          zona:     "",
          pts:      0,
          activo:   u.idEstadoUsuario === 1,
          av:       (u.nombre ?? "").trim().split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join(""),
          fechaAlta: u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString("es-CO") : "—",
        }));
        dispatch({ type: "SET_ADMINS", payload: lista });
      })
      .catch(() => {});
  }, [user]);

  const handleLogin = (usuarioData) => {
    sessionStorage.setItem("user", JSON.stringify(usuarioData));
    setUser(usuarioData);

    // Redirigir según rol seleccionado en el login
    if (usuarioData.rolSeleccionado === "encargado") {
      navigate("/encargado/dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogout = async () => {
    try { await cerrarSesion(); } catch (_) {}
    sessionStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  // ───────── RUTAS PÚBLICAS ─────────
  if (!user) {
    return (
      <Routes>
        <Route path="/"        element={<LandingPage />} />
        <Route path="/login"   element={<Login onLogin={handleLogin} />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/forgot"  element={<ForgotPassword />} />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // ───────── PANEL ENCARGADO (layout propio) ─────────
  if (user.rolSeleccionado === "encargado") {
    return (
      <Routes>
        <Route path="/encargado/*" element={<PanelEncargado user={user} onLogout={handleLogout} />} />
        <Route path="*"            element={<Navigate to="/encargado/dashboard" replace />} />
      </Routes>
    );
  }

  // ───────── RUTAS PRIVADAS ADMIN ─────────
  const shared = { state, dispatch, showToast, navigate, user };

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={handleLogout} />
      <div className="main-content">
        <Topbar pts={state.pts} navigate={navigate} user={user} onLogout={handleLogout} />
        <div className="page-area">
          <Routes>
            <Route path="/"                              element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"                     element={<Dashboard       {...shared} />} />
            <Route path="/usuarios"                      element={<Usuarios        {...shared} />} />
            <Route path="/administradores"               element={<Administradores {...shared} />} />
            <Route path="/aliados"                       element={<Aliados         {...shared} />} />
            <Route path="/encargados"                    element={<Encargados      {...shared} />} />
            <Route path="/materiales"                    element={<Materiales      {...shared} />} />
            <Route path="/perfil"                        element={<Perfil state={state} showToast={showToast} user={user} />} />
            <Route path="/catalogos/roles"               element={<CatRoles              {...shared} />} />
            <Route path="/catalogos/estados-puntos"      element={<CatEstadosPuntos      {...shared} />} />
            <Route path="/catalogos/estados-materiales"  element={<CatEstadosMateriales  {...shared} />} />
            <Route path="/catalogos/estados-entregas"    element={<CatEstadosEntregas    {...shared} />} />
            <Route path="/catalogos/estados-aliados"     element={<CatEstadosAliados     {...shared} />} />
            <Route path="/catalogos/estados-canjes"      element={<CatEstadosCanjes      {...shared} />} />
            <Route path="/catalogos/estados-usuarios"    element={<CatEstadosUsuarios    {...shared} />} />
            <Route path="/catalogos/estados-recompensas" element={<CatEstadosRecompensas {...shared} />} />
            <Route path="/catalogos/tipos-recompensa"    element={<CatTiposRecompensa    {...shared} />} />
            <Route path="*"                              element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
      <ToastContainer toasts={toasts} remove={remove} />
    </div>
  );
}