import { useState, useEffect } from "react";
import CrudCatalogo from "./CrudCatalogo";
import { getTiposRecompensa, crearTipoRecompensa, actualizarTipoRecompensa, eliminarTipoRecompensa } from '../../../services/api'

const CAMPOS = [
  { key: "nombre",      label: "Nombre del tipo",   placeholder: "Ej: Canjeable" },
  { key: "descripcion", label: "Descripción",        placeholder: "Describe el tipo", type: "textarea", fullWidth: true },
];

export default function CatTiposRecompensa() {
  const [datos, setDatos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getTiposRecompensa()
      .then(res => setDatos(res.tipos))
      .finally(() => setCargando(false))
  }, [])

  const onGuardar = async (item) => {
    if (item.idTipoRecompensa) {
      const data = await actualizarTipoRecompensa(item.idTipoRecompensa, { nombre: item.nombre, descripcion: item.descripcion })
      setDatos(prev => prev.map(d => d.idTipoRecompensa === item.idTipoRecompensa ? data.tipo : d))
    } else {
      const data = await crearTipoRecompensa({ nombre: item.nombre, descripcion: item.descripcion })
      setDatos(prev => [...prev, data.tipo])
    }
  }

  const onEliminar = async (id) => {
    await eliminarTipoRecompensa(id)
    setDatos(prev => prev.filter(d => d.idTipoRecompensa !== id))
  }

  if (cargando) return <p className="p-4 text-muted">Cargando tipos...</p>

  return (
    <CrudCatalogo
      titulo="Tipos de recompensa"
      icono="bi-tag-fill"
      campos={CAMPOS}
      datos={datos}
      idKey="idTipoRecompensa"
      onGuardar={onGuardar}
      onEliminar={onEliminar}
    />
  );
}
