import { useState, useEffect } from "react";
import CrudCatalogo from "./CrudCatalogo";
import { getEstadosPuntos, crearEstadoPunto, actualizarEstadoPunto, eliminarEstadoPunto } from "../../../services/api";

const CAMPOS = [
  { key: "nombre",      label: "Nombre del estado", placeholder: "Ej: Activo" },
  { key: "descripcion", label: "Descripción",        placeholder: "Describe el estado", type: "textarea", fullWidth: true },
];

export default function CatEstadosPuntos() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getEstadosPuntos()
      .then(res => setDatos(res.estados))
      .finally(() => setCargando(false))
  }, []);

  const onGuardar = async (item) => {
    if (item.idEstadoPunto) {
      const data = await actualizarEstadoPunto(item.idEstadoPunto, { nombre: item.nombre, descripcion: item.descripcion });
      setDatos(prev => prev.map(d => d.idEstadoPunto === item.idEstadoPunto ? data.estado : d))
    } else {
      const data = await crearEstadoPunto({ nombre: item.nombre, descripcion: item.descripcion });
      setDatos(prev => [...prev, data.estado])
    }
  }

  const onEliminar = async (id) => {
    await eliminarEstadoPunto(id)
    setDatos(prev => prev.filter(d => d.idEstadoPunto !== id));
  }

  if (cargando) return <p className="p-4 text-muted">Cargando estados...</p>

  return (
    <CrudCatalogo
      titulo="Estados de puntos"
      icono="bi-geo-alt-fill"
      campos={CAMPOS}
      datos={datos}
      idKey="idEstadoPunto"
      onGuardar={onGuardar}
      onEliminar={onEliminar}
    />
  );
}
