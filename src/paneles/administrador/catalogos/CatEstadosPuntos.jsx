// src/components/catalogos/CatEstadosPuntos.jsx
import CrudCatalogo from "./CrudCatalogo";

const CAMPOS = [
  { key: "nombre",      label: "Nombre del estado", placeholder: "Ej: Activo" },
  { key: "descripcion", label: "Descripción",        placeholder: "Describe el estado", type: "textarea", fullWidth: true },
];

const DATOS_INICIALES = [
  { id: 1, nombre: "Activo",    descripcion: "Puntos disponibles para canje" },

];

export default function CatEstadosPuntos() {
  return (
    <CrudCatalogo
      titulo="Estados de puntos"
      icono="bi-geo-alt-fill"
      campos={CAMPOS}
      datos={DATOS_INICIALES}
    />
  );
}