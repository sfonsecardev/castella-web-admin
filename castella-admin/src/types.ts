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