export interface IUsuario {
    id: number;
    nombre: string;
    usuario: number;
    totalMarca: number;
    marcas: string[];
    sede: number;
    estado: 'Activo' | 'Inactivo';
    empresas?: string[];
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
    onSave: (sedes: string[]) => void;
    sedesDisponibles: string[];
}

export interface AsignarJefeModalProps {
    open: boolean;
    usuario: IUsuario | null;
    onClose: () => void;
    onSave: (jefeId: number) => void;
    jefesDisponibles: { id: number; nombre: string; cargo: string }[];
}

export interface EditUsuarioModalProps {
    open: boolean;
    usuario: IUsuario | null;
    onClose: () => void;
    onSave: (usuario: IUsuario) => void;
}

export interface HorarioModalProps {
    open: boolean;
    usuario: IUsuario | null;
    onClose: () => void;
    onSave: (horario: HorarioData) => void;
    diasSemana: string[];
}

export interface HorarioData {
    dias: string[];
    horaInicio: string;
    horaFin: string;
}