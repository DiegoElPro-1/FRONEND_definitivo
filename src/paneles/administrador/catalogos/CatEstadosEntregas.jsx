import { useState, useEffect } from "react";
import CrudCatalogo from "./CrudCatalogo";
import { getEstadosEntregas, crearEstadoEntrega, actualizarEstadoEntregaCat, eliminarEstadoEntregaCat } from "../../../services/api";

const CAMPOS = [
  { key: "nombre",      label: "Nombre del estado", placeholder: "Ej: Pendiente" },
  { key: "descripcion", label: "Descripción",        placeholder: "Describe el estado", type: "textarea", fullWidth: true },
];

export default function CatEstadosEntregas({ showToast }) {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getEstadosEntregas()
      .then(res => setDatos(res.estados))
      .finally(() => setCargando(false))
  }, []);

  const onGuardar = async (item) => {
    if (item.idEstadoEntrega) {
      const data = await actualizarEstadoEntregaCat(item.idEstadoEntrega, { nombre: item.nombre, descripcion: item.descripcion });
      setDatos(prev => prev.map(d => d.idEstadoEntrega === item.idEstadoEntrega ? data.estado : d))
    } else {
      const data = await crearEstadoEntrega({ nombre: item.nombre, descripcion: item.descripcion });
      setDatos(prev => [...prev, data.estado])
    }
  }

  const onEliminar = async (id) => {
    await eliminarEstadoEntregaCat(id)
    setDatos(prev => prev.filter(d => d.idEstadoEntrega !== id));
  }

  if (cargando) return <p className="p-4 text-muted">Cargando estados...</p>

  return (
    <CrudCatalogo
      titulo="Estados de entregas"
      icono="bi-box-seam-fill"
      campos={CAMPOS}
      datos={datos}
      idKey="idEstadoEntrega"
      onGuardar={onGuardar}
      onEliminar={onEliminar}
      showToast={showToast}
    />
  );
}
