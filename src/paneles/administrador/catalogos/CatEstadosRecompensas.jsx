// src/components/catalogos/CatEstadosRecompensas.jsx
import CrudCatalogo from "./CrudCatalogo";

const CAMPOS = [
  { key: "nombre",      label: "Nombre del estado", placeholder: "Ej: Disponible" },
  { key: "descripcion", label: "Descripción",        placeholder: "Describe el estado", type: "textarea", fullWidth: true },
];

const DATOS_INICIALES = [
  { id: 1, nombre: "Disponible",   descripcion: "Recompensa activa y canjeable" },
  
];

export default function CatEstadosRecompensas() {
  return (
    <CrudCatalogo
      titulo="Estados de recompensas"
      icono="bi-gift-fill"
      campos={CAMPOS}
      datos={DATOS_INICIALES}
    />
  );
}