# Castella API Documentation

## Overview

This document provides detailed information about the Castella API endpoints, including authentication, request/response formats, and usage examples.

## Base URL
```
http://localhost:3977/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. There are two types of tokens:

### User Tokens
- Used for admin users and technicians
- Include `rol` information for role-based access control
- Set `tipo: 'usuario'` in payload

### Client Tokens  
- Used for customers/clients
- Include basic client information
- Set `tipo: 'cliente'` in payload

### Headers
```
Authorization: your-jwt-token-here
Content-Type: application/json
```

---

## Customer Authentication Endpoints

### 1. Register Customer

**POST** `/registrar-cliente`

Register a new customer account.

#### Request Body
```json
{
  "nombre": "Juan Pérez",
  "celular": "7555-1234",
  "correo": "juan@example.com",
  "contrasenia": "securePassword123",
  "direccion": "Calle Principal 123, San Salvador" // optional
}
```

#### Success Response (201)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses
- **400 Bad Request**: Missing required fields
```json
{
  "mensaje": "Nombre, celular, correo y contraseña son obligatorios"
}
```

- **409 Conflict**: Email or phone already exists
```json
{
  "mensaje": "El correo ya está registrado"
}
```

---

### 2. Customer Login

**POST** `/login-client`

Authenticate a customer and get token or user data.

#### Request Body
```json
{
  "correo": "juan@example.com",
  "contrasenia": "securePassword123",
  "gethash": true // optional, returns token if true, user object if false
}
```

#### Success Response (200)

**With gethash=true:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**With gethash=false or omitted:**
```json
{
  "cliente": {
    "_id": "507f1f77bcf86cd799439011",
    "nombre": "Juan Pérez",
    "celular": "7555-1234",
    "correo": "juan@example.com",
    "direccion": "Calle Principal 123, San Salvador"
  }
}
```

#### Error Responses
- **400 Bad Request**: Missing credentials
- **401 Unauthorized**: Invalid credentials
- **429 Too Many Requests**: Rate limit exceeded (5 attempts per 10 minutes)

---

### 3. Forgot Password

**POST** `/cliente/forgot-password`

Request a password reset token.

#### Request Body
```json
{
  "correo": "juan@example.com"
}
```

#### Success Response (200)
```json
{
  "mensaje": "Si el correo existe, se enviará un enlace de recuperación"
}
```

*Note: Always returns 200 to prevent user enumeration, regardless of whether email exists.*

---

### 4. Reset Password

**POST** `/cliente/reset-password`

Reset password using the token from forgot password.

#### Request Body
```json
{
  "token": "reset-token-from-email",
  "nuevaContrasenia": "newSecurePassword123"
}
```

#### Success Response (200)
```json
{
  "mensaje": "Contraseña actualizada exitosamente"
}
```

#### Error Responses
- **400 Bad Request**: Invalid or expired token
- **400 Bad Request**: Missing required fields

---

## Guarantee System Endpoints

### 5. Request Guarantee

**POST** `/orden/:id/solicitar-garantia`

**Authentication:** Client token required

Request a guarantee for a finished order (must be < 1 year old).

#### URL Parameters
- `id`: Order ID

#### Success Response (201)
```json
{
  "ordenId": "507f1f77bcf86cd799439012"
}
```

#### Error Responses
- **400 Bad Request**: Order not eligible (not finished or > 1 year old)
```json
{
  "mensaje": "Solo se puede solicitar garantía para órdenes finalizadas"
}
```

- **403 Forbidden**: Client doesn't own the order
- **404 Not Found**: Order not found

---

### 6. Get Pending Guarantees

**GET** `/garantias/pendientes/:page?`

**Authentication:** Admin token required

Get paginated list of pending guarantee orders.

#### URL Parameters
- `page`: Page number (optional, defaults to 1)

#### Success Response (200)
```json
{
  "total": 25,
  "page": 1,
  "items": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "tipo": "REVISION",
      "estado": "PENDIENTE",
      "cliente": {
        "_id": "507f1f77bcf86cd799439011",
        "nombre": "Juan Pérez",
        "correo": "juan@example.com"
      },
      "garantiaDe": {
        "_id": "507f1f77bcf86cd799439010",
        "numero": 12345,
        "aniomesprogramacion": "202312"
      },
      "fechaDigitacion": "2023-12-15T10:30:00.000Z"
    }
  ]
}
```

---

### 7. Assign Technician to Guarantee

**PUT** `/garantia/:id/asignar-tecnico`

**Authentication:** Admin token required

Assign a technician to a guarantee order.

#### URL Parameters
- `id`: Guarantee order ID

#### Request Body
```json
{
  "tecnicoId": "507f1f77bcf86cd799439013"
}
```

#### Success Response (200)
```json
{
  "orden": {
    "_id": "507f1f77bcf86cd799439012",
    "tecnico": "507f1f77bcf86cd799439013",
    "estado": "ASIGNADA"
  }
}
```

#### Error Responses
- **400 Bad Request**: Missing technician ID
- **404 Not Found**: Technician or guarantee order not found

---

## Rating System Endpoints

### 8. Rate Order

**POST** `/orden/:id/calificar`

**Authentication:** Client token required

Rate a finished order (1-5 stars).

#### URL Parameters
- `id`: Order ID

#### Request Body
```json
{
  "estrellas": 5,
  "comentario": "Excelente servicio, muy profesional" // optional
}
```

#### Success Response (201)
```json
{
  "calificacion": {
    "_id": "507f1f77bcf86cd799439014",
    "orden": "507f1f77bcf86cd799439010",
    "cliente": "507f1f77bcf86cd799439011",
    "tecnico": "507f1f77bcf86cd799439013",
    "estrellas": 5,
    "comentario": "Excelente servicio, muy profesional",
    "fecha": "2023-12-15T10:30:00.000Z"
  }
}
```

#### Error Responses
- **400 Bad Request**: Invalid star rating (must be 1-5)
```json
{
  "mensaje": "Las estrellas deben estar entre 1 y 5"
}
```

- **409 Conflict**: Order already rated
```json
{
  "mensaje": "Esta orden ya ha sido calificada"
}
```

---

### 9. Get Order Rating

**GET** `/orden/:id/calificacion`

**Authentication:** Flexible (client owner, assigned technician, or admin)

Get the rating for a specific order.

#### URL Parameters
- `id`: Order ID

#### Success Response (200)
```json
{
  "calificacion": {
    "_id": "507f1f77bcf86cd799439014",
    "orden": "507f1f77bcf86cd799439010",
    "cliente": {
      "_id": "507f1f77bcf86cd799439011",
      "nombre": "Juan Pérez"
    },
    "tecnico": {
      "_id": "507f1f77bcf86cd799439013",
      "nombre": "Carlos Martínez"
    },
    "estrellas": 5,
    "comentario": "Excelente servicio, muy profesional",
    "fecha": "2023-12-15T10:30:00.000Z"
  }
}
```

#### Error Responses
- **403 Forbidden**: Not authorized to view this rating
- **404 Not Found**: Rating not found

---

### 10. Get Technician Ratings

**GET** `/calificaciones-tecnico/:tecnico`

**Authentication:** Admin token required

Get aggregated rating statistics for a technician.

#### URL Parameters
- `tecnico`: Technician ID

#### Success Response (200)
```json
{
  "promedio": 4.25,
  "total": 12,
  "distribucion": {
    "1": 0,
    "2": 1,
    "3": 2,
    "4": 4,
    "5": 5
  }
}
```

---

## Maintenance System Endpoints

### 11. Configure Maintenance

**PUT** `/orden/:id/mantenimiento-config`

**Authentication:** User token (technician or admin) required

Set maintenance periodicity for an order.

#### URL Parameters
- `id`: Order ID

#### Request Body
```json
{
  "periodicidadMeses": 6
}
```

#### Success Response (200)
```json
{
  "orden": {
    "_id": "507f1f77bcf86cd799439010",
    "periodicidadMeses": 6,
    "estado": "FINALIZADO"
  }
}
```

#### Error Responses
- **400 Bad Request**: Invalid periodicity
```json
{
  "mensaje": "La periodicidad debe ser mayor a 0 meses"
}
```

---

### 12. Get Customer Maintenances

**GET** `/mantenimientos-cliente/:cliente`

**Authentication:** Flexible (client owner or admin)

Get upcoming maintenances for a customer (next 30 days).

#### URL Parameters
- `cliente`: Client ID

#### Success Response (200)
```json
{
  "mantenimientos": [
    {
      "_id": "507f1f77bcf86cd799439010",
      "cliente": {
        "_id": "507f1f77bcf86cd799439011",
        "nombre": "Juan Pérez"
      },
      "tecnico": {
        "_id": "507f1f77bcf86cd799439013",
        "nombre": "Carlos Martínez"
      },
      "servicio": {
        "_id": "507f1f77bcf86cd799439015",
        "nombre": "Mantenimiento Preventivo"
      },
      "fechaProgramada": "2023-12-30T09:00:00.000Z",
      "periodicidadMeses": 6
    }
  ]
}
```

---

## Dashboard Endpoints

### 13. Admin Dashboard Overview

**GET** `/dashboard/overview`

**Authentication:** Admin token required

Get administrative dashboard statistics.

#### Success Response (200)
```json
{
  "sinAsignar": 8,
  "enEjecucion": 15,
  "sinMovimiento5d": 3
}
```

#### Response Fields
- `sinAsignar`: Orders without assigned technician
- `enEjecucion`: Orders currently in progress
- `sinMovimiento5d`: Orders without movement for 5+ days

---

## Error Handling

### Standard Error Response Format
```json
{
  "mensaje": "Description of the error"
}
```

### HTTP Status Codes
- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Invalid or expired token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict (duplicate, already exists)
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

---

## Rate Limiting

### Login Endpoints
- **Limit**: 5 attempts per IP address per 10 minutes
- **Applies to**: `/login-client`
- **Response**: 429 status with retry-after information

---

## Data Models

### Client
```json
{
  "_id": "ObjectId",
  "nombre": "string",
  "celular": "string",
  "correo": "string (unique)",
  "direccion": "string (optional)",
  "contrasenia": "string (hashed)",
  "resetPassword": {
    "token": "string",
    "expires": "Date"
  }
}
```

### Order (OrdenDeTrabajo)
```json
{
  "_id": "ObjectId",
  "cliente": "ObjectId (ref: Cliente)",
  "tecnico": "ObjectId (ref: Usuario)",
  "estado": "string",
  "tipo": "string (NORMAL|REVISION)",
  "garantiaDe": "ObjectId (ref: OrdenDeTrabajo)",
  "calificacion": "ObjectId (ref: Calificacion)",
  "periodicidadMeses": "number",
  "fechaDigitacion": "Date",
  "fechaProgramada": "Date",
  "fechaEjecucion": "Date"
}
```

### Rating (Calificacion)
```json
{
  "_id": "ObjectId",
  "orden": "ObjectId (ref: OrdenDeTrabajo)",
  "cliente": "ObjectId (ref: Cliente)",
  "tecnico": "ObjectId (ref: Usuario)",
  "estrellas": "number (1-5)",
  "comentario": "string (optional)",
  "fecha": "Date"
}
```

---

## Usage Examples

### Complete Customer Flow

1. **Register Customer**
```bash
curl -X POST http://localhost:3977/api/registrar-cliente \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "celular": "7555-1234",
    "correo": "juan@example.com",
    "contrasenia": "securePassword123"
  }'
```

2. **Login and Get Token**
```bash
curl -X POST http://localhost:3977/api/login-client \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "juan@example.com",
    "contrasenia": "securePassword123",
    "gethash": true
  }'
```

3. **Request Guarantee**
```bash
curl -X POST http://localhost:3977/api/orden/507f1f77bcf86cd799439010/solicitar-garantia \
  -H "Authorization: your-client-token" \
  -H "Content-Type: application/json"
```

4. **Rate Order**
```bash
curl -X POST http://localhost:3977/api/orden/507f1f77bcf86cd799439010/calificar \
  -H "Authorization: your-client-token" \
  -H "Content-Type: application/json" \
  -d '{
    "estrellas": 5,
    "comentario": "Excelente servicio"
  }'
```

---

## Security Considerations

### Password Security
- Passwords are hashed using bcrypt with salt
- Minimum password requirements should be enforced client-side
- Password reset tokens expire after 30 minutes

### Token Security
- JWT tokens expire after 30 days
- Tokens include user type for proper authorization
- Always validate token type matches endpoint requirements

### Rate Limiting
- Login attempts are limited to prevent brute force attacks
- Consider implementing additional rate limiting for other endpoints in production

### Data Privacy
- Customer email addresses are treated as sensitive data
- No user enumeration in forgot password endpoint
- Proper access controls for viewing ratings and maintenance data

---

## Testing

### Test Environment
- Database: `castellatest`
- Port: 3979 (HTTPS: 3980)
- All data is cleaned between tests

### Running Tests
```bash
npm test
```

### Test Coverage
- All customer authentication endpoints
- Rating system functionality
- Basic guarantee system tests
- Error handling and validation

---

## Changelog

### Version 1.1.0 (Current)
- Added customer authentication system
- Implemented guarantee request workflow
- Added order rating system
- Created maintenance scheduling
- Added admin dashboard statistics
- Implemented comprehensive error handling
- Added rate limiting for security
``` 