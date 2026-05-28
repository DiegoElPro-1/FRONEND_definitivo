import { useState, useEffect } from "react";
import CrudCatalogo from "./CrudCatalogo";
import { getEstadosCanjes, crearEstadoCanje, actualizarEstadoCanje, eliminarEstadoCanje } from '../../../services/api'

const CAMPOS = [
  { key: "nombre", label: "Nombre del estado", placeholder: "Ej: Aprobado" },
];

export default function CatEstadosCanjes() {
  const [datos, setDatos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getEstadosCanjes()
      .then(res => setDatos(res.estados))
      .finally(() => setCargando(false))
  }, [])

  const onGuardar = async (item) => {
    if (item.idEstadoCanje) {
      const data = await actualizarEstadoCanje(item.idEstadoCanje, { nombre: item.nombre })
      setDatos(prev => prev.map(d => d.idEstadoCanje === item.idEstadoCanje ? data.estado : d))
    } else {
      const data = await crearEstadoCanje({ nombre: item.nombre })
      setDatos(prev => [...prev, data.estado])
    }
  }

  const onEliminar = async (id) => {
    await eliminarEstadoCanje(id)
    setDatos(prev => prev.filter(d => d.idEstadoCanje !== id))
  }

  if (cargando) return <p className="p-4 text-muted">Cargando estados...</p>

  return (
    <CrudCatalogo
      titulo="Estados de canjes"
      icono="bi-arrow-left-right"
      campos={CAMPOS}
      datos={datos}
      idKey="idEstadoCanje"
      onGuardar={onGuardar}
      onEliminar={onEliminar}
    />
  );
}
