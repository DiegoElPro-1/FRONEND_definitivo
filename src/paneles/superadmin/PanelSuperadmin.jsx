import { Navigate, Route, Routes } from "react-router-dom";

import Sidebar           from "./Sidebar";

import Dashboard        from "../administrador/Dashboard";
import Usuarios         from "../administrador/Usuarios";
import Administradores  from "../administrador/Administradores";
import Aliados          from "../administrador/Aliados";
import Encargados       from "../administrador/Encargados";
import Materiales       from "../administrador/Materiales";
import Perfil           from "../administrador/Perfil";

import CatRoles               from "../administrador/catalogos/CatRoles";
import CatEstadosPuntos       from "../administrador/catalogos/CatEstadosPuntos";
import CatEstadosAliados      from "../administrador/catalogos/CatEstadosAliados";
import CatEstadosCanjes       from "../administrador/catalogos/CatEstadosCanjes";
import CatEstadosUsuarios     from "../administrador/catalogos/CatEstadosUsuarios";
import CatEstadosRecompensas  from "../administrador/catalogos/CatEstadosRecompensas";
import CatTiposRecompensa     from "../administrador/catalogos/CatTiposRecompensa";
import CatEstadosMateriales   from "../administrador/catalogos/CatEstadosMateriales";
import CatEstadosEntregas     from "../administrador/catalogos/CatEstadosEntregas";

export default function PanelSuperadmin({ user, onLogout, state, dispatch, showToast, navigate }) {
  const shared = { state, dispatch, showToast, navigate, user };

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="page-area">
          <Routes>
            <Route path="/"                        element={<Navigate to="/superadmin/dashboard" replace />} />
            <Route path="dashboard"                element={<Dashboard       {...shared} />} />
            <Route path="usuarios"                 element={<Usuarios        {...shared} />} />
            <Route path="administradores"          element={<Administradores {...shared} />} />
            <Route path="aliados"                  element={<Aliados         {...shared} />} />
            <Route path="encargados"               element={<Encargados      {...shared} />} />
            <Route path="materiales"               element={<Materiales      {...shared} />} />
            <Route path="perfil"                   element={<Perfil          {...shared} />} />
            <Route path="catalogos/roles"               element={<CatRoles              {...shared} />} />
            <Route path="catalogos/estados-puntos"      element={<CatEstadosPuntos      {...shared} />} />
            <Route path="catalogos/estados-materiales"  element={<CatEstadosMateriales  {...shared} />} />
            <Route path="catalogos/estados-entregas"    element={<CatEstadosEntregas    {...shared} />} />
            <Route path="catalogos/estados-aliados"     element={<CatEstadosAliados     {...shared} />} />
            <Route path="catalogos/estados-canjes"      element={<CatEstadosCanjes      {...shared} />} />
            <Route path="catalogos/estados-usuarios"    element={<CatEstadosUsuarios    {...shared} />} />
            <Route path="catalogos/estados-recompensas" element={<CatEstadosRecompensas {...shared} />} />
            <Route path="catalogos/tipos-recompensa"    element={<CatTiposRecompensa    {...shared} />} />
            <Route path="*"                        element={<Navigate to="/superadmin/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
