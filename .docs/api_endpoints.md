# API Endpoints

> All endpoints are served under the common base path **`/api`**.
>
> Unless noted otherwise, every route requires a valid JWT token provided in the `Authorization` header because they are protected by the `md_auth.ensureAuth` middleware.

---

## Authentication & Users

| Method | Endpoint | Auth? | Purpose |
| ------ | -------- | ----- | ------- |
| POST | `/api/login` | ❌ | Authenticate a user (web) |
| POST | `/api/login-mobile` | ❌ | Authenticate a user from a mobile client |
| POST | `/api/registrar` | ✅ | Create a new user account |
| GET | `/api/usuarios/:page?` | ✅ | Paginated list of users |
| GET | `/api/usuarios-rol/:rol` | ✅ | List users that belong to the indicated role |
| GET | `/api/usuarios-filtro/:filtro` | ✅ | List users that match the search filter |
| GET | `/api/usuario/:id` | ✅ | Get a single user by its ID |
| PUT | `/api/usuario/:id` | ✅ | Update user data |
| DELETE | `/api/usuario/:id` | ✅ | Delete a user |
| GET | `/api/admin-super` | ✅ | Check whether the authenticated user has the *admin-super* role |

---

## Servicios

| Method | Endpoint | Auth? | Purpose |
| ------ | -------- | ----- | ------- |
| GET | `/api/servicio/:id` | ✅ | Retrieve a single service |
| GET | `/api/servicios/:page?` | ✅ | Paginated list of services |
| POST | `/api/servicio` | ✅ | Create a new service |
| PUT | `/api/servicio/:id` | ✅ | Update an existing service |
| DELETE | `/api/servicio/:id` | ✅ | Remove a service |

---

## Tareas

| Method | Endpoint | Auth? | Purpose |
| ------ | -------- | ----- | ------- |
| GET | `/api/tarea/:id` | ✅ | Retrieve a single task |
| GET | `/api/tareas/:page?` | ✅ | Paginated list of tasks |
| POST | `/api/tarea` | ✅ | Create a new task |
| PUT | `/api/tarea/:id` | ✅ | Update an existing task |
| DELETE | `/api/tarea/:id` | ✅ | Remove a task |

---

## Clientes

| Method | Endpoint | Auth? | Purpose |
| ------ | -------- | ----- | ------- |
| GET | `/api/cliente/:id` | ✅ | Retrieve a single client |
| GET | `/api/cliente-nombre/:nombre` | ✅ | Search client by name |
| GET | `/api/cliente-telefono/:telefono` | ✅ | Search client by phone |
| GET | `/api/clientes/:page?` | ✅ | Paginated list of clients |
| GET | `/api/clientes-todos` | ✅ | Full list of clients (no pagination) |
| POST | `/api/cliente` | ✅ | Create a new client |
| PUT | `/api/cliente/:id` | ✅ | Update client data |

---

## Direcciones

| Method | Endpoint | Auth? | Purpose |
| ------ | -------- | ----- | ------- |
| GET | `/api/direccion/:id` | ✅ | Retrieve a single address |
| GET | `/api/direccion-cliente/:cliente` | ✅ | List client addresses |
| POST | `/api/direccion` | ✅ | Create a new address |
| PUT | `/api/direccion/:id` | ✅ | Update an existing address |
| DELETE | `/api/direccion/:id` | ✅ | Delete an address |
| DELETE | `/api/direcciones-cliente/:id` | ✅ | Remove all addresses for the indicated client |

---

## Ordenes de Trabajo

| Method | Endpoint | Auth? | Purpose |
| ------ | -------- | ----- | ------- |
| GET | `/api/orden/:id` | ✅ | Retrieve a single work order |
| GET | `/api/orden-cliente/:cliente` | ✅ | List work orders by client |
| GET | `/api/cliente/lista-orden/:cliente` | ✅ | Alias of the previous route |
| GET | `/api/orden-digitador/:digitador` | ✅ | Work orders by digitizer user ID |
| GET | `/api/orden-tecnico/:tecnico` | ✅ | Work orders by technician user ID |
| GET | `/api/orden-numero/:numero` | ✅ | Search work order by external number |
| GET | `/api/orden-filtro/:filtro` | ✅ | Search work orders by filter (text) |
| POST | `/api/orden` | ✅ | Create a new work order |
| PUT | `/api/orden/:id` | ✅ | Update a work order |
| DELETE | `/api/orden/:id` | ✅ | Delete a work order |

---

## Notas

| Method | Endpoint | Auth? | Purpose |
| ------ | -------- | ----- | ------- |
| GET | `/api/notas-orden/:orden` | ✅ | List notes attached to a work order |
| POST | `/api/nota` | ✅ | Add a new note |
| PUT | `/api/nota/:id` | ✅ | Update a note |
| DELETE | `/api/nota/:id` | ✅ | Remove a note |

---

## Registros de Sesión (Login tokens)

| Method | Endpoint | Auth? | Purpose |
| ------ | -------- | ----- | ------- |
| GET | `/api/registros/:usuario` | ✅ | List all active tokens for the indicated user |
| POST | `/api/registro` | ✅ | Save a new login token |
| DELETE | `/api/registro/:token` | ✅ | Invalidate a token |

---

## Fotos e Imágenes

| Method | Endpoint | Auth? | Purpose |
| ------ | -------- | ----- | ------- |
| POST | `/api/subir-foto/:id` | ✅ | Upload a photo for a work-order element (multipart) |
| DELETE | `/api/foto/:id` | ✅ | Remove a photo |
| GET | `/api/get-foto/:foto` | ❌ | Fetch a stored photo by filename |
| GET | `/api/get-foto-orden/:id` | ❌ | List photos linked to a work order |
| GET | `/api/get-imagen/:imagen` | ❌ | Fetch a generic image asset |
| GET | `/api/get-img-producto/:id` | ❌ | Fetch a product image |
| GET | `/api/get-logo/` | ❌ | Fetch company logo |

---

## Notificaciones Push & E-mail

| Method | Endpoint | Auth? | Purpose |
| ------ | -------- | ----- | ------- |
| POST | `/api/enviar-notificacion/` | ✅ | Send a notification to a user/user-list |
| POST | `/api/push-subscription` | ✅ | Save a push-notification subscription |
| POST | `/api/push-notification` | ✅ | Trigger a web-push notification |

---

## Menús (UI Navigation)

| Method | Endpoint | Auth? | Purpose |
| ------ | -------- | ----- | ------- |
| GET | `/api/menu/:id` | ✅ | Retrieve a single menu entry |
| GET | `/api/menus/` | ✅ | List all menu entries |
| GET | `/api/arbol-menus-rol/:rolid` | ✅ | Tree of menu entries for the given role |
| POST | `/api/menu` | ✅ | Create a new menu entry |
| PUT | `/api/menu/:id` | ✅ | Update a menu entry |
| DELETE | `/api/menu/:id` | ✅ | Delete a menu entry |

---

## Roles

| Method | Endpoint | Auth? | Purpose |
| ------ | -------- | ----- | ------- |
| GET | `/api/rol/:id` | ✅ | Retrieve a single role |
| GET | `/api/rols/` | ✅ | List all roles |
| POST | `/api/rol` | ✅ | Create a role |
| PUT | `/api/rol/:id` | ✅ | Update role data |
| DELETE | `/api/rol/:id` | ✅ | Delete a role |

---

## Screens (Pantallas)

| Method | Endpoint | Auth? | Purpose |
| ------ | -------- | ----- | ------- |
| GET | `/api/screen/:id` | ✅ | Retrieve a screen definition |
| GET | `/api/screens/` | ✅ | List screen definitions |
| POST | `/api/screen` | ✅ | Create a screen definition |
| PUT | `/api/screen/:id` | ✅ | Update a screen definition |
| DELETE | `/api/screen/:id` | ✅ | Delete a screen definition |

### Screen ↔ Rol Mapping

| Method | Endpoint | Auth? | Purpose |
| ------ | -------- | ----- | ------- |
| GET | `/api/screen-rol/:id` | ✅ | Get mapping item by ID |
| GET | `/api/screen-conf/:rolid/:screenid` | ✅ | Get mapping by role & screen IDs |
| GET | `/api/screen-conf-path/:rolid/:path` | ✅ | Get mapping by role & path |
| GET | `/api/screens-rol/:rol` | ✅ | List screens available for a role |
| POST | `/api/screen-rol` | ✅ | Create a new mapping |
| PUT | `/api/screen-rol/:id` | ✅ | Update a mapping |
| DELETE | `/api/screen-rol/:id` | ✅ | Delete a mapping item |
| DELETE | `/api/screens-rol/:rolid` | ✅ | Remove **all** mappings for a role |

---

## CSV Import

| Method | Endpoint | Auth? | Purpose |
| ------ | -------- | ----- | ------- |
| POST | `/api/upload-csv/` | ✅ | Upload a CSV file for server-side processing (multipart) |

---

## Inventario – `invmaes`

| Method | Endpoint | Auth? | Purpose |
| ------ | -------- | ----- | ------- |
| GET | `/api/invmaes/:id` | ✅ | Retrieve an inventory item |
| GET | `/api/invmaes-active/` | ✅ | List active inventory items |
| POST | `/api/invmaes` | ✅ | Create an inventory item |
| PUT | `/api/invmaes/:id` | ✅ | Update an item |
| DELETE | `/api/invmaes/:id` | ✅ | Delete an item |

---

## Auxiliares – `ctauxi`

| Method | Endpoint | Auth? | Purpose |
| ------ | -------- | ----- | ------- |
| GET | `/api/ctauxi/:id` | ✅ | Retrieve auxiliar data record |
| GET | `/api/ctauxi-email/:id` | ✅ | Get email for auxiliar record |
| GET | `/api/ctauxis/` | ✅ | List auxiliar data records |
| POST | `/api/ctauxi` | ✅ | Create auxiliar record |
| PUT | `/api/ctauxi/:id` | ✅ | Update auxiliar record |
| DELETE | `/api/ctauxi/:id` | ✅ | Delete auxiliar record |

---

## Cotizaciones

| Method | Endpoint | Auth? | Purpose |
| ------ | -------- | ----- | ------- |
| GET | `/api/cotizacion/:id` | ✅ | Retrieve a quote |
| GET | `/api/cotizacion-todo/:id` | ✅ | Retrieve quote with full detail |
| GET | `/api/cotizaciones/:page` | ✅ | Paginated list of quotes |
| GET | `/api/cotizaciones-ctauxi/:page/:ctauxi` | ✅ | Quotes for a given *ctauxi* |
| GET | `/api/cotizaciones-numero/:numero` | ✅ | Search quote by external number |
| GET | `/api/cotizaciones-filtro/:filtro` | ✅ | Search quotes via free-text filter |
| POST | `/api/cotizacion` | ✅ | Create a new quote |
| PUT | `/api/cotizacion/:id` | ✅ | Update a quote |
| DELETE | `/api/cotizacion/:id` | ✅ | Delete a quote |
| POST | `/api/send-ctz-email` | ✅ | Send a quote via e-mail |

### Detalle de Cotización

| Method | Endpoint | Auth? | Purpose |
| ------ | -------- | ----- | ------- |
| GET | `/api/item-ctz/:id` | ✅ | Retrieve a line-item |
| GET | `/api/detalle-dtz/` | ✅ | List quote line-items |
| POST | `/api/item-ctz` | ✅ | Add a line-item |
| PUT | `/api/item-ctz/:id` | ✅ | Update a line-item |
| DELETE | `/api/item-ctz/:id` | ✅ | Remove a line-item |

---

## Versioning & Misc

*All endpoints follow REST naming conventions and exchange JSON unless otherwise specified.*

* `✅` = authentication required (JWT via `Authorization` header)
* `❌` = public endpoint (no authentication) 