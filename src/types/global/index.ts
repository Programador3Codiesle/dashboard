export interface IUser {
  id: string;
  name?: string;
  user: string;
  email?: string;
  role?: 'admin' | 'employee';
  nit_usuario?: number;
  perfil_postventa?: string; // Perfil del usuario (1, 20, etc.)
  /** Nombre legible del perfil (postv_perfiles.nom_perfil) */
  nom_perfil?: string;
  nombre_usuario?: string; // Nombre completo del usuario
  empresa?: number; // Codiesel=1, Dieselco=2, Mitsubishi=3, BYD=4
  empresas_asignadas?: number[]; // IDs de empresas habilitadas para el usuario
  menus_permitidos?: number[]; // IDs de módulos permitidos según perfil
  submenus_permitidos?: number[]; // IDs de submódulos permitidos según perfil
  /** IDs de postv_trimenu permitidos (postv_trimenu_perfil) — tercer nivel bajo submenú */
  trimenus_permitidos?: number[];
}




export interface IErrorResponse {
  message: string;
  code: number;
}
