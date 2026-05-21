// ============================================================
// Configuración base
// ============================================================
const BASE_URL = 'http://localhost:3333';

export function setToken(t)  { localStorage.setItem("token", t); }
export function getToken()   { return localStorage.getItem("token"); }
export function clearToken() { localStorage.removeItem("token"); }

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = localStorage.getItem("token");
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.mensaje || `Error ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ============================================================
// AUTH  →  /api/auth
// ============================================================

export async function iniciarSesion(correo, password) {
  const data = await request('/api/auth/iniciar-sesion', {
    method: 'POST',
    body: JSON.stringify({ correo, password }),
  });
  if (data.token) setToken(data.token);
  return data;
}

export async function cerrarSesion() {
  const data = await request('/api/auth/cerrar-sesion', { method: 'DELETE' });
  clearToken();
  return data;
}

export async function registrarse(datos) {
  const data = await request('/api/auth/registrarse', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
  return data;
}

export async function solicitarRecuperacion(correo) {
  return request('/api/auth/recuperar-password/solicitar', {
    method: 'POST',
    body: JSON.stringify({ correo }),
  });
}

export async function restablecerPassword(datos) {
  return request('/api/auth/recuperar-password/restablecer', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

// ============================================================
// USUARIO  →  /api/usuario
// ============================================================

export async function getPerfil() {
  return request('/api/usuario/perfil');
}

export async function actualizarPerfil(datos) {
  return request('/api/usuario/perfil', {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
}

export async function cambiarPassword(passwordActual, passwordNuevo) {
  return request('/api/usuario/perfil/cambiar-password', {
    method: 'PUT',
    body: JSON.stringify({ passwordActual, passwordNuevo }),
  });
}

export async function getEntregas() {
  return request('/api/usuario/entregas');
}

export async function getEntrega(id) {
  return request(`/api/usuario/entregas/${id}`);
}

export async function crearEntrega(datos) {
  return request('/api/usuario/entregas', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export async function getPuntos() {
  return request('/api/usuario/puntos');
}

export async function getHistorialPuntos() {
  return request('/api/usuario/puntos/historial');
}

export async function getCanjes() {
  return request('/api/usuario/canjes');
}

export async function getCanje(id) {
  return request(`/api/usuario/canjes/${id}`);
}

export async function canjearRecompensa(idRecompensa) {
  return request('/api/usuario/canjes', {
    method: 'POST',
    body: JSON.stringify({ idRecompensa }),
  });
}

// ============================================================
// ALIADO  →  /api/aliado
// ============================================================

export async function getPerfilAliado() {
  return request('/api/aliado/perfil');
}

export async function actualizarPerfilAliado(datos) {
  return request('/api/aliado/perfil', {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
}

export async function agregarPuntoReciclaje(datos) {
  return request('/api/aliado/perfil/puntos', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export async function actualizarPuntoReciclaje(id, datos) {
  return request(`/api/aliado/perfil/puntos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
}

export async function getEntregasAliado() {
  return request('/api/aliado/entregas');
}

export async function getEntregaAliado(id) {
  return request(`/api/aliado/entregas/${id}`);
}

export async function actualizarEstadoEntrega(id, idEstadoEntrega) {
  return request(`/api/aliado/entregas/${id}/estado`, {
    method: 'PUT',
    body: JSON.stringify({ idEstadoEntrega }),
  });
}

export async function getEstadosMateriales() {
  return request('/api/admin/estados-materiales');
}

export async function crearEstadoMaterial(datos) {
  return request('/api/admin/estados-materiales', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export async function actualizarEstadoMaterial(id, datos) {
  return request(`/api/admin/estados-materiales/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
}

export async function eliminarEstadoMaterial(id) {
  return request(`/api/admin/estados-materiales/${id}`, {
    method: 'DELETE',
  });
}

export async function getClasificaciones() {
  return request('/api/aliado/clasificaciones');
}

export async function crearClasificacion(datos) {
  return request('/api/aliado/clasificaciones', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

// ============================================================
// ADMIN  →  /api/admin
// ============================================================

export async function getAdmins()               { return request('/api/admin/admins'); }
export async function crearAdmin(datos)          { return request('/api/admin/admins', { method: 'POST', body: JSON.stringify(datos) }); }
export async function actualizarAdmin(id, datos) { return request(`/api/admin/admins/${id}`, { method: 'PUT', body: JSON.stringify(datos) }); }
export async function eliminarAdmin(id)          { return request(`/api/admin/admins/${id}`, { method: 'DELETE' }); }

export async function getUsuarios()                { return request('/api/admin/usuarios'); }
export async function getUsuario(id)               { return request(`/api/admin/usuarios/${id}`); }
export async function actualizarUsuario(id, datos) { return request(`/api/admin/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(datos) }); }
export async function eliminarUsuario(id)          { return request(`/api/admin/usuarios/${id}`, { method: 'DELETE' }); }

export async function getAliados()                { return request('/api/admin/aliados'); }
export async function getAliado(id)               { return request(`/api/admin/aliados/${id}`); }
export async function crearAliado(datos)           { return request('/api/admin/aliados', { method: 'POST', body: JSON.stringify(datos) }); }
export async function actualizarAliado(id, datos) { return request(`/api/admin/aliados/${id}`, { method: 'PUT', body: JSON.stringify(datos) }); }
export async function eliminarAliado(id)          { return request(`/api/admin/aliados/${id}`, { method: 'DELETE' }); }

export async function getMateriales()               { return request('/api/admin/materiales'); }
export async function getMaterial(id)               { return request(`/api/admin/materiales/${id}`); }
export async function crearMaterial(datos)          { return request('/api/admin/materiales', { method: 'POST', body: JSON.stringify(datos) }); }
export async function actualizarMaterial(id, datos) { return request(`/api/admin/materiales/${id}`, { method: 'PUT', body: JSON.stringify(datos) }); }
export async function eliminarMaterial(id)          { return request(`/api/admin/materiales/${id}`, { method: 'DELETE' }); }

export async function getRecompensas()                { return request('/api/admin/recompensas'); }
export async function getRecompensa(id)               { return request(`/api/admin/recompensas/${id}`); }
export async function crearRecompensa(datos)          { return request('/api/admin/recompensas', { method: 'POST', body: JSON.stringify(datos) }); }
export async function actualizarRecompensa(id, datos) { return request(`/api/admin/recompensas/${id}`, { method: 'PUT', body: JSON.stringify(datos) }); }
export async function eliminarRecompensa(id)          { return request(`/api/admin/recompensas/${id}`, { method: 'DELETE' }); }

export async function getRoles()               { return request('/api/admin/roles'); }
export async function crearRol(datos)          { return request('/api/admin/roles', { method: 'POST', body: JSON.stringify(datos) }); }
export async function actualizarRol(id, datos) { return request(`/api/admin/roles/${id}`, { method: 'PUT', body: JSON.stringify(datos) }); }
export async function eliminarRol(id)          { return request(`/api/admin/roles/${id}`, { method: 'DELETE' }); }

export async function getEncargados()                { return request('/api/admin/encargados'); }
export async function getEncargado(id)               { return request(`/api/admin/encargados/${id}`); }
export async function crearEncargado(datos)          { return request('/api/admin/encargados', { method: 'POST', body: JSON.stringify(datos) }); }
export async function actualizarEncargado(id, datos) { return request(`/api/admin/encargados/${id}`, { method: 'PUT', body: JSON.stringify(datos) }); }
export async function eliminarEncargado(id)          { return request(`/api/admin/encargados/${id}`, { method: 'DELETE' }); }

export async function getEntregasAdmin()                        { return request('/api/admin/entregas'); }
export async function getEntregaAdmin(id)                       { return request(`/api/admin/entregas/${id}`); }
export async function actualizarEstadoEntregaAdmin(id, idEstadoEntrega) {
  return request(`/api/admin/entregas/${id}/estado`, {
    method: 'PUT',
    body: JSON.stringify({ idEstadoEntrega }),
  });
}

// ============================================================
// ENCARGADO  →  /api/encargado
// ============================================================

export async function buscarUsuariosEncargado(q = '') {
  return request(`/api/encargado/usuarios?q=${encodeURIComponent(q)}`);
}

export async function getMaterialesEncargado() {
  return request('/api/encargado/materiales');
}

export async function getEntregasEncargado() {
  return request('/api/encargado/entregas');
}

export async function getEntregaEncargado(id) {
  return request(`/api/encargado/entregas/${id}`);
}

export async function registrarEntregaEncargado(datos) {
  return request('/api/encargado/entregas', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export async function getCanjesEncargado() {
  return request('/api/encargado/canjes');
}

export async function getCanjeEncargado(id) {
  return request(`/api/encargado/canjes/${id}`);
}

export async function registrarCanjeEncargado(datos) {
  return request('/api/encargado/canjes', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export async function actualizarEstadoCanjeEncargado(id, idEstadoCanje) {
  return request(`/api/encargado/canjes/${id}/estado`, {
    method: 'PUT',
    body: JSON.stringify({ idEstadoCanje }),
  });
}

// ← FUNCIÓN NUEVA AGREGADA
export async function actualizarEstadoEntregaEncargado(id, idEstadoEntrega) {
  return request(`/api/encargado/entregas/${id}/estado`, {
    method: 'PUT',
    body: JSON.stringify({ idEstadoEntrega }),
  });
}