export const CHECKLIST_COPY = {
  hub: {
    title: 'Checklist',
    description: 'Formatos de inspección preoperacional y permisos de trabajo',
  },
  breadcrumbHome: 'Checklist',
  saveSuccess: 'Los datos se guardaron correctamente',
  saveValidation: 'Por favor verifique que haya diligenciado todos los campos',
  saveError: 'Error al guardar el checklist',
  saving: 'Guardando...',
  save: 'Guardar',
  criteriosTitulo: 'CRITERIOS DE INSPECCIÓN',
  redirectVentas: 'Abriendo el sistema de ventas en una nueva pestaña...',
  trabajoCalienteTitulo: 'Permiso de trabajo en caliente',
  trabajoCalienteBreadcrumb: 'Trabajo en Caliente',
} as const;

export const CHECKLIST_EXTERNAL_URLS = {
  motocicletas: 'https://intranet.codiesel.co/ventas/CheckMoto',
  vehiculo: 'https://intranet.codiesel.co/ventas/CheckCarro',
} as const;

export type ChecklistExternalTipo = keyof typeof CHECKLIST_EXTERNAL_URLS;
