// src/components/catalogos/CatEstadosUsuarios.jsx
import CrudCatalogo from "./CrudCatalogo";

const CAMPOS = [
  { key: "nombre",      label: "Nombre del estado", placeholder: "Ej: Activo" },
  { key: "descripcion", label: "Descripción",        placeholder: "Describe el estado", type: "textarea", fullWidth: true },
];

const DATOS_INICIALES = [
  { id: 1, nombre: "Activo",      descripcion: "Usuario habilitado para usar la plataforma" },
  
];

export default function CatEstadosUsuarios() {
  return (
    <CrudCatalogo
      titulo="Estados de usuarios"
      icono="bi-person-check-fill"
      campos={CAMPOS}
      datos={DATOS_INICIALES}
    />
  );
}