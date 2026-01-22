export interface IUser {
  id: string;
  name?: string;
  user: string;
  email?: string;
  role?: 'admin' | 'employee';
  nit_usuario?: number;
  perfil_postventa?: string; // Perfil del usuario (1, 20, etc.)
  nombre_usuario?: string; // Nombre completo del usuario
  empresa?: number; // Codiesel=1, Dieselco=2, Mitsubishi=3, BYD=4
}




export interface IErrorResponse {
  message: string;
  code: number;
}
