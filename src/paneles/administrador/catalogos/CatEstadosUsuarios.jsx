import { useState, useEffect } from "react";
import CrudCatalogo from "./CrudCatalogo";
import { getEstadosUsuarios, crearEstadoUsuario, actualizarEstadoUsuario, eliminarEstadoUsuario } from "../../../services/api";

const CAMPOS = [
  { key: "nombre",      label: "Nombre del estado", placeholder: "Ej: Activo" },
  { key: "descripcion", label: "Descripción",        placeholder: "Describe el estado", type: "textarea", fullWidth: true },
];

export default function CatEstadosUsuarios() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    getEstadosUsuarios()
      .then(res => setDatos(res.estados))
      .finally(() => setCargando(false))
  }, []);

  const onGuardar = async (item) => {
    if (item.idEstadoUsuario) {
      const data = await actualizarEstadoUsuario(item.idEstadoUsuario, { nombre: item.nombre, descripcion: item.descripcion });
      setDatos(prev => prev.map(d => d.idEstadoUsuario === item.idEstadoUsuario ? data.estado : d))
    } else {
      const data = await crearEstadoUsuario({ nombre: item.nombre, descripcion: item.descripcion });
      setDatos(prev => [...prev, data.estado])
    }
  }

  const onEliminar = async (id) => {
    await eliminarEstadoUsuario(id)
    setDatos(prev => prev.filter(d => d.idEstadoUsuario !== id));
  }

  if (cargando) return <p className="p-4 text-muted">Cargando estados...</p>

  return (
    <CrudCatalogo
      titulo="Estados de usuarios"
      icono="bi-person-check-fill"
      campos={CAMPOS}
      datos={datos}
      idKey="idEstadoUsuario"
      onGuardar={onGuardar}
      onEliminar={onEliminar}
    />
  );
}
