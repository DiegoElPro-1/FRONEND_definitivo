// src/components/Badge.jsx
export default function Badge({ estado }) {
  const map = {
    Pendiente:  { cls: "bg-warning text-dark border border-dark",    icon: "bi-clock-fill"        },
    Completada: { cls: "bg-success text-white border border-dark",   icon: "bi-check-circle-fill" },
    Cancelada:  { cls: "bg-dark text-warning border border-warning", icon: "bi-x-circle-fill"     },
  };
  const s = map[estado] || map.Pendiente;
  return (
    <span
      className={`badge rounded-pill d-inline-flex align-items-center gap-1 px-2 py-1 fw-bold ${s.cls}`}
      style={{ fontSize: 11 }}
    >
      <i className={`bi ${s.icon}`} />
      {estado}
    </span>
  );
}