// src/components/catalogos/CatTiposRecompensa.jsx
import CrudCatalogo from "./CrudCatalogo";

const CAMPOS = [
  { key: "nombre",      label: "Tipo de recompensa", placeholder: "Ej: Descuento" },
  { key: "descripcion", label: "Descripción",         placeholder: "Describe el tipo", type: "textarea", fullWidth: true },
];

const DATOS_INICIALES = [
  { id: 1, nombre: "Descuento",        descripcion: "Porcentaje de descuento en productos aliados" },
 
];

export default function CatTiposRecompensa() {
  return (
    <CrudCatalogo
      titulo="Tipos de recompensa"
      icono="bi-tag-fill"
      campos={CAMPOS}
      datos={DATOS_INICIALES}
    />
  );
}