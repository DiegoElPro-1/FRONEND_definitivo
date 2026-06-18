# Lo que necesita el frontend del backend

## 1. Registrar entrega — agregar `fechaVencimientoPuntos`

**Endpoint:** `POST /api/encargado/entregas`

**Nuevo campo opcional en el payload:**
```json
{
  "idUsuario": 123,
  "materiales": [...],
  "prioridad": "normal",
  "estadoMaterial": 1,
  "observacion": "...",
  "fechaVencimientoPuntos": "2026-07-15"
}
```

El backend debe guardar esta fecha (si se envía) asociada a los puntos generados en esa entrega. Si no se envía, los puntos no tienen vencimiento.

---

## 2. Obtener entregas por usuario — devolver `fechaVencimientoPuntos`

**Endpoint:** `GET /api/encargado/entregas?usuario_id={id}`

**Nuevo campo en la respuesta (a nivel de cada detalle de entrega):**
```json
{
  "entregas": [
    {
      "idEntrega": 1,
      "fechaEntrega": "2026-06-10",
      "detalles": [
        {
          "idDetalle": 1,
          "material": { "nombre": "Plástico" },
          "peso": 2.5,
          "puntosGenerados": 50,
          "fechaVencimientoPuntos": "2026-07-15"
        }
      ],
      "fechaVencimientoPuntos": "2026-07-15"
    }
  ]
}
```

Puede ir en cada detalle o a nivel de entrega. El frontend revisa `detalles[].fechaVencimientoPuntos` primero, y si no existe, toma `entrega.fechaVencimientoPuntos`.

**Nota:** El frontend también acepta snake_case: `fecha_vencimiento_puntos`, `fechaVencimiento`, `fecha_vencimiento`.

**Formato de respuesta:** el endpoint puede devolver **un array directo** `[{...}]` **o** `{ "entregas": [...] }`. El frontend maneja ambos.

---

## 3. Obtener recompensas para encargado — devolver campos de fecha y estado

**Endpoint:** `GET /api/encargado/recompensas`

**Asegurar que la respuesta incluya estos campos:**
```json
{
  "recompensas": [
    {
      "idRecompensa": 1,
      "nombre": "Bono $10.000",
      "puntosRequeridos": 500,
      "stock": 10,
      "aliado": "Éxito",
      "fechaInicio": "2026-06-20",
      "fechaFin": "2026-08-20",
      "idEstadoRecompensa": 1
    }
  ]
}
```

El frontend ahora usa `fechaInicio`, `fechaFin` e `idEstadoRecompensa` para clasificar como:
- `idEstadoRecompensa === 1` y `hoy >= fechaInicio` y `hoy <= fechaFin` → **Activa** (se puede canjear)
- `idEstadoRecompensa === 1` y `fechaInicio > hoy` → **Próximamente** (se muestra deshabilitada)
- `idEstadoRecompensa === 1` y `fechaFin < hoy` → **Vencida** (se muestra deshabilitada)
- `idEstadoRecompensa === 2` → **Inactiva** (se muestra deshabilitada)

### Resumen de cambios requeridos

| Endpoint | Cambio |
|----------|--------|
| `POST /api/encargado/entregas` | Aceptar `fechaVencimientoPuntos` opcional en el body |
| `GET /api/encargado/entregas?usuario_id={id}` | Incluir `fechaVencimientoPuntos` en detalles o a nivel entrega |
| `GET /api/encargado/recompensas` | Asegurar que devuelve `fechaInicio`, `fechaFin`, `idEstadoRecompensa` |
