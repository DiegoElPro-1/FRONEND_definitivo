// src/paneles/encargado/Canjes.jsx
import { useState } from "react";
import { C, S, Av, BadgeCanje, getIniciales, getPtsUsuario, getPtsRecompensa, generarCodigo, capitalizar } from "./encargadoTheme";

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
const USUARIOS_MOCK = [
  { idUsuario: 1, nombre: "Diego Ramírez",    puntosDisponibles: 320, correo: "diego@mail.com"   },
  { idUsuario: 2, nombre: "Laura Martínez",   puntosDisponibles: 150, correo: "laura@mail.com"   },
  { idUsuario: 3, nombre: "Carlos Jiménez",   puntosDisponibles: 480, correo: "carlos@mail.com"  },
  { idUsuario: 4, nombre: "Sofía Peña",       puntosDisponibles: 90,  correo: "sofia@mail.com"   },
  { idUsuario: 5, nombre: "Andrés Torres",    puntosDisponibles: 210, correo: "andres@mail.com"  },
  { idUsuario: 6, nombre: "Valentina Ruiz",   puntosDisponibles: 560, correo: "vale@mail.com"    },
];

const ENTREGAS_MOCK = {
  1: [
    { id: 1,  material: "Papel",    kg: 2.5, puntos: 80,  fecha: "2026-03-12" },
    { id: 2,  material: "Cartón",   kg: 4.0, puntos: 120, fecha: "2026-03-20" },
    { id: 3,  material: "Vidrio",   kg: 1.8, puntos: 60,  fecha: "2026-03-28" },
    { id: 4,  material: "Plástico", kg: 1.2, puntos: 60,  fecha: "2026-04-05" },
  ],
  2: [
    { id: 5,  material: "Papel",    kg: 1.0, puntos: 30,  fecha: "2026-04-01" },
    { id: 6,  material: "Plástico", kg: 2.0, puntos: 80,  fecha: "2026-04-10" },
    { id: 7,  material: "Cartón",   kg: 1.5, puntos: 40,  fecha: "2026-04-18" },
  ],
  3: [
    { id: 8,  material: "Vidrio",   kg: 3.0, puntos: 90,  fecha: "2026-02-10" },
    { id: 9,  material: "Papel",    kg: 5.0, puntos: 150, fecha: "2026-02-28" },
    { id: 10, material: "Plástico", kg: 4.0, puntos: 120, fecha: "2026-03-15" },
    { id: 11, material: "Cartón",   kg: 4.0, puntos: 120, fecha: "2026-04-02" },
  ],
  4: [
    { id: 12, material: "Papel",    kg: 1.5, puntos: 45,  fecha: "2026-04-20" },
    { id: 13, material: "Vidrio",   kg: 1.0, puntos: 30,  fecha: "2026-04-25" },
    { id: 14, material: "Cartón",   kg: 0.5, puntos: 15,  fecha: "2026-05-01" },
  ],
  5: [
    { id: 15, material: "Plástico", kg: 3.5, puntos: 105, fecha: "2026-03-05" },
    { id: 16, material: "Papel",    kg: 2.0, puntos: 60,  fecha: "2026-03-22" },
    { id: 17, material: "Vidrio",   kg: 1.5, puntos: 45,  fecha: "2026-04-14" },
  ],
  6: [
    { id: 18, material: "Cartón",   kg: 6.0, puntos: 180, fecha: "2026-02-15" },
    { id: 19, material: "Plástico", kg: 5.0, puntos: 150, fecha: "2026-03-10" },
    { id: 20, material: "Papel",    kg: 3.0, puntos: 90,  fecha: "2026-03-30" },
    { id: 21, material: "Vidrio",   kg: 2.0, puntos: 60,  fecha: "2026-04-22" },
    { id: 22, material: "Cartón",   kg: 2.5, puntos: 80,  fecha: "2026-05-05" },
  ],
};

const RECOMPENSAS_MOCK = [
  { idRecompensa: 1, nombre: "Bolsa ecológica",       puntosRequeridos: 100, stock: 15, mercado: "Punto Verde Centro"  },
  { idRecompensa: 2, nombre: "Taza reutilizable",     puntosRequeridos: 150, stock: 8,  mercado: "Punto Verde Centro"  },
  { idRecompensa: 3, nombre: "Descuento 10% mercado", puntosRequeridos: 200, stock: 20, mercado: "Mercado Sur"         },
  { idRecompensa: 4, nombre: "Kit de semillas",       puntosRequeridos: 250, stock: 5,  mercado: "Punto Verde Centro"  },
  { idRecompensa: 5, nombre: "Botella térmica",       puntosRequeridos: 350, stock: 3,  mercado: "Mercado Norte"       },
  { idRecompensa: 6, nombre: "Camiseta reciclada",    puntosRequeridos: 500, stock: 6,  mercado: "Punto Verde Centro"  },
];

const HISTORIAL_MOCK = [
  { idCanje: 1, usuario: "Diego Ramírez",  recompensa: "Bolsa ecológica",   puntosUsados: 100, codigoCanje: "ECO-A1B2", fechaCanje: "2026-04-10", estadoCanje: { nombre: "Canjeado"  } },
  { idCanje: 2, usuario: "Carlos Jiménez", recompensa: "Taza reutilizable", puntosUsados: 150, codigoCanje: "ECO-C3D4", fechaCanje: "2026-04-18", estadoCanje: { nombre: "Pendiente" } },
  { idCanje: 3, usuario: "Valentina Ruiz", recompensa: "Kit de semillas",   puntosUsados: 250, codigoCanje: "ECO-E5F6", fechaCanje: "2026-05-02", estadoCanje: { nombre: "Canjeado"  } },
  { idCanje: 4, usuario: "Andrés Torres",  recompensa: "Bolsa ecológica",   puntosUsados: 100, codigoCanje: "ECO-G7H8", fechaCanje: "2026-05-10", estadoCanje: { nombre: "Pendiente" } },
];

const MATERIAL_ICON = {
  Papel:    { icon: "bi-file-earmark",  bg: "#fff3cd",   color: "#856404"      },
  Cartón:   { icon: "bi-box-seam",      bg: C.verdeClaro, color: C.verdeOscuro },
  Vidrio:   { icon: "bi-cup-straw",     bg: "#e3f2fd",   color: "#1565c0"      },
  Plástico: { icon: "bi-bag",           bg: "#f3e5f5",   color: "#6a1b9a"      },
};

// ── COMPONENTE ────────────────────────────────────────────────────────────────
export default function Canjes() {
  const [tab,           setTab]           = useState("canjear");
  const [busqueda,      setBusqueda]      = useState("");
  const [usuarioSel,    setUsuarioSel]    = useState(null);
  const [recompSel,     setRecompSel]     = useState(null);
  const [comprobante,   setComprobante]   = useState(null);
  const [historial,     setHistorial]     = useState(HISTORIAL_MOCK);
  const [mostrarDrop,   setMostrarDrop]   = useState(false);

  const usuariosFiltrados = busqueda.trim().length > 0 && !usuarioSel
    ? USUARIOS_MOCK.filter(u => u.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    : [];

  const seleccionarUsuario = (u) => {
    setUsuarioSel(u);
    setBusqueda(u.nombre);
    setMostrarDrop(false);
    setRecompSel(null);
  };

  const limpiar = () => {
    setBusqueda(""); setUsuarioSel(null);
    setRecompSel(null); setMostrarDrop(false);
  };

  const entregas    = usuarioSel ? (ENTREGAS_MOCK[usuarioSel.idUsuario] ?? []) : [];
  const ptsEntregas = entregas.reduce((a, e) => a + e.puntos, 0);
  const ptsUsuario  = usuarioSel ? getPtsUsuario(usuarioSel) : 0;

  // recompensas que el usuario SÍ puede canjear
  const recompensasDisponibles = RECOMPENSAS_MOCK.filter(r => !usuarioSel || ptsUsuario >= getPtsRecompensa(r));
  const recompensasNoDisponibles = RECOMPENSAS_MOCK.filter(r => usuarioSel && ptsUsuario < getPtsRecompensa(r));

  const handleCanjear = () => {
    if (!usuarioSel || !recompSel) return;
    const codigo = generarCodigo();
    const nuevoCanje = {
      idCanje:      historial.length + 1,
      usuario:      usuarioSel.nombre,
      recompensa:   recompSel.nombre,
      puntosUsados: getPtsRecompensa(recompSel),
      codigoCanje:  codigo,
      fechaCanje:   new Date().toISOString().split("T")[0],
      estadoCanje:  { nombre: "Pendiente" },
    };
    setHistorial(prev => [nuevoCanje, ...prev]);
    setComprobante({
      usuario:    usuarioSel.nombre,
      recompensa: recompSel.nombre,
      pts:        getPtsRecompensa(recompSel),
      fecha:      nuevoCanje.fechaCanje,
      codigo,
    });
    limpiar();
  };

  const handleCambiarEstado = (id, estadoActual) => {
    setHistorial(prev => prev.map(h =>
      (h.idCanje ?? h.id) === id
        ? { ...h, estadoCanje: { nombre: estadoActual === "Canjeado" ? "Pendiente" : "Canjeado" } }
        : h
    ));
  };

  return (
    <div>
      {/* Pestañas */}
      <div className="d-flex gap-2 mb-4">
        {[
          { key: "canjear",   icon: "bi-gift",         label: "Gestión de canjes"   },
          { key: "historial", icon: "bi-clock-history", label: "Historial de canjes" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="btn fw-bold d-flex align-items-center gap-2"
            style={tab === t.key ? S.tabActivo : S.tabInactivo}>
            <i className={`bi ${t.icon}`} /> {t.label}
          </button>
        ))}
      </div>

      {/* ── GESTIÓN DE CANJES ── */}
      {tab === "canjear" && (
        <div className="row g-4">
          <div className="col-lg-7">

            {/* Buscar usuario */}
            <div className="card mb-3" style={S.card}>
              <div className="card-body p-3">
                <div className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ fontSize: 14, color: C.negro }}>
                  <i className="bi bi-person" style={{ color: C.verde }} />Buscar usuario
                </div>
                <div className="fw-semibold mb-3" style={{ fontSize: 12, color: C.grisTexto }}>Escribe el nombre del reciclador</div>

                <div className="position-relative">
                  <div className="input-group">
                    <span className="input-group-text bg-white" style={{ border: `1.5px solid ${C.verdeBorde}` }}>
                      <i className="bi bi-search text-secondary" />
                    </span>
                    <input type="text" className="form-control" placeholder="Ej: Diego Ramírez"
                      value={busqueda}
                      style={{ ...S.input, fontSize: 13 }}
                      onChange={e => { setBusqueda(e.target.value); setUsuarioSel(null); setMostrarDrop(true); }}
                    />
                    {busqueda && (
                      <button className="btn btn-outline-secondary" style={{ border: `1.5px solid ${C.verdeBorde}` }} onClick={limpiar}>
                        <i className="bi bi-x-lg" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown resultados */}
                  {mostrarDrop && usuariosFiltrados.length > 0 && (
                    <div className="position-absolute w-100 bg-white rounded-3 shadow mt-1" style={{ zIndex: 99, border: `1.5px solid ${C.verdeBorde}` }}>
                      {usuariosFiltrados.map(u => (
                        <button key={u.idUsuario}
                          className="btn w-100 d-flex align-items-center gap-3 px-3 py-2 text-start border-0 rounded-0"
                          onClick={() => seleccionarUsuario(u)} style={{ fontSize: 13 }}
                          onMouseEnter={e => e.currentTarget.style.background = C.verdeClaro}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <Av text={getIniciales(u.nombre)} size={34} />
                          <div>
                            <div className="fw-bold" style={{ color: C.negro }}>{u.nombre}</div>
                            <div style={{ fontSize: 11, color: C.grisTexto }}>
                              <i className="bi bi-star-fill me-1" style={{ color: C.verde }} />
                              {u.puntosDisponibles} puntos disponibles
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {mostrarDrop && busqueda.trim().length > 0 && usuariosFiltrados.length === 0 && (
                    <div className="position-absolute w-100 bg-white rounded-3 shadow mt-1 px-3 py-2"
                      style={{ zIndex: 99, border: `1.5px solid ${C.verdeBorde}`, fontSize: 13, color: C.grisTexto }}>
                      Sin resultados para "{busqueda}"
                    </div>
                  )}
                </div>

                {/* Usuario seleccionado */}
                {usuarioSel && (
                  <div className="mt-3 p-3 rounded-3 d-flex align-items-center gap-3" style={S.chipUsuario}>
                    <Av text={getIniciales(usuarioSel.nombre)} size={44} />
                    <div className="flex-grow-1">
                      <div className="fw-bold" style={{ fontSize: 14, color: C.negro }}>{usuarioSel.nombre}</div>
                      <div style={{ fontSize: 12, color: C.grisTexto }}>Usuario reciclador</div>
                    </div>
                    <div className="text-center">
                      <div className="fw-bold lh-1" style={{ fontSize: 22, color: C.verdeOscuro }}>{ptsUsuario}</div>
                      <div style={{ fontSize: 10, color: C.grisTexto }}>PUNTOS</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Entregas del usuario */}
            {usuarioSel && (
              <div className="card mb-3" style={S.card}>
                <div className="card-body p-3">
                  <div className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize: 14, color: C.negro }}>
                    <i className="bi bi-recycle" style={{ color: C.verde }} />
                    Entregas de {usuarioSel.nombre.split(" ")[0]}
                  </div>

                  {entregas.length === 0 ? (
                    <div className="text-center py-3" style={{ fontSize: 13, color: C.grisTexto }}>
                      <i className="bi bi-inbox d-block mb-1" style={{ fontSize: 22 }} />Sin entregas registradas
                    </div>
                  ) : (
                    <>
                      {entregas.map(e => {
                        const m = MATERIAL_ICON[e.material] ?? { icon: "bi-recycle", bg: C.verdeClaro, color: C.verdeOscuro };
                        return (
                          <div key={e.id} className="d-flex align-items-center gap-3 py-2"
                            style={{ borderBottom: `1px solid ${C.verdeClaro}` }}>
                            <div className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                              style={{ width: 36, height: 36, backgroundColor: m.bg, color: m.color }}>
                              <i className={`bi ${m.icon}`} style={{ fontSize: 16 }} />
                            </div>
                            <div className="flex-grow-1">
                              <div className="fw-bold" style={{ fontSize: 13, color: C.negro }}>{e.material}</div>
                              <div style={{ fontSize: 11, color: C.grisTexto }}>{e.fecha} · {e.kg} kg</div>
                            </div>
                            <span style={S.badgePuntos}>+{e.puntos} pts</span>
                          </div>
                        );
                      })}
                      <div className="d-flex align-items-center justify-content-between mt-3 p-2 rounded-2"
                        style={S.cajaTotalVerde}>
                        <span className="fw-bold" style={{ fontSize: 13, color: C.negro }}>Total acumulado</span>
                        <span className="fw-bold" style={{ fontSize: 16, color: C.verdeOscuro }}>
                          <i className="bi bi-star-fill me-1" />{ptsEntregas} pts
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Recompensas */}
            <div className="card" style={S.card}>
              <div className="card-body p-3">
                <div className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ fontSize: 14, color: C.negro }}>
                  <i className="bi bi-gift" style={{ color: C.verde }} />Recompensas disponibles
                  {usuarioSel && <span style={{ fontSize: 11, color: C.grisTexto, fontWeight: 400 }}>— según los puntos de {usuarioSel.nombre.split(" ")[0]}</span>}
                </div>

                {/* Sin usuario: muestra todas */}
                {!usuarioSel && (
                  <div className="row g-2 mt-2">
                    {RECOMPENSAS_MOCK.map(r => (
                      <div className="col-6" key={r.idRecompensa}>
                        <div className="p-3 rounded-2 d-flex flex-column gap-1"
                          style={{ border: `1.5px solid ${C.verdeBorde}`, backgroundColor: C.grisFondo }}>
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-gift" style={{ color: C.verdeMedio, fontSize: 15 }} />
                            <span className="fw-bold" style={{ fontSize: 12, color: C.negro }}>{r.nombre}</span>
                          </div>
                          <div className="d-flex align-items-center justify-content-between mt-1">
                            <span style={S.badgePuntos}><i className="bi bi-star me-1" />{r.puntosRequeridos} pts</span>
                            <span style={{ fontSize: 10, color: C.grisTexto }}>Stock: {r.stock}</span>
                          </div>
                          <div style={{ fontSize: 10, color: C.grisTexto }}><i className="bi bi-shop me-1" />{r.mercado}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Con usuario: separa las que puede y no puede */}
                {usuarioSel && (
                  <>
                    {recompensasDisponibles.length === 0 && (
                      <div className="text-center py-3 mt-2" style={{ fontSize: 13, color: C.grisTexto }}>
                        <i className="bi bi-emoji-frown d-block mb-1" style={{ fontSize: 22 }} />
                        {usuarioSel.nombre.split(" ")[0]} aún no tiene puntos suficientes para ninguna recompensa
                      </div>
                    )}

                    {recompensasDisponibles.length > 0 && (
                      <>
                        <div className="fw-bold mb-2 mt-2 d-flex align-items-center gap-1" style={{ fontSize: 11, color: C.verde }}>
                          <i className="bi bi-check-circle-fill" />Puede canjear ({recompensasDisponibles.length})
                        </div>
                        <div className="row g-2 mb-3">
                          {recompensasDisponibles.map(r => {
                            const activa = recompSel?.idRecompensa === r.idRecompensa;
                            return (
                              <div className="col-6" key={r.idRecompensa}>
                                <button type="button" onClick={() => setRecompSel(activa ? null : r)}
                                  className="btn w-100 h-100 d-flex flex-column align-items-start p-3 rounded-2 text-start"
                                  style={{
                                    border: activa ? `2px solid ${C.verde}` : `1.5px solid ${C.verdeBorde}`,
                                    backgroundColor: activa ? C.verdeClaro : C.blanco,
                                  }}>
                                  <div className="d-flex align-items-center gap-2 mb-1 w-100">
                                    <i className="bi bi-gift" style={{ fontSize: 15, color: activa ? C.verdeOscuro : C.verdeMedio }} />
                                    <span className="fw-bold" style={{ fontSize: 12, color: C.negro }}>{r.nombre}</span>
                                    {activa && <i className="bi bi-check-circle-fill ms-auto" style={{ color: C.verde }} />}
                                  </div>
                                  <div className="d-flex align-items-center justify-content-between w-100 mt-1">
                                    <span style={S.badgePuntos}><i className="bi bi-star me-1" />{r.puntosRequeridos} pts</span>
                                    <span style={{ fontSize: 10, color: C.grisTexto }}>Stock: {r.stock}</span>
                                  </div>
                                  <div style={{ fontSize: 10, color: C.grisTexto, marginTop: 4 }}>
                                    <i className="bi bi-shop me-1" />{r.mercado}
                                  </div>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {recompensasNoDisponibles.length > 0 && (
                      <>
                        <div className="fw-bold mb-2 d-flex align-items-center gap-1" style={{ fontSize: 11, color: C.grisTexto }}>
                          <i className="bi bi-lock-fill" />Sin puntos suficientes ({recompensasNoDisponibles.length})
                        </div>
                        <div className="row g-2">
                          {recompensasNoDisponibles.map(r => (
                            <div className="col-6" key={r.idRecompensa}>
                              <div className="p-3 rounded-2 d-flex flex-column gap-1"
                                style={{ border: `1.5px solid ${C.grisBorde}`, backgroundColor: C.grisFondo, opacity: 0.6 }}>
                                <div className="d-flex align-items-center gap-2">
                                  <i className="bi bi-lock" style={{ color: C.grisBorde, fontSize: 13 }} />
                                  <span className="fw-bold" style={{ fontSize: 12, color: C.grisTexto }}>{r.nombre}</span>
                                </div>
                                <div className="d-flex align-items-center justify-content-between mt-1">
                                  <span style={{ ...S.badgePuntos, backgroundColor: C.grisFondo, color: C.grisTexto, border: `1px solid ${C.grisBorde}` }}>
                                    <i className="bi bi-star me-1" />{r.puntosRequeridos} pts
                                  </span>
                                  <span style={{ fontSize: 10, color: C.grisTexto }}>
                                    Faltan {r.puntosRequeridos - ptsUsuario} pts
                                  </span>
                                </div>
                                <div style={{ fontSize: 10, color: C.grisTexto }}><i className="bi bi-shop me-1" />{r.mercado}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── RESUMEN ── */}
          <div className="col-lg-5">
            <div className="card" style={{ ...S.card, position: "sticky", top: 20 }}>
              <div className="card-body p-3">
                <div className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize: 14, color: C.negro }}>
                  <i className="bi bi-receipt" style={{ color: C.verde }} />Resumen del canje
                </div>

                {/* Usuario */}
                <div className="mb-2">
                  <div className="fw-bold text-uppercase mb-1" style={{ fontSize: 10, letterSpacing: 1, color: C.grisTexto }}>Usuario</div>
                  <div className="p-2 rounded-2 d-flex align-items-center gap-2"
                    style={{ minHeight: 44, border: `1.5px solid ${C.verdeBorde}`, backgroundColor: C.grisFondo }}>
                    {usuarioSel
                      ? <><Av text={getIniciales(usuarioSel.nombre)} size={28} /><span className="fw-bold" style={{ fontSize: 13, color: C.negro }}>{usuarioSel.nombre}</span></>
                      : <span style={{ fontSize: 12, color: C.grisTexto }}>Sin usuario seleccionado</span>}
                  </div>
                </div>

                {/* Recompensa */}
                <div className="mb-2">
                  <div className="fw-bold text-uppercase mb-1" style={{ fontSize: 10, letterSpacing: 1, color: C.grisTexto }}>Recompensa</div>
                  <div className="p-2 rounded-2 d-flex align-items-center gap-2"
                    style={{ minHeight: 44, border: `1.5px solid ${C.verdeBorde}`, backgroundColor: C.grisFondo }}>
                    {recompSel
                      ? <span className="fw-bold" style={{ fontSize: 13, color: C.negro }}>{recompSel.nombre}</span>
                      : <span style={{ fontSize: 12, color: C.grisTexto }}>Sin recompensa seleccionada</span>}
                  </div>
                </div>

                {/* Puntos */}
                <div className="mb-3">
                  <div className="fw-bold text-uppercase mb-1" style={{ fontSize: 10, letterSpacing: 1, color: C.grisTexto }}>Puntos</div>
                  <div className="row g-2">
                    <div className="col-6">
                      <div className="p-2 rounded-2 text-center" style={S.statBox}>
                        <div className="fw-bold" style={{ fontSize: 20, color: C.verdeOscuro }}>{usuarioSel ? ptsUsuario : "—"}</div>
                        <div style={{ fontSize: 10, color: C.grisTexto }}>Disponibles</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-2 rounded-2 text-center" style={recompSel ? S.statBoxActivo : S.statBox}>
                        <div className="fw-bold" style={{ fontSize: 20, color: C.verdeOscuro }}>{recompSel ? `- ${getPtsRecompensa(recompSel)}` : "—"}</div>
                        <div style={{ fontSize: 10, color: C.grisTexto }}>A descontar</div>
                      </div>
                    </div>
                  </div>

                  {usuarioSel && recompSel && (() => {
                    const pR = getPtsRecompensa(recompSel);
                    const alcanza = ptsUsuario >= pR;
                    return (
                      <div className="mt-2 p-2 rounded-2 text-center fw-bold"
                        style={{ fontSize: 13, border: `1.5px solid ${alcanza ? C.verdeMedio : C.rojoBorde}`, backgroundColor: alcanza ? C.verdeClaro : C.rojoclaro, color: alcanza ? C.verdeOscuro : C.rojo }}>
                        {alcanza
                          ? <><i className="bi bi-check-circle me-1" />{ptsUsuario - pR} pts restantes</>
                          : <><i className="bi bi-exclamation-circle me-1" />Puntos insuficientes</>}
                      </div>
                    );
                  })()}
                </div>

                <div className="d-grid">
                  <button onClick={handleCanjear}
                    disabled={!usuarioSel || !recompSel || ptsUsuario < (recompSel ? getPtsRecompensa(recompSel) : 0)}
                    className="btn fw-bold py-2 d-flex align-items-center justify-content-center gap-2"
                    style={S.btnPrimario}>
                    <i className="bi bi-gift" /> Canjear recompensa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORIAL ── */}
      {tab === "historial" && (
        <div className="card" style={S.card}>
          <div className="card-body p-3">
            <div className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ fontSize: 14, color: C.negro }}>
              <i className="bi bi-clock-history" style={{ color: C.verde }} />Historial de canjes
            </div>

            {historial.length === 0 ? (
              <div className="text-center py-5" style={{ fontSize: 13, color: C.grisTexto }}>
                <i className="bi bi-inbox d-block mb-2" style={{ fontSize: 30 }} />No hay canjes registrados
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0" style={{ fontSize: 13, borderColor: C.verdeClaro }}>
                  <thead style={S.tableHead}>
                    <tr>
                      {["Usuario","Recompensa","Puntos","Código","Fecha","Estado","Acción"].map(h => (
                        <th key={h} className="fw-bold px-3 py-2" style={S.tableHeadTh}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map(h => {
                      const hId    = h.idCanje ?? h.id;
                      const estado = capitalizar(h.estadoCanje?.nombre ?? "Pendiente");
                      return (
                        <tr key={hId} style={S.tableRow}>
                          <td className="px-3 py-2 fw-bold" style={{ color: C.negro }}>{h.usuario}</td>
                          <td className="px-3 py-2">{h.recompensa}</td>
                          <td className="px-3 py-2 text-center"><span style={S.badgePuntos}><i className="bi bi-star me-1" />{h.puntosUsados}</span></td>
                          <td className="px-3 py-2">
                            <span style={S.badgeCodigo}><i className="bi bi-upc me-1" />{h.codigoCanje}</span>
                          </td>
                          <td className="px-3 py-2" style={{ color: C.grisTexto }}>{h.fechaCanje?.split("T")[0]}</td>
                          <td className="px-3 py-2 text-center"><BadgeCanje estado={estado} /></td>
                          <td className="px-3 py-2 text-center">
                            <button onClick={() => handleCambiarEstado(hId, estado)}
                              className="btn btn-sm fw-bold"
                              style={{ fontSize: 11, border: `1.5px solid ${C.verdeBorde}`, borderRadius: 6,
                                backgroundColor: estado === "Canjeado" ? C.blanco : C.verdeClaro, color: C.verdeOscuro }}>
                              <i className={`bi ${estado === "Canjeado" ? "bi-arrow-counterclockwise" : "bi-check-circle"}`} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL COMPROBANTE ── */}
      {comprobante && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={S.modalOverlay} onClick={() => setComprobante(null)}>
          <div className="bg-white rounded-3 p-4 text-center shadow"
            style={{ maxWidth: 320, width: "90%", border: `1.5px solid ${C.verdeBorde}` }}
            onClick={e => e.stopPropagation()}>
            <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: 60, height: 60, backgroundColor: C.verdeClaro, border: `2px solid ${C.verdeMedio}` }}>
              <i className="bi bi-check-lg" style={{ fontSize: 28, color: C.verdeOscuro }} />
            </div>
            <div className="fw-bold mb-1" style={{ fontSize: 17, color: C.negro }}>¡Canje exitoso!</div>
            <div className="mb-3" style={{ fontSize: 12, color: C.grisTexto }}>Comprobante generado</div>
            <div className="rounded-2 p-3 mb-3" style={{ backgroundColor: C.verdeClaro, border: `1.5px solid ${C.verdeMedio}` }}>
              <div className="fw-bold" style={{ fontSize: 11, color: C.verde }}>CÓDIGO</div>
              <div className="fw-bold" style={{ fontSize: 24, letterSpacing: 3, color: C.verdeOscuro }}>{comprobante.codigo}</div>
            </div>
            <div className="text-start rounded-2 p-3 mb-3" style={{ fontSize: 13, border: `1.5px solid ${C.verdeBorde}` }}>
              {[["Usuario", comprobante.usuario], ["Recompensa", comprobante.recompensa], ["Fecha", comprobante.fecha]].map(([l, v]) => (
                <div key={l} className="d-flex justify-content-between mb-1">
                  <span style={{ color: C.grisTexto }}>{l}</span>
                  <span className="fw-bold" style={{ color: C.negro }}>{v}</span>
                </div>
              ))}
              <div className="d-flex justify-content-between">
                <span style={{ color: C.grisTexto }}>Puntos usados</span>
                <span className="fw-bold" style={{ color: C.rojo }}>-{comprobante.pts} pts</span>
              </div>
            </div>
            <button className="btn fw-bold w-100" style={S.btnPrimario} onClick={() => setComprobante(null)}>
              <i className="bi bi-check2 me-2" />Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}