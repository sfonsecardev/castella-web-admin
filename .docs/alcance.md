# Alcance

proyecto de **Desarrollo de una Aplicación Móvil para clientes finales y aplicación web administrativa de la FERRETERÍA CASTELLA SAGARRA**. 

## Alcance del Proyecto

### 1. Aplicación Móvil para Clientes

#### 1.1 Registro y Gestión de Perfil

- **Registro de Usuarios**  
  - Registro mediante redes sociales (Google, Apple ID, Facebook).  
  - Registro manual mediante formulario de datos personales (nombre, dirección, teléfono, email y contraseña).  
  - Validación de cuenta mediante correo electrónico.
- **Gestión de Perfil**  
  - Visualización y actualización de información personal.  
  - Cambio de contraseña.  
  - Recuperación de contraseña.  
  - Gestión de direcciones (agregar nuevas o actualizar las existentes).

#### 1.2 Solicitud y Seguimiento de Órdenes

- **Solicitar Orden de Trabajo**  
  - Solicitud de órdenes de trabajo a domicilio.  
  - Ingreso de la descripción del problema o servicio solicitado.  
  - Almacenamiento de la información de la solicitud en el sistema.  
  - *Nueva funcionalidad – Gestión de Garantías:*  
    - En el detalle de una orden finalizada (con menos de 1 año de finalización) se mostrará la opción de solicitar garantía.  
    - Al solicitar garantía se creará una nueva orden del tipo **“Revisión”** vinculada a la orden original, permitiendo que el personal administrativo pueda ver el detalle y asignar al mismo técnico u otro según disponibilidad.
- **Seguimiento de Órdenes**  
  - Visualización de órdenes activas y su estado actual.  
  - Seguimiento del estado de las órdenes en tiempo real.  
  - Historial de órdenes, con opciones de búsqueda por fecha o dirección.

#### 1.3 Pago del Servicio

- **Integración de Pagos**  
  - *Nueva funcionalidad – Pago vía Wompi:*  
    - Se integrará la API de Wompi para que, una vez que el personal administrativo registre el costo del servicio, se active la opción de pago.  
    - El usuario podrá realizar el pago mediante la integración con Wompi.

#### 1.4 Notificaciones y Calificación

- **Notificaciones**  
  - Envío de notificaciones por correo electrónico.  
  - **Notificaciones Push:** se enviarán directamente a la app para confirmar creación de órdenes, actualizaciones, recordatorios de mantenimiento y ofertas.
- **Calificación del Servicio**  
  - *Nueva funcionalidad:* al finalizar la orden de trabajo, la app ofrecerá al cliente la opción de calificar el servicio (1 – 5 estrellas) y escribir un comentario.

#### 1.5 Gestión de Mantenimientos y Créditos

- **Mantenimientos**  
  - *Nueva funcionalidad – Configuración de Mantenimientos:*  
    - El cliente podrá configurar la periodicidad de los mantenimientos o deshabilitar los recordatorios desde la app.  
    - Un mes antes del próximo mantenimiento, el sistema notificará al cliente (push y correo).
- **Integración con Sistema de Créditos**  
  - *Nueva funcionalidad:* la app se conectará (vía API) con el sistema que maneja los créditos para mostrar el estado de cuenta a los clientes con créditos abiertos.
- **Otras Funcionalidades**  
  - Recuperación de cuenta mediante envío de un correo con contraseña temporal.  
  - Despliegue de la aplicación en Google Play y App Store.  
  - Proceso para vincular cuentas de clientes existentes.

---

### 2. Aplicación Web Administrativa

#### 2.1 Gestión y Seguimiento de Órdenes

- **Gestión de Órdenes**  
  - Visualización de órdenes creadas desde la app móvil.  
  - Asignación de técnico responsable a cada orden.  
  - Modificación de fecha y hora de visita.  
  - Finalización de órdenes con ingreso del número de factura y periodicidad del mantenimiento.  
  - Cambio o adición de direcciones.
- **Seguimiento y Actualización de Órdenes**  
  - Agregar notas a las órdenes.  
  - Confirmación de la visita al cliente, incluyendo datos del técnico asignado.

#### 2.2 Gestión de Usuarios y Notificaciones

- **Gestión de Usuarios**  
  - Login para empleados administrativos.  
  - Visualización de menús y herramientas administrativas.
- **Notificaciones y Comunicaciones**  
  - Envío de correos electrónicos y notificaciones push al cliente con detalles del técnico asignado, fecha y hora de visita.  
  - *Nueva funcionalidad – Notificaciones de Ofertas:*  
    - Los administradores podrán enviar notificaciones de ofertas a la app móvil.  
    - El cliente podrá activar o desactivar estas notificaciones en **Configuraciones**.

#### 2.3 Gestión de Garantías y Mantenimientos

- **Gestión de Garantías**  
  - *Nueva funcionalidad:* visualización y gestión de solicitudes de garantía vinculadas a órdenes finalizadas (-1 año).  
  - Permite asignar el mismo técnico u otro disponible.
- **Gestión de Mantenimientos**  
  - *Nueva funcionalidad:* registro obligatorio de la periodicidad de los mantenimientos.  
  - No se podrá finalizar una orden sin definir la periodicidad.  
  - Notificación por correo al personal administrativo un mes antes del próximo mantenimiento.

#### 2.4 Dashboard Administrativo

- *Nueva funcionalidad – Dashboard:* visualización de:  
  - Número de órdenes sin asignar.  
  - Número de órdenes en ejecución.  
  - Número de órdenes sin movimiento en los últimos 5 días.

#### 2.5 Implementación y Mantenimiento

- Revisión y corrección de posibles errores conforme a la garantía.  
- Despliegue final en App Store, Play Store, aplicación web administrativa y API.

---

### 3. Control de Calidad (QA)

- Unit Testing (desarrollo)  
- Functional Test (testing)  
- Regression Tests (testing)  
- End-to-End Testing (testing)  
- Security Test (testing)

