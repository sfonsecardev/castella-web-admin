# Castella API Quick Reference

## Endpoints Summary

### Customer Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/registrar-cliente` | None | Register new customer |
| POST | `/login-client` | None | Customer login |
| POST | `/cliente/forgot-password` | None | Request password reset |
| POST | `/cliente/reset-password` | None | Reset password with token |

### Guarantee System
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orden/:id/solicitar-garantia` | Client | Request guarantee for order |
| GET | `/garantias/pendientes/:page?` | Admin | List pending guarantees |
| PUT | `/garantia/:id/asignar-tecnico` | Admin | Assign technician to guarantee |

### Rating System
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orden/:id/calificar` | Client | Rate finished order |
| GET | `/orden/:id/calificacion` | Flexible | Get order rating |
| GET | `/calificaciones-tecnico/:tecnico` | Admin | Get technician ratings |

### Maintenance System
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| PUT | `/orden/:id/mantenimiento-config` | Flexible | Set maintenance schedule |
| GET | `/mantenimientos-cliente/:cliente` | Flexible | Get upcoming maintenances |

### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard/overview` | Admin | Get admin dashboard stats |

## Authentication Types

- **None**: No authentication required
- **Client**: Client JWT token required (`tipo: 'cliente'`)
- **User**: User JWT token required (`tipo: 'usuario'`)
- **Admin**: Admin user token required (`rol.nombre: 'ADMINISTRADOR'`)
- **Flexible**: Either client or user token accepted

## Common Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Rate Limited
- `500` - Server Error

## Rate Limits

- Login attempts: 5/IP/10min

## Key Models

### Cliente
```javascript
{
  nombre: String,
  celular: String,
  correo: String (unique),
  contrasenia: String (hashed),
  direccion: String,
  resetPassword: {token, expires}
}
```

### OrdenDeTrabajo (Extended)
```javascript
{
  // existing fields...
  tipo: String, // 'NORMAL' | 'REVISION'
  garantiaDe: ObjectId,
  calificacion: ObjectId,
  periodicidadMeses: Number
}
```

### Calificacion (New)
```javascript
{
  orden: ObjectId,
  cliente: ObjectId,
  tecnico: ObjectId,
  estrellas: Number (1-5),
  comentario: String,
  fecha: Date
}
```

## Quick Start Examples

### Register & Login
```bash
# Register
curl -X POST localhost:3977/api/registrar-cliente \
  -d '{"nombre":"Juan","celular":"7555-1234","correo":"juan@test.com","contrasenia":"pass123"}'

# Login
curl -X POST localhost:3977/api/login-client \
  -d '{"correo":"juan@test.com","contrasenia":"pass123","gethash":true}'
```

### Rate Order
```bash
curl -X POST localhost:3977/api/orden/ORDER_ID/calificar \
  -H "Authorization: CLIENT_TOKEN" \
  -d '{"estrellas":5,"comentario":"Great service!"}'
```

### Request Guarantee
```bash
curl -X POST localhost:3977/api/orden/ORDER_ID/solicitar-garantia \
  -H "Authorization: CLIENT_TOKEN"
``` 