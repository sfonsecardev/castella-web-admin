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

### 5. Change Password

**PUT** `/cliente/cambiar-contrasenia`

**Authentication:** Client token required

Allow authenticated clients to change their password by providing their current password.

#### Request Headers
```
Authorization: your-client-jwt-token-here
Content-Type: application/json
```

#### Request Body
```json
{
  "contraseniaActual": "currentPassword123",
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
- **400 Bad Request**: Missing required fields
```json
{
  "mensaje": "Contraseña actual y nueva contraseña son obligatorias"
}
```

- **400 Bad Request**: New password too short
```json
{
  "mensaje": "La nueva contraseña debe tener al menos 6 caracteres"
}
```

- **401 Unauthorized**: Current password is incorrect
```json
{
  "mensaje": "La contraseña actual es incorrecta"
}
```

- **404 Not Found**: Client not found

---

### 6. Update Customer Information

**PUT** `/cliente/:id`

**Authentication:** Flexible (client token or admin token)

Updates an existing customer's information by their unique ID. Supports both self-service updates (clients updating their own info) and administrative updates.

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | MongoDB ObjectId of the client to update |

#### Request Headers
```
Authorization: your-jwt-token-here
Content-Type: application/json
```

#### Request Body
All fields are optional, but `nombre` and `telefono` are validated as required if provided.

```json
{
  "nombre": "Juan Pérez",
  "telefono": "123456789",
  "celular": "987654321",
  "correo": "juan.perez@email.com",
  "contacto": "Juan",
  "registro": "2024-01-15",
  "notas": "Cliente frecuente"
}
```

#### Available Fields
| Field | Type | Required | Description | Notes |
|-------|------|----------|-------------|-------|
| `nombre` | String | Yes* | Client's name | Must not be empty if provided |
| `telefono` | String | Yes* | Client's phone number | Must not be empty if provided |
| `celular` | String | No | Client's mobile phone | |
| `correo` | String | No | Client's email address | |
| `contacto` | String | No | Contact person name | |
| `registro` | String | No | Registration information | |
| `notas` | String | No | Additional notes | |
| `mobileApp` | Boolean | No | Mobile app access flag | Default: false |

*Required validation: Both `nombre` and `telefono` must be provided and non-empty.

#### Auto-generated Fields
- `nombre_busqueda`: Automatically generated from `nombre` + `contacto` in lowercase for search optimization

#### Success Response (200)
```json
{
  "cliente": {
    "_id": "507f1f77bcf86cd799439011",
    "nombre": "Juan Pérez",
    "telefono": "123456789",
    "celular": "987654321",
    "correo": "juan.perez@email.com",
    "contacto": "Juan",
    "nombre_busqueda": "juan pérez juan",
    "registro": "2024-01-15",
    "notas": "Cliente frecuente",
    "mobileApp": false,
    "__v": 0
  }
}
```

#### Error Responses
- **400 Bad Request**: Client not updated
```json
{
  "mensaje": "Artista no actualizado"
}
```

- **401 Unauthorized**: Token expired
```json
{
  "mensaje": "Token expirado"
}
```

- **403 Forbidden**: No authorization header
```json
{
  "mensaje": "Peticion sin header"
}
```

- **404 Not Found**: Validation error
```json
{
  "mensaje": "El nombre y el número de teléfono son obligatorios"
}
```

- **404 Not Found**: Invalid token
```json
{
  "mensaje": "Token invalido"
}
```

- **500 Internal Server Error**: Server error
```json
{
  "mensaje": "Error al actualizar artista"
}
```

#### Usage Examples

**Admin/Staff updating a client:**
```bash
curl -X PUT http://localhost:3977/api/cliente/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Authorization: admin-jwt-token-here" \
  -d '{
    "nombre": "Juan Pérez Updated",
    "telefono": "123456789",
    "notas": "Updated information"
  }'
```

**Client updating their own information:**
```bash
curl -X PUT http://localhost:3977/api/cliente/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Authorization: client-jwt-token-here" \
  -d '{
    "celular": "987654321",
    "correo": "new.email@example.com"
  }'
```

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

## Address Management Endpoints

The address management system allows clients and administrators to manage customer addresses. Each address is linked to a specific client and can be used for service delivery locations.

### 1. Get Address by ID

**GET** `/direccion/:id`

**Authentication:** Flexible (client token or admin token)

Retrieve a specific address by its unique ID.

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | MongoDB ObjectId of the address |

#### Request Headers
```
Authorization: your-jwt-token-here
Content-Type: application/json
```

#### Success Response (200)
```json
{
  "direccion": {
    "_id": "507f1f77bcf86cd799439020",
    "cliente": {
      "_id": "507f1f77bcf86cd799439011",
      "nombre": "Juan Pérez",
      "telefono": "123456789",
      "correo": "juan@example.com"
    },
    "direccion": "Calle Principal 123, Colonia Centro, San Salvador",
    "__v": 0
  }
}
```

#### Error Responses
- **404 Not Found**: Address not found
```json
{
  "mensaje": "No se encontro el dirección"
}
```

- **500 Internal Server Error**: Database error
```json
{
  "mensaje": "Error interno en el servidor al consultar dirección"
}
```

---

### 2. Get Addresses by Client

**GET** `/direccion-cliente/:cliente`

**Authentication:** Flexible (client token or admin token)

Retrieve all addresses belonging to a specific client.

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cliente` | String | Yes | MongoDB ObjectId of the client |

#### Request Headers
```
Authorization: your-jwt-token-here
Content-Type: application/json
```

#### Success Response (200)
```json
{
  "direcciones": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "cliente": {
        "_id": "507f1f77bcf86cd799439011",
        "nombre": "Juan Pérez",
        "telefono": "123456789",
        "correo": "juan@example.com"
      },
      "direccion": "Calle Principal 123, Colonia Centro, San Salvador",
      "__v": 0
    },
    {
      "_id": "507f1f77bcf86cd799439021",
      "cliente": {
        "_id": "507f1f77bcf86cd799439011",
        "nombre": "Juan Pérez",
        "telefono": "123456789",
        "correo": "juan@example.com"
      },
      "direccion": "Avenida Los Héroes 456, Colonia Escalón, San Salvador",
      "__v": 0
    }
  ]
}
```

#### Error Responses
- **404 Not Found**: No addresses found for client
```json
{
  "mensaje": "No se encontraron direcciones"
}
```

- **500 Internal Server Error**: Database error
```json
{
  "mensaje": "Error interno al buscar direcciones"
}
```

---

### 3. Create Address

**POST** `/direccion`

**Authentication:** Flexible (client token or admin token)

Create a new address for a client.

#### Request Headers
```
Authorization: your-jwt-token-here
Content-Type: application/json
```

#### Request Body
```json
{
  "cliente": "507f1f77bcf86cd799439011",
  "direccion": "Calle Principal 123, Colonia Centro, San Salvador"
}
```

#### Available Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cliente` | String | Yes | MongoDB ObjectId of the client |
| `direccion` | String | Yes | Full address description |

#### Success Response (200)
```json
{
  "direccion": {
    "_id": "507f1f77bcf86cd799439020",
    "cliente": "507f1f77bcf86cd799439011",
    "direccion": "Calle Principal 123, Colonia Centro, San Salvador",
    "__v": 0
  }
}
```

#### Error Responses
- **404 Not Found**: Address could not be saved
```json
{
  "mensaje": "No se pudo guardar la dirección"
}
```

- **500 Internal Server Error**: Database error
```json
{
  "mensaje": "Error interno al guardar dirección"
}
```

#### Usage Example
```bash
curl -X POST http://localhost:3977/api/direccion \
  -H "Content-Type: application/json" \
  -H "Authorization: your-jwt-token-here" \
  -d '{
    "cliente": "507f1f77bcf86cd799439011",
    "direccion": "Calle Principal 123, Colonia Centro, San Salvador"
  }'
```

---

### 4. Update Address

**PUT** `/direccion/:id`

**Authentication:** Flexible (client token or admin token)

Update an existing address.

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | MongoDB ObjectId of the address to update |

#### Request Headers
```
Authorization: your-jwt-token-here
Content-Type: application/json
```

#### Request Body
```json
{
  "direccion": "Nueva Calle 456, Colonia Escalón, San Salvador"
}
```

#### Available Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `direccion` | String | No | Updated address description |
| `cliente` | String | No | Updated client reference (rarely needed) |

#### Success Response (200)
```json
{
  "direccion": {
    "_id": "507f1f77bcf86cd799439020",
    "cliente": "507f1f77bcf86cd799439011",
    "direccion": "Nueva Calle 456, Colonia Escalón, San Salvador",
    "__v": 0
  }
}
```

#### Error Responses
- **404 Not Found**: Address not updated
```json
{
  "mensaje": "Ninguna dirección fue actualizada"
}
```

- **500 Internal Server Error**: Database error
```json
{
  "mensaje": "Error interno al intentar actualizar el dirección"
}
```

#### Usage Example
```bash
curl -X PUT http://localhost:3977/api/direccion/507f1f77bcf86cd799439020 \
  -H "Content-Type: application/json" \
  -H "Authorization: your-jwt-token-here" \
  -d '{
    "direccion": "Nueva Calle 456, Colonia Escalón, San Salvador"
  }'
```

---

### 5. Delete Address

**DELETE** `/direccion/:id`

**Authentication:** Flexible (client token or admin token)

Delete a specific address by its ID.

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | MongoDB ObjectId of the address to delete |

#### Request Headers
```
Authorization: your-jwt-token-here
Content-Type: application/json
```

#### Success Response (200)
```json
{
  "direccion": {
    "_id": "507f1f77bcf86cd799439020",
    "cliente": "507f1f77bcf86cd799439011",
    "direccion": "Calle Principal 123, Colonia Centro, San Salvador",
    "__v": 0
  }
}
```

#### Error Responses
- **404 Not Found**: Address not found
```json
{
  "mensaje": "Dirección no encontrada, no se modifico regisitro"
}
```

- **500 Internal Server Error**: Database error
```json
{
  "mensaje": "Error interno al eliminar dirección"
}
```

#### Usage Example
```bash
curl -X DELETE http://localhost:3977/api/direccion/507f1f77bcf86cd799439020 \
  -H "Authorization: your-jwt-token-here"
```

---

### 6. Delete All Client Addresses

**DELETE** `/direcciones-cliente/:id`

**Authentication:** Admin token required

Delete all addresses belonging to a specific client. This is typically used when removing a client from the system.

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | MongoDB ObjectId of the client |

#### Request Headers
```
Authorization: your-admin-jwt-token-here
Content-Type: application/json
```

#### Success Response (200)
```json
{
  "direcciones": {
    "acknowledged": true,
    "deletedCount": 3
  }
}
```

#### Error Responses
- **404 Not Found**: No addresses found for deletion
```json
{
  "mensaje": "Dirección no encontrada, no se modifico regisitro"
}
```

- **500 Internal Server Error**: Database error
```json
{
  "mensaje": "Error interno al eliminar Direcciones"
}
```

#### Usage Example
```bash
curl -X DELETE http://localhost:3977/api/direcciones-cliente/507f1f77bcf86cd799439011 \
  -H "Authorization: your-admin-jwt-token-here"
```

---

## Address Data Model

### Address (Direccion)
```json
{
  "_id": "ObjectId",
  "cliente": "ObjectId (ref: Cliente, required)",
  "direccion": "string"
}
```

#### Field Descriptions
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Unique identifier for the address |
| `cliente` | ObjectId | Yes | Reference to the Cliente who owns this address |
| `direccion` | String | Yes | Full address description including street, neighborhood, city |

#### Relationships
- **cliente**: References the `Cliente` model
- When populated, includes full client information (name, phone, email)

---

## Address Management Use Cases

### Client Self-Service Scenarios

**Adding a new delivery address:**
```bash
# Client adds their own delivery address
curl -X POST http://localhost:3977/api/direccion \
  -H "Authorization: client-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": "507f1f77bcf86cd799439011",
    "direccion": "Residencial Las Flores, Casa 45, Antiguo Cuscatlán"
  }'
```

**Viewing their addresses:**
```bash
# Client views all their addresses
curl -X GET http://localhost:3977/api/direccion-cliente/507f1f77bcf86cd799439011 \
  -H "Authorization: client-jwt-token"
```

**Updating an address:**
```bash
# Client updates their address details
curl -X PUT http://localhost:3977/api/direccion/507f1f77bcf86cd799439020 \
  -H "Authorization: client-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "direccion": "Residencial Las Flores, Casa 45B, Antiguo Cuscatlán (Portón Verde)"
  }'
```

### Administrative Scenarios

**Managing client addresses:**
```bash
# Admin views all addresses for a client
curl -X GET http://localhost:3977/api/direccion-cliente/507f1f77bcf86cd799439011 \
  -H "Authorization: admin-jwt-token"

# Admin deletes all addresses when removing a client
curl -X DELETE http://localhost:3977/api/direcciones-cliente/507f1f77bcf86cd799439011 \
  -H "Authorization: admin-jwt-token"
```

---

## Security and Access Control

### Authentication Requirements
- **Client Access**: Clients can manage their own addresses using client tokens
- **Admin Access**: Administrators can manage any client's addresses using admin tokens
- **Flexible Auth**: Most endpoints accept both client and admin tokens via `flexAuth.ensureFlexibleAuth`
- **Admin Only**: Bulk deletion of client addresses requires admin token via `md_auth.ensureAuth`

### Best Practices
1. **Client Token Validation**: Ensure clients can only access their own addresses
2. **Address Validation**: Validate address format on the client side before submission
3. **Audit Trail**: Consider logging address changes for administrative purposes
4. **Data Cleanup**: Use bulk deletion endpoint when removing clients from the system

---

## Work Order Management Endpoints

The work order management system is the core of the Castella API, allowing the creation, tracking, and management of service orders throughout their lifecycle. Work orders connect clients with technicians for various services and tasks.

### 1. Get Work Order by ID

**GET** `/orden/:id`

**Authentication:** Flexible (client token or admin token)

Retrieve a specific work order by its unique ID with all related information populated.

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | MongoDB ObjectId of the work order |

#### Request Headers
```
Authorization: your-jwt-token-here
Content-Type: application/json
```

#### Success Response (200)
```json
{
  "ordenDeTrabajo": {
    "_id": "507f1f77bcf86cd799439030",
    "estado": "EN PROCESO",
    "cliente": {
      "_id": "507f1f77bcf86cd799439011",
      "nombre": "Juan Pérez",
      "telefono": "123456789",
      "correo": "juan@example.com"
    },
    "tecnico": {
      "_id": "507f1f77bcf86cd799439013",
      "nombre": "Carlos Martínez",
      "correoPrincipal": "carlos@castellasagarra.com"
    },
    "digitador": {
      "_id": "507f1f77bcf86cd799439014",
      "nombre": "Ana García"
    },
    "servicio": {
      "_id": "507f1f77bcf86cd799439015",
      "nombre": "Instalación de Aire Acondicionado"
    },
    "tarea": {
      "_id": "507f1f77bcf86cd799439016",
      "nombre": "Instalación de Split 12000 BTU"
    },
    "cerroOrden": {
      "_id": "507f1f77bcf86cd799439017",
      "nombre": "Luis Supervisor"
    },
    "fechaDigitacion": "2023-12-10T08:00:00.000Z",
    "fechaProgramada": "2023-12-15T09:00:00.000Z",
    "fechaEjecucion": "2023-12-15T09:30:00.000Z",
    "aniomesprogramacion": "202312",
    "horaInicio": "09:00",
    "horaFinalizacion": "14:00",
    "factura": "F001-00001234",
    "direccion": "507f1f77bcf86cd799439020",
    "numero": 1234,
    "nombreFactura": "Juan Pérez",
    "CFF": false,
    "notas": "Cliente prefiere horario matutino",
    "resultadoGestion": "Servicio completado satisfactoriamente",
    "tipo": "NORMAL",
    "garantiaDe": null,
    "calificacion": "507f1f77bcf86cd799439018",
    "periodicidadMeses": 6,
    "__v": 0
  }
}
```

#### Error Responses
- **404 Not Found**: Work order not found
```json
{
  "mensaje": "No se encontro la orden de trabajo"
}
```

- **500 Internal Server Error**: Database error
```json
{
  "mensaje": "Error en el servidor al consultar orden de trabajo"
}
```

#### Usage Example
```bash
curl -X GET http://localhost:3977/api/orden/507f1f77bcf86cd799439030 \
  -H "Authorization: your-jwt-token-here"
```

---

### 2. Get Work Orders by Client

**GET** `/orden-cliente/:cliente`

**GET** `/cliente/lista-orden/:cliente`

**Authentication:** Flexible (client token or admin token)

Retrieve all work orders for a specific client, sorted by scheduled date (most recent first).

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cliente` | String | Yes | MongoDB ObjectId of the client |

#### Request Headers
```
Authorization: your-jwt-token-here
Content-Type: application/json
```

#### Success Response (200)
```json
{
  "ordenes": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "estado": "FINALIZADO",
      "cliente": {
        "_id": "507f1f77bcf86cd799439011",
        "nombre": "Juan Pérez"
      },
      "tecnico": {
        "_id": "507f1f77bcf86cd799439013",
        "nombre": "Carlos Martínez"
      },
      "digitador": {
        "_id": "507f1f77bcf86cd799439014",
        "nombre": "Ana García"
      },
      "servicio": {
        "_id": "507f1f77bcf86cd799439015",
        "nombre": "Instalación de Aire Acondicionado"
      },
      "tarea": {
        "_id": "507f1f77bcf86cd799439016",
        "nombre": "Instalación de Split 12000 BTU"
      },
      "cerroOrden": {
        "_id": "507f1f77bcf86cd799439017",
        "nombre": "Luis Supervisor"
      },
      "fechaProgramada": "2023-12-15T09:00:00.000Z",
      "numero": 1234,
      "aniomesprogramacion": "202312"
    }
  ]
}
```

#### Error Responses
- **404 Not Found**: No orders found for client
```json
{
  "mensaje": "No se encontraron ordenes de trabajo"
}
```

- **500 Internal Server Error**: Database error
```json
{
  "mensaje": "Error interno al buscar las ordenes de trabajo"
}
```

#### Usage Example
```bash
curl -X GET http://localhost:3977/api/orden-cliente/507f1f77bcf86cd799439011 \
  -H "Authorization: your-jwt-token-here"
```

---

### 3. Get Work Orders by Client and Date Range

**GET** `/orden-cliente-fechas/:cliente/:fechaInicio/:fechaFin`

**Authentication:** Client token required

Retrieve work orders for a specific client within a specified date range. Clients can only access their own orders.

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cliente` | String | Yes | MongoDB ObjectId of the client |
| `fechaInicio` | String | Yes | Start date in YYYY-MM-DD format |
| `fechaFin` | String | Yes | End date in YYYY-MM-DD format |

#### Request Headers
```
Authorization: your-client-jwt-token-here
Content-Type: application/json
```

#### Date Format
- **Format**: `YYYY-MM-DD` (ISO date format)
- **Examples**: `2023-12-01`, `2023-12-31`
- **Time Handling**: Start date begins at 00:00:00, end date extends to 23:59:59
- **Validation**: Start date must be before or equal to end date

#### Success Response (200)
```json
{
  "ordenes": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "estado": "FINALIZADO",
      "cliente": {
        "_id": "507f1f77bcf86cd799439011",
        "nombre": "Juan Pérez"
      },
      "tecnico": {
        "_id": "507f1f77bcf86cd799439013",
        "nombre": "Carlos Martínez"
      },
      "digitador": {
        "_id": "507f1f77bcf86cd799439014",
        "nombre": "Ana García"
      },
      "servicio": {
        "_id": "507f1f77bcf86cd799439015",
        "nombre": "Instalación de Aire Acondicionado"
      },
      "tarea": {
        "_id": "507f1f77bcf86cd799439016",
        "nombre": "Instalación de Split 12000 BTU"
      },
      "cerroOrden": {
        "_id": "507f1f77bcf86cd799439017",
        "nombre": "Luis Supervisor"
      },
      "fechaProgramada": "2023-12-15T09:00:00.000Z",
      "numero": 1234,
      "aniomesprogramacion": "202312"
    }
  ]
}
```

#### Empty Results Response (200)
When no orders are found in the specified date range:
```json
{
  "ordenes": [],
  "mensaje": "No se encontraron ordenes de trabajo en el rango de fechas especificado"
}
```

#### Error Responses

- **400 Bad Request**: Missing date parameters
```json
{
  "mensaje": "Fechas de inicio y fin son requeridas"
}
```

- **400 Bad Request**: Invalid date format
```json
{
  "mensaje": "Formato de fecha inválido. Use YYYY-MM-DD"
}
```

- **400 Bad Request**: Invalid date range
```json
{
  "mensaje": "La fecha de inicio debe ser anterior a la fecha de fin"
}
```

- **403 Forbidden**: Client accessing another client's orders
```json
{
  "mensaje": "No autorizado para ver estas ordenes"
}
```

- **500 Internal Server Error**: Database error
```json
{
  "mensaje": "Error interno al buscar las ordenes de trabajo"
}
```

#### Sorting and Filtering
- **Date Filter**: Filters by `fechaProgramada` field (scheduled date)
- **Sorting**: Results sorted by `fechaProgramada` in descending order (most recent first)
- **Populated Fields**: Includes full details for cliente, tecnico, digitador, servicio, tarea, and cerroOrden

#### Security Features
- **Client Verification**: Automatically validates that the client token matches the requested client ID
- **Access Control**: Clients can only retrieve their own orders
- **Token Validation**: Requires valid client authentication token

#### Usage Examples

**Get orders for December 2023:**
```bash
curl -X GET http://localhost:3977/api/orden-cliente-fechas/507f1f77bcf86cd799439011/2023-12-01/2023-12-31 \
  -H "Authorization: your-client-jwt-token-here"
```

**Get orders for a specific week:**
```bash
curl -X GET http://localhost:3977/api/orden-cliente-fechas/507f1f77bcf86cd799439011/2023-12-11/2023-12-17 \
  -H "Authorization: your-client-jwt-token-here"
```

**Get orders for a single day:**
```bash
curl -X GET http://localhost:3977/api/orden-cliente-fechas/507f1f77bcf86cd799439011/2023-12-15/2023-12-15 \
  -H "Authorization: your-client-jwt-token-here"
```

#### Use Cases
- **Client Dashboard**: Display service history for specific time periods
- **Monthly Reports**: Generate monthly service reports for clients
- **Date-Filtered Views**: Allow clients to search their service history by date
- **Mobile App**: Provide date range filtering in mobile applications
- **Invoice Reconciliation**: Help clients match orders with billing periods

---

### 4. Get Work Orders by Data Entry User

**GET** `/orden-digitador/:digitador`

**Authentication:** User token required

Retrieve all work orders assigned to a specific data entry user (digitador) that are currently in process.

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `digitador` | String | Yes | MongoDB ObjectId of the data entry user |

#### Request Headers
```
Authorization: your-user-jwt-token-here
Content-Type: application/json
```

#### Success Response (200)
```json
{
  "ordenes": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "estado": "EN PROCESO",
      "cliente": {
        "_id": "507f1f77bcf86cd799439011",
        "nombre": "Juan Pérez"
      },
      "tecnico": {
        "_id": "507f1f77bcf86cd799439013",
        "nombre": "Carlos Martínez"
      },
      "digitador": {
        "_id": "507f1f77bcf86cd799439014",
        "nombre": "Ana García"
      },
      "servicio": {
        "_id": "507f1f77bcf86cd799439015",
        "nombre": "Instalación de Aire Acondicionado"
      },
      "tarea": {
        "_id": "507f1f77bcf86cd799439016",
        "nombre": "Instalación de Split 12000 BTU"
      },
      "cerroOrden": null,
      "fechaProgramada": "2023-12-15T09:00:00.000Z"
    }
  ]
}
```

#### Error Responses
- **404 Not Found**: No orders found
```json
{
  "mensaje": "No se encontraron ordenes de trabajo"
}
```

- **500 Internal Server Error**: Database error
```json
{
  "mensaje": "Error interno al buscar las ordenes de trabajo"
}
```

---

### 4. Get Work Orders by Technician

**GET** `/orden-tecnico/:tecnico`

**Authentication:** User token required

Retrieve all work orders assigned to a specific technician that are currently in process.

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tecnico` | String | Yes | MongoDB ObjectId of the technician |

#### Request Headers
```
Authorization: your-user-jwt-token-here
Content-Type: application/json
```

#### Success Response (200)
```json
{
  "ordenes": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "estado": "EN PROCESO",
      "cliente": {
        "_id": "507f1f77bcf86cd799439011",
        "nombre": "Juan Pérez"
      },
      "tecnico": {
        "_id": "507f1f77bcf86cd799439013",
        "nombre": "Carlos Martínez"
      },
      "digitador": {
        "_id": "507f1f77bcf86cd799439014",
        "nombre": "Ana García"
      },
      "servicio": {
        "_id": "507f1f77bcf86cd799439015",
        "nombre": "Instalación de Aire Acondicionado"
      },
      "tarea": {
        "_id": "507f1f77bcf86cd799439016",
        "nombre": "Instalación de Split 12000 BTU"
      },
      "cerroOrden": null,
      "fechaProgramada": "2023-12-15T09:00:00.000Z"
    }
  ]
}
```

#### Error Responses
- **404 Not Found**: No orders found
```json
{
  "mensaje": "No se encontraron ordenes de trabajo"
}
```

- **500 Internal Server Error**: Database error
```json
{
  "mensaje": "Error interno al buscar las ordenes de trabajo"
}
```

---

### 5. Get Work Order by Number

**GET** `/orden-numero/:numero`

**Authentication:** Flexible (client token or admin token)

Retrieve a work order by its full order number (format: YYYYMM + sequential number).

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `numero` | String | Yes | Full order number (e.g., "2023121234") |

#### Request Headers
```
Authorization: your-jwt-token-here
Content-Type: application/json
```

#### Order Number Format
- Format: `YYYYMM` + `sequential_number`
- Example: `2023121234` = December 2023, order #1234
- The endpoint automatically splits the year/month prefix from the sequential number

#### Success Response (200)
```json
{
  "orden": {
    "_id": "507f1f77bcf86cd799439030",
    "estado": "FINALIZADO",
    "cliente": {
      "_id": "507f1f77bcf86cd799439011",
      "nombre": "Juan Pérez"
    },
    "tecnico": {
      "_id": "507f1f77bcf86cd799439013",
      "nombre": "Carlos Martínez"
    },
    "numero": 1234,
    "aniomesprogramacion": "202312",
    "fechaProgramada": "2023-12-15T09:00:00.000Z"
  }
}
```

#### Error Responses
- **404 Not Found**: Order not found
```json
{
  "mensaje": "No se encontraron ordenes de trabajo"
}
```

- **500 Internal Server Error**: Database error
```json
{
  "mensaje": "Error interno al buscar las ordenes de trabajo"
}
```

#### Usage Example
```bash
curl -X GET http://localhost:3977/api/orden-numero/2023121234 \
  -H "Authorization: your-jwt-token-here"
```

---

### 6. Get Work Orders by Filter

**GET** `/orden-filtro/:filtro`

**Authentication:** User token required

Retrieve work orders using a JSON filter with custom search criteria.

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filtro` | String | Yes | URL-encoded JSON filter object |

#### Request Headers
```
Authorization: your-user-jwt-token-here
Content-Type: application/json
```

#### Filter Examples

**Filter by state:**
```json
{"estado": "EN PROCESO"}
```

**Filter by date range:**
```json
{
  "fechaProgramada": {
    "$gte": "2023-12-01T00:00:00.000Z",
    "$lte": "2023-12-31T23:59:59.999Z"
  }
}
```

**Filter by client and technician:**
```json
{
  "cliente": "507f1f77bcf86cd799439011",
  "tecnico": "507f1f77bcf86cd799439013"
}
```

#### Success Response (200)
```json
{
  "ordenes": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "estado": "EN PROCESO",
      "cliente": {
        "_id": "507f1f77bcf86cd799439011",
        "nombre": "Juan Pérez"
      },
      "tecnico": {
        "_id": "507f1f77bcf86cd799439013",
        "nombre": "Carlos Martínez"
      },
      "fechaProgramada": "2023-12-15T09:00:00.000Z",
      "horaInicio": "09:00"
    }
  ]
}
```

#### Sorting
Results are automatically sorted by:
1. `fechaProgramada` (ascending)
2. `horaInicio` (ascending)

#### Usage Example
```bash
# Filter by state
curl -X GET "http://localhost:3977/api/orden-filtro/%7B%22estado%22%3A%22EN%20PROCESO%22%7D" \
  -H "Authorization: your-user-jwt-token-here"

# Note: %7B%22estado%22%3A%22EN%20PROCESO%22%7D is URL-encoded {"estado":"EN PROCESO"}
```

---

### 7. Create Work Order

**POST** `/orden`

**Authentication:** Flexible (client token or admin token)

Create a new work order with automatic number assignment and email notifications.

#### Request Headers
```
Authorization: your-jwt-token-here
Content-Type: application/json
```

#### Request Body
```json
{
  "estado": "PENDIENTE",
  "cliente": "507f1f77bcf86cd799439011",
  "tecnico": "507f1f77bcf86cd799439013",
  "digitador": "507f1f77bcf86cd799439014",
  "servicio": "507f1f77bcf86cd799439015",
  "tarea": "507f1f77bcf86cd799439016",
  "fechaDigitacion": "2023-12-10T08:00:00.000Z",
  "fechaProgramada": "2023-12-15T09:00:00.000Z",
  "fechaEjecucion": null,
  "horaInicio": "09:00",
  "horaFinalizacion": null,
  "factura": null,
  "direccion": "507f1f77bcf86cd799439020",
  "nombreFactura": "Juan Pérez",
  "CFF": false,
  "notas": "Cliente prefiere horario matutino",
  "resultadoGestion": null
}
```

#### Available Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `estado` | String | Yes | Current state of the order |
| `cliente` | String | Yes | MongoDB ObjectId of the client |
| `tecnico` | String | No | MongoDB ObjectId of assigned technician |
| `digitador` | String | No | MongoDB ObjectId of data entry user |
| `servicio` | String | No | MongoDB ObjectId of the service |
| `tarea` | String | No | MongoDB ObjectId of the specific task |
| `fechaDigitacion` | Date | No | Date when order was created |
| `fechaProgramada` | Date | No | Scheduled execution date |
| `fechaEjecucion` | Date | No | Actual execution date |
| `horaInicio` | String | No | Start time (HH:MM format) |
| `horaFinalizacion` | String | No | End time (HH:MM format) |
| `factura` | String | No | Invoice number |
| `direccion` | String | No | MongoDB ObjectId of service address |
| `nombreFactura` | String | No | Name for invoice |
| `CFF` | Boolean | No | Consumer final flag |
| `notas` | String | No | Additional notes |
| `resultadoGestion` | String | No | Management result/outcome |

#### Auto-generated Fields
- `numero`: Sequential number within the month/year
- `aniomesprogramacion`: YYYYMM format from `fechaProgramada`

#### Success Response (200)
```json
{
  "ordenDeTrabajo": {
    "_id": "507f1f77bcf86cd799439030",
    "estado": "PENDIENTE",
    "cliente": "507f1f77bcf86cd799439011",
    "tecnico": "507f1f77bcf86cd799439013",
    "numero": 1234,
    "aniomesprogramacion": "202312",
    "fechaDigitacion": "2023-12-10T08:00:00.000Z",
    "fechaProgramada": "2023-12-15T09:00:00.000Z",
    "__v": 0
  }
}
```

#### Email Notifications
When a work order is created, the system automatically sends email notifications to:
- **Client**: Service appointment confirmation with details
- **Technician**: Work assignment notification with client contact info

#### Error Responses
- **404 Not Found**: Order could not be saved
```json
{
  "mensaje": "No se pudo guardar la orden de trabajo"
}
```

- **500 Internal Server Error**: Database error
```json
{
  "mensaje": "Error interno al guardar orden de trabajo"
}
```

#### Usage Example
```bash
curl -X POST http://localhost:3977/api/orden \
  -H "Content-Type: application/json" \
  -H "Authorization: your-jwt-token-here" \
  -d '{
    "estado": "PENDIENTE",
    "cliente": "507f1f77bcf86cd799439011",
    "tecnico": "507f1f77bcf86cd799439013",
    "servicio": "507f1f77bcf86cd799439015",
    "tarea": "507f1f77bcf86cd799439016",
    "fechaProgramada": "2023-12-15T09:00:00.000Z",
    "horaInicio": "09:00",
    "direccion": "507f1f77bcf86cd799439020",
    "notas": "Cliente prefiere horario matutino"
  }'
```

---

### 8. Update Work Order

**PUT** `/orden/:id`

**Authentication:** Flexible (client token or admin token)

Update an existing work order with automatic email notifications.

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | MongoDB ObjectId of the work order to update |

#### Request Headers
```
Authorization: your-jwt-token-here
Content-Type: application/json
```

#### Request Body
All fields are optional. Only include fields you want to update.

```json
{
  "estado": "FINALIZADO",
  "fechaEjecucion": "2023-12-15T09:30:00.000Z",
  "horaFinalizacion": "14:00",
  "factura": "F001-00001234",
  "resultadoGestion": "Servicio completado satisfactoriamente",
  "cerroOrden": "507f1f77bcf86cd799439017"
}
```

#### Available Update Fields
Any field from the work order model can be updated. Common updates include:
- `estado`: Change order status
- `tecnico`: Reassign technician
- `fechaEjecucion`: Set actual execution date
- `horaFinalizacion`: Set completion time
- `factura`: Add invoice number
- `resultadoGestion`: Record service outcome
- `cerroOrden`: Set who closed the order

#### Success Response (200)
```json
{
  "ordenDeTrabajo": {
    "_id": "507f1f77bcf86cd799439030",
    "estado": "FINALIZADO",
    "fechaEjecucion": "2023-12-15T09:30:00.000Z",
    "horaFinalizacion": "14:00",
    "factura": "F001-00001234",
    "resultadoGestion": "Servicio completado satisfactoriamente",
    "cerroOrden": "507f1f77bcf86cd799439017"
  }
}
```

#### Email Notifications

**For non-completed orders (`estado != 'FINALIZADO'`):**
- Sends update notifications to client and technician with new scheduling information

**For completed orders (`estado == 'FINALIZADO'`):**
- Sends completion notification to administrators with invoice information
- Includes who closed the order and final details

#### Error Responses
- **404 Not Found**: Order not updated
```json
{
  "mensaje": "Ninguna orden de trabajo fue actualizada"
}
```

- **500 Internal Server Error**: Database error
```json
{
  "mensaje": "Error interno al intentar actualizar la orden de trabajo"
}
```

#### Usage Example
```bash
curl -X PUT http://localhost:3977/api/orden/507f1f77bcf86cd799439030 \
  -H "Content-Type: application/json" \
  -H "Authorization: your-jwt-token-here" \
  -d '{
    "estado": "FINALIZADO",
    "fechaEjecucion": "2023-12-15T09:30:00.000Z",
    "factura": "F001-00001234",
    "resultadoGestion": "Servicio completado satisfactoriamente"
  }'
```

---

### 9. Delete Work Order

**DELETE** `/orden/:id`

**Authentication:** User token required (Admin access)

Delete a work order by its ID. This is a permanent operation.

#### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | MongoDB ObjectId of the work order to delete |

#### Request Headers
```
Authorization: your-user-jwt-token-here
Content-Type: application/json
```

#### Success Response (200)
```json
{
  "ordenDeTrabajo": {
    "_id": "507f1f77bcf86cd799439030",
    "estado": "PENDIENTE",
    "cliente": "507f1f77bcf86cd799439011",
    "numero": 1234,
    "aniomesprogramacion": "202312"
  }
}
```

#### Error Responses
- **404 Not Found**: Order not found
```json
{
  "mensaje": "Orden de trabajo no eliminada"
}
```

- **500 Internal Server Error**: Database error
```json
{
  "mensaje": "Error interno al eliminar Orden de Trabajo"
}
```

#### Usage Example
```bash
curl -X DELETE http://localhost:3977/api/orden/507f1f77bcf86cd799439030 \
  -H "Authorization: your-user-jwt-token-here"
```

#### Important Notes
- This operation is **permanent** and cannot be undone
- Consider updating the order status instead of deletion for audit trail purposes
- Requires administrative privileges

---

## Work Order Data Model

### OrdenDeTrabajo Schema
```json
{
  "_id": "ObjectId",
  "estado": "string",
  "cliente": "ObjectId (ref: Cliente, required)",
  "tecnico": "ObjectId (ref: Usuario, optional)",
  "digitador": "ObjectId (ref: Usuario, optional)",
  "cerroOrden": "ObjectId (ref: Usuario, optional)",
  "servicio": "ObjectId (ref: Servicio, optional)",
  "tarea": "ObjectId (ref: Tarea, optional)",
  "fechaDigitacion": "Date",
  "fechaProgramada": "Date",
  "fechaEjecucion": "Date",
  "aniomesprogramacion": "string",
  "horaInicio": "string",
  "horaFinalizacion": "string",
  "factura": "string",
  "direccion": "ObjectId (ref: Direccion, optional)",
  "numero": "number (auto-increment)",
  "nombreFactura": "string",
  "CFF": "boolean",
  "notas": "string",
  "nota": "ObjectId (ref: Nota)",
  "resultadoGestion": "string",
  "tipo": "string (default: 'NORMAL')",
  "garantiaDe": "ObjectId (ref: OrdenDeTrabajo)",
  "calificacion": "ObjectId (ref: Calificacion)",
  "periodicidadMeses": "number"
}
```

#### Field Descriptions
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `estado` | String | No | Current status (PENDIENTE, EN PROCESO, FINALIZADO, etc.) |
| `cliente` | ObjectId | Yes | Reference to the client who requested the service |
| `tecnico` | ObjectId | No | Reference to the assigned technician |
| `digitador` | ObjectId | No | Reference to the user who created the order |
| `cerroOrden` | ObjectId | No | Reference to the user who closed the order |
| `servicio` | ObjectId | No | Reference to the service being provided |
| `tarea` | ObjectId | No | Reference to the specific task within the service |
| `fechaDigitacion` | Date | No | When the order was created in the system |
| `fechaProgramada` | Date | No | Scheduled date for service execution |
| `fechaEjecucion` | Date | No | Actual date when service was performed |
| `aniomesprogramacion` | String | Auto | Year-month of scheduling (YYYYMM format) |
| `horaInicio` | String | No | Scheduled start time (HH:MM format) |
| `horaFinalizacion` | String | No | Actual end time (HH:MM format) |
| `factura` | String | No | Invoice number when service is billed |
| `direccion` | ObjectId | No | Reference to the service location |
| `numero` | Number | Auto | Sequential order number within the month |
| `nombreFactura` | String | No | Name to appear on invoice |
| `CFF` | Boolean | No | Consumer final flag for tax purposes |
| `notas` | String | No | Additional notes or special instructions |
| `nota` | ObjectId | No | Reference to detailed notes |
| `resultadoGestion` | String | No | Final outcome or result of the service |
| `tipo` | String | No | Order type (NORMAL, REVISION for guarantees) |
| `garantiaDe` | ObjectId | No | Reference to original order if this is a guarantee |
| `calificacion` | ObjectId | No | Reference to customer rating for this order |
| `periodicidadMeses` | Number | No | Months between maintenance visits |

#### Auto-generated Features
- **Order Number**: Automatically incremented within each month/year period
- **Year-Month**: Automatically extracted from `fechaProgramada`
- **Versioning**: MongoDB document versioning with `__v` field

#### Relationships
- **cliente**: Links to `Cliente` model for customer information
- **tecnico/digitador/cerroOrden**: Link to `Usuario` model for staff members
- **servicio**: Links to `Servicio` model for service catalog
- **tarea**: Links to `Tarea` model for specific task details
- **direccion**: Links to `Direccion` model for service location
- **garantiaDe**: Self-reference for guarantee orders
- **calificacion**: Links to `Calificacion` model for customer ratings

---

## Work Order Workflow States

### Common State Values
| State | Description | Next States |
|-------|-------------|-------------|
| `PENDIENTE` | Newly created, awaiting assignment | EN PROCESO, CANCELADO |
| `EN PROCESO` | Assigned and in progress | FINALIZADO, CANCELADO |
| `FINALIZADO` | Service completed | GARANTIA (if applicable) |
| `CANCELADO` | Order cancelled | - |
| `GARANTIA` | Under guarantee review | FINALIZADO |

### State Transitions
1. **Creation**: Order starts as `PENDIENTE`
2. **Assignment**: When technician assigned, moves to `EN PROCESO`
3. **Completion**: When service finished, moves to `FINALIZADO`
4. **Guarantee**: If issues arise, may create new order with `tipo: 'REVISION'`

---

## Email Notification System

### Notification Triggers

#### Order Creation (`guardarOrdenDeTrabajo`)
- **To Client**: Service appointment confirmation
- **To Technician**: Work assignment notification
- **Content**: Date, time, address, service details

#### Order Updates (`actualizarOrdenDeTrabajo`)
- **Non-Final Updates**: Schedule changes sent to client and technician
- **Final Updates** (`estado: 'FINALIZADO'`): Completion notification to administrators

#### Email Content Examples

**Client Notification:**
```
Estimado Juan Pérez por este medio le informamos que el día 15/12/2023 
a las 09:00 nuestro técnico Carlos Martínez lo visitará en Calle Principal 123 
para brindarle el servicio de Instalación de Split 12000 BTU 
(Instalación de Aire Acondicionado)

Atentamente,
Ferretería Castella Sagarra
```

**Technician Notification:**
```
Estimado Carlos Martínez por este medio le informamos que el día 15/12/2023 
a las 09:00 debe visitar al cliente Juan Pérez (Teléfonos: 123456789 7555-1234) 
en Calle Principal 123 para brindarle el servicio de Instalación de Split 12000 BTU 
(Instalación de Aire Acondicionado)

Atentamente,
Ferretería Castella Sagarra
```

---

## API Usage Examples

### Complete Work Order Lifecycle

#### 1. Create New Order
```bash
curl -X POST http://localhost:3977/api/orden \
  -H "Content-Type: application/json" \
  -H "Authorization: your-jwt-token" \
  -d '{
    "estado": "PENDIENTE",
    "cliente": "507f1f77bcf86cd799439011",
    "servicio": "507f1f77bcf86cd799439015",
    "tarea": "507f1f77bcf86cd799439016",
    "fechaProgramada": "2023-12-15T09:00:00.000Z",
    "horaInicio": "09:00",
    "direccion": "507f1f77bcf86cd799439020",
    "notas": "Cliente prefiere horario matutino"
  }'
```

#### 2. Assign Technician
```bash
curl -X PUT http://localhost:3977/api/orden/507f1f77bcf86cd799439030 \
  -H "Content-Type: application/json" \
  -H "Authorization: your-jwt-token" \
  -d '{
    "tecnico": "507f1f77bcf86cd799439013",
    "estado": "EN PROCESO"
  }'
```

#### 3. Update Progress
```bash
curl -X PUT http://localhost:3977/api/orden/507f1f77bcf86cd799439030 \
  -H "Content-Type: application/json" \
  -H "Authorization: your-jwt-token" \
  -d '{
    "fechaEjecucion": "2023-12-15T09:30:00.000Z",
    "resultadoGestion": "Instalación iniciada sin problemas"
  }'
```

#### 4. Complete Order
```bash
curl -X PUT http://localhost:3977/api/orden/507f1f77bcf86cd799439030 \
  -H "Content-Type: application/json" \
  -H "Authorization: your-jwt-token" \
  -d '{
    "estado": "FINALIZADO",
    "horaFinalizacion": "14:00",
    "factura": "F001-00001234",
    "resultadoGestion": "Servicio completado satisfactoriamente",
    "cerroOrden": "507f1f77bcf86cd799439017"
  }'
```

### Administrative Queries

#### Get All Pending Orders
```bash
curl -X GET "http://localhost:3977/api/orden-filtro/%7B%22estado%22%3A%22PENDIENTE%22%7D" \
  -H "Authorization: your-user-jwt-token"
```

#### Get Orders for Today
```bash
# Filter for today's date (URL-encoded JSON)
curl -X GET "http://localhost:3977/api/orden-filtro/%7B%22fechaProgramada%22%3A%7B%22%24gte%22%3A%222023-12-15T00%3A00%3A00.000Z%22%2C%22%24lt%22%3A%222023-12-16T00%3A00%3A00.000Z%22%7D%7D" \
  -H "Authorization: your-user-jwt-token"
```

#### Get Technician Workload
```bash
curl -X GET http://localhost:3977/api/orden-tecnico/507f1f77bcf86cd799439013 \
  -H "Authorization: your-user-jwt-token"
```

### Client Self-Service

#### View Own Orders
```bash
curl -X GET http://localhost:3977/api/orden-cliente/507f1f77bcf86cd799439011 \
  -H "Authorization: your-client-jwt-token"
```

#### Check Order Status by Number
```bash
curl -X GET http://localhost:3977/api/orden-numero/2023121234 \
  -H "Authorization: your-client-jwt-token"
```

---

## Security and Access Control

### Authentication Requirements

#### Flexible Authentication (`flexAuth.ensureFlexibleAuth`)
Accepts both client and admin tokens:
- **GET** `/orden/:id` - Clients can view their own orders, admins can view all
- **GET** `/orden-cliente/:cliente` - Clients can view their own orders
- **GET** `/orden-numero/:numero` - Order lookup by number
- **POST** `/orden` - Both clients and staff can create orders
- **PUT** `/orden/:id` - Order updates

#### Admin Authentication (`md_auth.ensureAuth`)
Requires user/admin tokens only:
- **GET** `/orden-digitador/:digitador` - Staff workflow management
- **GET** `/orden-tecnico/:tecnico` - Technician assignments
- **GET** `/orden-filtro/:filtro` - Advanced filtering and reporting
- **DELETE** `/orden/:id` - Order deletion (admin only)

### Data Access Controls
- Clients can only access their own orders when using client tokens
- Technicians can access orders assigned to them
- Administrators have full access to all orders
- Order numbers are not sequential across clients for privacy

### Best Practices
1. **Input Validation**: Validate all dates, ObjectIds, and state transitions
2. **State Management**: Enforce proper workflow state transitions
3. **Audit Trail**: Log all order modifications with user information
4. **Email Verification**: Ensure email addresses are valid before sending notifications
5. **Access Logging**: Monitor access patterns for security analysis

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
- **Added comprehensive address management system**