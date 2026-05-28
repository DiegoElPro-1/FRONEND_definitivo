import { useState, useEffect } from "react";
import CrudCatalogo from "./CrudCatalogo";
import { getEstadosAliados, crearEstadoAliado, actualizarEstadoAliado, eliminarEstadoAliado } from '../../../services/api'

const CAMPOS = [
  { key: "nombre", label: "Nombre del estado", placeholder: "Ej: Activo" },
];

export default function CatEstadosAliados() {
  const [datos, setDatos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getEstadosAliados()
      .then(res => setDatos(res.estados))
      .finally(() => setCargando(false))
  }, [])

  const onGuardar = async (item) => {
    if (item.idEstadoAliado) {
      const data = await actualizarEstadoAliado(item.idEstadoAliado, { nombre: item.nombre })
      setDatos(prev => prev.map(d => d.idEstadoAliado === item.idEstadoAliado ? data.estado : d))
    } else {
      const data = await crearEstadoAliado({ nombre: item.nombre })
      setDatos(prev => [...prev, data.estado])
    }
  }

  const onEliminar = async (id) => {
    await eliminarEstadoAliado(id)
    setDatos(prev => prev.filter(d => d.idEstadoAliado !== id))
  }

  if (cargando) return <p className="p-4 text-muted">Cargando estados...</p>

  return (
    <CrudCatalogo
      titulo="Estados de aliados"
      icono="bi-handshake"
      campos={CAMPOS}
      datos={datos}
      idKey="idEstadoAliado"
      onGuardar={onGuardar}
      onEliminar={onEliminar}
    />
  );
}
