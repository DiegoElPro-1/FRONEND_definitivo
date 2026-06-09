// src/components/catalogos/CatRoles.jsx
import { useState, useEffect } from "react";
import CrudCatalogo from "./CrudCatalogo";
import { getRoles, crearRol, actualizarRol, eliminarRol } from '../../../services/api'

const CAMPOS = [
  { key: "nombre",      label: "Nombre del rol",  placeholder: "Ej: Administrador" },
  { key: "descripcion", label: "Descripción",      placeholder: "Describe el rol", type: "textarea", fullWidth: true },
];


export default function CatRoles(props){
  const [datos, setDatos]= useState([])
  const [cargando, setCargando]=useState(true)

//cargar roles
 useEffect(() => {
  getRoles()
    .then(res => setDatos(res.roles))
    .finally(() => setCargando(false))
}, [])

const onGuardar = async (item) => {
  if (item.idRol) {
    const data = await actualizarRol(item.idRol, { nombre: item.nombre, descripcion: item.descripcion })
    setDatos(prev => prev.map(d => d.idRol === item.idRol ? data.rol : d))
  } else {
    const data = await crearRol({ nombre: item.nombre, descripcion: item.descripcion })
    setDatos(prev => [...prev, data.rol])
  }
}

const onEliminar = async (id) => {
  await eliminarRol(id)
  setDatos(prev => prev.filter(d => d.idRol !== id))
}

if (cargando) return <p className="p-4 text-muted">Cargando roles...</p>

  return (
    <CrudCatalogo
      titulo="Roles"
      icono="bi-key-fill"
      campos={CAMPOS}
      datos={datos}
      idKey="idRol"
      onGuardar={onGuardar}
      onEliminar={onEliminar}
    />
  )
}