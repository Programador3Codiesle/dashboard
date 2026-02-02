// Tipo para la respuesta de la API
export interface IUsuarioAPI {
    id: string;
    id_empleado: string;
    nombresCompletos: string;
    nit: string;
    perfil: string;
    estado: string;
    sede: string;
    empresa: string;
    empresaFormateada: string;
    empresasArray: string[];
    empresasNombresArray: string[];
    estadoDisplay: string;
    fechaCreacionFormateada: string;
    tieneSede: boolean;
    tieneEmpresa: boolean;
}

export interface IJefe {
    id: number;
    nombre: string;
    nit?: string;
}

// Jefes generales (tienen información adicional)
export interface IJefeGeneral extends IJefe {
    nit: string;
    email: string;
}

export interface ISede {
    id: number | string;
    nombre: string;
}

export interface IPerfil {
    id: string;
    nombre: string;
}

// Usuarios que pueden ser jefes (candidatos)
export interface IUsuarioJefeCandidato {
    id: number;
    nombre: string;
}

export interface IHorarioApi {
    nit_empleado: number;
    sede: string;
    hora_ent_sem_am: string;
    hora_sal_sem_am: string;
    hora_ent_sem_pm: string;
    hora_sal_sem_pm: string;
    hora_ent_am_viernes: string;
    hora_sal_am_viernes: string;
    hora_ent_pm_viernes?: string;
    hora_sal_pm_viernes?: string;
    hora_ent_viernes_pm?: string;
    hora_sal_viernes?: string;
    hora_ent_fds: string;
    hora_sal_fds: string;
}

// Respuesta genérica de acciones (crear, actualizar, eliminar, etc.)
export interface IApiMessageResponse {
    success?: boolean;
    message: string;
}

// Tipo para el componente (mapeado desde la API)
export interface IUsuario {
    id: number;
    idEmpleado?: string;
    nombre: string;
    usuario: number;
    totalMarca: number;
    marcas: string[];
    sede: number | string;
    estado: 'Activo' | 'Inactivo';
    empresas?: string[];
    email?: string;
    perfil?: string;
    nit?: string;
}

export interface AgregarEmpresaModalProps {
    open: boolean;
    usuario: IUsuario | null;
    onClose: () => void;
    onSave: (empresas: string[]) => void;
    empresasDisponibles: { id: string; nombre: string; logo: string }[];
}

export interface AgregarSedesModalProps {
    open: boolean;
    usuario: IUsuario | null;
    onClose: () => void;
    onAsignar: (idSede: string) => void;
    onEliminar: (idSede: string) => void;
    sedesDisponibles: ISede[];
    sedesUsuario: { id: string }[];
}

export interface AsignarJefeModalProps {
    open: boolean;
    usuario: IUsuario | null;
    onClose: () => void;
    onAsignar: (jefeId: string) => void;
    onEliminar: (jefeId: string) => void;
    jefesDisponibles: IJefe[];
    jefesUsuario: IJefe[];
}

export interface EditUsuarioModalProps {
    open: boolean;
    usuario: IUsuario | null;
    onClose: () => void;
    onSave: (perfilId: string) => void;
    perfilesDisponibles: IPerfil[];
    perfilActual: IPerfil | null;
}

export interface HorarioModalProps {
    open: boolean;
    usuario: IUsuario | null;
    onClose: () => void;
    onSave: (horario: HorarioData) => void;
    horarioActual: IHorarioApi | null;
}

export interface HorarioData {
    sede: string;
    hora_ent_sem_am: string;
    hora_sal_sem_am: string;
    hora_ent_sem_pm: string;
    hora_sal_sem_pm: string;
    hora_ent_am_viernes: string;
    hora_sal_am_viernes: string;
    hora_ent_pm_viernes?: string;
    hora_sal_pm_viernes?: string;
    hora_ent_viernes_pm?: string;
    hora_sal_viernes?: string;
    hora_ent_fds: string;
    hora_sal_fds: string;
}

export interface AgregarUsuarioModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (nit: string, perfilId: string) => Promise<void> | void;
    perfilesDisponibles: IPerfil[];
}

export interface AgregarJefeModalProps {
    open: boolean;
    onClose: () => void;
}
