export interface Rol {
  _id: string;
  nombre: string;
}

export interface Usuario {
  _id: string;
  nombre: string;
  correoPrincipal: string;
  rol: Rol;
  // Include any other fields returned by the backend that you might need
  [key: string]: unknown;
}

export interface MenuItem {
  title: string;
  path: string;
  roles: string[]; // array of role names allowed to see the item
}

export interface ClienteRef {
  _id: string
  nombre: string
  // add more fields if necessary
}

export interface OrdenDeTrabajo {
  _id: string
  numero: number
  estado: string
  cliente: ClienteRef
  tecnico?: Usuario
  fechaDigitacion?: string
  fechaProgramada?: string
  fechaEjecucion?: string
  factura?: string
  periodicidadMeses?: number
  tipo?: string // Added to identify mobile app orders vs normal orders
  // other fields omitted
  [key: string]: unknown
}

export interface Nota {
  _id: string
  ordenDeTrabajo: string
  usuario: Usuario
  nota: string
  fecha: string
} 

export interface Cliente {
  _id: string
  nombre: string
  celular?: string
  telefono?: string
  correo?: string
  direccion?: string
  [key: string]: unknown
}

export interface Servicio {
  _id: string
  nombre: string
}

export interface Tarea {
  _id: string
  nombre: string
}

export interface MantenimientoPendiente {
  _id: string
  numero: number
  estado: string
  cliente: {
    _id: string
    nombre: string
    telefono?: string
    correo?: string
  }
  tecnico?: {
    _id: string
    nombre: string
    correoPrincipal?: string
  }
  digitador?: {
    _id: string
    nombre: string
  }
  servicio?: Servicio
  tarea?: Tarea
  cerroOrden?: {
    _id: string
    nombre: string
  }
  fechaEjecucion: string
  periodicidadMeses: number
  aniomesprogramacion?: string
  factura?: string
  proximoMantenimiento: string
  diasHastaMantenimiento: number
} 