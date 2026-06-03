// src/components/catalogos/CatEstadosEntregas.jsx
import CrudCatalogo from "./CrudCatalogo";

const CAMPOS = [
  { key: "nombre",      label: "Nombre del estado", placeholder: "Ej: Pendiente" },
  { key: "descripcion", label: "Descripción",        placeholder: "Describe el estado", type: "textarea", fullWidth: true },
];

const DATOS_INICIALES = [
  { id: 1, nombre: "Pendiente",   descripcion: "Entrega registrada, en espera de revisión" },
  
];

export default function CatEstadosEntregas() {
  return (
    <CrudCatalogo
      titulo="Estados de entregas"
      icono="bi-box-seam-fill"
      campos={CAMPOS}
      datos={DATOS_INICIALES}
    />
  );
}