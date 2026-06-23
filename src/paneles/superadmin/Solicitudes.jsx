import { useState, useEffect } from "react";
import {
  getSolicitudesRegistro,
  aprobarSolicitudRegistro,
  rechazarSolicitudRegistro,
} from "../../services/api";

const ESTILOS = {
  pendiente: { bg: "#fef3c7", color: "#92400e", label: "Pendiente" },
  aprobado: { bg: "#d1fae5", color: "#065f46", label: "Aprobado" },
  rechazado: { bg: "#fee2e2", color: "#991b1b", label: "Rechazado" },
};

export default function Solicitudes({ showToast }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rechazarId, setRechazarId] = useState(null);
  const [motivo, setMotivo] = useState("");

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getSolicitudesRegistro();
      setSolicitudes(data.solicitudes ?? []);
    } catch {
      showToast("Error al cargar solicitudes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleAprobar = async (id) => {
    try {
      await aprobarSolicitudRegistro(id);
      showToast("Solicitud aprobada. Usuario creado.", "success");
      cargar();
    } catch (err) {
      showToast(err.message || "Error al aprobar", "error");
    }
  };

  const handleRechazar = async (id) => {
    try {
      await rechazarSolicitudRegistro(id, motivo);
      showToast("Solicitud rechazada", "success");
      setRechazarId(null);
      setMotivo("");
      cargar();
    } catch (err) {
      showToast(err.message || "Error al rechazar", "error");
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold m-0">
          <i className="bi bi-file-earmark-text me-2"></i>
          Solicitudes de registro
        </h4>
        <button className="btn btn-outline-success btn-sm" onClick={cargar}>
          <i className="bi bi-arrow-clockwise me-1"></i>Actualizar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-inbox" style={{ fontSize: 48 }}></i>
          <p className="mt-2">No hay solicitudes pendientes</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Supermercado</th>
                <th>Mensaje</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => {
                const est = ESTILOS[s.estado] || ESTILOS.pendiente;
                return (
                  <tr key={s.idSolicitud}>
                    <td className="fw-medium">{s.nombre}</td>
                    <td>{s.correo}</td>
                    <td>
                      <span className={`badge ${s.rolSolicitado === "admin" ? "bg-danger" : "bg-primary"}`}>
                        <i className={`bi ${s.rolSolicitado === "admin" ? "bi-shield-lock" : "bi-person-badge"} me-1`}></i>
                        {s.rolSolicitado}
                      </span>
                    </td>
                    <td>{s.aliado?.nombre || "—"}</td>
                    <td>
                      {s.mensaje ? (
                        <span title={s.mensaje} style={{ cursor: "pointer", maxWidth: 150 }} className="d-inline-block text-truncate">
                          {s.mensaje}
                        </span>
                      ) : "—"}
                    </td>
                    <td>
                      <span
                        className="badge fw-medium px-3 py-2"
                        style={{ background: est.bg, color: est.color }}
                      >
                        {est.label}
                      </span>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {new Date(s.createdAt).toLocaleDateString("es-CO", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td>
                      {s.estado === "pendiente" && (
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-success btn-sm"
                            title="Aprobar"
                            onClick={() => handleAprobar(s.idSolicitud)}
                          >
                            <i className="bi bi-check-lg"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            title="Rechazar"
                            onClick={() => setRechazarId(s.idSolicitud)}
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {rechazarId && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => { setRechazarId(null); setMotivo(""); }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Rechazar solicitud</h5>
                <button
                  className="btn-close"
                  onClick={() => { setRechazarId(null); setMotivo(""); }}
                ></button>
              </div>
              <div className="modal-body">
                <label className="form-label">Motivo del rechazo (opcional):</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Indica el motivo por el que se rechaza..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => { setRechazarId(null); setMotivo(""); }}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleRechazar(rechazarId)}
                >
                  <i className="bi bi-x-lg me-1"></i>Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
