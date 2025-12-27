export interface IUser {
  id: string;
  name?: string;
  user: string;
  email?: string;
  role?: 'admin' | 'employee';
  nit_usuario?: number;
  perfil_postventa?: string; // Perfil del usuario (1, 20, etc.)
  nombre_usuario?: string; // Nombre completo del usuario
}




export interface IErrorResponse {
  message: string;
  code: number;
}
