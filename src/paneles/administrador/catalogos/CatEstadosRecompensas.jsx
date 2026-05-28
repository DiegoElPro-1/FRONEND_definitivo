import { useState, useEffect } from "react";
import CrudCatalogo from "./CrudCatalogo";
import { getEstadosRecompensas, crearEstadoRecompensa, actualizarEstadoRecompensa, eliminarEstadoRecompensa } from '../../../services/api'

const CAMPOS = [
  { key: "nombre", label: "Nombre del estado", placeholder: "Ej: Disponible" },
];

export default function CatEstadosRecompensas() {
  const [datos, setDatos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getEstadosRecompensas()
      .then(res => setDatos(res.estados))
      .finally(() => setCargando(false))
  }, [])

  const onGuardar = async (item) => {
    if (item.idEstadoRecompensa) {
      const data = await actualizarEstadoRecompensa(item.idEstadoRecompensa, { nombre: item.nombre })
      setDatos(prev => prev.map(d => d.idEstadoRecompensa === item.idEstadoRecompensa ? data.estado : d))
    } else {
      const data = await crearEstadoRecompensa({ nombre: item.nombre })
      setDatos(prev => [...prev, data.estado])
    }
  }

  const onEliminar = async (id) => {
    await eliminarEstadoRecompensa(id)
    setDatos(prev => prev.filter(d => d.idEstadoRecompensa !== id))
  }

  if (cargando) return <p className="p-4 text-muted">Cargando estados...</p>

  return (
    <CrudCatalogo
      titulo="Estados de recompensas"
      icono="bi-award-fill"
      campos={CAMPOS}
      datos={datos}
      idKey="idEstadoRecompensa"
      onGuardar={onGuardar}
      onEliminar={onEliminar}
    />
  );
}
