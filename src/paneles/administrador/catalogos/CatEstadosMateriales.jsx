// src/components/catalogos/CatEstadosMateriales.jsx
import{ useState, useEffect } from "react";
import CrudCatalogo from "./CrudCatalogo";
import {getEstadosMateriales, crearEstadoMaterial, actualizarEstadoMaterial, eliminarEstadoMaterial} from "../../../services/api";

const CAMPOS = [
  { key: "nombre",      label: "Nombre del estado", placeholder: "Ej: Reciclable" },
  { key: "descripcion", label: "Descripción",        placeholder: "Describe el estado", type: "textarea", fullWidth: true },
];

export default function CatEstadosMateriales({ showToast }) {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  useEffect(() => {
    getEstadosMateriales()
    .then(res => setDatos(res.estados))
    .finally(() => setCargando(false))
  }, []);

  const onGuardar = async (item) => {
    if (item.idEstadoMaterial) {
      const data = await actualizarEstadoMaterial(item.idEstadoMaterial, { nombre: item.nombre, descripcion: item.descripcion });
      setDatos(prev => prev.map(d => d.idEstadoMaterial === item.idEstadoMaterial ? data.estado : d))
    } else {
      const data = await crearEstadoMaterial({ nombre: item.nombre, descripcion: item.descripcion });
      setDatos(prev => [...prev, data.estado])

    }
  }

  const onEliminar = async (id) => {
    await eliminarEstadoMaterial(id)
    setDatos(prev => prev.filter(d => d.idEstadoMaterial !== id));
  }

   if (cargando) return <p className="p-4 text-muted">Cargando estados...</p>



  return (
    <CrudCatalogo
      titulo="Estados de materiales"
      icono="bi-recycle"
      campos={CAMPOS}
      datos={datos}
      idKey="idEstadoMaterial"
      onGuardar={onGuardar}
      onEliminar={onEliminar}
      showToast={showToast}
    />
  );
}