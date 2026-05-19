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

/** POST /api/auth/iniciar-sesion  { correo, password } */
export async function iniciarSesion(correo, password) {
  const data = await request('/api/auth/iniciar-sesion', {
    method: 'POST',
    body: JSON.stringify({ correo, password }),
  });
  if (data.token) setToken(data.token);
  return data;
}

/** DELETE /api/auth/cerrar-sesion */
export async function cerrarSesion() {
  const data = await request('/api/auth/cerrar-sesion', { method: 'DELETE' });
  clearToken();
  return data;
}

/** POST /api/auth/registrarse  { nombre, correo, password, telefono? } */
export async function registrarse(datos) {
  const data = await request('/api/auth/registrarse', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
  // No guardamos el token aquí: si un admin registra un usuario,
  // no debe reemplazar su propio token de sesión.
  // if (data.token) setToken(data.token);
  return data;
}

/** POST /api/auth/recuperar-password/solicitar  { correo } */
export async function solicitarRecuperacion(correo) {
  return request('/api/auth/recuperar-password/solicitar', {
    method: 'POST',
    body: JSON.stringify({ correo }),
  });
}

/** POST /api/auth/recuperar-password/restablecer  { correo, codigo, passwordNuevo } */
export async function restablecerPassword(datos) {
  return request('/api/auth/recuperar-password/restablecer', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

// ============================================================
// USUARIO  →  /api/usuario  (requiere token + rol usuario)
// ============================================================

/** GET /api/usuario/perfil */
export async function getPerfil() {
  return request('/api/usuario/perfil');
}

/** PUT /api/usuario/perfil  { nombre?, telefono?, imagen? } */
export async function actualizarPerfil(datos) {
  return request('/api/usuario/perfil', {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
}

/** PUT /api/usuario/perfil/cambiar-password  { passwordActual, passwordNuevo } */
export async function cambiarPassword(passwordActual, passwordNuevo) {
  return request('/api/usuario/perfil/cambiar-password', {
    method: 'PUT',
    body: JSON.stringify({ passwordActual, passwordNuevo }),
  });
}

/** GET /api/usuario/entregas */
export async function getEntregas() {
  return request('/api/usuario/entregas');
}

/** GET /api/usuario/entregas/:id */
export async function getEntrega(id) {
  return request(`/api/usuario/entregas/${id}`);
}

/** POST /api/usuario/entregas  { idPuntoReciclaje, materiales: [{idMaterial, pesoKg}] } */
export async function crearEntrega(datos) {
  return request('/api/usuario/entregas', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

/** GET /api/usuario/puntos  → { saldo, ganados, descontados, movimientos } */
export async function getPuntos() {
  return request('/api/usuario/puntos');
}

/** GET /api/usuario/puntos/historial  → { movimientos: [...] } */
export async function getHistorialPuntos() {
  return request('/api/usuario/puntos/historial');
}

/** GET /api/usuario/canjes */
export async function getCanjes() {
  return request('/api/usuario/canjes');
}

/** GET /api/usuario/canjes/:id */
export async function getCanje(id) {
  return request(`/api/usuario/canjes/${id}`);
}

/** POST /api/usuario/canjes  { idRecompensa } */
export async function canjearRecompensa(idRecompensa) {
  return request('/api/usuario/canjes', {
    method: 'POST',
    body: JSON.stringify({ idRecompensa }),
  });
}

// ============================================================
// ALIADO  →  /api/aliado  (requiere token + rol aliado)
// ============================================================

/** GET /api/aliado/perfil */
export async function getPerfilAliado() {
  return request('/api/aliado/perfil');
}

/** PUT /api/aliado/perfil */
export async function actualizarPerfilAliado(datos) {
  return request('/api/aliado/perfil', {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
}

/** POST /api/aliado/perfil/puntos */
export async function agregarPuntoReciclaje(datos) {
  return request('/api/aliado/perfil/puntos', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

/** PUT /api/aliado/perfil/puntos/:id */
export async function actualizarPuntoReciclaje(id, datos) {
  return request(`/api/aliado/perfil/puntos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
}

/** GET /api/aliado/entregas */
export async function getEntregasAliado() {
  return request('/api/aliado/entregas');
}

/** GET /api/aliado/entregas/:id */
export async function getEntregaAliado(id) {
  return request(`/api/aliado/entregas/${id}`);
}

/** PUT /api/aliado/entregas/:id/estado  { idEstadoEntrega } */
export async function actualizarEstadoEntrega(id, idEstadoEntrega) {
  return request(`/api/aliado/entregas/${id}/estado`, {
    method: 'PUT',
    body: JSON.stringify({ idEstadoEntrega }),
  });
}

// ── Estados de materiales ───────────────────────────────────
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

/** GET /api/aliado/clasificaciones */
export async function getClasificaciones() {
  return request('/api/aliado/clasificaciones');
}

/** POST /api/aliado/clasificaciones */
export async function crearClasificacion(datos) {
  return request('/api/aliado/clasificaciones', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

// ============================================================
// ADMIN  →  /api/admin  (requiere token + rol admin)
// ============================================================

// ── Administradores ─────────────────────────────────────────
export async function getAdmins()               { return request('/api/admin/admins'); }
export async function crearAdmin(datos)          { return request('/api/admin/admins', { method: 'POST', body: JSON.stringify(datos) }); }
export async function actualizarAdmin(id, datos) { return request(`/api/admin/admins/${id}`, { method: 'PUT', body: JSON.stringify(datos) }); }
export async function eliminarAdmin(id)          { return request(`/api/admin/admins/${id}`, { method: 'DELETE' }); }

// ── Usuarios ─────────────────────────────────────────────────
export async function getUsuarios()                { return request('/api/admin/usuarios'); }
export async function getUsuario(id)               { return request(`/api/admin/usuarios/${id}`); }
export async function actualizarUsuario(id, datos) { return request(`/api/admin/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(datos) }); }
export async function eliminarUsuario(id)          { return request(`/api/admin/usuarios/${id}`, { method: 'DELETE' }); }

// ── Aliados ──────────────────────────────────────────────────
export async function getAliados()                { return request('/api/admin/aliados'); }
export async function getAliado(id)               { return request(`/api/admin/aliados/${id}`); }
export async function crearAliado(datos)           { return request('/api/admin/aliados', { method: 'POST', body: JSON.stringify(datos) }); }
export async function actualizarAliado(id, datos) { return request(`/api/admin/aliados/${id}`, { method: 'PUT', body: JSON.stringify(datos) }); }
export async function eliminarAliado(id)          { return request(`/api/admin/aliados/${id}`, { method: 'DELETE' }); }

// ── Materiales ───────────────────────────────────────────────
export async function getMateriales()               { return request('/api/admin/materiales'); }
export async function getMaterial(id)               { return request(`/api/admin/materiales/${id}`); }
export async function crearMaterial(datos)          { return request('/api/admin/materiales', { method: 'POST', body: JSON.stringify(datos) }); }
export async function actualizarMaterial(id, datos) { return request(`/api/admin/materiales/${id}`, { method: 'PUT', body: JSON.stringify(datos) }); }
export async function eliminarMaterial(id)          { return request(`/api/admin/materiales/${id}`, { method: 'DELETE' }); }

// ── Recompensas ──────────────────────────────────────────────
export async function getRecompensas()                { return request('/api/admin/recompensas'); }
export async function getRecompensa(id)               { return request(`/api/admin/recompensas/${id}`); }
export async function crearRecompensa(datos)          { return request('/api/admin/recompensas', { method: 'POST', body: JSON.stringify(datos) }); }
export async function actualizarRecompensa(id, datos) { return request(`/api/admin/recompensas/${id}`, { method: 'PUT', body: JSON.stringify(datos) }); }
export async function eliminarRecompensa(id)          { return request(`/api/admin/recompensas/${id}`, { method: 'DELETE' }); }

// ── Roles ─────────────────────────────────────────────────────
export async function getRoles()               { return request('/api/admin/roles'); }
export async function crearRol(datos)          { return request('/api/admin/roles', { method: 'POST', body: JSON.stringify(datos) }); }
export async function actualizarRol(id, datos) { return request(`/api/admin/roles/${id}`, { method: 'PUT', body: JSON.stringify(datos) }); }
export async function eliminarRol(id)          { return request(`/api/admin/roles/${id}`, { method: 'DELETE' }); }

// ── Encargados ────────────────────────────────────────────────
export async function getEncargados()                { return request('/api/admin/encargados'); }
export async function getEncargado(id)               { return request(`/api/admin/encargados/${id}`); }
export async function crearEncargado(datos)          { return request('/api/admin/encargados', { method: 'POST', body: JSON.stringify(datos) }); }
export async function actualizarEncargado(id, datos) { return request(`/api/admin/encargados/${id}`, { method: 'PUT', body: JSON.stringify(datos) }); }
export async function eliminarEncargado(id)          { return request(`/api/admin/encargados/${id}`, { method: 'DELETE' }); }

// ── Entregas (admin) ──────────────────────────────────────────
export async function getEntregasAdmin()                        { return request('/api/admin/entregas'); }
export async function getEntregaAdmin(id)                       { return request(`/api/admin/entregas/${id}`); }
export async function actualizarEstadoEntregaAdmin(id, idEstadoEntrega) {
  return request(`/api/admin/entregas/${id}/estado`, {
    method: 'PUT',
    body: JSON.stringify({ idEstadoEntrega }),
  });
}